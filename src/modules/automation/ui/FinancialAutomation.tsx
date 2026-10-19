import React from 'react';
import { Receipt, CreditCard, RefreshCcw, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FinancialAutomation() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Banknote className="w-8 h-8 text-emerald-700" />
          Financial Automation
        </h1>
        <p className="text-zinc-500 text-lg">
          Automate your billing, invoicing, and reconciliation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Recurring Invoices', desc: 'Automatically generate and send periodic invoices.', icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Payment Reminders', desc: 'Automated follow-ups for overdue payments.', icon: CreditCard, color: 'text-red-600', bg: 'bg-red-50' },
          { title: 'Auto-reconciliation', desc: 'Match payments to invoices automatically.', icon: RefreshCcw, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Commission Calculation', desc: 'Automate sales commission tracking and payouts.', icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item) => (
          <div key={item.title} className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:border-emerald-700 transition-all cursor-pointer group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", item.bg, item.color)}>
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
            <p className="text-zinc-500 mb-6 leading-relaxed">{item.desc}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-all">
              Configure <RefreshCcw size={16} className="ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
