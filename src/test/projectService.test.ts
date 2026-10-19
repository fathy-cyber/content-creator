import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '../src/modules/project/projectService';
import type { Task } from '../src/modules/project/projectService';


// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
  supabaseService: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Reset the RPC availability flags and mock state before each test
beforeEach(() => {
  (projectService as any).createTaskRpcAvailable = null;
  (projectService as any).projectTasksQuantityColumnExists = null;
  vi.mocked(supabase.rpc).mockClear();
});

// Helper to build a task
const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  project_id: 1,
  name: 'Task',
  description: '',
  assigned_to: undefined,
  stage: 'todo',
  priority: 'medium',
  deadline: undefined,
  estimated_hours: undefined,
  actual_hours: undefined,
  progress: 0,
  order_index: 0,
  active: true,
  created_at: '',
  updated_at: undefined,
  ...overrides,
});

describe('projectService.recalculateProjectProgress', () => {
  it('should keep status unchanged (no status update) when no tasks exist', async () => {
    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'get_tasks_by_project') return { data: [], error: null };
      if (name === 'update_project') return { data: { id: params.p_id }, error: null };
      return { data: null, error: null };
    });

    await projectService.recalculateProjectProgress(1);

    // Verify get_tasks_by_project was called
    expect(supabase.rpc).toHaveBeenCalledWith('get_tasks_by_project', { p_project_id: 1 });

    // Verify update_project called with progress and counts, but not status
    const updateCalls = (supabase.rpc as any).mock.calls.filter((c: string[]) => c[0] === 'update_project');
    expect(updateCalls.length).toBe(1);
    const updateParams = updateCalls[0][1];
    expect(updateParams.p_progress).toBe(0);
    expect(updateParams.p_tasks_count).toBe(0);
    expect(updateParams.p_completed_tasks_count).toBe(0);
    // status should NOT be updated in this branch
    expect(updateParams.p_status).toBeUndefined();
  });

  it('should set status to "planning" when tasks exist but none started', async () => {
    const tasks: Task[] = [
      buildTask({ id: 1, progress: 0, stage: 'todo' }),
      buildTask({ id: 2, progress: 0, stage: 'todo' }),
    ];
    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'get_tasks_by_project') return { data: tasks, error: null };
      if (name === 'update_project') return { data: { id: params.p_id }, error: null };
      return { data: null, error: null };
    });

    await projectService.recalculateProjectProgress(1);

    const updateCalls = (supabase.rpc as any).mock.calls.filter((c: string[]) => c[0] === 'update_project');
    const updateParams = updateCalls[0][1];
    expect(updateParams.p_status).toBe('planning');
    expect(updateParams.p_progress).toBe(0);
    expect(updateParams.p_tasks_count).toBe(2);
    expect(updateParams.p_completed_tasks_count).toBe(0);
  });

  it('should set status to "in-progress" when some tasks have started', async () => {
    const tasks: Task[] = [
      buildTask({ id: 1, progress: 50, stage: 'in-progress' }),
      buildTask({ id: 2, progress: 0, stage: 'todo' }),
    ];
    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'get_tasks_by_project') return { data: tasks, error: null };
      if (name === 'update_project') return { data: { id: params.p_id }, error: null };
      return { data: null, error: null };
    });

    await projectService.recalculateProjectProgress(1);

    const updateCalls = (supabase.rpc as any).mock.calls.filter((c: string[]) => c[0] === 'update_project');
    const updateParams = updateCalls[0][1];
    expect(updateParams.p_status).toBe('in-progress');
    expect(updateParams.p_progress).toBe(25); // avg (50+0)/2
    expect(updateParams.p_tasks_count).toBe(2);
    expect(updateParams.p_completed_tasks_count).toBe(0);
  });

  it('should set status to "completed" when all tasks are 100%', async () => {
    const tasks: Task[] = [
      buildTask({ id: 1, progress: 100, stage: 'done' }),
      buildTask({ id: 2, progress: 100, stage: 'done' }),
    ];
    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'get_tasks_by_project') return { data: tasks, error: null };
      if (name === 'update_project') return { data: { id: params.p_id }, error: null };
      return { data: null, error: null };
    });

    await projectService.recalculateProjectProgress(1);

    const updateCalls = (supabase.rpc as any).mock.calls.filter((c: string[]) => c[0] === 'update_project');
    const updateParams = updateCalls[0][1];
    expect(updateParams.p_status).toBe('completed');
    expect(updateParams.p_progress).toBe(100);
    expect(updateParams.p_tasks_count).toBe(2);
    expect(updateParams.p_completed_tasks_count).toBe(2);
  });

  it('should count completed tasks where stage is "done"', async () => {
    const tasks: Task[] = [
      buildTask({ id: 1, progress: 100, stage: 'done' }),
      buildTask({ id: 2, progress: 50, stage: 'in-progress' }),
      buildTask({ id: 3, progress: 0, stage: 'todo' }),
    ];
    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'get_tasks_by_project') return { data: tasks, error: null };
      if (name === 'update_project') return { data: { id: params.p_id }, error: null };
      return { data: null, error: null };
    });

    await projectService.recalculateProjectProgress(1);

    const updateCalls = (supabase.rpc as any).mock.calls.filter((c: string[]) => c[0] === 'update_project');
    const updateParams = updateCalls[0][1];
    expect(updateParams.p_completed_tasks_count).toBe(1); // only one with stage 'done'
    expect(updateParams.p_tasks_count).toBe(3);
    expect(updateParams.p_progress).toBe(Math.round((100 + 50 + 0) / 3)); // 50
  });
});
