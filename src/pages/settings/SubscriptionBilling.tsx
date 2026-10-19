import React from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, ShieldCheck, Zap, Download, 
  ExternalLink, CheckCircle2, AlertCircle, RefreshCcw,
  Sparkles, Info, ArrowUpRight, History, 
  Wallet, Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INVOICES = [
  { id: 'INV-001', date: '2026-03-20', amount: '120.000 TND', status: 'Paid' },
  { id: 'INV-002', date: '2026-02-20', amount: '120.000 TND', status: 'Paid' },
  { id: 'INV-003', date: '2026-01-20', amount: '120.000 TND', status: 'Paid' },
];

export default function SubscriptionBilling() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 italic font-serif">Billing & Plans</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Manage your subscription, view invoices, and scale your AI capabilities.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Plan & Usage */}
        <div className="xl:col-span-8 space-y-8">
           
           {/* Current Plan Card */}
           <div className="bg-zinc-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[140px] opacity-10 -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                 <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                       <Sparkles className="w-4 h-4" /> Current Subscription
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-4xl font-black italic">Pro Empire</h2>
                       <p className="text-zinc-400 font-bold">120.000 TND / Month • Billed Monthly</p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4">
                       <button className="px-8 py-3.5 bg-white text-zinc-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-100 transition-all shadow-lg active:scale-95">Upgrade Plan</button>
                       <button className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/20 transition-all">Cancel Plan</button>
                    </div>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] min-w-[280px] space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-zinc-400">AI Credits Used</span>
                          <span className="text-indigo-400 font-serif italic">8,450 / 10,000</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '84.5%' }} className="h-full bg-indigo-500" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-zinc-400">Storage Used</span>
                          <span className="text-emerald-400 font-serif italic">1.2 GB / 5 GB</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '24%' }} className="h-full bg-emerald-500" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Invoice History */}
           <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                 <h3 className="text-lg font-black text-zinc-900 italic flex items-center gap-3 font-serif">
                   <History className="w-6 h-6 text-zinc-400" /> Invoice History
                 </h3>
                 <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Download All JSON</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-zinc-100">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Invoice ID</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Date</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       {INVOICES.map(inv => (
                         <tr key={inv.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors last:border-0">
                            <td className="px-8 py-5 text-sm font-bold text-zinc-900">{inv.id}</td>
                            <td className="px-8 py-5 text-sm font-bold text-zinc-500">{inv.date}</td>
                            <td className="px-8 py-5 text-sm font-black text-zinc-900">{inv.amount}</td>
                            <td className="px-8 py-5">
                               <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                  {inv.status}
                               </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                                  <Download className="w-4 h-4" />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right: Payment Method & Info */}
        <div className="xl:col-span-4 space-y-6">
           
           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm space-y-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                 <Wallet className="w-4 h-4 text-zinc-400" /> Payment Method
              </h3>
              
              <div className="p-6 bg-zinc-900 rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20" />
                 <div className="flex justify-between items-start mb-6">
                    <CreditCard className="w-8 h-8 text-indigo-400" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">VISA</span>
                 </div>
                 <div className="text-lg font-black text-white tracking-[0.2em] mb-4">•••• •••• •••• 4242</div>
                 <div className="flex justify-between items-end">
                    <div>
                       <div className="text-[8px] font-black uppercase tracking-widest text-white/30">Expire Date</div>
                       <div className="text-xs font-bold text-white">12/28</div>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Edit Card</button>
                 </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4 group cursor-pointer hover:border-zinc-300 transition-all">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-300">
                    <PlusIcon className="w-5 h-5 text-indigo-600" />
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block">Add Method</span>
                    <span className="text-[8px] font-bold text-zinc-400">Konnect, Flouci, etc.</span>
                 </div>
              </div>
           </div>

           <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 italic">
                 <ShieldCheck className="w-5 h-5 text-white" /> Secure Billing
              </h3>
              <p className="text-xs font-bold text-emerald-50 leading-relaxed mb-6 opacity-90">
                 Your payment data is fully encrypted. We follow the highest Tunisian and international compliance standards.
              </p>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <ShieldCheck className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Verified by Stripe & local partners</span>
              </div>
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-zinc-400 font-bold leading-relaxed italic">
                Upgrading to **Enterprise** includes dedicated account management and custom billing via bank transfer.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}

// Re-importing Plus since I missed it in the icon list
import { Plus as PlusIcon } from 'lucide-react';
