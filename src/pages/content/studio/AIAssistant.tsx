import React, { useState } from 'react';
import { 
  Wand2, 
  Settings2, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Languages,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getService } from '@/core';
import { toast } from 'sonner';

export default function AIAssistant() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [optimizationLevel, setOptimizationLevel] = useState('medium');
  const [result, setResult] = useState<string | null>(null);

  const ai = getService<any>('ai');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    try {
      const response = await ai.generate({
        promptKey: 'GENERAL_ASSISTANT',
        inputs: {
          tone: selectedTone,
          optimization: optimizationLevel,
        },
      });
      setResult(response.content);
      toast.success('Content generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar: Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs">
            <Settings2 size={16} />
            <span>AI Configuration</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-zinc-700 mb-2 block">Tone of Voice</label>
              <select 
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly & Casual</option>
                <option value="urgent">Urgent / Sales-driven</option>
                <option value="humorous">Humorous / Witty</option>
                <option value="authoritative">Authoritative</option>
                <option value="empathetic">Empathetic</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-700 mb-2 block">SEO Optimization</label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setOptimizationLevel(level)}
                    className={cn(
                      "py-2 text-xs font-medium rounded-lg border transition-all capitalize",
                      optimizationLevel === level
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-zinc-500 border-zinc-200 hover:border-emerald-200"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Wand2 size={16} />
            <span>Quick Enhancements</span>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-between group">
              <span>Check Grammar</span>
              <CheckCircle2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-between group">
              <span>Style Check</span>
              <Type size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-between group">
              <span>Plagiarism Check</span>
              <Search size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Output</span>
            </div>
            <div className="flex gap-2">
               <button className="p-2 hover:bg-zinc-200 rounded-lg text-zinc-500 transition-colors" title="Copy to Clipboard">
                 <Languages size={18} />
               </button>
            </div>
          </div>

          <div className="flex-1 p-8">
             {isGenerating ? (
               <div className="space-y-6">
                 <div className="h-4 bg-zinc-100 rounded-full w-3/4 animate-pulse" />
                 <div className="space-y-3">
                   <div className="h-4 bg-zinc-100 rounded-full w-full animate-pulse" />
                   <div className="h-4 bg-zinc-100 rounded-full w-full animate-pulse" />
                   <div className="h-4 bg-zinc-100 rounded-full w-5/6 animate-pulse" />
                   <div className="h-4 bg-zinc-100 rounded-full w-4/6 animate-pulse" />
                 </div>
                 <div className="h-32 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm italic">
                      <Sparkles size={16} className="animate-spin" />
                      AI is thinking...
                    </div>
                 </div>
               </div>
             ) : (
               <div className="prose prose-zinc max-w-none text-zinc-800">
                 {result ? (
                   <div className="whitespace-pre-wrap">{result}</div>
                 ) : (
                   <p className="text-zinc-400 italic">
                     Configure your settings and click "Generate Content" to see the magic happen.
                   </p>
                 )}
               </div>
             )}

          </div>
        </div>

        {/* Analysis Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-zinc-200 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Grammar Score</h4>
              <p className="text-xs text-zinc-500">No major issues detected.</p>
            </div>
          </div>
          <div className="p-4 bg-white border border-zinc-200 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">SEO Suggestion</h4>
              <p className="text-xs text-zinc-500">Add "digital agency" for better reach.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
