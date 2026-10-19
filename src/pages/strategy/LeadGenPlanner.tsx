import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Sparkles, Gift, Mail, 
  ArrowRight, CheckCircle2, RefreshCcw, Copy, 
  Download, Save, Info, Brain,
  Layout, Target, Rocket, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MAGNET_TYPES = [
  { id: 'ebook', name: 'Free E-Book / Guide', icon: Gift, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'discount', name: 'Discount / Promo Code', icon: Rocket, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'quiz', name: 'Interactive Quiz', icon: Brain, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'webinar', name: 'Mini-Workshop', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export default function LeadGenPlanner() {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('ebook');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsGenerating(true);
    setPlan(null);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2200));
    
    setPlan({
      magnet: {
        title: "The Ultimate Guide to Scaling your SME in Tunisia: 2024 Edition",
        hook: "Discover the 5 hidden tools used by Carthage's most successful entrepreneurs to automate their growth.",
        valueProp: "A 10-page PDF with local case studies and a vendor directory."
      },
      nurturing: [
        { day: "Immediate", subject: "Your Guide is here! 🎁", body: "Asslema! Thanks for downloading the guide. Here's your link [Link]..." },
        { day: "Day 2", subject: "Did you check Page 4?", body: "Page 4 has a secret about local FB ads that most Tunisians miss..." },
        { day: "Day 5", subject: "Ready for the next level?", body: "If you enjoyed the guide, you'll love our personalized strategy call..." }
      ]
    });
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-indigo-500" />
          Lead Gen Planner
        </h1>
        <p className="text-zinc-500 text-lg">
          Design magnets and nurturing flows that turn strangers into customers.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="xl:col-span-5 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">What do you sell / offer?</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Handmade Tunisian jewelry or Digital Marketing services..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium leading-relaxed"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Choose Magnet Type</label>
                    <div className="grid grid-cols-2 gap-3">
                       {MAGNET_TYPES.map(mt => {
                         const Icon = mt.icon;
                         return (
                           <button
                             key={mt.id}
                             type="button"
                             onClick={() => setType(mt.id)}
                             className={cn(
                               "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center group",
                               type === mt.id ? "border-indigo-600 bg-indigo-50 shadow-md" : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                             )}
                           >
                              <Icon className={cn("w-6 h-6 mb-2 transition-transform group-hover:scale-110", type === mt.id ? mt.color : "text-zinc-300")} />
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", type === mt.id ? "text-indigo-900" : "text-zinc-400")}>{mt.name}</span>
                           </button>
                         )
                       })}
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !topic}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
                {isGenerating ? 'Architecting Funnel...' : 'Plan My Lead Machine'}
              </button>
           </form>

           <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                 <Rocket className="w-5 h-5" />
              </div>
              <p className="text-xs text-amber-800 font-bold leading-relaxed">
                <strong>Conversion Fact:</strong> Simple 'Free Shipping' magnets have a 5x lower customer acquisition cost than 'Shop Now' ads.
              </p>
           </div>
        </div>

        {/* Right: Plan Display */}
        <div className="xl:col-span-7 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
           <AnimatePresence mode="wait">
             {plan && !isGenerating ? (
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-6"
               >
                 {/* Magnet Detail Card */}
                 <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden border-b-8 border-b-indigo-600">
                    <div className="p-6 border-b border-zinc-100 bg-indigo-50/50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Gift className="w-6 h-6 text-indigo-600" />
                          <h3 className="font-black text-zinc-900 text-sm uppercase italic">Your Lead Magnet Ideas</h3>
                       </div>
                       <div className="flex gap-2">
                          <button className="p-2 text-zinc-400 hover:text-zinc-600"><Copy className="w-4 h-4" /></button>
                          <button className="p-2 text-zinc-400 hover:text-zinc-600"><Save className="w-4 h-4" /></button>
                       </div>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                        <div>
                           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-2 font-serif">Viral Title</span>
                           <h2 className="text-xl font-black text-zinc-900 italic">"{plan.magnet.title}"</h2>
                        </div>
                        <div className="bg-zinc-50 border border-indigo-100 p-6 rounded-3xl relative">
                           <span className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-zinc-400 border border-zinc-100 rounded">The Hook</span>
                           <p className="text-sm font-bold text-zinc-700 leading-relaxed italic">"{plan.magnet.hook}"</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black text-zinc-400 uppercase tracking-widest">
                           <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> High Perceived Value</div>
                           <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Low Friction</div>
                        </div>
                    </div>
                 </div>

                 {/* Nurturing Sequence */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 pl-4">
                       <Mail className="w-4 h-4" /> Nurturing sequence (Email/WhatsApp)
                    </h3>
                    {plan.nurturing.map((seq: any, i: number) => (
                      <div key={i} className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm group hover:border-indigo-300 transition-all flex gap-4">
                         <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-zinc-100 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <span className="text-[10px] opacity-60 uppercase">{seq.day.split(' ')[0]}</span>
                            <span className="text-lg leading-none">{seq.day.split(' ')[1] || '0'}</span>
                         </div>
                         <div className="flex-1 space-y-2">
                            <h4 className="text-sm font-black text-zinc-900">{seq.subject}</h4>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">"{seq.body}"</p>
                            <div className="flex justify-end pt-2">
                               <button className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Customize Copy</button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               </motion.div>
             ) : isGenerating ? (
                <div className="h-[600px] flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-8 shadow-2xl shadow-indigo-100"></div>
                   <h3 className="text-2xl font-black text-zinc-900 mb-2">Analyzing Buyer Psych</h3>
                   <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-xs">Awaiting conversion blueprint...</p>
                </div>
             ) : (
                <div className="h-full min-h-[600px] bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-indigo-200 transition-colors shadow-inner relative overflow-hidden">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                       <Users className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <h3 className="text-zinc-500 font-bold text-lg mb-2 italic">Awaiting leads configuration</h3>
                    <p className="text-zinc-400 text-sm max-w-sm">Define your product and lead magnet type to generate a high-converting acquisition plan.</p>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
