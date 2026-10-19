import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ModuleRegistry } from '../modules/registry';
import { CheckCircle2, Plus, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppStore() {
  const { installedAppIds, installApp, uninstallApp } = useAppStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">App Store</h1>
        <p className="text-zinc-500 mt-1">Extend your workspace with specialized AI modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ModuleRegistry.map(app => {
          const isInstalled = installedAppIds.includes(app.id);
          
          return (
            <div key={app.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col group hover:border-emerald-200 transition-all">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isInstalled ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {app.icon}
                  </div>
                  {app.isCore && (
                    <div className="px-2 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                      <ShieldCheck size={12} />
                      Core
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-zinc-900">{app.name}</h3>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{app.description}</p>
                
                <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <span>v{app.version}</span>
                  <span>•</span>
                  <span>Tunisian SME Edition</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                {isInstalled ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <CheckCircle2 size={16} />
                      Installed
                    </div>
                    <div className="flex gap-2">
                      {!app.isCore && (
                        <button 
                          onClick={() => uninstallApp(app.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Uninstall"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <button className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => installApp(app.id)}
                    className="w-full py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Install App
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
