// src/workers/invoiceWorker.ts
import { registerJob, enqueue, JOB_NAMES } from '../infrastructure/simpleQueue';
import { supabase } from '../lib/supabase';
import { eventBus, EVENT_NAMES } from '../shared/events';

export async function registerInvoiceWorker() {
  // ── Job 1: Check Overdue Invoices ──────────────────────────
  registerJob(JOB_NAMES.CHECK_OVERDUE_INVOICES, async () => {
    console.log('[InvoiceWorker] Checking overdue invoices...');
    const today = new Date().toISOString().split('T')[0];

    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, client_id, amount_due, due_date')
      .in('status', ['sent', 'unpaid'])
      .lt('due_date', today)
      .is('deleted_at', null);

    if (error) throw error;
    for (const invoice of overdueInvoices ?? []) {
      await supabase.from('invoices').update({ status: 'overdue' }).eq('id', invoice.id);
      await eventBus.emit(EVENT_NAMES.INVOICE_OVERDUE, {
        invoiceId: invoice.id,
        clientId: invoice.client_id,
        amountDue: invoice.amount_due,
        dueDate: invoice.due_date,
        daysOverdue: Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86_400_000),
      }, { sourceModule: 'invoice', sourceEntityId: invoice.id });

      await enqueue(JOB_NAMES.SEND_PAYMENT_REMINDER, { invoiceId: invoice.id, attempt: 1 });
    }
  });

  // ── Job 2: Send Payment Reminder ───────────────────────────
  registerJob(JOB_NAMES.SEND_PAYMENT_REMINDER, async (payload) => {
    console.log(`[InvoiceWorker] Sending payment reminder for ${payload.invoiceId}`);
    // Logic to send email/SMS
  });
}
