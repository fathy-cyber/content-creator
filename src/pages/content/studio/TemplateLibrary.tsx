import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Mail, 
  Share2, 
  Briefcase, 
  FileCode,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getService } from '@/core';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'blog' | 'email' | 'social' | 'case-study' | 'proposal';
  icon: React.ElementType;
}

const ICON_MAP = {
  blog: FileText,
  email: Mail,
  social: Share2,
  'case-study': Briefcase,
  proposal: FileCode,
};

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'blog', label: 'Blog Posts' },
  { id: 'email', label: 'Emails' },
  { id: 'social', label: 'Social Media' },
  { id: 'case-study', label: 'Case Studies' },
  { id: 'proposal', label: 'Proposals' },
];

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const contentService = getService<any>('content');
  const templateService = contentService.template;

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await templateService.listTemplates(selectedCategory === 'all' ? undefined : selectedCategory);
        // Map DB response to UI format
        const mapped = data.map((t: any) => ({
          ...t,
          title: t.name,
          description: t.description || 'No description provided.',
          icon: ICON_MAP[t.category as keyof typeof ICON_MAP] || FileText,
        }));
        setTemplates(mapped);
      } catch (error) {
        console.error('Failed to fetch templates', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, [selectedCategory, templateService]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Template Library</h2>
          <p className="text-sm text-zinc-500">Choose from our curated collection of high-performing templates.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedCategory === cat.id
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-zinc-500">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-5 bg-white border border-zinc-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-emerald-50 transition-colors text-zinc-600 group-hover:text-emerald-600">
                  <template.icon size={24} />
                </div>
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">{template.title}</h3>
              <p className="text-sm text-zinc-500 line-clamp-2">{template.description}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredTemplates.length === 0 && (
        <div className="py-12 text-center text-zinc-500">
          No templates found matching your criteria.
        </div>
      )}
    </div>
  );
}
