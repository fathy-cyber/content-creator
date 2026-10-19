import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Play, Sparkles, Layout, 
  Smartphone, Monitor, RefreshCcw, Copy, 
  Download, FileText, CheckCircle2, 
  Layers, Volume2, Eye, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const VIDEO_TYPES = [
  { id: 'reel', name: 'Instagram Reel', icon: Smartphone, color: 'text-pink-600' },
  { id: 'tiktok', name: 'TikTok', icon: Smartphone, color: 'text-zinc-900' },
  { id: 'youtube', name: 'YT Shorts', icon: Monitor, color: 'text-red-600' },
  { id: 'ad', name: 'Sponspored Ad', icon: Video, color: 'text-indigo-600' },
];

export default function VideoScript() {
  const [type, setType] = useState('reel');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('30s');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<any[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsGenerating(true);
    setScript([]);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2200));
    
    setScript([
      { scene: 1, visual: "Close-up of a laptop screen with Ayech AI logo. Background is a cozy cafe in Tunis.", audio: "Hook: Ever feel like your business is stuck in the 90s?", duration: "3s" },
      { scene: 2, visual: "Cut to a person looking stressed, then smiling as they use the AI tools.", audio: "Body: Managing an SME doesn't have to be a headache. See how we automate everything from ads to emails.", duration: "12s" },
      { scene: 3, visual: "Text overlay showing '24/7 Automation' with moving icons.", audio: "Transition: From strategy to execution, we've got you covered.", duration: "7s" },
      { scene: 4, visual: "Call to Action screen with website URL and a big 'Get Started' button.", audio: "CTA: Start your free trial today at Ayech.ai and let's scale together!", duration: "8s" }
    ]);
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center justify-center md:justify-start gap-3 mb-2">
          <Video className="w-8 h-8 text-red-500" />
          Video Script Generator
        </h1>
        <p className="text-zinc-500 text-lg mx-auto md:mx-0 max-w-2xl">
          Turn your ideas into high-converting video scripts for TikTok, Reels, and ads with scene-by-scene AI guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="xl:col-span-4 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-800">Select Format</label>
                <div className="grid grid-cols-2 gap-3">
                   {VIDEO_TYPES.map(vt => {
                     const Icon = vt.icon;
                     return (
                       <button
                         key={vt.id}
                         type="button"
                         onClick={() => setType(vt.id)}
                         className={cn(
                           "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                           type === vt.id ? "border-zinc-900 bg-zinc-50 font-bold" : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                         )}
                       >
                          <Icon className={cn("w-4 h-4", type === vt.id ? vt.color : "text-zinc-300")} />
                          <span className="text-xs uppercase tracking-wider">{vt.name}</span>
                       </button>
                     )
                   })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-red-500" /> What's the video about?
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="e.g., A tutorial on how to use our platform or a 30s ad for a new skincare product..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800">Target Duration</label>
                <div className="flex gap-2">
                   {['15s', '30s', '60s', 'Custom'].map(d => (
                     <button
                       key={d}
                       type="button"
                       onClick={() => setDuration(d)}
                       className={cn(
                         "flex-1 py-2 rounded-xl border text-xs font-bold transition-all",
                         duration === d ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                       )}
                     >
                        {d}
                     </button>
                   ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !topic}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 text-red-400" />}
                {isGenerating ? 'Analyzing Hook...' : 'Generate Script'}
              </button>
           </form>

           <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-sm text-red-700 font-medium leading-relaxed">
                <strong>Pro Tip:</strong> The first 3 seconds are critical. Use high-contrast visuals and direct-address audio for the hook.
              </p>
           </div>
        </div>

        {/* Right: Results Display */}
        <div className="xl:col-span-8 space-y-4">
           
           <AnimatePresence mode="wait">
             {script.length > 0 && !isGenerating ? (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col gap-4"
               >
                 <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden border-b-4 border-b-zinc-900">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                       <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Run Time: ~{duration}</span>
                       <div className="flex gap-2">
                          <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Copy className="w-4 h-4" /></button>
                          <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Download className="w-4 h-4" /></button>
                       </div>
                    </div>

                    <div className="overflow-x-auto">
                       <table className="w-full border-collapse">
                          <thead className="bg-zinc-100/50">
                             <tr>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-500 w-16">#</th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-500 w-1/3">
                                   <div className="flex items-center gap-2 italic"><Layers className="w-3 h-3" /> Visual / Action</div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-zinc-500">
                                   <div className="flex items-center gap-2 italic"><Volume2 className="w-3 h-3" /> Audio / Dialogue</div>
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-zinc-500 w-24">Dur</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                             {script.map((scene, i) => (
                               <tr key={i} className="group hover:bg-zinc-50/50 transition-colors">
                                  <td className="px-6 py-8 font-black text-zinc-300 text-lg align-top">{scene.scene}</td>
                                  <td className="px-6 py-8 align-top">
                                     <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-600 group-hover:bg-white group-hover:border-red-100 transition-all">
                                        {scene.visual}
                                     </div>
                                  </td>
                                  <td className="px-6 py-8 align-top">
                                     <p className="text-sm font-semibold text-zinc-800 leading-relaxed whitespace-pre-wrap">
                                        {scene.audio}
                                     </p>
                                  </td>
                                  <td className="px-6 py-8 text-center align-top">
                                     <span className="text-[10px] font-black bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full">{scene.duration}</span>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
                 
                 <div className="flex justify-end gap-3">
                    <button className="px-6 py-3 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-2xl hover:bg-zinc-50 transition-all shadow-sm">
                       Save as Draft
                    </button>
                    <button className="px-8 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center gap-2">
                       <FileText className="w-5 h-5" /> Export PDF
                    </button>
                 </div>
               </motion.div>
             ) : isGenerating ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin mb-6 shadow-xl shadow-red-100"></div>
                   <h3 className="text-xl font-bold text-zinc-900 mb-2">Director's Mode</h3>
                   <p className="text-zinc-500 animate-pulse uppercase tracking-[0.2em] font-black text-[10px]">Blocking scenes and timing dialogue...</p>
                </div>
             ) : (
                <div className="h-[500px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-red-200 transition-colors">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-inner group-hover:text-red-50 group-hover:scale-110 transition-all duration-700">
                       <Video className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <h3 className="text-zinc-500 font-bold text-lg mb-2">Ready for Action</h3>
                    <p className="text-zinc-400 text-sm max-w-sm">Every viral video starts with a great script. Complete the form to generate yours.</p>
                </div>
             )}
           </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
