import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Plus, Calendar, DollarSign, Users, 
  Target, MoreVertical, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { listCampaigns, launchCampaign, pauseCampaign, completeCampaign, deleteCampaign, getDashboardSummary } from '../../index';
import type { Campaign, DashboardSummary } from '../../index';
import ToolPageLayout from '../shared/ToolPageLayout';

export default function CampaignManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'templates'>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [orgId, setOrgId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      resolveOrgId(user.id).then((oid) => {
        setOrgId(oid || '');
      });
    });
  }, []);

  async function resolveOrgId(userId: string): Promise<string | null> {
    const { data: userData } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', userId)
      .maybeSingle();
    if (userData?.org_id) return userData.org_id;
    const { data: ws } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    return ws?.id || null;
  }

  const fetchCampaigns = async () => {
    try {
      const { campaigns: data } = await listCampaigns({ limit: 100, offset: 0 });
      setCampaigns(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load campaigns');
    }
  };

  const fetchSummary = async () => {
    if (!orgId) return;
    try {
      const data = await getDashboardSummary(orgId);
      setSummary(data);
    } catch (error: any) {
      console.error('Failed to fetch summary', error);
    }
  };

  useEffect(() => {
    async function init() {
      if (!orgId) return;
      setIsLoading(true);
      await Promise.all([fetchCampaigns(), fetchSummary()]);
      setIsLoading(false);
    }
    init();
  }, [orgId]);

  const handleCreateCampaign = () => {
    navigate('/marketing/campaign-planner');
  };

  const handleAction = async (id: string, action: 'launch' | 'pause' | 'complete' | 'delete') => {
    try {
      if (action === 'launch') await launchCampaign(id);
      if (action === 'pause') await pauseCampaign(id);
      if (action === 'complete') await completeCampaign(id, { totalLeads: 100 });
      if (action === 'delete') await deleteCampaign(id);
      
      toast.success(`Campaign ${action}ed successfully!`);
      await fetchCampaigns();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} campaign`);
    }
  };

  return (
    <ToolPageLayout>
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Campaign Manager</h2>
          <p className="text-zinc-500 mt-1">Monitor and manage your marketing campaigns.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreateCampaign}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Campaign
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl w-fit">
        {(['dashboard', 'campaigns', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize",
              activeTab === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Spend', value: `$${summary?.costPerLead || 0} /lead`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Leads Generated', value: summary?.totalLeads || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Avg. ROI', value: `${summary?.roi?.toFixed(1) || 0}x`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Conv. Rate', value: `${summary?.conversionRate?.toFixed(1) || 0}%`, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
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
          )}
          <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
              <TrendingUp size={32} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900">Campaign Performance</h3>
              <p className="text-sm text-zinc-500">Visual trends for spend, leads, and ROI over time.</p>
            </div>
            <div className="w-full max-w-md h-32 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-xs text-zinc-400 italic">
              [Chart Visualization]
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Channels</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 bg-zinc-50/50 h-16" />
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm">No campaigns found. Create your first one!</td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">{c.name}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-[200px]">{c.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        c.status === 'active' ? "bg-emerald-100 text-emerald-600" : 
                        c.status === 'paused' ? "bg-amber-100 text-amber-600" : "bg-zinc-100 text-zinc-500"
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900">${c.budget.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {c.channels.map(ch => (
                          <span key={ch} className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px]">{ch}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleAction(c.id, 'launch')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md" title="Launch">
                          <TrendingUp size={16} />
                        </button>
                        <button onClick={() => handleAction(c.id, 'pause')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md" title="Pause">
                          <PauseIcon size={16} />
                        </button>
                        <button onClick={() => handleAction(c.id, 'delete')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Delete">
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Product Launch', desc: 'High-impact multi-channel launch template.', icon: TrendingUp },
            { name: 'Seasonal Campaign', desc: 'Holiday and seasonal promotion kit.', icon: Calendar },
            { name: 'ABM Strategy', desc: 'Account-based marketing tailored templates.', icon: Target },
          ].map((tpl) => (
            <div key={tpl.name} className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:border-emerald-500 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors mb-4">
                <tpl.icon size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">{tpl.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">{tpl.desc}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                Use Template <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </ToolPageLayout>
  );
}

function PauseIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function TrashIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
