import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Sparkles, HeartHandshake, ShieldCheck, 
  RotateCcw, CheckCircle2, MessageSquare, AlertCircle, 
  Info, ExternalLink, ArrowRight, UserX, UserCheck,
  Gift, Percent, Wallet, Download, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SEVERITY_LEVELS = [
  { id: 'low', name: 'Minor', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { id: 'medium', name: 'Serious', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { id: 'high', name: 'Critical', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
];

export default function ComplaintResolver() {
  const [complaint, setComplaint] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [desiredOutcome, setDesiredOutcome] = useState('Refund');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resolution, setResolution] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setIsGenerating(true);
    setResolution(null);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2500));
    
    setResolution({
      sentiment: "Highly Frustrated / Urgent",
      keyIssue: "Defective product received & Poor initial communication",
      response: "Asslema [Customer Name], I am truly sorry for the frustrating experience you've had with your recent order. This is not the standard we strive for at [Business Name]. We've reviewed your case and want to make this right immediately.",
      actions: [
        "Full refund processed to your original payment method.",
        "A 20% discount code [SORRY20] for your next purchase.",
        "Free replacement sent via express courier (Aramex/Lux) arriving by Thursday."
      ],
      compensation: "Full Refund + 20% Loyalty Discount"
    });
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
          Complaint Resolver
        </h1>
        <p className="text-zinc-500 text-lg">
          Turn negative feedback into loyal advocates with AI-powered recovery strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Panel */}
        <div className="xl:col-span-5 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                   <UserX className="w-4 h-4 text-zinc-400" /> What is the complaint?
                </label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Paste the angry message or describe the issue here..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none text-sm font-medium leading-relaxed bg-zinc-50/30"
                />
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Severity Level</label>
                    <div className="grid grid-cols-3 gap-3">
                       {SEVERITY_LEVELS.map(lvl => (
                         <button
                           key={lvl.id}
                           type="button"
                           onClick={() => setSeverity(lvl.id)}
                           className={cn(
                             "py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                             severity === lvl.id ? cn("ring-2 ring-offset-2", lvl.bg, lvl.color, "border-transparent ring-zinc-900 shadow-sm") : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                           )}
                         >
                           {lvl.name}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Proposed Compensation</label>
                    <select 
                      value={desiredOutcome}
                      onChange={(e) => setDesiredOutcome(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-rose-500 outline-none transition-all text-sm font-bold bg-white"
                    >
                       <option>Full Refund</option>
                       <option>Partial Refund</option>
                       <option>Replacement</option>
                       <option>Store Credit</option>
                       <option>Apology Only</option>
                    </select>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !complaint}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-rose-400" />}
                {isGenerating ? 'Defusing Situation...' : 'Generate Resolution Strategy'}
              </button>
           </form>

           <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                 <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-rose-800 font-bold leading-relaxed italic">
                <strong>Empathy First:</strong> Our AI ensures that the first sentence always validates the customer's feeling to de-escalate the tension immediately.
              </p>
           </div>
        </div>

        {/* Right: Resolution Roadmap */}
        <div className="xl:col-span-7 space-y-4">
           
           <AnimatePresence mode="wait">
             {resolution && !isGenerating ? (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col gap-6"
               >
                 <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-b-8 border-b-rose-600">
                    <div className="p-6 border-b border-zinc-100 bg-rose-50/50 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center shadow-sm text-rose-500">
                             <HeartHandshake className="w-6 h-6" />
                          </div>
                          <div>
                             <h3 className="font-black text-zinc-900 text-sm uppercase tracking-tight">Recovery Roadmap</h3>
                             <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest italic">High Empathy Approved</p>
                          </div>
                       </div>
                       <button className="p-3 bg-white border border-zinc-100 rounded-2xl text-zinc-400 hover:text-zinc-600 shadow-sm transition-all">
                          <Download className="w-5 h-5" />
                       </button>
                    </div>
                    
                    <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Customer Sentiment</span>
                              <p className="text-sm font-bold text-rose-700">{resolution.sentiment}</p>
                           </div>
                           <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Primary Grievance</span>
                              <p className="text-sm font-bold text-zinc-800 truncate">{resolution.keyIssue}</p>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                             <MessageSquare className="w-4 h-4" /> Recommended Response
                           </h4>
                           <div className="bg-white border-2 border-zinc-100 p-6 rounded-3xl relative shadow-sm italic text-zinc-700 font-semibold leading-relaxed">
                              "{resolution.response}"
                              <button 
                                onClick={() => navigator.clipboard.writeText(resolution.response)}
                                className="absolute top-2 right-2 p-2 hover:bg-zinc-50 rounded-lg text-zinc-300 hover:text-rose-500 transition-colors"
                              >
                                 <Copy className="w-4 h-4" />
                              </button>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck className="w-4 h-4" /> Final Resolution Plan
                           </h4>
                           <div className="space-y-2">
                              {resolution.actions.map((act: string, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl group transition-all hover:bg-white hover:shadow-md">
                                   <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                      {i + 1}
                                   </div>
                                   <span className="text-sm font-bold text-zinc-700">{act}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Resolution Strength: 9.8/10</span>
                       </div>
                       <button className="bg-rose-600 text-white text-xs font-black uppercase tracking-[0.2em] py-2 px-6 rounded-xl shadow-lg hover:bg-rose-700 active:scale-95 transition-all">
                          Finalize Recovery
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-zinc-200 p-4 rounded-3xl flex flex-col items-center text-center group cursor-pointer hover:border-emerald-200 transition-all">
                       <Wallet className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-all" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Refund</span>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-3xl flex flex-col items-center text-center group cursor-pointer hover:border-amber-200 transition-all">
                       <Percent className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-all" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Discount</span>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-3xl flex flex-col items-center text-center group cursor-pointer hover:border-indigo-200 transition-all">
                       <Gift className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition-all" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Gift</span>
                    </div>
                 </div>
               </motion.div>
             ) : isGenerating ? (
                <div className="h-[600px] flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 border-[6px] border-rose-500/10 border-t-rose-500 rounded-full animate-spin mb-8 shadow-2xl shadow-rose-100/50"></div>
                   <h3 className="text-2xl font-black text-zinc-900 mb-2">Analyzing Sentiment</h3>
                   <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse italic">Defusing with empathy...</p>
                </div>
             ) : (
                <div className="h-full min-h-[600px] bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-rose-200 transition-colors shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 via-rose-50/30 to-rose-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-sm group-hover:text-rose-50 group-hover:scale-110 transition-all duration-700 relative z-10">
                       <UserCheck className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <h3 className="text-zinc-500 font-bold text-lg mb-2 italic relative z-10">Waiting for a complaint</h3>
                    <p className="text-zinc-400 text-sm max-w-xs relative z-10">Paste the customer's message on the left to get a professional resolution strategy.</p>
                </div>
             )}
           </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
