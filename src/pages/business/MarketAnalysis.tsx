import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Search, RefreshCcw, TrendingUp, Users, MapPin, 
  Activity, ArrowUpRight, ArrowDownRight, Target, Shield, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const GOVERNORATES = [
  'All Tunisia', 'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 
  'Kairouan', 'Kasserine', 'Kebili', 'Kef', 'Mahdia', 'Manouba', 'Medenine', 
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 
  'Tozeur', 'Tunis', 'Zaghouan'
];

export default function MarketAnalysis() {
  const navigate = useNavigate();
  
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('All Tunisia');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !location) return;

    setIsAnalyzing(true);
    setReport(null);

    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock Data Payload
    setReport({
      marketSize: "1.2M",
      growthRate: "+14.5%",
      demandTrend: "High",
      competitorDensity: "Medium",
      demographics: [
        { group: "18-24", pct: 25 },
        { group: "25-34", pct: 45 },
        { group: "35-44", pct: 20 },
        { group: "45+", pct: 10 },
      ],
      swot: {
        strengths: ["Rising consumer spending", "Low barriers to entry locally", "Tech adoption increasing"],
        weaknesses: ["Supply chain bottlenecks", "Price sensitive demographic", "High generic competition"],
        opportunities: ["Untapped regional segments", "E-commerce expansion", "B2B partnerships"],
        threats: ["Inflationary pressures", "Import restrictions", "Big international players"]
      }
    });

    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
      
      {/* Header & Input Form */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 shrink-0 z-10 relative">
        <div className="hidden sm:block absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-50 to-transparent rounded-r-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <BarChart className="w-6 h-6 text-emerald-500" />
              Market Analysis
            </h1>
            <p className="text-zinc-500 mt-1 text-sm max-w-md">
              Get an instant AI-powered macro and micro breakdown of your industry and region.
            </p>
          </div>
          
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-60 relative">
              <input 
                required
                type="text" 
                placeholder="e.g. Coffee Shops" 
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all shadow-sm"
              />
            </div>
            <div className="w-full sm:w-48 relative">
              <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all shadow-sm bg-white appearance-none"
              >
                {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={isAnalyzing || !industry}
              className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Analyze
            </button>
          </form>
        </div>
      </div>

      {/* Empty State */}
      {!report && !isAnalyzing && (
        <div className="flex-1 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <BarChart className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready to explore the market?</h3>
          <p className="text-zinc-500 max-w-sm">
            Enter your industry keyword and target region above to generate a comprehensive AI market report including SWOT analysis and demographics.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex-1 border border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-white shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <div className="relative z-10">
            <RefreshCcw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-900">Crunching Market Data...</h3>
            <p className="text-zinc-500 text-sm mt-1">Analyzing competitor density and demographic trends in {location}.</p>
          </div>
        </div>
      )}

      {/* Dashboard Results View */}
      <AnimatePresence>
        {report && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col xl:flex-row gap-6 h-full overflow-hidden"
          >
            {/* Left Column (Metrics + Demographics) */}
            <div className="flex flex-col gap-6 xl:w-1/3 shrink-0 h-full overflow-y-auto hide-scrollbar">
              
              <div className="grid gap-3">
                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Est. Target Market</h4>
                    <span className="text-3xl font-black text-zinc-900 tracking-tight">{report.marketSize}</span>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">YoY Growth Rate</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-emerald-600 tracking-tight">{report.growthRate}</span>
                      <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Competitor Density</h4>
                    <span className="text-xl font-bold text-amber-600">{report.competitorDensity}</span>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Activity className="w-6 h-6" /></div>
                </div>
              </div>

              {/* Demographics Chart Mock */}
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 flex-1 flex flex-col">
                <h4 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-500" /> Age Demographics
                </h4>
                <div className="flex-1 flex flex-col justify-end gap-3 px-2 mt-auto min-h-[160px]">
                  {report.demographics.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-zinc-600 w-12 shrink-0">{item.group}</span>
                      <div className="flex-1 h-6 bg-zinc-100 rounded-r-md rounded-l-sm overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full bg-indigo-500 relative flex justify-end items-center pr-2"
                        >
                          <span className="text-[10px] font-bold text-white leading-none">{item.pct}%</span>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (SWOT Matrix) */}
            <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 lg:p-8 flex-1 flex flex-col relative overflow-hidden xl:h-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">S.W.O.T. Matrix</h3>
                  <p className="text-zinc-400 text-sm">Strategic analysis for {industry} in {location}.</p>
                </div>
                <div className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border border-zinc-700">
                  AI Generated
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-1 relative z-10 overflow-y-auto hide-scrollbar pb-6">
                
                {/* Strengths */}
                <div className="bg-zinc-800/80 backdrop-blur-md rounded-xl p-5 border-t-4 border-emerald-500 transition-transform hover:-translate-y-1 hover:bg-zinc-800">
                  <h4 className="text-emerald-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Strengths
                  </h4>
                  <ul className="space-y-3">
                    {report.swot.strengths.map((str: string, i: number) => (
                      <li key={i} className="text-zinc-300 text-sm flex gap-3 leading-snug">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-zinc-800/80 backdrop-blur-md rounded-xl p-5 border-t-4 border-amber-500 transition-transform hover:-translate-y-1 hover:bg-zinc-800">
                  <h4 className="text-amber-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" /> Weaknesses
                  </h4>
                  <ul className="space-y-3">
                    {report.swot.weaknesses.map((wk: string, i: number) => (
                      <li key={i} className="text-zinc-300 text-sm flex gap-3 leading-snug">
                        <span className="text-amber-500 mt-0.5 shrink-0">•</span> {wk}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-zinc-800/80 backdrop-blur-md rounded-xl p-5 border-t-4 border-blue-500 transition-transform hover:-translate-y-1 hover:bg-zinc-800">
                  <h4 className="text-blue-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Opportunities
                  </h4>
                  <ul className="space-y-3">
                    {report.swot.opportunities.map((opp: string, i: number) => (
                      <li key={i} className="text-zinc-300 text-sm flex gap-3 leading-snug">
                        <span className="text-blue-500 mt-0.5 shrink-0">•</span> {opp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-zinc-800/80 backdrop-blur-md rounded-xl p-5 border-t-4 border-red-500 transition-transform hover:-translate-y-1 hover:bg-zinc-800">
                  <h4 className="text-red-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Threats
                  </h4>
                  <ul className="space-y-3">
                    {report.swot.threats.map((thr: string, i: number) => (
                      <li key={i} className="text-zinc-300 text-sm flex gap-3 leading-snug">
                        <span className="text-red-500 mt-0.5 shrink-0">•</span> {thr}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PieChartIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
