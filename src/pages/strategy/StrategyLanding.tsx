import React from 'react';
import { motion } from 'motion/react';
import { 
  Target, Globe, BarChart3, Users, 
  Map, Lightbulb, ArrowRight, Zap,
  CheckCircle2, TrendingUp, Flag, Search,
  Briefcase, Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const STRATEGY_TOOLS = [
  {
    title: 'Website Audit',
    desc: 'Get a deep-dive analysis of your website SEO, speed, and conversion rate.',
    icon: Globe,
    href: '/strategy/website-audit',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    tag: 'Essential'
  },
  {
    title: 'Funnel Optimizer',
    desc: 'Map out your customer journey and find leaks where you are losing money.',
    icon: Filter,
    href: '/strategy/funnel',
    color: 'text-rose-600',
    bg: 'bg-rose-50'
  },
  {
    title: 'Lead Gen Architect',
    desc: 'Build automated systems to capture and nurture high-quality leads.',
    icon: Users,
    href: '/strategy/lead-gen',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'Competitor Intel',
    desc: 'Spy on your local competitors and find gaps in the Tunisian market.',
    icon: Search,
    href: '/strategy/competitors',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    tag: 'New'
  },
  {
    title: 'Go Digital Guide',
    desc: 'A step-by-step roadmap for taking your physical shop into the digital era.',
    icon: Map,
    href: '/strategy/go-digital',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  }
];

// Re-importing Filter since I missed it in the icon list
import { Filter } from 'lucide-react';

const METRICS = [
  { label: 'Growth Velocity', value: '+24%', icon: TrendingUp, color: 'text-emerald-500' },
  { label: 'Market Share', value: '12.5%', icon: Target, color: 'text-indigo-500' },
  { label: 'Tasks Automated', value: '450', icon: Zap, color: 'text-amber-500' },
];

export default function StrategyLanding() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Hero Section */}
      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-sm flex flex-col lg:flex-row items-center gap-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[140px] opacity-5 -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
            <Rocket className="w-4 h-4" /> AI Strategy Advisor
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 leading-tight mb-6 tracking-tight">
            Think <span className="text-indigo-600 italic">Bigger</span>. <br/>
            Execute Faster.
          </h1>
          <p className="text-zinc-500 text-lg mb-8 leading-relaxed max-w-lg font-medium italic">
            "Your business strategy isn't just a plan—it's an operating system for growth. Let's optimize yours."
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/strategy/website-audit" className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 flex items-center gap-2">
              Start Strategy Audit <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-2xl hover:bg-zinc-50 transition-all active:scale-95">
               Download Roadmap
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col gap-4 relative z-10">
           <div className="bg-zinc-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Maturity Score</div>
                    <div className="text-4xl font-black italic">68/100</div>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-indigo-400" />
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Performance</span>
                    <span className="text-indigo-400">72%</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-indigo-500" />
                 </div>
              </div>
              <p className="mt-6 text-xs text-zinc-400 leading-relaxed italic">
                 "You are ahead of 65% of Tunisian SMEs in your category. Improve your Funnel to reach 80%."
              </p>
           </div>
           
           <div className="grid grid-cols-3 gap-4">
              {METRICS.map((m, i) => (
                <div key={i} className="bg-white border border-zinc-200 p-4 rounded-3xl flex flex-col items-center text-center shadow-sm hover:border-indigo-200 transition-colors">
                   <m.icon className={cn("w-5 h-5 mb-2", m.color)} />
                   <div className="text-lg font-black text-zinc-900">{m.value}</div>
                   <div className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{m.label}</div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-8 px-4">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-black text-zinc-900 italic tracking-tight flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-indigo-500" />
              Strategic Arsenal
           </h2>
           <div className="h-px flex-1 bg-zinc-100 mx-6 hidden md:block" />
           <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Growth Engines</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {STRATEGY_TOOLS.map((tool, i) => {
             const Icon = tool.icon;
             return (
               <Link 
                to={tool.href} 
                key={i} 
                className="group bg-white border border-zinc-200 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-200/20 hover:border-indigo-200 transition-all flex flex-col relative overflow-hidden"
               >
                  {/* Subtle Gradient Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:rotate-6 duration-500 shadow-sm", tool.bg, tool.color, "border-white")}>
                        <Icon className="w-7 h-7" />
                     </div>
                     {tool.tag && (
                       <span className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full group-hover:bg-indigo-600 transition-colors">
                          {tool.tag}
                       </span>
                     )}
                  </div>
                  
                  <h3 className="text-xl font-black text-zinc-900 mb-3 group-hover:text-indigo-600 transition-colors relative z-10 font-serif">
                     {tool.title}
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-8 flex-1 relative z-10">
                     {tool.desc}
                  </p>
                  
                  <div className="flex items-center gap-2 text-zinc-400 font-black uppercase tracking-widest text-[10px] group-hover:text-zinc-900 transition-colors relative z-10">
                     Execute Strategy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
               </Link>
             )
           })}
        </div>
      </div>

    </div>
  );
}
