import { lazy } from 'react';
import type { ModuleManifest, ModelDefinition } from '../../core/types/ModuleManifest';
import {
  IdField, NameField,
  EmailField, PhoneField,
  Many2oneField,
  CharField,
  DateField,
  SelectionField,
  MonetaryField,
  BinaryField,
  ActiveField, CreatedAtField, UpdatedAtField
} from '../../core/orm/fields';
import { hrmService } from './hrmService';

// Lazy page stubs
const EmployeeList = lazy(() => import('./pages/EmployeeList'));

const EmployeeModel: ModelDefinition = {
  name: 'hrm.employee',
  label: 'Employee',
  labelPlural: 'Employees',
  table: 'hrm_employees',
  icon: 'UserCheck',
  order: 'name asc',
  fields: [
    IdField, NameField,
    EmailField('email', 'Email'),
    PhoneField('phone', 'Phone'),
    Many2oneField('department_id', 'Department', 'hrm.department'),
    CharField('job_title', 'Job Title'),
    DateField('hire_date', 'Hire Date'),
    SelectionField('status', 'Status', [
      { value: 'active', label: 'Active' },
      { value: 'on-leave', label: 'On Leave' },
      { value: 'terminated', label: 'Terminated' },
    ], { default: 'active' }),
    MonetaryField('salary', 'Monthly Salary'),
    BinaryField('photo', 'Photo'),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

export const HRMManifest: ModuleManifest = {
  id: 'hr',
  name: 'Human Resources',
  summary: 'Employees, attendance, leaves, and people operations.',
  version: '1.0.0',
  description: 'Employee management, attendance, and payroll.',
  icon: 'UserCheck',
  color: '#ec4899',
  category: 'erp',
  depends: [],
  application: true,
  sequence: 140,
  license: 'LGPL-3',
  requiredTier: 'pro',
  isCore: false,
  onActivate: async (services) => {
    services.get('services').register('hr.employee', hrmService);
  },
  routes: [
    { path: '/hrm', component: EmployeeList, label: 'HR Dashboard' },
    { path: '/hrm/employees', component: EmployeeList, label: 'Employees' },
    { path: '/hrm/attendance', component: EmployeeList, label: 'Attendance' },
    { path: '/hrm/leaves', component: EmployeeList, label: 'Leaves' },
  ],
  sidebarItems: [
    { id: 'hrm-hub', label: 'HR', href: '/hrm/employees', icon: 'UserCheck', sequence: 140 },
    { id: 'hrm-emp', label: 'Employees', href: '/hrm/employees', icon: 'Users', parentId: 'hrm-hub', sequence: 141 },
    { id: 'hrm-att', label: 'Attendance', href: '/hrm/attendance', icon: 'Clock', parentId: 'hrm-hub', sequence: 142 },
    { id: 'hrm-leave', label: 'Leaves', href: '/hrm/leaves', icon: 'CalendarOff', parentId: 'hrm-hub', sequence: 143 },
  ],
  models: [EmployeeModel],
  views: [
    {
      type: 'list', model: 'hrm.employee',
      fields: [
        { name: 'name', label: 'Employee', widget: 'avatar', sortable: true },
        { name: 'job_title', label: 'Position', sortable: true },
        { name: 'department_id', label: 'Department', sortable: true },
        { name: 'email', label: 'Email' },
        { name: 'status', label: 'Status', widget: 'badge', sortable: true },
      ],
      searchFields: ['name', 'email', 'job_title'],
      pagination: { pageSize: 20 },
    },
  ],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};
