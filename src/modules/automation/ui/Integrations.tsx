import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Puzzle, Search, Filter, ArrowRight, CheckCircle2, 
  ExternalLink, ShoppingCart, MessageSquare, Mail, 
  Globe, CreditCard, Users, Database, Plus, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'E-commerce', 'Marketing', 'CRM', 'Payments', 'Communication'];

const INTEGRATIONS = [
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    desc: 'Sync products, orders, and customer data to trigger marketing workflows.',
    icon: ShoppingCart,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    connected: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    desc: 'Manage leads and automate your sales funnel with high-precision AI sync.',
    icon: Database,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    connected: false
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Communication',
    desc: 'Send automated alerts, confirmation messages, and marketing blasts.',
    icon: MessageSquare,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
    connected: true
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    desc: 'Automate your email newsletters and segment audiences based on behavior.',
    icon: Mail,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    connected: false
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    desc: 'Track revenue, manage subscriptions, and trigger actions on payment events.',
    icon: CreditCard,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    connected: false
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    desc: 'Get real-time notifications for new orders, leads, and system alerts.',
    icon: Globe,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    connected: false
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    desc: 'Enterprise-grade CRM integration for complex sales cycles and reporting.',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    connected: false
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'E-commerce',
    desc: 'Connect your WordPress store to automate customer retention and upsells.',
    icon: ShoppingCart,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    connected: false
  }
];

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = INTEGRATIONS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-white shadow-xl shadow-zinc-200/20"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[150px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Connect Your Business
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Expand your <span className="text-emerald-400">Hub.</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-0">
              Ayech AI seamlessly integrates with your favorite tools to automate every aspect of your business operations.
            </p>
          </div>
          
          <div className="w-full max-w-md bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
             <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                       {i === 4 ? '+50' : <Puzzle className="w-4 h-4 text-zinc-500" />}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-zinc-300">
                  <span className="text-white font-bold block text-lg">50+ Apps</span>
                  Direct & API Integrations
                </div>
             </div>
             <button className="w-full bg-white text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2">
               <Plus className="w-5 h-5" /> Request Integration
             </button>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full lg:w-auto pb-2 lg:pb-0">
           {CATEGORIES.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                 activeCategory === cat 
                   ? "bg-zinc-900 text-white border-zinc-900 shadow-md" 
                   : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
               )}
             >
               {cat}
             </button>
           ))}
        </div>
        
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-zinc-200/50 hover:border-indigo-200 transition-all flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", item.bg, item.border)}>
                    <Icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  {item.connected ? (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="bg-zinc-50 text-zinc-400 border border-zinc-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      Disconnected
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-6 flex-1">
                  {item.desc}
                </p>

                <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
                  <button className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Documentation
                  </button>
                  <button className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm",
                    item.connected 
                      ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                  )}>
                    {item.connected ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                <Puzzle className="w-8 h-8 text-zinc-200" />
             </div>
             <h3 className="text-xl font-bold text-zinc-900">No integrations found</h3>
             <p className="text-zinc-500">Try a different search term or category.</p>
          </div>
        )}
      </div>

    </div>
  );
}
