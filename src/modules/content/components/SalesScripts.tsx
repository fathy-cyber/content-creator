import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, RefreshCcw, Copy, CheckCircle2, UserCheck, 
  ShieldAlert, Sparkles, MessageSquare, PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';

export default function SalesScripts() {
  const [product, setProduct] = useState('');
  const [persona, setPersona] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [objection, setObjection] = useState('');
  const [scriptType, setScriptType] = useState<'COLD_CALL' | 'DISCOVERY' | 'OBJECTION' | 'CLOSING'>('COLD_CALL');
  
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
    if (!product || !persona || !valueProp) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await ai.generate({
        promptKey: `SALES_SCRIPT.${scriptType}`,
        inputs: {
          product,
          prospectProfile: persona,
          painPoints: [valueProp, objection].filter(Boolean),
        },
      });
      
      const formattedResult = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;
      setResult(formattedResult);
      toast.success('Sales script generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate script');
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
        title: `Sales Script - ${product}`,
        type: 'sales_script',
        content: result.content || JSON.stringify(result),
        platform: scriptType,
        entity_type: 'sales_script',
        entity_id: 'script_' + Date.now(),
      });
      toast.success('Script saved as draft!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save script');
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
                        navigator.clipboard.writeText(result.content || JSON.stringify(result));
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
                      <RefreshCcw className="w-10 h-10 text-indigo-500 animate-spin" />
                      <div>
                        <h3 className="font-semibold text-zinc-900">AI is writing your script...</h3>
                        <p className="text-zinc-500 text-sm">Crafting the perfect pitch for your persona.</p>
                      </div>
                    </motion.div>
                  )}
                
                  {result && !isGenerating && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm shrink-0">
                         <div>
                           <h2 className="text-sm font-bold text-indigo-900">Generated Sales Script</h2>
                           <p className="text-xs text-indigo-700">Professional script tailored to your prospect.</p>
                         </div>
                         <button 
                           onClick={() => copyToClipboard(result.content || JSON.stringify(result), 'full')}
                           className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-50 transition-colors"
                         >
                           {copiedStates['full'] ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                           {copiedStates['full'] ? 'Copied!' : 'Copy All'}
                         </button>
                      </div>
                    
                      <div className="space-y-6 pr-2">
                         <div className="relative group pl-6 md:pl-8 border-l-2 border-zinc-200 hover:border-indigo-400 transition-colors py-1">
                           <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-zinc-300 group-hover:bg-indigo-500 transition-colors ring-4 ring-white"></div>
                           <div className="flex justify-between items-start mb-2">
                             <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-700 transition-colors">AI Generated Script</h3>
                             <button 
                               onClick={() => copyToClipboard(result.content || JSON.stringify(result), 'main')}
                               className="text-zinc-400 hover:text-indigo-600 p-1 bg-white border border-zinc-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               {copiedStates['main'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                             </button>
                           </div>
                           <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                             {result.content || JSON.stringify(result, null, 2)}
                           </div>
                         </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-zinc-200">
                         <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <label className="text-xs font-bold text-zinc-500 uppercase">Link to Campaign:</label>
                             <select 
                               value={selectedCampaign}
                               onChange={(e) => setSelectedCampaign(e.target.value)}
                               className="text-xs p-1 rounded border border-zinc-200 bg-white"
                             >
                               <option value="">None</option>
                               {campaigns.map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                               ))}
                             </select>
                           </div>
                           <button 
                             onClick={handleSave}
                             className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                           >
                             Save as Draft
                           </button>
                         </div>
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
                      <FileText className="w-12 h-12 opacity-20" />
                      <p className="text-sm">Configure your script details and generate a pitch to see results here.</p>
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
                <FileText className="w-6 h-6 text-indigo-500" />
                Sales Scripts
              </h1>
              <p className="text-zinc-500 mt-1 text-sm bg-gradient-to-r from-zinc-500 to-zinc-400 bg-clip-text text-transparent">
                Generate high-converting cold call and email sequences tailored to your prospect.
              </p>
            </div>
        
            <form onSubmit={handleGenerate} className="p-6 flex-1 overflow-y-auto space-y-6">
              
              <div className="space-y-4 pb-2">
                 <label className="text-sm font-semibold text-zinc-800">Script Type</label>
                  <div className="grid grid-cols-2 gap-3">
                     {(['COLD_CALL', 'DISCOVERY', 'OBJECTION', 'CLOSING'] as const).map(type => (
                       <button 
                         key={type} 
                         type="button" 
                         onClick={() => setScriptType(type)} 
                         className={cn(
                           "p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all text-center", 
                           scriptType === type ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                         )}
                       >
                         <span className="text-xs font-bold">{type.replace('_', ' ')}</span>
                       </button>
                     ))}
                  </div>
              </div>
        
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800">Product / Service</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AI Marketing SaaS"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
        
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-zinc-400" /> Target Persona
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. VP of Sales in B2B SaaS"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
        
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800">Primary Value Proposition</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Automate lead gen to save 10 hours a week."
                  value={valueProp}
                  onChange={(e) => setValueProp(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-zinc-900 resize-none"
                />
              </div>
        
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-zinc-400" /> Common Objection</div>
                  <span className="text-xs text-zinc-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'We don't have the budget right now'"
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  disabled={isGenerating}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-zinc-900"
                />
              </div>
        
              <div className="pt-4 sticky bottom-0 bg-white border-t border-zinc-100 -mx-6 px-6 pb-2">
                <button
                  type="submit"
                  disabled={isGenerating || !product || !persona || !valueProp}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <><RefreshCcw className="w-5 h-5 animate-spin" /> Writing Script...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 text-indigo-400" /> Generate Script</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
}
