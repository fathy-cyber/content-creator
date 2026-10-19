import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  Instagram, Facebook, Mail, PenTool, MessageSquare, 
  MoreVertical, Clock, CheckCircle2, AlertCircle, Filter, 
  Download, Share2, Sparkles, LayoutGrid, List
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const INITIAL_EVENTS = [
  { id: 1, date: 15, title: 'Ramadan 2024 Promo', type: 'social', platform: 'instagram', status: 'published' },
  { id: 2, date: 15, title: 'Weekly Newsletter', type: 'email', platform: 'mail', status: 'published' },
  { id: 3, date: 17, title: 'How to scale your SME', type: 'blog', platform: 'blog', status: 'scheduled' },
  { id: 4, date: 20, title: 'New Collection Teaser', type: 'social', platform: 'facebook', status: 'draft' },
  { id: 5, date: 22, title: 'Customer Feedback Poll', type: 'social', platform: 'instagram', status: 'scheduled' },
  { id: 6, date: 25, title: 'Behind the Scenes Video', type: 'social', platform: 'tiktok', status: 'draft' },
];

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(2); // March (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState(INITIAL_EVENTS);

  // Simple calendar grid generation
  const daysInMonth = 31; 
  const startDayPadding = 4; // Start on Friday

  const calendarDays = Array.from({ length: daysInMonth + startDayPadding }, (_, i) => {
    const dayNumber = i - startDayPadding + 1;
    return {
      day: dayNumber > 0 ? dayNumber : null,
      events: events.filter(e => e.date === dayNumber)
    };
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const getIcon = (platform: string) => {
    switch(platform) {
      case 'instagram': return <Instagram className="w-3.5 h-3.5" />;
      case 'facebook': return <Facebook className="w-3.5 h-3.5" />;
      case 'mail': return <Mail className="w-3.5 h-3.5" />;
      case 'blog': return <PenTool className="w-3.5 h-3.5" />;
      case 'tiktok': return <MessageSquare className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12 h-content">
      
      {/* Top Header & Controls */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3">
                 <CalendarIcon className="w-8 h-8 text-indigo-500" />
                 Smart Calendar
              </h1>
              <p className="text-zinc-500 font-medium mt-1">Visually plan and manage your business presence.</p>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                 <button 
                  onClick={() => setView('month')}
                  className={cn("p-2 rounded-lg transition-all", view === 'month' ? "bg-white text-zinc-900 shadow-sm font-bold" : "text-zinc-400 hover:text-zinc-600")}
                 >
                    <LayoutGrid className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => setView('week')}
                  className={cn("p-2 rounded-lg transition-all", view === 'week' ? "bg-white text-zinc-900 shadow-sm font-bold" : "text-zinc-400 hover:text-zinc-600")}
                 >
                    <List className="w-4 h-4" />
                 </button>
              </div>
              <button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-6 rounded-2xl transition-all shadow-lg flex items-center gap-2 active:scale-95">
                 <Plus className="w-5 h-5" /> New Post
              </button>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-zinc-100 gap-4">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                 <button className="p-2 transition-colors hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900">
                    <ChevronLeft className="w-6 h-6" />
                 </button>
                 <h2 className="text-xl font-black text-zinc-900 min-w-40 text-center tracking-tight">
                    {MONTHS[currentMonth]} {currentYear}
                 </h2>
                 <button className="p-2 transition-colors hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900">
                    <ChevronRight className="w-6 h-6" />
                 </button>
              </div>
              <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest border-l border-zinc-200 pl-6">
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Published</div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Scheduled</div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> Drafts</div>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Download className="w-5 h-5" /></button>
              <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Share2 className="w-5 h-5" /></button>
              <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-lg border border-zinc-200 ml-2">
                 <Filter className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0 bg-white border border-zinc-200 rounded-[2.5rem] p-4 shadow-xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 gap-2 mb-2 shrink-0">
             {DAYS.map(day => (
               <div key={day} className="text-center py-2 text-xs font-black text-zinc-400 uppercase tracking-widest">{day}</div>
             ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-zinc-100 flex-1 overflow-auto rounded-2xl border border-zinc-200 min-h-[600px]">
             {calendarDays.map((date, i) => (
               <div 
                key={i} 
                className={cn(
                  "bg-white group min-h-[120px] p-2 flex flex-col transition-all hover:bg-zinc-50/50",
                  !date.day && "bg-zinc-50/30"
                )}
               >
                  <div className="flex items-center justify-between mb-2">
                     <span className={cn(
                       "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                       date.day === 15 ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-zinc-400 group-hover:text-zinc-900"
                     )}>
                        {date.day}
                     </span>
                     {date.day && (
                       <button className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-indigo-600 transition-all hover:scale-110">
                          <Plus className="w-3.5 h-3.5" />
                       </button>
                     )}
                  </div>
                  
                  <div className="space-y-1.5 flex-1 min-h-0">
                     {date.events.map(event => (
                       <motion.div
                         key={event.id}
                         layoutId={`event-${event.id}`}
                         initial={{ scale: 0.95, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className={cn(
                           "p-1.5 rounded-lg border text-[10px] font-bold truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-sm flex items-center gap-1.5",
                           getStatusColor(event.status)
                         )}
                       >
                          {getIcon(event.platform)}
                          <span className="truncate flex-1">{event.title}</span>
                       </motion.div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
      </div>

    </div>
  );
}
