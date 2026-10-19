import { lazy } from 'react';
import type { ModuleManifest, ModelDefinition } from '../../core/types/ModuleManifest';
import {
  CharField, TextField, IntegerField, FloatField, MonetaryField,
  SelectionField, Many2oneField, IdField, NameField, ActiveField, CreatedAtField, UpdatedAtField,
  BinaryField
} from '../../core/orm/fields';
import { inventoryService } from '../inventory/inventoryService';
import ProductList from './pages/ProductList';
import CategoryList from './pages/CategoryList';

const ProductModel: ModelDefinition = {
  name: 'inventory.product',
  label: 'Product',
  labelPlural: 'Products',
  table: 'inventory_products',
  icon: 'Package',
  order: 'name asc',
  fields: [
    IdField, NameField,
    CharField('sku', 'SKU'),
    CharField('barcode', 'Barcode'),
    Many2oneField('category_id', 'Category', 'inventory.category'),
    SelectionField('type', 'Product Type', [
      { value: 'physical', label: 'Physical Product' },
      { value: 'service', label: 'Service' },
      { value: 'digital', label: 'Digital Product' },
    ], { default: 'physical' }),
    TextField('description', 'Description'),
    MonetaryField('cost_price', 'Cost Price'),
    MonetaryField('sale_price', 'Sale Price'),
    IntegerField('qty_on_hand', 'Quantity on Hand', { default: 0 }),
    IntegerField('reorder_level', 'Reorder Level', { default: 5 }),
    CharField('unit', 'Unit of Measure', { default: 'pcs' }),
    FloatField('weight', 'Weight (kg)'),
    BinaryField('image', 'Product Image'),
    ActiveField, CreatedAtField, UpdatedAtField,
  ],
};

const CategoryModel: ModelDefinition = {
  name: 'inventory.category',
  label: 'Product Category',
  labelPlural: 'Product Categories',
  table: 'inventory_categories',
  icon: 'FolderTree',
  fields: [
    IdField, NameField,
    TextField('description', 'Description'),
    Many2oneField('parent_id', 'Parent Category', 'inventory.category'),
    ActiveField, CreatedAtField,
  ],
};

export const InventoryManifest: ModuleManifest = {
  id: 'inventory',
  name: 'Inventory',
  summary: 'Products, categories, stock levels, and stock adjustments.',
  version: '1.0.0',
  description: 'Product catalog, stock management, and warehouse operations.',
  icon: 'Package',
  color: '#f59e0b',
  category: 'erp',
  depends: [],
  application: true,
  sequence: 110,
  license: 'LGPL-3',
  requiredTier: 'free',
  isCore: false,
  onActivate: async (services) => {
    services.get('services').register('inventory.stock', inventoryService);
    services.get('services').register('inventory.product', inventoryService);
  },
  routes: [
    { path: '/inventory', component: lazy(() => import('./pages/InventoryLanding')), label: 'Inventory' },
    { path: '/inventory/products', component: ProductList, label: 'Products' },
    { path: '/inventory/categories', component: CategoryList, label: 'Categories' },
  ],
  sidebarItems: [
    { id: 'inv-hub', label: 'Inventory', href: '/inventory/products', icon: 'Package', sequence: 110 },
    { id: 'inv-prod', label: 'Products', href: '/inventory/products', icon: 'Box', parentId: 'inv-hub', sequence: 111 },
    { id: 'inv-cat', label: 'Categories', href: '/inventory/categories', icon: 'FolderTree', parentId: 'inv-hub', sequence: 112 },
  ],
  models: [ProductModel, CategoryModel],
  views: [
    {
      type: 'list', model: 'inventory.product',
      fields: [
        { name: 'name', label: 'Product', widget: 'avatar', sortable: true },
        { name: 'sku', label: 'SKU', sortable: true },
        { name: 'type', label: 'Type', widget: 'badge' },
        { name: 'sale_price', label: 'Price', widget: 'monetary', sortable: true },
        { name: 'qty_on_hand', label: 'Stock', sortable: true },
      ],
      searchFields: ['name', 'sku'],
      pagination: { pageSize: 20 },
    },
  ],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
   busEvents: [
     {
       name: 'sales.order.confirmed',
       description: 'Consumed to deduct physical product quantities from inventory stock.',
       channel: 'inventory',
       payload: {
         order: 'Confirmed sales order',
         items: 'Sales order items with productId and quantity',
       },
     },
     {
       name: 'sales.order.cancelled',
       description: 'Consumed to reverse or adjust stock reservations when a sales order is cancelled.',
       channel: 'inventory',
       payload: {
         orderId: 'ID of the cancelled order',
         orderNumber: 'Order number for reference',
       },
     },
   ],
};
