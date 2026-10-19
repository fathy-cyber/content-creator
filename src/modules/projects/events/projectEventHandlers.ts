// src/modules/projects/events/projectEventHandlers.ts
//
// Registered once at app startup via eventProcessor.
// Each handler contains the BUSINESS LOGIC that runs after an event.

import { supabaseService } from '@/lib/supabase';
import { eventBus } from '@/core/events/EventBus';
import { EVENT_NAMES } from '@/shared/events/event-names';
import type {
  TaskStageChangedPayload,
  TimesheetLoggedPayload,
  TimesheetApprovedPayload,
  MilestoneCompletedPayload,
  MilestoneBilledPayload,
  ProjectStatusChangedPayload,
  TaskCreatedPayload,
  TaskDeletedPayload,
  TaskUpdatedPayload,
  MilestoneCreatedPayload,
} from '@/shared/types/projectEvents.types';

// Use the service role client from shared lib to bypass RLS
const supabase = supabaseService;

if (!supabase) {
  throw new Error('[ProjectHandlers] supabaseService is not initialized. Check VITE_SUPABASE_ROLE_KEY.');
}

// ── Helper: update project aggregate counters ─────────────────────────

// ── Helper: update project aggregate counters ─────────────────────────

async function refreshProjectCounters(projectId: number) {
  // Re-count tasks and update projects
  const { data: tasks, error } = await supabase
    .from('project_tasks')
    .select('id, stage')
    .eq('project_id', projectId)
    .eq('active', true);

  if (error || !tasks) {
    console.error(`[ProjectHandlers] Error fetching tasks for counters: ${error?.message}`);
    return;
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.stage === 'done').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      tasks_count:           total,
      completed_tasks_count: completed,
      progress:              progress,
      updated_at:            new Date().toISOString(),
    })
    .eq('id', projectId);

  if (updateError) {
    console.error(`[ProjectHandlers] Error updating project counters: ${updateError.message}`);
  }
}

async function refreshMilestoneProgress(
  projectId: number,
  milestoneId: string
) {
  // Count tasks linked to this milestone
  const { data: tasks, error } = await supabase
    .from('project_tasks')
    .select('id, stage')
    .eq('project_id',  projectId)
    .eq('milestone_id', milestoneId)
    .eq('active',       true);

  if (error || !tasks || tasks.length === 0) return;

  const total = tasks.length;
  const completed = tasks.filter(t => t.stage === 'done').length;
  const progress = Math.round((completed / total) * 100);

  const { error: updateError } = await supabase
    .from('milestones')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', milestoneId);

  if (updateError) {
    console.error(`[ProjectHandlers] Error updating milestone progress: ${updateError.message}`);
  }
}

// ── Register all handlers ──────────────────────────────────────────────

export function registerProjectEventHandlers(): void {

  // ── PROJECT_TASK_STAGE_CHANGED ────────────────────────────────────────
  // When: user drags task to new column / updates stage
  // Does: refresh project task counters + linked milestone progress

  eventBus.on(
    EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED,
    'handleTaskStageChanged',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as TaskStageChangedPayload;
        
        // 1. Refresh project counters (tasks_count, completed_tasks_count)
        await refreshProjectCounters(payload.projectId);

        // 2. If task is linked to a milestone, refresh milestone progress
        const { data: task, error: taskError } = await supabase
          .from('project_tasks')
          .select('milestone_id')
          .eq('id', payload.taskId)
          .single();

        if (taskError) throw taskError;

        if (task?.milestone_id) {
          await refreshMilestoneProgress(payload.projectId, task.milestone_id);
        }
      } catch (e: any) {
        console.error(`[ProjectHandlers] TASK_STAGE_CHANGED error: ${e?.message}`);
        throw e; // Re-throw to allow eventProcessor to mark as failed/retry
      }
    }
  );

  // ── PROJECT_TASK_UPDATED ──────────────────────────────────────────────
  // When: user updates task progress or other details
  // Does: refresh project counters + linked milestone progress if progress changed
  eventBus.on(
    EVENT_NAMES.PROJECT_TASK_UPDATED,
    'handleTaskUpdated',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as TaskUpdatedPayload;
        
        if (payload.changedFields.includes('progress')) {
          await refreshProjectCounters(payload.projectId);

          const { data: task, error: taskError } = await supabase
            .from('project_tasks')
            .select('milestone_id')
            .eq('id', payload.taskId)
            .single();

          if (!taskError && task?.milestone_id) {
            await refreshMilestoneProgress(payload.projectId, task.milestone_id);
          }
        }
      } catch (e: any) {
        console.error(`[ProjectHandlers] TASK_UPDATED error: ${e?.message}`);
        throw e;
      }
    }
  );

  // ── PROJECT_TASK_CREATED / PROJECT_TASK_DELETED ──────────────────────

  // Does: refresh project task counters

  eventBus.on(
    EVENT_NAMES.PROJECT_TASK_CREATED,
    'handleTaskCreated',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as TaskCreatedPayload;
        await refreshProjectCounters(payload.projectId);
      } catch (e: any) {
        console.error(`[ProjectHandlers] TASK_CREATED error: ${e?.message}`);
        throw e;
      }
    }
  );

  eventBus.on(
    EVENT_NAMES.PROJECT_TASK_DELETED,
    'handleTaskDeleted',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as TaskDeletedPayload;
        await refreshProjectCounters(payload.projectId);
      } catch (e: any) {
        console.error(`[ProjectHandlers] TASK_DELETED error: ${e?.message}`);
        throw e;
      }
    }
  );

  // ── PROJECT_TIMESHEET_LOGGED ─────────────────────────────────────────
  // When: employee logs time
  // Does: update actual_hours on the task

  eventBus.on(
    EVENT_NAMES.PROJECT_TIMESHEET_LOGGED,
    'handleTimesheetLogged',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as TimesheetLoggedPayload;

        if (!payload.taskId) return;

        // Sum all logged hours for this task
        const { data, error: fetchError } = await supabase
          .from('timesheets')
          .select('hours')
          .eq('task_id', payload.taskId);

        if (fetchError) throw fetchError;

        const totalHours = (data || []).reduce(
          (sum, t) => sum + (Number(t.hours) || 0), 0
        );

        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({
            actual_hours: totalHours,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.taskId);

        if (updateError) throw updateError;

        // Also check if billing_status should transition to 'in_progress'
        const { data: project } = await supabase
          .from('projects')
          .select('billing_status')
          .eq('id', payload.projectId)
          .single();

        if (project?.billing_status === 'not_started') {
          await supabase
            .from('projects')
            .update({ billing_status: 'in_progress' })
            .eq('id', payload.projectId);
        }
      } catch (e: any) {
        console.error(`[ProjectHandlers] TIMESHEET_LOGGED error: ${e?.message}`);
        throw e;
      }
    }
  );

  // ── PROJECT_TIMESHEET_APPROVED ───────────────────────────────────────
  // When: manager approves a timesheet
  // Does: check if billing_status should change

  eventBus.on(
    EVENT_NAMES.PROJECT_TIMESHEET_APPROVED,
    'handleTimesheetApproved',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as TimesheetApprovedPayload;

        // Check if project has any un-billed approved timesheets
        const { count, error: countError } = await supabase
          .from('timesheets')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', payload.projectId)
          .eq('status',     'approved')
          .eq('is_billed',  false);

        if (countError) throw countError;

        if ((count ?? 0) > 0) {
          await supabase
            .from('projects')
            .update({
              billing_status: 'in_progress',
              updated_at:     new Date().toISOString(),
            })
            .eq('id',            payload.projectId)
            .eq('billing_status', 'not_started');
        }
      } catch (e: any) {
        console.error(`[ProjectHandlers] TIMESHEET_APPROVED error: ${e?.message}`);
        throw e;
      }
    }
  );

  // ── PROJECT_MILESTONE_CREATED ───────────────────────────────────────
  // When: milestone is created and linked to tasks
  // Does: initialize milestone progress based on linked tasks
  eventBus.on(
    EVENT_NAMES.PROJECT_MILESTONE_CREATED,
    'handleMilestoneCreated',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as MilestoneCreatedPayload;
        // Re-calculate progress for the new milestone based on linked tasks
        await refreshMilestoneProgress(payload.projectId, payload.milestoneId);
      } catch (e: any) {
        console.error(`[ProjectHandlers] MILESTONE_CREATED error: ${e?.message}`);
        throw e;
      }
    }
  );

  // ── PROJECT_MILESTONE_COMPLETED ──────────────────────────────────────
  // When: milestone status set to 'completed'
  // Does: if invoice_trigger = true, prepare invoice signal

  eventBus.on(
    EVENT_NAMES.PROJECT_MILESTONE_COMPLETED,
    'handleMilestoneCompleted',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as MilestoneCompletedPayload;

        if (!payload.invoiceTrigger || payload.invoiceAmount <= 0) return;

        // Signal that an invoice is ready to be raised by writing to event_store
        const { error } = await supabase.from('event_store').insert({
          event_name: 'project.billing.invoice_ready',
          payload: {
            projectId:     payload.projectId,
            milestoneId:   payload.milestoneId,
            milestoneName: payload.milestoneName,
            amount:        payload.invoiceAmount,
            occurredAt:    new Date().toISOString(),
          },
          status: 'pending',
        });

        if (error) throw error;
      } catch (e: any) {
        console.error(`[ProjectHandlers] MILESTONE_COMPLETED error: ${e?.message}`);
        throw e;
      }
    }
  );

  // ── PROJECT_MILESTONE_BILLED ─────────────────────────────────────────
  // When: milestone marked as billed
  // Does: check if ALL milestone-trigger milestones are billed

  eventBus.on(
    EVENT_NAMES.PROJECT_MILESTONE_BILLED,
    'handleMilestoneBilled',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as MilestoneBilledPayload;

        const { data: milestones, error: fetchError } = await supabase
          .from('milestones')
          .select('is_billed, invoice_trigger')
          .eq('project_id', payload.projectId)
          .eq('invoice_trigger', true);

        if (fetchError) throw fetchError;
        if (!milestones || milestones.length === 0) return;

        const allBilled = milestones.every(m => m.is_billed);

        if (allBilled) {
          const { error: updateError } = await supabase
            .from('projects')
            .update({
              billing_status: 'billed',
              updated_at:     new Date().toISOString(),
            })
            .eq('id', payload.projectId);
          
          if (updateError) throw updateError;
        }
      } catch (e: any) {
        console.error(`[ProjectHandlers] MILESTONE_BILLED error: ${e?.message}`);
        throw e;
      }
    }
  );

  // ── PROJECT_STATUS_CHANGED ───────────────────────────────────────────
  // When: project status changes to 'completed'
  // Does: check for unbilled timesheets + unresolved milestones

  eventBus.on(
    EVENT_NAMES.PROJECT_STATUS_CHANGED,
    'handleProjectStatusChanged',
    'projects',
    async (raw) => {
      try {
        const payload = raw as unknown as ProjectStatusChangedPayload;

        if (payload.newStatus !== 'completed') return;

        // Check for unbilled approved timesheets
        const { count: unbilledTs, error: tsError } = await supabase
          .from('timesheets')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', payload.projectId)
          .eq('is_billed',  false)
          .eq('status',     'approved');

        if (tsError) throw tsError;

        // Check for unbilled milestone invoices
        const { count: unbilledMs, error: msError } = await supabase
          .from('milestones')
          .select('id', { count: 'exact', head: true })
          .eq('project_id',    payload.projectId)
          .eq('invoice_trigger', true)
          .eq('is_billed',      false);

        if (msError) throw msError;

        if ((unbilledTs ?? 0) > 0 || (unbilledMs ?? 0) > 0) {
      const { error: logError } = await supabase.from('event_store').insert({
        event_name: 'project.billing.completion_warning',
        source_module: 'projects',
        payload: {
          projectId:         payload.projectId,
          unbilledTimesheets: unbilledTs ?? 0,
          unbilledMilestones: unbilledMs ?? 0,
          occurredAt:         new Date().toISOString(),
        },
        status: 'pending',
      });

          if (logError) throw logError;
        }
      } catch (e: any) {
        console.error(`[ProjectHandlers] PROJECT_STATUS_CHANGED error: ${e?.message}`);
        throw e;
      }
    }
  );

  console.log('[ProjectEventHandlers] All handlers registered ✓');
}
