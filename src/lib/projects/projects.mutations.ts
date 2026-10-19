import { supabase } from '@/lib/supabase';
import { 
  ProjectFormData, 
  TaskFormData, 
  MilestoneFormData, 
  TimesheetFormData, 
  ExpenseFormData, 
  TaskStage 
} from '@/types/project.types';
import { fetchProjectTasks } from './projects.queries';
import { projectEventPublisher } from '@/modules/projects/events/projectEventPublisher';

export const createProject = async (data: ProjectFormData) => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([data])
    .select()
    .single();

  if (error) throw error;

  if (project) {
    await projectEventPublisher.projectCreated({
      projectId: project.id,
      name: project.name,
      customerId: project.customer_id,
      billingModel: project.billing_model,
      budget: project.budget,
      occurredAt: new Date().toISOString(),
    });
  }

  return project;
};

export const updateProject = async (id: number, data: Partial<ProjectFormData>) => {
  // Define the writable columns for the projects table
  const writableColumns = [
    'name', 'description', 'manager_id', 'start_date', 'end_date', 
    'customer_id', 'status', 'budget', 'billing_model', 'retainer_amount', 
    'billing_status', 'payment_status', 'billing_notes', 'active'
  ];

  // Filter out non-writable columns and clean up empty/invalid values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      if (!writableColumns.includes(key)) return false;
      if (value === undefined || value === null) return false;
      
      // Treat 0 as null for ID fields to avoid FK violations
      if (key === 'customer_id' && (value === 0 || value === '0')) return false;
      if (key === 'manager_id' && (value === 0 || value === '' || value === '0')) return false;
      
      return true;
    })
  );

  const { data: project, error } = await supabase
    .from('projects')
    .update(cleanData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateProject error:', error);
    throw error;
  }

  if (project) {
    await projectEventPublisher.projectUpdated({
      projectId: project.id,
      changedFields: Object.keys(cleanData),
      occurredAt: new Date().toISOString(),
    });

    if (data.status && data.status !== project.status) {
      await projectEventPublisher.projectStatusChanged({
        projectId: project.id,
        oldStatus: project.status,
        newStatus: data.status,
        occurredAt: new Date().toISOString(),
      });
    }
  }

  return project;
};

export const archiveProject = async (id: number) => {
  const { error } = await supabase
    .from('projects')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;

  await projectEventPublisher.projectArchived({
    projectId: id,
    occurredAt: new Date().toISOString(),
  });

  return true;
};

export const createTask = async (data: TaskFormData) => {
  const { data: task, error } = await supabase
    .from('project_tasks')
    .insert([data])
    .select()
    .single();

  if (error) throw error;

  if (task) {
    await projectEventPublisher.taskCreated({
      projectId: task.project_id,
      taskId: task.id,
      taskName: task.name,
      stage: task.stage,
      occurredAt: new Date().toISOString(),
    });
  }

  return task;
};

export const updateTask = async (id: number, data: any) => {
  console.log(`[Mutations] Updating task ${id} with data:`, data);
  // Define the writable columns for the project_tasks table
  const writableColumns = [
    'name', 'description', 'employee_id', 'deadline', 
    'estimated_hours', 'actual_hours', 'stage', 'priority', 
    'quantity', 'progress', 'order_index', 'active', 
    'is_billable', 'is_billed', 'billed_at', 'billing_rate', 
    'writeoff_hours', 'billing_item_id', 'timesheet_id', 
    'milestone_id', 'expense_id'
  ];

  // Enforce 100% progress if stage is 'done'
  if (data.stage === 'done') {
    data.progress = 100;
  }

  // Filter out non-writable columns and empty/null values
  // We allow 0 as a valid value for progress, hours, etc.
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      if (!writableColumns.includes(key)) return false;
      if (value === undefined || value === null) return false;
      if (value === '' && typeof value === 'string') return false;
      return true;
    })
  );

  console.log(`[Mutations] Clean data for update:`, cleanData);

  const { data: task, error } = await supabase
    .from('project_tasks')
    .update(cleanData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[Mutations] Supabase updateTask error for task ${id}:`, error);
    throw error;
  }

  if (task) {
    await projectEventPublisher.taskUpdated({
      projectId: task.project_id,
      taskId: task.id,
      taskName: task.name,
      changedFields: Object.keys(cleanData),
      occurredAt: new Date().toISOString(),
    });

    if (cleanData.employee_id) {
      await projectEventPublisher.taskAssigned({
        projectId: task.project_id,
        taskId: task.id,
        taskName: task.name,
         assigneeId: String(cleanData.employee_id),
        assigneeName: 'Updated', 
        occurredAt: new Date().toISOString(),
      });
    }
  }

  return task;
};


export const updateTaskStage = async (id: number, stage: TaskStage) => {
  // 1. Update the task stage and set progress to 100 if done
  const { data: task, error: updateError } = await supabase
    .from('project_tasks')
    .update({ 
      stage, 
      progress: stage === 'done' ? 100 : undefined 
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;

  if (task) {
    await projectEventPublisher.taskStageChanged({
      projectId: task.project_id,
      taskId: task.id,
      taskName: task.name,
      oldStage: 'unknown' as any, // casting to avoid TS unknown error
      newStage: stage,
      occurredAt: new Date().toISOString(),
    });
  }

  // 2. Synchronize Project Status based on task progress
  if (task && task.project_id) {
    const { data: allTasks, error: fetchError } = await supabase
      .from('project_tasks')
      .select('stage, progress')
      .eq('project_id', task.project_id);

    if (!fetchError && allTasks && allTasks.length > 0) {
      const allDone = allTasks.every(t => t.stage === 'done');
      const anyStarted = allTasks.some(t => t.stage !== 'todo' || t.progress > 0);
      
      let newProjectStatus: string | null = null;

      if (allDone) {
        newProjectStatus = 'completed';
      } else if (anyStarted) {
        newProjectStatus = 'active';
      }

      if (newProjectStatus) {
        const { data: project } = await supabase
          .from('projects')
          .update({ 
            progress: allDone ? 100 : undefined,
            status: newProjectStatus 
          })
          .eq('id', task.project_id)
          .select()
          .single();

        if (project) {
          await projectEventPublisher.projectStatusChanged({
            projectId: project.id,
            oldStatus: 'unknown',
            newStatus: newProjectStatus,
            occurredAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  return true;
};

export const updateTaskOrder = async (tasks: { id: number; order_index: number }[]) => {
  const updates = tasks.map(t => 
    supabase.from('project_tasks').update({ order_index: t.order_index }).eq('id', t.id)
  );
  const results = await Promise.all(updates);
  const error = results.find(r => r.error);
  if (error) throw error.error;
  return true;
};

export const createMilestone = async (data: MilestoneFormData) => {
  const { task_ids, ...milestoneData } = data;
  const { data: milestone, error } = await supabase
    .from('milestones')
    .insert([milestoneData])
    .select()
    .single();

  if (error) throw error;

  if (milestone && task_ids && task_ids.length > 0) {
    const updates = task_ids.map(taskId => 
      supabase.from('project_tasks').update({ milestone_id: milestone.id }).eq('id', taskId)
    );
    await Promise.all(updates);
  }

  if (milestone) {
    await projectEventPublisher.milestoneCreated({
      projectId: milestone.project_id,
      milestoneId: milestone.id,
      name: milestone.name,
      invoiceAmount: milestone.invoice_amount,
      invoiceTrigger: milestone.invoice_trigger,
      occurredAt: new Date().toISOString(),
    });
  }

  return milestone;
};

export const updateMilestone = async (id: string, data: Partial<MilestoneFormData>) => {
  const { data: milestone, error } = await supabase
    .from('milestones')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (milestone) {
    await projectEventPublisher.milestoneUpdated({
      projectId: milestone.project_id,
      milestoneId: milestone.id,
      changedFields: Object.keys(data),
      occurredAt: new Date().toISOString(),
    });

    if (data.status === 'completed') {
      await projectEventPublisher.milestoneCompleted({
        projectId: milestone.project_id,
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        invoiceTrigger: milestone.invoice_trigger,
        invoiceAmount: milestone.invoice_amount,
        occurredAt: new Date().toISOString(),
      });
    }
  }

  return milestone;
};

export const markMilestoneBilled = async (id: string) => {
  const { data: milestone, error } = await supabase
    .from('milestones')
    .update({ is_billed: true, billed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (milestone) {
    await projectEventPublisher.milestoneBilled({
      projectId: milestone.project_id,
      milestoneId: milestone.id,
      milestoneName: milestone.name,
      invoiceAmount: milestone.invoice_amount,
      billedAt: milestone.billed_at,
      occurredAt: new Date().toISOString(),
    });
  }

  return true;
};

export const createTimesheet = async (data: TimesheetFormData) => {
  const { data: timesheet, error } = await supabase
    .from('timesheets')
    .insert([data])
    .select()
    .single();

  if (error) throw error;

  if (timesheet) {
    await projectEventPublisher.timesheetLogged({
      projectId: timesheet.project_id,
      timesheetId: timesheet.id,
      employeeId: timesheet.employee_id,
      employeeName: 'Unknown',
      taskId: timesheet.task_id ?? null,
      date: timesheet.date,
      hours: timesheet.hours,
      billableHours: timesheet.billable_hours,
      writeoffHours: timesheet.writeoff_hours ?? 0,
      laborCost: 0,
      billableValue: 0,
      occurredAt: new Date().toISOString(),
    });
  }

  return timesheet;
};

export const updateTimesheet = async (id: string, data: Partial<TimesheetFormData>) => {
  const { data: timesheet, error } = await supabase
    .from('timesheets')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (timesheet) {
    await projectEventPublisher.timesheetUpdated({
      projectId: timesheet.project_id,
      timesheetId: timesheet.id,
      employeeId: timesheet.employee_id,
      employeeName: 'Unknown',
      taskId: timesheet.task_id ?? null,
      date: timesheet.date,
      hours: timesheet.hours,
      billableHours: timesheet.billable_hours,
      writeoffHours: timesheet.writeoff_hours ?? 0,
      laborCost: 0,
      billableValue: 0,
      occurredAt: new Date().toISOString(),
    });
  }

  return timesheet;
};

export const approveTimesheet = async (id: string) => {
  const { data: timesheet, error } = await supabase
    .from('timesheets')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (timesheet) {
    await projectEventPublisher.timesheetApproved({
      projectId: timesheet.project_id,
      timesheetId: timesheet.id,
      employeeId: timesheet.employee_id,
      occurredAt: new Date().toISOString(),
    });
  }

  return true;
};

export const createExpense = async (data: ExpenseFormData) => {
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert([data])
    .select()
    .single();

  if (error) throw error;

  if (expense) {
    await projectEventPublisher.expenseAdded({
      projectId: expense.project_id,
      expenseId: expense.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      isBillable: expense.is_billable,
      occurredAt: new Date().toISOString(),
    });
  }

  return expense;
};

export const updateExpense = async (id: string, data: Partial<ExpenseFormData>) => {
  const { data: expense, error } = await supabase
    .from('expenses')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (expense) {
    await projectEventPublisher.expenseUpdated({
      projectId: expense.project_id,
      expenseId: expense.id,
      updatedFields: Object.keys(data),
      occurredAt: new Date().toISOString(),
    });
  }

  return expense;
};

export const deleteExpense = async (id: string) => {
  const { data: expense, error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (expense) {
    await projectEventPublisher.expenseDeleted({
      projectId: expense.project_id,
      expenseId: expense.id,
      occurredAt: new Date().toISOString(),
    });
  }

  return true;
};
