import React, { useState, useEffect } from 'react';
import { ChevronDown, Folder, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContextStore } from '@/core/context/ContextStore';
import { contextBridge } from '@/core/context/ContextBridge';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ProjectSwitcher() {
  const { activeClientId, activeProjectId } = useContextStore();
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      if (!activeClientId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', activeClientId)
          .order('name', { ascending: true });
        
        if (error) throw error;
        setProjects(data || []);
      } catch (e) {
        console.error('Failed to fetch projects for switcher', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [activeClientId]);

  const handleSelectProject = async (projectId: string) => {
    setIsOpen(false);
    try {
      await contextBridge.setActiveProject(projectId);
    } catch (e) {
      console.error('Failed to set active project', e);
    }
  };

  if (!activeClientId) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all shadow-sm"
      >
        {activeProjectId ? (
          <>
            <Folder className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-zinc-900">
              {useContextStore.getState().activeProject?.name || 'Selected Project'}
            </span>
          </>
        ) : (
          <>
            <Folder className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-500">Select Project</span>
          </>
        )}
        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
          {loading ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">No projects for this client</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                    activeProjectId === project.id ? "bg-indigo-50 text-indigo-600" : "text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <span className="font-medium">{project.name}</span>
                  {activeProjectId === project.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
