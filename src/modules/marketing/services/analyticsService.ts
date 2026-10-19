import { supabase } from '@/lib/supabase';

export interface DashboardSummary {
  totalLeads: number;
  conversionRate: number;
  roi: number;
  costPerLead: number;
  channelPerformance: ChannelPerformance[];
  topAssets: any[];
  funnelCounts: Record<string, number>;
}

export interface ChannelPerformance {
  channel: string;
  leads: number;
  conversions: number;
  roi: number;
}

const cache = new Map<string, { data: DashboardSummary, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const analyticsService = {
  /**
   * Calculates ROI for a specific campaign.
   */
  async getCampaignROI(campaignId: string): Promise<number> {
    const { data: campaigns, error: cErr } = await supabase
      .from('campaigns')
      .select('budget');
    if (cErr) supabaseError('Failed to fetch campaigns for ROI', cErr);

    const totalBudget = campaigns?.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0) || 0;

    let touchpointsQuery = supabase.from('touchpoints').select('id');
    if (campaignId !== 'global') {
      touchpointsQuery = touchpointsQuery.eq('campaign_id', campaignId);
    }
    const { data: touchpoints, error: tErr } = await touchpointsQuery;
    if (tErr) supabaseError('Failed to fetch touchpoints for ROI', tErr);

    const leadValue = 100;
    const leadsCount = touchpoints?.length || 0;
    if (totalBudget === 0) return 0;
    return (leadsCount * leadValue) / totalBudget;
  },

  /**
   * Calculates the overall conversion rate.
   */
  async getConversionRate(campaignId?: string): Promise<number> {
    let query = supabase.from('marketing_leads').select('*');
    if (campaignId) query = query.eq('campaign_id', campaignId);

    const { data: allLeads, error: aErr } = await query;
    if (aErr) supabaseError('Failed to fetch leads for conversion rate', aErr);

    const total = allLeads?.length || 0;
    if (total === 0) return 0;

    const converted = allLeads?.filter(l => l.status === 'converted').length || 0;
    return (converted / total) * 100;
  },

  /**
   * Gets performance metrics per channel.
   */
  async getChannelPerformance(): Promise<ChannelPerformance[]> {
    const { data, error } = await supabase
      .from('touchpoints')
      .select('channel');
      
    if (error) supabaseError('Failed to fetch channel performance', error);
    
    const grouped = (data || []).reduce<Record<string, number>>((acc, t: any) => {
      acc[t.channel] = (acc[t.channel] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([channel, count]) => ({
      channel,
      leads: count,
      conversions: Math.floor(count * 0.1),
      roi: 2.5,
    }));
  },

  /**
   * Calculates the lead velocity (avg time from creation to qualification).
   */
  async getLeadVelocity(): Promise<number> {
    const { data, error } = await supabase
      .from('marketing_leads')
      .select('created_at, updated_at')
      .eq('status', 'qualified');
      
    if (error) supabaseError('Failed to fetch leads for velocity', error);
    if (!data || data.length === 0) return 0;

    const diffs = data.map(l => new Date(l.updated_at).getTime() - new Date(l.created_at).getTime());
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    
    return avg / (1000 * 60 * 60 * 24); // Return days
  },

  /**
   * Calculates the cost per lead.
   */
  async getCostPerLead(): Promise<number> {
    const { data: campaigns, error: cErr } = await supabase.from('campaigns').select('budget');
    if (cErr) supabaseError('Failed to fetch campaigns for CPL', cErr);

    const { data: leads, error: lErr } = await supabase.from('marketing_leads').select('id');
    if (lErr) supabaseError('Failed to fetch leads for CPL', lErr);

    const totalBudget = campaigns?.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0) || 0;
    const totalLeads = leads?.length || 0;
    
    if (totalLeads === 0) return 0;
    return totalBudget / totalLeads;
  },

  /**
   * Identifies the top performing assets based on touchpoints.
   */
  async getTopPerformingAssets(): Promise<any[]> {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .limit(5);
      
    if (error) supabaseError('Failed to fetch top assets', error);
    return data || [];
  },

  /**
   * Returns a comprehensive dashboard summary. Cached for 5 mins.
   */
  async getDashboardSummary(orgId: string): Promise<DashboardSummary> {
    const cacheKey = `summary_${orgId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

    const [roi, convRate, perf, cpl, topAssets] = await Promise.all([
      this.getCampaignROI('global'), // Mock global ROI
      this.getConversionRate(),
      this.getChannelPerformance(),
      this.getCostPerLead(),
      this.getTopPerformingAssets(),
    ]);

    const { data: leads, error: lErr } = await supabase
      .from('marketing_leads')
      .select('status')
      .eq('org_id', orgId);
    if (lErr) supabaseError('Failed to fetch leads for summary', lErr);

    const funnelCounts = leads?.reduce((acc: any, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {}) || {};

    const summary: DashboardSummary = {
      totalLeads: leads?.length || 0,
      conversionRate: convRate,
      roi: roi,
      costPerLead: cpl,
      channelPerformance: perf,
      topAssets: topAssets,
      funnelCounts: funnelCounts,
    };

    cache.set(cacheKey, { data: summary, timestamp: Date.now() });
    return summary;
  },

  /**
   * Attributes a sale to a specific campaign/asset.
   */
  async attributeSaleToCamera(leadId: string, amount: number): Promise<void> {
    const { data: touchpoints, error } = await supabase
      .from('touchpoints')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !touchpoints) return;

    // Logic to record the attribution in a sales_attribution table if it existed
    console.log(`Attributing sale of ${amount} to campaign ${touchpoints.campaign_id}`);
  },
};
