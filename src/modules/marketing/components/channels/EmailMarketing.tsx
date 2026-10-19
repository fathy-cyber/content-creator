import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Sparkles, Layout, Send, ChevronRight, RefreshCcw, Copy, CheckCircle2, Loader2, Target 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';
import { supabase } from '@/lib/supabase';
import ToolPageLayout from '../shared/ToolPageLayout';

export default function EmailMarketing() {
  const [productName, setProductName] = useState('');
  const [goal, setGoal] = useState('Sales');
  const [audience, setAudience] = useState('');
  const [benefits, setBenefits] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [body, setBody] = useState<string | null>(null);
  const [copiedSubject, setCopiedSubject] = useState<string | null>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('');

  const ai = getService<any>('ai');
  const assets = getService<any>('assets');
  const marketing = getService<any>('marketing');
  const [orgId, setOrgId] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      resolveOrgId(user.id).then(setOrgId);
    });
  }, []);

  async function resolveOrgId(userId: string): Promise<string> {
    const { data: u } = await supabase.from('users').select('org_id').eq('id', userId).maybeSingle();
    if (u?.org_id) return u.org_id;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('owner_id', userId).maybeSingle();
    return ws?.id || '';
  }

  useEffect(() => {
    if (!orgId) return;
    marketing.listSegments(orgId).then(setSegments).catch(() => {});
  }, [orgId]);
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) return;

    setIsGenerating(true);
    setSubjects([]);
    setBody(null);

    try {
      const [subjResponse, bodyResponse] = await Promise.all([
        ai.generate({
          promptKey: 'EMAIL.SUBJECT',
          inputs: {
            productName,
            goal,
            audience: audience || 'General',
            keyBenefits: benefits.split(',').map(b => b.trim()).filter(Boolean),
          },
        }),
        ai.generate({
          promptKey: 'EMAIL.BODY',
          inputs: {
            productName,
            goal,
            audience: audience || 'General',
            keyBenefits: benefits.split(',').map(b => b.trim()).filter(Boolean),
          },
        }),
      ]);
      
      const subjContent = subjResponse.content;
      const bodyContent = bodyResponse.content;

      // If the response is still coming as a JSON string from the AI, we handle it gracefully
      let subjects = [];
      try {
        const parsedSubj = typeof subjContent === 'string' ? JSON.parse(subjContent) : subjContent;
        subjects = parsedSubj.subjects || (typeof parsedSubj === 'string' ? parsedSubj.split('\n') : []);
      } catch {
        subjects = typeof subjContent === 'string' ? subjContent.split('\n') : [];
      }

      let finalBody = bodyContent;
      try {
        const parsedBody = typeof bodyContent === 'string' ? JSON.parse(bodyContent) : bodyContent;
        finalBody = parsedBody.body || (typeof parsedBody === 'string' ? parsedBody : bodyContent);
      } catch {
        finalBody = bodyContent;
      }

      setSubjects(subjects);
      setBody(finalBody);
      toast.success('Email campaign generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSubject(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedSubject(null), 2000);
  };

  const handleSave = async () => {
    if (!body) return;
    try {
      await assets.createAsset({
        title: `Email: ${productName}`,
        type: 'email',
        content: `Subjects: ${subjects.join(' | ')}\n\nBody:\n${body}`,
        platform: 'EMAIL',
        entity_type: 'email',
        entity_id: 'email_' + Date.now(),
      });
      toast.success('Email saved as draft!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save email');
    }
  };

  // segments are now fetched in the orgId effect above

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto h-full flex flex-col xl:flex-row gap-6">
      <motion.div 
        className={cn(
          "bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col transition-all duration-500",
          (subjects.length > 0 || body) ? "xl:w-5/12 h-[calc(100vh-140px)] sticky top-6" : "w-full max-w-3xl mx-auto"
        )}
      >
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-emerald-500" />
            Email Campaign Builder
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Generate high-converting subject lines and bodies for your email sequences.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-800">Product / Service Name</label>
            <input
              required
              type="text"
              placeholder="e.g. AI Content Studio"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isGenerating}
              className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800">Campaign Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={isGenerating}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm bg-white"
              >
                <option>Sales</option>
                <option>Lead Generation</option>
                <option>Re-engagement</option>
                <option>Welcome Series</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800">Target Audience</label>
              <input
                type="text"
                placeholder="e.g. SaaS Founders"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={isGenerating}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-800">Key Benefits (Comma separated)</label>
            <textarea
              rows={3}
              placeholder="e.g. Saves 10h/week, 2x more leads, easy setup"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              disabled={isGenerating}
              className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div className="pt-2 sticky bottom-0 bg-white border-t border-zinc-100 -mx-6 px-6 pb-2">
            <button
              type="submit"
              disabled={isGenerating || !productName}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><RefreshCcw className="w-5 h-5 animate-spin" /> Crafting Email...</>
                ) : (
                <><Sparkles className="w-5 h-5 text-emerald-400" /> Generate Campaign</>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {(subjects.length > 0 || body) && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, display: 'none' }}
            transition={{ duration: 0.4 }}
            className="flex-1 space-y-6 overflow-y-auto pb-12"
          >
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h3 className="font-bold text-emerald-900 text-sm">Campaign Content Ready</h3>
                <p className="text-emerald-700 text-xs">We've generated 5 subject line variants and a high-converting body.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Layout className="w-4 h-4 text-emerald-500" /> Subject Line Variants
                </h4>
                <div className="space-y-3">
                  {subjects.map((s, i) => (
                    <div key={i} className="bg-white border border-zinc-200 p-3 rounded-xl flex justify-between items-center group hover:border-emerald-500 transition-all">
                      <span className="text-sm text-zinc-800">{s}</span>
                      <button 
                        onClick={() => handleCopy(s, `s-${i}`)}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          copiedSubject === `s-${i}` ? "bg-emerald-100 text-emerald-600" : "text-zinc-400 hover:bg-zinc-100"
                        )}
                      >
                        {copiedSubject === `s-${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-500" /> Email Body
                </h4>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative group min-h-[300px]">
                  <button 
                    onClick={() => handleCopy(body || '', 'body')}
                    className="absolute top-4 right-4 p-2 bg-white border border-zinc-200 shadow-sm text-zinc-400 hover:text-emerald-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedSubject === 'body' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <p className="text-zinc-800 text-sm whitespace-pre-wrap leading-relaxed">{body}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-zinc-200">
                  <Target className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block">Target Segment</label>
                  <select 
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    className="text-sm bg-transparent border-none p-0 outline-none font-medium text-zinc-900"
                  >
                    <option value="">Select a segment...</option>
                    {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md"
              >
                Save to Assets
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ToolPageLayout>
  );
}
