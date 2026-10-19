import React from 'react';
import { CheckCircle2, Clock, ListTodo, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TaskProjectAutomation() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <ListTodo className="w-8 h-8 text-emerald-600" />
          Task & Project Automation
        </h1>
        <p className="text-zinc-500 text-lg">
          Streamline your operations and task management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Auto-create Tasks', desc: 'Generate tasks automatically from sales or CRM events.', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { title: 'Recurring Tasks', desc: 'Set up repetitive tasks with ease.', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { title: 'Deadline Alerts', desc: 'Get notified before critical deadlines hit.', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
          { title: 'SLA Timers', desc: 'Monitor and enforce Service Level Agreements.', icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((item) => (
          <div key={item.title} className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:border-emerald-600 transition-all cursor-pointer group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", item.bg, item.color)}>
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
            <p className="text-zinc-500 mb-6 leading-relaxed">{item.desc}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
              Manage <CheckCircle2 size={16} className="ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
