import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, Sparkles, Plus, Trash2, 
  ChevronDown, Copy, Download, Save,
  CheckCircle2, Info, Search, Layout,
  RefreshCcw, ArrowRight, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_FAQS = [
  { question: "What are your delivery times in Tunis?", answer: "We typically deliver within 24-48 hours for Greater Tunis and 3-5 days for other governorates." },
  { question: "Do you offer cash on delivery?", answer: "Yes, we support Cash on Delivery (COD) across all of Tunisia." },
];

export default function FaqBuilder() {
  const [businessType, setBusinessType] = useState('');
  const [recentQuestions, setRecentQuestions] = useState('');
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2000));
    
    const newFaqs = [
      { question: "What is your refund policy?", answer: "You can return any product within 7 days of receipt as long as it's in its original packaging. We'll process your refund within 3 business days." },
      { question: "Are your products locally sourced?", answer: "We take pride in supporting Tunisian artisans. Over 80% of our catalog is sourced from local producers in Nabeul, Sfax, and Kasserine." },
      { question: "How can I track my order?", answer: "Once your order is shipped, you'll receive a tracking link via SMS and email. You can also track it directly on our website using your order ID." }
    ];

    setFaqs([...faqs, ...newFaqs]);
    setIsGenerating(false);
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-indigo-500" />
          Dynamic FAQ Builder
        </h1>
        <p className="text-zinc-500 text-lg">
          Automatically generate a comprehensive FAQ for your business based on AI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="xl:col-span-4 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Business Type / Industry</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. E-commerce clothing, Tech SaaS..."
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-zinc-400" /> Recent Customer Questions
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Paste real questions you've received recently to help the AI learn your context..."
                      value={recentQuestions}
                      onChange={(e) => setRecentQuestions(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-indigo-500 outline-none transition-all resize-none text-sm font-medium"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !businessType}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
                {isGenerating ? 'Analyzing Patterns...' : 'Generate Smart FAQ'}
              </button>
           </form>

           <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-xs text-indigo-700 font-bold leading-relaxed">
                <strong>SEO Hint:</strong> A well-structured FAQ can help your business rank higher on Google search results in Tunisia. Use clear, direct answers!
              </p>
           </div>
        </div>

        {/* Right: FAQ Results */}
        <div className="xl:col-span-8 flex flex-col gap-4">
           
           <div className="flex items-center justify-between px-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                 <Layout className="w-5 h-5 text-zinc-400" />
                 <h2 className="font-bold text-zinc-900">Your Generated FAQ <span className="text-xs font-black text-indigo-500 ml-2">({faqs.length})</span></h2>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Copy className="w-4 h-4" /></button>
                 <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Download className="w-4 h-4" /></button>
              </div>
           </div>

           <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                 {faqs.map((faq, i) => (
                   <motion.div
                     key={i}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className={cn(
                       "bg-white border rounded-3xl transition-all overflow-hidden",
                       expandedIdx === i ? "border-indigo-500 shadow-lg ring-1 ring-indigo-500" : "border-zinc-200 shadow-sm hover:border-zinc-300"
                     )}
                   >
                      <div 
                       onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                       className="p-5 flex items-center justify-between cursor-pointer group"
                      >
                         <h3 className={cn("font-bold transition-colors text-sm md:text-base", expandedIdx === i ? "text-indigo-700" : "text-zinc-900 group-hover:text-indigo-600")}>
                            {faq.question}
                         </h3>
                         <div className="flex items-center gap-3">
                            {expandedIdx !== i && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFaq(i); }}
                                className="p-1.5 text-zinc-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform duration-300", expandedIdx === i && "rotate-180 text-indigo-500")} />
                         </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedIdx === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-zinc-50/50 border-t border-zinc-100"
                          >
                             <div className="p-6 text-zinc-600 text-sm leading-relaxed font-medium">
                                {faq.answer}
                                <div className="mt-4 flex justify-end gap-2">
                                   <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 p-1">Edit Answer</button>
                                   <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 p-1">Regenerate</button>
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </motion.div>
                 ))}
              </AnimatePresence>
              
              <button 
                onClick={() => setFaqs([{ question: "New Question?", answer: "New Answer Content..." }, ...faqs])}
                className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-3xl text-zinc-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-500 transition-all bg-white hover:bg-zinc-50"
              >
                 <Plus className="w-5 h-5" /> Add Custom FAQ
              </button>
           </div>

           <div className="mt-4 flex justify-end gap-3">
              <button className="px-8 py-3 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                 <Save className="w-5 h-5" /> Save to Website
              </button>
           </div>
        </div>
      </div>

    </div>
  );
}
