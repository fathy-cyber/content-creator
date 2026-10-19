import { supabase } from '../../lib/supabase';
import { auditLog } from '../../infrastructure/audit';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  managerId: string | null;
  avatarUrl: string;
}

async function supabaseError(msg: string, error?: any): Promise<never> {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

async function getEmployeesFromDb(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*');
  if (error) throw new Error(`Failed to fetch employees: ${error.message}`);
  return (data || []) as Employee[];
}

async function getEmployeeFromDb(id: string): Promise<Employee | undefined> {
  const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }
  return data as Employee | undefined;
}

async function createEmployeeInDb(data: Partial<Employee>): Promise<Employee> {
  const payload = {
    name: data.name || 'New Employee',
    email: data.email || '',
    phone: data.phone || '',
    department: data.department || '',
    position: data.position || '',
    salary: data.salary || 0,
    hireDate: data.hireDate || new Date().toISOString().split('T')[0],
    status: data.status || 'active',
    managerId: data.managerId || null,
    avatarUrl: data.avatarUrl || '',
  };
  const { data: created, error } = await supabase.from('employees').insert(payload).select('*').single();
  if (error) throw new Error(`Failed to create employee: ${error.message}`);
  return created as Employee;
}

async function updateEmployeeInDb(id: string, updates: Partial<Employee>): Promise<Employee | null> {
  const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select('*').single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to update employee: ${error.message}`);
  }
  return data as Employee | null;
}

export const hrmService = {
  async getEmployees(): Promise<Employee[]> {
    return getEmployeesFromDb();
  },
  async getEmployee(id: string): Promise<Employee | undefined> {
    return getEmployeeFromDb(id);
  },
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    return createEmployeeInDb(data);
  },
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    const currentEmployee = await this.getEmployee(id);
    const result = await updateEmployeeInDb(id, updates);
    if (result) {
      await auditLog({
        module: 'hr',
        entityType: 'Employee',
        entityId: id,
        action: 'UPDATE',
        oldValues: currentEmployee as any,
        newValues: result as any,
      });
    }
    return result;
  },
  async terminateEmployee(id: string): Promise<Employee | null> {
    return this.updateEmployee(id, { status: 'inactive' });
  },
  async getDepartments(): Promise<string[]> {
    const employees = await this.getEmployees();
    return [...new Set(employees.map((e: Employee) => e.department))] as string[];
  },
  async getTotalPayroll(): Promise<number> {
    const employees = await this.getEmployees();
    return employees.filter(e => e.status === 'active').reduce((sum, e) => sum + e.salary, 0);
  },
};

export default hrmService;
