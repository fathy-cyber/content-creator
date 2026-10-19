import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, AlertCircle, Send, ExternalLink, Loader2, Filter, Search 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { assetManager } from '@/core/assets/AssetManager';
import { getService } from '@/core';

export default function ApprovalQueue() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'internal' | 'client'>('all');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await assetManager.listAssets({
        status: filter === 'all' ? undefined : 
                filter === 'internal' ? 'internal_review' : 'client_review',
      });
      if (error) throw error;
      setAssets(data || []);
    } catch (e: any) {
      toast.error('Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const handleTransition = async (assetId: string, toStatus: string, comment?: string) => {
    setIsActionLoading(assetId);
    try {
      // Mock user id
      const userId = 'user_reviewer_123';
      const { error } = await assetManager.transitionStatus(assetId, toStatus, userId, comment);
      if (error) throw error;
      
      toast.success(`Asset moved to ${toStatus}`);
      await fetchQueue();
    } catch (e: any) {
      toast.error(e.message || 'Action failed');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSendForClientReview = async (assetId: string, clientEmail: string) => {
    setIsActionLoading(assetId);
    try {
      const { data, error } = await assetManager.generateReviewToken(assetId, clientEmail);
      if (error) throw error;

      // Transition to client review state
      await handleTransition(assetId, 'client_review', 'Sent for client review');
      
      toast.success(`Review link generated: ${data?.token}`);
      // In real app: send email with link /review/${data.token}
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate review link');
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-indigo-600" />
          Approval Queue
        </h1>
        <p className="text-zinc-500 text-lg">
          Manage and approve assets before they go live.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <div className="flex gap-1">
            {(['all', 'internal', 'client'] as const).map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                  filter === f ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={fetchQueue}
          className="p-2 text-zinc-500 hover:text-indigo-600 transition-colors"
        >
          <RotateIcon className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-zinc-100 animate-pulse rounded-3xl" />)}
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-lg">Queue Empty</h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              No assets currently awaiting approval in this view.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className={cn(
              "bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-4 transition-all group hover:border-indigo-300",
              asset.status === 'client_review' ? "border-amber-100 bg-amber-50/30" : "border-zinc-200"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center font-bold">
                    {asset.title[0]}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-zinc-900 truncate">{asset.title}</h3>
                    <p className="text-xs text-zinc-500 truncate">{asset.platform || 'General'}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                  asset.status === 'internal_review' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                )}>
                  {asset.status}
                </span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-600 line-clamp-3 italic">
                {asset.currentContent || 'No preview available'}
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-100 flex flex-col gap-2">
                {asset.status === 'internal_review' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleTransition(asset.id, 'approved')}
                      disabled={isActionLoading === asset.id}
                      className="py-2 px-3 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-1"
                    >
                      {isActionLoading === asset.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleTransition(asset.id, 'draft')}
                      disabled={isActionLoading === asset.id}
                      className="py-2 px-3 bg-white border border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg hover:bg-zinc-50 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {asset.status === 'approved' && (
                  <button 
                    onClick={() => handleSendForClientReview(asset.id, 'client@example.com')}
                    disabled={isActionLoading === asset.id}
                    className="w-full py-2 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-1"
                  >
                    {isActionLoading === asset.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Send to Client
                  </button>
                )}

                {asset.status === 'client_review' && (
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-medium">
                    <Clock className="w-3 h-3" />
                    Awaiting Client Feedback
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RotateIcon(props: any) {
  return <RotateCcw {...props} className="w-4 h-4" />;
}

import { RotateCcw } from 'lucide-react';
