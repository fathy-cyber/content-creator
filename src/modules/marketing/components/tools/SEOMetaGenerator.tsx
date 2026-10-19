import React, { useState } from 'react';
import {
  Search, Sparkles, Save, Loader2, Copy, RotateCcw, CheckCircle2, FileText,
  Globe, Tag, Eye, Code, List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { seoService, SEOPageInput, SEOResult } from '../../services/seoService';

import ToolPageLayout from '../shared/ToolPageLayout';

export default function SEOMetaGenerator() {
  const [inputs, setInputs] = useState<SEOPageInput>({
    url: '',
    pageTitle: '',
    pageContent: '',
    primaryKeyword: '',
    secondaryKeywords: [],
    targetAudience: '',
    brandName: '',
    tone: 'Professional',
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !inputs.secondaryKeywords.includes(kw)) {
      setInputs(prev => ({ ...prev, secondaryKeywords: [...prev.secondaryKeywords, kw] }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setInputs(prev => ({ ...prev, secondaryKeywords: prev.secondaryKeywords.filter(k => k !== kw) }));
  };

  const generate = async () => {
    if (!inputs.primaryKeyword) {
      toast.error('Primary keyword is required');
      return;
    }
    setLoading(true);
    try {
      const res = await seoService.generate(inputs);
      setResult(res);
      toast.success('Meta tags generated');
    } catch {
      toast.error('Failed to generate meta tags');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await seoService.save(inputs, result);
      toast.success('Saved to SEO pages');
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Search className="w-8 h-8 text-indigo-600" />
          SEO Meta Generator
        </h1>
        <p className="text-zinc-500 text-lg">
          Generate optimized title tags, meta descriptions, OG tags, and structured data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> Page Details
              </h2>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Page URL</label>
                  <input
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all"
                    value={inputs.url}
                    onChange={(e) => setInputs(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/page"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Page Title</label>
                  <input
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all"
                    value={inputs.pageTitle}
                    onChange={(e) => setInputs(prev => ({ ...prev, pageTitle: e.target.value }))}
                    placeholder="Current page title (optional)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Primary Keyword *</label>
                  <input
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all"
                    value={inputs.primaryKeyword}
                    onChange={(e) => setInputs(prev => ({ ...prev, primaryKeyword: e.target.value }))}
                    placeholder="e.g. enterprise SEO tools"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Secondary Keywords</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-2.5 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all text-sm"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                      placeholder="Add keyword"
                    />
                    <button onClick={addKeyword} className="px-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700">
                      Add
                    </button>
                  </div>
                  {inputs.secondaryKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {inputs.secondaryKeywords.map(kw => (
                        <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                          {kw}
                          <button onClick={() => removeKeyword(kw)} className="hover:text-red-500">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Target Audience</label>
                  <input
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all"
                    value={inputs.targetAudience}
                    onChange={(e) => setInputs(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="e.g. Marketing managers"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Brand Name</label>
                  <input
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all"
                    value={inputs.brandName}
                    onChange={(e) => setInputs(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="e.g. Ayech AI"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Page Content</label>
                  <textarea
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all min-h-[100px] text-sm"
                    value={inputs.pageContent}
                    onChange={(e) => setInputs(prev => ({ ...prev, pageContent: e.target.value }))}
                    placeholder="Paste page content for context (helps generate better tags)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Tone</label>
                  <select
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all"
                    value={inputs.tone}
                    onChange={(e) => setInputs(prev => ({ ...prev, tone: e.target.value }))}
                  >
                    <option value="Professional">Professional</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Bold">Bold</option>
                    <option value="Authoritative">Authoritative</option>
                    <option value="Friendly">Friendly</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Meta Tags
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!result ? (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center space-y-4 h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
                <Tag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">No Meta Tags Generated</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  Provide a primary keyword and page details to generate optimized meta tags.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600" /> Generated Tags
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={generate}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Regenerate
                  </button>
                  <button
                    onClick={save}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-md shadow-blue-100"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              </div>

              {/* Title Tag */}
              <MetaSection
                icon={<Tag className="w-4 h-4 text-indigo-500" />}
                label="Title Tag"
                value={result.titleTag}
                onCopy={() => copyToClipboard(result.titleTag)}
                charCount={result.titleTag.length}
                maxChars={60}
              />

              {/* Meta Description */}
              <MetaSection
                icon={<Eye className="w-4 h-4 text-blue-500" />}
                label="Meta Description"
                value={result.metaDescription}
                onCopy={() => copyToClipboard(result.metaDescription)}
                charCount={result.metaDescription.length}
                maxChars={160}
              />

              {/* H1 Tag */}
              <MetaSection
                icon={<Tag className="w-4 h-4 text-emerald-500" />}
                label="H1 Tag"
                value={result.h1Tag}
                onCopy={() => copyToClipboard(result.h1Tag)}
                charCount={result.h1Tag.length}
                maxChars={70}
              />

              {/* URL Slug */}
              <MetaSection
                icon={<Globe className="w-4 h-4 text-amber-500" />}
                label="URL Slug"
                value={result.urlSlug}
                onCopy={() => copyToClipboard(result.urlSlug)}
              />

              {/* Open Graph */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
                    <Code className="w-4 h-4 text-purple-500" /> Open Graph
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify({
                      'og:title': result.ogTitle,
                      'og:description': result.ogDescription,
                      'og:image': result.ogImage,
                    }, null, 2))}
                    className="p-2 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-zinc-400 font-bold uppercase mb-0.5">og:title</div>
                    <div className="text-zinc-800">{result.ogTitle}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 font-bold uppercase mb-0.5">og:description</div>
                    <div className="text-zinc-800">{result.ogDescription}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 font-bold uppercase mb-0.5">og:image</div>
                    <div className="text-zinc-800 text-sm break-all">{result.ogImage}</div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-4">
                  <List className="w-4 h-4 text-green-500" /> Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-bold rounded-lg">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Structured Data */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
                    <Code className="w-4 h-4 text-blue-500" /> Structured Data (JSON-LD)
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result.structuredData, null, 2))}
                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="bg-zinc-900 text-zinc-100 rounded-xl p-4 text-xs overflow-x-auto">
                  {JSON.stringify(result.structuredData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}

function MetaSection({
  icon, label, value, onCopy, charCount, maxChars,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy: () => void;
  charCount?: number;
  maxChars?: number;
}) {
  const isOver = maxChars && charCount && charCount > maxChars;
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm group hover:border-indigo-200 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
          {icon} {label}
        </div>
        <button
          onClick={onCopy}
          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <div className="text-zinc-800 leading-relaxed">{value}</div>
      {charCount !== undefined && (
        <div className={cn("text-xs mt-2 font-bold", isOver ? 'text-red-500' : 'text-zinc-400')}>
          {charCount} characters {maxChars ? `/ ${maxChars} recommended` : ''}
        </div>
      )}
    </div>
  );
}
