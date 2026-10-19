import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Layout, 
  BarChart3, 
  Search, 
  Plus, 
  Settings2, 
  TrendingUp, 
  Users, 
  MousePointerClick,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getService } from '@/core';

interface BlogPosts {
  id: string;
  title: string;
  author: string;
  date: string;
  views: string;
  status: 'published' | 'draft';
}

export default function WebsiteBlogManager() {
  const [posts, setPosts] = useState<BlogPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'blogs' | 'seo' | 'builder' | 'performance'>('blogs');

  const contentService = getService<any>('content');
  const assetService = contentService.assets;

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const { assets: data } = await assetService.listAssets({ 
          limit: 50, 
          offset: 0, 
          type: 'post' 
        });
        
        const mapped = (data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          author: a.created_by || 'System',
          date: a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A',
          views: '0', // Views not tracked in assetService
          status: a.status === 'published' ? 'published' : 'draft',
        }));
        
        setPosts(mapped);
      } catch (error) {
        console.error('Failed to fetch blog posts', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, [assetService]);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Website & Blog Manager</h2>
          <p className="text-zinc-500 mt-1">Manage your online presence, SEO, and landing pages.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Settings2 size={20} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
            <Plus size={20} />
            New Page
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'blogs', label: 'Blog Posts', icon: FileText },
          { id: 'seo', label: 'SEO Manager', icon: Search },
          { id: 'builder', label: 'Landing Builder', icon: Layout },
          { id: 'performance', label: 'Performance', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px] bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">Recent Blog Posts</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search posts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                    <th className="pb-3 px-2">Title</th>
                    <th className="pb-3 px-2">Author</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Views</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-zinc-500">Loading posts...</td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-zinc-500">No posts found.</td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="group hover:bg-zinc-50 transition-colors">
                        <td className="py-4 px-2 font-medium text-zinc-900">{post.title}</td>
                        <td className="py-4 px-2 text-sm text-zinc-500">{post.author}</td>
                        <td className="py-4 px-2 text-sm text-zinc-500">{post.date}</td>
                        <td className="py-4 px-2 text-sm text-zinc-500">{post.views}</td>
                        <td className="py-4 px-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                            post.status === 'published' ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                          )}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <div className="text-2xl font-bold text-emerald-900">92</div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">SEO Score</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                  <AlertCircle size={24} />
                </div>
                <div className="text-2xl font-bold text-amber-900">3</div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Warnings</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp size={24} />
                </div>
                <div className="text-2xl font-bold text-blue-900">+12%</div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Growth</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900">SEO Recommendations</h3>
              <div className="space-y-3">
                {[
                  { title: 'Missing Alt Text', desc: 'Add alt text to 5 images in "Summer Collection"', type: 'warning' },
                  { title: 'Meta Description', desc: 'Optimize meta description for "Digital Agency Tunisia"', type: 'info' },
                  { title: 'Internal Linking', desc: 'Add 3 internal links to "Service Page"', type: 'info' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      item.type === 'warning' ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{item.title}</div>
                      <div className="text-xs text-zinc-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
              <Layout size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Landing Page Builder</h3>
              <p className="text-zinc-500 max-w-sm">Drag and drop components to create conversion-optimized landing pages.</p>
            </div>
            <button className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all">
              Launch Builder
            </button>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Page Views', value: '45.2k', icon: Globe, color: 'text-blue-600' },
                { label: 'Bounce Rate', value: '32.4%', icon: AlertCircle, color: 'text-amber-600' },
                { label: 'Conv. Rate', value: '4.8%', icon: MousePointerClick, color: 'text-emerald-600' },
                { label: 'Avg. Session', value: '2m 45s', icon: Clock, color: 'text-purple-600' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <stat.icon size={16} className={stat.color} />
                    <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                </div>
              ))}
            </div>
            
            <div className="h-64 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-400 text-sm">
              [Chart Placeholder: Traffic Over Time]
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
