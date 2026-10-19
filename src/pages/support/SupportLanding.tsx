import React from 'react';
import { motion } from 'motion/react';
import { 
  LifeBuoy, MessageSquare, ShieldAlert, HelpCircle, 
  UserSquare2, AlertTriangle, ArrowRight, Zap,
  CheckCircle2, Clock, BarChart3, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SUPPORT_TOOLS = [
  {
    title: 'AI Reply Generator',
    desc: 'Craft empathetic and professional responses to customer inquiries instantly.',
    icon: MessageSquare,
    href: '/support/reply-generator',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    tag: 'Popular'
  },
  {
    title: 'Objection Handler',
    desc: 'Never lose a sale. Get AI-powered counters to common price or trust objections.',
    icon: ShieldAlert,
    href: '/support/objections',
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    title: 'Dynamic FAQ Builder',
    desc: 'Automatically generate and update a smart FAQ based on real customer questions.',
    icon: HelpCircle,
    href: '/support/faq',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },
  {
    title: 'Support Simulator',
    desc: 'Train yourself or your team by chatting with a difficult AI-simulated customer.',
    icon: UserSquare2,
    href: '/support/simulator',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    tag: 'New'
  },
  {
    title: 'Complaint Resolver',
    desc: 'Turn angry customers into loyal fans with delicate, solution-oriented replies.',
    icon: AlertTriangle,
    href: '/support/complaints',
    color: 'text-rose-600',
    bg: 'bg-rose-50'
  }
];

const METRICS = [
  { label: 'Avg. Response Time', value: '< 2 mins', icon: Clock, color: 'text-blue-500' },
  { label: 'CSAT Score', value: '4.8/5.0', icon: Star, color: 'text-amber-500' },
  { label: 'Tickets Solved', value: '1,240', icon: CheckCircle2, color: 'text-emerald-500' },
];

export default function SupportLanding() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Hero Section */}
      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-sm flex flex-col lg:flex-row items-center gap-12">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-100 italic">
            <Zap className="w-4 h-4" /> 24/7 AI Support Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight mb-6 tracking-tight">
            Turn your <span className="text-blue-600 italic">Support</span> into a superpower.
          </h1>
          <p className="text-zinc-500 text-lg mb-8 leading-relaxed max-w-lg font-medium">
            Boost customer satisfaction and reduce burn-out with AI tools that handle everything from simple replies to complex complaints.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/support/reply-generator" className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-2xl hover:bg-zinc-50 transition-all active:scale-95">
              Watch Demo
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
           {METRICS.map((m, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-zinc-50 border border-zinc-200/50 p-6 rounded-3xl group hover:border-blue-200 transition-all"
             >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white border border-zinc-100 shadow-sm", m.color)}>
                   <m.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-zinc-900 mb-1">{m.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{m.label}</div>
             </motion.div>
           ))}
           <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200 flex flex-col justify-between group cursor-pointer overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <BarChart3 className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity mb-4" />
              <div>
                <div className="text-lg font-black leading-tight mb-1">Live Dashboard</div>
                <p className="text-[10px] font-bold text-blue-100 opacity-80 uppercase tracking-widest">Connect CRM</p>
              </div>
           </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-8 px-4">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-black text-zinc-900 italic tracking-tight">Our Support Toolbox</h2>
           <div className="h-px flex-1 bg-zinc-100 mx-6 hidden md:block" />
           <p className="text-sm font-bold text-zinc-400">5 Powerful Tools Available</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {SUPPORT_TOOLS.map((tool, i) => {
             const Icon = tool.icon;
             return (
               <Link 
                to={tool.href} 
                key={i} 
                className="group bg-white border border-zinc-200 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-zinc-200/50 hover:border-blue-200 transition-all flex flex-col"
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-500", tool.bg, tool.color, "border-white shadow-md shadow-zinc-200/50")}>
                        <Icon className="w-7 h-7" />
                     </div>
                     {tool.tag && (
                       <span className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full group-hover:bg-blue-600 transition-colors">
                          {tool.tag}
                       </span>
                     )}
                  </div>
                  
                  <h3 className="text-xl font-black text-zinc-900 mb-3 group-hover:text-blue-600 transition-colors">
                     {tool.title}
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-8 flex-1">
                     {tool.desc}
                  </p>
                  
                  <div className="flex items-center gap-2 text-zinc-400 font-black uppercase tracking-widest text-[10px] group-hover:text-zinc-900 transition-colors">
                     Launch Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
               </Link>
             )
           })}
        </div>
      </div>

    </div>
  );
}
