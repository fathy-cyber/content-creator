import { lazy } from 'react';
import type { ModuleManifest, ModelDefinition } from '../../core/types/ModuleManifest';
import {
  IdField, NameField,
  CharField,
  DateField,
  SelectionField,
  Many2oneField, TextField,
  MonetaryField,
  ActiveField, CreatedAtField, UpdatedAtField
} from '../../core/orm/fields';
import { accountingService } from './accountingService';

// Lazy page stubs
const InvoiceList = lazy(() => import('./pages/InvoiceList'));
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'));

const InvoiceModel: ModelDefinition = {
  name: 'invoice.invoice',
  label: 'Invoice',
  labelPlural: 'Invoices',
  table: 'invoices',
  icon: 'Receipt',
  order: 'issue_date desc',
  fields: [
    IdField,
    CharField('number', 'Invoice Number', { readonly: true }),
    Many2oneField('customer_id', 'Customer', 'crm.contact', { required: true }),
    Many2oneField('order_id', 'Sales Order', 'sales.order'),
    Many2oneField('project_id', 'Project', 'project.project'),
    SelectionField('type', 'Type', [
      { value: 'standard', label: 'Standard' },
      { value: 'proforma', label: 'Proforma' },
      { value: 'credit_note', label: 'Credit Note' },
      { value: 'recurring', label: 'Recurring' },
    ], { default: 'standard' }),
    SelectionField('status', 'Status', [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'unpaid', label: 'Unpaid' },
      { value: 'partial', label: 'Partial' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'cancelled', label: 'Cancelled' },
    ], { default: 'draft' }),
    DateField('issue_date', 'Issue Date', { required: true }),
    DateField('due_date', 'Due Date', { required: true }),
    MonetaryField('subtotal', 'Subtotal', { readonly: true }),
    MonetaryField('tax_amount', 'Tax Amount', { readonly: true }),
    MonetaryField('total', 'Total', { readonly: true }),
    MonetaryField('amount_paid', 'Amount Paid', { readonly: true }),
    MonetaryField('amount_due', 'Amount Due', { readonly: true }),
    TextField('notes', 'Notes'),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

export const InvoiceManifest: ModuleManifest = {
  id: 'invoice',
  name: 'Accounting',
  summary: 'Invoices, journals, and reporting.',
  version: '1.0.0',
  description: 'Chart of accounts, journal entries, and financial reports.',
  icon: 'Calculator',
  color: '#6366f1',
  category: 'erp',
  depends: ['sales', 'project'],
  application: true,
  sequence: 130,
  license: 'LGPL-3',
  requiredTier: 'pro',
  isCore: false,
  onActivate: async (services) => {
    services.get('services').register('invoice.invoice', accountingService);
  },
  routes: [
    { path: '/accounting', component: InvoiceList, label: 'Accounting' },
    { path: '/accounting/invoices', component: InvoiceList, label: 'Invoices' },
    { path: '/accounting/invoice/:id', component: InvoiceDetail, label: 'Invoice Detail' },
    { path: '/accounting/reports', component: InvoiceList, label: 'Reports' },
  ],
  sidebarItems: [
    { id: 'acc-hub', label: 'Accounting', href: '/accounting/invoices', icon: 'Calculator', sequence: 130 },
    { id: 'acc-inv', label: 'Invoices', href: '/accounting/invoices', icon: 'Receipt', parentId: 'acc-hub', sequence: 131 },
    { id: 'acc-rep', label: 'Reports', href: '/accounting/reports', icon: 'BarChart3', parentId: 'acc-hub', sequence: 132 },
  ],
  models: [InvoiceModel],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};
