// src/infrastructure/jobs/jobHandlers.ts
// ════════════════════════════════════════════════════════════════
// Updated to use simpleQueue instead of pg-boss
// ════════════════════════════════════════════════════════════════

import {
  registerJob,
  schedule,
  startQueue,
  JOB_NAMES,
} from '../simpleQueue';

import { supabase }  from '../../lib/supabase';
import { eventBus }  from '../../core/events/EventBus';
import { EVENT_NAMES } from '../../shared/events/event-names';

export async function registerAllJobs(): Promise<void> {

  // ── JOB 1: Materialize KPIs ──────────────────────────────
  registerJob(JOB_NAMES.MATERIALIZE_KPIS, async () => {
    console.log('[Jobs] Running KPI materialization...');
    const { error } = await supabase.rpc('materialize_kpis');
    if (error) throw error;
    console.log('[Jobs] ✅ KPIs materialized');
  });

  // ── JOB 2: Check Overdue Invoices ────────────────────────
  registerJob(JOB_NAMES.CHECK_OVERDUE_INVOICES, async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, client_id, amount_due, due_date')
      .in('status', ['sent', 'unpaid'])
      .lt('due_date', today)
      .is('deleted_at', null);

    if (error) throw error;
    if (!invoices?.length) return;

    for (const invoice of invoices) {
      await supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .eq('id', invoice.id);

      await eventBus.emit(EVENT_NAMES.INVOICE_OVERDUE, {
        invoiceId: invoice.id,
        clientId:  invoice.client_id,
        amountDue: invoice.amount_due,
        dueDate:   invoice.due_date,
      }, { sourceModule: 'invoice' });
    }

    console.log(`[Jobs] ✅ Marked ${invoices.length} invoices as overdue`);
  });

  // ── JOB 3: SLA Breach Check ──────────────────────────────
  registerJob(JOB_NAMES.CHECK_SLA_BREACH, async () => {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, ticket_number, priority, sla_hours, created_at, client_id')
      .in('status', ['open', 'in_progress'])
      .is('first_response_at', null)
      .is('deleted_at', null);

    for (const ticket of tickets ?? []) {
      const hoursElapsed =
        (Date.now() - new Date(ticket.created_at).getTime()) / 3_600_000;

      if (hoursElapsed >= ticket.sla_hours) {
        await eventBus.emit(EVENT_NAMES.SUPPORT_SLA_BREACHED, {
          ticketId:     ticket.id,
          ticketNumber: ticket.ticket_number,
          hoursElapsed: Math.round(hoursElapsed),
        }, { sourceModule: 'support' });
      }
    }
  });

  // ── JOB 4: Replay Failed Events ──────────────────────────
  registerJob(JOB_NAMES.REPLAY_FAILED_EVENTS, async () => {
    const count = await eventBus.replayPendingEvents();
    if (count > 0) console.log(`[Jobs] ✅ Replayed ${count} events`);
  });

  // ── Schedule recurring jobs ───────────────────────────────
  await schedule(JOB_NAMES.MATERIALIZE_KPIS,       '0 * * * *');
  await schedule(JOB_NAMES.CHECK_OVERDUE_INVOICES,  '0 8 * * *');
  await schedule(JOB_NAMES.CHECK_SLA_BREACH,        '*/30 * * * *');
  await schedule(JOB_NAMES.REPLAY_FAILED_EVENTS,    '*/5 * * * *');

  // ── Start the queue ───────────────────────────────────────
  await startQueue();

  console.log('[Jobs] ✅ All jobs registered and queue started');
}
