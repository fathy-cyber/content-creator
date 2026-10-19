import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, ShieldAlert, Lock, Trash2, 
  Download, Eye, Globe, Info, Sparkles,
  Search, CheckCircle2, RefreshCcw, Save,
  Zap, Smartphone, History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SESSIONS = [
  { device: 'MacBook Pro', location: 'Tunis, Tunisia', time: 'Active now', icon: Globe },
  { device: 'iPhone 15', location: 'Sousse, Tunisia', time: '2 hours ago', icon: Smartphone },
  { device: 'Brave Browser', location: 'Tunis, Tunisia', time: 'Yesterday', icon: Search },
];

export default function PrivacySecurity() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 italic font-serif">Privacy & Security</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Protect your digital empire. Manage data access and security protocols.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Main Settings */}
        <div className="xl:col-span-8 space-y-8">
           
           {/* Data Management Section */}
           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 italic flex items-center gap-2">
                       <ShieldCheck className="w-6 h-6 text-indigo-500" /> Data Sovereignty
                    </h3>
                    <p className="text-xs font-bold text-zinc-400">You own your data. We just provide the tools to optimize it.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex flex-col items-start gap-4 group hover:bg-zinc-900 hover:text-white transition-all">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 shadow-sm">
                          <Download className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <h4 className="text-sm font-black uppercase tracking-tight">Export My Data</h4>
                          <p className="text-[10px] font-bold opacity-60">Get a JSON file of all your campaigns, scripts, and logs.</p>
                       </div>
                    </button>
                    <button className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex flex-col items-start gap-4 group hover:bg-rose-600 hover:text-white transition-all">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-400 group-hover:text-rose-600 shadow-sm">
                          <Trash2 className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <h4 className="text-sm font-black uppercase tracking-tight">Delete Account</h4>
                          <p className="text-[10px] font-bold opacity-60 text-rose-400 group-hover:text-rose-100">Permanently wipe all data from our servers.</p>
                       </div>
                    </button>
                 </div>
              </div>

              <div className="h-px bg-zinc-100" />

              {/* Privacy Toggles */}
              <div className="space-y-6">
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">AI Privacy & Training</h3>
                 <div className="space-y-4">
                    {[
                      { id: 'train', label: 'Improve Ayech AI', desc: 'Allow our models to learn from your data to improve accuracy (Anonymized).' },
                      { id: 'analytic', label: 'Detailed Analytics', desc: 'Enable advanced tracking for deep behavioral insights in your hub.' }
                    ].map(tog => (
                      <div key={tog.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                         <div className="space-y-0.5">
                            <span className="text-sm font-black text-zinc-800">{tog.label}</span>
                            <p className="text-[10px] font-black text-zinc-400">{tog.desc}</p>
                         </div>
                         <div className="w-12 h-6 bg-zinc-900 rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm ml-auto" />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Security Audit */}
           <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                 <h3 className="text-lg font-black text-zinc-900 italic flex items-center gap-3 font-serif">
                   <History className="w-6 h-6 text-zinc-400" /> Active Sessions
                 </h3>
                 <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline">Revoke All</button>
              </div>
              <div className="space-y-0 text-left">
                 {SESSIONS.map((ses, i) => (
                   <div key={i} className="px-8 py-5 border-b border-zinc-50 flex items-center justify-between hover:bg-zinc-50 transition-colors last:border-0">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                            <ses.icon className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-zinc-900">{ses.device}</h4>
                            <p className="text-[10px] font-bold text-zinc-400">{ses.location}</p>
                         </div>
                      </div>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", ses.time === 'Active now' ? "text-emerald-500" : "text-zinc-300")}>
                         {ses.time}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Security & Compliance */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 italic">
                 <Lock className="w-5 h-5 text-indigo-400" /> Two-Factor Auth
              </h3>
              <p className="text-xs font-bold text-zinc-400 leading-relaxed mb-6">
                 Add an extra layer of protection to your business. We'll ask for a code on your phone when you log in.
              </p>
              <button className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                 Enable 2FA (SMS/App)
              </button>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-rose-500" /> Compliance
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "GDPR Compliant", status: "Active" },
                   { label: "Tunisian Digital Act", status: "Certified" },
                   { label: "ISO 27001 Ready", status: "In Progress" },
                 ].map((comp, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <span className="text-[10px] font-black text-zinc-600">{comp.label}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{comp.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-zinc-400 font-bold leading-relaxed italic">
                Our servers are hosted on high-security regional nodes to ensure zero-latency and maximum data sovereignty.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
