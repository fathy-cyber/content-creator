import React from 'react';
import { DollarSign, Target, TrendingUp, BarChart3, CreditCard, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import ToolPageLayout from '../shared/ToolPageLayout';

export default function AdsManager() {
  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8 text-emerald-600" />
          Ads Manager
        </h1>
        <p className="text-zinc-500 text-lg">
          Manage and optimize your paid advertising campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Meta Ads Integration', desc: 'Sync your Facebook and Instagram ad accounts.', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Google Ads Integration', desc: 'Manage your search and display campaigns.', icon: Target, color: 'text-red-500', bg: 'bg-red-50' },
          { title: 'Budget Tracking', desc: 'Monitor spending and avoid overages.', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Performance Optimization', desc: 'Analyze ROAS and optimize for better leads.', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((item) => (
          <div key={item.title} className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:border-emerald-600 transition-all cursor-pointer group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", item.bg, item.color)}>
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
            <p className="text-zinc-500 mb-6 leading-relaxed">{item.desc}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
              Open Dashboard <TrendingUp size={16} className="ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
    </ToolPageLayout>
  );
}
