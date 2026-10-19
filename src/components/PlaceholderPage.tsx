import React from 'react';
import { motion } from 'motion/react';
import { Construction, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  section?: string;
}

export default function PlaceholderPage({ title, description, section }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-8 shadow-sm border border-emerald-100">
          <Construction className="w-10 h-10" />
        </div>
        
        {section && (
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2 block">
            {section}
          </span>
        )}
        
        <h1 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
          {title}
        </h1>
        
        <p className="text-zinc-500 mb-10 leading-relaxed">
          {description || "We are currently building this module to bring you the best AI-powered business experience. Stay tuned for the full release!"}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 font-semibold transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold transition-all shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4" />
            Ask Ayech for help
          </button>
        </div>
      </motion.div>

      {/* Background Decorators */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] -z-10 opacity-40 pointer-events-none" />
    </div>
  );
}
