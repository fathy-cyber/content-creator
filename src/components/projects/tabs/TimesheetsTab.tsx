import React, { useState, useEffect } from 'react';
import { TimesheetDetail } from '@/types/project.types';
import { 
  createTimesheet, 
  updateTimesheet 
} from '@/lib/projects/projects.mutations';
import { 
  fetchProjectTimesheets as getTimesheets,
  fetchEmployees
} from '@/lib/projects/projects.queries';
import { 
  StatusBadge 
} from '../ui/StatusBadge';
import { 
  EmptyState 
} from '../ui/EmptyState';
import { 
  Plus, 
  Info, 
  Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TimesheetsTabProps = {
  projectId: number;
};

export const TimesheetsTab = ({ projectId }: TimesheetsTabProps) => {
  const [timesheets, setTimesheets] = useState<TimesheetDetail[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ts, emp] = await Promise.all([
        getTimesheets(projectId),
        fetchEmployees()
      ]);
      setTimesheets(ts);
      setEmployees(emp);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createTimesheet({
        project_id: projectId,
        employee_id: formData.get('employee_id') as string,
        date: formData.get('date') as string,
        task_id: parseInt(formData.get('task_id') as string) || undefined,
        hours: parseFloat(formData.get('hours') as string) || 0,
        billable_hours: parseFloat(formData.get('billable_hours') as string) || 0,
        description: formData.get('description') as string,
        writeoff_hours: parseFloat(formData.get('writeoff_hours') as string) || 0,
      });
      setShowAddForm(false);
      await loadData();
    } catch (e) {
      alert('Failed to log time');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading timesheets...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (timesheets.length === 0 && !showAddForm) return <EmptyState icon="⏳" title="No time logged" description="Start recording hours spent on this project" actionLabel="Log Time" onAction={() => setShowAddForm(true)} />;

  const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);
  const totalBillable = timesheets.reduce((sum, t) => sum + t.billable_hours, 0);
  const totalWriteoff = timesheets.reduce((sum, t) => sum + t.writeoff_hours, 0);
  const totalValue = timesheets.reduce((sum, t) => sum + t.line_billable_value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Total Hours</span>
          <span className="text-2xl font-bold text-slate-900">{totalHours}h</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Billable Hours</span>
          <span className="text-2xl font-bold text-blue-600">{totalBillable}h</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Write-off Hours</span>
          <span className="text-2xl font-bold text-red-600">{totalWriteoff}h</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Billable Value</span>
          <span className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Employee *</label>
              <select name="employee_id" required className="w-full p-2 border border-slate-300 rounded-md text-sm">
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Date *</label>
              <input name="date" type="date" required className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Task</label>
              <input name="task_id" placeholder="Task ID" className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Hours *</label>
              <input name="hours" type="number" step="0.25" required className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Billable Hours</label>
              <input name="billable_hours" type="number" step="0.25" className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="space-y-1 group relative">
              <label className="text-xs font-medium text-slate-600">Write-off Hours</label>
              <input name="writeoff_hours" type="number" step="0.25" className="w-full p-2 border border-slate-300 rounded-md text-sm" />
              <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg w-48 z-10">
                Hours that cannot be billed to the client.
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea name="description" className="w-full p-2 border border-slate-300 rounded-md text-sm h-20" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900">Cancel</button>
            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700">Log Time</button>
          </div>
        </form>
      )}

      {!showAddForm && (
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
        >
          <Plus className="w-3 h-3 mr-1" /> Log Time
        </button>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3 text-center">Hours</th>
              <th className="px-4 py-3 text-center">Billable</th>
              <th className="px-4 py-3 text-center">Write-off</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Labor Cost</th>
              <th className="px-4 py-3">Billable Val</th>
              <th className="px-4 py-3">Margin</th>
              <th className="px-4 py-3 text-center">Billed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {timesheets.map((t) => (
              <tr 
                key={t.id} 
                className={cn(
                  "transition-colors hover:bg-slate-50",
                  t.status === 'draft' ? 'bg-slate-50/50' : 
                  t.line_margin < 0 ? 'bg-red-50/30' : 
                  t.writeoff_hours > 0 ? 'bg-red-50/30' : 
                  t.line_margin > 0 ? 'bg-green-50/30' : ''
                )}
              >
                <td className="px-4 py-3 text-slate-600">{t.date}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{t.employee_name}</td>
                <td className="px-4 py-3 text-slate-500">{t.employee_role}</td>
                <td className="px-4 py-3 text-slate-600">{t.task_name || '-'}</td>
                <td className="px-4 py-3 text-center font-medium">{t.hours}h</td>
                <td className="px-4 py-3 text-center text-blue-600">{t.billable_hours}h</td>
                <td className="px-4 py-3 text-center text-red-600">{t.writeoff_hours}h</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} type="timesheet" />
                </td>
                <td className="px-4 py-3 text-slate-600">${t.line_labor_cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">${t.line_billable_value.toLocaleString()}</td>
                <td className={cn(
                  "px-4 py-3 font-medium",
                  t.line_margin > 0 ? "text-green-600" : "text-red-600"
                )}>
                  ${t.line_margin.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  {t.is_billed ? '✅' : '❌'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
