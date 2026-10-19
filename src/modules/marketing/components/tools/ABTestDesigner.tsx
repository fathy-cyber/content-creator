import React, { useState } from 'react';
import {
  TestTube, Sparkles, Save, Loader2, Plus, Trash2, CheckCircle2, Beaker,
  BarChart3, Target, AlertCircle, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { abTestService, ABVariant, ABTest } from '../../services/abTestService';
import ToolPageLayout from '../shared/ToolPageLayout';

export default function ABTestDesigner() {
  const [tab, setTab] = useState<'design' | 'calculator'>('design');
  const [form, setForm] = useState({
    name: '',
    description: '',
    element: 'headline',
    goal: '',
    hypothesis: '',
    currentVersion: '',
    controlDescription: '',
    targetAudience: '',
    brandVoice: '',
    trafficSplit: 50,
    confidenceLevel: 0.95,
    variantCount: 2,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    variants: ABVariant[];
    recommendedSampleSize: number;
    estimatedDurationDays: number;
    successMetrics: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedTests, setSavedTests] = useState<ABTest[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  // Calculator state
  const [calcControls, setCalcControls] = useState({ baseRate: 3, mde: 1, confidence: 0.95, power: 0.8 });
  const [calcResults, setCalcResults] = useState<{ sampleSize: number; controlTotal: number; controlConv: number; variantTotal: number; variantConv: number; significance: number } | null>(null);

  const generateVariants = async () => {
    if (!form.name || !form.goal || !form.hypothesis) {
      toast.error('Name, goal, and hypothesis are required');
      return;
    }
    setLoading(true);
    try {
      const res = await abTestService.generateVariants({
        currentVersion: form.currentVersion,
        goal: form.goal,
        element: form.element,
        hypothesis: form.hypothesis,
        targetAudience: form.targetAudience,
        brandVoice: form.brandVoice,
        variantCount: form.variantCount,
      });
      setResult(res);
      toast.success('Variants generated');
    } catch {
      toast.error('Failed to generate variants');
    } finally {
      setLoading(false);
    }
  };

  const saveTest = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await abTestService.create(
        {
          name: form.name,
          description: form.description,
          element: form.element,
          goal: form.goal,
          hypothesis: form.hypothesis,
          controlDescription: form.controlDescription,
          trafficSplit: form.trafficSplit,
          confidenceLevel: form.confidenceLevel,
        },
        result.variants,
        result.successMetrics,
        result.estimatedDurationDays,
      );
      toast.success('A/B test saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedTests = async () => {
    try {
      const tests = await abTestService.list();
      setSavedTests(tests);
      setShowSaved(true);
    } catch {
      toast.error('Failed to load tests');
    }
  };

  const calcSampleSize = () => {
    const sampleSize = abTestService.calculateSampleSize(calcControls.baseRate, calcControls.mde, calcControls.confidence, calcControls.power);
    const variantTotal = sampleSize;
    const controlTotal = sampleSize;
    const controlConv = Math.round(controlTotal * (calcControls.baseRate / 100));
    const variantConv = Math.round(variantTotal * ((calcControls.baseRate + calcControls.mde) / 100));
    const significance = abTestService.calculateSignificance(controlConv, controlTotal, variantConv, variantTotal);
    setCalcResults({ sampleSize, controlTotal, controlConv, variantTotal, variantConv, significance });
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <TestTube className="w-8 h-8 text-purple-600" />
          A/B Test Designer
        </h1>
        <p className="text-zinc-500 text-lg">
          Design experiments, generate AI variants, and calculate statistical significance.
        </p>
      </div>

      <div className="flex gap-2 mb-2">
        {(['design', 'calculator'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2.5 text-sm font-bold rounded-xl transition-all',
              tab === t ? 'bg-purple-600 text-white shadow-md shadow-purple-100' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50',
            )}
          >
            {t === 'design' ? 'Design Experiment' : 'Sample Size Calculator'}
          </button>
        ))}
        <button onClick={loadSavedTests} className="ml-auto px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-50">
          Saved Tests
        </button>
      </div>

      {tab === 'design' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-6">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" /> Experiment Setup
              </h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Test Name *</label>
                  <input className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Hero CTA Color" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                  <textarea className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all min-h-[60px]"
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What are you testing and why?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Element</label>
                    <select className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                      value={form.element} onChange={e => setForm(p => ({ ...p, element: e.target.value }))}>
                      <option value="headline">Headline</option>
                      <option value="cta">CTA Button</option>
                      <option value="image">Image</option>
                      <option value="body">Body Copy</option>
                      <option value="offer">Offer</option>
                      <option value="layout">Layout</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Variants</label>
                    <select className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                      value={form.variantCount} onChange={e => setForm(p => ({ ...p, variantCount: Number(e.target.value) }))}>
                      <option value={1}>1 Variant</option>
                      <option value={2}>2 Variants</option>
                      <option value={3}>3 Variants</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Goal *</label>
                  <input className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                    value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} placeholder="e.g. Increase click-through rate" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Hypothesis *</label>
                  <textarea className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all min-h-[60px]"
                    value={form.hypothesis} onChange={e => setForm(p => ({ ...p, hypothesis: e.target.value }))} placeholder="We believe that [change] will improve [metric]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Current Version</label>
                  <textarea className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all min-h-[60px]"
                    value={form.currentVersion} onChange={e => setForm(p => ({ ...p, currentVersion: e.target.value }))} placeholder="Describe the current version being tested" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Traffic Split %</label>
                    <input type="number" className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                      value={form.trafficSplit} onChange={e => setForm(p => ({ ...p, trafficSplit: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Confidence</label>
                    <select className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                      value={form.confidenceLevel} onChange={e => setForm(p => ({ ...p, confidenceLevel: Number(e.target.value) }))}>
                      <option value={0.9}>90%</option>
                      <option value={0.95}>95%</option>
                      <option value={0.99}>99%</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Target Audience</label>
                  <input className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                    value={form.targetAudience} onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))} placeholder="e.g. Returning visitors" />
                </div>
              </div>
              <button onClick={generateVariants} disabled={loading}
                className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-purple-100">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Variants
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {!result ? (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                  <Beaker className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">No Experiment Designed</h3>
                  <p className="text-zinc-500 text-sm max-w-md mx-auto">Define your hypothesis and generate AI-suggested variants.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-purple-600" /> Variants
                  </h2>
                  <button onClick={saveTest} disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-md shadow-blue-100">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Experiment
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="bg-white border-2 border-purple-200 rounded-2xl p-5 shadow-sm">
                    <div className="text-xs font-bold text-purple-500 uppercase mb-1">Control</div>
                    <div className="text-zinc-800 font-medium">{form.controlDescription || form.currentVersion || 'Current version (no changes)'}</div>
                  </div>
                  {result.variants.map((v, i) => (
                    <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-purple-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg mr-2">Variant {i + 1}</span>
                          <span className="font-bold text-zinc-900">{v.name}</span>
                        </div>
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-bold rounded-lg',
                          v.risk === 'Low' ? 'bg-green-100 text-green-700' : v.risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
                        )}>
                          {v.risk} Risk
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 mb-3">{v.description}</p>
                      <div className="space-y-1 mb-3">
                        {v.changes.map((c, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-zinc-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {c}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Expected Impact: <span className="font-bold text-zinc-700">{v.expectedImpact}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-700 mb-3">Success Metrics</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.successMetrics.map((m, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg">{m}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase mb-1">Recommended Sample Size</div>
                    <div className="text-2xl font-black text-zinc-900">{result.recommendedSampleSize.toLocaleString()}</div>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase mb-1">Estimated Duration</div>
                    <div className="text-2xl font-black text-zinc-900">{result.estimatedDurationDays} days</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" /> Sample Size Estimator
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Current Conversion Rate (%)</label>
                <input type="number" step="0.1" className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                  value={calcControls.baseRate} onChange={e => setCalcControls(p => ({ ...p, baseRate: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Minimum Detectable Effect (%)</label>
                <input type="number" step="0.1" className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                  value={calcControls.mde} onChange={e => setCalcControls(p => ({ ...p, mde: Number(e.target.value) }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Confidence</label>
                  <select className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                    value={calcControls.confidence} onChange={e => setCalcControls(p => ({ ...p, confidence: Number(e.target.value) }))}>
                    <option value={0.9}>90%</option>
                    <option value={0.95}>95%</option>
                    <option value={0.99}>99%</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Statistical Power</label>
                  <select className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                    value={calcControls.power} onChange={e => setCalcControls(p => ({ ...p, power: Number(e.target.value) }))}>
                    <option value={0.8}>80%</option>
                    <option value={0.9}>90%</option>
                  </select>
                </div>
              </div>
              <button onClick={calcSampleSize}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100">
                <BarChart3 className="w-5 h-5" />
                Calculate
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {!calcResults ? (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">No Calculation Yet</h3>
                  <p className="text-zinc-500 text-sm">Enter parameters and calculate required sample size.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="text-xs font-bold text-zinc-400 uppercase mb-1">Required Sample Size (per variant)</div>
                  <div className="text-3xl font-black text-purple-600">{calcResults.sampleSize.toLocaleString()}</div>
                  <p className="text-xs text-zinc-500 mt-2">visitors needed in each group to reach statistical significance</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-zinc-700">Projected Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-zinc-400 uppercase">Control</div>
                      <div className="text-zinc-700">{calcResults.controlConv} / {calcResults.controlTotal} ({calcControls.baseRate}%)</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-400 uppercase">Variant</div>
                      <div className="text-zinc-700">{calcResults.variantConv} / {calcResults.variantTotal} ({calcControls.baseRate + calcControls.mde}%)</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-100">
                    <div className="text-xs font-bold text-zinc-400 uppercase mb-1">Statistical Significance</div>
                    <div className={cn('text-2xl font-black', calcResults.significance >= 95 ? 'text-emerald-600' : calcResults.significance >= 80 ? 'text-amber-600' : 'text-red-600')}>
                      {calcResults.significance.toFixed(1)}%
                    </div>
                    {calcResults.significance >= 95 && <p className="text-xs text-emerald-600 font-bold mt-1">Statistically significant</p>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Saved Tests Modal */}
      {showSaved && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSaved(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full mx-4 max-h-[70vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900">Saved Experiments</h2>
              <button onClick={() => setShowSaved(false)} className="text-zinc-400 hover:text-zinc-600 text-lg">&times;</button>
            </div>
            {savedTests.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No saved experiments yet</p>
            ) : (
              <div className="space-y-3">
                {savedTests.map(test => (
                  <div key={test.id} className="bg-zinc-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-zinc-900">{test.name}</span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-bold rounded-lg',
                        test.status === 'running' ? 'bg-green-100 text-green-700' : test.status === 'draft' ? 'bg-zinc-100 text-zinc-600' : test.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-500',
                      )}>{test.status}</span>
                    </div>
                    <div className="text-sm text-zinc-500">{test.goal} — {test.element}</div>
                    {test.winner_variant && <div className="text-xs text-emerald-600 font-bold mt-1">Winner: {test.winner_variant}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </ToolPageLayout>
  );
}
