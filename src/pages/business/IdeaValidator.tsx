import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, Search, Trash2, Download, RefreshCcw, FileText, 
  MessageSquare, ChevronDown, CheckCircle2, AlertTriangle, 
  Users, Building, TrendingUp, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const GOVERNORATES = [
  'Online / All Tunisia', 'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 
  'Kairouan', 'Kasserine', 'Kebili', 'Kef', 'Mahdia', 'Manouba', 'Medenine', 
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 
  'Tozeur', 'Tunis', 'Zaghouan'
];

const INDUSTRIES = [
  'Food & Beverage', 'Fashion & Clothing', 'Beauty & Cosmetics', 
  'Technology', 'Education & Training', 'Professional Services', 
  'Retail & E-commerce', 'Health & Wellness', 'Agriculture', 
  'Tourism', 'Other'
];

export default function IdeaValidator() {
  const navigate = useNavigate();
  
  // Form State
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [budget, setBudget] = useState(5000);
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState('idea');

  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('strengths');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || !industry || !audience || !location) return;

    setIsAnalyzing(true);
    setResults(null);

    // Mock API call to analyze idea
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Determine score based on random but consistently scoped values
    const mockScore = Math.floor(Math.random() * 40) + 50; // 50-90
    
    setResults({
      score: mockScore,
      strengths: [
        "Strong demand in " + location + " for this service.",
        "Budget is well-aligned with initial MVP requirements.",
        "Clear target audience definition."
      ],
      risks: [
        "High localized competition in existing markets.",
        "Initial customer acquisition costs may be higher than expected.",
        "Regulatory compliance in the chosen sector needs review."
      ],
      market: [
        "Estimated audience size: 150,000 - 200,000 potential users.",
        "Growing trend among Gen Z and Millennials in urban areas.",
        "Social media engagement around this topic is very high currently."
      ],
      competitors: [
        "2 major established players currently monopolize 60% of the market.",
        "Several small-scale independent sellers.",
        "Opportunity exists in premium positioning or better customer service."
      ],
      revenue: "3,500 - 6,000 TND / month (Estimated post-launch 6 months)",
      nextSteps: [
        "Create a simple landing page to collect emails.",
        "Run a 50 TND test ad campaign on Facebook.",
        "Interview 5 potential customers from your target audience."
      ]
    });
    
    setIsAnalyzing(false);
  };

  const clearForm = () => {
    setIdea('');
    setIndustry('');
    setAudience('');
    setBudget(5000);
    setLocation('');
    setStage('idea');
    setResults(null);
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return { stroke: '#ef4444', text: 'text-red-500', label: 'High Risk' };
    if (score <= 60) return { stroke: '#f59e0b', text: 'text-amber-500', label: 'Moderate Potential' };
    if (score <= 80) return { stroke: '#22c55e', text: 'text-emerald-500', label: 'Promising' };
    return { stroke: '#10b981', text: 'text-emerald-600', label: 'Excellent' };
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col xl:flex-row gap-6">
      
      {/* Left Panel: Form */}
      <motion.div 
        layout
        className={cn(
          "bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all duration-500",
          results ? "xl:w-5/12" : "w-full max-w-3xl mx-auto"
        )}
      >
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-emerald-500" />
            Business Idea Validator
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Describe your idea and we'll analyze its viability in the Tunisian market
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="p-6 flex-1 overflow-y-auto space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-800">Your Business Idea</label>
            <textarea
              required
              rows={4}
              placeholder="Describe what your business does, what problem it solves, and how it works..."
              className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-sm"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800">Industry</label>
              <select
                required
                className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm bg-white"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isAnalyzing}
              >
                <option value="" disabled>Select sector...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800">Target Location</label>
              <select
                required
                className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm bg-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isAnalyzing}
              >
                <option value="" disabled>Select region...</option>
                {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-800">Target Audience</label>
            <input
              required
              type="text"
              placeholder="e.g., Women 25-40 in Tunis interested in skincare"
              className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-800">Starting Budget</label>
              <span className="text-sm font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {budget.toLocaleString()} TND
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
              disabled={isAnalyzing}
            />
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>500</span>
              <span>50k+</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-800">Current Stage</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'idea', label: 'Just an idea' },
                { id: 'research', label: 'Some research done' },
                { id: 'started', label: 'Already started small' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage(s.id)}
                  disabled={isAnalyzing}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                    stage === s.id 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500" 
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={clearForm}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
            <button
              type="submit"
              disabled={isAnalyzing || !idea || !industry || !audience || !location}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" /> Analyzing Market...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Validate My Idea
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Right Panel: Results (Only shown if results exist) */}
      <AnimatePresence>
        {results && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, display: 'none' }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* Score Banner */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-8 shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2" />
              
              {/* Circular Gauge */}
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f4f4f5" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke={getScoreColor(results.score).stroke} 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${(results.score / 100) * 283} 283`}
                    initial={{ strokeDasharray: "0 283" }}
                    animate={{ strokeDasharray: `${(results.score / 100) * 283} 283` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-mono text-zinc-900 leading-none">
                    {results.score}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">/ 100</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-1">Viability Score</h2>
                <h3 className={cn("text-2xl font-bold mb-2", getScoreColor(results.score).text)}>
                  {getScoreColor(results.score).label}
                </h3>
                <p className="text-sm text-zinc-600 max-w-sm">
                  Based on AI analysis of the current Tunisian market trends, competitor density, and your provided constraints.
                </p>
              </div>
            </div>

            {/* Analysis Tabs */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="flex border-b border-zinc-100 overflow-x-auto hide-scrollbar bg-zinc-50/50">
                {[
                  { id: 'strengths', icon: CheckCircle2, label: 'Strengths' },
                  { id: 'risks', icon: AlertTriangle, label: 'Risks' },
                  { id: 'market', icon: Users, label: 'Market' },
                  { id: 'compete', icon: Building, label: 'Competitors' },
                  { id: 'revenue', icon: TrendingUp, label: 'Revenue' },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-5 py-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors outline-none",
                        activeTab === tab.id 
                          ? "border-emerald-500 text-emerald-700 bg-white" 
                          : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                      )}
                    >
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="p-6 overflow-y-auto flex-1 h-full min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'strengths' && (
                    <motion.div key="strengths" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Key Strengths
                      </h3>
                      <ul className="space-y-3">
                        {results.strengths.map((str: string, i: number) => (
                          <li key={i} className="flex gap-3 text-zinc-700 p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> 
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {activeTab === 'risks' && (
                    <motion.div key="risks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Risks & Challenges
                      </h3>
                      <ul className="space-y-3">
                        {results.risks.map((risk: string, i: number) => (
                          <li key={i} className="flex gap-3 text-zinc-700 p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl text-sm">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /> 
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {activeTab === 'market' && (
                    <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-500" /> Target Market Insights
                      </h3>
                      <ul className="space-y-3">
                        {results.market.map((item: string, i: number) => (
                          <li key={i} className="flex gap-3 text-zinc-700 p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl text-sm">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" /> 
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {activeTab === 'compete' && (
                    <motion.div key="compete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <Building className="w-5 h-5 text-purple-500" /> Competitor Landscape
                      </h3>
                      <ul className="space-y-3">
                        {results.competitors.map((item: string, i: number) => (
                          <li key={i} className="flex gap-3 text-zinc-700 p-3 bg-purple-50/50 border border-purple-100/50 rounded-xl text-sm">
                            <Building className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> 
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {activeTab === 'revenue' && (
                    <motion.div key="revenue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Estimated Potential
                      </h3>
                      <div className="p-6 bg-zinc-900 rounded-xl text-center shadow-inner relative overflow-hidden">
                        <div className="absolute -right-4 -top-10 w-32 h-32 bg-emerald-500 blur-3xl rounded-full opacity-20 pointer-events-none" />
                        <h4 className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wide">Monthly Revenue Range</h4>
                        <div className="text-2xl font-bold font-mono text-white mb-2">{results.revenue}</div>
                        <p className="text-xs text-zinc-500">Based on industry averages for {location}.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Next Steps Always visible below the tabs or integrated inside it? Let's keep it below. */}
                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Recommended Next Steps
                  </h3>
                  <div className="space-y-3">
                    {results.nextSteps.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3 items-center p-3 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-zinc-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex flex-wrap gap-3">
                <button className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-medium rounded-xl text-sm transition-colors shadow-sm">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                <button className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-medium rounded-xl text-sm transition-colors shadow-sm">
                  <MessageSquare className="w-4 h-4" /> Discuss
                </button>
                <button 
                  onClick={() => navigate('/business/plan')}
                  className="flex-[2] min-w-[200px] flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Generate Business Plan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
