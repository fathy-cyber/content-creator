import React, { useState } from 'react';
import {
  MessageSquareQuote, Sparkles, Save, Loader2, CheckCircle2, XCircle,
  FileText, ThumbsUp, ThumbsDown, Tag, Star, Globe, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ugcService, UGCItemInput, UGCAnalysis, UGCItem } from '../../services/ugcService';

const CONTENT_TYPES = [
  { value: 'review', label: 'Review' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'comment', label: 'Comment' },
  { value: 'mention', label: 'Mention' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'other', label: 'Other' },
] as const;

import ToolPageLayout from '../shared/ToolPageLayout';

export default function UGCCollector() {
  const [tab, setTab] = useState<'collect' | 'library'>('collect');
  const [form, setForm] = useState<UGCItemInput>({
    source: 'manual',
    sourceUrl: '',
    contentType: 'review',
    contentText: '',
    authorName: '',
    authorHandle: '',
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<UGCAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [library, setLibrary] = useState<UGCItem[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  const analyze = async () => {
    if (!form.contentText) {
      toast.error('Content text is required');
      return;
    }
    setLoading(true);
    try {
      const res = await ugcService.analyze(form);
      setAnalysis(res);
      toast.success('Content analyzed');
    } catch {
      toast.error('Failed to analyze content');
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async () => {
    if (!analysis) return;
    setIsSaving(true);
    try {
      await ugcService.save(form, analysis);
      toast.success('UGC item saved');
      setAnalysis(null);
      setForm({ source: 'manual', sourceUrl: '', contentType: 'review', contentText: '', authorName: '', authorHandle: '' });
    } catch {
      toast.error('Failed to save UGC item');
    } finally {
      setIsSaving(false);
    }
  };

  const loadLibrary = async () => {
    try {
      const items = await ugcService.list();
      setLibrary(items);
      setShowLibrary(true);
    } catch {
      toast.error('Failed to load library');
    }
  };

  const updateItemStatus = async (id: string, status: string) => {
    try {
      await ugcService.updateStatus(id, status);
      setLibrary(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      toast.success(`UGC ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <MessageSquareQuote className="w-8 h-8 text-rose-600" />
          UGC Curator
        </h1>
        <p className="text-zinc-500 text-lg">
          Collect, analyze, and approve user-generated content for marketing use.
        </p>
      </div>

      <div className="flex gap-2 mb-2">
        {(['collect', 'library'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'library') loadLibrary(); }}
            className={cn(
              'px-5 py-2.5 text-sm font-bold rounded-xl transition-all',
              tab === t ? 'bg-rose-600 text-white shadow-md shadow-rose-100' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50',
            )}
          >
            {t === 'collect' ? 'Collect UGC' : 'UGC Library'}
          </button>
        ))}
      </div>

      {tab === 'collect' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-6">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" /> Content Input
              </h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTENT_TYPES.map(ct => (
                      <button
                        key={ct.value}
                        onClick={() => setForm(p => ({ ...p, contentType: ct.value as UGCItemInput['contentType'] }))}
                        className={cn(
                          'py-2 text-xs font-bold rounded-xl transition-all border',
                          form.contentType === ct.value ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-zinc-500 border-zinc-200 hover:border-rose-200',
                        )}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Content Text *</label>
                  <textarea
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-rose-500 transition-all min-h-[160px]"
                    value={form.contentText}
                    onChange={e => setForm(p => ({ ...p, contentText: e.target.value }))}
                    placeholder="Paste the user-generated content here..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Author Name</label>
                    <input className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-rose-500 transition-all"
                      value={form.authorName} onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))} placeholder="e.g. John D." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Handle / Source</label>
                    <input className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-rose-500 transition-all"
                      value={form.authorHandle} onChange={e => setForm(p => ({ ...p, authorHandle: e.target.value }))} placeholder="@username" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Source URL</label>
                  <input className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-rose-500 transition-all"
                    value={form.sourceUrl} onChange={e => setForm(p => ({ ...p, sourceUrl: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <button onClick={analyze} disabled={loading}
                className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-rose-100">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Analyze Content
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {!analysis ? (
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                  <MessageSquareQuote className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">No Content Analyzed</h3>
                  <p className="text-zinc-500 text-sm max-w-md mx-auto">Paste user-generated content and analyze it for marketing use.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-rose-600" /> Analysis Results
                  </h2>
                  <button onClick={saveItem} disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-md shadow-blue-100">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save to Library
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-2">
                      <Star className="w-4 h-4 text-rose-500" /> Sentiment
                    </div>
                    <div className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold',
                      analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' : analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                    )}>
                      {analysis.sentiment === 'positive' ? <ThumbsUp className="w-4 h-4" /> : analysis.sentiment === 'negative' ? <ThumbsDown className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      {analysis.sentiment}
                    </div>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-500" /> Approval Score
                    </div>
                    <div className={cn(
                      'text-3xl font-black',
                      analysis.approvalScore >= 7 ? 'text-emerald-600' : analysis.approvalScore >= 4 ? 'text-amber-600' : 'text-red-600',
                    )}>
                      {analysis.approvalScore}/10
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-3">
                    <Tag className="w-4 h-4 text-rose-500" /> Key Themes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyThemes.map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-700 text-sm font-bold rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-3">
                    <Tag className="w-4 h-4 text-blue-500" /> Suggested Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedTags.map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-3">
                    <Globe className="w-4 h-4 text-emerald-500" /> Marketing Use Cases
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.marketingUseCases.map((u, i) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg">{u}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-3">
                    <MessageSquareQuote className="w-4 h-4 text-purple-500" /> Quotable Snippet
                  </div>
                  <blockquote className="border-l-4 border-purple-400 pl-4 italic text-zinc-700 text-lg">
                    "{analysis.quotableSnippet}"
                  </blockquote>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1">
                    <CheckCircle2 className="w-4 h-4 text-rose-500" /> Recommended Format
                  </div>
                  <div className="text-lg font-bold text-zinc-900">{analysis.recommendedFormat.replace(/_/g, ' ')}</div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* UGC Library */
        <div className="space-y-4">
          {library.length === 0 ? (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm mb-4">
                <MessageSquareQuote className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-zinc-900 text-lg">No UGC Items Yet</h3>
              <p className="text-zinc-500 text-sm">Collect and analyze UGC to build your library.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {library.map(item => (
                <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-bold rounded-lg',
                        item.sentiment === 'positive' ? 'bg-green-100 text-green-700' : item.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                      )}>{item.sentiment}</span>
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg">{item.content_type}</span>
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-bold rounded-lg',
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                      )}>{item.status}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => updateItemStatus(item.id, 'approved')}
                        className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateItemStatus(item.id, 'rejected')}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-700 mb-3 line-clamp-3">{item.content_text}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(item.key_themes || []).map((theme, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg">{theme}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      {item.author_name && <><User className="w-3 h-3" /> {item.author_name}</>}
                    </div>
                    <div>Score: {item.approval_score}/10</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </ToolPageLayout>
  );
}
