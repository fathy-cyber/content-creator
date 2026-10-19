import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Link, Facebook, Instagram, MessageSquare, 
  Globe, CheckCircle2, AlertCircle, RefreshCcw, 
  Unlink, Info, Sparkles, Zap, Smartphone,
  ExternalLink, ArrowRight, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook Business', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', status: 'connected', username: 'Ayech Digital' },
  { id: 'instagram', name: 'Instagram Professional', icon: Instagram, color: 'text-rose-600', bg: 'bg-rose-50', status: 'connected', username: '@ayech_ai' },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', status: 'not_linked' },
  { id: 'tiktok', name: 'TikTok for Business', icon: Smartphone, color: 'text-zinc-900', bg: 'bg-zinc-100', status: 'not_linked' },
  { id: 'google', name: 'Google My Business', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50', status: 'expired' },
];

export default function ConnectedAccounts() {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    await new Promise(r => setTimeout(r, 2000));
    setConnectingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 italic font-serif">Connected Accounts</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Sync your platforms to enable AI-powered automation and cross-channel strategy.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Platform Grid */}
        <div className="xl:col-span-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PLATFORMS.map(platform => {
                const Icon = platform.icon;
                const isConnecting = connectingId === platform.id;
                
                return (
                  <div key={platform.id} className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full group hover:border-zinc-900 transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110", platform.bg, platform.color, "border-white")}>
                           <Icon className="w-7 h-7" />
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          platform.status === 'connected' ? "bg-emerald-100 text-emerald-700" : 
                          platform.status === 'expired' ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-400"
                        )}>
                           {platform.status.replace('_', ' ')}
                        </div>
                     </div>

                     <div className="flex-1">
                        <h3 className="text-lg font-black text-zinc-900 mb-1">{platform.name}</h3>
                        {platform.username ? (
                          <p className="text-sm font-bold text-zinc-400 mb-6 italic">{platform.username}</p>
                        ) : (
                          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Boost your {platform.id} reach with AI automation.</p>
                        )}
                     </div>

                     <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                        {platform.status === 'connected' ? (
                          <button className="text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-rose-500 transition-colors flex items-center gap-1.5">
                             <Unlink className="w-3 h-3" /> Disconnect
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleConnect(platform.id)}
                            disabled={isConnecting}
                            className={cn(
                              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-md",
                              platform.status === 'expired' ? "bg-rose-600 text-white" : "bg-zinc-900 text-white"
                            )}
                          >
                             {isConnecting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                             {isConnecting ? 'Linking...' : platform.status === 'expired' ? 'Reconnect' : 'Connect'}
                          </button>
                        )}
                        <ExternalLink className="w-4 h-4 text-zinc-100 group-hover:text-zinc-200 transition-colors" />
                     </div>
                  </div>
                )
              })}
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-zinc-200 shrink-0 shadow-sm">
                 <Link className="w-10 h-10" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                 <h4 className="text-lg font-black text-zinc-900 italic">Looking for a custom integration?</h4>
                 <p className="text-xs font-bold text-zinc-500 leading-relaxed">
                    Ayech AI supports over 50+ local and international APIs. Connect your CRM, ERP, or local logistics provider (Aramex, Lux) via our developer hub.
                 </p>
              </div>
              <button className="px-8 py-3 bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 shrink-0">
                 Explore Directory <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Right: Security & Sync Info */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 italic">
                 <Zap className="w-5 h-5 text-amber-300" /> Omni-Channel Sync
              </h3>
              <p className="text-xs font-bold text-indigo-50 leading-relaxed mb-6 opacity-90">
                 Syncing your accounts allows Ayech AI to track your global sentiment and provide unified reports on your digital empire.
              </p>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sync Health</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-serif">Optimal</span>
                 </div>
                 <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                 </div>
              </div>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-rose-500" /> Enterprise Privacy
              </h3>
              <div className="space-y-4">
                 {[
                   "AES-256 bank-grade encryption",
                   "Token-based API access only",
                   "GDPR & local data compliance",
                   "Automatic session wipe on link"
                 ].map((tip, i) => (
                   <div key={i} className="flex gap-3 items-center group">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 opacity-60 group-hover:scale-150 transition-transform" />
                      <span className="text-[10px] font-bold text-zinc-500 italic">{tip}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-zinc-400 font-bold leading-relaxed italic">
                Linking your accounts correctly is the #1 factor in AI accuracy. Ensure your business pages are 'Professional' type.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
