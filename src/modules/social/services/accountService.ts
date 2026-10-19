import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { PLATFORMS } from '../constants/platforms';

/**
 * Types for Account Management
 */
export interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  token_expires_at: string | null;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked' | 'error';
  connected_by: string;
  last_used_at: string | null;
  created_at: string;
}

export interface ConnectAccountInput {
  platform: string;
}

export interface ConnectWithTokenInput {
  platform: string;
  token: string;
  accountName: string;
  accountId: string; // For WP, this might be the site URL
}

export interface OAuthCallbackInput {
  code: string;
  state: string;
}

export interface AccountStatusReport {
  status: string;
  tokenExpiresAt: string | null;
  lastUsedAt: string | null;
  rateLimitStatus: any;
}

const ConnectAccountSchema = z.object({
  platform: z.string(),
});

const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
});

/**
 * AccountService handles OAuth connections and account lifecycle via Supabase Vault.
 */
export const accountService = {
  /**
   * Lists all connected social accounts.
   * Sanitizes output to remove Vault references.
   */
  async listAccounts(): Promise<{ data: SocialAccount[] | null, error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('id, platform, account_name, account_id, token_expires_at, scopes, status, connected_by, last_used_at, created_at')
        .neq('status', 'revoked');
      
      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Generates an OAuth authorization URL for a given platform.
   */
  async connectAccount(input: ConnectAccountInput): Promise<{ data: { authUrl: string } | null, error: Error | null }> {
    try {
      const validated = ConnectAccountSchema.parse(input);
      const config = PLATFORMS[validated.platform];
      if (!config) throw new Error(`Unsupported platform: ${validated.platform}`);
      
      // If the platform doesn't have an authUrl, it's likely token-based
      if (!config.authUrl) {
        throw new Error(`Platform ${validated.platform} requires a token for connection. Use connectWithToken instead.`);
      }

      const state = crypto.randomUUID();
      const redirectUri = `${window.location.origin}/social/callback`;
      
      // Store state for CSRF check
      await supabase.from('oauth_states').upsert({ 
        state, 
        created_at: new Date().toISOString() 
      });

      // Get platform-specific client ID from environment variables
      const envVarName = `NEXT_PUBLIC_${validated.platform.toUpperCase()}_CLIENT_ID`;
      const clientId = process.env[envVarName] || process.env.NEXT_PUBLIC_SOCIAL_CLIENT_ID;

      if (!clientId) {
        throw new Error(`Client ID for ${validated.platform} is not configured in environment variables (${envVarName})`);
      }

      const authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${config.scopes.join(' ')}&state=${state}`;

      return { data: { authUrl }, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Connects a platform using a direct API token/key (e.g. Telegram Bot Token, WP App Password).
   */
  async connectWithToken(input: ConnectWithTokenInput): Promise<{ data: SocialAccount | null, error: Error | null }> {
    try {
      const { platform, token, accountName, accountId } = input;
      const config = PLATFORMS[platform];
      if (!config) throw new Error(`Unsupported platform: ${platform}`);
      if (!token) throw new Error("Token is required");

      // 1. Store token in Vault
      const { data: vaultAccess, error: vAccErr } = await supabase.rpc('create_vault_secret', { secret: token });
      if (vAccErr) throw vAccErr;

      // 2. Store Account record
      const { data: account, error: accErr } = await supabase
        .from('social_accounts')
        .upsert({
          platform,
          account_id: accountId,
          account_name: accountName,
          vault_access_id: vaultAccess,
          status: 'active',
          connected_by: (await supabase.auth.getUser()).data.user?.id,
        }, { onConflict: 'platform,account_id' })
        .select()
        .single();

      if (accErr) throw accErr;

      return { 
        data: { 
          id: account.id, platform: account.platform, account_name: account.account_name, 
          account_id: account.account_id, token_expires_at: account.token_expires_at, 
          scopes: account.scopes, status: account.status, connected_by: account.connected_by, 
          last_used_at: account.last_used_at, created_at: account.created_at 
        }, 
        error: null 
      };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },


  /**
   * Handles the OAuth redirect callback and stores tokens in Supabase Vault.
   */
  async handleOAuthCallback(input: OAuthCallbackInput): Promise<{ data: SocialAccount | null, error: Error | null }> {
    try {
      const validated = OAuthCallbackSchema.parse(input);
      
      // CSRF Check
      const { data: stateData, error: stateErr } = await supabase
        .from('oauth_states')
        .select('id')
        .eq('state', validated.state)
        .single();

      if (stateErr || !stateData) throw new Error("Invalid or expired state token");
      await supabase.from('oauth_states').delete().eq('state', validated.state);

      // Token exchange happens via server-side Edge Function to hide secrets
      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke('social/oauth-exchange', {
        body: { code: validated.code, state: validated.state },
      });

      if (tokenErr || !tokenData) throw new Error(tokenErr?.message || "Token exchange failed");

      const { platform, account_id, account_name, access_token, refresh_token, expires_in, scopes } = tokenData;

      // 1. Store in Vault
      const { data: vaultAccess, error: vAccErr } = await supabase.rpc('create_vault_secret', { secret: access_token });
      if (vAccErr) throw vAccErr;

      let vaultRefreshId = null;
      if (refresh_token) {
        const { data: vRef, error: vRefErr } = await supabase.rpc('create_vault_secret', { secret: refresh_token });
        if (vRefErr) throw vRefErr;
        vaultRefreshId = vRef;
      }

      // 2. Store Account record
      const { data: account, error: accErr } = await supabase
        .from('social_accounts')
        .upsert({
          platform,
          account_id: account_id,
          account_name: account_name,
          vault_access_id: vaultAccess,
          vault_refresh_id: vaultRefreshId,
          token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          scopes,
          status: 'active',
          connected_by: (await supabase.auth.getUser()).data.user?.id,
        }, { onConflict: 'platform,account_id' })
        .select()
        .single();


      if (accErr) throw accErr;

      return { 
        data: { 
          id: account.id, platform: account.platform, account_name: account.account_name, 
          account_id: account.account_id, token_expires_at: account.token_expires_at, 
          scopes: account.scopes, status: account.status, connected_by: account.connected_by, 
          last_used_at: account.last_used_at, created_at: account.created_at 
        }, 
        error: null 
      };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Disconnects an account and wipes tokens from Vault.
   */
  async disconnectAccount(id: string): Promise<{ data: void | null, error: Error | null }> {
    try {
      const { data: account, error: accErr } = await supabase
        .from('social_accounts')
        .select('vault_access_id, vault_refresh_id')
        .eq('id', id)
        .single();

      if (accErr || !account) throw new Error("Account not found");

      // Remove from Vault
      await supabase.rpc('delete_vault_secret', { secret_id: account.vault_access_id });
      if (account.vault_refresh_id) {
        await supabase.rpc('delete_vault_secret', { secret_id: account.vault_refresh_id });
      }


      // Mark as revoked
      const { error: updateErr } = await supabase
        .from('social_accounts')
        .update({ status: 'revoked' })
        .eq('id', id);

      if (updateErr) throw updateErr;

      return { data: undefined, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Triggers the token-refresh Edge Function.
   */
  async refreshToken(id: string): Promise<{ data: void | null, error: Error | null }> {
    try {
      const { data, error } = await supabase.functions.invoke('token-refresh', {
        body: { social_account_id: id },
      });
      if (error) throw error;
      return { data: undefined, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Gets a full health and status report for an account.
   */
  async getAccountStatus(id: string): Promise<{ data: AccountStatusReport | null, error: Error | null }> {
    try {
      const { data: account, error: accErr } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (accErr || !account) throw new Error("Account not found");

      // We'd ideally call rateLimitService here
      return {
        data: {
          status: account.status,
          tokenExpiresAt: account.token_expires_at,
          lastUsedAt: account.last_used_at,
          rateLimitStatus: { /* call rateLimitService.getRateLimitStatus */ },
        },
        error: null,
      };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },
};
