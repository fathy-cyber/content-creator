// src/infrastructure/supabaseAdmin.ts
// ════════════════════════════════════════════════════════════════
// Uses SERVICE ROLE KEY — bypasses RLS for background jobs
// NEVER expose this in the browser/frontend
// ════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Ensure .env.local is loaded for workers
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL
                       ?? process.env.SUPABASE_URL!;

const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL) {
  throw new Error('[Admin] SUPABASE_URL is not set');
}

if (!SERVICE_ROLE_KEY) {
  throw new Error(
    '[Admin] SUPABASE_SERVICE_ROLE_KEY is not set.\\n' +
    'Get it from: Supabase Dashboard → Settings → API → service_role key'
  );
}

// ── Service role client (no RLS restrictions) ─────────────────
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
      detectSessionInUrl: false,
    },
  }
);

console.log('[Admin] ✅ Supabase admin client ready');
