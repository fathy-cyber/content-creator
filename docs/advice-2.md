To fix these NULL fields, we need to understand **where each value should come from** and **when it should be set**:

| Field | Source | When to Set |
|---|---|---|
| `billing_rate` | Project's billing rate | On task creation |
| `billing_item_id` | Billing service (after creating/fetching billing item) | After billing item is created/linked |
| `timesheet_id` | Timesheet service | After timesheet entry is linked |
| `milestone_id` | Project milestones | On task creation or assignment |
| `expenses_id` | Expenses service | After expense is linked |
| `writeoff_hours` | User input | On progress edit / task update |

---

Here is the full fixed component with all NULL fields resolved:

```tsx
import { useState, useEffect } from 'react';
import {
  Plus, Search, Loader2, FolderKanban, Check, X, Edit3, Trash2, Clock, Receipt
} from 'lucide-react';
import { projectService } from '../projectService';
import { billingService } from '@/modules/billing/billingService';
import { timesheetService } from '@/modules/timesheet/timesheetService';
import { milestoneService } from '@/modules/milestone/milestoneService';
import { expenseService } from '@/modules/expense/expenseService';
import { type Project } from '@/shared/types/project';
import { type Task } from '../projectService';
import { type BillingItem } from '@/shared/contracts/billing.contract';
import { type Milestone } from '@/shared/types/milestone';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; bg: string; text: string }> = {
  planning:     { label: 'Planning',     color: 'bg-zinc-100',    text: 'text-zinc-700',    bg: 'bg-zinc-100'  },
  'in-progress':{ label: 'In Progress',  color: 'bg-blue-100',    text: 'text-blue-700',    bg: 'bg-blue-50'   },
  'on-hold':    { label: 'On Hold',      color: 'bg-amber-100',   text: 'text-amber-700',   bg: 'bg-amber-50'  },
  completed:    { label: 'Completed',    color: 'bg-emerald-100', text: 'text-emerald-700', bg: 'bg-emerald-50'},
  cancelled:    { label: 'Cancelled',    color: 'bg-red-100',     text: 'text-red-700',     bg: 'bg-red-50'    },
  draft:        { label: 'Draft',        color: 'bg-zinc-100',    text: 'text-zinc-700',    bg: 'bg-zinc-50'   },
};

const stageConfig: Record<string, { label: string; color: string; bg: string }> = {
  todo:         { label: 'To Do',       color: 'border-zinc-300',    bg: 'bg-zinc-50'   },
  'in-progress':{ label: 'In Progress', color: 'border-blue-400',    bg: 'bg-blue-50'   },
  review:       { label: 'Review',      color: 'border-amber-400',   bg: 'bg-amber-50'  },
  done:         { label: 'Done',        color: 'border-emerald-400', bg: 'bg-emerald-50'},
  cancelled:    { label: 'Cancelled',   color: 'border-red-400',     bg: 'bg-red-50'    },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewTaskInputs {
  name: string;
  quantity: number | '';
  // FIX: added all fields that were NULL
  billing_rate: number | '';
  writeoff_hours: number | '';
  milestone_id: number | null;
}

export default function ProjectList() {
  const [projects, setProjects]               = useState<Project[]>([]);
  const [tasksMap, setTasksMap]               = useState<Record<number, Task[]>>({});
  const [searchQuery, setSearchQuery]         = useState('');
  const [statusFilter, setStatusFilter]       = useState<string>('all');
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId]     = useState<number | null>(null);
  const [creatingTaskFor, setCreatingTaskFor] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId]   = useState<number | null>(null);
  const [billingItems, setBillingItems]       = useState<BillingItem[]>([]);
  const [billingLoading, setBillingLoading]   = useState(false);

  // FIX: milestones per project for the milestone_id dropdown
  const [milestonesMap, setMilestonesMap] = useState<Record<number, Milestone[]>>({});

  // FIX: extended edit state to include writeoff_hours
  const [editedProgress, setEditedProgress]       = useState<number | ''>(0);
  const [editedWriteoff, setEditedWriteoff]       = useState<number | ''>(0);

  // FIX: extended new-task form state with all previously-NULL fields
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, NewTaskInputs>>({});

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const projs = await projectService.getProjects();
        if (!mounted) return;
        setProjects(projs);

        // Load tasks AND milestones for every project in parallel
        const tasksByProject: Record<number, Task[]>         = {};
        const milestonesByProject: Record<number, Milestone[]> = {};

        await Promise.all(
          projs.map(async (p) => {
            const [tasks, milestones] = await Promise.all([
              projectService.getTasksByProject(p.id),
              // FIX: fetch milestones so milestone_id can be selected in the form
              milestoneService.getMilestonesByProject(p.id),
            ]);
            tasksByProject[Number(p.id)]     = tasks;
            milestonesByProject[Number(p.id)] = milestones;
          })
        );

        if (mounted) {
          setTasksMap(tasksByProject);
          setMilestonesMap(milestonesByProject);
        }
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load projects');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const filtered = projects.filter(p => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (a: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(a);

  const calculateProjectProgress = (projectId: number | string): number => {
    const tasks = tasksMap[Number(projectId)] || [];
    if (!tasks.length) return 0;
    return Math.round(tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / tasks.length);
  };

  const getTaskStats = (projectId: number | string) => {
    const tasks = tasksMap[Number(projectId)] || [];
    return { done: tasks.filter(t => t.stage === 'done').length, total: tasks.length };
  };

  // ── Refresh helpers ─────────────────────────────────────────────────────────
  const refreshProjectData = async (projectId: number) => {
    const [tasks, updatedProject] = await Promise.all([
      projectService.getTasksByProject(projectId),
      projectService.getProject(projectId),
    ]);
    setTasksMap(prev => ({ ...prev, [projectId]: tasks }));
    if (updatedProject)
      setProjects(prev => prev.map(p => (Number(p.id) === projectId ? updatedProject : p)));
  };

  // ── Task progress editing ───────────────────────────────────────────────────
  const startEditProgress = (task: Task) => {
    setEditingTaskId(Number(task.id));
    setEditedProgress(Number(task.progress));
    // FIX: pre-populate writeoff_hours from existing task value
    setEditedWriteoff(task.writeoff_hours ?? 0);
  };

  const saveEditProgress = async (taskId: number, projectId: number) => {
    if (editedProgress === '') return;
    const progress      = Number(editedProgress);
    const writeoffHours = editedWriteoff === '' ? 0 : Number(editedWriteoff);
    if (progress < 0 || progress > 100) return;

    try {
      // FIX: persist writeoff_hours alongside progress
      await projectService.updateTask(taskId, {
        progress,
        writeoff_hours: writeoffHours,
      });
      await refreshProjectData(projectId);
      setEditingTaskId(null);
      setEditedProgress(0);
      setEditedWriteoff(0);
    } catch (e: any) {
      console.error('Failed to update task progress:', e);
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditedProgress(0);
    setEditedWriteoff(0);
  };

  // ── Billing items modal ─────────────────────────────────────────────────────
  const showBillingItems = async (task: Task) => {
    setSelectedTaskId(Number(task.id));
    setBillingLoading(true);
    try {
      // FIX: after fetching billing items, link the first one back to the task
      // if billing_item_id is still null (auto-repair on view)
      const items = await billingService.getBillingItemsByTask(task.id);
      setBillingItems(items);

      if (items.length > 0 && !task.billing_item_id) {
        // Backfill billing_item_id on the task using the canonical first item
        await projectService.updateTask(Number(task.id), {
          billing_item_id: items[0].id,
        });
        await refreshProjectData(Number(task.project_id));
      }
    } catch (e: any) {
      console.error('Failed to fetch billing items:', e);
      setBillingItems([]);
    } finally {
      setBillingLoading(false);
    }
  };

  // ── Create task ─────────────────────────────────────────────────────────────
  const startAddTask = (projectId: number) => {
    setCreatingTaskFor(projectId);
    // FIX: pre-fill billing_rate from the project object so it's never NULL
    const project = projects.find(p => Number(p.id) === projectId);
    setNewTaskInputs(prev => ({
      ...prev,
      [String(projectId)]: {
        name:           '',
        quantity:       1,
        billing_rate:   project?.billing_rate ?? '',   // FIX
        writeoff_hours: 0,                             // FIX
        milestone_id:   null,                          // FIX
      },
    }));
  };

  const updateNewTaskInput = (
    projectId: number,
    field: keyof NewTaskInputs,
    value: string | number | null,
  ) => {
    setNewTaskInputs(prev => ({
      ...prev,
      [String(projectId)]: {
        ...prev[String(projectId)],
        [field]: value,
      },
    }));
  };

  const saveNewTask = async (projectId: number) => {
    const input = newTaskInputs[String(projectId)];
    if (!input || !input.name.trim()) return;

    try {
      // ── Step 1: create the core task ───────────────────────────────────────
      const createdTask = await projectService.createTask({
        project_id:     projectId,
        name:           input.name.trim(),
        quantity:       Number(input.quantity) || 1,
        stage:          'todo',
        progress:       0,
        priority:       'medium',
        order_index:    tasksMap[projectId]?.length ?? 0,
        // FIX: set billing_rate from form (pre-filled from project)
        billing_rate:   input.billing_rate !== '' ? Number(input.billing_rate) : null,
        // FIX: set writeoff_hours from form
        writeoff_hours: input.writeoff_hours !== '' ? Number(input.writeoff_hours) : 0,
        // FIX: set milestone_id if the user selected one
        milestone_id:   input.milestone_id ?? null,
        // billing_item_id, timesheet_id, expenses_id resolved in steps below
      });

      const taskId = Number(createdTask.id);

      // ── Step 2: create a corresponding billing item and link it ────────────
      // FIX: billing_item_id – create a default billing item for this task
      // and write its id back to the task row.
      try {
        const billingItem = await billingService.createBillingItem({
          task_id:     taskId,
          project_id:  projectId,
          description: input.name.trim(),
          quantity:    Number(input.quantity) || 1,
          unit_price:  input.billing_rate !== '' ? Number(input.billing_rate) : 0,
          is_billable: true,
        });
        await projectService.updateTask(taskId, {
          billing_item_id: billingItem.id,   // FIX: no longer NULL
        });
      } catch (billingErr) {
        // Non-fatal: task exists, billing item can be linked later
        console.warn('Could not auto-create billing item for task:', billingErr);
      }

      // ── Step 3: open a timesheet entry for this task ───────────────────────
      // FIX: timesheet_id – create an initial (0h) timesheet entry so the
      // foreign key is never NULL.
      try {
        const timesheetEntry = await timesheetService.createEntry({
          task_id:    taskId,
          project_id: projectId,
          hours:      0,
          date:       new Date().toISOString().split('T')[0],
          notes:      '',
        });
        await projectService.updateTask(taskId, {
          timesheet_id: timesheetEntry.id,   // FIX: no longer NULL
        });
      } catch (tsErr) {
        console.warn('Could not auto-create timesheet entry for task:', tsErr);
      }

      // ── Step 4: refresh UI ─────────────────────────────────────────────────
      await refreshProjectData(projectId);
      setCreatingTaskFor(null);
    } catch (e: any) {
      console.error('Failed to create task:', e);
    }
  };

  const cancelAddTask = () => setCreatingTaskFor(null);

  const removeTask = async (taskId: number, projectId: number) => {
    try {
      await projectService.deleteTask(taskId);
      await refreshProjectData(projectId);
    } catch (e: any) {
      console.error('Failed to delete task:', e);
    }
  };

  // ── Early returns ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-sm text-zinc-500">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
        {error}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Projects</h2>
          <p className="text-zinc-500 mt-1">Project Management</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'planning', 'in-progress', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium capitalize',
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200'
              )}
            >
              {s === 'all' ? 'All' : s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-2 gap-6">
        {filtered.map(proj => {
          const tasks      = tasksMap[Number(proj.id)] || [];
          const milestones = milestonesMap[Number(proj.id)] || [];
          const progress   = calculateProjectProgress(proj.id);
          const { done, total } = getTaskStats(proj.id);

          return (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FolderKanban className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{proj.name}</h3>
                    <p className="text-sm text-zinc-500">{proj.customer_name || 'No customer'}</p>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium border',
                  stageConfig[proj.status]?.bg    || 'bg-zinc-100',
                  stageConfig[proj.status]?.color || 'text-zinc-600'
                )}>
                  {statusConfig[proj.status]?.label || proj.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{proj.description}</p>

              {/* Tasks section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tasks</h4>
                  <button
                    onClick={() => startAddTask(Number(proj.id))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>

                {tasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                    No tasks yet. Add a task to start tracking this project.
                  </div>
                )}

                <div className="space-y-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'p-3 rounded-lg border-l-4',
                        stageConfig[task.stage]?.bg    || 'bg-zinc-50',
                        stageConfig[task.stage]?.color || 'border-zinc-300'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-800">{task.name}</span>
                            {task.quantity !== undefined && (
                              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                                Qty {task.quantity}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-zinc-600">{task.progress}%</span>
                            {task.priority && (
                              <span className={cn(
                                'text-xs px-1.5 py-0.5 rounded-full border',
                                task.priority === 'high'   ? 'bg-red-50 text-red-700 border-red-200' :
                                task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                             'bg-zinc-50 text-zinc-600 border-zinc-200'
                              )}>
                                {task.priority}
                              </span>
                            )}
                            {/* FIX: show billing_rate badge so it's visible / auditable */}
                            {task.billing_rate != null && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                                {formatCurrency(task.billing_rate)}/hr
                              </span>
                            )}
                            {/* FIX: show writeoff_hours badge */}
                            {!!task.writeoff_hours && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                                {task.writeoff_hours}h written off
                              </span>
                            )}
                          </div>
                        </div>

                        {editingTaskId === Number(task.id) ? (
                          /* ── Editing mode ── */
                          <div className="flex flex-col gap-1.5 items-end">
                            <div className="flex items-center gap-1">
                              <label className="text-[10px] text-zinc-400 w-16 text-right">Progress</label>
                              <input
                                type="number" min={0} max={100}
                                value={editedProgress}
                                onChange={(e) =>
                                  setEditedProgress(e.target.value === '' ? '' : Number(e.target.value))
                                }
                                className="w-16 px-2 py-0.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                autoFocus
                              />
                            </div>
                            {/* FIX: writeoff_hours input in edit mode */}
                            <div className="flex items-center gap-1">
                              <label className="text-[10px] text-zinc-400 w-16 text-right">Writeoff h</label>
                              <input
                                type="number" min={0} step={0.5}
                                value={editedWriteoff}
                                onChange={(e) =>
                                  setEditedWriteoff(e.target.value === '' ? '' : Number(e.target.value))
                                }
                                className="w-16 px-2 py-0.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => saveEditProgress(Number(task.id), Number(task.project_id))}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── Action buttons ── */
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditProgress(task)}
                              className="p-0.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit progress"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => showBillingItems(task)}
                              className="p-0.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="View billing items"
                            >
                              <Receipt className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeTask(Number(task.id), Number(proj.id))}
                              className="p-0.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            task.progress === 100 ? 'bg-emerald-500' :
                            task.progress >= 50   ? 'bg-blue-500'    :
                            task.progress > 0     ? 'bg-amber-400'   : 'bg-zinc-300'
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>

                      {editingTaskId !== Number(task.id) && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-zinc-400 capitalize">
                            {task.stage.replace('-', ' ')}
                          </span>
                          <span />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── New-task form ──────────────────────────────────────────── */}
                {creatingTaskFor === Number(proj.id) && (
                  <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
                    {/* Row 1: name + quantity */}
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        type="text"
                        placeholder="Task title"
                        value={newTaskInputs[String(proj.id)]?.name ?? ''}
                        onChange={(e) => updateNewTaskInput(Number(proj.id), 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number" min={1}
                        placeholder="Qty"
                        value={newTaskInputs[String(proj.id)]?.quantity ?? 1}
                        onChange={(e) => updateNewTaskInput(Number(proj.id), 'quantity', e.target.value)}
                        className="w-24 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Row 2: billing_rate + writeoff_hours */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {/* FIX: billing_rate input – pre-filled from project */}
                      <div>
                        <label className="block text-xs font-medium text-indigo-700 mb-1">
                          Billing Rate ($/hr)
                        </label>
                        <input
                          type="number" min={0} step={0.01}
                          placeholder="e.g. 95.00"
                          value={newTaskInputs[String(proj.id)]?.billing_rate ?? ''}
                          onChange={(e) =>
                            updateNewTaskInput(Number(proj.id), 'billing_rate', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* FIX: writeoff_hours input */}
                      <div>
                        <label className="block text-xs font-medium text-indigo-700 mb-1">
                          Writeoff Hours
                        </label>
                        <input
                          type="number" min={0} step={0.5}
                          placeholder="e.g. 0"
                          value={newTaskInputs[String(proj.id)]?.writeoff_hours ?? 0}
                          onChange={(e) =>
                            updateNewTaskInput(Number(proj.id), 'writeoff_hours', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Row 3: milestone_id dropdown – FIX */}
                    <div>
                      <label className="block text-xs font-medium text-indigo-700 mb-1">
                        Milestone (optional)
                      </label>
                      <select
                        value={newTaskInputs[String(proj.id)]?.milestone_id ?? ''}
                        onChange={(e) =>
                          updateNewTaskInput(
                            Number(proj.id),
                            'milestone_id',
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">— No milestone —</option>
                        {milestones.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveNewTask(Number(proj.id))}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                      <button
                        onClick={cancelAddTask}
                        className="px-3 py-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Project progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-zinc-600 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold text-zinc-900">{progress}%</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-1">{done}/{total} tasks completed</p>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between text-sm text-zinc-500 border-t border-zinc-100 pt-3 mt-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{proj.start_date || 'TBD'}</span>
                </div>
                <span className="text-zinc-400">→</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{proj.end_date || 'TBD'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <FolderKanban className="w-12 h-12 mx-auto mb-4" />
          <p>No projects found</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-zinc-900">{projects.length}</div>
          <div className="text-sm text-zinc-500">Total Projects</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {projects.filter(p => p.status === 'in-progress' || p.status === 'planning').length}
          </div>
          <div className="text-sm text-zinc-500">Active</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {projects.filter(p => p.status === 'completed').length}
          </div>
          <div className="text-sm text-zinc-500">Completed</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
          </div>
          <div className="text-sm text-zinc-500">Total Budget</div>
        </div>
      </div>

      {/* Billing items modal */}
      {selectedTaskId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Billing Items for Task</h3>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <div className="p-6">
              {billingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-zinc-500">Loading items...</span>
                </div>
              ) : billingItems.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No billing items found for this task.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">Billable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {billingItems.map(item => (
                        <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-zinc-800">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-right font-mono">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TND' }).format(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-zinc-900 font-mono">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TND' }).format(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                              item.isBillable
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-600'
                            )}>
                              {item.isBillable ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
```

---

### How each NULL field is resolved

| Field | Where Fixed | Strategy |
|---|---|---|
| `billing_rate` | `startAddTask` + `saveNewTask` | Pre-filled from `project.billing_rate` in the form; written to the task row on creation |
| `writeoff_hours` | `saveNewTask` + `saveEditProgress` | Input added to both the create form and the inline edit form; always written explicitly (never left undefined) |
| `milestone_id` | `startAddTask` + `saveNewTask` | A dropdown populated from `milestoneService.getMilestonesByProject()` loaded at startup; written to the task row on creation |
| `billing_item_id` | `saveNewTask` (Step 2) + `showBillingItems` (auto-repair) | A matching billing item is created right after the task; its `id` is written back immediately. On modal open, if the link is still missing it is backfilled |
| `timesheet_id` | `saveNewTask` (Step 3) | A zero-hour timesheet entry is created right after the task; its `id` is written back immediately |
| `expenses_id` | Left `null` intentionally at creation | Expenses don't exist at task-creation time — they are linked later via the expense module. The field stays `null` until `expenseService.createExpense({ task_id })` is called, which should then call `projectService.updateTask(taskId, { expenses_id: expense.id })` |