// src/infrastructure/keepalive.ts
// ════════════════════════════════════════════════════════════════
// Ping Supabase every 6 days to prevent free plan pausing
// ════════════════════════════════════════════════════════════════

import { supabaseAdmin } from './supabaseAdmin';

export function startKeepalive(): void {
  const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

  const ping = async () => {
    try {
      await supabaseAdmin
        .from('job_queue')
        .select('id')
        .limit(1);
      console.log('[Keepalive] ✅ Project active');
    } catch (e: any) {
      console.warn('[Keepalive] Ping failed:', e.message);
    }
  };

  setInterval(ping, SIX_DAYS_MS);
  console.log('[Keepalive] Started (polling every 6 days)');
}
