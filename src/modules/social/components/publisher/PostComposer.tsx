import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Save, Send, Image as ImageIcon, 
  X, Plus, CheckCircle2, Loader2, AlertCircle, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';
import { useContextStore } from '@/core/context/ContextStore';
import { PLATFORMS } from '../../constants/platforms';

interface PostComposerProps {
  initialPostId?: string;
}

export default function PostComposer({ initialPostId }: PostComposerProps) {
  const [step, setStep] = useState<'setup' | 'generate' | 'edit'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'linkedin',
    topic: '',
    tone: 'Professional',
    audience: 'General',
    keyMessage: '',
    language: 'English',
    campaignId: '',
    mediaUrls: [] as string[],
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const ai = getService<any>('ai');
  const assets = getService<any>('assets');

  useEffect(() => {
    if (initialPostId) {
      loadPost();
    }
  }, [initialPostId]);

  async function loadPost() {
    try {
      const { data, error } = await assets.getAsset(initialPostId!);
      if (error || !data) throw new Error("Post not found");
      
      setFormData({
        platform: data.platform || 'linkedin',
        topic: (data as any).prompt_inputs?.topic || '',
        tone: (data as any).prompt_inputs?.tone || 'Professional',
        audience: (data as any).prompt_inputs?.audience || 'General',
        keyMessage: (data as any).prompt_inputs?.keyMessage || '',
        language: data.language || 'English',
        campaignId: data.project_id || '',
        mediaUrls: (data as any).media_urls || [],
      });
      setGeneratedContent(data.currentContent || '');
      setHashtags((data as any).hashtags || []);
      setStep('edit');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleGenerate() {
    setIsLoading(true);
    try {
      const response = await ai.generate({
        promptKey: `POST.${formData.platform.toUpperCase()}`,
        inputs: {
          topic: formData.topic,
          tone: formData.tone,
          audience: formData.audience,
          keyMessage: formData.keyMessage,
          language: formData.language,
        },
      });
      
      const content = response.content;
      const parsed = JSON.parse(content);
      const finalText = typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : parsed;
      
      setGeneratedContent(finalText);
      setHashtags(parsed.hashtags || []);
      setStep('edit');
      toast.success("AI content generated!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

    async function handleSubmit() {
      setIsLoading(true);
      try {
        const postId = initialPostId || 'placeholder-id'; 
        await assets.transitionStatus(postId, 'internal_review', useContextStore.getState().activeUserId || '00000000-0000-0000-0000-000000000000');
        
        toast.success("Post submitted for review!");
        setStep('setup');
        resetForm();
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

  async function handleGenerateMedia(type: 'image' | 'video') {
    const promptText = prompt(`Enter a detailed prompt for the ${type}:`);
    if (!promptText) return;

    setIsLoading(true);
    try {
      let url = '';
      // Note: In a real system, these would be in the aiGateway or a dedicated MediaService
      // For now we simulate the call since we don't have a MediaService yet.
      url = `https://placehold.co/600x400?text=${encodeURIComponent(promptText)}`;
      
      setFormData(prev => ({ 
        ...prev, 
        mediaUrls: [...prev.mediaUrls, url] 
      }));
      toast.success(`${type === 'image' ? 'Image' : 'Video'} generated successfully!`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      platform: 'linkedin',
      topic: '',
      tone: 'Professional',
      audience: 'General',
      keyMessage: '',
      language: 'English',
      campaignId: '',
      mediaUrls: [],
    });
    setGeneratedContent('');
    setHashtags([]);
  }

  return (
    <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-zinc-900">AI Post Composer</h2>
        </div>
        <div className="flex gap-1">
          {['setup', 'generate', 'edit'].map((s, i) => (
            <div 
              key={s} 
              className={cn(
                "w-8 h-1.5 rounded-full transition-all",
                step === s ? "bg-emerald-500 w-12" : "bg-zinc-200"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 'setup' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-800">Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(PLATFORMS).map(p => (
                      <button
                        key={p}
                        onClick={() => setFormData(prev => ({ ...prev, platform: p }))}
                        className={cn(
                          "p-2 text-xs font-medium rounded-lg border transition-all capitalize",
                          formData.platform === p 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                            : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-800">Tone</label>
                  <select 
                    value={formData.tone}
                    onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full p-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Inspirational</option>
                    <option>Educational</option>
                    <option>Funny</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-zinc-800">Topic & Key Message</label>
                  <textarea 
                    placeholder="What should the post be about?"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep('generate')}
                disabled={!formData.topic}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                Continue to Generation
              </button>
            </motion.div>
          )}

          {step === 'generate' && (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center justify-center py-12 text-center space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-pulse">
                  <Sparkles className="w-10 h-10" />
                </div>
                <Loader2 className="w-20 h-20 text-emerald-500 animate-spin absolute top-0 left-0" style={{ opacity: 0.2 }} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">AI is crafting your content...</h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                  Analyzing your target audience and optimizing for {formData.platform}.
                </p>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Content
              </button>
              <button 
                onClick={() => setStep('setup')}
                className="text-sm text-zinc-400 hover:text-zinc-600"
              >
                Go back to setup
              </button>
            </motion.div>
          )}

          {step === 'edit' && (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-800">AI Generated Content</label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {generatedContent.length} / 2000
                  </span>
                </div>
                <textarea 
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full p-4 rounded-xl border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[300px] leading-relaxed"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-zinc-400" /> Hashtags
                </label>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full flex items-center gap-1">
                      #{tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => setHashtags(prev => prev.filter(t => t !== tag))} 
                      />
                    </span>
                  ))}
                  <button 
                    onClick={() => {
                      const tag = prompt("Enter hashtag:");
                      if (tag) setHashtags(prev => [...prev, tag.replace('#', '')]);
                    }}
                    className="px-2 py-1 border border-dashed border-zinc-300 text-zinc-400 text-xs rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-zinc-400" /> Media Assets
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {formData.mediaUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, mediaUrls: prev.mediaUrls.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                    <button 
                       className="aspect-square rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                       onClick={() => {
                         const url = prompt("Enter image URL:");
                         if (url) setFormData(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, url] }));
                       }}
                     >
                       <Plus className="w-6 h-6 mb-1" />
                       <span className="text-[10px] font-medium">Add Media</span>
                     </button>
                     <button 
                       className="aspect-square rounded-lg border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all"
                       onClick={() => handleGenerateMedia('image')}
                       disabled={isLoading}
                     >
                       {isLoading ? <Loader2 className="w-6 h-6 mb-1 animate-spin" /> : <Sparkles className="w-6 h-6 mb-1" />}
                       <span className="text-[10px] font-bold">AI Image</span>
                     </button>
                     <button 
                       className="aspect-square rounded-lg border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50 transition-all"
                       onClick={() => handleGenerateMedia('video')}
                       disabled={isLoading}
                     >
                       {isLoading ? <Loader2 className="w-6 h-6 mb-1 animate-spin" /> : <Sparkles className="w-6 h-6 mb, la-1" />}
                       <span className="text-[10px] font-bold">AI Video</span>
                     </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                <button 
                  onClick={() => setStep('generate')}
                  className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Regenerate
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      toast.success("Draft saved!");
                      setStep('setup');
                    }}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit for Review
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
