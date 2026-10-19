import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { emitters } from '../events/emitters';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  start_date: string;
  end_date: string | null;
  channels: string[];
  created_by: string | null;
  org_id: string;
  created_at: string;
  updated_at: string;
}

const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
  budget: z.number().min(0).default(0),
  start_date: z.string().datetime().default(() => new Date().toISOString()),
  end_date: z.string().datetime().optional().nullable(),
  channels: z.array(z.string()).default([]),
  org_id: z.string().uuid(),
  created_by: z.string().uuid().optional().nullable(),
});

const UpdateCampaignSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  budget: z.number().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional().nullable(),
  channels: z.array(z.string()).optional(),
});

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const campaignService = {
  /**
   * Creates a new marketing campaign.
   */
  async createCampaign(data: z.infer<typeof CreateCampaignSchema>): Promise<Campaign> {
    const validated = CreateCampaignSchema.parse(data);
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert(validated)
      .select()
      .single();
      
    if (error) supabaseError('Failed to create campaign', error);
    return campaign as Campaign;
  },

  /**
   * Fetches a campaign by ID.
   */
  async getCampaign(id: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) supabaseError('Failed to fetch campaign', error);
    return data as Campaign;
  },

  /**
   * Lists campaigns with pagination.
   */
  async listCampaigns(params: { limit: number, offset: number, status?: string }): Promise<{ campaigns: Campaign[], total: number }> {
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' });

    if (params.status) query = query.eq('status', params.status);

    const { data, error, count } = await query
      .range(params.offset, params.offset + params.limit - 1)
      .order('created_at', { ascending: false });

    if (error) supabaseError('Failed to list campaigns', error);
    return { campaigns: (data || []) as Campaign[], total: count || 0 };
  },

  /**
   * Updates campaign details.
   */
  async updateCampaign(id: string, data: z.infer<typeof UpdateCampaignSchema>): Promise<Campaign> {
    const validated = UpdateCampaignSchema.parse(data);
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) supabaseError('Failed to update campaign', error);
    return campaign as Campaign;
  },

  /**
   * Deletes a campaign.
   */
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
      
    if (error) supabaseError('Failed to delete campaign', error);
  },

  /**
   * Launches a campaign and emits event.
   */
  async launchCampaign(id: string): Promise<Campaign> {
    const campaign = await this.updateCampaign(id, { status: 'active' });
    emitters.campaignLaunched(campaign);
    return campaign;
  },

  /**
   * Pauses a campaign.
   */
  async pauseCampaign(id: string): Promise<Campaign> {
    return this.updateCampaign(id, { status: 'paused' });
  },

  /**
   * Completes a campaign and emits event.
   */
  async completeCampaign(id: string, metrics: any): Promise<Campaign> {
    const campaign = await this.updateCampaign(id, { status: 'completed' });
    emitters.campaignEnded(campaign, metrics);
    return campaign;
  },

  /**
   * Saves a campaign plan.
   */
  async saveCampaignPlan(data: { campaign_id: string, timeline: any, budget_allocation: any, milestones: any, org_id: string }): Promise<void> {
    const { error } = await supabase
      .from('campaign_plans')
      .upsert(data);
      
    if (error) supabaseError('Failed to save campaign plan', error);
  },

  /**
   * Loads a campaign plan.
   */
  async loadCampaignPlan(campaignId: string): Promise<any> {
    const { data, error } = await supabase
      .from('campaign_plans')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();
      
    if (error) supabaseError('Failed to load campaign plan', error);
    return data;
  },

  /**
   * Saves a funnel configuration.
   */
  async saveFunnel(data: { name: string, campaign_id: string | null, stages: any, created_by: string, org_id: string }): Promise<void> {
    const { error } = await supabase
      .from('funnels')
      .upsert(data);
      
    if (error) supabaseError('Failed to save funnel', error);
  },

  /**
   * Loads a funnel.
   */
  async loadFunnel(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) supabaseError('Failed to load funnel', error);
    return data;
  },

  /**
   * Lists all funnels.
   */
  async listFunnels(orgId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('org_id', orgId);
      
    if (error) supabaseError('Failed to list funnels', error);
    return data || [];
  },

  /**
   * Saves an A/B test.
   */
  async saveAbTest(data: { campaign_id: string, name: string, variant_a: any, variant_b: any, metric: string, created_by: string, org_id: string }): Promise<void> {
    const { error } = await supabase
      .from('ab_tests')
      .upsert(data);
      
    if (error) supabaseError('Failed to save A/B test', error);
  },

  /**
   * Fetches an A/B test.
   */
  async getAbTest(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) supabaseError('Failed to fetch A/B test', error);
    return data;
  },

  /**
   * Lists all A/B tests for a campaign.
   */
  async listAbTests(campaignId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('campaign_id', campaignId);
      
    if (error) supabaseError('Failed to list A/B tests', error);
    return data || [];
  },
};
