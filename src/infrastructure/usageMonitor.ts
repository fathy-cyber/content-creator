// src/infrastructure/usageMonitor.ts
// ════════════════════════════════════════════════════════════════
// Monitor Free Plan limits programmatically
// ════════════════════════════════════════════════════════════════

import { supabaseAdmin } from './supabaseAdmin';

export async function checkUsageLimits() {
  try {
    // Check job_queue size as a proxy for DB activity/growth
    const { count, error } = await supabaseAdmin
      .from('job_queue')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`[Usage] job_queue rows: ${count}`);

    // Note: Supabase Free Plan Limits:
    // DB: 500MB
    // Storage: 1GB
    // Realtime: 2M messages/mo
    
    if (count && count > 10000) {
      console.warn('[Usage] ⚠️  job_queue is growing large. Consider cleanup.');
    }

  } catch (err: any) {
    console.error('[Usage] Error monitoring limits:', err.message);
  }
}
