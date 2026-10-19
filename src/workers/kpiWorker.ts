// src/workers/kpiWorker.ts
import { registerJob, JOB_NAMES } from '../infrastructure/simpleQueue';
import { supabase } from '../lib/supabase';

export async function registerKpiWorker() {
  // Note: Scheduling is now handled in registerAllJobs in jobHandlers.ts
  
  registerJob(JOB_NAMES.MATERIALIZE_KPIS, async () => {
    console.log('[KpiWorker] Materializing KPIs...');
    const { error } = await supabase.rpc('materialize_kpis');
    if (error) throw error;
  });
}
