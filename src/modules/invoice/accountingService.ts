import { supabase } from '../../lib/supabase';
import {
  eventBus,
  EVENT_NAMES,
  type SalesOrderConfirmedEvent,
  type InvoiceCreatedEvent,
  type InvoicePaidEvent,
  type ProjectTimesheetApprovedEvent,
  type ProjectMilestoneReachedEvent,
  type ProjectCompletedEvent,
  type BillingSessionApprovedEvent,
} from '../../shared/events';
import { projectService } from '../project/projectService';
import { auditLog } from '../../infrastructure/audit';
import { type Invoice, type InvoiceItem } from '../../shared/types/invoice';
import { type RecordPaymentDTO } from '../../shared/contracts/payment.contract';

// ─────────────────────────────────────────────────────────────
// IDEMPOTENCY LOCK
// Prevents race conditions when the same event fires twice
// before the first DB write completes
// ─────────────────────────────────────────────────────────────
const processingOrders = new Set<string>();

const isValidUuid = (id: any): boolean => {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg =
      error?.message ||
      error?.error_description ||
      JSON.stringify(error) ||
      'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

// ─────────────────────────────────────────────────────────────
// SAFE INVOICE NUMBER GENERATOR
// Generates a unique number even if called multiple times
// Format: INV-YYYYMM-XXXX (e.g., INV-202401-0042)
// ─────────────────────────────────────────────────────────────
export async function generateInvoiceNumber(prefix: string = 'INV'): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Get the latest invoice number for this month from DB
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}-${yearMonth}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[Invoice] Could not fetch last invoice number, using timestamp fallback');
    // Fallback: timestamp-based (still unique, less pretty)
    return `${prefix}-${yearMonth}-${Date.now().toString().slice(-6)}`;
  }

  let nextSequence = 1;
  if (data?.invoice_number) {
    // Extract sequence number: "INV-202401-0042" → 42
    const parts = data.invoice_number.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  return `${prefix}-${yearMonth}-${String(nextSequence).padStart(4, '0')}`;
}

// ─────────────────────────────────────────────────────────────
// ACCOUNTING SERVICE
// ─────────────────────────────────────────────────────────────
export const accountingService = {

  async createInvoiceFromBillingSession(sessionId: string): Promise<Invoice> {
    const { data: session, error: sessionError } = await supabase
      .from('billing_sessions')
      .select('*, projects(id, name, customer_id, customer_name)')
      .eq('id', sessionId)
      .single();
 
    if (sessionError || !session) {
      throw new Error(`Billing session not found: ${sessionId}`);
    }
 
    const { data: items, error: itemsError } = await supabase
      .from('billing_items')
      .select('*')
      .eq('billing_session_id', sessionId);
 
    if (itemsError) throw itemsError;
 
    const invoice = await this.createInvoice({
      projectId: session.project_id,
      customerId: session.projects?.customer_id,
      customerName: session.projects?.customer_name || session.projects?.name,
      total: session.net_amount,
      subtotal: session.gross_amount,
      taxAmount: 0,
      status: 'sent',
      notes: `Invoice generated from billing session ${sessionId}`,
    });
 
    if (!invoice) {
      throw new Error(`Invoice creation failed for session ${sessionId}: RPC returned no data`);
    }
 
    for (const item of items) {
      await supabase.from('invoice_items').insert({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.amount,
      });
    }
 
    await supabase.from('billing_items')
      .update({ is_billed: true, billed_at: new Date().toISOString() })
      .eq('billing_session_id', sessionId);
 
    await supabase.from('projects')
      .update({ billing_status: 'invoiced' })
      .eq('id', session.project_id);
 
    return invoice;
  },
 
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase.rpc('get_invoices');
    if (error) supabaseError('Failed to fetch invoices', error);
    return (data || []).map((inv: any) => ({
      id: inv.id,
      orderId: inv.order_id,
      projectId: inv.project_id,
      customerId: inv.client_id,
      customerName: inv.customer_name,
      number: inv.invoice_number,
      type: inv.type,
      status: inv.status,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.tax_amount),
      total: Number(inv.total),
      amountPaid: Number(inv.amount_paid),
      amountDue: Number(inv.amount_due),
      notes: inv.notes,
      createdAt: inv.created_at,
    }));
  },

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const { data: invData, error } = await supabase.rpc('get_invoice_by_id', {
      p_id: id,
    });
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      supabaseError('Failed to fetch invoice', error);
    }
    if (!invData) return undefined;

    const { data: itemsData } = await supabase.rpc('get_invoice_items_by_id', {
      p_invoice_id: id,
    });

    const items: InvoiceItem[] = (itemsData || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      total: Number(item.total),
    }));

    return {
      id: invData.id,
      orderId: invData.order_id,
      projectId: invData.project_id,
      customerId: invData.client_id,
      customerName: invData.customer_name,
      number: invData.invoice_number,
      type: invData.type,
      status: invData.status,
      issueDate: invData.issue_date,
      dueDate: invData.due_date,
      subtotal: Number(invData.subtotal),
      taxAmount: Number(invData.tax_amount),
      total: Number(invData.total),
      amountPaid: Number(invData.amount_paid),
      amountDue: Number(invData.amount_due),
      notes: invData.notes,
      createdAt: invData.created_at,
      items,
    };
  },

  async getInvoiceByOrderId(orderId: string): Promise<Invoice | undefined> {
    if (!orderId) return undefined;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) supabaseError('Failed to fetch invoice by order ID', error);
    if (!data) return undefined;

    return {
      id: data.id,
      orderId: data.order_id,
      projectId: data.project_id,
      customerId: data.client_id,
      customerName: data.customer_name,
      number: data.invoice_number,
      type: data.type,
      status: data.status,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      subtotal: Number(data.subtotal),
      taxAmount: Number(data.tax_amount),
      total: Number(data.total),
      amountPaid: Number(data.amount_paid),
      amountDue: Number(data.amount_due),
      notes: data.notes,
      createdAt: data.created_at,
    };
  },

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const customerIdNum =
      typeof data.customerId === 'string' && /^\d+$/.test(data.customerId)
        ? Number(data.customerId)
        : typeof data.customerId === 'number'
        ? data.customerId
        : null;

    const projectIdNum =
      typeof data.projectId === 'string' && /^\d+$/.test(data.projectId)
        ? Number(data.projectId)
        : typeof data.projectId === 'number'
        ? data.projectId
        : null;

    // ── Generate safe unique number if not explicitly provided ──
    const invoiceNumber = data.number && data.number.trim() !== ''
      ? data.number
      : await generateInvoiceNumber('INV');

    const { data: invoice, error } = await supabase.rpc('create_invoice', {
      p_order_id: data.orderId && isValidUuid(data.orderId) ? data.orderId : null,
      p_project_id: projectIdNum,
      p_client_id: customerIdNum,
      p_customer_name: data.customerName || '',
      p_invoice_number: invoiceNumber,
      p_type: data.type || 'standard',
      p_status: data.status || 'draft',
      p_issue_date:
        data.issueDate || new Date().toISOString().split('T')[0],
      p_due_date:
        data.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      p_subtotal: data.subtotal || 0,
      p_tax_amount: data.taxAmount || 0,
      p_total: data.total || 0,
      p_notes: data.notes || '',
    });

    if (error) {
      // ── Handle duplicate number gracefully (last resort) ──
      if (
        error.message?.includes('duplicate key') &&
        error.message?.includes('invoice_number')
      ) {
        console.warn('[Invoice] Duplicate number detected, regenerating...');
        // Force a timestamp-based unique number and retry once
        const fallbackNumber = `INV-${Date.now()}`;
        const { data: retryInvoice, error: retryError } = await supabase.rpc(
          'create_invoice',
          {
            p_order_id:
              data.orderId && isValidUuid(data.orderId) ? data.orderId : null,
            p_project_id: projectIdNum,
            p_client_id: customerIdNum,
            p_customer_name: data.customerName || '',
            p_invoice_number: fallbackNumber,
            p_type: data.type || 'standard',
            p_status: data.status || 'draft',
            p_issue_date:
              data.issueDate || new Date().toISOString().split('T')[0],
            p_due_date:
              data.dueDate ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            p_subtotal: data.subtotal || 0,
            p_tax_amount: data.taxAmount || 0,
            p_total: data.total || 0,
            p_notes: data.notes || '',
          }
        );
        if (retryError) supabaseError('Failed to create invoice (retry)', retryError);
        const retried = retryInvoice as Invoice;
        void eventBus.emit<InvoiceCreatedEvent>(EVENT_NAMES.INVOICE_CREATED, {
          invoice: {
            id: retried.id,
            number: retried.number,
            total: retried.total,
            customerId: String(retried.customerId),
            status: retried.status,
          },
        });
        return retried;
      }
      supabaseError('Failed to create invoice', error);
    }

    const createdInvoice = {
      ...invoice,
      number: invoice.invoice_number || invoice.number,
      customerId: invoice.client_id || invoice.customerId,
      customerName: invoice.customer_name || invoice.customerName,
      projectId: invoice.project_id || invoice.projectId,
      orderId: invoice.order_id || invoice.orderId,
      status: invoice.status,
      total: Number(invoice.total),
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.tax_amount || invoice.taxAmount),
      amountPaid: Number(invoice.amount_paid || invoice.amountPaid),
      amountDue: Number(invoice.amount_due || invoice.amountDue),
    } as Invoice;
 
    void eventBus.emit<InvoiceCreatedEvent>(EVENT_NAMES.INVOICE_CREATED, {
      invoice: {
        id: createdInvoice.id,
        number: createdInvoice.number,
        total: createdInvoice.total,
        customerId: String(createdInvoice.customerId),
        status: createdInvoice.status,
      },
    });
    return createdInvoice;
  },

  async updateInvoice(
    id: string,
    updates: Partial<Invoice>
  ): Promise<Invoice | null> {
    const paramMap: Record<string, string> = {
      orderId: 'p_order_id',
      projectId: 'p_project_id',
      customerId: 'p_client_id',
      customerName: 'p_customer_name',
      type: 'p_type',
      status: 'p_status',
      issueDate: 'p_issue_date',
      dueDate: 'p_due_date',
      subtotal: 'p_subtotal',
      taxAmount: 'p_tax_amount',
      total: 'p_total',
      amountPaid: 'p_amount_paid',
      amountDue: 'p_amount_due',
      notes: 'p_notes',
    };

    const params: Record<string, any> = { p_id: id };
    for (const [key, value] of Object.entries(updates)) {
      if (paramMap[key]) {
        if (key === 'customerId' || key === 'projectId') {
          const numVal =
            typeof value === 'string' && /^\d+$/.test(value)
              ? Number(value)
              : typeof value === 'number'
              ? value
              : null;
          params[paramMap[key]] = numVal;
        } else {
          params[paramMap[key]] = value;
        }
      }
    }

    // Handle items update if provided
    if ('items' in updates && updates.items) {
      const items = updates.items;
      
      // Delete existing items first
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);
        
      if (deleteError) supabaseError('Failed to clear existing invoice items', deleteError);

      // Insert new items
      const itemsToInsert = items.map(item => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
      }));

      const { error: insertError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (insertError) supabaseError('Failed to insert new invoice items', insertError);
    }

    const currentInvoice = await this.getInvoice(id);
    const { data, error } = await supabase.rpc('update_invoice', params);
    if (error) supabaseError('Failed to update invoice', error);
    
    const updatedInvoice = await this.getInvoice(id);
    if (updatedInvoice) {
      await auditLog({
        module: 'invoice',
        entityType: 'Invoice',
        entityId: id,
        action: 'UPDATE',
        oldValues: currentInvoice,
        newValues: updatedInvoice,
      });
    }

    // Return fully hydrated invoice including items
    return updatedInvoice;
  },

  async sendInvoice(id: string) {
    return this.updateInvoice(id, { status: 'sent' });
  },

  async markPaid(id: string) {
    const invoice = await this.updateInvoice(id, { status: 'paid' });
    if (invoice) {
      void eventBus.emit<InvoicePaidEvent>(EVENT_NAMES.INVOICE_PAID, {
        invoiceId: id,
        amountPaid: invoice.total,
        paymentDate: new Date().toISOString(),
      });
    }
    return invoice;
  },

  async recordPayment(dto: RecordPaymentDTO): Promise<Invoice> {
    const { invoiceId, amount, method, reference } = dto;
 
    // 1. Get the invoice
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }
 
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      throw new Error(`Cannot record payment for invoice with status: ${invoice.status}`);
    }
 
    if (amount > invoice.amountDue) {
      throw new Error(`Payment amount (${amount}) exceeds amount due (${invoice.amountDue})`);
    }
 
    // 2. Record the payment in DB
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount: amount,
        method: method,
        reference: reference,
        paid_at: new Date().toISOString(),
      });
 
    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`);
    }
 
    // 3. Update invoice amounts and status
    const newAmountPaid = invoice.amountPaid + amount;
    const newAmountDue = invoice.amountDue - amount;
    const newStatus = newAmountDue <= 0 ? 'paid' : 'partial';
 
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newStatus,
      })
      .eq('id', invoiceId)
      .select()
      .single();
 
    if (updateError) {
      throw new Error(`Failed to update invoice after payment: ${updateError.message}`);
    }
 
    if (!updatedInvoice) {
      throw new Error(`Failed to retrieve updated invoice: ${invoiceId}`);
    }
 
    // 4. Emit event if fully paid
    if (newStatus === 'paid') {
      void eventBus.emit<InvoicePaidEvent>(EVENT_NAMES.INVOICE_PAID, {
        invoiceId: invoiceId,
        clientId: invoice.customerId ? String(invoice.customerId) : undefined,
        amountPaid: newAmountPaid,
        paymentDate: new Date().toISOString(),
      });
    }
 
    // 5. Revenue Propagation: Emit revenue realized event
    void eventBus.emit('revenue.realized', {
      invoiceId: invoiceId,
      amount: amount,
      clientId: invoice.customerId,
      paymentDate: new Date().toISOString(),
    });
 
    // Return hydrated invoice
    return this.getInvoice(invoiceId)!;
  },


  async getTotalOutstanding(): Promise<number> {
    const { data, error } = await supabase.rpc('get_total_outstanding_amount');
    if (error) supabaseError('Failed to fetch total outstanding', error);
    return Number(data || 0);
  },

  async getTotalPaid(): Promise<number> {
    const { data, error } = await supabase.rpc('get_total_paid_amount');
    if (error) supabaseError('Failed to fetch total paid', error);
    return Number(data || 0);
  },
};

// ─────────────────────────────────────────────────────────────
// LISTENER 1: Sales → Invoice
// FIX: processingOrders Set prevents race condition duplicate calls
// ─────────────────────────────────────────────────────────────
eventBus.on<SalesOrderConfirmedEvent>(
  EVENT_NAMES.SALES_ORDER_CONFIRMED,
  'createInvoiceFromOrder',
  'invoice',
  async ({ order }) => {
    const orderId = order?.id;
    const orderNumber = order?.number ?? 'unknown';

    // ── Guard 1: validate order payload ──
    if (!orderId || !orderNumber) {
      console.error(
        `[Invoice] Missing order details: ID=${orderId}, Number=${orderNumber}`
      );
      return;
    }

    // ── Guard 2: in-memory lock (prevents race condition) ──
    if (processingOrders.has(orderId)) {
      console.log(
        `[Invoice] Order ${orderNumber} is already being processed, skipping duplicate event.`
      );
      return;
    }

    processingOrders.add(orderId);

    try {
      console.log(
        `[Invoice] Processing automated invoice for order: ${orderNumber} (ID: ${orderId})`
      );

      // ── Guard 3: DB-level check (handles server restarts / multi-instance) ──
      const existingInvoice = await accountingService.getInvoiceByOrderId(orderId);
      if (existingInvoice) {
        console.log(
          `[Invoice] Invoice already exists for order ${orderNumber} ` +
          `(Invoice: ${existingInvoice.number}), skipping.`
        );
        return;
      }

       // Determine invoice status based on order type
       const hasServiceItems = order.items?.some(
         (i) => i.productId?.startsWith('SERV')
       );
       const invoiceStatus = hasServiceItems ? 'draft' : 'sent';

      // ── Let generateInvoiceNumber() handle the number ──
      // DO NOT pass `number: INV-${order.number}` — that was the bug
      const invoiceNumber = await generateInvoiceNumber('INV');

      await accountingService.createInvoice({
        orderId: orderId,
        customerId: order.customerId,
        customerName: order.customerName || `Order ${orderNumber}`,
        number: invoiceNumber,                    // ← safe unique number
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        total: order.total,
        status: invoiceStatus,
        notes: `Automated invoice from confirmed Sales Order ${orderNumber}`,
      });

      console.log(
        `[Invoice] ✅ Automated invoice created successfully for order ${orderNumber}`
      );
    } catch (e: any) {
      // ── Last resort: if still a duplicate, just log and move on ──
      if (e?.message?.includes('duplicate key')) {
        console.warn(
          `[Invoice] ⚠️ Invoice for order ${orderNumber} already exists in DB ` +
          `(caught at listener level). No action needed.`
        );
        return;
      }
      console.error(
        `[Invoice] ❌ Failed to automate invoice creation for order ${orderNumber}:`,
        e
      );
    } finally {
      // ── Always release the lock ──
      processingOrders.delete(orderId);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// LISTENER 2: Project Timesheet → Invoice Update
// FIX: Corrected lookup (was using projectId as invoiceId — wrong)
// ─────────────────────────────────────────────────────────────
eventBus.on<ProjectTimesheetApprovedEvent>(
  EVENT_NAMES.PROJECT_TIMESHEET_APPROVED,
  'updateInvoiceFromTimesheet',
  'invoice',
  async ({ projectId, amount }) => {
    try {
      if (!projectId || !amount) {
        console.warn('[Invoice] Invalid timesheet event payload', { projectId, amount });
        return;
      }

      // ── FIX: look up invoice by project_id, NOT by invoice id ──
      const { data: invoiceData, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)   // ← was using wrong RPC with projectId as invoice id
        .eq('status', 'draft')
        .maybeSingle();

      if (error) {
        console.error('[Invoice] Error looking up project invoice:', error);
        return;
      }

      if (!invoiceData) {
        console.warn(
          `[Invoice] No draft invoice found for project ${projectId}, skipping timesheet update.`
        );
        return;
      }

      await accountingService.updateInvoice(invoiceData.id, {
        subtotal:  Number(invoiceData.subtotal)   + amount,
        total:     Number(invoiceData.total)      + amount,
        amountDue: Number(invoiceData.amount_due) + amount,
      });

      console.log(
        `[Invoice] ✅ Updated project ${projectId} invoice +${amount} TND` +
        ` (Invoice: ${invoiceData.invoice_number})`
      );
    } catch (e) {
      console.error('[Invoice] ❌ Failed to update invoice for timesheet approval:', e);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// LISTENER 3: Project Milestone → Invoice
// FIX: Use generateInvoiceNumber instead of Date.now() string
// ─────────────────────────────────────────────────────────────
eventBus.on<ProjectMilestoneReachedEvent>(
  EVENT_NAMES.PROJECT_MILESTONE_REACHED,
  'createInvoiceFromMilestone',
  'invoice',
  async ({ projectId, amount }) => {
    try {
      if (!projectId || !amount) {
        console.warn('[Invoice] Invalid milestone event payload', { projectId, amount });
        return;
      }

      const project = await projectService.getProject(projectId);
      if (!project) {
        console.warn(`[Invoice] Project ${projectId} not found for milestone invoice`);
        return;
      }

      const invoiceNumber = await generateInvoiceNumber('MLSTN');

       await accountingService.createInvoice({
         projectId: projectId,
         customerId: project.customerId || undefined,
         customerName: project.customerName || `Project ${projectId}`,
         number: invoiceNumber,          // ← was `MILESTONE-${Date.now()}` — not sequential
         total: amount,
         subtotal: amount,
         taxAmount: 0,
         status: 'draft',
         notes: `Milestone payment for project ${project.customerName || projectId}`,
       });

      console.log(
        `[Invoice] ✅ Created milestone invoice ${invoiceNumber}` +
        ` for project ${projectId}: ${amount} TND`
      );
    } catch (e) {
      console.error('[Invoice] ❌ Failed to create milestone invoice:', e);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// LISTENER 4: Project Completed → Final Invoice
// FIX: Use generateInvoiceNumber, add guard for existing final invoice
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// LISTENER: Billing Session Approved → Create Invoice
// ─────────────────────────────────────────────────────────────
eventBus.on<BillingSessionApprovedEvent>(
  EVENT_NAMES.BILLING_SESSION_APPROVED,
  'generateInvoiceFromSession',
  'invoice',
  async ({ sessionId }) => {
    try {
      console.log(`[Invoice] Processing billing session approval: ${sessionId}`);
      
      const invoice = await accountingService.createInvoiceFromBillingSession(sessionId);
      
      console.log(`[Invoice] ✅ Invoice ${invoice.number} created for session ${sessionId}`);
    } catch (e: any) {
      console.error('[Invoice] ❌ Failed to handle billing session approval:', e);
    }
  }
);


export default accountingService;
