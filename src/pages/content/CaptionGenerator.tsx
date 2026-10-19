import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Quote, Instagram, Facebook, Linkedin, 
  MessageCircle, Sparkles, Hash, Smile,
  RefreshCcw, Copy, CheckCircle2, ChevronRight,
  TrendingUp, Share2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'tiktok', name: 'TikTok', icon: MessageCircle, color: 'text-zinc-900', bg: 'bg-zinc-100' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-800', bg: 'bg-blue-50' },
];

const TONES = ['Funny', 'Engaging', 'Professional', 'Minimalist', 'Emotional', 'Urgent'];

export default function CaptionGenerator() {
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('Engaging');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setIsGenerating(true);
    setResults([]);
    
    // Mock API
    await new Promise(r => setTimeout(r, 1800));
    
    setResults([
      "Leveling up my business game one step at a time! 🚀✨ #EntrepriseTunisie #GrowthMindset #StartupLife",
      "They say consistency is key, and we're just getting started. 🔑💼 Who's with us? 🇹🇳 #BusinessGoal #Tunisia #Success",
      "Small wins lead to big victories. Grateful for the journey! 🙏💯 #Grind #Vision #AyechAI"
    ]);
    
    setIsGenerating(false);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Quote className="w-8 h-8 text-pink-500" />
          Social Caption Generator
        </h1>
        <p className="text-zinc-500 text-lg">
          Generate punchy, high-engagement captions for any visual content.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="xl:col-span-5 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-pink-500" /> What is the photo/video about?
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="e.g., A photo of our new team in the office, or a video showing how our product works..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all resize-none text-sm font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-800">Choose Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {PLATFORMS.map(p => {
                     const Icon = p.icon;
                     return (
                       <button
                         key={p.id}
                         type="button"
                         onClick={() => setPlatform(p.id)}
                         className={cn(
                           "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                           platform === p.id ? cn("border-zinc-900 ring-2 ring-zinc-900 ring-offset-2", p.bg, p.color) : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                         )}
                       >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{p.name}</span>
                       </button>
                     )
                   })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Tone</label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-3 rounded-xl border border-zinc-200 focus:border-pink-500 outline-none transition-all text-sm font-bold bg-white"
                    >
                       {TONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4 pt-8">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={includeEmojis}
                            onChange={(e) => setIncludeEmojis(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border-2 border-zinc-200 rounded-lg checked:bg-pink-500 checked:border-pink-500 transition-all cursor-pointer"
                          />
                          <Smile className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors">Include Emojis</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={includeHashtags}
                            onChange={(e) => setIncludeHashtags(e.target.checked)}
                            className="peer appearance-none w-5 h-5 border-2 border-zinc-200 rounded-lg checked:bg-pink-500 checked:border-pink-500 transition-all cursor-pointer"
                          />
                          <Hash className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors">Include Hashtags</span>
                     </label>
                  </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !description}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5 text-pink-400" />}
                {isGenerating ? 'Drafting Variations...' : 'Generate Captions'}
              </button>
           </form>

           <div className="bg-pink-50 border border-pink-100 rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-sm text-pink-700 font-medium leading-relaxed">
                <strong>Viral Tip:</strong> Shorter captions tend to perform 40% better on Instagram Reels. Keep it under 2 lines for maximum impact!
              </p>
           </div>
        </div>

        {/* Right: Results Display */}
        <div className="xl:col-span-7 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
           <AnimatePresence mode="popLayout">
              {results.length > 0 && !isGenerating ? (
                results.map((res, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm group hover:border-pink-200 transition-all flex flex-col relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-100 px-2 py-0.5 rounded bg-zinc-50">Variation {i + 1}</span>
                       <button 
                        onClick={() => handleCopy(res, i)}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                          copiedIdx === i ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-900 hover:text-white border border-zinc-100"
                        )}
                       >
                         {copiedIdx === i ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                         {copiedIdx === i ? 'Copied' : 'Copy Text'}
                       </button>
                    </div>
                    
                    <p className="text-zinc-800 font-semibold leading-relaxed mb-4 text-lg">
                       {res}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                       <div className="flex items-center gap-1.5">
                          <Smile className="w-3.5 h-3.5 text-amber-500" /> High Sentiment
                       </div>
                       <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Shareable
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : isGenerating ? (
                 <div className="h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-zinc-500 animate-pulse uppercase tracking-widest text-xs">AI is writing variations...</p>
                 </div>
              ) : (
                 <div className="h-[400px] bg-zinc-100 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12">
                     <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-300 mb-6">
                        <Share2 className="w-10 h-10" />
                     </div>
                     <h3 className="text-zinc-500 font-bold mb-2">Ready to generate</h3>
                     <p className="text-zinc-400 text-sm">Tell us about your content on the left to get started.</p>
                 </div>
              )}
           </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
