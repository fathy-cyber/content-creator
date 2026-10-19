import React, { useState } from 'react';
import {
  Calculator, TrendingUp, DollarSign, Users, Percent, PieChart,
  Plus, Trash2, Save, Loader2, RefreshCw, BarChart3, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { roiService, ROIConfig, ROIResult, ChannelROI } from '../../services/roiService';
import ToolPageLayout from '../shared/ToolPageLayout';

const DEFAULT_CHANNELS = [
  { name: 'Google Ads', spend: 5000, expectedCpc: 1.5, expectedCtr: 3, expectedCvr: 2.5, expectedAov: 100 },
  { name: 'Meta Ads', spend: 3000, expectedCpc: 0.8, expectedCtr: 2.5, expectedCvr: 2, expectedAov: 80 },
];

export default function ROICalculator() {
  const [config, setConfig] = useState<ROIConfig>({
    campaignName: '',
    budget: 8000,
    currency: 'TND',
    channels: DEFAULT_CHANNELS,
    fixedCosts: 1000,
    durationDays: 30,
  });
  const [result, setResult] = useState<ROIResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateChannel = (idx: number, field: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      channels: prev.channels.map((ch, i) =>
        i === idx ? { ...ch, [field]: value } : ch
      ),
    }));
  };

  const addChannel = () => {
    setConfig(prev => ({
      ...prev,
      channels: [...prev.channels, { name: '', spend: 0, expectedCpc: 0, expectedCtr: 0, expectedCvr: 0, expectedAov: 0 }],
    }));
  };

  const removeChannel = (idx: number) => {
    setConfig(prev => ({
      ...prev,
      channels: prev.channels.filter((_, i) => i !== idx),
    }));
  };

  const calculate = () => {
    if (config.channels.length === 0) {
      toast.error('Add at least one channel');
      return;
    }
    const res = roiService.calculate(config);
    setResult(res);
    toast.success('ROI projection calculated');
  };

  const saveResult = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await roiService.saveAsAsset(config, result);
      toast.success('Saved to assets');
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (v: number) => {
    const abs = Math.abs(v);
    let short: string;
    if (abs >= 1_000_000_000) {
      short = `${(v / 1_000_000_000).toFixed(1)}B`;
    } else if (abs >= 1_000_000) {
      short = `${(v / 1_000_000).toFixed(1)}M`;
    } else if (abs >= 1_000) {
      short = `${(v / 1_000).toFixed(1)}K`;
    } else {
      short = String(Math.round(v));
    }
    return `${config.currency} ${short}`;
  };

  const MetricCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm min-w-0">
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase mb-2">
        {icon} {label}
      </div>
      <div className={cn("text-xl font-black truncate", color)} title={value}>{value}</div>
    </div>
  );

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Calculator className="w-8 h-8 text-emerald-600" />
          ROI Calculator
        </h1>
        <p className="text-zinc-500 text-lg">
          Model campaign ROI across channels with what-if scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" /> Campaign Setup
              </h2>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Campaign Name</label>
                  <input
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 transition-all"
                    value={config.campaignName}
                    onChange={(e) => setConfig(prev => ({ ...prev, campaignName: e.target.value }))}
                    placeholder="e.g. Q3 Lead Gen"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Duration (days)</label>
                    <input
                      type="number"
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 transition-all"
                      value={config.durationDays}
                      onChange={(e) => setConfig(prev => ({ ...prev, durationDays: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Fixed Costs</label>
                    <input
                      type="number"
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 transition-all"
                      value={config.fixedCosts}
                      onChange={(e) => setConfig(prev => ({ ...prev, fixedCosts: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-700 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-emerald-500" /> Channels
                </h3>
                <button onClick={addChannel} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {config.channels.map((ch, idx) => (
                <div key={idx} className="bg-zinc-50 rounded-xl p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <input
                      className="w-full p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500 transition-all text-sm font-bold"
                      value={ch.name}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        channels: prev.channels.map((c, i) => i === idx ? { ...c, name: e.target.value } : c),
                      }))}
                      placeholder="Channel name"
                    />
                    {config.channels.length > 1 && (
                      <button onClick={() => removeChannel(idx)} className="p-1.5 text-zinc-400 hover:text-red-500 ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Budget</label>
                      <input type="number" className="w-full p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500 transition-all text-sm"
                        value={ch.spend} onChange={(e) => updateChannel(idx, 'spend', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">CPC</label>
                      <input type="number" step="0.01" className="w-full p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500 transition-all text-sm"
                        value={ch.expectedCpc} onChange={(e) => updateChannel(idx, 'expectedCpc', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">CTR %</label>
                      <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500 transition-all text-sm"
                        value={ch.expectedCtr} onChange={(e) => updateChannel(idx, 'expectedCtr', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">CVR %</label>
                      <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500 transition-all text-sm"
                        value={ch.expectedCvr} onChange={(e) => updateChannel(idx, 'expectedCvr', Number(e.target.value))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">AOV</label>
                      <input type="number" className="w-full p-2 rounded-lg border border-zinc-200 outline-none focus:border-emerald-500 transition-all text-sm"
                        value={ch.expectedAov} onChange={(e) => updateChannel(idx, 'expectedAov', Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={calculate}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
            >
              <BarChart3 className="w-5 h-5" />
              Calculate ROI
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                <Calculator className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">No Projection Yet</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  Set up your campaign channels and budget to see projected ROI.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" /> Projection
                </h2>
                <button
                  onClick={saveResult}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-md shadow-blue-100"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to Assets
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Total Budget" value={formatCurrency(result.totalBudget)} color="text-zinc-900" />
                <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="Revenue" value={formatCurrency(result.totalRevenue)} color="text-emerald-600" />
                <MetricCard icon={<Percent className="w-4 h-4" />} label="ROAS" value={`${result.roas.toFixed(2)}x`} color={result.roas >= 3 ? 'text-emerald-600' : result.roas >= 1 ? 'text-amber-600' : 'text-red-600'} />
                <MetricCard icon={<Users className="w-4 h-4" />} label="CPA" value={formatCurrency(result.cpa)} color={result.cpa <= 20 ? 'text-emerald-600' : 'text-amber-600'} />
                <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Total Cost" value={formatCurrency(result.totalCost)} color="text-zinc-900" />
                <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="Profit" value={formatCurrency(result.profit)} color={result.profit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
                <MetricCard icon={<Percent className="w-4 h-4" />} label="Margin" value={`${result.profitMargin.toFixed(1)}%`} color={result.profitMargin >= 20 ? 'text-emerald-600' : result.profitMargin >= 0 ? 'text-amber-600' : 'text-red-600'} />
                <MetricCard icon={<Users className="w-4 h-4" />} label="Customers" value={String(result.totalCustomers)} color="text-blue-600" />
              </div>

              {/* Channel Breakdown */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-emerald-500" /> Channel Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold text-zinc-400 uppercase border-b border-zinc-100">
                        <th className="pb-3 pr-4">Channel</th>
                        <th className="pb-3 pr-4">Spend</th>
                        <th className="pb-3 pr-4">Impr.</th>
                        <th className="pb-3 pr-4">Clicks</th>
                        <th className="pb-3 pr-4">Leads</th>
                        <th className="pb-3 pr-4">Customers</th>
                        <th className="pb-3 pr-4">Revenue</th>
                        <th className="pb-3 pr-4">ROAS</th>
                        <th className="pb-3">CPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.channelBreakdown.map((ch: ChannelROI, i: number) => (
                        <tr key={i} className="border-b border-zinc-50 text-zinc-700">
                          <td className="py-3 pr-4 font-bold">{ch.name}</td>
                          <td className="py-3 pr-4">{formatCurrency(ch.spend)}</td>
                          <td className="py-3 pr-4">{ch.impressions.toLocaleString()}</td>
                          <td className="py-3 pr-4">{ch.clicks.toLocaleString()}</td>
                          <td className="py-3 pr-4">{ch.leads.toLocaleString()}</td>
                          <td className="py-3 pr-4">{ch.customers}</td>
                          <td className="py-3 pr-4">{formatCurrency(ch.revenue)}</td>
                          <td className="py-3 pr-4 font-bold">{ch.roas.toFixed(1)}x</td>
                          <td className="py-3">{formatCurrency(ch.cpa)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* What-If Scenarios */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-4">
                  <RefreshCw className="w-4 h-4 text-emerald-500" /> What-If Scenarios
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.whatIfs.map((scenario, i) => {
                    const delta = scenario.result.profit - result.profit;
                    return (
                      <div key={i} className="bg-zinc-50 rounded-xl p-4 space-y-2">
                        <div className="text-xs font-bold text-zinc-500 uppercase">{scenario.label}</div>
                        <div className="text-lg font-black text-zinc-900">{formatCurrency(scenario.result.totalRevenue)}</div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">ROAS: <strong>{scenario.result.roas.toFixed(2)}x</strong></span>
                          <span className="text-zinc-500">CPA: <strong>{formatCurrency(scenario.result.cpa)}</strong></span>
                        </div>
                        <div className={cn("text-xs font-bold", delta >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {delta >= 0 ? '+' : ''}{formatCurrency(delta)} vs base
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Break-even */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-500" /> Break-Even
                </h3>
                <p className="text-zinc-600">
                  You need <strong className="text-zinc-900">{result.breakEvenPoint} customers</strong> at the average AOV to break even on <strong className="text-zinc-900">{formatCurrency(result.totalCost)}</strong> in total costs.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}
