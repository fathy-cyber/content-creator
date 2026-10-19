import React, { useState } from 'react';
import { 
  PenTool, 
  LayoutTemplate, 
  Wand2, 
  Download, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Editor from './content/studio/Editor';
import TemplateLibrary from './content/studio/TemplateLibrary';
import AIAssistant from './content/studio/AIAssistant';
import Export from './content/studio/Export';

type Tab = 'editor' | 'templates' | 'ai' | 'export';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'editor', label: 'Editor', icon: PenTool },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'ai', label: 'AI Assistant', icon: Wand2 },
  { id: 'export', label: 'Export', icon: Download },
];

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor': return <Editor />;
      case 'templates': return <TemplateLibrary />;
      case 'ai': return <AIAssistant />;
      case 'export': return <Export />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Content Creation Studio</h1>
        <p className="text-zinc-500 mt-1">Create, refine, and export high-quality content with ease.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-zinc-100 bg-zinc-50/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2",
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-600 bg-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
