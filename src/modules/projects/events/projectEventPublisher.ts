// src/modules/projects/events/projectEventPublisher.ts
//
// Thin wrapper around the existing PersistentEventBus.
// Called by mutations after every successful DB write.

import { eventBus } from '@/core/events/EventBus';
import { uiEventBus } from '@/shared/events/uiEventBus';
import { EVENT_NAMES } from '@/shared/events/event-names';
import type {
  TypedProjectPublish,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  ProjectArchivedPayload,
  ProjectStatusChangedPayload,
  TaskCreatedPayload,
  TaskUpdatedPayload,
  TaskDeletedPayload,
  TaskStageChangedPayload,
  TaskAssignedPayload,
  MilestoneCreatedPayload,
  MilestoneUpdatedPayload,
  MilestoneCompletedPayload,
  MilestoneBilledPayload,
  TimesheetLoggedPayload,
  TimesheetApprovedPayload,
  TimesheetRejectedPayload,
  ExpenseAddedPayload,
  ExpenseApprovedPayload,
  ExpenseDeletedPayload,
  BillingStatusChangedPayload,
  PaymentStatusChangedPayload,
} from '@/shared/types/projectEvents.types';

// ── Typed publish (enforces payload shape) ────────────────────────────
const publish: TypedProjectPublish = async (eventName, payload) => {
  try {
    // 1. Persist to event store (for workers, audit, and other users)
    await eventBus.emit(eventName, payload as any);
    
    // 2. Emit to local UI bus for instant feedback in the current session
    uiEventBus.emit(eventName, payload);
  } catch (error) {
    console.error(`[ProjectEventPublisher] Failed to emit ${eventName}:`, error);
  }
};

// ── Project publishers ─────────────────────────────────────────────────

export const projectEventPublisher = {

  // Project Lifecycle
  projectCreated: (p: ProjectCreatedPayload) =>
    publish(EVENT_NAMES.PROJECT_CREATED, p),

  projectUpdated: (p: ProjectUpdatedPayload) =>
    publish(EVENT_NAMES.PROJECT_UPDATED, p),

  projectArchived: (p: ProjectArchivedPayload) =>
    publish(EVENT_NAMES.PROJECT_ARCHIVED, p),

  projectStatusChanged: (p: ProjectStatusChangedPayload) =>
    publish(EVENT_NAMES.PROJECT_STATUS_CHANGED, p),

  // Tasks
  taskCreated: (p: TaskCreatedPayload) =>
    publish(EVENT_NAMES.PROJECT_TASK_CREATED, p),

  taskUpdated: (p: TaskUpdatedPayload) =>
    publish(EVENT_NAMES.PROJECT_TASK_UPDATED, p),

  taskDeleted: (p: TaskDeletedPayload) =>
    publish(EVENT_NAMES.PROJECT_TASK_DELETED, p),

  taskStageChanged: (p: TaskStageChangedPayload) =>
    publish(EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED, p),

  taskAssigned: (p: TaskAssignedPayload) =>
    publish(EVENT_NAMES.PROJECT_TASK_ASSIGNED, p),

  // Milestones
  milestoneCreated: (p: MilestoneCreatedPayload) =>
    publish(EVENT_NAMES.PROJECT_MILESTONE_CREATED, p),

  milestoneUpdated: (p: MilestoneUpdatedPayload) =>
    publish(EVENT_NAMES.PROJECT_MILESTONE_UPDATED, p),

  milestoneCompleted: (p: MilestoneCompletedPayload) =>
    publish(EVENT_NAMES.PROJECT_MILESTONE_COMPLETED, p),

  milestoneBilled: (p: MilestoneBilledPayload) =>
    publish(EVENT_NAMES.PROJECT_MILESTONE_BILLED, p),

  // Timesheets
  timesheetLogged: (p: TimesheetLoggedPayload) =>
    publish(EVENT_NAMES.PROJECT_TIMESHEET_LOGGED, p),

  timesheetUpdated: (p: TimesheetLoggedPayload) =>
    publish(EVENT_NAMES.PROJECT_TIMESHEET_UPDATED, p),

  timesheetApproved: (p: TimesheetApprovedPayload) =>
    publish(EVENT_NAMES.PROJECT_TIMESHEET_APPROVED, p),

  timesheetRejected: (p: TimesheetRejectedPayload) =>
    publish(EVENT_NAMES.PROJECT_TIMESHEET_REJECTED, p),

  // Expenses
  expenseAdded: (p: ExpenseAddedPayload) =>
    publish(EVENT_NAMES.PROJECT_EXPENSE_ADDED, p),

  expenseUpdated: (p: any) =>
    publish(EVENT_NAMES.PROJECT_EXPENSE_UPDATED, p),

  expenseApproved: (p: ExpenseApprovedPayload) =>
    publish(EVENT_NAMES.PROJECT_EXPENSE_APPROVED, p),

  expenseDeleted: (p: ExpenseDeletedPayload) =>
    publish(EVENT_NAMES.PROJECT_EXPENSE_DELETED, p),

  // Billing
  billingStatusChanged: (p: BillingStatusChangedPayload) =>
    publish(EVENT_NAMES.PROJECT_BILLING_STATUS_CHANGED, p),

  paymentStatusChanged: (p: PaymentStatusChangedPayload) =>
    publish(EVENT_NAMES.PROJECT_PAYMENT_STATUS_CHANGED, p),
} as const;
