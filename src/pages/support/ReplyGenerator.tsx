import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Sparkles, Send, Copy, 
  RotateCcw, CheckCircle2, Languages, Smile,
  Mail, MessageCircle, AlertCircle, Info,
  ExternalLink, ArrowRight, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = [
  { id: 'empathetic', name: 'Empathetic', icon: Smile, color: 'text-pink-500' },
  { id: 'professional', name: 'Professional', icon: User, color: 'text-indigo-500' },
  { id: 'urgent', name: 'Short & Fast', icon: Sparkles, color: 'text-amber-500' },
];

const LANGUAGES = ['English', 'French', 'Arabic (Tunisian)'];

export default function ReplyGenerator() {
  const [customerMessage, setCustomerMessage] = useState('');
  const [tone, setTone] = useState('empathetic');
  const [language, setLanguage] = useState('English');
  const [context, setContext] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage) return;

    setIsGenerating(true);
    setGeneratedReply(null);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2000));
    
    const mockReplies: Record<string, string> = {
      'English': "Hi there! Thank you so much for reaching out. I completely understand your concern regarding the delivery delay. I've personally checked your order and it's currently with our local courier in Tunis. You should receive it by tomorrow afternoon. We really appreciate your patience!",
      'French': "Bonjour ! Merci de nous avoir contactés. Je comprends parfaitement votre préoccupation concernant le délai de livraison. J'ai vérifié votre commande et elle est actuellement chez notre transporteur à Tunis. Vous devriez la recevoir demain après-midi. Nous apprécions votre patience !",
      'Arabic (Tunisian)': "Asslema! Ya3tik essa7a elli kalamtna. Nefhmek belbehi 3ala t5ir el livraison. Thabet f commande mte3ek w tawwa l9itha 3and el transporteur f tounes. Enchallah tousselek ghadwa l3achiya. Yar7em waldik 3ala l'essbar mte3ek!"
    };

    setGeneratedReply(mockReplies[language] || mockReplies['English']);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
      setIsCopied(true);
      setTimeout(() => setIsCopied(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-blue-500" />
          AI Reply Generator
        </h1>
        <p className="text-zinc-500 text-lg">
          Craft the perfect response to any customer message in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Panel */}
        <div className="xl:col-span-5 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                   <User className="w-4 h-4 text-zinc-400" /> Customer Message
                </label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Paste the customer's inquiry here..."
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-sm font-medium leading-relaxed bg-zinc-50/30"
                />
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-3">
                    {TONES.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTone(t.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                            tone === t.id ? "border-blue-600 bg-blue-50 shadow-sm" : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                          )}
                        >
                           <Icon className={cn("w-5 h-5 mb-1", tone === t.id ? t.color : "text-zinc-300")} />
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", tone === t.id ? "text-blue-700" : "text-zinc-400")}>{t.name}</span>
                        </button>
                      )
                    })}
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                       <Languages className="w-4 h-4 text-zinc-400" /> Output Language
                    </label>
                    <div className="flex flex-wrap gap-2">
                       {LANGUAGES.map(l => (
                         <button
                           key={l}
                           type="button"
                           onClick={() => setLanguage(l)}
                           className={cn(
                             "px-4 py-2 rounded-xl border text-xs font-bold transition-all",
                             language === l ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                           )}
                         >
                           {l}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2 pt-2">
                    <label className="text-sm font-bold text-zinc-800">Additional Context (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. They are a loyal customer, offer 10% discount..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !customerMessage}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isGenerating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-blue-400" />}
                {isGenerating ? 'Analyzing Sentiment...' : 'Generate AI Reply'}
              </button>
           </form>

           <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                 <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-blue-700 font-bold leading-relaxed">
                Ayech AI automatically detects the sentiment of the message and adjusts the response to be as helpful as possible for the Tunisian market context.
              </p>
           </div>
        </div>

        {/* Right: Output Panel */}
        <div className="xl:col-span-7 space-y-4">
           
           <AnimatePresence mode="wait">
             {generatedReply && !isGenerating ? (
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex flex-col gap-4"
               >
                 <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col min-h-[450px]">
                    <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm", TONES.find(t=>t.id===tone)?.color)}>
                             {React.createElement(TONES.find(t=>t.id===tone)?.icon || Smile, { className: "w-5 h-5" })}
                          </div>
                          <div>
                             <h3 className="font-bold text-zinc-900 text-sm">Suggested {language} Reply</h3>
                             <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{tone} Tone Optimized</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={handleCopy}
                            className={cn(
                              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                              isCopied ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-zinc-900 text-white shadow-lg hover:bg-zinc-800"
                            )}
                          >
                             {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                             {isCopied ? 'Copied!' : 'Copy Reply'}
                          </button>
                       </div>
                    </div>
                    
                    <div className="p-8 flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[#fafafa]/50">
                       <div className="bg-white border border-zinc-100 p-8 rounded-3xl shadow-sm min-h-[250px] relative">
                          {/* Chat Bubble Tail Mock */}
                          <div className="absolute -left-2 top-8 w-4 h-4 bg-white border-l border-t border-zinc-100 rotate-[-45deg]"></div>
                          
                          <p className="text-zinc-800 text-lg font-medium leading-relaxed whitespace-pre-wrap">
                             {generatedReply}
                          </p>
                       </div>
                    </div>

                    <div className="p-4 border-t border-zinc-100 bg-white flex items-center justify-between shrink-0">
                       <div className="flex gap-2">
                          <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Ready</div>
                          <div className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-widest">WhatsApp Compatible</div>
                       </div>
                       <button 
                        onClick={() => setGeneratedReply(null)}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline"
                       >
                         Discard & Start Over
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-emerald-100 transition-colors">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                          <Mail className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Send via Gmail</p>
                          <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-6 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-green-100 transition-colors">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                          <MessageCircle className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-green-800 uppercase tracking-widest mb-1">Open in WhatsApp</p>
                          <ArrowRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                 </div>
               </motion.div>
             ) : isGenerating ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-6 shadow-xl shadow-blue-100"></div>
                   <h3 className="text-xl font-bold text-zinc-900 mb-2 italic">Crafting Response...</h3>
                   <p className="text-zinc-400 uppercase tracking-[0.2em] font-black text-[10px]">Applying {tone} style in {language}</p>
                </div>
             ) : (
                <div className="h-full min-h-[500px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-blue-200 transition-colors">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-inner group-hover:text-blue-50 group-hover:scale-110 transition-all duration-700">
                       <MessageSquare className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <h3 className="text-zinc-500 font-bold text-lg mb-2">Awaiting your input</h3>
                    <p className="text-zinc-400 text-sm max-w-xs">Paste the customer message on the left to generate an effortless reply.</p>
                </div>
             )}
           </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
