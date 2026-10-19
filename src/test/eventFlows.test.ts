import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus, EVENT_NAMES } from '@/shared/events';
import { supabase } from '@/lib/supabase';
import { projectService } from '../src/modules/project/projectService';

// Mock supabase before projectService uses it (vitest hoists mocks to top)
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

// Helper to build a minimal sales order payload
const buildSalesOrder = (overrides: Partial<any> = {}) => ({
  id: 'SO-001',
  number: 'SO-2024-001',
  customerId: 'CUST-001',
  customerName: 'Acme Corp',
  status: 'confirmed' as const,
  orderDate: '2024-01-15',
  items: [
    { id: '1', productId: 'PROD-001', productName: 'Laptop', quantity: 2, unitPrice: 1000, discount: 0, total: 2000 },
  ],
  subtotal: 2000,
  taxRate: 19,
  taxAmount: 380,
  total: 2380,
  notes: '',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('Event-driven flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset internal fallback flags on projectService so tests are isolated
    (projectService as any).createTaskRpcAvailable = null;
    (projectService as any).projectTasksQuantityColumnExists = null;
  });

  it('should create project when sales.order.confirmed is emitted', async () => {
    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'create_project') {
        return {
          data: {
            id: 1,
            name: params.p_name,
            description: params.p_description,
            customer_id: params.p_customer_id,
            customer_name: params.p_customer_name,
            status: params.p_status,
            start_date: params.p_start_date,
            budget: params.p_budget,
            progress: 0,
            tasks_count: 0,
            completed_tasks_count: 0,
          },
          error: null,
        };
      }
      if (name === 'create_task') {
        return { data: { id: Number(params.p_project_id) * 10 + (params.p_order_index || 0) }, error: null };
      }
      if (name === 'update_project') {
        return { data: { id: params.p_id }, error: null };
      }
      if (name === 'get_tasks_by_project') {
        return { data: [], error: null };
      }
      if (name === 'get_project_by_id') {
        return { data: { id: 1 }, error: null };
      }
      return { data: null, error: null };
    });

    const order = buildSalesOrder();
    await eventBus.emit(EVENT_NAMES.SALES_ORDER_CONFIRMED, { order, items: order.items });

    const createProjectCall = (supabase.rpc as any).mock.calls.find((c: string[]) => c[0] === 'create_project');
    expect(createProjectCall).toBeDefined();
    const createParams = createProjectCall[1];
    expect(createParams.p_name).toContain(order.number);
    expect(createParams.p_customer_name).toBe(order.customerName);
    expect(createParams.p_status).toBe('planning');

    const createTaskCalls = (supabase.rpc as any).mock.calls.filter((c: string[]) => c[0] === 'create_task');
    expect(createTaskCalls.length).toBeGreaterThan(0);
  });

  it('should create onboarding project when crm.contact.created is emitted', async () => {
    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'create_project') {
        return {
          data: {
            id: 2,
            name: params.p_name,
            description: params.p_description,
            customer_id: Number(params.p_customer_id),
            customer_name: params.p_customer_name,
            status: params.p_status,
            start_date: params.p_start_date,
            budget: params.p_budget,
            progress: 0,
            tasks_count: 0,
            completed_tasks_count: 0,
          },
          error: null,
        };
      }
      if (name === 'create_task') {
        return { data: { id: Number(params.p_project_id) * 10 + (params.p_order_index || 0) }, error: null };
      }
      if (name === 'update_project') {
        return { data: { id: params.p_id }, error: null };
      }
      if (name === 'get_tasks_by_project') {
        return { data: [], error: null };
      }
      if (name === 'get_project_by_id') {
        return { data: { id: 2 }, error: null };
      }
      return { data: null, error: null };
    });

    const contact = {
      id: 100,
      name: 'John Doe',
      company: 'Acme Ltd',
      email: 'john@example.com',
    };

    await eventBus.emit(EVENT_NAMES.CRM_CONTACT_CREATED, { contact });

    const createProjectCall = (supabase.rpc as any).mock.calls.find((c: string[]) => c[0] === 'create_project');
    expect(createProjectCall).toBeDefined();
    const createParams = createProjectCall[1];
    expect(createParams.p_name).toContain('Onboarding');
    expect(createParams.p_customer_name).toBe('Acme Ltd');
  });

  it('should cancel linked project when sales.order.cancelled is emitted', async () => {
    const existingProject = {
      id: 5,
      name: 'Project - SO-2024-001 (Acme Corp)',
      customer_id: 123,
      customer_name: 'Acme Corp',
      status: 'in-progress',
      progress: 30,
      tasks_count: 2,
      completed_tasks_count: 1,
    };

    (supabase.rpc as any).mockImplementation(async (name: string, params: any) => {
      if (name === 'get_projects') {
        return { data: [existingProject], error: null };
      }
      if (name === 'update_project') {
        return { data: { id: params.p_id, status: params.p_status }, error: null };
      }
      return { data: null, error: null };
    });

    await eventBus.emit(EVENT_NAMES.SALES_ORDER_CANCELLED, {
      orderId: 'SO-001',
      orderNumber: 'SO-2024-001',
      customerId: 123,
      customerName: 'Acme Corp',
    });

    // Should call update_project to cancel matching project
    const updateCalls = (supabase.rpc as any).mock.calls.filter((c: string[]) => c[0] === 'update_project');
    expect(updateCalls.length).toBeGreaterThan(0);
    const updateParams = updateCalls[0][1];
    expect(updateParams.p_status).toBe('cancelled');
    expect(updateParams.p_active).toBe(false);
    expect(updateParams.p_id).toBe(5);
  });
});
