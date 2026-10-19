import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Star, Zap, ShieldCheck, 
  Rocket, Globe, MessageSquare, Sparkles,
  ArrowRight, Info, HelpCircle, 
  ChevronDown, Heart, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    name: 'Startup',
    price: { monthly: 45, annual: 35 },
    desc: 'Perfect for solopreneurs starting their digital journey in Tunisia.',
    features: [
      '500 AI Content Credits',
      'Basic Automation Builder',
      'Social Post Generator',
      'Standard Support Hub',
      '1 Connected Account'
    ],
    icon: Rocket,
    color: 'indigo'
  },
  {
    name: 'Pro Empire',
    price: { monthly: 120, annual: 95 },
    desc: 'The complete toolkit for growing SMEs looking to dominate.',
    features: [
      '10,000 AI Content Credits',
      'Advanced Automation (10+ Steps)',
      'Digital Strategy Advisor',
      'Video Script & Blog Writer',
      '5 Connected Accounts',
      'WhatsApp Integration'
    ],
    popular: true,
    icon: Zap,
    color: 'zinc'
  },
  {
    name: 'Enterprise',
    price: { monthly: 450, annual: 380 },
    desc: 'Custom solutions for established brands and agencies.',
    features: [
      'Unlimited AI Credits',
      'White-label Reports',
      'Custom API Integrations',
      'Dedicated Strategy Manager',
      'Unlimited Connected Accounts',
      '24/7 Priority Support'
    ],
    icon: Target,
    color: 'amber'
  }
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      
      {/* Navigation (Simple for Public Page) */}
      <nav className="p-8 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-zinc-900 italic tracking-tighter">
           Ayech<span className="text-indigo-600">AI</span>
        </Link>
        <div className="flex items-center gap-8">
           <Link to="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Log In</Link>
           <Link to="/register" className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center px-4 pt-12 pb-20">
         <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100"
         >
            <Sparkles className="w-3 h-3" /> Invest in your Growth
         </motion.div>
         <h1 className="text-5xl md:text-7xl font-black text-zinc-900 leading-[1.1] mb-8 tracking-tight italic font-serif">
            Pricing that scales with your <span className="text-indigo-600">Empire</span>.
         </h1>
         <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            "Stop trading time for labor. Start trading strategy for results."
         </p>

         {/* Billing Toggle */}
         <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'monthly' ? "text-zinc-900" : "text-zinc-400")}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-16 h-8 bg-zinc-900 rounded-full relative p-1 transition-colors"
            >
               <motion.div 
                 className="w-6 h-6 bg-white rounded-full shadow-sm"
                 animate={{ x: billingCycle === 'annual' ? 32 : 0 }}
               />
            </button>
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'annual' ? "text-zinc-900" : "text-zinc-400")}>Annual <span className="text-emerald-500 text-[10px] font-black uppercase ml-1">Save 20%</span></span>
         </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
         {TIERS.map((tier, i) => {
           const Icon = tier.icon;
           const isPopular = tier.popular;
           
           return (
             <motion.div
               key={tier.name}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={cn(
                 "relative rounded-[3rem] p-10 flex flex-col border-2 transition-all hover:scale-[1.02] duration-500",
                 isPopular ? "bg-zinc-900 text-white border-zinc-900 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)]" : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-300"
               )}
             >
                {isPopular && (
                  <div className="absolute top-8 right-8 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-indigo-500/30">
                     Must Have
                  </div>
                )}
                
                <div className="mb-12">
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm", isPopular ? "bg-white/10 text-white" : "bg-zinc-50 text-indigo-600")}>
                      <Icon className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-black mb-2 italic tracking-tight">{tier.name}</h3>
                   <p className={cn("text-xs font-bold leading-relaxed", isPopular ? "text-zinc-400" : "text-zinc-500")}>{tier.desc}</p>
                </div>

                <div className="mb-12">
                   <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black italic">{billingCycle === 'monthly' ? tier.price.monthly : tier.price.annual}</span>
                      <span className={cn("text-sm font-bold uppercase tracking-widest", isPopular ? "text-zinc-500" : "text-zinc-400")}>TND / Month</span>
                   </div>
                </div>

                <div className="flex-1 space-y-4 mb-12">
                   <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-6 block", isPopular ? "text-indigo-400" : "text-zinc-300")}>Unlocked Features</div>
                   {tier.features.map((feat, j) => (
                     <div key={j} className="flex items-center gap-3">
                        <CheckCircle2 className={cn("w-5 h-5 shrink-0", isPopular ? "text-emerald-400" : "text-indigo-500")} />
                        <span className="text-sm font-bold opacity-90">{feat}</span>
                     </div>
                   ))}
                </div>

                <button className={cn(
                  "w-full py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 group flex items-center justify-center gap-2",
                  isPopular ? "bg-white text-zinc-900 hover:bg-zinc-50" : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}>
                   Initialize My Empire <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
             </motion.div>
           )
         })}
      </div>

      {/* Trust & FAQ Preview */}
      <div className="max-w-4xl mx-auto mt-32 px-4 space-y-20">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-1000">
            <div className="flex items-center justify-center font-black text-2xl italic tracking-tighter">ZEN</div>
            <div className="flex items-center justify-center font-black text-2xl italic tracking-tighter uppercase">MyTek</div>
            <div className="flex items-center justify-center font-black text-2xl italic tracking-tighter">Ooredoo</div>
            <div className="flex items-center justify-center font-black text-2xl italic tracking-tighter">Fatales</div>
         </div>

         <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 space-y-8">
               <h2 className="text-3xl font-black italic tracking-tight mb-4">"Ayech AI pays for itself in just 5 days."</h2>
               <div className="flex justify-center gap-12">
                  <div>
                    <div className="text-4xl font-black mb-1">98%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. CSAT</div>
                  </div>
                  <div className="h-px w-10 bg-white/20 my-auto" />
                  <div>
                    <div className="text-4xl font-black mb-1">5X</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Faster Growth</div>
                  </div>
               </div>
               <p className="text-sm font-bold text-indigo-100 italic">Trusted by 500+ Tunisian Business Owners</p>
            </div>
         </div>
      </div>

    </div>
  );
}
