import { lazy } from 'react';
import type { ModuleManifest, ModelDefinition } from '../../core/types/ModuleManifest';
import {
  IdField, NameField,
  TextField,
  Many2oneField,
  DateField, CharField,
  SelectionField,
  FloatField, IntegerField, BooleanField,
  MonetaryField,
  ActiveField, CreatedAtField, UpdatedAtField
} from '../../core/orm/fields';
import { projectService } from './projectService';

// Lazy page stubs
const ProjectList = lazy(() => import('./pages/ProjectList'));

const ProjectModel: ModelDefinition = {
  name: 'project.project',
  label: 'Project',
  labelPlural: 'Projects',
  table: 'projects',
  icon: 'Briefcase',
  order: 'name asc',
  fields: [
    IdField, NameField,
    TextField('description', 'Description'),
    Many2oneField('manager_id', 'Project Manager', 'hr.employee'),
    DateField('start_date', 'Start Date'),
    DateField('end_date', 'End Date'),
    SelectionField('status', 'Status', [
      { value: 'planning', label: 'Planning' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'on-hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ], { default: 'planning' }),
    FloatField('progress', 'Progress (%)', { min: 0, max: 100, default: 0 }),
    MonetaryField('budget', 'Budget'),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

const TaskModel: ModelDefinition = {
  name: 'project.task',
  label: 'Task',
  labelPlural: 'Tasks',
  table: 'project_tasks',
  icon: 'CheckSquare',
  order: 'created_at desc',
  fields: [
    IdField, NameField,
    Many2oneField('project_id', 'Project', 'project.project', { required: true }),
    Many2oneField('assigned_to', 'Assigned To', 'hr.employee'),
    TextField('description', 'Description'),
    SelectionField('stage', 'Stage', [
      { value: 'todo', label: 'To Do', color: 'from-zinc-400 to-zinc-500' },
      { value: 'in-progress', label: 'In Progress', color: 'from-blue-500 to-blue-600' },
      { value: 'review', label: 'Review', color: 'from-amber-500 to-amber-600' },
      { value: 'done', label: 'Done', color: 'from-emerald-500 to-emerald-600' },
    ], { default: 'todo' }),
    SelectionField('priority', 'Priority', [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ], { default: 'medium' }),
    DateField('deadline', 'Deadline'),
    IntegerField('quantity', 'Quantity', { default: 1 }),
    FloatField('estimated_hours', 'Estimated Hours'),
    FloatField('actual_hours', 'Actual Hours'),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

const TimeEntryModel: ModelDefinition = {
  name: 'project.time_entry',
  label: 'Time Entry',
  labelPlural: 'Time Entries',
  table: 'project_time_entries',
  icon: 'Timer',
  order: 'date_worked desc',
  fields: [
    IdField, NameField,
    Many2oneField('task_id', 'Task', 'project.task', { required: true }),
    CharField('user_id', 'User', { required: true }),
    FloatField('hours', 'Hours', { required: true, min: 0.01 }),
    TextField('description', 'Description'),
    DateField('date_worked', 'Date Worked', { required: true }),
    BooleanField('billable', 'Billable', { default: true }),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

const MilestoneModel: ModelDefinition = {
  name: 'project.milestone',
  label: 'Milestone',
  labelPlural: 'Milestones',
  table: 'project_milestones',
  icon: 'Target',
  order: 'target_date asc',
  fields: [
    IdField, NameField,
    Many2oneField('project_id', 'Project', 'project.project', { required: true }),
    TextField('description', 'Description'),
    DateField('target_date', 'Target Date', { required: true }),
    SelectionField('status', 'Status', [
      { value: 'pending', label: 'Pending' },
      { value: 'achieved', label: 'Achieved' },
      { value: 'overdue', label: 'Overdue' },
    ], { default: 'pending' }),
    FloatField('progress', 'Progress (%)', { min: 0, max: 100, default: 0 }),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

export const ProjectManifest: ModuleManifest = {
  id: 'project',
  name: 'Projects',
  summary: 'Projects, tasks, timesheets, milestones, and automated project creation from sales orders.',
  version: '1.0.0',
  description: 'Complete project management with task boards, time tracking, milestones, and automated workflows.',
  icon: 'Briefcase',
  color: '#8b5cf6',
  category: 'erp',
  depends: ['crm', 'sales'],
  application: true,
  sequence: 150,
  license: 'LGPL-3',
  requiredTier: 'free',
  isCore: false,
  onActivate: async (services) => {
    services.get('services').register('project.project', projectService);
    services.get('services').register('project.task', projectService);
  },
  routes: [
    { path: '/projects', component: ProjectList, label: 'Projects' },
    { path: '/projects/tasks', component: ProjectList, label: 'Tasks' },
    { path: '/projects/timesheets', component: ProjectList, label: 'Timesheets' },
    { path: '/projects/milestones', component: ProjectList, label: 'Milestones' },
  ],
  sidebarItems: [
    { id: 'proj-hub', label: 'Projects', href: '/projects', icon: 'Briefcase', sequence: 150 },
    { id: 'proj-tasks', label: 'Tasks', href: '/projects/tasks', icon: 'CheckSquare', parentId: 'proj-hub', sequence: 151 },
    { id: 'proj-time', label: 'Timesheets', href: '/projects/timesheets', icon: 'Timer', parentId: 'proj-hub', sequence: 152 },
    { id: 'proj-milestones', label: 'Milestones', href: '/projects/milestones', icon: 'Target', parentId: 'proj-hub', sequence: 153 },
  ],
  models: [ProjectModel, TaskModel, TimeEntryModel, MilestoneModel],
  views: [
    {
      type: 'kanban', model: 'project.task',
      groupField: 'stage', titleField: 'name', descriptionField: 'description',
      quickCreate: true,
      fields: [
        { name: 'name' }, { name: 'assigned_to' }, { name: 'priority', widget: 'badge' },
        { name: 'deadline', widget: 'date' }, { name: 'stage' },
      ],
    },
  ],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
   busEvents: [
     {
       name: 'crm.contact.created',
       description: 'Consumed to create an onboarding project and starter tasks for a new customer contact.',
       channel: 'project',
       payload: {
         contact: 'CRM contact identity and company details',
       },
     },
     {
       name: 'sales.order.confirmed',
       description: 'Consumed to create a project and default tasks when a sales order is confirmed.',
       channel: 'project',
       payload: {
         order: 'Confirmed sales order with customer and item details',
         items: 'Sales order line items',
       },
     },
     {
       name: 'sales.order.cancelled',
       description: 'Consumed to cancel linked delivery projects when a sales order is cancelled.',
       channel: 'project',
       payload: {
         orderId: 'ID of the cancelled order',
         orderNumber: 'Order number for reference',
         customerId: 'affected customer',
         customerName: 'customer name',
       },
     },
     {
       name: 'project.created',
       description: 'Published when a project is auto-created (from sales order or contact).',
       channel: 'project',
       payload: {
         project: 'Project summary including customer and budget',
       },
     },
   ],
};
