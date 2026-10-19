import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Download, Save, TrendingUp, HandCoins, ArrowRight,
  Plus, Trash2, GripVertical, AlertCircle, PieChart, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface StreamItem {
  id: string;
  name: string;
  amount: number | '';
}

export default function ProfitCalculator() {
  const navigate = useNavigate();

  // Dynamic Lists State
  const [revenueStreams, setRevenueStreams] = useState<StreamItem[]>([
    { id: 'rev-1', name: 'Product Sales', amount: 5000 },
    { id: 'rev-2', name: 'Services', amount: 2000 }
  ]);

  const [fixedExpenses, setFixedExpenses] = useState<StreamItem[]>([
    { id: 'exp-1', name: 'Rent', amount: 800 },
    { id: 'exp-2', name: 'Salaries', amount: 2500 },
    { id: 'exp-3', name: 'Software Subs', amount: 150 }
  ]);

  const [variableCostPercent, setVariableCostPercent] = useState<number>(30); // 30% of revenue
  const [whatIfScenario, setWhatIfScenario] = useState<number>(0); // 0 to 100%

  // Calculated State
  const [results, setResults] = useState<any>(null);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const calculateProfits = () => {
    // Sum arrays
    const totalRevRaw = revenueStreams.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalFixed = fixedExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    // Apply What-If
    const totalRev = totalRevRaw * (1 + (whatIfScenario / 100));
    
    // Variables
    const totalVar = totalRev * (variableCostPercent / 100);
    
    // Profit
    const grossProfit = totalRev - totalVar;
    const netProfit = grossProfit - totalFixed;
    const margin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;

    setResults({
      revenue: totalRev,
      fixedCosts: totalFixed,
      variableCosts: totalVar,
      grossProfit,
      netProfit,
      margin
    });
  };

  // Auto calculate on any change
  useEffect(() => {
    calculateProfits();
  }, [revenueStreams, fixedExpenses, variableCostPercent, whatIfScenario]);

  // Handlers for dynamic lists
  const addItem = (type: 'revenue' | 'expense') => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), name: '', amount: '' };
    if (type === 'revenue') {
      setRevenueStreams([...revenueStreams, newItem]);
    } else {
      setFixedExpenses([...fixedExpenses, newItem]);
    }
  };

  const updateItem = (type: 'revenue' | 'expense', id: string, field: keyof StreamItem, value: any) => {
    if (type === 'revenue') {
      setRevenueStreams(revenueStreams.map(item => item.id === id ? { ...item, [field]: value } : item));
    } else {
      setFixedExpenses(fixedExpenses.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
  };

  const removeItem = (type: 'revenue' | 'expense', id: string) => {
    if (type === 'revenue') {
      setRevenueStreams(revenueStreams.filter(item => item.id !== id));
    } else {
      setFixedExpenses(fixedExpenses.filter(item => item.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col xl:flex-row gap-6">
      
      {/* Left Panel: Form builder */}
      <motion.div 
        layout
        className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col xl:w-5/12 h-full"
      >
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-500" />
            Profit Calculator
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Forecast your monthly net profit by tracking revenues and expenses.
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          
          {/* Revenue Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Monthly Revenue
              </h3>
              <button onClick={() => addItem('revenue')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Stream
              </button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {revenueStreams.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 group"
                  >
                    <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab shrink-0 hidden sm:block" />
                    <input
                      type="text"
                      placeholder="e.g. Sales"
                      value={item.name}
                      onChange={(e) => updateItem('revenue', item.id, 'name', e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-zinc-200 focus:border-emerald-500 outline-none text-sm transition-colors"
                    />
                    <div className="relative w-32 shrink-0">
                      <input
                        type="number"
                        placeholder="0"
                        value={item.amount}
                        onChange={(e) => updateItem('revenue', item.id, 'amount', e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-3 pr-10 p-2.5 rounded-xl border border-zinc-200 focus:border-emerald-500 outline-none text-sm transition-colors font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">TND</span>
                    </div>
                    <button 
                      onClick={() => removeItem('revenue', item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {revenueStreams.length === 0 && (
                <div className="text-sm text-zinc-500 italic p-3 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                  No revenue streams added.
                </div>
              )}
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Expenses Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-red-500" /> Fixed Expenses
              </h3>
              <button onClick={() => addItem('expense')} className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Expense
              </button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {fixedExpenses.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 group"
                  >
                    <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab shrink-0 hidden sm:block" />
                    <input
                      type="text"
                      placeholder="e.g. Rent"
                      value={item.name}
                      onChange={(e) => updateItem('expense', item.id, 'name', e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-zinc-200 focus:border-red-500 outline-none text-sm transition-colors"
                    />
                    <div className="relative w-32 shrink-0">
                      <input
                        type="number"
                        placeholder="0"
                        value={item.amount}
                        onChange={(e) => updateItem('expense', item.id, 'amount', e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-3 pr-10 p-2.5 rounded-xl border border-zinc-200 focus:border-red-500 outline-none text-sm transition-colors font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">TND</span>
                    </div>
                    <button 
                      onClick={() => removeItem('expense', item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {fixedExpenses.length === 0 && (
                <div className="text-sm text-zinc-500 italic p-3 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                  No fixed expenses added.
                </div>
              )}
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Variable Costs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" /> Variable Costs Group
              </h3>
              <span className="text-sm font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                {variableCostPercent}% of Rev.
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-2">
              Costs that scale with sales (e.g., packaging, raw materials, shipping).
            </p>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={variableCostPercent}
              onChange={(e) => setVariableCostPercent(Number(e.target.value))}
              className="w-full accent-purple-500 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>
      </motion.div>

      {/* Right Panel: Results Dashboard */}
      <div className="flex-1 flex flex-col h-full overflow-hidden space-y-6">
        
        {/* Main Result Hero */}
        <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden shrink-0 text-white flex flex-col justify-center min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Projected Net Profit</h2>
              
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold font-mono",
                results?.margin > 20 ? "bg-emerald-500/20 text-emerald-400" : 
                results?.margin > 0 ? "bg-amber-500/20 text-amber-400" : 
                "bg-red-500/20 text-red-400"
              )}>
                {results?.margin.toFixed(1)}% Margin
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className={cn(
                "text-6xl font-bold font-mono tracking-tight",
                results?.netProfit < 0 ? "text-red-400" : "text-white"
              )}>
                {results ? formatCurrency(results.netProfit) : '0'}
              </span>
              <span className="text-zinc-500 font-semibold text-xl">TND / mo</span>
            </div>

            {results?.netProfit < 0 && (
              <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-sm px-3 py-1.5 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4" /> You are operating at a loss. Try reducing fixed costs.
              </div>
            )}
            {results?.netProfit > 0 && (
              <p className="text-zinc-400 text-sm max-w-sm">
                Healthy projection. You have a gross margin of {formatCurrency(results?.grossProfit)} TND before fixed costs.
              </p>
            )}
          </div>
        </div>

        {/* Visual Cascade */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm overflow-y-auto flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-400" /> Cash Flow Cascade
          </h3>
          
          <div className="space-y-4 max-w-md mx-auto w-full">
            {/* Revenue */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-semibold text-emerald-800">Total Revenue</span>
              <span className="font-bold font-mono text-emerald-700">{formatCurrency(results?.revenue || 0)}</span>
            </div>
            
            <div className="flex justify-center -my-2 text-zinc-300"><ArrowRight className="w-4 h-4 rotate-90" /></div>

            {/* Variable */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="font-medium text-purple-800 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-[10px] font-bold">-</span>
                Variable Costs
              </span>
              <span className="font-mono text-purple-700">{formatCurrency(results?.variableCosts || 0)}</span>
            </div>

            <div className="flex justify-center -my-2 text-zinc-300"><ArrowRight className="w-4 h-4 rotate-90" /></div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="font-semibold text-blue-800">Gross Profit</span>
              <span className="font-bold font-mono text-blue-700">{formatCurrency(results?.grossProfit || 0)}</span>
            </div>

            <div className="flex justify-center -my-2 text-zinc-300"><ArrowRight className="w-4 h-4 rotate-90" /></div>

            {/* Fixed */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-100">
              <span className="font-medium text-red-800 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-[10px] font-bold">-</span>
                Fixed Expenses
              </span>
              <span className="font-mono text-red-700">{formatCurrency(results?.fixedCosts || 0)}</span>
            </div>
            
            <div className="flex justify-center -my-2 text-zinc-300"><ArrowRight className="w-4 h-4 rotate-90" /></div>

            {/* Net Profit */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="font-bold text-white">Net Profit</span>
              <span className="font-bold font-mono text-white">{formatCurrency(results?.netProfit || 0)}</span>
            </div>
          </div>
        </div>

        {/* What-if Simulator */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm shrink-0 bg-emerald-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-emerald-500" /> What-If Scenario
            </h3>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              +{whatIfScenario}% Revenue
            </span>
          </div>
          <p className="text-sm text-emerald-800/70 mb-4">
            If you grow your sales volume by {whatIfScenario}%, assuming fixed costs stay the same.
          </p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={whatIfScenario}
            onChange={(e) => setWhatIfScenario(Number(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 shrink-0">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export PL Report
          </button>
          <button className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98]">
            <Save className="w-4 h-4" /> Save Calculator State
          </button>
        </div>

      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a4.425 4.425 0 0 1-.2-8.083l8.6-2.522a2 2 0 0 0 1.3-1.3l2.522-8.6a4.425 4.425 0 0 1 8.083-.2l1.582 6.135a2 2 0 0 0 1.436 1.436l6.135 1.582a4.425 4.425 0 0 1 .2 8.083l-8.6 2.522a2 2 0 0 0-1.3 1.3l-2.522 8.6a4.425 4.425 0 0 1-8.083.2Z" />
    </svg>
  );
}
