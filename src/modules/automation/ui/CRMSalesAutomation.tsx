import React from 'react';
import { Users, DollarSign, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CRMSalesAutomation() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          CRM & Sales Automation
        </h1>
        <p className="text-zinc-500 text-lg">
          Automate lead management and sales processes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Auto Lead Assignment', desc: 'Assign leads to the right sales reps automatically.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { title: 'Lead Scoring', desc: 'Automatically score leads based on engagement.', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { title: 'Follow-up Reminders', desc: 'Never miss a follow-up with automated alerts.', icon: ArrowRight, color: 'text-orange-500', bg: 'bg-orange-50' },
          { title: 'Quotation Auto-generation', desc: 'Create quotes instantly based on deal stages.', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((item) => (
          <div key={item.title} className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:border-blue-600 transition-all cursor-pointer group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", item.bg, item.color)}>
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
            <p className="text-zinc-500 mb-6 leading-relaxed">{item.desc}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
              Configure <ArrowRight size={16} className="ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
