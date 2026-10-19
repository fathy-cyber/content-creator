import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Activity, PieChart, Target, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getDashboardSummary } from '../../index';
import type { DashboardSummary } from '../../index';

import ToolPageLayout from '../shared/ToolPageLayout';

export default function MarketingAnalytics() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orgId, setOrgId] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      resolveOrgId(user.id).then(setOrgId);
    });
  }, []);

  async function resolveOrgId(userId: string): Promise<string> {
    const { data: u } = await supabase.from('users').select('org_id').eq('id', userId).maybeSingle();
    if (u?.org_id) return u.org_id;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('owner_id', userId).maybeSingle();
    return ws?.id || '';
  }

  const fetchAnalytics = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const data = await getDashboardSummary(orgId);
      setSummary(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchAnalytics();
  }, [orgId]);

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-rose-600" />
          Marketing Analytics
        </h1>
        <p className="text-zinc-500 text-lg">
          Track your key performance indicators and ROI.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Cost Per Lead (CPL)', value: `$${summary?.costPerLead?.toFixed(2) || '0.00'}`, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Conversion Rate', value: `${summary?.conversionRate?.toFixed(1) || '0'}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'ROI', value: `${summary?.roi?.toFixed(1) || '0'}x`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Leads', value: summary?.totalLeads || 0, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((stat) => (
              <div key={stat.label} className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm min-h-[300px] flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-zinc-900">Channel Performance</h3>
              </div>
              <div className="space-y-4 flex-1">
                {summary?.channelPerformance.map((cp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                    <span className="text-sm font-medium text-zinc-700 capitalize">{cp.channel}</span>
                    <div className="flex gap-4 text-xs font-bold">
                      <span className="text-zinc-500">Leads: {cp.leads}</span>
                      <span className="text-emerald-600">ROI: {cp.roi}x</span>
                    </div>
                  </div>
                ))}
                {(!summary?.channelPerformance || summary.channelPerformance.length === 0) && (
                  <div className="h-32 flex items-center justify-center text-zinc-400 italic text-sm">
                    No channel data available.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm min-h-[300px] flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-zinc-900">Funnel Conversion</h3>
              </div>
              <div className="space-y-4 flex-1">
                {Object.entries(summary?.funnelCounts || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-4">
                    <span className="text-xs font-bold text-zinc-500 uppercase w-24">{status}</span>
                    <div className="flex-1 h-4 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 transition-all" 
                        style={{ width: `${Math.min(100, ((count as number) / (summary.totalLeads || 1)) * 100)}%` }} 
                      />
                    </div>
                    <span className="text-sm font-bold text-zinc-900 w-12 text-right">{count}</span>
                  </div>
                ))}
                {Object.keys(summary?.funnelCounts || {}).length === 0 && (
                  <div className="h-32 flex items-center justify-center text-zinc-400 italic text-sm">
                    No funnel data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ToolPageLayout>
  );
}
