import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, RefreshCcw, HandCoins, TrendingUp, Layers, Target,
  Download, MessageSquare, Save, Info, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function PricingStrategy() {
  const navigate = useNavigate();

  // Form State
  const [productName, setProductName] = useState('');
  const [cogs, setCogs] = useState<number | ''>(''); // Cost of goods sold per unit
  const [fixedCosts, setFixedCosts] = useState<number | ''>(''); // Monthly fixed costs
  const [targetMargin, setTargetMargin] = useState<number>(30); // Target profit margin %
  const [salesVolume, setSalesVolume] = useState<number | ''>(''); // Estimated monthly sales

  // UI State
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || cogs === '' || fixedCosts === '' || salesVolume === '') return;

    setIsCalculating(true);
    setResults(null);

    // Mock Calculation Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic calculations
    const costPerUnit = Number(cogs);
    const fixed = Number(fixedCosts);
    const volume = Number(salesVolume);
    const margin = Number(targetMargin) / 100;

    // Minimum price to break even at this volume
    const breakEvenPrice = costPerUnit + (fixed / volume);
    
    // Target price (COGS + Fixed/Volume) / (1 - targetMargin)
    const baseTargetPrice = breakEvenPrice / (1 - margin);
    const finalPrice = Math.ceil(baseTargetPrice);

    // Good, Better, Best Tiers Strategy
    const tiers = {
      good: {
        name: 'Basic / Core',
        price: Math.max(breakEvenPrice * 1.1, finalPrice * 0.85),
        description: 'Stripped down version. Captures price-sensitive customers.',
        margin: ((Math.max(breakEvenPrice * 1.1, finalPrice * 0.85) - costPerUnit) / Math.max(breakEvenPrice * 1.1, finalPrice * 0.85)) * 100
      },
      better: {
        name: 'Standard / Recommended',
        price: finalPrice,
        description: 'Your core offering hitting the target margin.',
        margin: targetMargin
      },
      best: {
        name: 'Premium / Deluxe',
        price: finalPrice * 1.4,
        description: 'Bundled with extras. High margin, low volume.',
        margin: ((finalPrice * 1.4 - costPerUnit) / (finalPrice * 1.4)) * 100
      }
    };

    setResults({
      finalPrice,
      breakEvenPrice: isFinite(breakEvenPrice) ? breakEvenPrice : 0,
      monthlyProfit: (finalPrice * volume) - (costPerUnit * volume) - fixed,
      profitPerUnit: finalPrice - costPerUnit,
      tiers,
      competitors: [
        { name: 'Market Average', price: finalPrice * 0.95 },
        { name: 'Local Premium Brand', price: finalPrice * 1.3 }
      ]
    });

    setIsCalculating(false);
  };

  const clearForm = () => {
    setProductName('');
    setCogs('');
    setFixedCosts('');
    setTargetMargin(30);
    setSalesVolume('');
    setResults(null);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col xl:flex-row gap-6">
      
      {/* Left Panel: Form */}
      <motion.div 
        layout
        className={cn(
          "bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all duration-500",
          results ? "xl:w-5/12" : "w-full max-w-2xl mx-auto"
        )}
      >
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-500" />
            Smart Pricing Strategy
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Find the optimal price point based on your costs, volume, and profit targets.
          </p>
        </div>

        <form onSubmit={handleCalculate} className="p-6 flex-1 overflow-y-auto space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-800">Product / Service Name</label>
            <input
              required
              type="text"
              placeholder="e.g., Premium Leather Wallet"
              className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isCalculating}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                Cost per Unit (COGS) <Info className="w-4 h-4 text-zinc-400" />
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                  className="w-full pl-3 pr-12 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                  value={cogs}
                  onChange={(e) => setCogs(e.target.value ? Number(e.target.value) : '')}
                  disabled={isCalculating}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-zinc-500 text-sm font-medium">TND</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                Monthly Fixed Costs <Info className="w-4 h-4 text-zinc-400" />
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1000"
                  className="w-full pl-3 pr-12 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(e.target.value ? Number(e.target.value) : '')}
                  disabled={isCalculating}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-zinc-500 text-sm font-medium">TND</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-800">Estimated Monthly Sales Volume</label>
            <div className="relative">
              <input
                required
                type="number"
                min="1"
                step="1"
                placeholder="e.g., 50 units"
                className="w-full pl-3 pr-16 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                value={salesVolume}
                onChange={(e) => setSalesVolume(e.target.value ? Number(e.target.value) : '')}
                disabled={isCalculating}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-zinc-500 text-sm font-medium">Units</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-800">Target Profit Margin</label>
              <span className="text-sm font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {targetMargin}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
              disabled={isCalculating}
            />
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>Low (5%)</span>
              <span>High (95%)</span>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={clearForm}
              disabled={isCalculating}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </button>
            <button
              type="submit"
              disabled={isCalculating || !productName || cogs === '' || fixedCosts === '' || salesVolume === ''}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" /> Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" /> Generate Strategy
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Right Panel: Results */}
      <AnimatePresence>
        {results && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, display: 'none' }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* Hero Recommended Price */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 sm:p-8 shadow-md mb-6 relative overflow-hidden shrink-0 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400 rounded-full blur-2xl opacity-20 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div>
                  <h2 className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Recommended Price
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold font-mono tracking-tight">{formatCurrency(results.finalPrice)}</span>
                    <span className="text-emerald-200 font-semibold text-lg">TND</span>
                  </div>
                  <p className="text-emerald-50 mt-2 text-sm max-w-sm">
                    Pricing {productName} at this point secures your target margin of {targetMargin}% at {salesVolume} units/mo.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 w-full sm:w-auto">
                  <div className="text-emerald-100 text-xs uppercase tracking-wider font-semibold mb-1">Est. Monthly Profit</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                    {formatCurrency(results.monthlyProfit)} <span className="text-sm font-normal text-emerald-200">TND</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Break-Even Price</p>
                  <p className="text-lg font-bold text-zinc-900">{formatCurrency(results.breakEvenPrice)} TND</p>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Gross Profit / Unit</p>
                  <p className="text-lg font-bold text-zinc-900">{formatCurrency(results.profitPerUnit)} TND</p>
                </div>
              </div>
            </div>

            {/* Strategy Tiers */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2 shrink-0">
                <Layers className="w-5 h-5 text-zinc-600" />
                <h3 className="font-bold text-zinc-900">Good, Better, Best Strategy</h3>
              </div>
              
              <div className="p-5 overflow-y-auto flex-1 h-full space-y-4">
                {/* Tier 1: Good */}
                <div className="border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-zinc-100 text-zinc-700 text-xs font-bold px-2 py-0.5 rounded-md">Option 1</span>
                      <h4 className="font-bold text-zinc-900">{results.tiers.good.name}</h4>
                    </div>
                    <p className="text-sm text-zinc-500">{results.tiers.good.description}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-xl font-bold text-zinc-900">{formatCurrency(results.tiers.good.price)} <span className="text-sm text-zinc-500 font-normal">TND</span></div>
                    <div className="text-xs font-semibold text-emerald-600">{results.tiers.good.margin.toFixed(0)}% Margin</div>
                  </div>
                </div>

                {/* Tier 2: Better (Recommended) */}
                <div className="border-2 border-emerald-500 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-emerald-50/20 relative shadow-sm transform scale-[1.02]">
                  <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <Target className="w-3 h-3" /> Recommended
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md">Option 2</span>
                      <h4 className="font-bold text-zinc-900">{results.tiers.better.name}</h4>
                    </div>
                    <p className="text-sm text-zinc-600">{results.tiers.better.description}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-xl font-bold text-emerald-700">{formatCurrency(results.tiers.better.price)} <span className="text-sm font-normal">TND</span></div>
                    <div className="text-xs font-semibold text-emerald-600">{results.tiers.better.margin.toFixed(0)}% Margin</div>
                  </div>
                </div>

                {/* Tier 3: Best */}
                <div className="border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-md">Option 3</span>
                      <h4 className="font-bold text-zinc-900">{results.tiers.best.name}</h4>
                    </div>
                    <p className="text-sm text-zinc-500">{results.tiers.best.description}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-xl font-bold text-zinc-900">{formatCurrency(results.tiers.best.price)} <span className="text-sm text-zinc-500 font-normal">TND</span></div>
                    <div className="text-xs font-semibold text-emerald-600">{results.tiers.best.margin.toFixed(0)}% Margin</div>
                  </div>
                </div>

                {/* Competitor Benchmark Note */}
                <div className="mt-6 pt-4 border-t border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-zinc-400" /> Competitor Benchmark
                  </h4>
                  <div className="bg-zinc-50 rounded-lg p-3 text-sm text-zinc-600 space-y-2">
                    {results.competitors.map((comp: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span>{comp.name}</span>
                        <span className="font-mono font-medium">{formatCurrency(comp.price)} TND</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex flex-wrap gap-3 shrink-0">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-medium rounded-xl text-sm transition-colors shadow-sm">
                  <Download className="w-4 h-4" /> Export Report
                </button>
                <button className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm">
                  <Save className="w-4 h-4" /> Save Strategy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
