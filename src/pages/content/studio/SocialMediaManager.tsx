import React, { useState } from 'react';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Send, 
  RefreshCw, 
  TrendingUp, 
  BarChart2, 
  Image as ImageIcon, 
  Video, 
  Layers,
  Hash,
  Smile,
  CheckCircle2,
  ArrowRightLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getService } from '@/core';
import { toast } from 'sonner';

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  charLimit: number;
  color: string;
}

const PLATFORMS: Platform[] = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, charLimit: 2000, color: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, charLimit: 2200, color: 'bg-pink-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, charLimit: 3000, color: 'bg-blue-800' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, charLimit: 280, color: 'bg-zinc-900' },
];

export default function SocialMediaManager() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [isRepurposing, setIsRepurposing] = useState(false);

  const contentService = getService<any>('content');
  const repurposer = contentService.repurposer;
  const assets = contentService.assets;

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleRepurpose = async (targetFormat: string) => {
    setIsRepurposing(true);
    try {
      // Find the latest asset to repurpose as a shortcut
      const { assets: latestAssets } = await assets.listAssets({ limit: 1, offset: 0 });
      if (!latestAssets || latestAssets.length === 0) {
        throw new Error('No assets found to repurpose. Please create some content first.');
      }
      
      const sourceAsset = latestAssets[0];
      toast.info(`Repurposing "${sourceAsset.title}"...`);

      const result = await repurposer.repurposeAsset({
        sourceAssetId: sourceAsset.id,
        targetFormats: [targetFormat],
        clientId: sourceAsset.campaign_id || 'system',
      });

      if (result.data && result.data.length > 0) {
        setContent(result.data[0].content);
        toast.success('Content repurposed successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Repurposing failed');
    } finally {
      setIsRepurposing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Social Media Manager</h2>
          <p className="text-zinc-500 mt-1">Compose, recycle, and track your social presence.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleRepurpose('linkedin_post')}
            disabled={isRepurposing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn(isRepurposing && 'animate-spin')} />
            Recycle Content
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
            <Send size={18} />
            Publish All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {PLATFORMS.filter(p => selectedPlatforms.includes(p.id)).map(p => (
                    <div key={p.id} className={cn("w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white", p.color)}>
                      <p className="text-[10px] font-bold">{p.name[0]}</p>
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Multi-Platform Composer</span>
              </div>
              <div className="text-xs font-medium text-zinc-500">
                {content.length} / {selectedPlatforms.length > 0 ? Math.min(...selectedPlatforms.map(id => PLATFORMS.find(p => p.id === id)!.charLimit)) : 0} chars
              </div>
            </div>

            <div className="p-6 space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening? Write once, adapt everywhere..."
                className="w-full min-h-[250px] p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none text-zinc-800"
              />

               <div className="flex flex-wrap items-center gap-2">
                  <Link 
                    to="/content/post-generator"
                    className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                    title="Generate with AI"
                  >
                    <Sparkles size={16} />
                    AI Generate
                  </Link>
                  <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors" title="Add Hashtags">
                    <Hash size={20} />
                  </button>
                  <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors" title="Add Emojis">
                    <Smile size={20} />
                  </button>
                  <div className="w-px h-6 bg-zinc-200 mx-1" />
                  <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors" title="Add Image">
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors" title="Add Video">
                    <Video size={20} />
                  </button>
                </div>

            </div>
          </div>

          {/* Visual Content Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
                <Layers size={18} />
                <span>Visual Tools</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 text-left bg-zinc-50 hover:bg-emerald-50 rounded-xl border border-zinc-100 transition-all group">
                  <div className="mb-2 text-zinc-400 group-hover:text-emerald-600"><ImageIcon size={20} /></div>
                  <div className="text-xs font-bold text-zinc-900">Quick Image Edit</div>
                </button>
                <button className="p-3 text-left bg-zinc-50 hover:bg-emerald-50 rounded-xl border border-zinc-100 transition-all group">
                  <div className="mb-2 text-zinc-400 group-hover:text-emerald-600"><Video size={20} /></div>
                  <div className="text-xs font-bold text-zinc-900">Thumbnail Gen</div>
                </button>
              </div>
            </div>

            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                <ArrowRightLeft size={18} />
                <span>Recycling Hub</span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => handleRepurpose('linkedin_post')}
                  disabled={isRepurposing}
                  className="w-full text-left px-3 py-2 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  Repurpose Blog → Social
                </button>
                <button 
                  onClick={() => handleRepurpose('instagram_caption')}
                  disabled={isRepurposing}
                  className="w-full text-left px-3 py-2 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  Repurpose Video → Clips
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Platforms & Performance */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900">Select Platforms</h3>
            <div className="space-y-2">
              {PLATFORMS.map((p) => (
                <label key={p.id} className={cn(
                  "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                  selectedPlatforms.includes(p.id) ? "bg-zinc-50 border-emerald-200" : "bg-white border-transparent hover:bg-zinc-50"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", p.color)}>
                      <p className="text-[10px] font-bold">{p.name[0]}</p>
                    </div>
                    <span className="text-sm font-medium text-zinc-700">{p.name}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                    checked={selectedPlatforms.includes(p.id)}
                    onChange={() => togglePlatform(p.id)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-wider">
              <BarChart2 size={16} />
              <span>Top Performance</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Best Time', value: 'Tues 10 AM', icon: Clock, color: 'text-emerald-600' },
                { label: 'Top Format', value: 'Reels', icon: Video, color: 'text-purple-600' },
                { label: 'Avg. Engagement', value: '4.2%', icon: TrendingUp, color: 'text-blue-600' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <stat.icon size={14} className={stat.color} />
                    {stat.label}
                  </div>
                  <div className="text-sm font-bold text-zinc-900">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

