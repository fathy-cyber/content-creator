import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, MessageSquare, Play, RotateCcw, 
  Send, Brain, Trophy, AlertTriangle, 
  CheckCircle2, Sparkles, UserCircle2, 
  ChevronRight, Info, Star, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PERSONAS = [
  { id: 'angry', name: 'Karim (Angry)', desc: 'Late shipping, wants a refund NOW.', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'confused', name: 'Khalil (Confused)', desc: 'Needs help tracking an order.', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'technical', name: 'Sonia (Detail-oriented)', desc: 'Asking about specific product materials.', icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

interface Message {
  id: string;
  role: 'customer' | 'user';
  text: string;
  timestamp: Date;
}

export default function ConversationSimulator() {
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startSimulation = () => {
    setIsSimulationActive(true);
    setMessages([
      { 
        id: '1', 
        role: 'customer', 
        text: "Asslema. Billahi n7eb na3ref winou el commande mte3i? 3andha 4 ayem tawwa w mafama 7atta 5bar!", 
        timestamp: new Date() 
      }
    ]);
    setFeedback(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Mock AI Response
    await new Promise(r => setTimeout(r, 1500));
    
    const customerMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'customer',
      text: "Behi, ama rahi 7aja mehou de5la f b3adh'ha. 3lech ma kalmounich? 5allasstha men 9bal!",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, customerMsg]);
    setIsTyping(false);
  };

  const endSimulation = () => {
    setIsSimulationActive(false);
    setFeedback({
      score: 85,
      empathy: "Great job validating his frustration early on.",
      clarity: "You could be more specific about the next steps.",
      stars: 4
    });
  };

  const reset = () => {
    setMessages([]);
    setIsSimulationActive(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 h-[calc(100vh-140px)]">
      
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-1">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            Support Simulator
          </h1>
          <p className="text-zinc-500 font-medium italic">Master the art of Tunisian customer service in a safe sandbox.</p>
        </div>
        {!isSimulationActive && !feedback && (
           <button 
            onClick={startSimulation}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-xl flex items-center gap-2 active:scale-95"
           >
              <Play className="w-5 h-5" /> Start Training
           </button>
        )}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left: Persona Selection / Stats */}
        <div className="xl:col-span-3 space-y-6 flex flex-col min-h-0">
           <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-y-auto shrink-0 transition-opacity duration-300" style={{ opacity: isSimulationActive ? 0.6 : 1 }}>
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                 <UserCircle2 className="w-4 h-4" /> Pick Your Persona
              </h2>
              <div className="space-y-3">
                 {PERSONAS.map(p => (
                   <button
                    key={p.id}
                    disabled={isSimulationActive}
                    onClick={() => setActivePersona(p)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 relative overflow-hidden group",
                      activePersona.id === p.id ? "border-zinc-900 bg-zinc-50 shadow-md" : "border-zinc-100 hover:border-zinc-200"
                    )}
                   >
                      <div className="flex justify-between items-center mb-1">
                         <span className={cn("text-xs font-black uppercase tracking-widest", activePersona.id === p.id ? "text-zinc-900" : "text-zinc-400")}>{p.name}</span>
                         <p.icon className={cn("w-4 h-4", activePersona.id === p.id ? p.color : "text-zinc-300")} />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 leading-tight">{p.desc}</p>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative group shrink-0">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">
                 <Trophy className="w-4 h-4" /> Training Session Goal
              </div>
              <p className="text-sm font-bold leading-relaxed mb-4">
                 Defuse the customer's anger without offering a refund immediately. Focus on empathy.
              </p>
              <div className="h-1 bg-blue-400 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-white" />
              </div>
           </div>
        </div>

        {/* Right: Simulation Area */}
        <div className="xl:col-span-9 flex flex-col gap-4 min-h-0">
           
           <AnimatePresence mode="wait">
             {isSimulationActive ? (
               <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
               >
                  {/* Chat Header */}
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm border border-white">
                           <User className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-sm font-black text-zinc-900">Chatting with {activePersona.name}</div>
                           <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Active Session</span>
                           </div>
                        </div>
                     </div>
                     <button 
                      onClick={endSimulation}
                      className="px-6 py-2 bg-rose-600 text-white text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-rose-700 transition-all shadow-lg active:scale-95"
                     >
                        End Session
                     </button>
                  </div>

                  {/* Messages */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[#fafafa]/30">
                     {messages.map((msg) => (
                       <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                       >
                          <div className={cn(
                            "px-5 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm transition-all relative group",
                            msg.role === 'user' 
                              ? "bg-zinc-900 text-white rounded-tr-none" 
                              : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none"
                          )}>
                             {msg.text}
                             <div className="absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>
                       </motion.div>
                     ))}
                     {isTyping && (
                       <div className="flex items-center gap-2 p-3 bg-white border border-zinc-100 rounded-2xl w-fit shadow-sm">
                          <div className="flex gap-1">
                             <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                             <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{activePersona.name} is typing...</span>
                       </div>
                     )}
                  </div>

                  {/* Input Footer */}
                  <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
                     <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                        <textarea 
                          rows={1}
                          placeholder="Type your response natively (Arabic/French/English)..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handleSendMessage(e as any);
                            }
                          }}
                          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none font-medium h-14 overflow-hidden"
                        />
                        <button 
                          type="submit"
                          disabled={!inputText || isTyping}
                          className="absolute right-2 top-2 w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white hover:bg-zinc-800 transition-all disabled:opacity-30 shadow-lg"
                        >
                           <Send className="w-5 h-5" />
                        </button>
                     </form>
                  </div>
               </motion.div>
             ) : feedback ? (
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl p-12 overflow-y-auto"
               >
                  <div className="max-w-xl mx-auto w-full flex flex-col items-center text-center">
                     <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 mb-8 rotate-3 transition-transform hover:rotate-0">
                        <Trophy className="w-12 h-12" />
                     </div>
                     <h2 className="text-3xl font-black text-zinc-900 mb-2 italic">Training Complete!</h2>
                     <p className="text-zinc-500 font-bold mb-10 leading-relaxed">Here's how you performed with {activePersona.name} today.</p>
                     
                     <div className="grid grid-cols-2 gap-4 w-full mb-10">
                        <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                           <div className="text-4xl font-black text-blue-600 mb-1">{feedback.score}<span className="text-lg opacity-50">%</span></div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mastery Score</div>
                        </div>
                        <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex flex-col items-center justify-center">
                           <div className="flex gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-5 h-5", i < feedback.stars ? "fill-amber-400 text-amber-400" : "text-zinc-200")} />
                              ))}
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Overall Rating</div>
                        </div>
                     </div>

                     <div className="w-full space-y-4 mb-12">
                        <div className="flex gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-left">
                           <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <p className="text-sm font-bold text-emerald-900 leading-relaxed"><strong>Strength:</strong> {feedback.empathy}</p>
                        </div>
                        <div className="flex gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-left">
                           <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Brain className="w-5 h-5" />
                           </div>
                           <p className="text-sm font-bold text-amber-900 leading-relaxed"><strong>Opportunity:</strong> {feedback.clarity}</p>
                        </div>
                     </div>

                     <div className="flex gap-4 w-full">
                        <button 
                         onClick={reset}
                         className="flex-1 py-4 border-2 border-zinc-900 text-zinc-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                        >
                           <RotateCcw className="w-4 h-4" /> Try Again
                        </button>
                        <button className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 group">
                           Next Persona <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </div>
               </motion.div>
             ) : (
               <div className="flex-1 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-blue-300 transition-colors shadow-inner overflow-hidden">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-zinc-200 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                      <Brain className="w-10 h-10 stroke-[1.5]" />
                   </div>
                   <h2 className="text-2xl font-black text-zinc-600 mb-2 italic">Ready for Training Session?</h2>
                   <p className="text-zinc-400 text-sm max-w-sm mb-10 leading-relaxed font-medium">
                      Select a persona on the left and hit the start button to begin your real-world support simulation.
                   </p>
                   <div className="flex items-center gap-8 text-zinc-200 grayscale opacity-40">
                      <Sparkles className="w-12 h-12" />
                      <Trophy className="w-16 h-16" />
                      <MessageSquare className="w-12 h-12" />
                   </div>
               </div>
             )}
           </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
