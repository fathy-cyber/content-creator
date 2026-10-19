import React, { useState, useEffect } from 'react';
import { ChevronDown, User, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContextStore } from '@/core/context/ContextStore';
import { contextBridge } from '@/core/context/ContextBridge';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ClientSwitcher() {
  const { activeClientId, activeClient } = useContextStore();
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        setClients(data || []);
      } catch (e) {
        console.error('Failed to fetch clients for switcher', e);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const handleSelectClient = async (clientId: string) => {
    setIsOpen(false);
    try {
      await contextBridge.setActiveClient(clientId);
    } catch (e) {
      console.error('Failed to set active client', e);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all shadow-sm"
      >
        {activeClient ? (
          <>
            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">
              {activeClient.name[0]}
            </div>
            <span className="text-sm font-bold text-zinc-900">{activeClient.name}</span>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-500">Select Client</span>
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
          ) : clients.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">No clients found</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                    activeClientId === client.id ? "bg-indigo-50 text-indigo-600" : "text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center text-[8px] font-bold">
                      {client.name[0]}
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  {activeClientId === client.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
