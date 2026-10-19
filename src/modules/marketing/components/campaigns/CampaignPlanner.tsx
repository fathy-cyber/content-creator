import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, ArrowRight, ArrowLeft, Send, Sparkles, Server, BarChart, Plus, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getService } from '@/core';
import { supabase } from '@/lib/supabase';
import ToolPageLayout from '../shared/ToolPageLayout';

const STEPS = [
  { id: 1, title: 'Objective' },
  { id: 2, title: 'Audience & Budget' },
  { id: 3, title: 'Channels' },
];

export default function CampaignPlanner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [orgId, setOrgId] = useState<string>('');

  const [campaignName, setCampaignName] = useState('');
  const [objective, setObjective] = useState('Product Launch');
  const [duration, setDuration] = useState('4 Weeks');
  const [budget, setBudget] = useState('1000');
  const [audience, setAudience] = useState('');

  const [channels, setChannels] = useState({
    facebook: true,
    instagram: true,
    email: false,
    whatsapp: false,
    google: false,
  });

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');

  const navigate = useNavigate();
  const ai = getService<any>('ai');
  const marketing = getService<any>('marketing');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      resolveOrgId(user.id).then((oid) => {
        if (oid) {
          setOrgId(oid);
          loadCampaigns(oid);
        }
      });
    });
  }, []);

  async function resolveOrgId(userId: string): Promise<string | null> {
    const { data: userData } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', userId)
      .maybeSingle();
    if (userData?.org_id) return userData.org_id;
    const { data: ws } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    return ws?.id || null;
  }

  async function loadCampaigns(oid: string) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, status, budget, start_date')
        .eq('org_id', oid)
        .order('created_at', { ascending: false });
      if (!error && data) setCampaigns(data);
    } catch {
      // silently fail
    }
  }

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const parseAiResult = (content: any) => {
    if (typeof content === 'string') {
      try { return JSON.parse(content); } catch { /* fall through */ }
    }
    if (content && typeof content === 'object') return content;
    return { timeline: [], budgetAllocation: {}, milestones: [] };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await ai.generate({
        promptKey: 'CAMPAIGN_PLAN',
        inputs: {
          goal: objective,
          budget: parseFloat(budget) || 0,
          duration,
          audience: audience || 'General Audience',
          channels: Object.entries(channels).filter(([, v]) => v).map(([k]) => k),
        },
      });

      const result = parseAiResult(response.content);

      const generatedPlan = {
        title: campaignName || 'AI Generated Campaign',
        overview: `A ${duration} campaign designed to achieve ${objective} with a budget of ${budget} TND.`,
        timeline: result.timeline || [],
        distribution: result.budgetAllocation || result.distribution || {},
        milestones: result.milestones || [],
      };

      setPlan(generatedPlan);
      toast.success('Campaign plan generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAndSave = async () => {
    if (!orgId) {
      toast.error('Organization not found');
      return;
    }
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let campaignId = selectedCampaignId;

      if (!campaignId) {
        const { data: newCampaign, error: createErr } = await supabase
          .from('campaigns')
          .insert({
            name: newCampaignName || campaignName || 'Untitled Campaign',
            status: 'draft',
            budget: parseFloat(budget) || 0,
            start_date: new Date().toISOString(),
            channels: Object.entries(channels).filter(([, v]) => v).map(([k]) => k),
            org_id: orgId,
            created_by: user?.id,
          })
          .select()
          .single();

        if (createErr) throw createErr;
        campaignId = newCampaign.id;
      }

      await marketing.saveCampaignPlan({
        campaign_id: campaignId,
        timeline: plan.timeline,
        budget_allocation: plan.distribution,
        milestones: plan.milestones,
        org_id: orgId,
      });

      toast.success('Plan saved to campaign!');
      navigate('/marketing/campaigns');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedChannelCount = Object.values(channels).filter(Boolean).length;

  if (plan) {
    return (
    <ToolPageLayout>
      <div className="max-w-5xl mx-auto h-full flex flex-col pt-4 pb-12 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" /> Campaign Blueprint Prepared
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900">{plan.title}</h1>
            <p className="text-zinc-500 mt-2 text-base">{plan.overview}</p>
          </div>
          <button 
            onClick={() => { setPlan(null); setCurrentStep(1); }}
            className="px-4 py-2 border border-zinc-200 text-zinc-600 font-medium rounded-xl hover:bg-zinc-50 transition-colors"
          >
            Start Over
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Roadmap Timeline
            </h2>
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              {plan.timeline.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">No timeline generated. Try different inputs.</p>
              ) : (
                <div className="relative border-l-2 border-zinc-100 ml-3 md:ml-6 space-y-10 py-4">
                  {plan.timeline.map((item: any, index: number) => (
                    <div key={index} className="relative pl-8 md:pl-10">
                      <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 z-10" />
                      <h3 className="font-bold text-lg text-zinc-900 mb-4">{item.name || `Phase ${index + 1}`}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(item.tasks || []).map((task: string, tIdx: number) => (
                          <div key={tIdx} className="bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-sm text-zinc-700 font-medium flex items-start gap-2 hover:border-indigo-200 transition-colors cursor-default">
                            <div className="w-4 h-4 rounded border border-zinc-300 mt-0.5 shrink-0 bg-white" />
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-indigo-500" /> Distribution
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm text-white">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Budget Split</h3>
              {Object.keys(plan.distribution).length === 0 ? (
                <p className="text-zinc-500 text-sm">No allocation data</p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(plan.distribution).map(([name, value]) => (
                    <div key={name}>
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="font-semibold capitalize">{name}</span>
                        <span className="font-mono text-zinc-400">{value}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
                {campaigns.length > 0 && (
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Save to new campaign...</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}

                {!selectedCampaignId && (
                  <input
                    type="text"
                    placeholder="New campaign name"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                )}

                <button
                  onClick={handleCreateAndSave}
                  disabled={isSaving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <><Server className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> {selectedCampaignId ? 'Update Campaign Plan' : 'Create & Save Plan'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
    );
  }

  return (
    <ToolPageLayout>
      <div className="max-w-3xl mx-auto h-full flex flex-col pt-8 pb-12">
      <div className="text-center mb-10 shrink-0">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Campaign Planner</h1>
        <p className="text-zinc-500">Structured marketing roadmaps generated in seconds.</p>
      </div>

      <div className="flex items-center justify-between mb-8 px-4 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-zinc-200 -z-10" />
        <div
          className="absolute left-0 top-1/2 h-0.5 bg-indigo-500 -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 bg-white",
              step.id === currentStep ? "border-indigo-500 text-indigo-700 ring-4 ring-indigo-50" :
              step.id < currentStep ? "border-indigo-500 bg-indigo-500 text-white" : "border-zinc-300 text-zinc-400"
            )}>
              {step.id}
            </div>
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider",
              step.id === currentStep ? "text-indigo-700" : step.id < currentStep ? "text-zinc-900" : "text-zinc-400"
            )}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl flex-1 flex flex-col min-h-[400px] overflow-hidden">
        <div className="p-8 sm:p-10 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-800">Campaign Name</label>
                  <input type="text" placeholder="e.g. Summer Sale 2024" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="w-full p-4 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-800">Primary Objective</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Product Launch', 'Brand Awareness', 'Lead Generation', 'Sales & Conversion'].map(obj => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => setObjective(obj)}
                        className={cn(
                          "px-4 py-4 rounded-xl border-2 text-left font-semibold text-sm transition-all",
                          objective === obj ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        )}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-800">Target Audience</label>
                  <input type="text" placeholder="e.g. Small business owners in Tunisia" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full p-4 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-800">Expected Duration</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-4 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none transition-colors bg-white">
                    <option>1 Week</option>
                    <option>2 Weeks</option>
                    <option>4 Weeks</option>
                    <option>8 Weeks</option>
                    <option>12 Weeks</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-800">Total Marketing Budget (TND)</label>
                  <input type="number" min="0" placeholder="e.g. 1500" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-4 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none transition-colors" />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-base font-bold text-zinc-900 block mb-2">Select Target Channels</label>
                  <div className="space-y-2">
                    {Object.keys(channels).map((key) => (
                      <label key={key} className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        channels[key as keyof typeof channels] ? "border-indigo-500 bg-indigo-50/50" : "border-zinc-200 hover:border-zinc-300"
                      )}>
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-indigo-600"
                          checked={channels[key as keyof typeof channels]}
                          onChange={() => toggleChannel(key as keyof typeof channels)}
                        />
                        <span className="font-semibold text-zinc-800 capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                  {selectedChannelCount === 0 && (
                    <p className="text-xs text-amber-600 font-medium">Select at least one channel</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1 || isGenerating}
            className={cn("px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors", currentStep === 1 ? "opacity-0 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200")}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={currentStep === 2 && !audience.trim() && !budget}
              className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !campaignName || selectedChannelCount === 0}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><Server className="w-4 h-4 animate-spin" /> Compiling Plan...</>
              ) : (
                <><Send className="w-4 h-4" /> Finish & Generate</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}
