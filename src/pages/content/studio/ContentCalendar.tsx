import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreHorizontal,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'day';
type PipelineStage = 'idea' | 'draft' | 'review' | 'approved' | 'published';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  stage: PipelineStage;
  type: 'social' | 'blog' | 'email';
  color: string;
}

const STAGE_COLORS: Record<PipelineStage, string> = {
  idea: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  draft: 'bg-blue-50 text-blue-600 border-blue-200',
  review: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  published: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Summer Collection Launch', date: '2025-05-10', stage: 'approved', type: 'social', color: 'bg-pink-500' },
  { id: '2', title: 'Weekly Newsletter', date: '2025-05-12', stage: 'draft', type: 'email', color: 'bg-blue-500' },
  { id: '3', title: 'New Blog Post: AI in Business', date: '2025-05-15', stage: 'idea', type: 'blog', color: 'bg-emerald-500' },
  { id: '4', title: 'Product Demo Video', date: '2025-05-18', stage: 'review', type: 'social', color: 'bg-purple-500' },
];

export default function ContentCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date('2025-05-01'));
  const [events] = useState<CalendarEvent[]>(INITIAL_EVENTS);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center bg-zinc-100 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-zinc-600">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))} className="px-3 py-1 text-xs font-bold text-zinc-600 hover:bg-white hover:shadow-sm rounded-md transition-all">
              Today
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-zinc-600">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                  viewMode === mode ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <button className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Filter size={18} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
            <Plus size={18} />
            New Content
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5">
          {/* Empty slots for first week */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-zinc-100 bg-zinc-50/30" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            return (
              <div key={day} className="border-b border-r border-zinc-100 min-h-[100px] p-2 hover:bg-zinc-50 transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full",
                    day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() 
                      ? "bg-emerald-600 text-white" 
                      : "text-zinc-500"
                  )}>
                    {day}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-600 transition-all">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md border truncate font-medium cursor-pointer transition-transform hover:scale-[1.02]",
                        STAGE_COLORS[event.stage]
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(['idea', 'draft', 'review', 'approved', 'published'] as PipelineStage[]).map((stage) => (
          <div key={stage} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", STAGE_COLORS[stage].split(' ')[0])} />
                {stage}
              </h4>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
                {events.filter(e => e.stage === stage).length}
              </span>
            </div>
            <div className="space-y-2">
              {events.filter(e => e.stage === stage).map(event => (
                <div key={event.id} className="p-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors">
                  {event.title}
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all flex items-center justify-center gap-1 text-xs">
                <Plus size={12} />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
