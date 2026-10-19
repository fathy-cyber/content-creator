import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, Mail, Smartphone, MessageSquare, 
  ShieldCheck, Sparkles, TrendingUp, Info,
  CheckCircle2, RefreshCcw, Save, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NOTIFICATION_GROUPS = [
  {
    title: 'Business Alerts',
    desc: 'Get notified about your growth and funnel performance.',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    items: [
      { id: 'weekly_report', label: 'Weekly Growth Digest', desc: 'Summary of your traffic and conversions.' },
      { id: 'milestone_reached', label: 'Milestone Alerts', desc: 'When you hit a new sales or lead goal.' }
    ]
  },
  {
    title: 'AI & Content',
    desc: 'Updates on your automation and content generation.',
    icon: Sparkles,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    items: [
      { id: 'gen_complete', label: 'Generation Finished', desc: 'When long scripts or blog posts are ready.' },
      { id: 'ai_tips', label: 'Strategic AI Tips', desc: 'Daily advice to optimize your business.' }
    ]
  },
  {
    title: 'Account & Security',
    desc: 'Stay safe and keep your profile up to date.',
    icon: ShieldCheck,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    items: [
      { id: 'security_login', label: 'New Login Alert', desc: 'When someone logs into your account.' },
      { id: 'billing_updates', label: 'Billing & Invoices', desc: 'Subscription and payment receipts.' }
    ]
  }
];

export default function Notifications() {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    weekly_report: true,
    gen_complete: true,
    security_login: true,
    billing_updates: true
  });

  const togglePreference = (id: string) => {
    setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
        <h1 className="text-3xl font-extrabold text-zinc-900 italic font-serif">Notifications</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Stay in the loop without the noise. Choose your preferred channels.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Main Settings */}
        <div className="xl:col-span-8 space-y-8">
           <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm space-y-12">
              
              {/* Channel Icons */}
              <div className="flex flex-wrap gap-4 pb-12 border-b border-zinc-100">
                 {[
                   { label: 'Push', icon: Bell, active: true },
                   { label: 'Email', icon: Mail, active: true },
                   { label: 'WhatsApp', icon: MessageSquare, active: false }
                 ].map(ch => (
                   <div key={ch.label} className={cn(
                     "flex-1 min-w-[120px] p-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all",
                     ch.active ? "bg-zinc-900 border-zinc-900 text-white shadow-xl" : "bg-zinc-50 border-zinc-100 text-zinc-300"
                   )}>
                      <ch.icon className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{ch.label}</span>
                   </div>
                 ))}
              </div>

              <div className="space-y-12">
                 {NOTIFICATION_GROUPS.map(group => {
                   const Icon = group.icon;
                   return (
                     <div key={group.title} className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", group.bg, group.color)}>
                              <Icon className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="text-lg font-black text-zinc-900 uppercase italic leading-none mb-1">{group.title}</h3>
                              <p className="text-[10px] font-bold text-zinc-400">{group.desc}</p>
                           </div>
                        </div>

                        <div className="space-y-4 pl-16">
                           {group.items.map(item => (
                             <div key={item.id} className="flex items-center justify-between group">
                                <div className="space-y-1">
                                   <label className="text-sm font-black text-zinc-800 cursor-pointer" onClick={() => togglePreference(item.id)}>{item.label}</label>
                                   <p className="text-[10px] font-bold text-zinc-400 leading-none">{item.desc}</p>
                                </div>
                                <div 
                                  onClick={() => togglePreference(item.id)}
                                  className={cn(
                                    "w-14 h-7 rounded-full transition-all cursor-pointer p-1 relative",
                                    preferences[item.id] ? "bg-zinc-900" : "bg-zinc-200"
                                  )}
                                >
                                   <motion.div 
                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                    animate={{ x: preferences[item.id] ? 28 : 0 }}
                                   />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )
                 })}
              </div>

              <div className="flex justify-end pt-6">
                 <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                 >
                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Updating Prefs...' : 'Save Preferences'}
                 </button>
              </div>
           </form>
        </div>

        {/* Right: Insights */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 italic">
                 <Zap className="w-5 h-5 text-amber-300" /> WhatsApp Direct
              </h3>
              <p className="text-xs font-bold text-indigo-100 leading-relaxed mb-6 opacity-90">
                 Enterprise accounts get real-time **WhatsApp** alerts for every new lead generated. Don't let your prospects get cold.
              </p>
              <button className="w-full py-4 bg-white text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
                 Upgrade to Enterprise
              </button>
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-zinc-400 font-bold leading-relaxed italic">
                Setting your notifications to 'Daily Digest' instead of 'Real-time' can improve your personal productivity by 25%.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
