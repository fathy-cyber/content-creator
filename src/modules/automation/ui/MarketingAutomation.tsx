import React from 'react';
import { Mail, Zap, Share2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketingAutomation() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-orange-500" />
          Marketing Automation
        </h1>
        <p className="text-zinc-500 text-lg">
          Drive engagement with automated marketing workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Email Sequences', desc: 'Nurture leads with multi-step email drips.', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
          { title: 'Drip Campaigns', desc: 'Schedule content delivery over time.', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
          { title: 'Cart Abandonment', desc: 'Recover lost sales with automated reminders.', icon: Target, color: 'text-red-500', bg: 'bg-red-50' },
          { title: 'Retargeting Triggers', desc: 'Activate campaigns based on user behavior.', icon: Share2, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((item) => (
          <div key={item.title} className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:border-orange-500 transition-all cursor-pointer group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", item.bg, item.color)}>
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
            <p className="text-zinc-500 mb-6 leading-relaxed">{item.desc}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-all">
              Setup <Zap size={16} className="ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
