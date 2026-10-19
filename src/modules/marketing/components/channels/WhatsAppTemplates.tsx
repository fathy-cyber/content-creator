import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, RefreshCcw, Copy, CheckCircle2, 
  ShoppingCart, Headset, Tag, Calendar, UserPlus, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';

const CATEGORIES = [
  { id: 'sales', name: 'Sales & Outreach', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'support', name: 'Customer Support', icon: Headset, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'promo', name: 'Promotions', icon: Tag, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'followup', name: 'Follow-ups', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'welcome', name: 'Welcome Message', icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'invoice', name: 'Invoice / Payment', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];
import ToolPageLayout from '../shared/ToolPageLayout';

export default function WhatsAppTemplates() {
  const [activeCategory, setActiveCategory] = useState('sales');
  const [businessName, setBusinessName] = useState('');
  const [productOrService, setProductOrService] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const ai = getService<any>('ai');
  const assetManager = getService<any>('assets');

  const fetchTemplates = async () => {
    try {
      const { data } = await assetManager.listAssets({ 
        limit: 100, 
        offset: 0, 
        type: 'whatsapp_template' 
      });
      setAssets(data);
    } catch (e) {
      console.error('Failed to load templates', e);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await ai.generate({
        promptKey: 'SALES_SCRIPT.COLD_CALL',
        inputs: {
          product: `WhatsApp template for ${activeCategory} at ${businessName}`,
          prospectProfile: 'General Customer',
          painPoints: [productOrService || 'general interest'],
        },
      });
      setResult(response.content);
      toast.success('WhatsApp template generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate template');
    } finally {
      setIsGenerating(false);
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
      await assetManager.createAsset({
        title: `${activeCategory} - ${businessName}`,
        type: 'whatsapp_template',
        content: result,
        platform: 'WHATSAPP',
        entity_type: 'whatsapp_template',
        entity_id: 'wa_' + Date.now(),
      });
      toast.success('Template saved as draft!');
      await fetchTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template');
    }
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto h-full flex flex-col pt-4">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-green-500" />
          WhatsApp Templates
        </h1>
        <p className="text-zinc-500 mt-2 text-lg max-w-2xl">
          Instantly generate professional, conversion-optimized WhatsApp messages for your customers.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 flex-1 overflow-hidden">
        <div className="xl:w-1/3 flex flex-col gap-6 shrink-0 overflow-y-auto pb-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">1. Select Purpose</h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setResult(null); }}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 text-center",
                      active ? `border-current ${cat.bg} ${cat.color}` : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-bold font-sans">{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">2. Add Context</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800">Your Business Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Trendy Boutique"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800 flex justify-between">
                  <span>Product, Service or Topic</span>
                  <span className="text-xs text-zinc-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Dress Collection"
                  value={productOrService}
                  onChange={(e) => setProductOrService(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !businessName}
              className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><RefreshCcw className="w-5 h-5 animate-spin" /> Generating...</>
                ) : (
                <><MessageCircle className="w-5 h-5 text-green-400" /> Generate Scripts</>
              )}
            </button>
          </form>

          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">Saved Templates</h3>
            <div className="space-y-2">
              {loadingAssets ? (
                <div className="h-20 bg-zinc-100 animate-pulse rounded-xl" />
              ) : assets.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4">No templates saved yet.</p>
              ) : (
                assets.map(asset => (
                  <div 
                    key={asset.id} 
                    onClick={() => setResult(asset.currentContent || asset.content)}
                    className="p-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg cursor-pointer truncate border border-transparent hover:border-zinc-200 transition-all"
                  >
                    {asset.title}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden shadow-inner relative flex flex-col">
          <div className="bg-[#075e54] text-white px-6 py-4 flex items-center gap-4 shadow-md z-10 shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
              {businessName ? businessName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">{businessName || 'Your Business'}</h2>
              <p className="text-white/70 text-xs">Previewing WhatsApp Output</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative bg-[#e5ddd5]" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/407/310/HD-wallpaper-whatsapp-background-theme-texture.jpg")', backgroundBlendMode: 'overlay', backgroundSize: 'cover', opacity: 0.9 }}>
            {!isGenerating && !result && (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center max-w-sm shadow-sm border border-white/40">
                  <MessageCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-zinc-600 font-medium text-sm">Select a category and fill the form to generate custom WhatsApp messages.</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col gap-4 max-w-lg mx-auto">
                <div className="bg-white p-3 rounded-xl rounded-tr-none shadow-sm ml-auto w-3/4 animate-pulse h-24"></div>
                <div className="bg-white p-3 rounded-xl rounded-tr-none shadow-sm ml-auto w-2/3 animate-pulse h-20"></div>
              </div>
            )}

            <AnimatePresence>
              {result && !isGenerating && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex justify-end mb-6 relative group"
                >
                  <div className="bg-[#dcf8c6] border border-[#c4e8aa] text-zinc-900 p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] sm:max-w-md relative">
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans">{result}</p>
                    <div className="text-[10px] text-zinc-400 text-right mt-2 font-mono">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </div>
                  </div>
                  <div className="absolute top-1/2 -left-12 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                    <button 
                      onClick={() => handleCopy(result)}
                      className="w-10 h-10 bg-white text-zinc-600 rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors border border-zinc-200"
                      title="Copy"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={handleSave}
                      className="w-10 h, la-10 bg-white text-indigo-600 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-50 transition-colors border border-zinc-200"
                      title="Save"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#f0f0f0] px-4 py-3 flex items-center gap-3 shrink-0">
             <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400">😊</div>
             <div className="flex-1 bg-white rounded-full h-10 px-4 flex items-center text-zinc-400 text-sm opacity-60">Type a message</div>
             <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white"><MessageCircle className="w-5 h-5 fill-current" /></div>
          </div>
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}
