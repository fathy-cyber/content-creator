import { getService } from '@/core';

export interface ROIConfig {
  campaignName: string;
  budget: number;
  currency: string;
  channels: {
    name: string;
    spend: number;
    expectedCpc: number;
    expectedCtr: number;
    expectedCvr: number;
    expectedAov: number;
  }[];
  fixedCosts: number;
  durationDays: number;
}

export interface ROIResult {
  totalBudget: number;
  totalFixedCosts: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  totalCustomers: number;
  totalRevenue: number;
  totalCost: number;
  roas: number;
  cpa: number;
  profit: number;
  profitMargin: number;
  breakEvenPoint: number;
  channelBreakdown: ChannelROI[];
  whatIfs: WhatIfScenario[];
}

export interface ChannelROI {
  name: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  customers: number;
  revenue: number;
  cpc: number;
  ctr: number;
  cvr: number;
  roas: number;
  cpa: number;
}

export interface WhatIfScenario {
  label: string;
  budgetChange: number;
  result: Pick<ROIResult, 'totalRevenue' | 'roas' | 'cpa' | 'profit'>;
}

function computeChannel(config: ROIConfig['channels'][0]): ChannelROI {
  const impressions = config.spend > 0 && config.expectedCpc > 0
    ? (config.spend / config.expectedCpc) / (config.expectedCtr / 100)
    : 0;
  const clicks = impressions * (config.expectedCtr / 100);
  const leads = clicks * (config.expectedCvr / 100);
  const customers = leads; // assume lead→customer at 100% for simplicity; refine later
  const revenue = customers * config.expectedAov;

  return {
    name: config.name,
    spend: config.spend,
    impressions: Math.round(impressions),
    clicks: Math.round(clicks),
    leads: Math.round(leads),
    customers: Math.round(customers),
    revenue,
    cpc: config.expectedCpc,
    ctr: config.expectedCtr,
    cvr: config.expectedCvr,
    roas: config.spend > 0 ? revenue / config.spend : 0,
    cpa: customers > 0 ? config.spend / customers : 0,
  };
}

function computeWhatIf(config: ROIConfig, budgetMultiplier: number = 1, cvrMultiplier: number = 1, cpcMultiplier: number = 1): Pick<ROIResult, 'totalRevenue' | 'roas' | 'cpa' | 'profit'> {
  const adjusted: ROIConfig = {
    ...config,
    channels: config.channels.map(ch => ({
      ...ch,
      spend: ch.spend * budgetMultiplier,
      expectedCpc: ch.expectedCpc * cpcMultiplier,
      expectedCvr: ch.expectedCvr * cvrMultiplier,
    })),
  };
  const m = computeMetrics(adjusted);
  return { totalRevenue: m.aggregated.revenue, roas: m.roas, cpa: m.cpa, profit: m.profit };
}

// Pure computation — no whatIfs to avoid recursion
function computeMetrics(config: ROIConfig) {
  const channelBreakdown = config.channels.map(computeChannel);
  const totalBudget = config.channels.reduce((s, c) => s + c.spend, 0);
  const totalFixedCosts = config.fixedCosts;

  const aggregated = channelBreakdown.reduce(
    (acc, ch) => {
      acc.impressions += ch.impressions;
      acc.clicks += ch.clicks;
      acc.leads += ch.leads;
      acc.customers += ch.customers;
      acc.revenue += ch.revenue;
      return acc;
    },
    { impressions: 0, clicks: 0, leads: 0, customers: 0, revenue: 0 }
  );

  const totalCost = totalBudget + totalFixedCosts;
  const profit = aggregated.revenue - totalCost;
  const roas = totalBudget > 0 ? aggregated.revenue / totalBudget : 0;
  const cpa = aggregated.customers > 0 ? totalBudget / aggregated.customers : 0;
  const profitMargin = aggregated.revenue > 0 ? (profit / aggregated.revenue) * 100 : 0;
  const breakEvenPoint = config.channels[0]?.expectedAov > 0
    ? Math.ceil(totalCost / config.channels[0].expectedAov)
    : 0;

  return { channelBreakdown, totalBudget, totalFixedCosts, aggregated, totalCost, profit, roas, cpa, profitMargin, breakEvenPoint };
}

export const roiService = {
  calculate(config: ROIConfig): ROIResult {
    const m = computeMetrics(config);

    const whatIfs: WhatIfScenario[] = [
      { label: '+25% Budget', budgetChange: 25, result: computeWhatIf(config, 1.25) },
      { label: '+50% Budget', budgetChange: 50, result: computeWhatIf(config, 1.5) },
      { label: '-25% Budget', budgetChange: -25, result: computeWhatIf(config, 0.75) },
      { label: 'Double CVR', budgetChange: 0, result: computeWhatIf(config, 1, 2) },
      { label: 'Half CPC', budgetChange: 0, result: computeWhatIf(config, 1, 1, 0.5) },
    ];

    return {
      totalBudget: m.totalBudget,
      totalFixedCosts: m.totalFixedCosts,
      totalImpressions: m.aggregated.impressions,
      totalClicks: m.aggregated.clicks,
      totalLeads: m.aggregated.leads,
      totalCustomers: m.aggregated.customers,
      totalRevenue: m.aggregated.revenue,
      totalCost: m.totalCost,
      roas: m.roas,
      cpa: m.cpa,
      profit: m.profit,
      profitMargin: m.profitMargin,
      breakEvenPoint: m.breakEvenPoint,
      channelBreakdown: m.channelBreakdown,
      whatIfs,
    };
  },

  whatIf(config: ROIConfig, budgetMultiplier: number = 1, cvrMultiplier: number = 1, cpcMultiplier: number = 1): Pick<ROIResult, 'totalRevenue' | 'roas' | 'cpa' | 'profit'> {
    return computeWhatIf(config, budgetMultiplier, cvrMultiplier, cpcMultiplier);
  },

  async saveAsAsset(config: ROIConfig, result: ROIResult) {
    const assets = getService<any>('assets');
    return assets.createAsset({
      title: `ROI Projection — ${config.campaignName || 'Untitled'}`,
      type: 'report',
      content: JSON.stringify({ config, result, generatedAt: new Date().toISOString() }),
      platform: 'INTERNAL',
      entity_type: 'roi_projection',
      entity_id: '00000000-0000-0000-0000-000000000000',
    });
  },
};
