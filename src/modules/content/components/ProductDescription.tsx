import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, RefreshCcw, Copy, CheckCircle2, Image as ImageIcon, 
  Tag, List, AlignLeft, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';

export default function ProductDescription() {
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('Persuasive');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const ai = getService<any>('ai');
  const assets = getService<any>('assets');
  const marketing = getService<any>('marketing');
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await ai.generate({
        promptKey: 'PRODUCT_DESC.ECOMMERCE',
        inputs: {
          productName,
          features: features.split(',').map(f => f.trim()).filter(Boolean),
          benefits: [],
          targetCustomer: targetAudience || 'General',
        },
      });
      
      const formattedResult = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;
      setResult(formattedResult);
      toast.success('Product description generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await assets.createAsset({
        workspace_id: '00000000-0000-0000-0000-000000000000', // Mock
        title: `Product Desc - ${productName}`,
        type: 'product_description',
        content: JSON.stringify(result),
        platform: 'ECOMMERCE',
        clientId: '00000000-0000-0000-0000-000000000000', // Mock
        entity_type: 'product_description',
        entity_id: 'product_description_' + Date.now(),
      });
      toast.success('Asset saved as draft!');
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
                      <RefreshCcw className="w-10 h-10 text-amber-500 animate-spin" />
                      <div>
                        <h3 className="font-semibold text-zinc-900">AI is drafting your description...</h3>
                        <p className="text-zinc-500 text-sm">Optimizing for SEO and conversion.</p>
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
                      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-zinc-100 p-3 flex items-center gap-2 border-b border-zinc-200">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                          </div>
                          <div className="bg-white px-3 py-1 rounded text-[10px] text-zinc-500 font-mono tracking-wider flex-1 ml-2 text-center truncate">
                            yourstore.com/products/{productName.toLowerCase().replace(/\s+/g, '-')}
                          </div>
                        </div>
                        
                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                          <div className="w-full md:w-1/3 aspect-square bg-zinc-50 border border-zinc-200 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-400">
                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                            <span className="text-xs uppercase tracking-widest font-semibold">Product Image</span>
                          </div>
                          
                          <div className="flex-1 relative group">
                            <button 
                              onClick={() => copyToClipboard((result.title || productName) + '\n\n' + (result.content || ''), 'header')}
                              className="absolute -top-2 -right-2 p-2 bg-white border border-zinc-200 shadow-sm text-zinc-400 hover:text-amber-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedSection === 'header' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4 tracking-tight leading-tight">{result.title || productName}</h2>
                            <p className="text-zinc-600 text-sm leading-relaxed mb-6">{result.content || ''}</p>
                            <div className="flex items-center gap-4 border-t border-zinc-100 pt-6">
                              <div className="h-10 w-32 bg-zinc-100 rounded animate-pulse"></div>
                              <div className="h-10 w-full max-w-[150px] bg-zinc-900 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative group">
                        <button 
                          onClick={() => copyToClipboard(result.content || '', 'long')}
                          className="absolute top-4 right-4 p-2 bg-white border border-zinc-200 shadow-sm text-zinc-400 hover:text-amber-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedSection === 'long' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
                          <AlignLeft className="w-4 h-4 text-zinc-400" /> Full Description
                        </h3>
                        <p className="text-zinc-700 text-sm whitespace-pre-wrap leading-relaxed">{result.content || ''}</p>
                      </div>
                      
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm relative group text-white">
                        <button 
                          onClick={() => copyToClipboard(result.content || '', 'meta')}
                          className="absolute top-4 right-4 p-2 bg-zinc-800 border border-zinc-700 shadow-sm text-zinc-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedSection === 'meta' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                          <Tag className="w-4 h-4 text-zinc-500" /> SEO Metadata <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded ml-2 normal-case tracking-normal">Important</span>
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <span className="text-xs text-zinc-500 font-mono mb-1 block">Generated Content</span>
                            <div className="text-sm text-zinc-300">
                              {result.content || ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-zinc-200 flex justify-end">
                         <button 
                           onClick={handleSave}
                           className="px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors"
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
                      <Package className="w-12 h-12 opacity-20" />
                      <p className="text-sm">Enter product details and generate a description to see results here.</p>
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
                <Package className="w-6 h-6 text-amber-500" />
                Product Description Writer
              </h1>
              <p className="text-zinc-500 mt-1 text-sm">
                Generate high-converting, SEO-optimized descriptions for your e-commerce store.
              </p>
            </div>
        
            <form onSubmit={handleGenerate} className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800">Product Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair V2"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
        
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800 flex items-center justify-between">
                  <span>Key Features / Details</span>
                  <span className="text-xs text-zinc-400 font-normal">Comma separated</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Lumbar support, breathable breathable mesh, 360-degree swivel..."
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm text-zinc-900 resize-none"
                />
              </div>
        
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-800">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote workers"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    disabled={isGenerating}
                    className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm text-zinc-900"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-800">Tone of Voice</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={isGenerating}
                    className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm bg-white cursor-pointer"
                  >
                    <option value="Persuasive">Persuasive & Selling</option>
                    <option value="Luxury">Luxury & Premium</option>
                    <option value="Technical">Technical & Factual</option>
                    <option value="Playful">Playful & Fun</option>
                  </select>
                </div>
              </div>
        
              <div className="pt-4 sticky bottom-0 bg-white border-t border-zinc-100 -mx-6 px-6 pb-2">
                <button
                  type="submit"
                  disabled={isGenerating || !productName}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <><RefreshCcw className="w-5 h-5 animate-spin" /> Drafting Description...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 text-amber-500" /> Generate SEO Copy</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
}
