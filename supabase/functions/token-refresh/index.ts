import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RequestSchema = z.object({
  social_account_id: z.string().uuid(),
});

async function getSecret(vaultId: string) {
  const { data, error } = await supabase.rpc('get_vault_secret', { secret_id: vaultId });
  if (error) throw new Error(`Vault retrieval failed: ${error.message}`);
  return data;
}

async function updateSecret(vaultId: string, newValue: string) {
  const { error } = await supabase.rpc('update_vault_secret', { secret_id: vaultId, new_value: newValue });
  if (error) throw new Error(`Vault update failed: ${error.message}`);
}

async function refreshLinkedInToken(account: any, refreshToken: string) {
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: Deno.env.get("LINKEDIN_CLIENT_ID")!,
      client_secret: Deno.env.get("LINKEDIN_CLIENT_SECRET")!,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) throw new Error(`LinkedIn refresh failed: ${await response.text()}`);
  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

async function refreshFacebookToken(account: any, refreshToken: string) {
  const response = await fetch(`https://graph.facebook.com/oauth/access_token`, {
    method: 'GET',
    params: {
      client_id: Deno.env.get("FACEBOOK_CLIENT_ID")!,
      client_secret: Deno.env.get("FACEBOOK_CLIENT_SECRET")!,
      grant_type: 'fb_exchange_token',
      fb_exchange_token: refreshToken,
    },
  });

  if (!response.ok) throw new Error(`Facebook refresh failed: ${await response.text()}`);
  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const { social_account_id } = RequestSchema.parse(body);

    const { data: account, error: accountErr } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', social_account_id)
      .single();

    if (accountErr || !account) throw new Error("Account not found");

    if (!account.vault_refresh_id) throw new Error("No refresh token configured for this account");

    const refreshToken = await getSecret(account.vault_refresh_id);
    let refreshResult;

    if (account.platform === 'linkedin') {
      refreshResult = await refreshLinkedInToken(account, refreshToken);
    } else if (account.platform === 'facebook' || account.platform === 'instagram') {
      refreshResult = await refreshFacebookToken(account, refreshToken);
    } else {
      throw new Error(`Platform ${account.platform} refresh not implemented`);
    }

    // Store new access token in Vault
    await updateSecret(account.vault_access_id, refreshResult.access_token);

    // Update expiry
    const expiresAt = new Date(Date.now() + refreshResult.expires_in * 1000).toISOString();
    await supabase
      .from('social_accounts')
      .update({ token_expires_at: expiresAt, status: 'active' })
      .eq('id', social_account_id);

    // Emit event
    await supabase.from('event_store').insert({
      event_name: 'social.token.refreshed',
      source_module: 'social',
      source_entity_id: social_account_id,
      payload: { account_id: social_account_id, platform: account.platform },
      status: 'pending',
      process_after: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, expires_at: expiresAt }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Update account status to error
    if (error.social_account_id) {
      await supabase.from('social_accounts').update({ status: 'error' }).eq('id', error.social_account_id);
    }

    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
