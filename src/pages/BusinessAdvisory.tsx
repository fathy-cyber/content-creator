import React, { useState } from 'react';
import { TrendingUp, Calculator, Wallet, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BusinessAdvisory() {
  const [cost, setCost] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  const totalCost = cost * volume;
  const totalRevenue = price * volume;
  const totalProfit = totalRevenue - totalCost;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Business Advisory</h1>
        <p className="text-zinc-500 mt-1">Strategic financial tools for Tunisian small businesses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Calculator size={20} />
              </div>
              <h3 className="font-bold text-zinc-900">Profit Calculator</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Unit Cost (TND)</label>
                <input 
                  type="number" 
                  value={cost || ''}
                  onChange={(e) => setCost(Number(e.target.value))}
                  placeholder="0.000"
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Unit Price (TND)</label>
                <input 
                  type="number" 
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0.000"
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Monthly Volume</label>
                <input 
                  type="number" 
                  value={volume || ''}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-900 rounded-2xl text-white space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Target size={14} />
              Advisory Insight
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {margin < 20 
                ? "Your margin is below the healthy average for Tunisian SMEs. Consider optimizing costs or adjusting your pricing strategy."
                : "Great job! Your margins are healthy. Focus on increasing volume to maximize total profit."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`${totalRevenue.toLocaleString()} TND`} 
            icon={<Wallet className="text-blue-600" />} 
            color="blue"
          />
          <StatCard 
            title="Total Profit" 
            value={`${totalProfit.toLocaleString()} TND`} 
            icon={<TrendingUp className="text-emerald-600" />} 
            color="emerald"
            subtitle={`${margin.toFixed(1)}% Margin`}
          />
          
          <div className="md:col-span-2 p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-6">Profitability Projection</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-24 text-xs font-bold text-zinc-400">REVENUE</div>
                <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="w-24 text-right text-xs font-mono font-bold">{totalRevenue} TND</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-xs font-bold text-zinc-400">COSTS</div>
                <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${(totalCost / totalRevenue) * 100 || 0}%` }}></div>
                </div>
                <div className="w-24 text-right text-xs font-mono font-bold">{totalCost} TND</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-xs font-bold text-zinc-400">PROFIT</div>
                <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(totalProfit / totalRevenue) * 100 || 0}%` }}></div>
                </div>
                <div className="w-24 text-right text-xs font-mono font-bold text-emerald-600">{totalProfit} TND</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: { title: string, value: string, icon: React.ReactNode, color: string, subtitle?: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-lg", `bg-${color}-50`)}>
          {icon}
        </div>
        <ArrowRight size={16} className="text-zinc-300" />
      </div>
      <div>
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        <div className="text-xs text-zinc-500 mt-1 flex justify-between">
          <span>{title}</span>
          {subtitle && <span className="font-bold text-emerald-600">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
