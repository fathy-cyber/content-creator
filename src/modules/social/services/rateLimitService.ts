import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { PLATFORMS } from '../constants/platforms';

/**
 * Types for Rate Limiting
 */
export interface RateLimitWindow {
  id: string;
  social_account_id: string;
  window_start: string;
  window_end: string;
  posts_sent: number;
  posts_limit: number;
  api_calls_made: number;
  api_calls_limit: number;
}

export interface RateLimitCheck {
  allowed: boolean;
  resetAt: Date | null;
  remaining: number;
}

export interface RateLimitStatus {
  platform: string;
  postsSent: number;
  postsLimit: number;
  apiCallsMade: number;
  apiCallsLimit: number;
  isLimited: boolean;
  resetAt: Date | null;
}

/**
 * RateLimitService handles tracking and enforcing social platform rate limits.
 */
export const rateLimitService = {
  /**
   * Checks if posting is currently allowed for a specific account on a platform.
   * @param socialAccountId The ID of the social account.
   * @param platform The platform identifier.
   * @returns A promise containing the allowed status and remaining quota.
   */
  async checkRateLimit(socialAccountId: string, platform: string): Promise<{ data: RateLimitCheck | null, error: Error | null }> {
    try {
      const config = PLATFORMS[platform];
      if (!config) throw new Error(`Unsupported platform: ${platform}`);

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('platform_rate_limits')
        .select('*')
        .eq('social_account_id', socialAccountId)
        .lte('window_start', now.toISOString())
        .gte('window_end', now.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const postsSent = data?.posts_sent ?? 0;
      const limit = config.rateLimits.postsPerDay;

      if (postsSent >= limit) {
        return {
          data: {
            allowed: false,
            resetAt: data ? new Date(data.window_end) : null,
            remaining: 0,
          },
          error: null,
        };
      }

      return {
        data: {
          allowed: true,
          resetAt: null,
          remaining: limit - postsSent,
        },
        error: null,
      };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Records a post sent by an account and updates the rate limit window.
   * @param socialAccountId The ID of the social account.
   * @param platform The platform identifier.
   */
  async recordPost(socialAccountId: string, platform: string): Promise<{ data: void | null, error: Error | null }> {
    try {
      const config = PLATFORMS[platform];
      if (!config) throw new Error(`Unsupported platform: ${platform}`);

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      // Upsert current window
      const { data, error } = await supabase
        .from('platform_rate_limits')
        .upsert({
          social_account_id: socialAccountId,
          window_start: startOfDay,
          window_end: endOfDay,
          posts_limit: config.rateLimits.postsPerDay,
          api_calls_limit: config.rateLimits.apiCallsPerDay,
          posts_sent: 0, // This will be handled by increment in a real scenario or raw SQL
        }, { onConflict: 'social_account_id, window_start' })
        .select()
        .single();

      if (error) throw error;

      // Increment post count
      const { error: incError } = await supabase
        .from('platform_rate_limits')
        .update({ posts_sent: (data.posts_sent || 0) + 1 })
        .eq('id', data.id);

      if (incError) throw incError;

      return { data: undefined, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Retrieves the current active rate limit window for an account.
   * @param socialAccountId The ID of the social account.
   */
  async getCurrentWindow(socialAccountId: string): Promise<{ data: RateLimitWindow | null, error: Error | null }> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('platform_rate_limits')
        .select('*')
        .eq('social_account_id', socialAccountId)
        .lte('window_start', now)
        .gte('window_end', now)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Gets a formatted rate limit status report for UI display.
   * @param socialAccountId The ID of the social account.
   */
  async getRateLimitStatus(socialAccountId: string): Promise<{ data: RateLimitStatus | null, error: Error | null }> {
    try {
      const { data: window, error: winErr } = await this.getCurrentWindow(socialAccountId);
      if (winErr) throw winErr;
      if (!window) return { data: null, error: null };

      const config = PLATFORMS[window.platform as any] || { rateLimits: { postsPerDay: 0, apiCallsPerDay: 0 } };

      return {
        data: {
          platform: window.platform, // Note: window table needs platform column or join
          postsSent: window.posts_sent,
          postsLimit: window.posts_limit,
          apiCallsMade: window.api_calls_made,
          apiCallsLimit: window.api_calls_limit,
          isLimited: window.posts_sent >= window.posts_limit,
          resetAt: new Date(window.window_end),
        },
        error: null,
      };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },
};
