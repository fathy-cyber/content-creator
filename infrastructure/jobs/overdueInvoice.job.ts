import { supabase } from '../../src/lib/supabase';
import { eventBus, EVENT_NAMES, type InvoiceOverdueEvent } from '../../src/shared/events';

/**
 * Daily Cron Job: Detect overdue invoices and update client aging metrics.
 * 
 * 1. Finds invoices that are past their due date and not yet paid/cancelled.
 * 2. Updates their status to 'overdue'.
 * 3. Emits 'invoice.overdue' events.
 * 4. (CRM listener handles the actual update of client metrics).
 */
export const overdueInvoiceJob = {
  async run(): Promise<{ updatedCount: number; errors: Error[] }> {
    const errors: Error[] = [];
    let updatedCount = 0;

    console.log('[Cron] Starting overdue invoice detection...');

    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Find overdue invoices
      // Statuses that can be overdue: 'sent', 'unpaid', 'partial'
      const { data: overdueInvoices, error: fetchError } = await supabase
        .from('invoices')
        .select('id, client_id, amount_due, due_date')
        .lt('due_date', today)
        .in('status', ['sent', 'unpaid', 'partial']);

      if (fetchError) {
        throw new Error(`Failed to fetch overdue invoices: ${fetchError.message}`);
      }

      if (!overdueInvoices || overdueInvoices.length === 0) {
        console.log('[Cron] No overdue invoices found.');
        return { updatedCount: 0, errors: [] };
      }

      console.log(`[Cron] Found ${overdueInvoices.length} potentially overdue invoices.`);

      for (const invoice of overdueInvoices) {
        try {
          // 2. Update status to 'overdue'
          const { error: updateError } = await supabase
            .from('invoices')
            .update({ status: 'overdue' })
            .eq('id', invoice.id);

          if (updateError) {
            throw new Error(`Failed to update invoice ${invoice.id}: ${updateError.message}`);
          }

          // 3. Emit event
          const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
          );

          void eventBus.emit<InvoiceOverdueEvent>(EVENT_NAMES.INVOICE_OVERDUE, {
            invoiceId: invoice.id,
            customerId: String(invoice.client_id),
            amountDue: Number(invoice.amount_due),
            daysOverdue: daysOverdue, // Adding this to the payload if it's in the interface
          });

          updatedCount++;
        } catch (err) {
          const error = err as Error;
          console.error(`[Cron] Error processing invoice ${invoice.id}:`, error.message);
          errors.push(error);
        }
      }

      console.log(`[Cron] Finished. Updated ${updatedCount} invoices.`);
    } catch (err) {
      const error = err as Error;
      console.error(`[Cron] Fatal error during job execution:`, error.message);
      errors.push(error);
    }

    return { updatedCount, errors };
  }
};
