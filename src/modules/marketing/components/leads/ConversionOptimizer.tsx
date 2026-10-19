import React, { useState } from 'react';
import { 
  Zap, TrendingUp, Lightbulb, ArrowRight, Loader2, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';

interface OptimizationStep {
  title: string;
  current: string;
  recommendation: string;
  impact: 'Low' | 'Medium' | 'High';
  reasoning: string;
}
import ToolPageLayout from '../shared/ToolPageLayout';

export default function ConversionOptimizer() {
  const [input, setInput] = useState({
    url: '',
    goal: '',
    audience: '',
    frictionPoints: '',
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<OptimizationStep[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const ai = getService<any>('ai');
  const assets = getService<any>('assets');

  const optimizeConversion = async () => {
    if (!input.url || !input.goal) {
      toast.error('URL and Goal are required for analysis');
      return;
    }

    setLoading(true);
    try {
      const response = await ai.generate({
        promptKey: 'CONVERSION.OPTIMIZE',
        inputs: {
          url: input.url,
          goal: input.goal,
          audience: input.audience,
          frictionPoints: input.frictionPoints,
        },
      });

      const content = response.content;
      let parsed;
      try {
        parsed = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        parsed = { recommendations: [] };
      }
      
      // Ensure we have an array of steps
      const steps = Array.isArray(parsed) ? parsed : (parsed.recommendations || []);
      setReport(steps);
      toast.success('Optimization report generated!');
    } catch (error: any) {
      console.error('[ConversionOptimizer] AI Error:', error);
      toast.error('Failed to generate optimization report');
    } finally {
      setLoading(false);
    }
  };

  const saveReportAsAsset = async () => {
    if (!report) return;
    setIsSaving(true);
    try {
      const reportText = report.map(step => 
        `Step: ${step.title}\n- Current: ${step.current}\n- Recommended: ${step.recommendation}\n- Impact: ${step.impact}\n- Why: ${step.reasoning}\n`
      ).join('\n---\n');

      await assets.createAsset({
        title: `Conversion Optimization Report - ${input.url}`,
        type: 'report',
        content: reportText,
        platform: 'INTERNAL',
        entity_type: 'optimization',
        entity_id: '00000000-0000-0000-0000-000000000000',
      });
      toast.success('Report saved to assets');
    } catch (error: any) {
      toast.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
          Conversion Optimizer
        </h1>
        <p className="text-zinc-500 text-lg">
          Analyze your funnels and landing pages to increase conversion rates using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Funnel Details
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Landing Page URL</label>
                <input 
                  className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 transition-all"
                  value={input.url}
                  onChange={(e) => setInput({...input, url: e.target.value})}
                  placeholder="https://example.com/landing"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Primary Goal</label>
                <input 
                  className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 transition-all"
                  value={input.goal}
                  onChange={(e) => setInput({...input, goal: e.target.value})}
                  placeholder="e.g. Get more email signups"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Target Audience</label>
                <textarea 
                  className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 transition-all min-h-[100px]"
                  value={input.audience}
                  onChange={(e) => setInput({...input, audience: e.target.value})}
                  placeholder="e.g. Small business owners in Tunisia looking for digital growth"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Known Friction Points</label>
                <textarea 
                  className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 transition-all min-h-[100px]"
                  value={input.frictionPoints}
                  onChange={(e) => setInput({...input, frictionPoints: e.target.value})}
                  placeholder="e.g. High drop-off at payment page, confusing pricing"
                />
              </div>
            </div>

            <button 
              onClick={optimizeConversion}
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-emerald-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Analyze Conversion
            </button>
          </div>
        </div>

        {/* Report Panel */}
        <div className="lg:col-span-2">
          {!report ? (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Ready for Analysis</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  Fill in your funnel details and run the optimizer to get AI-powered recommendations to increase your conversion rates.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Optimization Roadmap
                </h2>
                <button 
                  onClick={saveReportAsAsset}
                  disabled={isSaving}
                  className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Save as Asset
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {report.map((step, idx) => (
                  <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-emerald-200 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <h3 className="font-bold text-zinc-900 text-lg">{step.title}</h3>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        step.impact === 'High' ? "bg-red-100 text-red-600" : 
                        step.impact === 'Medium' ? "bg-amber-100 text-amber-600" : 
                        "bg-emerald-100 text-emerald-600"
                      )}>
                        {step.impact} Impact
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
                          <AlertCircle className="w-3 h-3" /> Current State
                        </div>
                        <p className="text-sm text-zinc-600 italic bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                          {step.current}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase">
                          <ArrowRight className="w-3 h-3" /> Recommended
                        </div>
                        <p className="text-sm text-zinc-900 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          {step.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <div className="flex items-start gap-2 text-sm text-zinc-500">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p>{step.reasoning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}
