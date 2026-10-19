import { supabase } from '@/lib/supabase';
import { z } from 'zod';

/**
 * Types for Post Analytics
 */
export interface PostAnalytics {
  id: string;
  publish_job_id: string;
  fetched_at: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
  raw_data: any;
}

export interface AnalyticsSummary {
  totalReach: number;
  totalEngagement: number;
  avgEngagementRate: number;
  totalPosts: number;
}

export interface ChannelBreakdown {
  platform: string;
  totalPosts: number;
  avgEngagementRate: number;
  totalReach: number;
  totalClicks: number;
}

/**
 * AnalyticsService handles retrieval and aggregation of social performance metrics.
 */
export const analyticsService = {
  /**
   * Fetches the full history of analytics for a specific publish job.
   */
  async getPostAnalytics(publishJobId: string): Promise<{ data: PostAnalytics[] | null, error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('post_analytics')
        .select('*')
        .eq('publish_job_id', publishJobId)
        .order('fetched_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Gets the most recent analytics snapshot for a publish job.
   */
  async getLatestAnalytics(publishJobId: string): Promise<{ data: PostAnalytics | null, error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('post_analytics')
        .select('*')
        .eq('publish_job_id', publishJobId)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Aggregates performance metrics grouped by platform.
   */
  async getSummaryByPlatform(): Promise<{ data: ChannelBreakdown[] | null, error: Error | null }> {
    try {
      // Join post_analytics -> publish_jobs
      const { data, error } = await supabase
        .from('post_analytics')
        .select(`
          engagement_rate,
          reach,
          clicks,
          publish_jobs ( platform )
        `);

      if (error) throw error;

      const breakdown: Record<string, any> = {};

      data.forEach((row: any) => {
        const platform = row.publish_jobs?.platform || 'unknown';
        if (!breakdown[platform]) {
          breakdown[platform] = { platform, totalPosts: 0, avgEngagementRate: 0, totalReach: 0, totalClicks: 0, _sumER: 0 };
        }
        breakdown[platform].totalPosts++;
        breakdown[platform].totalReach += row.reach;
        breakdown[platform].totalClicks += row.clicks;
        breakdown[platform]._sumER += row.engagement_rate;
      });

      const result = Object.values(breakdown).map((b: any) => ({
        ...b,
        avgEngagementRate: b._sumER / b.totalPosts,
      }));

      // Remove helper field
      result.forEach((r: any) => delete r._sumER);

      return { data: result as ChannelBreakdown[], error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Aggregates analytics for all posts linked to a specific campaign.
   */
  async getCampaignPostAnalytics(campaignId: string): Promise<{ data: AnalyticsSummary | null, error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('post_analytics')
        .select(`
          reach,
          likes,
          comments,
          shares,
          clicks,
          engagement_rate,
          publish_jobs!inner ( ai_post_id )
        `)
        .eq('publish_jobs.ai_posts.campaign_id', campaignId); // Note: requires proper join logic in Supabase

      if (error) throw error;

      const summary: AnalyticsSummary = {
        totalReach: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
        totalPosts: data?.length || 0,
      };

      data?.forEach((row: any) => {
        summary.totalReach += row.reach;
        summary.totalEngagement += (row.likes + row.comments + row.shares + row.clicks);
        summary.avgEngagementRate += row.engagement_rate;
      });

      if (summary.totalPosts > 0) {
        summary.avgEngagementRate /= summary.totalPosts;
      }

      return { data: summary, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Manually triggers the analytics-fetch Edge Function.
   */
  async triggerAnalyticsFetch(publishJobId: string): Promise<{ data: void | null, error: Error | null }> {
    try {
      const { data, error } = await supabase.functions.invoke('analytics-fetch', {
        body: { publish_job_id: publishJobId },
      });

      if (error) throw error;
      return { data: undefined, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },
};
