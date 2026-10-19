import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map, CheckCircle2, Circle, ArrowRight, Sparkles, 
  Lightbulb, Globe, Smartphone, ShoppingBag, 
  Truck, CreditCard, Users, Zap, Info,
  ChevronRight, RefreshCcw, Download, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PHASES = [
  {
    id: 1,
    title: 'Digital Foundation',
    desc: 'Setting up your core identity and basic tools.',
    icon: Globe,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    tasks: [
      'Register your business on Google Maps (Tunisia)',
      'Create a LinkedIn Business Profile & Facebook Page',
      'Secure your .tn or .com domain name',
      'Set up professional email (contact@yourbiz.com)'
    ]
  },
  {
    id: 2,
    title: 'Online Visibility',
    desc: 'Getting found and attracting your first digital customers.',
    icon: Smartphone,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    tasks: [
      'Launch AI-optimized landing page',
      'Set up Instagram Shop / Meta Pixel',
      'Run first local Tunisian ad campaign',
      'Start collecting customer WhatsApp numbers'
    ]
  },
  {
    id: 3,
    title: 'Operations & Scaling',
    desc: 'Automating sales, delivery, and customer support.',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    tasks: [
      'Integrate local delivery (Aramex/Lux/etc.)',
      'Enable online payments (Konnect/Flouci)',
      'Deploy AI Support Chatbot',
      'Set up automated Email/SMS marketing'
    ]
  }
];

export default function GoDigitalGuide() {
  const [activePhase, setActivePhase] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const toggleTask = (task: string) => {
    setCompletedTasks(prev => 
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const progress = (completedTasks.length / PHASES.reduce((acc, p) => acc + p.tasks.length, 0)) * 100;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-16">
      
      {/* Header & Progress */}
      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
           <div className="space-y-2">
              <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
                 <Map className="w-8 h-8 text-blue-500" />
                 Go Digital Guide
              </h1>
              <p className="text-zinc-500 font-medium max-w-xl">
                 Your personalized roadmap for transforming your traditional Tunisian business into a digital-first powerhouse.
              </p>
           </div>
           
           <div className="flex flex-col items-center gap-4 bg-zinc-50 p-6 rounded-3xl border border-zinc-100 min-w-[240px]">
              <div className="flex justify-between w-full mb-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Progress</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 font-serif italic">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                 />
              </div>
              <p className="text-[10px] text-zinc-400 font-bold italic">
                 {completedTasks.length} of {PHASES.reduce((acc, p) => acc + p.tasks.length, 0)} milestones reached
              </p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {PHASES.map(p => (
             <button
               key={p.id}
               onClick={() => setActivePhase(p.id)}
               className={cn(
                 "p-6 rounded-3xl border-2 transition-all flex items-start gap-4 text-left group",
                 activePhase === p.id ? "bg-zinc-50 border-zinc-900 shadow-md" : "bg-white border-zinc-100 hover:border-zinc-300"
               )}
             >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm transition-transform group-hover:scale-110", activePhase === p.id ? "bg-zinc-900 text-white" : cn(p.bg, p.color))}>
                   {React.createElement(p.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                   <h3 className={cn("font-black text-sm mb-1 uppercase tracking-tight", activePhase === p.id ? "text-zinc-900" : "text-zinc-500")}>
                      Phase {p.id}: {p.title}
                   </h3>
                   <p className="text-[10px] font-medium text-zinc-400 leading-tight">{p.desc}</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
         
         {/* Phase Detail & Checklist */}
         <div className="xl:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col gap-8 min-h-[500px]"
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", PHASES[activePhase-1].bg, PHASES[activePhase-1].color)}>
                          {React.createElement(PHASES[activePhase-1].icon, { className: "w-8 h-8" })}
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-zinc-900 italic font-serif">Milestones: {PHASES[activePhase-1].title}</h2>
                          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{PHASES[activePhase-1].tasks.length} Critical Actions</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-xl border border-zinc-100"><Download className="w-5 h-5" /></button>
                       <button className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-xl border border-zinc-100"><Share2 className="w-5 h-5" /></button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PHASES[activePhase-1].tasks.map((task, i) => (
                      <div 
                        key={i} 
                        onClick={() => toggleTask(task)}
                        className={cn(
                          "p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center gap-4 group",
                          completedTasks.includes(task) ? "bg-emerald-50 border-emerald-500 shadow-sm" : "bg-white border-zinc-100 hover:border-zinc-200"
                        )}
                      >
                         <div className={cn(
                           "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                           completedTasks.includes(task) ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-200 group-hover:border-zinc-400"
                         )}>
                            {completedTasks.includes(task) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-4 h-4 text-zinc-200" />}
                         </div>
                         <h4 className={cn("text-sm font-bold leading-relaxed", completedTasks.includes(task) ? "text-emerald-900 line-through opacity-60" : "text-zinc-700")}>
                            {task}
                         </h4>
                      </div>
                    ))}
                 </div>

                 <div className="mt-auto pt-8 border-t border-zinc-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-400 italic">"Focus on one step at a time. Quality beats speed."</p>
                    <button className="bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] py-3.5 px-8 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                       Next Phase Milestones <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
              </motion.div>
            </AnimatePresence>
         </div>

         {/* Right: Insights & AI Help */}
         <div className="xl:col-span-4 space-y-6">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <h3 className="text-xl font-black mb-4 flex items-center gap-2 italic">
                  <Sparkles className="w-6 h-6 text-amber-300" /> AI Insights
               </h3>
               <p className="text-sm font-bold text-indigo-50 leading-relaxed mb-6 opacity-90">
                  Based on your progress, you are ready to focus on <strong>Customer Acquisition</strong>. Your next big win is setting up a Meta Pixel for tracking.
               </p>
               <button className="w-full py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                  Generate Custom Strategy <ArrowRight className="w-4 h-4" />
               </button>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 space-y-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Tunisia-Specific Tips
               </h3>
               <div className="space-y-4">
                  {[
                    { title: "Facebook is King", text: "In Tunisia, Facebook groups and Marketplace are often more effective than traditional websites for initial sales." },
                    { title: "WhatsApp Direct", text: "Tunisian customers prefer chatting via WhatsApp for reassurance before buying. Automate your greeting!" },
                    { title: "Local Payment", text: "Consider Konnect or ClickToPay if you want to avoid 'Cash on Delivery' headaches." }
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                       <div>
                          <h4 className="text-xs font-black text-zinc-900 mb-1">{tip.title}</h4>
                          <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">{tip.text}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
