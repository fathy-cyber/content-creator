import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, Sparkles, FileText, Layout, 
  Search, Hash, List, CheckCircle2, 
  Copy, Download, RefreshCcw, ArrowRight,
  TrendingUp, BarChart3, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = ['Professional', 'Informative', 'Conversational', 'Persuasive', 'Storytelling'];
const LENGTHS = ['Short (~500 words)', 'Medium (~1000 words)', 'Long (~2000+ words)'];

export default function BlogWriter() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium (~1000 words)');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'input' | 'outline' | 'result'>('input');
  const [outline, setOutline] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsGenerating(true);
    // Mock API
    await new Promise(r => setTimeout(r, 1500));
    
    setOutline([
      "Introduction: Why " + topic + " matters in 2024",
      "Key Benefits of implementing " + (keywords.split(',')[0] || topic),
      "Step-by-step guide to getting started",
      "Common mistakes to avoid",
      "Case Study: A Tunisian business success story",
      "Conclusion and Next Steps"
    ]);
    
    setStep('outline');
    setIsGenerating(false);
  };

  const handleGenerateFullDraft = async () => {
    setIsGenerating(true);
    // Mock API
    await new Promise(r => setTimeout(r, 2500));
    
    setContent(`
# The Ultimate Guide to ${topic}

In today's fast-paced digital landscape, ${topic} has emerged as a cornerstone of successful business strategy. Whether you're a small startup in Tunis or a scaling enterprise in Sfax, understanding the nuances of this field is no longer optional—it's essential for survival.

## Why it Matters
The data is clear: businesses that prioritize ${keywords || topic} see a 40% higher engagement rate from their target audience. This is particularly true in the Tunisian market, where digital adoption is skyrocketing...

[Full Article generated based on your outline...]
    `);
    
    setStep('result');
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-1">
            <PenTool className="w-8 h-8 text-emerald-500" />
            AI Blog Writer
          </h1>
          <p className="text-zinc-500 font-medium">Create high-quality, SEO-optimized articles in minutes.</p>
        </div>
        
        {/* Progress Tracker */}
        <div className="flex items-center gap-3 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 shadow-inner">
           {[
             { id: 'input', label: 'Idea' },
             { id: 'outline', label: 'Outline' },
             { id: 'result', label: 'Draft' }
           ].map((s, i) => (
             <div key={s.id} className="flex items-center gap-2 px-4 py-1.5">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                  step === s.id ? "bg-emerald-600 text-white" : (i < ['input', 'outline', 'result'].indexOf(step) ? "bg-emerald-100 text-emerald-600" : "bg-white text-zinc-400 border border-zinc-200")
                )}>
                  {i < ['input', 'outline', 'result'].indexOf(step) ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("text-xs font-bold transition-colors", step === s.id ? "text-zinc-900" : "text-zinc-400")}>
                  {s.label}
                </span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Main Workspace (Left) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm"
              >
                <form onSubmit={handleGenerateOutline} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> What do you want to write about?
                    </label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g., The future of e-commerce in Tunisia for 2024..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-base font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-zinc-400" /> Targeted Keywords
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g., e-commerce, digital marketing, sales"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                        <Info className="w-4 h-4 text-zinc-400" /> Tone of Voice
                      </label>
                      <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium bg-white"
                      >
                        {TONES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-zinc-800">Target Article Length</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {LENGTHS.map(l => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLength(l)}
                          className={cn(
                            "p-3.5 rounded-xl border text-sm font-bold transition-all text-center",
                            length === l ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isGenerating || !topic}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Layout className="w-5 h-5 text-emerald-400" />}
                    {isGenerating ? 'Analyzing Topic...' : 'Generate Outline'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'outline' && (
              <motion.div 
                key="outline"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <List className="w-6 h-6 text-emerald-500" /> Review Generated Outline
                   </h2>
                   <button 
                    onClick={() => setStep('input')}
                    className="text-sm font-bold text-zinc-400 hover:text-zinc-600 underline"
                   >
                     Go Back
                   </button>
                </div>

                <div className="space-y-3 mb-8">
                   {outline.map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 border border-zinc-100 bg-zinc-50/50 rounded-2xl group transition-all hover:bg-white hover:border-emerald-100">
                        <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-colors">
                          {i + 1}
                        </div>
                        <span className="text-zinc-700 font-semibold">{item}</span>
                     </div>
                   ))}
                </div>

                <button 
                  onClick={handleGenerateFullDraft}
                  disabled={isGenerating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                   {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5 text-emerald-200" />}
                   {isGenerating ? 'Writing Draft...' : 'Write Full Article'}
                </button>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px]"
              >
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                         <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                         <Download className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto font-serif">
                   <textarea 
                     className="w-full h-full outline-none bg-transparent resize-none text-lg leading-relaxed text-zinc-800"
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                   />
                </div>

                <div className="p-4 border-t border-zinc-100 bg-white flex items-center justify-between shrink-0">
                   <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">
                      Word Count: {content.split(' ').length} words
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                      onClick={() => setStep('outline')}
                      className="px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
                     >
                        Regenerate
                     </button>
                     <button className="px-6 py-2.5 bg-zinc-900 text-white font-bold rounded-xl shadow-lg text-sm hover:bg-zinc-800 transition-all">
                        Finalize & Export
                     </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* SEO & Sidebar (Right) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           
           {/* SEO Score Card */}
           <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" /> SEO Optimization
                 </h3>
                 <span className="text-2xl font-black text-emerald-600 font-mono">82%</span>
              </div>
              
              <div className="space-y-4">
                 {[
                   { label: 'Keyword Density', score: 95, status: 'Perfect' },
                   { label: 'Meta Description', score: 0, status: 'Missing' },
                   { label: 'Headings (H1-H3)', score: 70, status: 'Good' },
                   { label: 'Readability Index', score: 85, status: 'High' }
                 ].map((metric, i) => (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                         <span className="text-zinc-500">{metric.label}</span>
                         <span className={cn(metric.score === 0 ? "text-rose-500" : "text-emerald-600")}>{metric.status}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                         <div 
                          className={cn("h-full rounded-full transition-all duration-1000", metric.score === 0 ? "bg-rose-400" : "bg-emerald-500")}
                          style={{ width: `${metric.score}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100">
                 <button className="w-full p-3 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 group">
                    Optimize for keywords <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>

           {/* AI Smart Tips */}
           <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
              <h3 className="font-bold mb-4 flex items-center gap-2 relative z-10">
                 <Sparkles className="w-5 h-5 text-indigo-300" /> Ayech Smart Tips
              </h3>
              <div className="space-y-3 relative z-10">
                 <p className="text-xs text-indigo-100/70 leading-relaxed italic">
                   "Consider adding more local references to Tunis or Nabeul to increase resonance with your Tunisian audience."
                 </p>
                 <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold group-hover:text-emerald-300 transition-colors">Analyze current trending topics in your sector</span>
                 </div>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
}
