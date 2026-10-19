import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Filter, MoreVertical, Copy, CheckCircle2, 
  FileText, Megaphone, Layers, Target, Trash2, Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';
import type { Asset } from '@/core';

export default function ContentLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    campaignId: 'all',
  });
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const assetManager = getService<any>('assets');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 20,
        offset: page * 20,
      };
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.campaignId !== 'all') params.campaign_id = filters.campaignId;

      const { data, count } = await assetManager.listAssets(params);
      setAssets(data);
      setTotal(count);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, filters]);

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      // Note: deleteAsset needs to be implemented in AssetManager
      await assetManager.deleteAsset(id);
      toast.success('Asset deleted');
      fetchAssets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete asset');
    }
  };

  const handleLinkCampaign = async (assetId: string, campaignId: string) => {
    try {
      // This would normally use a marketing service to update the asset's project/campaign link
      await assetManager.updateAsset(assetId, { 
        // Updated to a project_id since our Asset type uses project_id for campaigns
        project_id: campaignId 
      });
      toast.success('Linked to campaign');
      fetchAssets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to link campaign');
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Content Library</h1>
          <p className="text-zinc-500 mt-1 text-sm">Manage and organize all your AI-generated marketing assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select 
          value={filters.type} 
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium outline-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="post">Posts</option>
          <option value="ad_copy">Ad Copy</option>
          <option value="product_description">Product Descriptions</option>
          <option value="sales_script">Sales Scripts</option>
        </select>

        <select 
          value={filters.status} 
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-zinc-100 animate-pulse rounded-2xl border border-zinc-200" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">No assets yet</h3>
            <p className="text-zinc-500 text-sm">Generate your first piece of content to see it here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <motion.div 
              key={asset.id} 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    asset.type === 'post' ? "bg-blue-100 text-blue-600" : 
                    asset.type === 'ad_copy' ? "bg-emerald-100 text-emerald-600" : 
                    asset.type === 'sales_script' ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {asset.type === 'post' ? <Megaphone className="w-3.5 h-3.5" /> : 
                     asset.type === 'ad_copy' ? <Target className="w-3.5 h-3.5" /> : 
                     asset.type === 'sales_script' ? <FileText className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold text-zinc-700 truncate max-w-[150px]">{asset.title}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                  asset.status === 'published' ? "bg-emerald-100 text-emerald-600" : 
                  asset.status === 'draft' ? "bg-zinc-100 text-zinc-500" : "bg-amber-100 text-amber-600"
                )}>
                  {asset.status}
                </div>
              </div>
              
              <div className="p-4 flex-1">
                <p className="text-sm text-zinc-600 line-clamp-4 whitespace-pre-wrap mb-4">
                  {(asset as any).currentContent || asset.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                   {asset.platform && <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {asset.platform}</span>}
                   <span>•</span>
                   <span>{asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="p-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleCopy(asset.id, (asset as any).currentContent || '')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      copiedId === asset.id ? "bg-emerald-100 text-emerald-600" : "bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    )}
                  >
                    {copiedId === asset.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    const cid = prompt('Enter Campaign ID to link:');
                    if (cid) handleLinkCampaign(asset.id, cid);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Link
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-zinc-50 transition-all"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-zinc-500">Page {page + 1} of {Math.ceil(total / 20)}</span>
          <button 
            disabled={page * 20 + 20 >= total}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-zinc-50 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
