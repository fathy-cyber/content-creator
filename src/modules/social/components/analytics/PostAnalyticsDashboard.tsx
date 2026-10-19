import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, BarChart3, Users, MousePointer2, 
  Calendar, RefreshCcw, Filter, ArrowUpRightIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getSummaryByPlatform, getCampaignPostAnalytics, triggerAnalyticsFetch } from '../../index';

export default function PostAnalyticsDashboard() {
  const [summary, setSummary] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    setIsLoading(true);
    try {
      const { data, error } = await getSummaryByPlatform();
      if (error) throw error;
      setSummary(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      // In a real app, we'd trigger fetch for all active jobs
      toast.info("Refreshing analytics from platforms...");
      await new Promise(r => setTimeout(r, 2000)); // simulate
      await loadSummary();
      toast.success("Analytics updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-xl h-24 animate-pulse" />)}
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Content Analytics</h2>
          <p className="text-zinc-500 text-sm">Track the reach and engagement of your social publishing.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isRefreshing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reach', value: '1.2M', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Engagement', value: '4.2%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Clicks', value: '45.2K', icon: MousePointer2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Posts', value: '128', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", kpi.bg)}>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
              <ArrowUpRightIcon className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase">{kpi.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Performance by Platform
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-400 text-[10px] uppercase font-bold border-b border-zinc-100">
                <th className="px-6 py-3">Platform</th>
                <th className="px-6 py-3">Posts</th>
                <th className="px-6 py-3">Avg Engagement</th>
                <th className="px-6 py-3">Total Reach</th>
                <th className="px-6 py-3">Total Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm">
                    No analytics data available yet.
                  </td>
                </tr>
              ) : (
                summary.map((row: any, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900 capitalize">{row.platform}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.totalPosts}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                        {row.avgEngagementRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{row.totalReach.toLocaleString()}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.totalClicks.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

