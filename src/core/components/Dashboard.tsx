import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Target, CheckCircle2, 
  BarChart3, AlertCircle, Activity, Zap, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getService } from '@/core';
import { useGlobalContext } from '@/core/context/ContextBridge';
import { Link } from 'react-router-dom';

interface WidgetProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: { label: string, href: string };
}

function Widget({ title, icon, children, action }: WidgetProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:border-indigo-200 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-50 text-zinc-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            {icon}
          </div>
          <h3 className="font-bold text-zinc-900">{title}</h3>
        </div>
        {action && (
          <Link 
            to={action.href} 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            {action.label} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { activeClient, activeProject } = useGlobalContext((state) => ({
    activeClient: state.activeClient,
    activeProject: state.activeProject,
  }));
  const [stats, setStats] = useState({
    recentAssets: [],
    pendingApprovals: 0,
    activeCampaigns: 0,
    aiUsage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const assets = getService<any>('assets');
        const result = await assets.listAssets({ limit: 5 });
        
        // Calculate pending approvals
        const pending = result.data.filter((a: any) => 
          ['internal_review', 'client_review'].includes(a.status)
        ).length;

        setStats({
          recentAssets: result.data || [],
          pendingApprovals: pending,
          activeCampaigns: Math.floor(Math.random() * 5) + 1, // Mock
          aiUsage: Math.floor(Math.random() * 1000) + 500, // Mock
        });
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [activeClient, activeProject]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-zinc-100 animate-pulse rounded-3xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 italic font-serif">
            Welcome back, <span className="text-indigo-600">Mohamed</span>
          </h1>
          <p className="text-zinc-500 font-medium">
            {activeClient 
              ? `Currently managing ${activeClient.name}${activeProject ? ` on project ${activeProject.name}` : ''}`
              : 'Please select a client to see your workspace overview.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 shadow-sm">
            Workspace: <span className="text-indigo-600">Main Agency</span>
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Active Campaigns</div>
            <div className="text-3xl font-black">{stats.activeCampaigns}</div>
          </div>
          <Target className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>
        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Pending Approvals</div>
            <div className="text-3xl font-black">{stats.pendingApprovals}</div>
          </div>
          <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>
        <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">AI Tokens Used</div>
            <div className="text-3xl font-black text-zinc-900">{stats.aiUsage.toLocaleString()}</div>
          </div>
          <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-zinc-100 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>
        <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Recent Assets</div>
            <div className="text-3xl font-black text-zinc-900">{stats.recentAssets.length}</div>
          </div>
          <FileText className="absolute -right-4 -bottom-4 w-24 h-24 text-zinc-100 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Widget 
          title="Recent Assets" 
          icon={<FileText className="w-5 h-5" />} 
          action={{ label: 'View Library', href: '/marketing/assets' }}
        >
          <div className="space-y-3">
            {stats.recentAssets.length > 0 ? stats.recentAssets.map((asset: any) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    {asset.type[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-zinc-700 truncate">{asset.title}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  asset.status === 'published' ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-600"
                )}>
                  {asset.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-zinc-400 text-xs">No recent assets</div>
            )}
          </div>
        </Widget>

        <Widget 
          title="Pending Approvals" 
          icon={<AlertCircle className="w-5 h-5" />} 
          action={{ label: 'Manage Queue', href: '/marketing/approval-queue' }}
        >
          <div className="space-y-3">
            {stats.pendingApprovals > 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                <div className="text-2xl font-black text-amber-600 mb-1">{stats.pendingApprovals}</div>
                <div className="text-xs font-medium text-amber-700">Assets awaiting review</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500" />
                <span className="text-xs font-medium">All caught up!</span>
              </div>
            )}
          </div>
        </Widget>

        <Widget 
          title="AI Performance" 
          icon={<Activity className="w-5 h-5" />} 
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Gemini 1.5 Flash</span>
              <span className="font-bold text-zinc-900">98% Success</span>
            </div>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-[98%]" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Avg Latency</span>
              <span className="font-bold text-zinc-900">1.2s</span>
            </div>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[60%]" />
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );
}
