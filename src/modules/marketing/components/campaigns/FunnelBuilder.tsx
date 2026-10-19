import React, { useState, useEffect } from 'react';
import { 
  Layers, ArrowRight, ArrowLeft, CheckCircle2, Plus, Trash2, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { saveFunnel, loadFunnel, listFunnels } from '../../index';
import ToolPageLayout from '../shared/ToolPageLayout';

export default function FunnelBuilder() {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orgId, setOrgId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      resolveOrgId(user.id).then(setOrgId);
    });
  }, []);

  async function resolveOrgId(userId: string): Promise<string> {
    const { data: u } = await supabase.from('users').select('org_id').eq('id', userId).maybeSingle();
    if (u?.org_id) return u.org_id;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('owner_id', userId).maybeSingle();
    return ws?.id || '';
  }

  const fetchFunnels = async () => {
    if (!orgId) return;
    try {
      const data = await listFunnels(orgId);
      setFunnels(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load funnels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchFunnels();
  }, [orgId]);

  const handleCreateFunnel = async () => {
    if (!orgId || !userId) return;
    try {
      const newFunnel = {
        name: 'New Sales Funnel',
        campaign_id: null,
        stages: [
          { name: 'Awareness', targetConversion: 100, linkedAsset: null },
          { name: 'Consideration', targetConversion: 40, linkedAsset: null },
          { name: 'Conversion', targetConversion: 10, linkedAsset: null },
        ],
        created_by: userId,
        org_id: orgId,
      };
      await saveFunnel(newFunnel);
      toast.success('Funnel created!');
      await fetchFunnels();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create funnel');
    }
  };

  const handleSaveFunnel = async () => {
    if (!selectedFunnel) return;
    setIsSaving(true);
    try {
      await saveFunnel(selectedFunnel);
      toast.success('Funnel updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save funnel');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStage = (index: number, field: string, value: any) => {
    const newStages = [...selectedFunnel.stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setSelectedFunnel({ ...selectedFunnel, stages: newStages });
  };

  if (isLoading) {
    return (
    <ToolPageLayout>
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    </ToolPageLayout>
    );
  }

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8 text-purple-600" />
            Funnel Builder
          </h1>
          <p className="text-zinc-500 text-lg">
            Design and deploy high-converting sales funnels.
          </p>
        </div>
        <button 
          onClick={handleCreateFunnel}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> New Funnel
        </button>
      </div>

      {!selectedFunnel ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funnels.length === 0 ? (
            <div className="col-span-full py-20 text-center text-zinc-500 border-2 border-dashed border-zinc-200 rounded-3xl">
              No funnels found. Create your first one to start mapping your customer journey.
            </div>
          ) : (
            funnels.map((f) => (
              <div 
                key={f.id} 
                onClick={() => setSelectedFunnel(f)}
                className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:border-purple-600 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Layers size={24} />
                  </div>
                  <span className="text-xs font-bold text-zinc-400">{f.stages?.length || 0} Stages</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{f.name}</h3>
                <p className="text-zinc-500 mb-6 leading-relaxed line-clamp-2">
                  Funnel for {f.campaign_id || 'General Marketing'}.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
                  Edit Funnel <ArrowRight size={16} className="ml-auto" />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedFunnel(null)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-500" />
              </button>
              <input 
                className="text-2xl font-bold text-zinc-900 border-none outline-none bg-transparent focus:ring-0"
                value={selectedFunnel.name}
                onChange={(e) => setSelectedFunnel({...selectedFunnel, name: e.target.value})}
              />
            </div>
            <button 
              onClick={handleSaveFunnel}
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            {selectedFunnel.stages.map((stage: any, index: number) => (
              <React.Fragment key={index}>
                <div className="w-full max-w-2xl bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {index + 1}
                      </span>
                      <input 
                        className="font-bold text-zinc-900 bg-transparent border-none outline-none focus:ring-0 w-full"
                        value={stage.name}
                        onChange={(e) => updateStage(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Target Conv %</label>
                        <input 
                          type="number"
                          className="w-full p-2 rounded-lg border border-zinc-200 text-sm"
                          value={stage.targetConversion}
                          onChange={(e) => updateStage(index, 'targetConversion', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Linked Asset</label>
                        <input 
                          type="text"
                          placeholder="Asset ID..."
                          className="w-full p-2 rounded-lg border border-zinc-200 text-sm"
                          value={stage.linkedAsset || ''}
                          onChange={(e) => updateStage(index, 'linkedAsset', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const newStages = selectedFunnel.stages.filter((_, i) => i !== index);
                      setSelectedFunnel({...selectedFunnel, stages: newStages});
                    }}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {index < selectedFunnel.stages.length - 1 && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-0.5 h-8 bg-zinc-200"></div>
                    <button 
                      onClick={() => {
                        const newStages = [...selectedFunnel.stages];
                        newStages.splice(index + 1, 0, { name: 'New Stage', targetConversion: 0, linkedAsset: null });
                        setSelectedFunnel({...selectedFunnel, stages: newStages});
                      }}
                      className="p-1 bg-white border border-zinc-200 rounded-full text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))}
            
            <button 
              onClick={() => {
                const newStages = [...selectedFunnel.stages, { name: 'New Stage', targetConversion: 0, linkedAsset: null }];
                setSelectedFunnel({...selectedFunnel, stages: newStages});
              }}
              className="mt-6 px-4 py-2 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-500 hover:border-purple-400 hover:text-purple-600 transition-all flex items-center gap-2 font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> Add Final Stage
            </button>
          </div>
        </div>
      )}
    </div>
    </ToolPageLayout>
  );
}
