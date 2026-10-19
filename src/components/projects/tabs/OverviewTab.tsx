import React, { useState, useEffect } from 'react';
import { 
  ProjectFinancials, 
  ProjectListRow, 
  ProjectFormData 
} from '@/types/project.types';
import { KpiCard } from '../ui/KpiCard';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { getDaysLabel } from '@/lib/projects/projects.helpers';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  CreditCard, 
  User, 
  AlignLeft,
  LucideIcon
} from 'lucide-react';

type OverviewTabProps = {
  projectId: number;
  project?: ProjectListRow;
  isEditMode: boolean;
  formData: Partial<ProjectFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ProjectFormData>>>;
  onSave: (data: Partial<ProjectFormData>) => Promise<void>;
  onCancel: () => void;
};

export const OverviewTab = ({ projectId, project, isEditMode, formData, setFormData, onSave, onCancel }: OverviewTabProps) => {
  
  if (!isEditMode) {
    if (!project) return <div className="p-8 text-center text-slate-500">Project data not available</div>;
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard 
            label="Budget" 
            value={`$${project.budget.toLocaleString()}`} 
            sub={project.billing_model.replace('_', ' ')}
            borderColor="border-l-blue-500"
            icon={DollarSign}
          />
          <KpiCard 
            label="Tasks" 
            value={`${project.completed_tasks_count}/${project.tasks_count}`} 
            sub={`${Math.round(project.task_completion_pct)}% complete`}
            borderColor="border-l-green-500"
            icon={CheckCircle}
          />
          <KpiCard 
            label="Deadline" 
            value={new Date(project.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} 
            sub={getDaysLabel(project.days_remaining)}
            borderColor={project.is_overdue ? 'border-l-red-500' : 'border-l-blue-500'}
            valueColor={project.is_overdue ? 'text-red-600' : 'text-slate-900'}
            icon={Calendar}
          />
          <KpiCard 
            label="Payment" 
            value={project.payment_status.replace('_', ' ')} 
            sub={project.billing_status.replace('_', ' ')}
            borderColor="border-l-yellow-500"
            icon={CreditCard}
          />
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-700">Overall Progress</h4>
            <span className="text-xs font-medium text-slate-500">{Math.round(project.task_completion_pct)}%</span>
          </div>
          <ProgressBar value={project.task_completion_pct} size="md" colorAuto />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <DetailItem label="Project Name" value={project.name} icon={AlignLeft} />
            <DetailItem label="Status" value={<StatusBadge status={project.status} type="project" />} />
            <DetailItem label="Start Date" value={new Date(project.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
            <DetailItem label="End Date" value={new Date(project.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
          </div>
          <div className="space-y-4">
            <DetailItem label="Billing Model" value={project.billing_model.replace('_', ' ')} />
            <DetailItem label="Budget" value={`$${project.budget.toLocaleString()}`} />
             {project.billing_model === 'fixed_price' && (
               <DetailItem label="Fixed Price Total" value={`$${project.budget.toLocaleString()}`} />
             )}
            <DetailItem label="Billing Status" value={project.billing_status.replace('_', ' ')} />
          </div>
          <div className="space-y-4">
            <DetailItem label="Payment Status" value={project.payment_status.replace('_', ' ')} />
            <DetailItem label="Manager" value={project.manager_id || 'Not Assigned'} />
            <DetailItem label="Client" value={`${project.client_name} (${project.client_company})`} icon={User} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Description</label>
            <p className="text-sm text-slate-700 leading-relaxed">{project.description || 'No description provided.'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Billing Notes</label>
            <p className="text-sm text-slate-700 leading-relaxed">{project.billing_notes || 'No billing notes available.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Project Name *</label>
          <input 
            type="text" 
            className="w-full p-2 border border-slate-300 rounded-md text-sm"
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Status *</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-md text-sm"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Start Date *</label>
          <input 
            type="date" 
            className="w-full p-2 border border-slate-300 rounded-md text-sm"
            value={formData.start_date}
            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">End Date *</label>
          <input 
            type="date" 
            className="w-full p-2 border border-slate-300 rounded-md text-sm"
            value={formData.end_date}
            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Billing Model *</label>
           <select 
             className="w-full p-2 border border-slate-300 rounded-md text-sm"
             value={formData.billing_model}
             onChange={e => setFormData({ ...formData, billing_model: e.target.value as any })}
           >
             <option value="time_and_material">Time & Material</option>
             <option value="fixed_price">Fixed Price</option>
             <option value="milestone">Milestone Based</option>
             <option value="hybrid">Hybrid</option>
           </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Budget ($) *</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full p-2 border border-slate-300 rounded-md text-sm"
            value={formData.budget}
            onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
          />
        </div>
        {formData.billing_model === 'retainer' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Retainer Amount ($)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
              value={formData.retainer_amount}
              onChange={e => setFormData({ ...formData, retainer_amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Billing Status</label>
           <select 
             className="w-full p-2 border border-slate-300 rounded-md text-sm"
             value={formData.billing_status}
             onChange={e => setFormData({ ...formData, billing_status: e.target.value as any })}
           >
             <option value="not_started">Not Started</option>
             <option value="pending_review">Pending Review</option>
             <option value="in_review">In Review</option>
             <option value="approved">Approved</option>
             <option value="invoiced">Invoiced</option>
             <option value="partially_invoiced">Partially Invoiced</option>
             <option value="written_off">Written Off</option>
           </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Payment Status</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-md text-sm"
            value={formData.payment_status}
            onChange={e => setFormData({ ...formData, payment_status: e.target.value as any })}
          >
            <option value="not_started">Not Started</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Description</label>
        <textarea 
          className="w-full p-2 border border-slate-300 rounded-md text-sm h-24"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Billing Notes</label>
        <textarea 
          className="w-full p-2 border border-slate-300 rounded-md text-sm h-24"
          value={formData.billing_notes}
          onChange={e => setFormData({ ...formData, billing_notes: e.target.value })}
        />
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: LucideIcon }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center text-xs font-medium text-slate-500">
      {Icon && <Icon className="w-3 h-3 mr-2" />}
      {label}
    </div>
    <div className="text-sm text-slate-900 font-medium">
      {value}
    </div>
  </div>
);
