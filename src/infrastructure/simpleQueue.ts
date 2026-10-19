// src/infrastructure/restQueue.ts
// ════════════════════════════════════════════════════════════════
// Job queue using ONLY Supabase REST API
// Works on FREE plan — no direct DB connection needed
// ════════════════════════════════════════════════════════════════

import { supabaseAdmin } from './supabaseAdmin';
import { CronExpressionParser } from 'cron-parser';

// ── Types ─────────────────────────────────────────────────────
export interface Job {
  id:          string;
  name:        string;
  payload:     Record<string, unknown>;
  status:      'pending' | 'running' | 'done' | 'failed' | 'dead';
  attempts:    number;
  maxAttempts: number;
  error?:      string;
  runAt:       string;
  createdAt:   string;
}

type JobHandler = (
  payload: Record<string, unknown>
) => Promise<void>;

// ── State ─────────────────────────────────────────────────────
const handlers    = new Map<string, JobHandler>();
let   isPolling   = false;
let   pollTimer:  ReturnType<typeof setTimeout> | null = null;
const POLL_MS     = 5_000;   // poll every 5 seconds
const LOCK_MS     = 120_000; // job lock timeout (2 minutes)

// ── Register a job handler ────────────────────────────────────
export function registerJob(
  name:    string,
  handler: JobHandler
): void {
  handlers.set(name, handler);
  console.log(`[Queue] 📋 Registered: ${name}`);
}

// ── Enqueue a job (via REST API) ─────────────────────────────
export async function enqueue(
  name:        string,
  payload:     Record<string, unknown> = {},
  options:     { runAt?: Date; maxAttempts?: number } = {}
): Promise<string | null> {

  const { data, error } = await supabaseAdmin
    .from('job_queue')
    .insert({
      name,
      payload,
      status:       'pending',
      attempts:     0,
      max_attempts: options.maxAttempts ?? 3,
      run_at:       (options.runAt ?? new Date()).toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error(`[Queue] ❌ Failed to enqueue ${name}:`, error.message);
    return null;
  }

  return data.id;
}

// ── Schedule a recurring job ───────────────────────────────────
export async function schedule(
  name:        string,
  cronExpr:    string,
  payload:     Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('job_schedules')
    .upsert({
      name,
      cron_expr: cronExpr,
      payload,
      is_active: true,
    }, { onConflict: 'name' });

  if (error) {
    console.error(`[Queue] ❌ Failed to schedule ${name}:`, error.message);
  } else {
    console.log(`[Queue] ⏰ Scheduled: ${name} (${cronExpr})`);
  }
}

// ── Claim and process one job ─────────────────────────────────
async function processNextJob(): Promise<boolean> {

  const now       = new Date().toISOString();
  const lockUntil = new Date(Date.now() + LOCK_MS).toISOString();

  // ── Step 1: Find a claimable job ──
  const { data: jobs, error: fetchError } = await supabaseAdmin
    .from('job_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('run_at', now)
    .order('run_at', { ascending: true })
    .limit(1);

  if (fetchError) {
    console.error('[Queue] Fetch error:', fetchError.message);
    return false;
  }

  if (!jobs || jobs.length === 0) return false;

  const job = jobs[0] as Job & {
    max_attempts: number;
    run_at: string;
  };

  // ── Step 2: Claim the job (optimistic lock via status update) ──
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from('job_queue')
    .update({
      status:     'running',
      started_at: now,
      attempts:   job.attempts + 1,
    })
    .eq('id', job.id)
    .eq('status', 'pending')
    .select('id')
    .single();

  if (claimError || !claimed) {
    return false;
  }

  console.log(`[Queue] ▶️  Running: ${job.name} (${job.id})`);

  // ── Step 3: Execute handler ──
  const handler = handlers.get(job.name);

  if (!handler) {
    await supabaseAdmin
      .from('job_queue')
      .update({
        status: 'failed',
        error:  `No handler registered for "${job.name}"`,
      })
      .eq('id', job.id);

    console.warn(`[Queue] ⚠️  No handler for: ${job.name}`);
    return true;
  }

  try {
    await handler(job.payload as Record<string, unknown>);

    await supabaseAdmin
      .from('job_queue')
      .update({
        status:  'done',
        done_at: new Date().toISOString(),
        error:   null,
      })
      .eq('id', job.id);

    console.log(`[Queue] ✅ Done: ${job.name} (${job.id})`);

  } catch (err: any) {
    const newAttempts  = job.attempts + 1;
    const maxAttempts  = (job as any).max_attempts ?? 3;
    const isExhausted  = newAttempts >= maxAttempts;

    const backoffMs    = Math.pow(2, newAttempts) * 60_000;
    const nextRunAt    = new Date(Date.now() + backoffMs).toISOString();

    await supabaseAdmin
      .from('job_queue')
      .update({
        status:  isExhausted ? 'dead' : 'pending',
        error:   err.message,
        run_at:  isExhausted ? (job as any).run_at : nextRunAt,
      })
      .eq('id', job.id);

    console.error(
      `[Queue] ❌ Failed: ${job.name} ` +
      `(attempt ${newAttempts}/${maxAttempts}):`,
      err.message
    );
  }

  return true;
}

// ── Poll loop ─────────────────────────────────────────────────
async function poll(): Promise<void> {
  if (!isPolling) return;

  try {
    let processed = true;
    while (processed && isPolling) {
      processed = await processNextJob();
    }

    await processDueSchedules();

  } catch (err: any) {
    console.error('[Queue] Poll error:', err.message);
  }

  if (isPolling) {
    pollTimer = setTimeout(poll, POLL_MS);
  }
}

// ── Process cron schedules ────────────────────────────────────
async function processDueSchedules(): Promise<void> {
  const now = new Date().toISOString();

  const { data: schedules } = await supabaseAdmin
    .from('job_schedules')
    .select('*')
    .eq('is_active', true)
    .or(`next_run_at.is.null,next_run_at.lte.${now}`);

  for (const schedule of schedules ?? []) {
    await enqueue(schedule.name, schedule.payload ?? {});

    const nextRun = getNextCronRun(schedule.cron_expr);

    await supabaseAdmin
      .from('job_schedules')
      .update({
        last_run_at: now,
        next_run_at: nextRun.toISOString(),
      })
      .eq('id', schedule.id);

    console.log(
      `[Queue] ⏰ Scheduled job enqueued: ${schedule.name}`,
      `next: ${nextRun.toISOString()}`
    );
  }
}

// ── Simple cron parser ──────────────────────────────────────
function getNextCronRun(cronExpr: string): Date {
  try {
    const interval = CronExpressionParser.parse(cronExpr);
    return interval.next().toDate();
  } catch (err) {
    console.error(`[Queue] Invalid cron expression: ${cronExpr}`, err);
    return new Date(Date.now() + 5 * 60_000); // Default 5 mins if invalid
  }
}

// ── Start / Stop ──────────────────────────────────────────────
export async function startQueue(): Promise<void> {
  if (isPolling) {
    console.log('[Queue] Already running');
    return;
  }

  isPolling = true;

  await supabaseAdmin
    .from('job_queue')
    .update({ status: 'pending' })
    .eq('status', 'running')
    .lt('updated_at',
      new Date(Date.now() - LOCK_MS).toISOString()
    );

  console.log('[Queue] ✅ Queue started (polling every 5s via REST API)');
  poll();
}

export async function stopQueue(): Promise<void> {
  isPolling = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  console.log('[Queue] 🛑 Queue stopped');
}

export const JOB_NAMES = {
  MATERIALIZE_KPIS:       'analytics.materialize-kpis',
  CHECK_OVERDUE_INVOICES: 'invoice.check-overdue',
  SEND_PAYMENT_REMINDER:  'invoice.send-payment-reminder',
  CHECK_SLA_BREACH:       'support.check-sla-breach',
  REPLAY_FAILED_EVENTS:   'events.replay-failed',
  CLEANUP_OLD_EVENTS:     'events.cleanup-old',
} as const;

export type JobName = typeof JOB_NAMES[keyof typeof JOB_NAMES];
