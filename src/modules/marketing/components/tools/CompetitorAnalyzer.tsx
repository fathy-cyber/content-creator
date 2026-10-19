import React, { useState, useEffect } from 'react';
import {
  Search, Globe, Plus, X, Loader2, ExternalLink, FileText, AlertCircle,
  CheckCircle2, Building2, ArrowRight, TrendingUp, Users, Target, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { analyzeCompetitors, analyzeCompanyProfile, healthCheck } from '../../agents/deepCompetitiveClient';

import ToolPageLayout from '../shared/ToolPageLayout';

function extractCompanyName(url: string): string {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return hostname
      .replace(/^www\./, '')
      .split('.')[0]
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  } catch {
    return url.trim();
  }
}

function renderMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/### (.+)/g, '<h3 class="text-lg font-bold text-zinc-900 mt-6 mb-2">$1</h3>')
    .replace(/## (.+)/g, '<h2 class="text-xl font-bold text-zinc-900 mt-8 mb-3">$1</h2>')
    .replace(/# (.+)/g, '<h1 class="text-2xl font-extrabold text-zinc-900 mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/- (.+)/g, '<li class="text-sm text-zinc-700 ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-zinc-700 leading-relaxed mb-3">')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<h') || match.startsWith('<li') || match.startsWith('</p>')) return match;
      if (match.trim() === '') return '';
      return `<p class="text-sm text-zinc-700 leading-relaxed mb-3">${match}</p>`;
    })
    .replace(/<p class="text-sm text-zinc-700 leading-relaxed mb-3"><\/p>/g, '');
}

export default function CompetitorAnalyzer() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [agentOnline, setAgentOnline] = useState(false);

  useEffect(() => {
    healthCheck().then(setAgentOnline);
  }, []);

  const addUrl = () => setUrls(prev => [...prev, '']);
  const removeUrl = (i: number) => setUrls(prev => prev.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, val: string) => {
    setUrls(prev => prev.map((url, idx) => idx === i ? val : url));
  };

  const handleAnalyze = async () => {
    const validUrls = urls.map(u => u.trim()).filter(Boolean);
    if (validUrls.length === 0) {
      toast.error('Enter at least one company URL');
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const online = await healthCheck();
      if (!online) {
        toast.error('Deep Analyst agent is not running. Start it with: cd agents/deep-competitive-analyst && uv run python server.py');
        setLoading(false);
        return;
      }

      const names = validUrls.map(extractCompanyName);

      if (names.length === 1) {
        const result = await analyzeCompanyProfile(names[0]);
        setAnalysis(result.output || 'No analysis generated.');
        toast.success(`Analysis complete for ${names[0]}`);
      } else {
        const result = await analyzeCompetitors(names[0], names[1]);
        setAnalysis(result.output || 'No analysis generated.');
        toast.success(`${names[0]} vs ${names[1]} analysis complete`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
        <div className="shrink-0 mb-2">
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
            <Search className="w-8 h-8 text-indigo-600" />
            Competitive Intelligence Agent
          </h1>
          <p className="text-zinc-500 text-lg">
            Enter a company URL for a deep-dive profile, or two URLs for a head-to-head competitive analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" /> Company URLs
              </h2>

              <div className="space-y-3">
                {urls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        className="w-full pl-9 pr-3 py-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all text-sm"
                        value={url}
                        onChange={e => updateUrl(i, e.target.value)}
                        placeholder={i === 0 ? 'e.g. asana.com' : 'e.g. linear.app'}
                      />
                    </div>
                    {urls.length > 1 && (
                      <button
                        onClick={() => removeUrl(i)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {urls.length < 2 && (
                  <button
                    onClick={addUrl}
                    className="w-full py-2.5 border-2 border-dashed border-zinc-200 rounded-xl text-sm font-bold text-zinc-500 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Compare with another company
                  </button>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                {loading ? 'Analyzing...' : urls.filter(Boolean).length >= 2 ? 'Compare Companies' : 'Analyze Company'}
              </button>

              {!agentOnline && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Agent offline. Start with:<br />
                    <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">cd agents/deep-competitive-analyst && uv run python server.py</code>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!analysis && !loading && (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">Ready to Research</h3>
                  <p className="text-zinc-500 text-sm max-w-md mx-auto">
                    Enter one or two company URLs above. The AI agent will research them on the web and produce a comprehensive intelligence report.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Company profiles</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> SWOT analysis</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Market positioning</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Strategic gaps</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-zinc-200 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center gap-4 h-full">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <div className="text-center">
                  <h3 className="font-bold text-zinc-900">Researching...</h3>
                  <p className="text-zinc-500 text-sm">The agent is searching the web and building the analysis.</p>
                </div>
              </div>
            )}

            {analysis && !loading && (
              <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-100 bg-zinc-50">
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Intelligence Report
                  </h2>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Agent completed
                  </span>
                </div>
                <div
                  className="p-8 prose prose-zinc max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
