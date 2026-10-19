import { supabase } from '@/lib/supabase';
import { projectService } from '../project/projectService';
import { 
  eventBus, 
  EVENT_NAMES, 
  type ProjectCompletedEvent, 
  type BillingSessionApprovedEvent,
  type ProjectTimesheetApprovedEvent,
  type ProjectMilestoneReachedEvent,
  type ExpenseApprovedEvent
} from '@/shared/events';
import { 
  type BillingSession, 
  type BillingItem, 
  type BillingModel, 
  type AdjustBillingItemDTO, 
  type WriteOffItemDTO, 
  type ApproveBillingSessionDTO,
  type BillingSummary
} from '@/shared/contracts/billing.contract';
import { accountingService, generateInvoiceNumber } from '../invoice/accountingService';
 
const PROJECTS_TABLE = 'projects';
 
export const billingService = {

  // ═══════════════════════════════════════════════════════════
  // 1. OPEN BILLING SESSION
  // ═══════════════════════════════════════════════════════════
  async extractBillableItems(sessionId: string, projectId: string, billingModel: string): Promise<number> {
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('active', true);
 
    if (tasksError) throw tasksError;
 
    let createdCount = 0;
    for (const task of tasks) {
      // ONLY extract if billable
      if (task.is_billable === false) continue;
      
      if (billingModel === 'fixed' && task.billing_rate === null) continue;
      
      await supabase.from('billing_items').insert({
        billing_session_id: sessionId,
        source_type: 'task',
        task_id: task.id,
        description: task.name,
        quantity: task.quantity || 1,
        unit_price: task.billing_rate || 0,
        amount: (task.quantity || 1) * (task.billing_rate || 0),
        is_billable: true,
        is_written_off: false,
        is_billed: false,
      });
      createdCount++;
    }
 
    return createdCount;
  },
 
  async openBillingSession(projectId: string): Promise<BillingSession> {
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('*')
       .eq('id', Number(projectId))
       .single();

    if (projError || !project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    if (project.status === 'cancelled' || project.status === 'draft') {
      throw new Error(`Cannot open billing session: project is ${project.status}`);
    }
 
    // ── Data Integrity Check ──
    // Ensure sales_order_id exists in the sales_orders table to prevent FK violations
    if (project.sales_order_id) {
      const { data: orderExists } = await supabase
        .from('sales_orders')
        .select('id')
        .eq('id', project.sales_order_id)
        .maybeSingle();
 
      if (!orderExists) {
        throw new Error(
          `CRITICAL DATA INTEGRITY ERROR: Project ${projectId} is linked to Sales Order ${project.sales_order_id}, ` +
          `but this order does not exist in the database. Please correct the project record before opening a billing session.`
        );
      }
    }
 
    const { data: existingSession } = await supabase

      .from('billing_sessions')
      .select('id, status')
       .eq('project_id', Number(projectId))
       .in('status', ['open', 'approved'])
      .is('deleted_at', null)
      .maybeSingle();

    if (existingSession) {
      throw new Error(`Billing session already exists for project ${projectId}`);
    }

    const { data: session, error: sessionError } = await supabase
      .from('billing_sessions')
        .insert({
          project_id:     Number(projectId),
          sales_order_id: project.sales_order_id ? Number(project.sales_order_id) : null,
          status:         'open',

        billing_model:  project.billing_model,
        gross_amount:   0,
        adjustments:    0,
        net_amount:     0,
        currency:       'TND',
      })
      .select()
      .single();

    if (sessionError || !session) {
      throw new Error(`Failed to create billing session: ${sessionError?.message}`);
    }

    const itemCount = await this.extractBillableItems(
      session.id,
      projectId,
      project.billing_model
    );
 
    await this.recalculateSessionTotals(session.id);


    await projectService.syncTaskBillingLinks(projectId);
 
    await this.updateProjectBillingStatus(projectId, 'in_review');
 
    await this.logSessionEvent(session.id, null, 'session_opened', null, {

      itemCount,
      billingModel: project.billing_model,
    });

    void eventBus.emit(EVENT_NAMES.BILLING_SESSION_OPENED, {
      sessionId:  session.id,
      projectId,
      itemCount,
      billingModel: project.billing_model,
    });

    return this.getSession(session.id);
  },

  async getSessions(): Promise<BillingSession[]> {
    const { data: sessions, error } = await supabase
      .from('billing_sessions')
      .select(`
        *,
        projects ( id, name ),
        billing_items ( * )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
 
    if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);
 
    return (sessions || []).map((s: any) => this.toSessionEntity(s));
  },


  async getSession(sessionId: string): Promise<BillingSession> {
    // Fetch session with project name
    const { data: session, error: sessionError } = await supabase
      .from('billing_sessions')
      .select(`
        *,
        projects ( id, name )
      `)
      .eq('id', sessionId)
      .is('deleted_at', null)
      .single();

    if (sessionError || !session) {
      throw new Error(`Billing Session not found: ${sessionError?.message || sessionId}`);
    }

    // Attach project name for convenience
    const sessionWithProject = {
      ...session,
      projectName: session.projects?.name
    };

    const items = await this.recalculateSessionTotals(sessionId);

    return this.toSessionEntity({ ...sessionWithProject, billing_items: items });
  },


  async recalculateSessionTotals(sessionId: string): Promise<any[]> {
    const { data: items, error: fetchError } = await supabase
      .from('billing_items')
      .select('*')
      .eq('billing_session_id', sessionId);
 
    if (fetchError) throw new Error(`Failed to fetch billing items for recalculation: ${fetchError.message}`);
 
    const grossAmount = (items || []).reduce((sum, item) => 
      (item.is_billable && item.source_type !== 'adjustment') ? sum + item.amount : sum, 0);
    const adjustments = (items || []).reduce((sum, item) => sum + (item.source_type === 'adjustment' ? item.amount : 0), 0);
    const writeOffs = (items || []).reduce((sum, item) => sum + (item.is_written_off ? item.amount : 0), 0);
    const netAmount = grossAmount + adjustments + writeOffs;
 
    const { error: updateError } = await supabase
      .from('billing_sessions')
      .update({
        gross_amount: grossAmount,
        adjustments: adjustments,
        net_amount: netAmount,
      })
      .eq('id', sessionId);
 
    if (updateError) throw new Error(`Failed to update session totals: ${updateError.message}`);
 
    return items || [];
  },


  async createBillingItem(data: {
    task_id: string | number;
    project_id: string | number;
    description: string;
    quantity: number;
    unit_price: number;
    is_billable: boolean;
    billing_session_id?: string;
  }): Promise<BillingItem> {
    const { data: item, error } = await supabase
      .from('billing_items')
      .insert({
        task_id: data.task_id,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        amount: data.quantity * data.unit_price,
        is_billable: data.is_billable,
        source_type: 'task',
        billing_session_id: data.billing_session_id || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create billing item: ${error.message}`);
    return this.toItemEntity(item);
  },

  async getBillingItemsByTask(taskId: string | number): Promise<BillingItem[]> {

    const { data: items, error } = await supabase
      .from('billing_items')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch billing items for task ${taskId}: ${error.message}`);

    return (items || []).map((i: any) => this.toItemEntity(i));
  },

  async adjustItem(
    itemId:     string,
    dto:        AdjustBillingItemDTO,
    managerId:  string
  ): Promise<BillingItem> {
    const { data: item, error } = await supabase
      .from('billing_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error || !item) throw new Error(`BillingItem not found: ${itemId}`);
    if (item.is_billed) throw new Error('Cannot adjust an already-billed item');

    const { data: session } = await supabase
      .from('billing_sessions')
      .select('status')
      .eq('id', item.billing_session_id)
      .single();

    if (session?.status !== 'open') {
      throw new Error('Cannot adjust items: billing session is not open');
    }

    const newQuantity  = dto.quantity  ?? item.quantity;
    const newUnitPrice = dto.unitPrice ?? item.unit_price;
    const newAmount    = newQuantity * newUnitPrice;

    const oldValues = {
      quantity:   item.quantity,
      unit_price: item.unit_price,
      amount:     item.amount,
    };

    const { data: updated, error: updateError } = await supabase
      .from('billing_items')
      .update({
        quantity:          newQuantity,
        unit_price:        newUnitPrice,
        amount:            newAmount,
        description:       dto.description      ?? item.description,
        is_billable:       dto.isBillable       ?? item.is_billable,
        adjustment_reason: dto.adjustmentReason,
        original_quantity:  item.original_quantity  ?? item.quantity,
        original_unit_price: item.original_unit_price ?? item.unit_price,
        original_amount:    item.original_amount    ?? item.amount,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to adjust item: ${updateError.message}`);

    await this.recalculateSessionTotals(item.billing_session_id);

    await this.logSessionEvent(
      item.billing_session_id, itemId,
      'item_adjusted',
      oldValues,
      { quantity: newQuantity, unit_price: newUnitPrice, amount: newAmount,
        reason: dto.adjustmentReason },
      managerId
    );

    return this.toItemEntity(updated);
  },

  async writeOffItem(
    itemId:    string,
    dto:       WriteOffItemDTO,
    managerId: string
  ): Promise<BillingItem> {
    const { data: item, error } = await supabase
      .from('billing_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error || !item) throw new Error(`BillingItem not found: ${itemId}`);
    if (item.is_billed) throw new Error('Cannot write off a billed item');

    let finalQuantity = 0;
    let finalAmount   = 0;

    if (dto.partialHours !== undefined && dto.partialHours > 0) {
      const remainingHours = item.quantity - dto.partialHours;
      if (remainingHours < 0) {
        throw new Error(`Cannot write off ${dto.partialHours}h: item only has ${item.quantity}h`);
      }
      finalQuantity = remainingHours;
      finalAmount   = remainingHours * item.unit_price;

      await supabase.from('billing_items').insert({
        billing_session_id:  item.billing_session_id,
        source_type:         'writeoff',
        task_id:             item.task_id,
        timesheet_id:        item.timesheet_id,
        description:         `Write-off: ${dto.partialHours}h from "${item.description}"`,
        quantity:            dto.partialHours,
        unit_price:          item.unit_price,
        amount:              -(dto.partialHours * item.unit_price),
        is_billable:         false,
        is_written_off:      true,
        writeoff_reason:     dto.writeoffReason,
      });

      await supabase
        .from('billing_items')
        .update({ quantity: finalQuantity, amount: finalAmount })
        .eq('id', itemId);
    } else {
      await supabase
        .from('billing_items')
        .update({
          is_billable:     false,
          is_written_off:  true,
          writeoff_reason: dto.writeoffReason,
          amount:          0,
        })
        .eq('id', itemId);
    }

    await this.recalculateSessionTotals(item.billing_session_id);

    await this.logSessionEvent(
      item.billing_session_id, itemId,
      'item_written_off',
      { amount: item.amount, quantity: item.quantity },
      { partialHours: dto.partialHours, reason: dto.writeoffReason },
      managerId
    );

    const { data: updated } = await supabase
      .from('billing_items')
      .select('*')
      .eq('id', itemId)
      .single();

    return this.toItemEntity(updated!);
  },

  async deleteItem(itemId: string, managerId: string): Promise<void> {
    const { data: item, error } = await supabase
      .from('billing_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error || !item) throw new Error(`BillingItem not found: ${itemId}`);
    if (item.is_billed) throw new Error('Cannot delete an already-billed item');

    await this.logSessionEvent(
      item.billing_session_id, itemId,
      'item_deleted',
      item,
      null,
      managerId
    );

    const { error: deleteError } = await supabase
      .from('billing_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) throw new Error(`Failed to delete item: ${deleteError.message}`);

    await this.recalculateSessionTotals(item.billing_session_id);
  },

  async addManualItem(
    sessionId:   string,
    description: string,
    quantity:    number,
    unitPrice:   number,
    managerId:   string,
    sourceType:  'adjustment' | 'fixed' = 'adjustment'
  ): Promise<BillingItem> {
    const { data: session } = await supabase
      .from('billing_sessions')
      .select('status')
      .eq('id', sessionId)
      .single();

    if (session?.status !== 'open') {
      throw new Error('Cannot add items: session is not open');
    }

    const amount = quantity * unitPrice;

    const { data, error } = await supabase
      .from('billing_items')
      .insert({
        billing_session_id: sessionId,
        source_type:        sourceType,
        description,
        quantity,
        unit_price:         unitPrice,
        amount,
        original_quantity:  quantity,
        original_unit_price: unitPrice,
        original_amount:    amount,
        is_billable:        true,
        is_written_off:     false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add manual item: ${error.message}`);

    await this.recalculateSessionTotals(sessionId);
    await this.logSessionEvent(
      sessionId, data.id, 'item_added', null,
      { description, quantity, unit_price: unitPrice, amount },
      managerId
    );

    return this.toItemEntity(data);
  },

  async approveSession(
    sessionId: string,
    dto:       ApproveBillingSessionDTO
  ): Promise<BillingSession> {
    const session = await this.getSession(sessionId);

    if (session.status !== 'open') {
      throw new Error(`Cannot approve session in status: ${session.status}`);
    }

    if (session.netAmount <= 0) {
      throw new Error('Cannot approve a billing session with zero or negative net amount. Use write_off instead.');
    }

    const billableItems = session.items.filter(
      (i) => i.isBillable && !i.isWrittenOff
    );

    if (billableItems.length === 0) {
      throw new Error('Cannot approve: no billable items in session');
    }

    const now = new Date().toISOString();
    const { error: approveError } = await supabase
      .from('billing_sessions')
      .update({
        status:       'approved',
        reviewed_by:  dto.reviewedBy === 'MANAGER_ID' ? null : dto.reviewedBy,
        review_notes: dto.reviewNotes ?? null,
        approved_at:  now,
      })
      .eq('id', sessionId);

    if (approveError) throw new Error(`Failed to approve session: ${approveError.message}`);
 
    await this.updateProjectBillingStatus(
      session.projectId,
      'invoiced',
      {
        billing_reviewed_by:  dto.reviewedBy === 'MANAGER_ID' ? null : dto.reviewedBy,
        billing_reviewed_at:  now,
        billing_notes:        dto.reviewNotes ?? null,
      }
    );
 
    await this.logSessionEvent(

      sessionId, null, 'session_approved', null,
      { reviewedBy: dto.reviewedBy, netAmount: session.netAmount },
      dto.reviewedBy
    );

    void eventBus.emit(EVENT_NAMES.BILLING_SESSION_APPROVED, {
      sessionId,
      projectId:    session.projectId,
      netAmount:    session.netAmount,
      billingModel: session.billingModel,
      reviewedBy:   dto.reviewedBy,
    });

    return this.getSession(sessionId);
  },

  async logSessionEvent(sessionId: string, itemId: string | null, eventType: string, oldVal: any, newVal: any, userId?: string): Promise<void> {
    const sanitizedUserId = userId === 'MANAGER_ID' ? null : userId;
    await supabase.from('billing_session_events').insert({
      billing_session_id: sessionId,
      billing_item_id: itemId,
      event_type: eventType,
      old_value: oldVal,
      new_value: newVal,
      performed_by: sanitizedUserId,
    });
  },
 
  async updateProjectBillingStatus(
    projectId: string | number,
    billingStatus: string,
    extraFields: Record<string, any> = {}
  ): Promise<void> {
    const { error } = await supabase
      .from(PROJECTS_TABLE)
      .update({
        billing_status: billingStatus,
        updated_at:     new Date().toISOString(),
        ...extraFields,
      })
      .eq('id', projectId);
 
    if (error) {
      console.error(
        `[BillingService] Failed to update project ${projectId} billing_status:`,
        error.message
      );
    }
  },
 
  mapSourceToLineItemType(

    source: string
  ): 'service' | 'product' | 'expense' | 'timesheet' {
    const map: Record<string, any> = {
      timesheet: 'timesheet',
      task:      'service',
      milestone: 'service',
      expense:   'expense',
      fixed:     'service',
      retainer:  'service',
      adjustment:'service',
    };
    return map[source] ?? 'service';
  },

  toSessionEntity(data: any): BillingSession {
    return {
      id: data.id,
      projectId: data.project_id,
      projectName: data.projects?.name || data.project_name,
      salesOrderId: data.sales_order_id,
      reviewedBy: data.reviewed_by,
      status: data.status,
      billingModel: data.billing_model,
      grossAmount: Number(data.gross_amount),
      adjustments: Number(data.adjustments),
      netAmount: Number(data.net_amount),
      currency: data.currency,
      reviewNotes: data.review_notes,
      approvedAt: data.approved_at,
      submittedAt: data.submitted_at,
      items: (data.billing_items || []).map((i: any) => this.toItemEntity(i)),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  toItemEntity(data: any): BillingItem {
    return {
      id: data.id,
      billingSessionId: data.billing_session_id,
      sourceType: data.source_type,
      taskId: data.task_id,
      timesheetId: data.timesheet_id,
      milestoneId: data.milestone_id,
      expenseId: data.expense_id,
      description: data.description,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unit_price),
      amount: Number(data.amount),
      originalQuantity: data.original_quantity,
      originalUnitPrice: data.original_unit_price,
      originalAmount: data.original_amount,
      adjustmentReason: data.adjustment_reason,
      isBillable: data.is_billable,
      isWrittenOff: data.is_written_off,
      writeoffReason: data.writeoff_reason,
      isBilled: data.is_billed,
      billedAt: data.billed_at,
      invoiceLineItemId: data.invoice_line_item_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};

// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────

export function registerBillingEventHandlers(): void {
  eventBus.on<ProjectCompletedEvent>(EVENT_NAMES.PROJECT_COMPLETED, 'openBillingSessionOnProjectCompleted', 'billing', async ({ projectId }) => {
    try {
      console.log(`[BillingService] Project ${projectId} completed. Opening billing session...`);
      await billingService.openBillingSession(String(projectId));
      console.log(`[BillingService] ✅ Billing session opened for project ${projectId}`);
    } catch (e) {
      console.error(`[BillingService] ❌ Failed to open billing session for project ${projectId}:`, e);
    }
  });

  eventBus.on('project.created', 'openBillingSessionOnProjectCreated', 'billing', async (payload: any) => {
    try {
      // Normalize payload to handle both UI and Worker shapes
      const project = payload.project || payload;
      const projectId = project.id || payload.projectId;
      const budget = project.budget || payload.budget || 0;
      const billingModel = project.billing_model || payload.billingModel || 'fixed';
      const name = project.name || '';

      if (!projectId) {
        console.error(`[BillingService] Missing projectId in project.created event:`, payload);
        return;
      }

      console.log(`[BillingService] Project ${projectId} created. Checking if billing session should be opened...`);
      
      const isOnboarding = name.toLowerCase().includes('onboarding');
      const hasBudget = budget > 0;
      const isRetainer = billingModel === 'retainer';

      console.log(`[BillingService] Project ${projectId} checks: isOnboarding=${isOnboarding}, hasBudget=${hasBudget}, isRetainer=${isRetainer}`);
      
      if (isOnboarding || hasBudget || isRetainer) {
        console.log(`[BillingService] Condition met. Opening billing session for project ${projectId}...`);
        await billingService.openBillingSession(String(projectId));
        console.log(`[BillingService] ✅ Billing session automatically opened for new project ${projectId}`);
      } else {
        console.log(`[BillingService] No billing session needed for project ${projectId}`);
      }
    } catch (e) {
      console.error(`[BillingService] ❌ Failed to open auto-billing session for project:`, e);
    }
  });


}

export default billingService;


