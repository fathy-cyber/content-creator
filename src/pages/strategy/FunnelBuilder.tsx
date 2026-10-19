import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, Sparkles, TrendingUp, TrendingDown, 
  ArrowDown, Plus, Info, Layout, 
  RefreshCcw, Copy, Download, Save,
  Users, MousePointer2, ShoppingCart, Heart,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'awareness', name: 'Awareness', icon: Users, color: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-50' },
  { id: 'consideration', name: 'Consideration', icon: MousePointer2, color: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
  { id: 'conversion', name: 'Conversion', icon: ShoppingCart, color: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50' },
  { id: 'retention', name: 'Retention', icon: Heart, color: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-50' },
];

export default function FunnelBuilder() {
  const [activeStep, setActiveStep] = useState('awareness');
  const [metrics, setMetrics] = useState<Record<string, number>>({
    awareness: 5000,
    consideration: 1200,
    conversion: 150,
    retention: 45
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [tips, setTips] = useState<any[]>([]);

  const handleUpdateMetric = (step: string, val: number) => {
    setMetrics(prev => ({ ...prev, [step]: val }));
  };

  const calculateConversion = (from: string, to: string) => {
    if (!metrics[from] || !metrics[to]) return 0;
    return Math.round((metrics[to] / metrics[from]) * 100);
  };

  const handleAnalyze = async () => {
    setIsGenerating(true);
    setTips([]);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2000));
    
    setTips([
      { title: "Awareness → Consideration Leak", desc: "You are losing 76% of visitors. Your landing page hook might be too weak for the Tunisian market.", fix: "Try using more local social proof or a clearer value prop in Tunisian Arabic." },
      { title: "Conversion Booster", desc: "For the 'Conversion' stage, adding a WhatsApp direct link reduced friction by 30% for similar businesses.", fix: "Add a floating WhatsApp button to your checkout page." }
    ]);
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Filter className="w-8 h-8 text-rose-500" />
          Funnel Builder
        </h1>
        <p className="text-zinc-500 text-lg">
          Map your customer journey and plug the leaks in your sales pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Funnel Visualization & Metrics */}
        <div className="xl:col-span-6 space-y-6">
           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center">
              <div className="w-full max-w-sm flex flex-col items-center gap-1">
                 {STEPS.map((step, i) => {
                   const width = 100 - i * 15;
                   const Icon = step.icon;
                   return (
                     <React.Fragment key={step.id}>
                        <motion.div 
                          layout
                          onClick={() => setActiveStep(step.id)}
                          className={cn(
                            "relative h-20 flex items-center justify-between px-8 rounded-2xl cursor-pointer transition-all border-2",
                            activeStep === step.id ? "border-zinc-900 shadow-xl z-20 scale-105" : "border-transparent opacity-80 hover:opacity-100"
                          )}
                          style={{ width: `${width}%` }}
                        >
                           <div className={cn("absolute inset-0 rounded-2xl opacity-10", step.color)} />
                           <div className="flex items-center gap-3 relative z-10">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", step.color)}>
                                 <Icon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-black uppercase tracking-tight text-zinc-900">{step.name}</span>
                           </div>
                           <div className="text-right relative z-10">
                              <div className="text-lg font-black text-zinc-900">{metrics[step.id].toLocaleString()}</div>
                              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Users</div>
                           </div>
                        </motion.div>
                        {i < STEPS.length - 1 && (
                          <div className="flex flex-col items-center py-1 opacity-40">
                             <div className="text-[10px] font-black text-rose-500">{calculateConversion(step.id, STEPS[i+1].id)}%</div>
                             <ArrowDown className="w-4 h-4 text-zinc-300" />
                          </div>
                        )}
                     </React.Fragment>
                   )
                 })}
              </div>
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                 <Layout className="w-4 h-4" /> Edit Stage Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {STEPS.map(step => (
                   <div key={step.id} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{step.name} Traffic</label>
                      <input 
                        type="number"
                        value={metrics[step.id]}
                        onChange={(e) => handleUpdateMetric(step.id, parseInt(e.target.value) || 0)}
                        className="w-full p-3 rounded-xl border border-zinc-200 focus:border-zinc-900 outline-none transition-all font-bold text-sm"
                      />
                   </div>
                 ))}
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={isGenerating}
                className="w-full bg-zinc-900 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                 {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-rose-400" />}
                 {isGenerating ? 'Simulating Conversions...' : 'Analyze My Funnel'}
              </button>
           </div>
        </div>

        {/* Right: AI Analysis & Insights */}
        <div className="xl:col-span-6 space-y-6">
           <AnimatePresence mode="wait">
             {tips.length > 0 && !isGenerating ? (
               <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
               >
                  <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                     <h3 className="text-xl font-black mb-6 italic flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-emerald-400" /> Improvement Roadmap
                     </h3>
                     <div className="space-y-6">
                        {tips.map((tip, i) => (
                          <div key={i} className="flex gap-4 items-start">
                             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                                <span className="text-[10px] font-black">{i+1}</span>
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-sm font-black italic">{tip.title}</h4>
                                <p className="text-xs text-indigo-100 leading-relaxed font-medium">{tip.desc}</p>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-[11px] font-bold text-emerald-300 italic">
                                   <strong>FIX:</strong> {tip.fix}
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col items-center text-center group hover:border-zinc-900 transition-all">
                        <Download className="w-6 h-6 text-zinc-400 mb-2 group-hover:text-zinc-900 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900">Export Strategy</span>
                     </button>
                     <button className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col items-center text-center group hover:border-zinc-900 transition-all">
                        <Save className="w-6 h-6 text-zinc-400 mb-2 group-hover:text-zinc-900 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900">Save to Hub</span>
                     </button>
                  </div>
               </motion.div>
             ) : isGenerating ? (
               <div className="h-[500px] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-black text-zinc-900 mb-2">Calculating Drop-offs</h3>
                  <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">Identifying conversion leaks...</p>
               </div>
             ) : (
               <div className="h-full min-h-[500px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-rose-200 transition-colors shadow-inner relative overflow-hidden">
                   <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                      <Filter className="w-12 h-12 stroke-[1.5]" />
                   </div>
                   <h3 className="text-zinc-500 font-bold text-lg mb-2 italic">Funnel is Empty</h3>
                   <p className="text-zinc-400 text-sm max-w-xs leading-relaxed font-medium">
                      Adjust the stage metrics on the left and run AI analysis to see where your business is gaining or losing momentum.
                   </p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
