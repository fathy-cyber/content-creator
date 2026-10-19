import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, GitMerge, LibraryBig, Puzzle, LayoutDashboard,
  GraduationCap, Clock, Activity, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AUTOMATION_TOOLS = [
  {
    id: 'workflow',
    title: 'Workflow Builder',
    desc: 'Create custom multi-step automations triggered by events.',
    icon: GitMerge,
    color: 'indigo',
    path: '/automation/workflow',
    badge: 'Core Engine'
  },
  {
    id: 'templates',
    title: 'Template Library',
    desc: 'Browse and install 100+ ready-made automation recipes.',
    icon: LibraryBig,
    color: 'emerald',
    path: '/automation/templates'
  },
  {
    id: 'integrations',
    title: 'App Integrations',
    desc: 'Connect your favorite tools: Shopify, Mailchimp, Slack & more.',
    icon: Puzzle,
    color: 'blue',
    path: '/automation/integrations'
  },
  {
    id: 'dashboard',
    title: 'Automation Dashboard',
    desc: 'Monitor health, runs, and errors of your active workflows.',
    icon: LayoutDashboard,
    color: 'amber',
    path: '/automation/dashboard'
  },
  {
    id: 'learning',
    title: 'Learning Center',
    desc: 'Master automations with step-by-step guides and video tutorials.',
    icon: GraduationCap,
    color: 'purple',
    path: '/automation/learning'
  }
];

export default function AutomationLanding() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Hero & Global Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-zinc-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-white shadow-lg">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[150px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
              <Zap className="w-4 h-4 text-amber-400" /> Ayech Automation Engine
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Put your business<br className="hidden sm:block" /> on autopilot.
            </h1>
            <p className="text-lg text-indigo-100/70 mb-8 max-w-xl">
              Connect your tools, set up conditional logic, and let AI handle the repetitive tasks while you focus on scaling.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/automation/workflow" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2">
                <GitMerge className="w-5 h-5" /> Build New Workflow
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
               <Clock className="w-12 h-12 text-emerald-100" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2 relative z-10">Time Saved This Month</h3>
             <div className="text-4xl font-extrabold text-zinc-900 relative z-10">
               124 <span className="text-xl font-bold text-zinc-400">Hours</span>
             </div>
             <div className="text-sm font-semibold text-emerald-500 mt-2 flex items-center gap-1 relative z-10">
               <TrendingUpIcon className="w-4 h-4" /> +12% from last month
             </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
               <Activity className="w-12 h-12 text-blue-100" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2 relative z-10">Tasks Automated</h3>
             <div className="text-4xl font-extrabold text-zinc-900 relative z-10">
               18,492 <span className="text-xl font-bold text-zinc-400">Runs</span>
             </div>
             <div className="text-sm font-semibold text-zinc-400 mt-2 flex items-center gap-1 relative z-10">
               Across 15 active workflows
             </div>
          </div>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-indigo-500" />
            Automation Toolkit
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {AUTOMATION_TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={tool.id}
              >
                <Link to={tool.path} className="group block h-full bg-white border border-zinc-200 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-zinc-200/50 hover:border-indigo-200 relative overflow-hidden">
                  {tool.badge && (
                    <div className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                      {tool.badge}
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl mb-5 flex items-center justify-center transition-colors bg-${tool.color}-50 text-${tool.color}-600 group-hover:bg-${tool.color}-100`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-indigo-700 transition-colors leading-tight">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                    {tool.desc}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-zinc-400 group-hover:text-indigo-600 transition-colors">
                    Launch <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active Workflows Mock */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 mt-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Active System Workflows
          </h2>
          <Link to="/automation/dashboard" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="border border-zinc-100 bg-zinc-50/50 p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">New Lead to CRM & Welcome Email</h4>
                <p className="text-xs text-zinc-500 truncate mt-0.5">Shopify → HubSpot → Mailchimp</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4 hidden sm:block">
              <div className="text-lg font-bold font-mono text-zinc-700">8,401</div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Runs (30d)</div>
            </div>
          </div>

          <div className="border border-zinc-100 bg-zinc-50/50 p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">Abandoned Cart SMS Recovery</h4>
                <p className="text-xs text-zinc-500 truncate mt-0.5">WooCommerce → Twilio → Slack</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4 hidden sm:block">
              <div className="text-lg font-bold font-mono text-zinc-700">1,204</div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Runs (30d)</div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
