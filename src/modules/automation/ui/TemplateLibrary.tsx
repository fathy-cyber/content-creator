import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LibraryBig, Search, Filter, ArrowRight, CheckCircle2, 
  ShoppingCart, Briefcase, Users, Zap, Mail, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'E-commerce', 'Lead Gen', 'Support', 'Engagement'];

const TEMPLATES = [
  {
    id: 1,
    title: 'Abandoned Cart Recovery (SMS + Email)',
    category: 'E-commerce',
    desc: 'Send a multi-channel reminder to users who leave checkout without purchasing.',
    apps: [ShoppingCart, Mail, MessageSquare],
    rating: 4.9,
    uses: '24.5k',
    color: 'emerald'
  },
  {
    id: 2,
    title: 'New Lead Welcome Sequence',
    category: 'Lead Gen',
    desc: 'Automatically nurture new signups with a 3-day value-driven email sequence.',
    apps: [Users, Mail],
    rating: 4.8,
    uses: '18.2k',
    color: 'indigo'
  },
  {
    id: 3,
    title: 'Post-Purchase Review Request',
    category: 'E-commerce',
    desc: 'Wait 7 days after delivery then ask the customer for a product review.',
    apps: [ShoppingCart, Mail],
    rating: 4.7,
    uses: '12.1k',
    color: 'blue'
  },
  {
    id: 4,
    title: 'VIP Customer Tagging',
    category: 'Support',
    desc: 'Automatically tag customers in your CRM who spend over $500 total.',
    apps: [Briefcase, Zap],
    rating: 4.6,
    uses: '8.4k',
    color: 'amber'
  },
  {
    id: 5,
    title: 'Webinar Attendance Follow-up',
    category: 'Engagement',
    desc: 'Send different messages depending on whether the user attended or missed the webinar.',
    apps: [Users, MessageSquare, Mail],
    rating: 4.8,
    uses: '5.9k',
    color: 'purple'
  },
  {
    id: 6,
    title: 'Support Ticket Escalation',
    category: 'Support',
    desc: 'If a high-priority ticket is unassigned for 1 hour, text the manager.',
    apps: [Briefcase, MessageSquare],
    rating: 5.0,
    uses: '3.2k',
    color: 'rose'
  }
];

export default function TemplateLibrary() {
  const [activeSearch, setActiveSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = TEMPLATES.filter(t => {
     const matchesCat = activeCategory === 'All' || t.category === activeCategory;
     const matchesSearch = t.title.toLowerCase().includes(activeSearch.toLowerCase()) || t.desc.toLowerCase().includes(activeSearch.toLowerCase());
     return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 h-full">
      
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
            <LibraryBig className="w-8 h-8 text-indigo-500" />
            Template Library
          </h1>
          <p className="text-zinc-500 text-base max-w-xl">
            Don't start from scratch. Browse our collection of top-performing automation recipes crafted by experts.
          </p>
        </div>
        
        <div className="w-full md:w-80 relative flex-shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={activeSearch}
            onChange={(e) => setActiveSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm font-medium"
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4 pt-2 px-1">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col h-full relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${template.color}-500 blur-[80px] opacity-10 rounded-full pointer-events-none group-hover:opacity-20 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
               <span className={cn(`bg-${template.color}-100 text-${template.color}-700`, "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider")}>
                 {template.category}
               </span>
               <div className="flex -space-x-2">
                 {template.apps.map((AppIcon, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm z-10 relative" style={{ zIndex: 10 - i }}>
                       <AppIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                 ))}
               </div>
            </div>

            <h3 className="text-xl font-extrabold text-zinc-900 mb-2 leading-snug group-hover:text-indigo-700 transition-colors relative z-10">
               {template.title}
            </h3>
            
            <p className="text-sm text-zinc-500 leading-relaxed mb-6 flex-1 relative z-10">
               {template.desc}
            </p>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-auto relative z-10">
               <div className="flex gap-4">
                 <div className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                   ⭐ {template.rating.toFixed(1)}
                 </div>
                 <div className="text-xs font-bold text-zinc-400">
                   {template.uses} installs
                 </div>
               </div>
               <Link to="/automation/workflow" className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all hover:scale-110 shadow-sm">
                 <ArrowRight className="w-5 h-5 -rotate-45" />
               </Link>
            </div>
          </motion.div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <LibraryBig className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-zinc-900">No templates found</h3>
             <p className="text-zinc-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
}
