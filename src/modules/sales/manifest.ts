import { lazy } from 'react';
import type { ModuleManifest, ModelDefinition } from '../../core/types/ModuleManifest';
import {
  CharField, TextField, IntegerField, FloatField, MonetaryField,
  SelectionField, Many2oneField, DateField, IdField, NameField, ActiveField, CreatedAtField, UpdatedAtField
} from '../../core/orm/fields';
import { salesService } from './salesService';
import SalesOrderList from './pages/SalesOrderList';

// Lazy page stubs

const SaleOrderModel: ModelDefinition = {
  name: 'sales.order',
  label: 'Sales Order',
  labelPlural: 'Sales Orders',
  table: 'sales_orders',
  icon: 'ShoppingCart',
  order: 'created_at desc',
  fields: [
    IdField,
    CharField('number', 'Order Number', { readonly: true }),
    Many2oneField('customer_id', 'Customer', 'crm.contact', { required: true }),
    DateField('order_date', 'Order Date', { required: true }),
    SelectionField('status', 'Status', [
      { value: 'draft', label: 'Draft' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
    ], { default: 'draft' }),
    MonetaryField('subtotal', 'Subtotal', { readonly: true }),
    FloatField('tax_rate', 'Tax Rate (%)', { default: 19 }),
    MonetaryField('tax_amount', 'Tax Amount', { readonly: true }),
    MonetaryField('total', 'Total', { readonly: true }),
    TextField('notes', 'Notes'),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

export const SalesManifest: ModuleManifest = {
  id: 'sales',
  name: 'Sales',
  summary: 'Quotations, sales orders, invoicing, and stock-triggering confirmations.',
  version: '1.0.0',
  description: 'Quotations, sales orders, and invoicing.',
  icon: 'ShoppingCart',
  color: '#10b981',
  category: 'erp',
  depends: ['crm', 'inventory'],
  application: true,
  sequence: 120,
  license: 'LGPL-3',
  requiredTier: 'free',
  isCore: false,
  onActivate: async (services) => {
    services.get('services').register('sales.order', salesService);
  },
    routes: [
      { path: '/sales', component: SalesOrderList, label: 'Sales' },
      { path: '/sales/orders', component: SalesOrderList, label: 'Orders' },
      { path: '/sales/invoices', component: lazy(() => import('../../modules/invoice/pages/InvoiceList')), label: 'Invoices' },
    ],

  sidebarItems: [
    { id: 'sale-hub', label: 'Sales', href: '/sales/orders', icon: 'ShoppingCart', sequence: 120 },
    { id: 'sale-orders', label: 'Orders', href: '/sales/orders', icon: 'FileText', parentId: 'sale-hub', sequence: 121 },
    { id: 'sale-inv', label: 'Invoices', href: '/sales/invoices', icon: 'Receipt', parentId: 'sale-hub', sequence: 122 },
  ],
  models: [SaleOrderModel],
  views: [
    {
      type: 'list', model: 'sales.order',
      fields: [
        { name: 'number', label: 'Order #', sortable: true },
        { name: 'customer_id', label: 'Customer', sortable: true },
        { name: 'order_date', label: 'Date', widget: 'date', sortable: true },
        { name: 'status', label: 'Status', widget: 'badge', sortable: true },
        { name: 'total', label: 'Total', widget: 'monetary', sortable: true },
      ],
      searchFields: ['number'],
      pagination: { pageSize: 20 },
    },
  ],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
   busEvents: [
     {
       name: 'sales.order.confirmed',
       description: 'Published when a sales order moves to confirmed and inventory should reserve/deduct stock.',
       channel: 'sales',
       payload: {
         order: 'Confirmed sales order',
         items: 'Order lines with productId, quantity, pricing, and totals',
       },
     },
     {
       name: 'sales.order.cancelled',
       description: 'Published when a sales order is cancelled so downstream modules can reverse adjustments.',
       channel: 'sales',
       payload: {
         orderId: 'Cancelled order ID',
         orderNumber: 'Order number',
         customerId: 'Customer identifier',
         customerName: 'Customer name',
       },
     },
   ],
};
