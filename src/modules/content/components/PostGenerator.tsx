import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, RefreshCcw, Copy, CheckCircle2, Facebook, 
  Linkedin, Instagram, Hash, Languages, ArrowLeft, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';
import { useContextStore } from '@/core/context/ContextStore';

const PLATFORMS: { id: any, name: string, icon: any, color: string, bg: string }[] = [
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-800', bg: 'bg-blue-50' },
];

const TONES = ['Professional', 'Casual', 'Funny', 'Persuasive', 'Inspirational', 'Storytelling'];

export default function PostGenerator() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('Professional');
  const [platform, setPlatform] = useState('FACEBOOK');
  const [language, setLanguage] = useState('English');
  const [audience, setAudience] = useState('General');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const ai = getService<any>('ai');
  const assets = getService<any>('assets');
  const marketing = getService<any>('marketing');
  const social = getService<any>('social');
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await ai.generate({
        promptKey: `POST.${platform}`,
        inputs: {
          topic,
          tone,
          audience,
          keyMessage: keywords || topic,
          language,
        },
      });
      setResult(response.content);
      toast.success('Posts generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate posts');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!result) return;
    try {
      const { data: draft, error: saveErr } = await assets.createAsset({
        title: `Draft: ${topic}`,
        type: 'post',
        content: result,
        platform: platform.toLowerCase(),
        entity_type: 'post',
        entity_id: 'post_' + Date.now(),
      });
      
      if (saveErr || !draft) throw saveErr || new Error("Failed to save draft");

      const { error: submitErr } = await assets.transitionStatus(draft.id, 'internal_review', useContextStore.getState().activeUserId || '00000000-0000-0000-0000-000000000000');
      if (submitErr) throw submitErr;
      
      toast.success('Post submitted for review successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit for review');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await assets.createAsset({
        title: `Draft: ${topic}`,
        type: 'post',
        content: result,
        platform: platform.toLowerCase(),
        entity_type: 'post',
        entity_id: 'post_' + Date.now(),
      });
      toast.success('Post saved as draft!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft');
    }
  };

  React.useEffect(() => {
    async function fetchCampaigns() {
      try {
        const { data } = await marketing.listCampaigns({ limit: 100, offset: 0 });
        setCampaigns(data);
      } catch (e) {
        console.error('Failed to load campaigns', e);
      }
    }
    fetchCampaigns();
  }, []);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Marketing
        </button>
      </div>

      {/* Main Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* LEFT SIDE: OUTPUT FRAME (Main Canvas) */}
        <div className="lg:col-span-3 min-w-0">
          <motion.div
            layout
            className="bg-white border border-zinc-200 rounded-2xl shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Generated Output
              </span>

              {result && !isGenerating && (
                <button 
                  onClick={() => handleCopy(result)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm border",
                    copied 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* Loading State */}
                {isGenerating && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <RefreshCcw className="w-10 h-10 text-emerald-500 animate-spin" />
                    <div>
                      <h3 className="font-semibold text-zinc-900">AI is writing...</h3>
                      <p className="text-zinc-500 text-sm">Crafting your perfect social media post.</p>
                    </div>
                  </motion.div>
                )}

                {/* Result State */}
                {!isGenerating && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-emerald-800 text-sm font-semibold">Post generated successfully</p>
                        <p className="text-emerald-700 text-xs">
                          Optimized for {PLATFORMS.find(p => p.id === platform)?.name}
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 outline-none text-zinc-800 text-sm leading-relaxed resize-none"
                      rows={14}
                    />

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                         <div className="flex items-center gap-2">
                           <label className="text-xs font-bold text-zinc-500 uppercase">Link to Campaign:</label>
                           <select 
                             value={selectedCampaign}
                             onChange={(e) => setSelectedCampaign(e.target.value)}
                             className="text-xs p-1 rounded border border-zinc-200 bg-white"
                           >
                             <option value="">None</option>
                            {campaigns?.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}

                           </select>
                         </div>
                         <div className="flex gap-2">
                           <button 
                             onClick={handleSave}
                             className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                           >
                             Save Draft
                           </button>
                           <button 
                             onClick={handleSubmitForReview}
                             className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                           >
                             <Send className="w-3 h-3" /> Submit for Review
                           </button>
                         </div>
                       </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {!isGenerating && !result && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-3 text-zinc-400"
                  >
                    <PenTool className="w-8 h-8" />
                    <p className="text-sm">Configure options and generate your post.</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE: OPTIONS PANEL (Sticky Sidebar) */}
        <motion.div 
          layout
          className={cn(
            "bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col transition-all duration-500 lg:col-span-2",
            "w-full lg:sticky lg:top-6 lg:h-[calc(100vh-180px)]"
          )}
        >
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <PenTool className="w-6 h-6 text-emerald-500" />
              Social Post Generator
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">
              Generate high-engaging posts optimized for your chosen social network.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-800">Select Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map(p => {
                  const Icon = p.icon;
                  const active = platform === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                        active ? `border-current ${p.color} ${p.bg}` : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                      )}
                    >
                      <Icon className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-semibold">{p.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800">What is the post about?</label>
              <textarea
                required
                rows={4}
                placeholder="e.g. We are launching a new summer collection..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
                className="w-full p-4 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-sm text-zinc-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-zinc-400" /> Keywords (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. fashion, summer, discount"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-zinc-400" /> Output Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm bg-white cursor-pointer"
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Arabic</option>
                  <option>Tunisian Derja</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-zinc-400" /> Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small Business Owners"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-3 pb-4">
              <label className="text-sm font-semibold text-zinc-800">Tone of Voice</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors",
                      tone === t 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 sticky bottom-0 bg-white border-t border-zinc-100 -mx-6 px-6 pb-2">
              <button
                type="submit"
                disabled={isGenerating || !topic}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isGenerating ? (
                  <><RefreshCcw className="w-5 h-5 animate-spin" /> Writing content...</>
                ) : (
                  <><SparklesIcon className="w-5 h-5 text-emerald-400" /> Generate Posts</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14,063l-6.135-1.582a4.425 4.425 0 0 1-.2-8.083l8.6-2.522a2 2 0 0 0 1.3-1.3l2.522-8.6a4.425 4.425 0 0 1 8.083-.2l1.582 6.135a2 2 0 0 0 1.436 1.436l6.135 1.582a4.425 4.425 0 0 1 .2 8.083l-8.6 2.522a2 2 0 0 0-1.3 1.3l-2.522 8.6a4.425 4.425 0 0 1-8.083.2Z" />
    </svg>
  );
}
