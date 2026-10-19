import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Puzzle, Search, Filter, CheckCircle2, 
  ExternalLink, Loader2, Plus, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'E-commerce', 'CRM', 'Marketing', 'Communication', 'Payment'];

const INITIAL_APPS = [
  { id: 'shopify', name: 'Shopify', category: 'E-commerce', desc: 'Sync orders, customers, and inventory data.', icon: '🛍️', connected: true },
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', desc: 'Automate lead scoring, deals, and pipelines.', icon: '🟠', connected: false },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', desc: 'Trigger complex email sequences and segment users.', icon: '🐵', connected: true },
  { id: 'slack', name: 'Slack', category: 'Communication', desc: 'Send channel notifications for new sales or alerts.', icon: '💬', connected: false },
  { id: 'stripe', name: 'Stripe', category: 'Payment', desc: 'Automate invoice creation and failed payment recovery.', icon: '💳', connected: false },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Communication', desc: 'Send direct messages, templates, and support replies.', icon: '🟢', connected: true },
  { id: 'woocommerce', name: 'WooCommerce', category: 'E-commerce', desc: 'Connect your Wordpress store for order automations.', icon: '🛒', connected: false },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', desc: 'Enterprise-grade sync for accounts and opportunities.', icon: '☁️', connected: false },
];

export default function AppIntegrations() {
  const [apps, setApps] = useState(INITIAL_APPS);
  const [activeSearch, setActiveSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const filteredApps = apps.filter(app => {
     const matchesCat = activeCategory === 'All' || app.category === activeCategory;
     const matchesSearch = app.name.toLowerCase().includes(activeSearch.toLowerCase());
     return matchesCat && matchesSearch;
  });

  const toggleConnection = async (id: string, currentStatus: boolean) => {
    if (currentStatus) {
       // Disconnect immediately for mock
       setApps(apps.map(a => a.id === id ? { ...a, connected: false } : a));
       return;
    }
    
    // Simulate OAuth connection delay
    setConnectingId(id);
    await new Promise(r => setTimeout(r, 2000));
    setApps(apps.map(a => a.id === id ? { ...a, connected: true } : a));
    setConnectingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 h-full">
      
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 blur-[100px] opacity-10 rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
            <Puzzle className="w-8 h-8 text-blue-500" />
            Integrations
          </h1>
          <p className="text-zinc-500 text-base max-w-xl">
            Connect your favorite tools to the Ayech engine. Once connected, you can use these apps as Triggers and Actions in your workflows.
          </p>
        </div>
        
        <div className="w-full md:w-80 relative flex-shrink-0 z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search tools..." 
            value={activeSearch}
            onChange={(e) => setActiveSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 shrink-0">
        <div className="flex items-center gap-2 font-bold text-zinc-400 text-sm uppercase tracking-wider mr-2 shrink-0">
          <Filter className="w-4 h-4" /> Filter:
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full font-semibold text-sm transition-all border shrink-0",
              activeCategory === cat 
                ? "bg-zinc-900 text-white border-zinc-900 shadow-md" 
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 pt-2 px-1">
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all flex flex-col h-full relative"
          >
            {/* Connection Status Indicator */}
            <div className="absolute top-4 right-4">
               {app.connected ? (
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                 </div>
               ) : (
                 <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded-md">
                   Not Connected
                 </div>
               )}
            </div>

            <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-3xl mb-4 shadow-inner">
               {app.icon}
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900 mb-1 flex items-center gap-2">
               {app.name}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-3 block">
               {app.category}
            </span>
            
            <p className="text-sm text-zinc-500 leading-relaxed mb-6 flex-1">
               {app.desc}
            </p>

            <button 
               onClick={() => toggleConnection(app.id, app.connected)}
               disabled={connectingId === app.id}
               className={cn(
                 "w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border",
                 connectingId === app.id 
                   ? "bg-blue-50 border-blue-100 text-blue-600 opacity-80 cursor-not-allowed"
                   : app.connected
                     ? "bg-white border-zinc-200 text-zinc-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                     : "bg-blue-600 hover:bg-blue-700 text-white border-transparent hover:shadow-md"
               )}
            >
               {connectingId === app.id ? (
                 <><Loader2 className="w-4 h-4 animate-spin" /> Authorizing...</>
               ) : app.connected ? (
                 'Disconnect'
               ) : (
                 <><Plus className="w-4 h-4" /> Connect App</>
               )}
            </button>
          </motion.div>
        ))}

        {filteredApps.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <Puzzle className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-zinc-900">No apps found</h3>
             <p className="text-zinc-500">We couldn't find any app matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Suggest App Banner */}
      <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-4 shadow-sm shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
               <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
               <h3 className="text-lg font-bold">Missing an Integraton?</h3>
               <p className="text-zinc-400 text-sm">We are constantly adding new apps to our ecosystem.</p>
            </div>
         </div>
         <button className="bg-white text-zinc-900 hover:bg-zinc-100 font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2">
            Request an App <ExternalLink className="w-4 h-4 text-zinc-500" />
         </button>
      </div>

    </div>
  );
}
