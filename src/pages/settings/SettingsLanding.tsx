import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Building2, Languages, Bell, 
  ShieldCheck, CreditCard, Link, LogOut,
  ChevronRight, Settings as SettingsIcon,
  ShieldAlert, Sparkles, Zap, Smartphone,
  ExternalLink, ArrowRight
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SETTING_CARDS = [
  {
    title: 'Personal Profile',
    desc: 'Manage your avatar, name, and contact information.',
    icon: User,
    href: '/settings/profile',
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    title: 'Business Profile',
    desc: 'Configure your company details, industry, and goals.',
    icon: Building2,
    href: '/settings/business',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50'
  },
  {
    title: 'Language & Region',
    desc: 'Set your preferred language (Tunisian Arabic, French, English).',
    icon: Languages,
    href: '/settings/language',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  },
  {
    title: 'Notifications',
    desc: 'Control which alerts and updates you receive from Ayech AI.',
    icon: Bell,
    href: '/settings/notifications',
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
  {
    title: 'Connected Accounts',
    desc: 'Link your Facebook, Instagram, and WhatsApp for automation.',
    icon: Link,
    href: '/settings/connected-accounts',
    color: 'text-rose-500',
    bg: 'bg-rose-50'
  },
  {
    title: 'Billing & Plans',
    desc: 'Manage your subscription, invoices, and payment methods.',
    icon: CreditCard,
    href: '/settings/billing',
    color: 'text-zinc-900',
    bg: 'bg-zinc-100'
  },
  {
    title: 'Privacy & Security',
    desc: 'Secure your account with 2FA and manage data privacy.',
    icon: ShieldCheck,
    href: '/settings/privacy',
    color: 'text-zinc-600',
    bg: 'bg-zinc-100'
  }
];

export default function SettingsLanding() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Header & Quick Profile */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
         <div className="lg:w-2/3 space-y-2">
            <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 italic font-serif">
               <SettingsIcon className="w-8 h-8 text-zinc-400" />
               Account Settings
            </h1>
            <p className="text-zinc-500 font-medium">Control your experience and manage your business preferences.</p>
         </div>

         <div className="lg:w-1/3 w-full bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-105 transition-transform duration-500">
               <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
               <h3 className="font-black text-zinc-900 leading-tight">Mohamed Ayech</h3>
               <p className="text-xs font-bold text-zinc-400">Pro Plan • Tunisia</p>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {SETTING_CARDS.map((card, i) => {
           const Icon = card.icon;
           return (
             <RouterLink 
              to={card.href} 
              key={i} 
              className="group bg-white border border-zinc-200 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-zinc-200/50 hover:border-zinc-900 transition-all flex flex-col relative overflow-hidden"
             >
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:rotate-12 duration-500 shadow-sm", card.bg, card.color, "border-white")}>
                      <Icon className="w-6 h-6" />
                   </div>
                   <ArrowRight className="w-4 h-4 text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                </div>
                
                <h3 className="text-lg font-black text-zinc-900 mb-2 relative z-10">
                   {card.title}
                </h3>
                <p className="text-xs text-zinc-500 font-bold leading-relaxed flex-1 relative z-10">
                   {card.desc}
                </p>
             </RouterLink>
           )
         })}

         <button className="group bg-zinc-50 border-2 border-dashed border-zinc-200 p-8 rounded-[2rem] hover:bg-rose-50 hover:border-rose-200 transition-all flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-zinc-300 group-hover:text-rose-500 transition-colors shadow-sm border border-zinc-100">
               <LogOut className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-black text-zinc-400 group-hover:text-rose-700 transition-colors">Sign Out</h3>
               <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-rose-400">End Session</p>
            </div>
         </button>
      </div>

      {/* Pro Help Banner */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent" />
         <div className="space-y-4 relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
               <Sparkles className="w-4 h-4" /> Need Expert Assistance?
            </div>
            <h2 className="text-3xl font-black italic tracking-tight">Personalize your <span className="text-indigo-400">Empire</span>.</h2>
            <p className="text-zinc-400 font-bold leading-relaxed italic">
               Want a custom integration or white-labeled strategy? Our premium support team is available 24/7 for Enterprise customers.
            </p>
         </div>
         <button className="px-10 py-5 bg-white text-zinc-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-100 transition-all shadow-xl active:scale-95 group relative z-10">
            Contact Support <ExternalLink className="w-4 h-4 inline-block ml-2 group-hover:rotate-45 transition-transform" />
         </button>
      </div>

    </div>
  );
}
