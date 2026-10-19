import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, RefreshCcw, Copy, CheckCircle2, LayoutTemplate, Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';

export default function AdCopyCreator() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [objective, setObjective] = useState('traffic');
  const [angle, setAngle] = useState('pain-point');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const ai = getService<any>('ai');
  const assets = getService<any>('assets');
  const marketing = getService<any>('marketing');
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await ai.generate({
        promptKey: 'AD_COPY.META',
        inputs: {
          productName: product,
          usp: angle,
          audience: audience || 'General',
          goal: objective,
        },
      });
      
      const formattedResult = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;
      setResult(formattedResult);
      toast.success('Ad copy generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate ad copy');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, ref: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [ref]: true }));
    toast.success('Copied to clipboard!');
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [ref]: false }));
    }, 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await assets.createAsset({
        title: `Ad Copy - ${product}`,
        type: 'ad_copy',
        content: typeof result === 'string' ? result : JSON.stringify(result),
        platform: 'META',
        entity_type: 'ad_copy',
        entity_id: 'ad_' + Date.now(),
      });
      toast.success('Ad asset saved as draft!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save asset');
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* LEFT SIDE: OUTPUT FRAME */}
          <div className="lg:col-span-3 min-w-0">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm h-full min-h-[600px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Generated Output
                </span>
                {result && !isGenerating && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                      toast.success('Copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm border bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy All
                  </button>
                )}
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {isGenerating && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20"
                    >
                      <RefreshCcw className="w-10 h-10 text-blue-500 animate-spin" />
                      <div>
                        <h3 className="font-semibold text-zinc-900">AI is crafting your ad copy...</h3>
                        <p className="text-zinc-500 text-sm">Optimizing for conversions and clicks.</p>
                      </div>
                    </motion.div>
                  )}

                  {!isGenerating && result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2">
                          <span className="bg-zinc-900 text-white w-6 h-6 rounded flex justify-center items-center text-xs">1</span> 
                          Primary Text (Body)
                        </h2>
                        <div className="space-y-3">
                          {(result.primaryText || []).map((text: string, i: number) => {
                            const ref = `body-${i}`;
                            return (
                              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm relative group hover:border-blue-200 transition-colors">
                                <p className="text-sm text-zinc-700 whitespace-pre-wrap pr-10">{text}</p>
                                <button 
                                  onClick={() => copyToClipboard(text, ref)}
                                  className="absolute top-4 right-4 text-zinc-400 hover:text-blue-500 transition-colors bg-white p-1 rounded-md"
                                  title="Copy text"
                                >
                                  {copiedStates[ref] ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h2 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2">
                            <span className="bg-zinc-900 text-white w-6 h-6 rounded flex justify-center items-center text-xs">2</span> 
                            Winning Headlines
                          </h2>
                          <div className="space-y-3">
                            {(result.headlines || []).map((text: string, i: number) => {
                              const ref = `head-${i}`;
                              return (
                                <div key={i} className="bg-white border border-zinc-200 rounded-xl p-3 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors">
                                  <span className="text-sm font-bold text-zinc-900 pr-4">{text}</span>
                                  <button 
                                    onClick={() => copyToClipboard(text, ref)}
                                    className="text-zinc-400 hover:text-blue-500 transition-colors shrink-0"
                                  >
                                    {copiedStates[ref] ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                    
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Link Descriptions</h2>
                            <div className="space-y-3">
                              {(result.descriptions || []).map((text: string, i: number) => {
                                const ref = `desc-${i}`;
                                return (
                                  <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex justify-between items-center">
                                    <span className="text-xs font-medium text-zinc-600">{text}</span>
                                    <button onClick={() => copyToClipboard(text, ref)} className="text-zinc-400 hover:text-blue-500">
                                      {copiedStates[ref] ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                    
                          <div>
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Call To Action (CTA)</h2>
                            <div className="flex flex-wrap gap-2">
                              {(result.ctas || []).map((text: string, i: number) => (
                                <div key={i} className="bg-white border text-blue-700 border-blue-200 px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-2 shadow-sm">
                                  {text}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-zinc-200 flex justify-end">
                         <button 
                           onClick={handleSave}
                           className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                         >
                           Save as Draft
                         </button>
                      </div>
                    </motion.div>
                  )}

                  {!isGenerating && !result && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-3 text-zinc-400 py-20"
                    >
                      <LayoutTemplate className="w-12 h-12 opacity-20" />
                      <p className="text-sm">Configure your ad settings and generate copy to see results here.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* RIGHT SIDE: OPTIONS PANEL */}
          <motion.div 
            layout
            className={cn(
              "bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col transition-all duration-500 lg:col-span-2",
              "w-full lg:sticky lg:top-6 lg:h-[calc(100vh-180px)]"
            )}
          >
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                Ad Copy Creator
              </h1>
              <p className="text-zinc-500 mt-1 text-sm">
                Generate high-converting headlines and primary texts for Facebook, Instagram, and Google Ads.
              </p>
            </div>
        
            <form onSubmit={handleGenerate} className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800">What are you advertising? (Product/Service)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. A digital marketing course for beginners"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
        
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. Small business owners looking to scale"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
        
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-zinc-400" /> Campaign Objective
                  </label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    disabled={isGenerating}
                    className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-white cursor-pointer"
                  >
                    <option value="traffic">Drive Traffic / Clicks</option>
                    <option value="sales">Generate Sales / Conversions</option>
                    <option value="awareness">Brand Awareness</option>
                    <option value="leads">Lead Generation</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-zinc-400" /> Marketing Angle
                  </label>
                  <select
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                    disabled={isGenerating}
                    className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-white cursor-pointer"
                  >
                    <option value="pain-point">Agitate Pain Point</option>
                    <option value="benefit">Focus on Benefits</option>
                    <option value="fomo">Urgency & FOMO</option>
                    <option value="social-proof">Social Proof</option>
                  </select>
                </div>
              </div>
        
              <div className="pt-4 sticky bottom-0 bg-white border-t border-zinc-100 -mx-6 px-6 pb-2">
                <button
                  type="submit"
                  disabled={isGenerating || !product}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <><RefreshCcw className="w-5 h-5 animate-spin" /> Generating Ad Copy...</>
                  ) : (
                    <><LayoutTemplate className="w-5 h-5" /> Generate Ad Assets</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
}
