import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  MoreVertical, 
  Search, 
  Plus, 
  Filter,
  Tag,
  Clock,
  ShieldCheck,
  Users,
  ArrowUpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getService } from '@/core';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: string;
  updatedAt: string;
  tags: string[];
  color: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Assets', icon: Folder },
  { id: 'image', label: 'Images', icon: ImageIcon },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'document', label: 'Documents', icon: FileText },
];

export default function DigitalAssetManager() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const contentService = getService<any>('content');
  const assetService = contentService.assets;

  useEffect(() => {
    async function fetchAssets() {
      setIsLoading(true);
      try {
        const { assets: data } = await assetService.listAssets({ 
          limit: 50, 
          offset: 0,
          type: selectedCategory === 'all' ? undefined : selectedCategory 
        });
        
        // Map DB response (marketing_assets) to UI Asset format
        const mapped = (data || []).map((a: any) => ({
          id: a.id,
          name: a.title,
          type: a.type === 'post' ? 'document' : a.type, // Simplification for DAM
          size: 'Unknown', // Database doesn't track size for text assets
          updatedAt: a.updated_at ? new Date(a.updated_at).toLocaleDateString() : 'N/A',
          tags: [], // Not implemented in assetService yet
          color: a.type === 'post' ? 'bg-blue-500' : 'bg-emerald-500',
        }));
        
        setAssets(mapped);
      } catch (error) {
        console.error('Failed to fetch assets', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssets();
  }, [selectedCategory, assetService]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Digital Asset Manager</h2>
          <p className="text-zinc-500 mt-1">Centralized library for all your brand and client assets.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search assets or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl p-1 shadow-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
              )}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-zinc-200 mx-2 hidden md:block" />

        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <button className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
            <Tag size={16} />
            Tags
          </button>
          <button className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
            <Clock size={16} />
            Recent
          </button>
          <button className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
            <ShieldCheck size={16} />
            Permissions
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-100">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-zinc-500">Loading assets...</td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm", asset.color)}>
                        {asset.type === 'image' && <ImageIcon size={20} />}
                        {asset.type === 'video' && <Video size={20} />}
                        {asset.type === 'document' && <FileText size={20} />}
                      </div>
                      <span className="font-medium text-zinc-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 capitalize">{asset.type}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{asset.size}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{asset.updatedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!isLoading && filteredAssets.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-zinc-50 rounded-full text-zinc-400 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No assets found</h3>
            <p className="text-zinc-500">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>

      {/* Quick Stats / Usage Tracking Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{assets.length}</div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Assets</div>
          </div>
        </div>
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">12</div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Team Members</div>
          </div>
        </div>
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">452</div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Uses</div>
          </div>
        </div>
      </div>
    </div>
  );
}
