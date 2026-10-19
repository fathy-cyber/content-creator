import React, { useState, useEffect } from 'react';
import { 
  Layout, Sparkles, Send, Save, Loader2, Copy, RotateCcw, CheckCircle2, FileText, 
  ArrowRight, AlertCircle, Star, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { landingPageService, AIDAPage, PASPage } from '@/modules/content';
import { getService } from '@/core';
import { useGlobalContext } from '@/core/context/ContextBridge';

type Framework = 'AIDA' | 'PAS' | 'HERO';

import ToolPageLayout from '../shared/ToolPageLayout';

export default function LandingPageWriter() {
  const activeClient = useGlobalContext((state) => state.activeClient);
  const [framework, setFramework] = useState<Framework>('AIDA');
  const [inputs, setInputs] = useState({
    product: '',
    targetPersona: '',
    USP: '',
    CTA: '',
    mainProblem: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeClient) {
      setInputs(prev => ({
        ...prev,
        product: activeClient.name, // Simplified
      }));
    }
  }, [activeClient]);


  const assets = getService<any>('assets');

  const generatePage = async () => {
    if (!inputs.product || !inputs.targetPersona) {
      toast.error('Product and Target Persona are required');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (framework === 'AIDA') {
        data = await landingPageService.generateAIDAPage({
          product: inputs.product,
          targetPersona: inputs.targetPersona,
          USP: inputs.USP,
          CTA: inputs.CTA,
        });
      } else if (framework === 'PAS') {
        data = await landingPageService.generatePASPage({
          product: inputs.product,
          targetPersona: inputs.targetPersona,
          mainProblem: inputs.mainProblem,
        });
      } else {
        data = await landingPageService.generateHeroSection({
          product: inputs.product,
          targetPersona: inputs.targetPersona,
          USP: inputs.USP,
        });
      }
      setResult(data);
      toast.success(`Generated ${framework} landing page!`);
    } catch (error: any) {
      toast.error('Failed to generate landing page copy');
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await landingPageService.saveLandingPage({
        ...inputs,
        framework,
        content: result,
      });
      toast.success('Landing page saved to assets!');
    } catch (error: any) {
      toast.error('Failed to save landing page');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Layout className="w-8 h-8 text-blue-600" />
          Landing Page Copywriter
        </h1>
        <p className="text-zinc-500 text-lg">
          Create high-converting landing page copy using proven psychological frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" /> Page Strategy
              </h2>
              
              <div className="flex p-1 bg-zinc-100 rounded-xl">
                {(['AIDA', 'PAS', 'HERO'] as Framework[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFramework(f); setResult(null); }}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                      framework === f ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    {f === 'AIDA' ? 'AIDA' : f === 'PAS' ? 'PAS' : 'Hero Only'}
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Product / Offer</label>
                  <input 
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-blue-500 transition-all"
                    value={inputs.product}
                    onChange={(e) => setInputs({...inputs, product: e.target.value})}
                    placeholder="e.g. Agency OS Platform"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Target Persona</label>
                  <input 
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-blue-500 transition-all"
                    value={inputs.targetPersona}
                    onChange={(e) => setInputs({...inputs, targetPersona: e.target.value})}
                    placeholder="e.g. Hybrid agency owners"
                  />
                </div>

                {framework === 'AIDA' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Unique Selling Point (USP)</label>
                      <textarea 
                        className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-blue-500 transition-all min-h-[80px]"
                        value={inputs.USP}
                        onChange={(e) => setInputs({...inputs, USP: e.target.value})}
                        placeholder="What makes this offer irresistible?"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase">Primary CTA</label>
                      <input 
                        className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-blue-500 transition-all"
                        value={inputs.CTA}
                        onChange={(e) => setInputs({...inputs, CTA: e.target.value})}
                        placeholder="e.g. Start Free Trial"
                      />
                    </div>
                  </>
                )}

                {framework === 'PAS' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">The Main Problem</label>
                    <textarea 
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-blue-500 transition-all min-h-[100px]"
                      value={inputs.mainProblem}
                      onChange={(e) => setInputs({...inputs, mainProblem: e.target.value})}
                      placeholder="What is the burning pain point your customer feels?"
                    />
                  </div>
                )}

                {framework === 'HERO' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Core Value Prop</label>
                    <textarea 
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-blue-500 transition-all min-h-[80px]"
                      value={inputs.USP}
                      onChange={(e) => setInputs({...inputs, USP: e.target.value})}
                      placeholder="Single most important benefit..."
                    />
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={generatePage}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Copy
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          {!result ? (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">No Copy Generated</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  Select a framework and provide your page details to generate high-converting copy.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" /> Page Preview ({framework})
                </h2>
                <div className="flex gap-3">
                  <button 
                    onClick={generatePage}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Regenerate
                  </button>
                  <button 
                    onClick={savePage}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-md shadow-blue-100"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save to Assets
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {framework === 'AIDA' && result && (
                  <>
                    <Section 
                      title="Attention" 
                      icon={<Star className="w-4 h-4 text-amber-500" />}
                      content={<div className="space-y-4">
                        <div className="text-2xl font-extrabold text-zinc-900 leading-tight">{result.attention.headline}</div>
                        <div className="text-lg text-zinc-600">{result.attention.subheadline}</div>
                      </div>}
                      onCopy={() => copyToClipboard(`${result.attention.headline}\n${result.attention.subheadline}`)}
                    />
                    <Section 
                      title="Interest" 
                      icon={<Target className="w-4 h-4 text-blue-500" />}
                      content={<div className="text-zinc-700 leading-relaxed">{result.interest.body}</div>}
                      onCopy={() => copyToClipboard(result.interest.body)}
                    />
                    <Section 
                      title="Desire" 
                      icon={<Sparkles className="w-4 h-4 text-emerald-500" />}
                      content={<ul className="space-y-2">
                        {result.desire.bullets.map((b: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-zinc-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>}
                      onCopy={() => copyToClipboard(result.desire.bullets.join('\n'))}
                    />
                    <Section 
                      title="Action" 
                      icon={<Send className="w-4 h-4 text-indigo-500" />}
                      content={<div className="space-y-3">
                        <div className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg text-center">{result.action.cta}</div>
                        <div className="text-sm text-zinc-500 italic text-center">{result.action.urgencyLine}</div>
                      </div>}
                      onCopy={() => copyToClipboard(`${result.action.cta}\n${result.action.urgencyLine}`)}
                    />
                  </>
                )}

                {framework === 'PAS' && result && (
                  <>
                    <Section 
                      title="Problem" 
                      icon={<AlertCircle className="w-4 h-4 text-red-500" />}
                      content={<div className="text-zinc-700 leading-relaxed">{result.problem}</div>}
                      onCopy={() => copyToClipboard(result.problem)}
                    />
                    <Section 
                      title="Agitation" 
                      icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
                      content={<div className="text-zinc-700 leading-relaxed">{result.agitation}</div>}
                      onCopy={() => copyToClipboard(result.agitation)}
                    />
                    <Section 
                      title="Solution" 
                      icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      content={<div className="text-zinc-700 leading-relaxed">{result.solution}</div>}
                      onCopy={() => copyToClipboard(result.solution)}
                    />
                    <Section 
                      title="Action" 
                      icon={<Send className="w-4 h-4 text-indigo-500" />}
                      content={<div className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg text-center">{result.cta}</div>}
                      onCopy={() => copyToClipboard(result.cta)}
                    />
                  </>
                )}

                {framework === 'HERO' && result && (
                  <Section 
                    title="Hero Section" 
                    icon={<Layout className="w-4 h-4 text-blue-500" />}
                    content={<div className="text-center space-y-4 py-8">
                      <div className="text-4xl font-black text-zinc-900 leading-tight">{result.headline}</div>
                      <div className="text-xl text-zinc-600 max-w-2xl mx-auto">{result.subheadline}</div>
                    </div>}
                    onCopy={() => copyToClipboard(`${result.headline}\n${result.subheadline}`)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}

function Section({ title, icon, content, onCopy }: { title: string, icon: React.ReactNode, content: React.ReactNode, onCopy: () => void }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm group hover:border-blue-200 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
          {icon}
          {title}
        </div>
        <button 
          onClick={onCopy}
          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <div>
        {content}
      </div>
    </div>
  );
}
