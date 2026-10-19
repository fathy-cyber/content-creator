import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CoreChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Ayech, your Tunisian business advisor. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      const responses = [
        "Based on current Tunisian tax regulations, you might be eligible for a reduction if you hire new graduates.",
        "I recommend focusing on the local market in Sfax first before expanding to Tunis.",
        "Your profit margins look healthy, but we should optimize your supply chain costs.",
        "I can help you draft a business plan for a BFPME loan application."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <div className="font-bold text-zinc-900">Ask Ayech</div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              AI Active
            </div>
          </div>
        </div>
        <div className="text-xs text-zinc-400 font-mono">v1.0.0-core</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-4 max-w-[85%]",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center",
              msg.role === 'assistant' ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
            )}>
              {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'assistant' ? "bg-zinc-50 text-zinc-900 rounded-tl-none" : "bg-emerald-600 text-white rounded-tr-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-zinc-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your business..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-center text-zinc-400 flex items-center justify-center gap-1">
          <Sparkles size={10} />
          Powered by Ayech AI Intelligence
        </div>
      </div>
    </div>
  );
}
