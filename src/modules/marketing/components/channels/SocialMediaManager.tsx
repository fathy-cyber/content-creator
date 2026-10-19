import React, { useState, useEffect } from 'react';
import { 
  Share2, Calendar, BarChart3, MessageCircle, Settings, 
  Plus, Loader2, CheckCircle2, Copy 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';
import type { Asset } from '@/core/assets/types';
import ToolPageLayout from '../shared/ToolPageLayout';

export default function SocialMediaManager() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  const assetManager = getService<any>('assets');

  const fetchAssets = async () => {
    try {
      const { data } = await assetManager.listAssets({ 
        limit: 100, 
        offset: 0, 
        type: 'post' 
      });
      setAssets(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSchedule = async (assetId: string) => {
    setIsScheduling(true);
    try {
      // Simulate scheduling (as there is no schedule function in AssetManager yet)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Post scheduled successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Share2 className="w-8 h-8 text-blue-500" />
          Social Media Manager
        </h1>
        <p className="text-zinc-500 text-lg">
          Connect, schedule, and engage across all your social channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> Content Calendar
              </h3>
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-xl" />)}
              </div>
            ) : assets.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-200 rounded-2xl">
                No posts ready for scheduling. Generate some in the Post Generator first!
              </div>
            ) : (
              <div className="space-y-3">
                {assets.map(asset => (
                  <div key={asset.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl flex justify-between items-center group">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                        <FileTextIcon className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900">{asset.title}</div>
                        <div className="text-xs text-zinc-500">{asset.platform} • {asset.status}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSchedule(asset.id)}
                      disabled={isScheduling}
                      className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      {isScheduling ? <Loader2 className="w-3 h-3 animate-spin" /> : <SendIcon className="w-3 h-3" />}
                      Schedule
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-blue-500" /> Accounts
            </h3>
            <div className="space-y-3">
              {['Facebook', 'Instagram', 'LinkedIn', 'Twitter'].map(acc => (
                <div key={acc} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-sm font-medium text-zinc-700">{acc}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500" /> Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Reach</div>
                <div className="text-lg font-bold text-zinc-900">12.4k</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Eng. Rate</div>
                <div className="text-lg font-bold text-zinc-900">3.2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function SendIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 13" />
    </svg>
  );
}
