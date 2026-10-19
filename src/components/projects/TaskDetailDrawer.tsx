import React, { useState, useEffect } from 'react';
import { ProjectTaskDetail, TaskStage, TaskPriority } from '@/types/project.types';
import { 
  updateTask 
} from '@/lib/projects/projects.mutations';
import { 
  fetchProjectMilestones,
  fetchEmployees
} from '@/lib/projects/projects.queries';
import { 
  X, 
  Save, 
  Trash2, 
  Clock, 
  User as UserIcon, 
  Flag 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskDetailDrawerProps = {
  task: ProjectTaskDetail;
  projectId: number;
  onClose: () => void;
  onUpdate: () => void;
};

export const TaskDetailDrawer = ({ task, projectId, onClose, onUpdate }: TaskDetailDrawerProps) => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectTaskDetail>>(task);

  useEffect(() => {
    const loadData = async () => {
      const [msData, empData] = await Promise.all([
        fetchProjectMilestones(projectId),
        fetchEmployees()
      ]);
      setMilestones(msData);
      setEmployees(empData);
    };
    loadData();
  }, [projectId]);

  // Update formData when the task prop changes (e.g. after a save or background event)
  useEffect(() => {
    setFormData(task);
  }, [task]);

  const handleStageChange = (newStage: string) => {
    const updatedData = { ...formData, stage: newStage as any };
    if (newStage === 'done') {
      updatedData.progress = 100;
    }
    setFormData(updatedData);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Prepare data and enforce rules
      const dataToSave = { ...formData };
      if (dataToSave.stage === 'done') {
        dataToSave.progress = 100;
      }

      // 2. Update Database
      await updateTask(task.id, dataToSave);
      
      // 3. Signal update to ProjectCardModal
      await onUpdate();
      
      // 4. Close drawer
      onClose();
    } catch (e) {
      console.error('[TaskDetailDrawer] Save error:', e);
      alert('Failed to save task. Please check if all required fields are filled correctly.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this task?')) return;
    try {
      await updateTask(task.id, { active: false });
      await onUpdate();
      onClose();
    } catch (e) {
      alert('Failed to delete task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800">Task Details</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">Task Name</label>
               <input 
                 type="text" 
                 className="w-full p-2 border border-slate-300 rounded-md text-sm"
                 value={formData.name || ''}
                 onChange={e => setFormData({ ...formData, name: e.target.value })}
               />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">Description</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-md text-sm h-24"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">Stage</label>
               <select 
                 className="w-full p-2 border border-slate-300 rounded-md text-sm"
                 value={formData.stage}
                 onChange={e => handleStageChange(e.target.value)}
               >
                 <option value="todo">Todo</option>
                 <option value="in_progress">In Progress</option>
                 <option value="review">Review</option>
                 <option value="done">Done</option>
               </select>

            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">Priority</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-medium text-slate-500 uppercase">Assignee</label>
                 <div className="relative">
                   <UserIcon className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                   <select 
                     className="w-full pl-8 p-2 border border-slate-300 rounded-md text-sm"
                     value={formData.employee_id || ''}
                     onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                   >
                     <option value="">Select Employee</option>
                     {employees.map(emp => (
                       <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                     ))}
                   </select>
                 </div>
               </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Deadline</label>
               <input 
                 type="date" 
                 className="w-full p-2 border border-slate-300 rounded-md text-sm"
                 value={formData.deadline || ''}
                 onChange={e => setFormData({ ...formData, deadline: e.target.value })}
               />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Est. Hours</label>
               <input 
                 type="number" 
                 step="0.25"
                 className="w-full p-2 border border-slate-300 rounded-md text-sm"
                 value={formData.estimated_hours ?? ''}
                 onChange={e => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
               />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Actual</label>
               <input 
                 type="number" 
                 step="0.25"
                 className="w-full p-2 border border-slate-300 rounded-md text-sm"
                 value={formData.actual_hours ?? ''}
                 onChange={e => setFormData({ ...formData, actual_hours: parseFloat(e.target.value) || 0 })}
               />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Write-off</label>
               <input 
                 type="number" 
                 step="0.25"
                 className="w-full p-2 border border-slate-300 rounded-md text-sm"
                 value={formData.writeoff_hours ?? ''}
                 onChange={e => setFormData({ ...formData, writeoff_hours: parseFloat(e.target.value) || 0 })}
               />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">Progress (%)</label>
              <div className="flex items-center gap-4">
               <input 
                 type="range" 
                 className="flex-1"
                 value={formData.progress ?? 0}
                 onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })}
               />
               <span className="text-sm font-bold text-slate-700 w-8">{formData.progress ?? 0}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Is Billable</span>
              </div>
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600"
                checked={formData.is_billable}
                onChange={e => setFormData({ ...formData, is_billable: e.target.checked })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Billing Rate</label>
               <input 
                 type="number" 
                 step="0.01"
                 className="w-full p-2 border border-slate-300 rounded-md text-sm"
                 value={formData.billing_rate ?? ''}
                 onChange={e => setFormData({ ...formData, billing_rate: parseFloat(e.target.value) || 0 })}
               />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Linked Milestone</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                  value={formData.milestone_id || ''}
                  onChange={e => setFormData({ ...formData, milestone_id: e.target.value })}
                >
                  <option value="">None</option>
                  {milestones.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Archive Task
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium">Cancel</button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : <><Save className="w-3 h-3" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
