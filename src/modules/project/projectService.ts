import { eventBus, EVENT_NAMES, type CrmContactCreatedEvent, type SalesOrderConfirmedEvent, type SalesOrderCancelledEvent, type ProjectCreatedEvent, type ProjectCompletedEvent, type SupportTicketCreatedEvent } from '../../shared/events';
import { projectEventPublisher } from '@/modules/projects/events/projectEventPublisher';
import { supabase, supabaseService } from '../../lib/supabase';
import { type Project } from '../../shared/types/project';
import { auditLog } from '../../infrastructure/audit';

export interface Task {
  id: number | string;
  project_id: number | string;
  name: string;
  description?: string;
  employee_id?: string;
  stage: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  estimated_hours?: number;
  actual_hours?: number;
  quantity?: number;
  progress: number;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
  // Billing fields
  billing_rate?: number;
  writeoff_hours?: number;
  billing_item_id?: string;
  timesheet_id?: string;
  milestone_id?: string;
  expense_id?: string;
}

export interface TimeEntry {
  id: number | string;
  task_id: number | string;
  user_id: string;
  hours: number;
  description?: string;
  date_worked: string;
  billable: boolean;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Milestone {
  id: number | string;
  project_id: number | string;
  name: string;
  description?: string;
  target_date: string;
  status: 'pending' | 'achieved' | 'overdue';
  progress: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

let createTaskRpcAvailable: boolean | null = null;
let projectTasksQuantityColumnExists: boolean | null = null;

// Default onboarding tasks for new contact projects
const ONBOARDING_TASKS = [
  { name: 'Send welcome email', description: 'Send welcome email with introductory information', priority: 'high' as const, estimated_hours: 0.5 },
  { name: 'Schedule kickoff call', description: 'Schedule initial discovery call with the contact', priority: 'high' as const, estimated_hours: 1 },
  { name: 'Create account in system', description: 'Set up user account and grant access', priority: 'medium' as const, estimated_hours: 0.5 },
  { name: 'Send onboarding materials', description: 'Send relevant documentation and guides', priority: 'medium' as const, estimated_hours: 0.5 },
];

let crmProjectListenerRegistered = false;

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase.rpc('get_projects');
    if (error) supabaseError('Failed to fetch projects', error);
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      orderId: p.order_id,
      customerId: p.customer_id,
      customerName: p.customer_name,
      managerId: p.manager_id,
      status: p.status,
      startDate: p.start_date,
      endDate: p.end_date,
      budget: p.budget,
      billing_rate: p.billing_rate,
      progress: p.progress,
      tasksCount: p.tasks_count,
      completedTasksCount: p.completed_tasks_count,
      active: p.active,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  },

  async getProject(id: string | number): Promise<Project | undefined> {
    const { data, error } = await supabase.rpc('get_project_by_id', { p_id: Number(id) });
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      supabaseError('Failed to fetch project', error);
    }
    if (!data) return undefined;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      orderId: data.order_id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      managerId: data.manager_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget,
      billing_rate: data.billing_rate,
      progress: data.progress,
      tasksCount: data.tasks_count,
      completedTasksCount: data.completed_tasks_count,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const { data: project, error } = await supabase.rpc('create_project', {
      p_name: data.name || 'New Project',
      p_description: data.description || '',
      p_manager_id: data.managerId || null,
      p_start_date: data.startDate || null,
      p_end_date: data.endDate || null,
      p_status: data.status || 'planning',
      p_progress: data.progress ?? 0,
      p_budget: data.budget || 0,
      p_customer_id: data.customerId || null,
       p_customer_name: data.customerName || null,
       p_sales_order_id: data.orderId || null,
       p_tasks_count: data.tasksCount ?? 0,
      p_completed_tasks_count: data.completedTasksCount ?? 0,
    });
    if (error) supabaseError('Failed to create project', error);
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      orderId: project.order_id,
      customerId: project.customer_id,
      customerName: project.customer_name,
      managerId: project.manager_id,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      budget: project.budget,
      billing_model: project.billing_model,
      progress: project.progress,
      tasksCount: project.tasks_count,
      completedTasksCount: project.completed_tasks_count,
      active: project.active,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  },

  async updateProject(id: string | number, updates: Partial<Project>): Promise<Project | null> {
    const params: Record<string, any> = { p_id: Number(id) };
    if (updates.name !== undefined) params.p_name = updates.name;
    if (updates.description !== undefined) params.p_description = updates.description;
    if (updates.managerId !== undefined) params.p_manager_id = updates.managerId;
    if (updates.startDate !== undefined) params.p_start_date = updates.startDate;
    if (updates.endDate !== undefined) params.p_end_date = updates.endDate;
    if (updates.status !== undefined) params.p_status = updates.status;
    if (updates.progress !== undefined) params.p_progress = updates.progress;
    if (updates.budget !== undefined) params.p_budget = updates.budget;
    if (updates.customerId !== undefined) params.p_customer_id = updates.customerId;
    if (updates.customerName !== undefined) params.p_customer_name = updates.customerName;
    if (updates.orderId !== undefined) params.p_sales_order_id = updates.orderId;
    if (updates.tasksCount !== undefined) params.p_tasks_count = updates.tasksCount;
    if (updates.completedTasksCount !== undefined) params.p_completed_tasks_count = updates.completedTasksCount;
    if (updates.active !== undefined) params.p_active = updates.active;
  
    const currentProject = await this.getProject(id);
    const { data, error } = await supabase.rpc('update_project', params);
    if (error) supabaseError('Failed to update project', error);
    if (!data) return null;
    const updatedProject = {
      id: data.id,
      name: data.name,
      description: data.description,
      orderId: data.order_id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      managerId: data.manager_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget,
      billing_rate: data.billing_rate,
      progress: data.progress,
      tasksCount: data.tasks_count,
      completedTasksCount: data.completed_tasks_count,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  
    // Enterprise Audit
    await auditLog({
      module: 'project',
      entityType: 'Project',
      entityId: String(id),
      action: 'UPDATE',
      oldValues: currentProject,
      newValues: updatedProject,
    });

    // If project is marked as completed, emit event for billing
    if (updates.status === 'completed') {
      void eventBus.emit<ProjectCompletedEvent>(EVENT_NAMES.PROJECT_COMPLETED, {
        projectId: updatedProject.id,
        finalBudget: updatedProject.budget,
        completionDate: new Date().toISOString(),
      });
    }
  
    return updatedProject;
  },


  async deleteProject(id: string | number): Promise<boolean> {
    const { error } = await supabase.rpc('delete_project', { p_id: Number(id) });
    if (error) supabaseError('Failed to delete project', error);
    return true;
  },

  async getTasksByProject(projectId: string | number): Promise<Task[]> {
    const { data, error } = await supabase.rpc('get_tasks_by_project', { p_project_id: Number(projectId) });
    if (error) supabaseError('Failed to fetch tasks', error);
    return (data || []) as Task[];
  },

  async getTaskByTaskId(id: string | number): Promise<Task | undefined> {
    const { data, error } = await supabase.rpc('get_task_by_id', { p_id: Number(id) });
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      supabaseError('Failed to fetch task', error);
    }
    return data as Task | undefined;
  },

  async recalculateProjectProgress(projectId: number): Promise<void> {
    const tasks = await this.getTasksByProject(projectId);
    const totalTasks = tasks.length;
    if (totalTasks === 0) {
      await this.updateProject(projectId, { progress: 0, tasks_count: 0, completed_tasks_count: 0 });
      return;
    }

    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    const avgProgress = Math.round(totalProgress / totalTasks);
    const completedCount = tasks.filter(t => t.stage === 'done').length;
    const allComplete = tasks.every(t => t.progress === 100);
    const anyStarted = tasks.some(t => t.progress > 0 || t.stage !== 'todo');
    const status: Project['status'] = allComplete
      ? 'completed'
      : anyStarted
      ? 'in-progress'
      : 'planning';

    await this.updateProject(projectId, {
      progress: avgProgress,
      status,
      tasks_count: totalTasks,
      completed_tasks_count: completedCount,
    });
  },

  async createTask(data: Partial<Task>, skipProgressRecalc = false): Promise<Task> {
    const insertPayload: Record<string, any> = {
      project_id: Number(data.project_id),
      name: data.name || 'New Task',
      description: data.description || null,
      employee_id: data.employee_id || null,
      stage: data.stage || 'todo',
      priority: data.priority || 'medium',
      deadline: data.deadline || null,
      estimated_hours: data.estimated_hours || null,
      actual_hours: data.actual_hours || null,
      progress: data.progress ?? 0,
      order_index: data.order_index ?? 0,
      active: true,
      billing_rate: data.billing_rate || null,
      writeoff_hours: data.writeoff_hours || 0,
      billing_item_id: data.billing_item_id || null,
      timesheet_id: data.timesheet_id || null,
      milestone_id: data.milestone_id || null,
      expense_id: data.expense_id || null,
      quantity: data.quantity ?? 1,
    };

    const { data: newTask, error } = await supabase
      .from('project_tasks')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) supabaseError('Failed to create task', error);

    if (!skipProgressRecalc) {
      await this.recalculateProjectProgress(Number(data.project_id));
    }

    return newTask as Task;
  },

  async updateTask(id: string | number, updates: Partial<Task>): Promise<Task | null> {
    const { data: updatedTask, error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) supabaseError('Failed to update task', error);

    if (updatedTask) {
      await this.recalculateProjectProgress(Number(updatedTask.project_id));
    }

    return updatedTask as Task | null;
  },

  async deleteTask(id: string | number): Promise<boolean> {
    // First fetch the task to get project_id before deleting
    const task = await this.getTaskByTaskId(id);
    if (!task) return false;

    const { error } = await supabase.rpc('delete_task', { p_id: Number(id) });
    if (error) supabaseError('Failed to delete task', error);

    // Update project's tasks count and recalculate progress
    await this.recalculateProjectProgress(Number(task.project_id));

    return true;
  },

  // Time Entry functions
  async createTimeEntry(data: Partial<TimeEntry>): Promise<TimeEntry> {
    const { data: entry, error } = await supabase.rpc('create_time_entry', {
      p_task_id: Number(data.task_id),
      p_user_id: data.user_id || '',
      p_hours: data.hours || 0,
      p_description: data.description || null,
      p_date_worked: data.date_worked || new Date().toISOString().split('T')[0],
      p_billable: data.billable ?? true,
    });
    if (error) supabaseError('Failed to create time entry', error);
    return entry as TimeEntry;
  },

  async updateTimeEntry(id: string | number, updates: Partial<TimeEntry>): Promise<TimeEntry | null> {
    const params: Record<string, any> = { p_id: Number(id) };
    if (updates.task_id !== undefined) params.p_task_id = Number(updates.task_id);
    if (updates.user_id !== undefined) params.p_user_id = updates.user_id;
    if (updates.hours !== undefined) params.p_hours = updates.hours;
    if (updates.description !== undefined) params.p_description = updates.description;
    if (updates.date_worked !== undefined) params.p_date_worked = updates.date_worked;
    if (updates.billable !== undefined) params.p_billable = updates.billable;
    if (updates.active !== undefined) params.p_active = updates.active;

    const { data, error } = await supabase.rpc('update_time_entry', params);
    if (error) supabaseError('Failed to update time entry', error);
    return data as TimeEntry | null;
  },

  async deleteTimeEntry(id: string | number): Promise<boolean> {
    const { error } = await supabase.rpc('delete_time_entry', { p_id: Number(id) });
    if (error) supabaseError('Failed to delete time entry', error);
    return true;
  },

  async syncTaskBillingLinks(projectId: string | number): Promise<void> {
    // Sync from billing_items
    const { data: items, error: itemsError } = await supabase
      .from('billing_items')
      .select('id, task_id, unit_price, timesheet_id, milestone_id, expense_id')
      .not('task_id', 'is', null);

    if (itemsError) {
      console.error('Failed to fetch billing items for sync:', itemsError);
      return;
    }

    for (const item of items) {
      await supabase
        .from('project_tasks')
        .update({
          billing_item_id: item.id,
          billing_rate: item.unit_price,
          timesheet_id: item.timesheet_id,
          milestone_id: item.milestone_id,
          expense_id: item.expense_id,
        })
        .eq('id', item.task_id);
    }
  },

  async getTimeEntriesByTask(taskId: string | number): Promise<TimeEntry[]> {
    const { data, error } = await supabase.rpc('get_time_entries_by_task', { p_task_id: Number(taskId) });
    if (error) supabaseError('Failed to fetch time entries', error);
    return (data || []) as TimeEntry[];
  },

  async getTimeEntriesByUser(userId: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase.rpc('get_time_entries_by_user', { p_user_id: userId });
    if (error) supabaseError('Failed to fetch time entries', error);
    return (data || []) as TimeEntry[];
  },

  // Milestone functions
  async createMilestone(data: Partial<Milestone>): Promise<Milestone> {
    const { data: milestone, error } = await supabase.rpc('create_milestone', {
      p_project_id: Number(data.project_id),
      p_name: data.name || 'New Milestone',
      p_description: data.description || null,
      p_target_date: data.target_date || new Date().toISOString().split('T')[0],
      p_status: data.status || 'pending',
      p_progress: data.progress ?? 0,
    });
    if (error) supabaseError('Failed to create milestone', error);
    return milestone as Milestone;
  },

  async updateMilestone(id: string | number, updates: Partial<Milestone>): Promise<Milestone | null> {
    const params: Record<string, any> = { p_id: Number(id) };
    if (updates.project_id !== undefined) params.p_project_id = Number(updates.project_id);
    if (updates.name !== undefined) params.p_name = updates.name;
    if (updates.description !== undefined) params.p_description = updates.description;
    if (updates.target_date !== undefined) params.p_target_date = updates.target_date;
    if (updates.status !== undefined) params.p_status = updates.status;
    if (updates.progress !== undefined) params.p_progress = updates.progress;
    if (updates.active !== undefined) params.p_active = updates.active;

    const { data, error } = await supabase.rpc('update_milestone', params);
    if (error) supabaseError('Failed to update milestone', error);
    return data as Milestone | null;
  },

  async deleteMilestone(id: string | number): Promise<boolean> {
    const { error } = await supabase.rpc('delete_milestone', { p_id: Number(id) });
    if (error) supabaseError('Failed to delete milestone', error);
    return true;
  },

  async getMilestonesByProject(projectId: string | number): Promise<Milestone[]> {
    const { data, error } = await supabase.rpc('get_milestones_by_project', { p_project_id: Number(projectId) });
    if (error) supabaseError('Failed to fetch milestones', error);
    return (data || []) as Milestone[];
  },

  // Create project with default tasks for a confirmed sales order
  async createProjectForSalesOrder(event: SalesOrderConfirmedEvent): Promise<Project> {
    const { order } = event;
    const projectName = `Project - ${order.number} (${order.customerName})`;
    const description = `Project for sales order ${order.number}. Total: ${order.total} TND`;

    // Safely convert customerId to number if it's numeric, else null
    const numericCustomerId = typeof order.customerId === 'string' && /^\d+$/.test(order.customerId)
      ? Number(order.customerId)
      : null;

    // Create the project
    const project = await this.createProject({
      name: projectName,
      description,
      orderId: order.id,
      customerId: numericCustomerId,
      customerName: order.customerName,
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      budget: order.total,
      tasksCount: 0,
      completedTasksCount: 0,
      progress: 0,
    });

    // Create default project tasks based on order items
    const defaultTasks: Array<{ name: string; description: string; priority: 'high' | 'medium' | 'low'; estimated_hours: number }> = [
      { name: 'Project Kickoff & Requirements Gathering', description: 'Initial meeting with client to understand requirements and scope.', priority: 'high', estimated_hours: 4 },
      { name: 'Design & Planning Phase', description: 'Create detailed project plan and technical specifications.', priority: 'high', estimated_hours: 8 },
      { name: 'Development/Implementation', description: 'Execute the main project deliverables.', priority: 'medium', estimated_hours: 40 },
      { name: 'Testing & Quality Assurance', description: 'Test deliverables and ensure quality standards.', priority: 'medium', estimated_hours: 8 },
      { name: 'Client Review & Feedback', description: 'Present work to client and incorporate feedback.', priority: 'medium', estimated_hours: 4 },
      { name: 'Final Delivery & Handover', description: 'Deliver final products and provide training/support.', priority: 'high', estimated_hours: 4 },
    ];

    for (let i = 0; i < defaultTasks.length; i++) {
      const taskDef = defaultTasks[i];
      await this.createTask({
        project_id: project.id,
        name: taskDef.name,
        description: taskDef.description,
        priority: taskDef.priority,
        estimated_hours: taskDef.estimated_hours,
        stage: 'todo',
        progress: 0,
        order_index: i,
      }, true);
    }

    // Recalculate progress once after all tasks are created
    await this.recalculateProjectProgress(Number(project.id));

    // Emit project.created event after successful project creation with tasks
    const projectCreatedPayload = {
      projectId: Number(project.id),
      occurredAt: new Date().toISOString(),
      name: project.name,
      customerId: project.customerId ? Number(project.customerId) : undefined,
      billingModel: project.billing_model || 'fixed',
      budget: project.budget,
    };
    console.log(`[ProjectService] Emitting PROJECT_CREATED event for project ${project.id}`);
    projectEventPublisher.projectCreated(projectCreatedPayload);

    return project;
  },

  // Create project with default onboarding tasks for a contact
  async createProjectForContact(contact: CrmContactCreatedEvent['contact']): Promise<Project> {
    const customerName = contact.company || contact.name;

    // Create the project
    const project = await this.createProject({
      name: `Onboarding - ${customerName}`,
      description: `Initial project and task setup for ${customerName}.`,
      customerId: Number(contact.id),
      customerName: customerName,
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      tasksCount: ONBOARDING_TASKS.length,
      completedTasksCount: 0,
      progress: 0,
    });

    // Create default onboarding tasks
    for (let i = 0; i < ONBOARDING_TASKS.length; i++) {
      const taskDef = ONBOARDING_TASKS[i];
      await this.createTask({
        project_id: project.id,
        name: taskDef.name,
        description: taskDef.description,
        priority: taskDef.priority,
        estimated_hours: taskDef.estimated_hours,
        stage: 'todo',
        progress: 0,
        order_index: i,
      }, true);
    }

    // Recalculate progress once after all tasks are created
    await this.recalculateProjectProgress(Number(project.id));

    // Emit project.created event after successful project creation with tasks
    const projectCreatedPayload = {
      projectId: Number(project.id),
      occurredAt: new Date().toISOString(),
      name: project.name,
      customerId: project.customerId ? Number(project.customerId) : undefined,
      billingModel: project.billing_model || 'fixed',
      budget: project.budget,
    };
    console.log(`[ProjectService] Emitting PROJECT_CREATED event for project ${project.id}`);
    projectEventPublisher.projectCreated(projectCreatedPayload);

    return project;
  },
};

// Register event listener
if (!crmProjectListenerRegistered) {
  crmProjectListenerRegistered = true;

  eventBus.on<CrmContactCreatedEvent>(EVENT_NAMES.CRM_CONTACT_CREATED, 'createProjectForContact', 'project', async ({ contact }) => {
    try {
      await projectService.createProjectForContact(contact);
    } catch (e) {
      console.error('[ProjectService] Failed to create onboarding project for contact:', e);
    }
  });


  eventBus.on<SalesOrderConfirmedEvent>(EVENT_NAMES.SALES_ORDER_CONFIRMED, 'createProjectForSalesOrder', 'project', async (event) => {
    try {
      await projectService.createProjectForSalesOrder(event);
    } catch (e) {
      console.error('[ProjectService] Failed to create project for sales order:', e);
    }
  });


  eventBus.on<SalesOrderCancelledEvent>(EVENT_NAMES.SALES_ORDER_CANCELLED, 'cancelProjectsForOrder', 'project', async ({ orderId, orderNumber, customerId, customerName }) => {
    try {
      // Find projects linked to this cancelled order.
      // NOTE: Current schema links projects to orders via `sales_order_id`.
      const allProjects = await projectService.getProjects();
      const matchingProjects = allProjects.filter(p =>
        p.orderId === orderId
      );
  
      for (const proj of matchingProjects) {
        await projectService.updateProject(proj.id, { status: 'cancelled', active: false });
        console.log(`[ProjectService] Cancelled project ${proj.id} linked to cancelled order ${orderNumber}`);
      }
    } catch (e) {
      console.error('[ProjectService] Failed to cancel projects for sales order:', e);
    }
  });

 
  eventBus.on<SupportTicketCreatedEvent>(EVENT_NAMES.SUPPORT_TICKET_CREATED, 'escalateTicketToBugTask', 'project', async ({ ticket }) => {
    try {
      if (ticket.category === 'bug' && ticket.project_id) {
        await projectService.createTask({
          project_id: ticket.project_id,
          name: `BUG: ${ticket.subject}`,
          description: `Auto-created from support ticket ${ticket.ticket_number}`,
          priority: ticket.priority as any,
          stage: 'todo',
        });
        console.log(`[ProjectService] Auto-created bug task for ticket ${ticket.ticket_number} in project ${ticket.project_id}`);
      }
    } catch (e) {
      console.error('[ProjectService] Failed to auto-create task from support ticket:', e);
    }
  });

}

export default projectService;
