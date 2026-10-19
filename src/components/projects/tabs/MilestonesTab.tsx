import React, { useState, useEffect } from 'react';
import { MilestoneDetail, ProjectTaskDetail } from '@/types/project.types';
import { 
  updateMilestone, 
  markMilestoneBilled, 
  createMilestone 
} from '@/lib/projects/projects.mutations';
import { 
  fetchProjectMilestones as getMilestones,
  fetchProjectTasks
} from '@/lib/projects/projects.queries';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  DollarSign, 
  Calendar 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MilestonesTabProps = {
  projectId: number;
};

export const MilestonesTab = ({ projectId }: MilestonesTabProps) => {
  const [milestones, setMilestones] = useState<MilestoneDetail[]>([]);
  const [tasks, setTasks] = useState<ProjectTaskDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [msData, taskData] = await Promise.all([
        getMilestones(projectId),
        fetchProjectTasks(projectId)
      ]);
      setMilestones(msData);
      setTasks(taskData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateMilestone(id, { status });
      await loadData();
    } catch (e) {
      alert('Failed to update milestone status');
    }
  };

  const handleMarkBilled = async (id: string) => {
    try {
      await markMilestoneBilled(id);
      await loadData();
    } catch (e) {
      alert('Failed to mark as billed');
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedTasks = Array.from(e.currentTarget.elements.namedItem('task_ids')?.querySelectorAll('option:checked') || [])
      .map(opt => parseInt((opt as HTMLOptionElement).value));

    try {
      await createMilestone({
        project_id: projectId,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        target_date: formData.get('target_date') as string,
        invoice_amount: parseFloat(formData.get('invoice_amount') as string) || 0,
        invoice_trigger: formData.get('invoice_trigger') === 'on',
        task_ids: selectedTasks,
      });
      setShowAddForm(false);
      await loadData();
    } catch (e) {
      alert('Failed to create milestone');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading milestones...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (milestones.length === 0 && !showAddForm) return <EmptyState icon="🚩" title="No milestones yet" description="Define key project milestones to track progress" actionLabel="Add Milestone" onAction={() => setShowAddForm(true)} />;

  const totalInvoiceable = milestones.reduce((sum, m) => sum + (m.invoice_trigger ? m.invoice_amount : 0), 0);
  const totalBilled = milestones.reduce((sum, m) => sum + (m.is_billed ? m.invoice_amount : 0), 0);
  const completedCount = milestones.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Total Milestones</span>
          <span className="text-2xl font-bold text-slate-900">{milestones.length}</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Completed</span>
          <span className="text-2xl font-bold text-green-600">{completedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Total Invoiceable</span>
          <span className="text-2xl font-bold text-slate-900">${totalInvoiceable.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1">Total Billed</span>
          <span className="text-2xl font-bold text-blue-600">${totalBilled.toLocaleString()}</span>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Name *</label>
              <input name="name" required className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Target Date *</label>
              <input name="target_date" type="date" required className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Invoice Amount ($)</label>
              <input name="invoice_amount" type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="flex items-center gap-2 py-6">
              <input name="invoice_trigger" type="checkbox" id="trigger" className="w-4 h-4 text-blue-600" />
              <label htmlFor="trigger" className="text-xs font-medium text-slate-600">Invoice Trigger</label>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-600">Related Tasks</label>
              <select name="task_ids" multiple className="w-full p-2 border border-slate-300 rounded-md text-sm h-24">
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Hold Ctrl/Cmd to select multiple tasks</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-600">Description</label>
              <textarea name="description" className="w-full p-2 border border-slate-300 rounded-md text-sm h-20" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900">Cancel</button>
            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700">Create Milestone</button>
          </div>
        </form>
      )}

      {!showAddForm && (
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Milestone
        </button>
      )}

      <div className="relative space-y-0">
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 -z-10" />
        <div className="space-y-6">
          {milestones.map((m, i) => (
            <div key={m.id} className="relative flex gap-6">
              <div className="flex-shrink-0 w-12 flex justify-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                  m.status === 'completed' ? "bg-green-100 border-green-500 text-green-600" : 
                  m.is_overdue ? "bg-red-100 border-red-500 text-red-600" : "bg-white border-slate-300 text-slate-500"
                )}>
                  {m.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : (m.is_overdue ? <AlertCircle className="w-4 h-4" /> : i + 1)}
                </div>
              </div>
              <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-slate-800">{m.name}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(m.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      <span className={cn("ml-1 font-medium", m.is_overdue ? "text-red-500" : "text-slate-400")}>
                        ({m.days_until_target > 0 ? `${m.days_until_target}d left` : `${Math.abs(m.days_until_target)}d overdue`})
                      </span>
                    </div>
                    <select 
                      value={m.status} 
                      onChange={(e) => handleStatusUpdate(m.id, e.target.value as any)}
                      className="text-xs p-1 border border-slate-300 rounded-md bg-slate-50 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">{m.description || 'No description'}</p>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Progress:</span>
                      <input 
                        type="number" 
                        className="w-12 p-1 text-xs border border-slate-300 rounded" 
                        value={m.progress} 
                        onChange={async (e) => {
                          await updateMilestone(m.id, { progress: parseInt(e.target.value) || 0 });
                          await loadData();
                        }}
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {m.completed_tasks_count} / {m.linked_tasks_count} tasks done
                    </div>
                  </div>
                  {m.invoice_trigger && (
                    <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                        <DollarSign className="w-3 h-3" />
                        ${m.invoice_amount.toLocaleString()}
                      </div>
                      {!m.is_billed ? (
                        <button 
                          onClick={() => handleMarkBilled(m.id)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                        >
                          Mark as Billed
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                          Billed on {m.billed_at ? new Date(m.billed_at).toLocaleDateString() : 'N/A'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
