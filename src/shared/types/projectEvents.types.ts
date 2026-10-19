import { EVENT_NAMES } from '@/shared/events/event-names';

/**
 * Base payload for all project-related events.
 * Ensures traceability and project scoping.
 */
export interface BaseProjectPayload {
  projectId: number;
  occurredAt: string; // ISO timestamp
  triggeredBy?: string; // employee id or 'system'
}

// ── Project Lifecycle Events ──────────────────────────────────────────────

export interface ProjectCreatedPayload extends BaseProjectPayload {
  name: string;
  customerId?: number;
  billingModel: string;
  budget: number;
}

export interface ProjectUpdatedPayload extends BaseProjectPayload {
  name?: string;
  changedFields: string[];
}

export interface ProjectArchivedPayload extends BaseProjectPayload {
  name?: string;
}

export interface ProjectStatusChangedPayload extends BaseProjectPayload {
  oldStatus: string;
  newStatus: string;
}

// ── Task Events ───────────────────────────────────────────────────────────

export interface TaskCreatedPayload extends BaseProjectPayload {
  taskId: number;
  taskName: string;
  stage: string;
  assigneeId?: string;
}

export interface TaskUpdatedPayload extends BaseProjectPayload {
  taskId: number;
  taskName: string;
  changedFields: string[];
}

export interface TaskDeletedPayload extends BaseProjectPayload {
  taskId: number;
  taskName: string;
}

export interface TaskStageChangedPayload extends BaseProjectPayload {
  taskId: number;
  taskName: string;
  oldStage: string;
  newStage: string;
}

export interface TaskAssignedPayload extends BaseProjectPayload {
  taskId: number;
  taskName: string;
  assigneeId: string;
  assigneeName: string;
}

// ── Milestone Events ──────────────────────────────────────────────────────

export interface MilestoneCreatedPayload extends BaseProjectPayload {
  milestoneId: string;
  name: string;
  targetDate?: string;
  invoiceAmount: number;
  invoiceTrigger: boolean;
}

export interface MilestoneUpdatedPayload extends BaseProjectPayload {
  milestoneId: string;
  name?: string;
  changedFields: string[];
}

export interface MilestoneCompletedPayload extends BaseProjectPayload {
  milestoneId: string;
  milestoneName: string;
  invoiceTrigger: boolean;
  invoiceAmount: number;
}

export interface MilestoneBilledPayload extends BaseProjectPayload {
  milestoneId: string;
  milestoneName: string;
  invoiceAmount: number;
  billedAt: string;
}

// ── Timesheet Events ──────────────────────────────────────────────────────

export interface TimesheetLoggedPayload extends BaseProjectPayload {
  timesheetId: string;
  employeeId: string;
  employeeName: string;
  taskId?: number;
  taskName?: string;
  date: string;
  hours: number;
  billableHours: number;
  writeoffHours: number;
  laborCost: number;
  billableValue: number;
}

export interface TimesheetApprovedPayload extends BaseProjectPayload {
  timesheetId: string;
  employeeId: string;
  approvedById?: string;
  hours?: number;
  billableHours?: number;
}

export interface TimesheetRejectedPayload extends BaseProjectPayload {
  timesheetId: string;
  employeeId: string;
  rejectedById: string;
  reason?: string;
}

// ── Expense Events ────────────────────────────────────────────────────────

export interface ExpenseAddedPayload extends BaseProjectPayload {
  expenseId: string;
  description: string;
  amount: number;
  category: string;
  isBillable: boolean;
}

export interface ExpenseApprovedPayload extends BaseProjectPayload {
  expenseId: string;
  description: string;
  amount: number;
  approvedById: string;
}

export interface ExpenseDeletedPayload extends BaseProjectPayload {
  expenseId: string;
  description?: string;
  amount?: number;
}

export interface ExpenseUpdatedPayload extends BaseProjectPayload {
  expenseId: string;
  changedFields: string[];
}

// ── Billing Events ────────────────────────────────────────────────────────

export interface BillingStatusChangedPayload extends BaseProjectPayload {
  oldStatus: string;
  newStatus: string;
}

export interface PaymentStatusChangedPayload extends BaseProjectPayload {
  oldStatus: string;
  newStatus: string;
}

export interface ProjectFinancialRecalculatedPayload extends BaseProjectPayload {
  totalExpenses: number;
  grossProfit: number;
  profitMargin: number;
}

// ── Master Payload Map ────────────────────────────────────────────────────

export interface ProjectEventPayloadMap {
  [EVENT_NAMES.PROJECT_CREATED]: ProjectCreatedPayload;
  [EVENT_NAMES.PROJECT_UPDATED]: ProjectUpdatedPayload;
  [EVENT_NAMES.PROJECT_ARCHIVED]: ProjectArchivedPayload;
  [EVENT_NAMES.PROJECT_STATUS_CHANGED]: ProjectStatusChangedPayload;
  [EVENT_NAMES.PROJECT_TASK_CREATED]: TaskCreatedPayload;
  [EVENT_NAMES.PROJECT_TASK_UPDATED]: TaskUpdatedPayload;
  [EVENT_NAMES.PROJECT_TASK_DELETED]: TaskDeletedPayload;
  [EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED]: TaskStageChangedPayload;
  [EVENT_NAMES.PROJECT_TASK_ASSIGNED]: TaskAssignedPayload;
  [EVENT_NAMES.PROJECT_MILESTONE_CREATED]: MilestoneCreatedPayload;
  [EVENT_NAMES.PROJECT_MILESTONE_UPDATED]: MilestoneUpdatedPayload;
  [EVENT_NAMES.PROJECT_MILESTONE_COMPLETED]: MilestoneCompletedPayload;
  [EVENT_NAMES.PROJECT_MILESTONE_BILLED]: MilestoneBilledPayload;
  [EVENT_NAMES.PROJECT_TIMESHEET_LOGGED]: TimesheetLoggedPayload;
  [EVENT_NAMES.PROJECT_TIMESHEET_UPDATED]: TimesheetLoggedPayload;
  [EVENT_NAMES.PROJECT_TIMESHEET_APPROVED]: TimesheetApprovedPayload;
  [EVENT_NAMES.PROJECT_TIMESHEET_REJECTED]: TimesheetRejectedPayload;
  [EVENT_NAMES.PROJECT_EXPENSE_ADDED]: ExpenseAddedPayload;
  [EVENT_NAMES.PROJECT_EXPENSE_UPDATED]: ExpenseUpdatedPayload;
  [EVENT_NAMES.PROJECT_EXPENSE_APPROVED]: ExpenseApprovedPayload;
  [EVENT_NAMES.PROJECT_EXPENSE_DELETED]: ExpenseDeletedPayload;
  [EVENT_NAMES.PROJECT_BILLING_STATUS_CHANGED]: BillingStatusChangedPayload;
  [EVENT_NAMES.PROJECT_PAYMENT_STATUS_CHANGED]: PaymentStatusChangedPayload;
  [EVENT_NAMES.PROJECT_FINANCIAL_RECALCULATED]: ProjectFinancialRecalculatedPayload;
}

export type TypedProjectPublish = <K extends keyof ProjectEventPayloadMap>(
  eventName: K,
  payload: ProjectEventPayloadMap[K]
) => Promise<void>;
