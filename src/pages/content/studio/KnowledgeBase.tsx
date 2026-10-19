import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  History, 
  ChevronRight, 
  Plus, 
  Star,
  Info,
  Shield,
  Zap,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getService } from '@/core';

interface Doc {
  id: string;
  title: string;
  type: 'internal' | 'client';
  category: string;
  updatedAt: string;
  isStarred?: boolean;
  content?: string;
}

export default function KnowledgeBase() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'library' | 'document'>('library');
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);

  const contentService = getService<any>('content');
  const assetService = contentService.assets;

  useEffect(() => {
    async function fetchDocs() {
      setIsLoading(true);
      try {
        // Fetch both internal and client docs
        const { assets: internal } = await assetService.listAssets({ limit: 50, offset: 0, type: 'internal_doc' });
        const { assets: client } = await assetService.listAssets({ limit: 50, offset: 0, type: 'document' });
        
        const allDocs = [
          ...(internal || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            type: 'internal' as const,
            category: 'Internal Wiki',
            updatedAt: a.updated_at ? new Date(a.updated_at).toLocaleDateString() : 'N/A',
            content: a.content,
          })),
          ...(client || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            type: 'client' as const,
            category: 'Client Knowledge',
            updatedAt: a.updated_at ? new Date(a.updated_at).toLocaleDateString() : 'N/A',
            content: a.content,
          })),
        ];
        
        setDocs(allDocs);
      } catch (error) {
        console.error('Failed to fetch knowledge base docs', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocs();
  }, [assetService]);

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocClick = (doc: Doc) => {
    setSelectedDoc(doc);
    setView('document');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {view === 'library' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Knowledge Base</h2>
              <p className="text-zinc-500 mt-1">Access internal wikis and client documentation.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <button className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scope</h3>
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg">All Documents</button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg">Internal Wiki</button>
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg">Client Knowledge</button>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Links</h3>
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 rounded-lg flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" /> Onboarding
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 rounded-lg flex items-center gap-2">
                    <Shield size={14} className="text-blue-500" /> Security SOPs
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 rounded-lg flex items-center gap-2">
                    <MessageSquare size={14} className="text-emerald-500" /> Client Feedback
                  </button>
                </div>
              </div>
            </div>

            {/* Main List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {isLoading ? (
                    <div className="py-20 text-center text-zinc-500">Loading knowledge base...</div>
                  ) : (
                    filteredDocs.map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => handleDocClick(doc)}
                        className="p-4 hover:bg-zinc-50 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            doc.type === 'internal' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                          )}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{doc.title}</h4>
                              {doc.isStarred && <Star size={14} className="fill-amber-400 text-amber-400" />}
                            </div>
                            <p className="text-xs text-zinc-500">{doc.category} • Updated {doc.updatedAt}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 transition-all" />
                      </div>
                    ))
                  )}
                </div>
                {!isLoading && filteredDocs.length === 0 && (
                  <div className="py-12 text-center text-zinc-500">
                    No documents found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Document View */
        <div className="space-y-6">
          <button 
            onClick={() => setView('library')}
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Library
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                {selectedDoc?.type === 'internal' ? 'Internal Wiki' : 'Client Knowledge'} • {selectedDoc?.category}
              </div>
              <h2 className="text-3xl font-bold text-zinc-900">{selectedDoc?.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all">
                View History
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-all">
                Edit Document
              </button>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 prose prose-zinc max-w-none min-h-[400px]">
            {selectedDoc?.content ? (
              <div className="text-zinc-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedDoc.content }} />
            ) : (
              <p className="text-zinc-600 leading-relaxed">
                No content available for this document.
              </p>
            )}
            <h3 className="text-xl font-bold text-zinc-900 mt-6">Key Takeaways</h3>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600">
              <li>Standardize all client communications.</li>
              <li>Follow the branding guidelines strictly.</li>
              <li>Ensure all assets are tagged correctly for searchability.</li>
            </ul>
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
              <Info className="text-blue-600 shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <strong>AI Suggestion:</strong> This document could benefit from more specific examples of client interaction.
              </div>
            </div>
          </div>

          {/* Version History Footer */}
          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <History size={16} />
                Version History
              </h3>
              <span className="text-xs text-zinc-500">Last rollback: Never</span>
            </div>
            <div className="space-y-3">
              {[
                { user: 'John Doe', date: 'May 05, 2025', action: 'Updated content structure' },
                { user: 'Jane Smith', date: 'Apr 28, 2025', action: 'Initial creation' },
              ].map((rev, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-zinc-600">
                  <span>{rev.action} by <strong>{rev.user}</strong></span>
                  <span>{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
