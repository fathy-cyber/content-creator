import { useState, useEffect } from 'react';
import { Search, Plus, Users, User, Edit, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { hrmService, type Employee } from '../hrmService';
import { cn } from '@/lib/utils';

const statusConfig = { active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' }, inactive: { label: 'Inactive', color: 'bg-zinc-100 text-zinc-500' }, on_leave: { label: 'On Leave', color: 'bg-amber-100 text-amber-700' } };

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [payroll, setPayroll] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEmployees() {
      try {
        const [employeeRows, departmentRows, totalPayroll] = await Promise.all([
          hrmService.getEmployees(),
          hrmService.getDepartments(),
          hrmService.getTotalPayroll(),
        ]);

        if (!mounted) return;
        setEmployees(employeeRows);
        setDepartments(departmentRows);
        setPayroll(totalPayroll);
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadEmployees();
    return () => { mounted = false; };
  }, []);

  const filtered = employees.filter(emp => {
    const matchSearch = !searchQuery || emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = deptFilter === 'all' || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(a);

  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Users className="w-12 h-12 mx-auto mb-4" />
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Employees</h2>
          <p className="text-zinc-500 mt-1">Human Resources Management</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Add Employee</button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg" />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {emp.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 truncate">{emp.name}</h3>
                <p className="text-sm text-zinc-500 truncate">{emp.position}</p>
                <span className={cn('inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium', statusConfig[emp.status].color)}>{statusConfig[emp.status].label}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-500"><Mail className="w-4 h-4" /><span className="truncate">{emp.email}</span></div>
              <div className="flex items-center gap-2 text-zinc-500"><Phone className="w-4 h-4" /><span>{emp.phone}</span></div>
              <div className="flex items-center gap-2 text-zinc-500"><Briefcase className="w-4 h-4" /><span>{emp.department}</span></div>
              <div className="flex items-center gap-2 text-zinc-500"><Calendar className="w-4 h-4" /><span>{emp.hireDate}</span></div>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-zinc-100">
              <span className="text-sm text-zinc-500">Salary</span>
              <span className="font-semibold">{formatCurrency(emp.salary)}/mo</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-zinc-400"><Users className="w-12 h-12 mx-auto mb-4" /><p>No employees</p></div>}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-zinc-900">{employees.length}</div>
          <div className="text-sm text-zinc-500">Total Employees</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">{employees.filter(e => e.status === 'active').length}</div>
          <div className="text-sm text-zinc-500">Active</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-amber-600">{employees.filter(e => e.status === 'on_leave').length}</div>
          <div className="text-sm text-zinc-500">On Leave</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-indigo-600">{formatCurrency(payroll)}</div>
          <div className="text-sm text-zinc-500">Monthly Payroll</div>
        </div>
      </div>
    </div>
  );
}