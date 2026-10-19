import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Sparkles, Target, Copy, 
  RotateCcw, CheckCircle2, AlertTriangle, 
  Handshake, TrendingDown, Users, Info,
  Search, MessageSquare, ArrowRight, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const OBJECTION_TYPES = [
  { id: 'price', name: 'Too Expensive', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'trust', name: 'Trust / Credibility', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'complexity', name: 'Too Complex', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'competition', name: 'Competition', icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
];

export default function ObjectionHandler() {
  const [type, setType] = useState('price');
  const [objection, setObjection] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objection) return;

    setIsGenerating(true);
    setStrategies([]);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2000));
    
    setStrategies([
      { 
        title: "The ROI Frame", 
        desc: "Focus on the long-term value rather than short-term cost.",
        script: "I completely understand that the investment seems high at first glance. However, most of our clients in Tunisia find that they recover this cost within the first 3 months through the time they save on manual tasks. If you could save 10 hours a week, what would that be worth to your bottom line?",
        strength: 95
      },
      { 
        title: "The Comparison Tactic", 
        desc: "Contrast the price against the cost of doing nothing.",
        script: "Think about the cost of missing out on potential customers because your response time is too slow. One lost sale can often cost more than a full year of using Ayech AI. We're here to make sure you never miss that opportunity again.",
        strength: 88
      },
      { 
        title: "The Reassurance Close", 
        desc: "Address the fear of risk directly.",
        script: "We're so confident in the value we provide that we offer a 14-day success guarantee. If you don't see a measurable improvement in your workflow efficiency, we'll work with you until you do, or give you your money back. Does that help lower the risk for you?",
        strength: 92
      }
    ]);
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          Objection Handler
        </h1>
        <p className="text-zinc-500 text-lg">
          Turn hesitations into "Yes!" with AI-powered psychological reframing.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="xl:col-span-5 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-800">What is the customer's objection?</label>
                <div className="grid grid-cols-2 gap-3">
                   {OBJECTION_TYPES.map(ot => {
                     const Icon = ot.icon;
                     return (
                       <button
                         key={ot.id}
                         type="button"
                         onClick={() => setType(ot.id)}
                         className={cn(
                           "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center",
                           type === ot.id ? "border-amber-500 bg-amber-50/50 shadow-sm" : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                         )}
                       >
                          <Icon className={cn("w-6 h-6 mb-2", type === ot.id ? ot.color : "text-zinc-300")} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", type === ot.id ? "text-amber-700" : "text-zinc-400")}>{ot.name}</span>
                       </button>
                     )
                   })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                   <MessageSquare className="w-4 h-4 text-zinc-400" /> Specific Details
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="e.g. They said 'it's too expensive for a local business' or 'I need to talk to my partner first'..."
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                />
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !objection}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                {isGenerating ? 'Reframing Hurdles...' : 'Generate Counter-Scripts'}
              </button>
           </form>

           <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                 <Handshake className="w-5 h-5" />
              </div>
              <p className="text-xs text-amber-800 font-bold leading-relaxed">
                <strong>Psychology Hack:</strong> Always agree with the feeling first ("I understand why you'd feel that way") before pivotting to your counter-argument.
              </p>
           </div>
        </div>

        {/* Right: Strategies Display */}
        <div className="xl:col-span-7 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
           <AnimatePresence mode="popLayout">
              {strategies.length > 0 && !isGenerating ? (
                strategies.map((strat, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm group hover:border-amber-200 transition-all flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-black">
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-zinc-900 leading-tight">{strat.title}</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{strat.desc}</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => {
                          navigator.clipboard.writeText(strat.script);
                        }}
                        className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-400 hover:text-amber-600 transition-colors shadow-inner"
                       >
                          <Copy className="w-4 h-4" />
                       </button>
                    </div>
                    
                    <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl italic text-zinc-700 text-sm font-medium leading-relaxed mb-4 relative">
                       <span className="absolute -top-3 left-6 px-2 bg-white text-[9px] font-black uppercase tracking-widest border border-zinc-100 rounded text-zinc-400 italic">Effective Script</span>
                       "{strat.script}"
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                             <TrendingDown className="w-3.5 h-3.5 text-emerald-500" /> Lower Resistance
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                             <Users className="w-3.5 h-3.5 text-blue-500" /> Social Proof
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-400">STRENGTH</span>
                          <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                             <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${strat.strength}%` }}
                              className="h-full bg-amber-500" 
                             />
                          </div>
                          <span className="text-[10px] font-black text-amber-600">{strat.strength}%</span>
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : isGenerating ? (
                 <div className="h-[500px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                    <p className="font-black text-zinc-400 uppercase tracking-[0.2em] text-[10px]">Overcoming Resistance...</p>
                 </div>
              ) : (
                 <div className="h-full min-h-[500px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-amber-200 transition-colors shadow-inner">
                     <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-sm group-hover:text-amber-50 group-hover:scale-110 transition-all duration-700">
                        <ShieldAlert className="w-12 h-12 stroke-[1.5]" />
                     </div>
                     <h3 className="text-zinc-500 font-bold text-lg mb-2 italic">Awaiting Objection</h3>
                     <p className="text-zinc-400 text-sm max-w-xs">Don't let hesitations stop your growth. Enter the customer's objection to get persuasive counters.</p>
                 </div>
              )}
           </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
