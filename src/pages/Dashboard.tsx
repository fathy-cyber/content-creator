import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, ArrowUpRight, ShoppingBag, 
  Users, Zap, Sparkles, 
  ChevronRight, Calendar, ArrowRight,
  TrendingUp, BarChart3, Clock, Target
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ModuleRegistry } from '../modules/registry';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { installedAppIds } = useAppStore();
  const installedApps = ModuleRegistry.filter(app => installedAppIds.includes(app.id));

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] font-serif italic">
              <Sparkles className="w-4 h-4" /> Global Intelligence
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 font-serif italic leading-none">
             Welcome back, <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Fathy</span>.
           </h1>
           <p className="text-zinc-400 font-bold tracking-tight text-sm">Your digital empire grew by <span className="text-emerald-500">+12%</span> this week.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Active Ecosystem</div>
              <div className="flex -space-x-3">
                {installedApps.slice(0, 4).map(app => (
                  <div key={app.id} className="w-10 h-10 rounded-xl bg-white border-2 border-zinc-50 flex items-center justify-center shadow-xl text-zinc-400 hover:scale-110 transition-transform active:z-10 cursor-pointer" title={app.name}>
                    {React.cloneElement(app.icon as React.ReactElement, { size: 18 })}
                  </div>
                ))}
                {installedApps.length > 4 && (
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                    +{installedApps.length - 4}
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Revenue Card - Premium Glass */}
        <div className="group relative bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-3xl overflow-hidden min-h-[220px] flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10 flex justify-between items-start">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                 <TrendingUp className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-3 py-1.5 rounded-full">
                 <ArrowUpRight className="w-3 h-3" /> 12.4%
              </div>
           </div>
           <div className="relative z-10">
              <div className="text-sm font-bold text-zinc-400 mb-1">Total Monthly Revenue</div>
              <div className="text-5xl font-black italic tracking-tighter font-serif">12,450 <span className="text-xl text-zinc-500 font-sans tracking-widest uppercase">TND</span></div>
           </div>
        </div>

        {/* Dynamic Widgets Area */}
        {installedApps.slice(0, 2).map(app => (
          app.dashboardWidgets?.map((Widget, idx) => (
            <div key={`${app.id}-widget-${idx}`} className="contents">
              <Widget />
            </div>
          ))
        ))}

        {/* AI Insight Card */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-3xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
              <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-white transition-all shadow-[0_0_10px_white]" />
           </div>
           <div className="space-y-6">
              <h3 className="text-xl font-black italic flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-300 fill-current" /> Strategic Insight
              </h3>
              <p className="text-sm font-bold leading-relaxed opacity-90">
                 "Your funnel conversion in **Grand Tunis** is 4X higher than in Sfax. Redirect 20% of your ad spend to optimize regional ROI."
              </p>
           </div>
           <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] hover:translate-x-2 transition-transform opacity-70 hover:opacity-100">
              Apply Strategy <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Recent & Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Activity Feed */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/60 rounded-[3rem] p-10 shadow-sm space-y-10">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-zinc-900 italic font-serif tracking-tight flex items-center gap-4">
                 <Clock className="w-6 h-6 text-zinc-300" /> Recent Activity
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors">Clear Feed</button>
           </div>

           <div className="space-y-4">
              {[
                { label: 'Automation Success', desc: 'Welcome sequence sent to 45 new leads.', time: '12m ago', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Strategy Update', desc: 'Competitor report for "Retail Sector" is ready.', time: '2h ago', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
                { label: 'Content Generated', desc: '5 Viral captions created for Instagram.', time: '5h ago', icon: LayoutDashboard, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              ].map((act, i) => (
                <div key={i} className="flex items-center gap-6 p-6 hover:bg-zinc-50 rounded-[2rem] transition-all cursor-pointer group border border-transparent hover:border-zinc-100 shadow-sm hover:shadow-lg">
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm transition-transform group-hover:scale-110", act.bg, act.color)}>
                      <act.icon size={24} />
                   </div>
                   <div className="flex-1">
                      <div className="text-sm font-black text-zinc-900 italic">{act.label}</div>
                      <div className="text-xs font-bold text-zinc-400 group-hover:text-zinc-500 transition-colors">{act.desc}</div>
                   </div>
                   <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{act.time}</div>
                </div>
              ))}
           </div>
        </div>

        {/* Global CTAs */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-zinc-900 rounded-[3rem] p-10 text-white shadow-3xl text-center space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-zinc-500 group-hover:scale-110 transition-transform duration-700">
                 <ShoppingBag size={32} className="text-indigo-400" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black italic tracking-tight font-serif">Fuel your Growth.</h3>
                 <p className="text-xs font-medium text-zinc-400 leading-relaxed max-w-[200px] mx-auto">Explore premium AI tools to scale your business faster.</p>
              </div>
              <Link to="/apps" className="block w-full py-5 bg-white text-zinc-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-100 transition-all active:scale-95">
                 Visit App Store
              </Link>
           </div>

           <div className="bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all group cursor-pointer">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 group-hover:bg-white group-hover:text-indigo-500 transition-all">
                 <BarChart3 size={24} />
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-400">Request Custom Tool</div>
           </div>
        </div>
      </div>
    </div>
  );
}
