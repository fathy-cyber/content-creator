import React, { useState } from 'react';
import { 
  Users, BrainCircuit, Sparkles, Save, Loader2, CheckCircle2, ArrowRight, Plus, Trash2, AlertTriangle, Target, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { personaService, Persona } from '@/modules/content';

import ToolPageLayout from '../shared/ToolPageLayout';

export default function PersonaBuilder() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    industry: '',
    product: '',
    existingCustomerData: '',
  });
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPersonas, setSavedPersonas] = useState<Persona[]>([]);

  const fetchSaved = async () => {
    const data = await personaService.listPersonas();
    setSavedPersonas(data);
  };

  React.useEffect(() => {
    fetchSaved();
  }, []);

  const generatePersona = async () => {
    setLoading(true);
    try {
      const result = await personaService.generatePersona({
        ...inputs,
        existingCustomerData: inputs.existingCustomerData ? { text: inputs.existingCustomerData } : undefined,
      });
      setPersona(result);
      toast.success('ICP Persona generated!');
    } catch (error: any) {
      toast.error('Failed to generate persona');
    } finally {
      setLoading(false);
    }
  };

  const savePersona = async () => {
    if (!persona) return;
    setIsSaving(true);
    try {
      await personaService.savePersona(persona);
      toast.success('Persona saved to library!');
      await fetchSaved();
    } catch (error: any) {
      toast.error('Failed to save persona');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-indigo-600" />
          Customer Persona (ICP) Generator
        </h1>
        <p className="text-zinc-500 text-lg">
          Define your Ideal Customer Profile to align your messaging and targeting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-500" /> ICP Configuration
              </h2>
              <span className="text-xs font-bold text-zinc-400">Step {step} of 3</span>
            </div>
            
            <div className="space-y-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Target Industry</label>
                    <input 
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all"
                      value={inputs.industry}
                      onChange={(e) => setInputs({...inputs, industry: e.target.value})}
                      placeholder="e.g. Digital Marketing Agencies"
                    />
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!inputs.industry}
                    className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Your Product/Service</label>
                    <textarea 
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all min-h-[100px]"
                      value={inputs.product}
                      onChange={(e) => setInputs({...inputs, product: e.target.value})}
                      placeholder="Describe what you are selling and the main value prop..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={!inputs.product}
                      className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Existing Customer Data (Optional)</label>
                    <textarea 
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all min-h-[120px]"
                      value={inputs.existingCustomerData}
                      onChange={(e) => setInputs({...inputs, existingCustomerData: e.target.value})}
                      placeholder="Paste notes from successful client calls or testimonials..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={generatePersona}
                      disabled={loading}
                      className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate ICP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!persona ? (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">No Persona Generated</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  Complete the ICP configuration and run the generator to build a detailed profile of your ideal customer.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600" /> Your Ideal Customer Profile
                </h2>
                <button 
                  onClick={savePersona}
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-md shadow-indigo-100"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to Library
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
                {/* Header Card */}
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-100">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold">
                    {persona.name[0]}
                  </div>
                  <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-extrabold text-zinc-900">{persona.name}</h3>
                    <button 
                      onClick={() => {
                        // In real app, this would navigate to AdCopyCreator with persona context
                        window.location.href = '/marketing/ad-copy'; 
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-100"
                    >
                      <Zap className="w-3 h-3" /> Generate Ad for this Persona
                    </button>
                  </div>
                    <p className="text-zinc-500 font-medium">{persona.jobTitle} • {persona.ageRange}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pain Points */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-red-500" /> Primary Pain Points
                    </h4>
                    <div className="space-y-2">
                      {persona.painPoints.map((p, i) => (
                        <div key={i} className="p-3 bg-red-50 border border-red-100 text-red-800 text-sm rounded-xl">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                      <Target className="w-3 h-3 text-emerald-500" /> Desired Outcomes
                    </h4>
                    <div className="space-y-2">
                      {persona.goals.map((g, i) => (
                        <div key={i} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm rounded-xl">
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Objections */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                      <BrainCircuit className="w-3 h-3 text-amber-500" /> Common Objections
                    </h4>
                    <div className="space-y-2">
                      {persona.objections.map((o, i) => (
                        <div key={i} className="p-3 bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-xl">
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buying Triggers */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                      <Zap className="w-3 h-3 text-indigo-500" /> Buying Triggers
                    </h4>
                    <div className="space-y-2">
                      {persona.buyingTriggers.map((t, i) => (
                        <div key={i} className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm rounded-xl">
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Preferred Channels</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {persona.preferredChannels.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Communication Style</label>
                    <p className="text-sm text-zinc-700 mt-2 font-medium">
                      {persona.languageStyle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}
