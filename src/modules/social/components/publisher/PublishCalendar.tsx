import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  CheckCircle2, Clock, AlertCircle, ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { listPosts, getPost } from '../../index';

export default function PublishCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [currentDate]);

  async function loadPosts() {
    setIsLoading(true);
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      const { data, error } = await listPosts({ 
        status: 'scheduled', 
        startDate: start, 
        endDate: end 
      });
      if (error) throw error;
      setPosts(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getPostsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return posts.filter(p => p.scheduled_for?.startsWith(dateStr));
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-900">Publish Calendar</h2>
          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white rounded transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold px-2 min-w-[120px] text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white rounded transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Scheduled
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Published
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-red-500" /> Failed
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="aspect-video bg-zinc-50 border border-zinc-200 rounded-2xl animate-pulse" />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 bg-zinc-50 border-b border-zinc-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-[10px] font-bold uppercase text-zinc-400">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-32 border-b border-r border-zinc-100 bg-zinc-50/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPosts = getPostsForDay(day);
              return (
                <div key={day} className="h-32 border-b border-r border-zinc-100 p-2 relative group hover:bg-zinc-50 transition-colors">
                  <span className="text-xs font-medium text-zinc-400">{day}</span>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {dayPosts.map(post => (
                      <div 
                        key={post.id} 
                        className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] rounded truncate cursor-pointer hover:bg-blue-100"
                      >
                        {post.platform}: {post.generated_content.slice(0, 15)}...
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
