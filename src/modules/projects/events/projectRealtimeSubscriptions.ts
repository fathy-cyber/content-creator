// src/modules/projects/events/projectRealtimeSubscriptions.ts
//
// Bridges Supabase Realtime (DB changes) → PersistentEventBus
// Runs on the CLIENT side inside the project module.

import { realtimeGateway } from '@/shared/realtime/RealtimeGateway';
import { eventBus } from '@/core/events/EventBus';
import { uiEventBus } from '@/shared/events/uiEventBus';
import { EVENT_NAMES } from '@/shared/events/event-names';

interface SubscribeOptions {
  projectId: number;
  employeeMap: Record<string, string>; // id → full_name
}

export function subscribeToProjectRealtime({
  projectId,
  employeeMap,
}: SubscribeOptions): () => void {

  const prefix = `project-${projectId}`;

  // ── timesheets ──────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-timesheets`,
    'timesheets',
    async (payload) => {
      const row = payload.new as any;
      const payloadData = {
        projectId,
        timesheetId: row.id,
        employeeId: row.employee_id,
        employeeName: employeeMap[row.employee_id] ?? 'Unknown',
        taskId: row.task_id ?? null,
        date: row.date,
        hours: row.hours,
        billableHours: row.billable_hours,
        writeoffHours: row.writeoff_hours ?? 0,
        laborCost: 0, // worker will compute from cost_rate
        billableValue: 0, // worker will compute from billable_rate
        occurredAt: new Date().toISOString(),
      };
      await eventBus.emit(EVENT_NAMES.PROJECT_TIMESHEET_LOGGED, payloadData);
      uiEventBus.emit(EVENT_NAMES.PROJECT_TIMESHEET_LOGGED, payloadData);
    },
    `project_id=eq.${projectId}`
  );

  // ── tasks ───────────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-tasks`,
    'project_tasks',
    async (payload) => {
      const old = payload.old as any;
      const row = payload.new as any;

      // Detect stage change
      if (old.stage !== row.stage) {
        const payloadData = {
          projectId,
          taskId: row.id,
          taskName: row.name,
          oldStage: old.stage,
          newStage: row.stage,
          occurredAt: new Date().toISOString(),
        };
        await eventBus.emit(EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED, payloadData);
        uiEventBus.emit(EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED, payloadData);
        return;
      }

      // Detect assignee change
      if (old.employee_id !== row.employee_id) {
        const payloadData = {
          projectId,
          taskId: row.id,
          taskName: row.name,
          assigneeId: row.employee_id,
          assigneeName: employeeMap[row.employee_id] ?? 'Unknown',
          occurredAt: new Date().toISOString(),
        };
        await eventBus.emit(EVENT_NAMES.PROJECT_TASK_ASSIGNED, payloadData);
        uiEventBus.emit(EVENT_NAMES.PROJECT_TASK_ASSIGNED, payloadData);
        return;
      }

      // Generic update
      const payloadData = {
        projectId,
        taskId: row.id,
        taskName: row.name,
        changedFields: Object.keys(row).filter(k => row[k] !== old[k]),
        occurredAt: new Date().toISOString(),
      };
      await eventBus.emit(EVENT_NAMES.PROJECT_TASK_UPDATED, payloadData);
      uiEventBus.emit(EVENT_NAMES.PROJECT_TASK_UPDATED, payloadData);
    },
    `project_id=eq.${projectId}`
  );

  // ── milestones ──────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-milestones`,
    'milestones',
    async (payload) => {
      const old = (payload.old ?? {}) as any;
      const row = (payload.new ?? {}) as any;

      // Detect billing
      if (!old.is_billed && row.is_billed) {
        const payloadData = {
          projectId,
          milestoneId: row.id,
          milestoneName: row.name,
          invoiceAmount: row.invoice_amount,
          billedAt: row.billed_at,
          occurredAt: new Date().toISOString(),
        };
        await eventBus.emit(EVENT_NAMES.PROJECT_MILESTONE_BILLED, payloadData);
        uiEventBus.emit(EVENT_NAMES.PROJECT_MILESTONE_BILLED, payloadData);
        return;
      }

      // Detect completion
      if (old.status !== 'completed' && row.status === 'completed') {
        await eventBus.emit(EVENT_NAMES.PROJECT_MILESTONE_COMPLETED, {
          projectId,
          milestoneId: row.id,
          milestoneName: row.name,
          invoiceTrigger: row.invoice_trigger,
          invoiceAmount: row.invoice_amount,
          occurredAt: new Date().toISOString(),
        });
      }
    },
    `project_id=eq.${projectId}`
  );

  // ── expenses ────────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-expenses`,
    'expenses',
    async (payload) => {
      const row = payload.new as any;
      await eventBus.emit(EVENT_NAMES.PROJECT_EXPENSE_ADDED, {
        projectId,
        expenseId: row.id,
        description: row.description,
        amount: row.amount,
        category: row.category,
        isBillable: row.is_billable,
        occurredAt: new Date().toISOString(),
      });
    },
    `project_id=eq.${projectId}`
  );

  // Return cleanup function
  return () => {
    realtimeGateway.unsubscribe(`${prefix}-timesheets`);
    realtimeGateway.unsubscribe(`${prefix}-tasks`);
    realtimeGateway.unsubscribe(`${prefix}-milestones`);
    realtimeGateway.unsubscribe(`${prefix}-expenses`);
  };
}
