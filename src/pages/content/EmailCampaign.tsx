import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Send, Sparkles, Layout, 
  Users, Eye, Smartphone, Monitor,
  RefreshCcw, Copy, Download, Save,
  CheckCircle2, AlertCircle, ChevronRight, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CAMPAIGN_GOALS = [
  'Product Launch', 'Sales Promo', 'Newsletter', 'Event Invitation', 'Customer Win-back'
];

export default function EmailCampaign() {
  const [goal, setGoal] = useState('Product Launch');
  const [subject, setSubject] = useState('');
  const [audience, setAudience] = useState('All Customers');
  const [tone, setTone] = useState('Professional');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Mock API
    await new Promise(r => setTimeout(r, 2000));
    
    setGeneratedContent(`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #059669; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Our Biggest Launch Yet!</h2>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #374151;">
          <p>Hi there,</p>
          <p>We are absolutely thrilled to announce that our new collection is finally here. Designed specifically for the modern Tunisian entrepreneur, this range focuses on efficiency and style.</p>
          <p><strong>Exclusive Early bird offer:</strong> Use code <strong>AYECH20</strong> for a 20% discount on your first order this weekend.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Shop the Collection</a>
          </div>
          <p>Thank you for being part of our journey.</p>
          <p>Best,<br>The Ayech Team</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; 2024 Ayech AI. All rights reserved.<br>
          <a href="#" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">View in Browser</a>
        </div>
      </div>
    `);
    
    setSubject("🚀 Big News: Our New Collection is Here!");
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-emerald-500" />
          Email Campaign Builder
        </h1>
        <p className="text-zinc-500 text-lg">
          Craft high-converting email sequences and newsletters with AI.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left: Configuration Form */}
        <div className="xl:col-span-5 space-y-6">
           <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800">Campaign Goal</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {CAMPAIGN_GOALS.map(g => (
                     <button
                       key={g}
                       type="button"
                       onClick={() => setGoal(g)}
                       className={cn(
                         "p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between group",
                         goal === g ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                       )}
                     >
                        {g}
                        <ChevronRight className={cn("w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity", goal === g && "opacity-100")} />
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-emerald-500" /> What's the main offer or topic?
                    </label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="e.g. Flash sale 20% off for Ramadan, new customer onboarding..."
                    //   value={topic}
                    //   onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-sm font-medium"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-800">Target Segment</label>
                      <select 
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-bold bg-white"
                      >
                         <option>All Customers</option>
                         <option>New Subscribers</option>
                         <option>Inactive (30d+)</option>
                         <option>VIP Buyers</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-800">Tone</label>
                      <select 
                        className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-bold bg-white"
                      >
                         <option>Professional</option>
                         <option>Exciting</option>
                         <option>Urgent</option>
                         <option>Friendly</option>
                      </select>
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Layout className="w-5 h-5 text-emerald-400" />}
                {isGenerating ? 'Writing Campaign...' : 'Generate Campaign'}
              </button>
           </form>

           {/* Quick Tips */}
           <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                <strong>Pro Tip:</strong> Emails with personalized subject lines are 26% more likely to be opened. Ayech AI will automatically include tag placeholders for you.
              </p>
           </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="xl:col-span-7 flex flex-col gap-4">
           
           {/* Preview Controls */}
           <div className="flex items-center justify-between px-4 bg-zinc-100 rounded-2xl p-2 border border-zinc-200 shadow-inner shrink-0">
              <div className="flex bg-white rounded-xl shadow-sm border border-zinc-200 p-1">
                 <button 
                  onClick={() => setPreviewMode('desktop')}
                  className={cn("p-2 rounded-lg transition-all", previewMode === 'desktop' ? "bg-zinc-900 text-white shadow-md" : "text-zinc-400 hover:text-zinc-600")}
                 >
                    <Monitor className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => setPreviewMode('mobile')}
                  className={cn("p-2 rounded-lg transition-all", previewMode === 'mobile' ? "bg-zinc-900 text-white shadow-md" : "text-zinc-400 hover:text-zinc-600")}
                 >
                    <Smartphone className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex items-center gap-3">
                 <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm">
                    <Copy className="w-4 h-4" />
                 </button>
                 <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                 </button>
                 <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-sm flex items-center gap-2 active:scale-95">
                    <Send className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Send Test</span>
                 </button>
              </div>
           </div>

           {/* Preview Window */}
           <div className="bg-zinc-200 border border-zinc-300 rounded-[2.5rem] p-4 flex-1 shadow-2xl relative min-h-[600px] flex items-center justify-center overflow-hidden">
              
              <AnimatePresence mode="wait">
                {!generatedContent && !isGenerating ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center max-w-xs"
                  >
                     <div className="w-20 h-20 bg-zinc-300/50 rounded-full flex items-center justify-center text-zinc-400 mb-6">
                        <Eye className="w-10 h-10" />
                     </div>
                     <h3 className="text-zinc-500 font-bold mb-2">No content yet</h3>
                     <p className="text-zinc-400 text-xs">Fill out the form and click "Generate Campaign" to see your professional email preview here.</p>
                  </motion.div>
                ) : isGenerating ? (
                   <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center"
                   >
                      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                      <h3 className="text-zinc-500 font-bold animate-pulse">Ayech AI is crafting your campaign...</h3>
                   </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "bg-white shadow-2xl overflow-hidden transition-all duration-500",
                      previewMode === 'mobile' ? "w-[320px] h-[550px] rounded-[2rem] border-[8px] border-zinc-900" : "w-full h-full rounded-2xl"
                    )}
                  >
                     <div className="h-full overflow-y-auto">
                        {/* Browser Header (Desktop only) */}
                        {previewMode === 'desktop' && (
                          <div className="bg-zinc-100 p-4 border-b border-zinc-200 flex items-center gap-4">
                             <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                                <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                                <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                             </div>
                             <div className="bg-white px-3 py-1 rounded-md text-[10px] font-mono text-zinc-400 flex-1 truncate">
                               Subject: {subject}
                             </div>
                          </div>
                        )}
                        
                        {/* HTML content */}
                        <div dangerouslySetInnerHTML={{ __html: generatedContent || '' }} />
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

        </div>
      </div>

    </div>
  );
}
