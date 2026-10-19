export type BillingModel = 'time_and_material' | 'fixed_price' | 'milestone' | 'hybrid' | 'fixed' | 'retainer';
export type BillingStatus = 'not_started' | 'pending_review' | 'in_review' | 'approved' | 'invoiced' | 'partially_invoiced' | 'written_off';
export type PaymentStatus = 'not_started' | 'partial' | 'paid' | 'overdue';
export type TaskStage = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ProjectListRow {
  id: number;
  name: string;
  description: string | null;
  manager_id: string | null;
  start_date: string;
  end_date: string;
  customer_id: number | null;
  customer_name: string | null;
  sales_order_id: string | null;
  status: string;
  progress: number;
  budget: number;
  tasks_count: number;
  completed_tasks_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  billing_model: BillingModel;
  billing_status: BillingStatus;
  retainer_amount: number | null;
  billing_reviewed_by: string | null;
  billing_reviewed_at: string | null;
  billing_notes: string | null;
  payment_status: PaymentStatus;
  client_name: string | null;
  client_company: string | null;
  task_completion_pct: number;
  days_remaining: number;
  is_overdue: boolean;
  total_logged_hours: number;
  total_billable_hours: number;
  total_expenses: number;
  labor_cost: number;
  billable_value: number;
  gross_profit: number;
  profit_margin: number;
  milestone_count: number;
  billed_milestones_count: number;
  pending_invoice_amount: number;
}

export interface ProjectFinancials {
  project_id: number;
  budget: number;
  retainer_amount: number | null;
  billing_model: BillingModel;
  labor_cost: number;
  billable_value: number;
  writeoff_cost: number;
  total_logged_hours: number;
  total_billable_hours: number;
  total_writeoff_hours: number;
  expenses_total: number;
  expenses_billable: number;
  expenses_internal: number;
  milestone_invoiceable: number;
  milestone_billed: number;
  milestone_pending: number;
  total_expenses: number;
  gross_profit: number;
  profit_margin: number;
}

export interface ProjectTaskDetail {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  employee_id: string | null;
  deadline: string;
  estimated_hours: number;
  actual_hours: number;
  stage: TaskStage;
  priority: TaskPriority;
  quantity: number;
  progress: number;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  is_billable: boolean;
  is_billed: boolean;
  billed_at: string | null;
  billing_rate: number | null;
  writeoff_hours: number;
  billing_item_id: string | null;
  timesheet_id: string | null;
  milestone_id: string | null;
  expense_id: string | null;
  assignee_name: string | null;
  assignee_role: string | null;
  assignee_billable_rate: number | null;
  assignee_cost_rate: number | null;
  milestone_name: string | null;
  logged_hours: number;
  hours_variance: number;
  is_overdue: boolean;
  days_until_deadline: number;
}

export interface TimesheetDetail {
  id: string;
  project_id: number;
  task_id: number | null;
  employee_id: string;
  date: string;
  hours: number;
  billable_hours: number;
  description: string | null;
  status: TimesheetStatus;
  is_billed: boolean;
  billed_at: string | null;
  writeoff_hours: number;
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_role: string;
  employee_cost_rate: number;
  employee_billable_rate: number;
  task_name: string | null;
  task_stage: TaskStage | null;
  line_labor_cost: number;
  line_billable_value: number;
  line_writeoff_value: number;
  line_margin: number;
}

export interface MilestoneDetail {
  id: string;
  project_id: number;
  name: string;
  description: string | null;
  target_date: string;
  status: MilestoneStatus;
  invoice_amount: number;
  invoice_trigger: boolean;
  is_billed: boolean;
  billed_at: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  days_until_target: number;
  is_overdue: boolean;
  linked_tasks_count: number;
  completed_tasks_count: number;
  task_completion_pct: number;
}

export interface ExpenseDetail {
  id: string;
  project_id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  is_billable: boolean;
  approved_by: string | null;
  is_billed: boolean;
  billed_at: string | null;
  created_at: string;
  updated_at: string;
  approver_name: string | null;
  category_label: string;
  days_since: number;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  manager_id?: string;
  start_date: string;
  end_date: string;
  customer_id: number;
  status: string;
  budget: number;
  billing_model: BillingModel;
  retainer_amount?: number;
  billing_status?: BillingStatus;
  payment_status?: PaymentStatus;
  billing_notes?: string;
}

export interface TaskFormData {
  project_id: number;
  name: string;
  description?: string;
  employee_id?: string;
  deadline: string;
  estimated_hours: number;
  priority: TaskPriority;
  stage: TaskStage;
  is_billable: boolean;
  billing_rate?: number;
  milestone_id?: string;
  active?: boolean;
  actual_hours?: number;
  writeoff_hours?: number;
  progress?: number;
}

export interface MilestoneFormData {
  project_id: number;
  name: string;
  description?: string;
  target_date: string;
  invoice_amount: number;
  invoice_trigger: boolean;
  status?: MilestoneStatus;
  progress?: number;
  task_ids?: number[];
}

export interface TimesheetFormData {
  project_id: number;
  employee_id: string;
  date: string;
  task_id?: number;
  hours: number;
  billable_hours: number;
  description?: string;
  writeoff_hours?: number;
}

export interface ExpenseFormData {
  project_id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  is_billable: boolean;
}
