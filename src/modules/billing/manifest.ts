import { lazy } from 'react';
import type { ModuleManifest, ModelDefinition } from '../../core/types/ModuleManifest';
import {
  IdField, NameField,
  CharField,
  DateField,
  SelectionField,
  Many2oneField, TextField,
  MonetaryField,
  ActiveField, CreatedAtField, UpdatedAtField,
  IntegerField, FloatField
} from '../../core/orm/fields';
import { billingService } from './billingService';

// Lazy page stubs
const BillingSessionsList = lazy(() => import('./pages/BillingSessionsList'));
const BillingSessionDetail = lazy(() => import('./pages/BillingSessionDetail'));

const BillingSessionModel: ModelDefinition = {
  name: 'billing.session',
  label: 'Billing Session',
  labelPlural: 'Billing Sessions',
  table: 'billing_sessions',
  icon: 'Receipt',
  fields: [
    IdField,
    Many2oneField('project_id', 'Project', 'project.project', { required: true }),
    Many2oneField('sales_order_id', 'Sales Order', 'sales.order'),
    SelectionField('status', 'Status', [
      { value: 'open', label: 'Open' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'cancelled', label: 'Cancelled' },
    ], { default: 'open' }),
    SelectionField('billing_model', 'Billing Model', [
      { value: 'time_and_material', label: 'T&M' },
      { value: 'fixed_price', label: 'Fixed Price' },
      { value: 'milestone', label: 'Milestone' },
      { value: 'hybrid', label: 'Hybrid' },
    ]),
    MonetaryField('gross_amount', 'Gross Amount', { readonly: true }),
    MonetaryField('adjustments', 'Adjustments'),
    MonetaryField('net_amount', 'Net Amount', { readonly: true }),
    CharField('currency', 'Currency', { default: 'TND' }),
    TextField('review_notes', 'Review Notes'),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

const BillingItemModel: ModelDefinition = {
  name: 'billing.item',
  label: 'Billing Item',
  labelPlural: 'Billing Items',
  table: 'billing_items',
  fields: [
    IdField,
    Many2oneField('billing_session_id', 'Session', 'billing.session', { required: true }),
    SelectionField('source_type', 'Source', [
      { value: 'timesheet', label: 'Timesheet' },
      { value: 'task', label: 'Task' },
      { value: 'milestone', label: 'Milestone' },
      { value: 'expense', label: 'Expense' },
      { value: 'fixed', label: 'Fixed' },
      { value: 'retainer', label: 'Retainer' },
      { value: 'adjustment', label: 'Adjustment' },
      { value: 'writeoff', label: 'Write-off' },
    ]),
    TextField('description', 'Description'),
    FloatField('quantity', 'Quantity'),
    MonetaryField('unit_price', 'Unit Price'),
    MonetaryField('amount', 'Amount'),
    SelectionField('is_billable', 'Billable', [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ], { default: 'true' }),
  ],
};

export const BillingManifest: ModuleManifest = {
  id: 'billing',
  name: 'Billing Governance',
  summary: 'Revenue extraction and review process.',
  version: '1.0.0',
  description: 'Manage billing sessions and revenue review.',
  icon: 'Receipt',
  color: '#8b5cf6',
  category: 'erp',
  depends: ['sales', 'project', 'invoice'],
  application: true,
  sequence: 135,
  license: 'LGPL-3',
  requiredTier: 'pro',
  isCore: false,
  onActivate: async (services) => {
    services.get('services').register('billing.session', billingService);
  },
  routes: [
    { path: '/billing', component: BillingSessionsList, label: 'Billing' },
    { path: '/billing/sessions', component: BillingSessionsList, label: 'Billing Sessions' },
    { path: '/billing/sessions/:id', component: BillingSessionDetail, label: 'Session Detail' },
  ],
  sidebarItems: [
    { id: 'bill-hub', label: 'Billing', href: '/billing/sessions', icon: 'Receipt', sequence: 135 },
    { id: 'bill-sess', label: 'Billing Sessions', href: '/billing/sessions', icon: 'Receipt', parentId: 'bill-hub', sequence: 136 },
  ],
  models: [BillingSessionModel, BillingItemModel],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};
