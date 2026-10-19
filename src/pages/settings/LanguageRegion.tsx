import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Languages, Globe, MapPin, CheckCircle2, 
  RefreshCcw, Save, Info, Sparkles,
  ChevronRight, Calendar, Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { id: 'ar_TN', name: 'Tunisian Arabic', native: 'درجة تونسية', flag: '🇹🇳', desc: 'Recommended for local business and natural AI chat.' },
  { id: 'fr_FR', name: 'French', native: 'Français', flag: '🇫🇷', desc: 'Used for professional administration and documentation.' },
  { id: 'en_US', name: 'English', native: 'English', flag: '🇺🇸', desc: 'Global standard for tech and international trade.' },
];

export default function LanguageRegion() {
  const [isSaving, setIsSaving] = useState(false);
  const [appLanguage, setAppLanguage] = useState('ar_TN');
  const [genLanguage, setGenLanguage] = useState('ar_TN');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 italic font-serif">Language & Region</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Customize how Ayech AI speaks to you and your customers.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Language Selection */}
        <div className="xl:col-span-8 space-y-8">
           <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
              
              {/* App Language */}
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 italic flex items-center gap-2">
                       <Languages className="w-6 h-6 text-indigo-500" /> Interface Language
                    </h3>
                    <p className="text-xs font-bold text-zinc-400">Specify the language used for the Ayech AI dashboard.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setAppLanguage(lang.id)}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-2 group",
                          appLanguage === lang.id ? "bg-zinc-900 border-zinc-900 text-white shadow-xl" : "bg-white border-zinc-100 hover:border-zinc-300"
                        )}
                      >
                         <span className="text-3xl mb-1 group-hover:scale-125 transition-transform duration-500">{lang.flag}</span>
                         <h4 className={cn("text-xs font-black uppercase tracking-tight", appLanguage === lang.id ? "text-white" : "text-zinc-900")}>{lang.name}</h4>
                         <p className={cn("text-[10px] font-medium leading-tight opacity-60", appLanguage === lang.id ? "text-zinc-400" : "text-zinc-400")}>{lang.native}</p>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="h-px bg-zinc-100" />

              {/* Generation Language */}
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 italic flex items-center gap-2">
                       <Sparkles className="w-6 h-6 text-amber-500" /> Default AI Output Language
                    </h3>
                    <p className="text-xs font-bold text-zinc-400">Ayech AI will prioritize this language when generating captions, scripts, and replies.</p>
                 </div>
                 <div className="space-y-3">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setGenLanguage(lang.id)}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left group",
                          genLanguage === lang.id ? "bg-indigo-50 border-indigo-500 shadow-sm" : "bg-white border-zinc-100 hover:border-zinc-200"
                        )}
                      >
                         <div className="flex items-center gap-4">
                            <span className="text-2xl">{lang.flag}</span>
                            <div>
                               <h4 className="text-sm font-black text-zinc-900">{lang.name}</h4>
                               <p className="text-[10px] font-bold text-zinc-400">{lang.desc}</p>
                            </div>
                         </div>
                         <div className={cn(
                           "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                           genLanguage === lang.id ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-200"
                         )}>
                            {genLanguage === lang.id && <CheckCircle2 className="w-4 h-4" />}
                         </div>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end pt-6">
                 <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                 >
                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Updating Locale...' : 'Apply Localization'}
                 </button>
              </div>
           </form>
        </div>

        {/* Right: Regional Details */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm space-y-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                 <Globe className="w-4 h-4 text-zinc-400" /> Regional Formats
              </h3>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Coins className="w-3 h-3" /> Currency
                    </label>
                    <select className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm appearance-none">
                       <option>Tunisian Dinar (TND)</option>
                       <option>Euro (EUR)</option>
                       <option>US Dollar (USD)</option>
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> Date Format
                    </label>
                    <select className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm appearance-none">
                       <option>DD/MM/YYYY</option>
                       <option>MM/DD/YYYY</option>
                       <option>YYYY-MM-DD</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="bg-amber-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 italic">
                 <Info className="w-5 h-5 text-white" /> Native Advantage
              </h3>
              <p className="text-xs font-bold text-amber-50 leading-relaxed mb-6 opacity-90">
                 Setting your language to **Tunisian Arabic** enables Ayech AI to use local slang, cultural references, and "Tunisianisms" that build deeper trust with your customers.
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60">
                 Market Trust: +40% Increase
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
