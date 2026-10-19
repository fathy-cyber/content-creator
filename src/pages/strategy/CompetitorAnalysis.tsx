import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Sparkles, Search, Globe, 
  TrendingUp, TrendingDown, Target, Zap,
  Info, CheckCircle2, AlertCircle, Layout,
  RefreshCcw, Copy, Download, Save,
  BarChart3, ShieldAlert, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SWOT_COLORS = {
  strengths: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  weaknesses: 'bg-amber-50 border-amber-100 text-amber-700',
  opportunities: 'bg-blue-50 border-blue-100 text-blue-700',
  threats: 'bg-rose-50 border-rose-100 text-rose-700'
};

export default function CompetitorAnalysis() {
  const [competitorName, setCompetitorName] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorName) return;

    setIsGenerating(true);
    setAnalysis(null);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2500));
    
    setAnalysis({
      swot: {
        strengths: ["Strong local brand awareness", "Active Facebook community", "Competitive pricing"],
        weaknesses: ["Slow website load time (>5s)", "No WhatsApp support", "Difficult checkout process"],
        opportunities: ["Expand into automated nurturing", "Target premium high-income segment", "Launch a loyalty program"],
        threats: ["Rising customer acquisition costs", "New international competitors", "Price wars"]
      },
      gapAnalysis: "Your competitor is winning on price but losing on customer experience. By integrating Ayech AI's Support Hub, you can win back customers who are frustrated with their slow response times.",
      marketPosition: 72
    });
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Search className="w-8 h-8 text-amber-500" />
          Competitor Intel
        </h1>
        <p className="text-zinc-500 text-lg">
          Spy on your local competitors & find the winning edge in the Tunisian market.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="xl:col-span-4 space-y-6">
           <form onSubmit={handleAnalyze} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Competitor Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Zen, MyTek, local boutique..."
                      value={competitorName}
                      onChange={(e) => setCompetitorName(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-amber-500 outline-none transition-all text-sm font-medium"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                       <Globe className="w-4 h-4 text-zinc-400" /> Website / Social URL (Optional)
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://facebook.com/competitor"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-amber-500 outline-none transition-all text-sm font-medium"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !competitorName}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5 text-amber-400" />}
                {isGenerating ? 'Scanning Competitor Footprint...' : 'Gather Intel'}
              </button>
           </form>

           <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                 <Target className="w-5 h-5" />
              </div>
              <p className="text-xs text-amber-800 font-bold leading-relaxed">
                <strong>Strategy Hub:</strong> Knowing what your competitor is NOT doing is more valuable than knowing what they are doing. Look for customer service gaps!
              </p>
           </div>
        </div>

        {/* Right: Intel Display */}
        <div className="xl:col-span-8 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
           <AnimatePresence mode="wait">
             {analysis && !isGenerating ? (
               <motion.div
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6 pb-6 text-zinc-900"
               >
                 {/* Market Position & Gap Analysis */}
                 <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-3xl opacity-20 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex justify-between items-center mb-8 relative z-10">
                       <div className="flex items-center gap-3">
                          <Zap className="w-6 h-6 text-amber-400" />
                          <h3 className="text-xl font-black italic tracking-tight font-serif uppercase">The Winning Edge</h3>
                       </div>
                       <div className="flex gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                          <BarChart3 className="w-4 h-4" /> Market Dominance: {analysis.marketPosition}%
                       </div>
                    </div>
                    <p className="text-sm font-bold leading-relaxed italic opacity-90 relative z-10 border-l-2 border-amber-500 pl-6 mb-8">
                       "{analysis.gapAnalysis}"
                    </p>
                    <div className="flex justify-end gap-3 relative z-10">
                       <button className="px-6 py-2 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-zinc-900 transition-all font-serif italic">Apply to Strategy</button>
                    </div>
                 </div>

                 {/* SWOT Matrix */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analysis.swot).map(([key, items]: [string, any]) => (
                      <div key={key} className={cn("p-6 rounded-3xl border shadow-sm flex flex-col gap-4", SWOT_COLORS[key as keyof typeof SWOT_COLORS])}>
                         <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] italic">{key}</h4>
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center opacity-60">
                               <Plus className="w-3 h-3" />
                            </div>
                         </div>
                         <ul className="space-y-2">
                            {items.map((item: string, i: number) => (
                              <li key={i} className="text-xs font-bold leading-relaxed flex gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0 opacity-40" />
                                 {item}
                              </li>
                            ))}
                         </ul>
                      </div>
                    ))}
                 </div>

                 <div className="flex justify-end gap-3 px-4">
                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors p-2"><Copy className="w-5 h-5" /></button>
                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors p-2"><Download className="w-5 h-5" /></button>
                    <button className="bg-zinc-900 text-white font-bold py-3 px-8 rounded-2xl shadow-xl active:scale-95 transition-all ml-2 font-serif italic">Save Report</button>
                 </div>
               </motion.div>
             ) : isGenerating ? (
                <div className="h-[600px] flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 border-[6px] border-amber-500/10 border-t-amber-500 rounded-full animate-spin mb-8 shadow-2xl shadow-amber-100"></div>
                   <h3 className="text-2xl font-black text-zinc-900 mb-2 italic">Scouring Web Intelligence...</h3>
                   <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">Mapping local market sentiment...</p>
                </div>
             ) : (
                <div className="h-full min-h-[600px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-amber-200 transition-colors shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 via-amber-50/30 to-amber-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-sm group-hover:text-amber-50 group-hover:scale-110 transition-all duration-700 relative z-10">
                       <Search className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <h3 className="text-zinc-500 font-bold text-lg mb-2 italic relative z-10">Intel Collector Standby</h3>
                    <p className="text-zinc-400 text-sm max-w-sm relative z-10">Enter a competitor name on the left to generate a comprehensive AI-powered SWOT analysis.</p>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
