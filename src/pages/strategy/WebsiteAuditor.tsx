import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Search, Sparkles, Zap, ShieldCheck, 
  AlertCircle, CheckCircle2, Layout, BarChart3, 
  ArrowRight, RefreshCcw, Copy, Download,
  ExternalLink, Info, Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AUDIT_METRICS = [
  { label: 'Performance', score: 92, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'SEO', score: 78, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Accessibility', score: 85, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Best Practices', score: 64, color: 'text-rose-500', bg: 'bg-rose-50' },
];

export default function WebsiteAuditor() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setReport(null);
    
    // Mock API
    await new Promise(r => setTimeout(r, 3000));
    
    setReport({
      url,
      overallScore: 80,
      recommendations: [
        { title: "Optimize Image Sizes", desc: "Large images are slowing down your mobile experience in Tunisia.", impact: "High" },
        { title: "Add Meta Descriptions", desc: "Your homepage lacks a meta description for search engines.", impact: "Medium" },
        { title: "Fix Broken Links", desc: "We found 3 links leading to 404 pages on your product list.", impact: "Low" }
      ],
      details: {
        loadTime: "1.2s",
        mobileFriendly: true,
        sslActive: true
      }
    });
    
    setIsScanning(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-indigo-500" />
          Website Auditor
        </h1>
        <p className="text-zinc-500 text-lg">
          Analyze your digital performance & get AI-powered SEO fixes in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="xl:col-span-5 space-y-6">
           <form onSubmit={handleScan} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                   <Search className="w-4 h-4 text-indigo-500" /> Your Website URL
                </label>
                <div className="relative">
                   <input 
                    required
                    type="url"
                    placeholder="https://yourbusiness.com.tn"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full p-4 pl-12 rounded-2xl border border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                   />
                   <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                       <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-zinc-600">Secure Scan (HTTPS)</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                       <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span className="text-xs font-bold text-zinc-600">AI Recommendations</span>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isScanning || !url}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {isScanning ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Gauge className="w-5 h-5 text-indigo-400" />}
                {isScanning ? 'Scanning Infrastructure...' : 'Launch AI Audit'}
              </button>
           </form>

           <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-xs text-indigo-700 font-bold leading-relaxed">
                <strong>Why Audit?</strong> 40% of users leave a website that takes more than 3 seconds to load. We help you stay fast and conversion-ready.
              </p>
           </div>
        </div>

        {/* Right: Audit Report */}
        <div className="xl:col-span-7 space-y-4">
           
           <AnimatePresence mode="wait">
             {report && !isScanning ? (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col gap-4"
               >
                 <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col items-center p-8">
                    <div className="relative w-48 h-48 mb-8">
                       <svg className="w-full h-full -rotate-90 transform">
                          <circle cx="96" cy="96" r="88" fill="none" stroke="#f4f4f5" strokeWidth="12" />
                          <motion.circle 
                            cx="96" cy="96" r="88" fill="none" stroke="#6366f1" strokeWidth="12" 
                            strokeDasharray={552}
                            initial={{ strokeDashoffset: 552 }}
                            animate={{ strokeDashoffset: 552 - (552 * report.overallScore) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black text-zinc-900">{report.overallScore}</span>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Rank</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-10">
                       {AUDIT_METRICS.map(m => (
                         <div key={m.label} className={cn("p-4 rounded-2xl border border-zinc-100 flex flex-col items-center text-center", m.bg)}>
                            <div className={cn("text-lg font-black mb-1", m.color)}>{m.score}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{m.label}</div>
                         </div>
                       ))}
                    </div>

                    <div className="w-full space-y-4">
                       <h3 className="text-sm font-black text-zinc-900 border-l-4 border-indigo-500 pl-4 mb-4">Critical AI Recommendations</h3>
                       <div className="space-y-3">
                          {report.recommendations.map((rec: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl group hover:border-indigo-200 transition-all">
                               <div className="flex gap-4">
                                  <div className="mt-1">
                                     {rec.impact === 'High' ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                  </div>
                                  <div>
                                     <h4 className="text-sm font-bold text-zinc-900">{rec.title}</h4>
                                     <p className="text-xs text-zinc-500 font-medium">{rec.desc}</p>
                                  </div>
                               </div>
                               <span className={cn(
                                 "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                 rec.impact === 'High' ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-400"
                               )}>{rec.impact}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 justify-end items-center px-4">
                    <button className="text-zinc-400 hover:text-indigo-600 transition-colors px-4 py-2 text-xs font-bold flex items-center gap-2">
                       <Download className="w-4 h-4" /> Export Detailed JSON
                    </button>
                    <button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
                       Create PDF Report <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>
               </motion.div>
             ) : isScanning ? (
                <div className="h-[600px] flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-8 shadow-2xl shadow-indigo-100"></div>
                   <h3 className="text-2xl font-black text-zinc-900 mb-2 italic">Scanning Core Vitals...</h3>
                   <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-xs">Simulating mobile traffic in Tunis...</p>
                </div>
             ) : (
                <div className="h-full min-h-[600px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-12 group hover:border-indigo-200 transition-colors shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/30 to-indigo-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-zinc-100 mb-8 shadow-sm group-hover:text-indigo-50 group-hover:scale-110 transition-all duration-700 relative z-10">
                       <Search className="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <h3 className="text-zinc-500 font-bold text-lg mb-2 italic relative z-10">Auditor Awaiting URL</h3>
                    <p className="text-zinc-400 text-sm max-w-xs relative z-10">Enter your business URL on the left to start a comprehensive AI performance audit.</p>
                </div>
             )}
           </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
