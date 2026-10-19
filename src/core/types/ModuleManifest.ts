import { ComponentType, LazyExoticComponent } from 'react';
import type { Environment } from '../orm/environment';

// ─── Field Types ───────────────────────────────────────────
export type FieldType =
  | 'char' | 'text' | 'integer' | 'float' | 'boolean'
  | 'date' | 'datetime' | 'selection' | 'many2one'
  | 'one2many' | 'many2many' | 'binary' | 'monetary'
  | 'email' | 'phone' | 'url' | 'html' | 'json';

export interface SelectionOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
}

export interface FieldDefinition {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  readonly?: boolean;
  default?: any;
  help?: string;
  // Relational
  relation?: string;        // Target model name for relational fields
  relationField?: string;   // Inverse field name
  // Selection
  selection?: SelectionOption[];
  // Constraints
  constrains?: string[];     // Names of constraint functions
  // Computed
  compute?: string;          // Name of compute function
  inverse?: string;          // Name of inverse function
  depends?: string[];        // Fields that this field depends on
  store?: boolean;
  // Validation constraints
  min?: number;              // For numeric fields
  max?: number;              // For numeric fields
  minLength?: number;        // For string fields
  maxLength?: number;        // For string fields
  pattern?: string;          // Regex pattern for validation
  // Display
  widget?: string;
  invisible?: boolean;
  group?: string;
  sequence?: number;
}


// ─── Model Definition ──────────────────────────────────────
export interface ModelDefinition {
  name: string;              // e.g., 'crm.contact'
  label: string;             // e.g., 'Contact'
  labelPlural: string;       // e.g., 'Contacts'
  description?: string;
  table: string;             // Supabase table name
  icon?: string;             // Lucide icon name
  fields: FieldDefinition[];
  order?: string;            // Default sort: 'name asc'
  recName?: string;          // Field used as display name (default: 'name')
  _inherit?: string | string[];
  _inherits?: string;
  parentField?: string;      // For tree/hierarchy views
}

// ─── Route Definition ──────────────────────────────────────
export interface RouteDefinition {
  path: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  label?: string;
  exact?: boolean;
  children?: RouteDefinition[];
}

// ─── Sidebar ───────────────────────────────────────────────
export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: string;              // Lucide icon name
  parentId?: string;
  sequence?: number;
  badge?: string | number;
  badgeColor?: string;
  tooltip?: string;          // Shown on hover
}

// ─── View Registration ─────────────────────────────────────
export type ViewType = 'list' | 'form' | 'kanban' | 'calendar' | 'graph' | 'pivot' | 'custom';

export interface ViewField {
  name: string;
  widget?: string;
  label?: string;
  invisible?: boolean;
  readonly?: boolean;
  width?: number | string;
  sortable?: boolean;
  groupable?: boolean;
}

export interface ViewAction {
  id: string;
  label: string;
  icon?: string;
  type: 'button' | 'action' | 'link';
  handler?: string;
  confirm?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ListViewConfig {
  type: 'list';
  model: string;
  fields: ViewField[];
  defaultOrder?: string;
  groupBy?: string[];
  filters?: { label: string; domain: any[] }[];
  actions?: ViewAction[];
  pagination?: { pageSize: number };
  searchFields?: string[];
}

export interface FormViewConfig {
  type: 'form';
  model: string;
  fields: ViewField[];
  layout?: FormLayout;
  actions?: ViewAction[];
  chatter?: boolean;
}

export interface FormLayout {
  sections: FormSection[];
}

export interface FormSection {
  title?: string;
  columns?: number;
  fields: string[];
  collapsible?: boolean;
}

export interface KanbanViewConfig {
  type: 'kanban';
  model: string;
  groupField: string;        // Selection field to group by
  titleField: string;
  descriptionField?: string;
  colorField?: string;
  imageField?: string;
  quickCreate?: boolean;
  fields: ViewField[];
}

export interface CalendarViewConfig {
  type: 'calendar';
  model: string;
  dateStart: string;
  dateEnd?: string;
  titleField: string;
  colorField?: string;
}

export type ViewRegistration =
  | ListViewConfig
  | FormViewConfig
  | KanbanViewConfig
  | CalendarViewConfig;

// ─── Widget Definition ─────────────────────────────────────
export interface WidgetDefinition {
  id: string;
  label: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  size: 'small' | 'medium' | 'large' | 'full';
  sequence?: number;
  refreshInterval?: number;   // ms
}

// ─── Settings Page ─────────────────────────────────────────
export interface SettingsPageDef {
  id: string;
  label: string;
  icon: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  sequence?: number;
}

// ─── Action Definition ─────────────────────────────────────
export interface ActionDefinition {
  id: string;
  label: string;
  model?: string;
  type: 'ir.actions.act_window' | 'ir.actions.server' | 'ir.actions.client';
  viewType?: ViewType;
  domain?: any[];
  context?: Record<string, any>;
  handler?: (...args: any[]) => Promise<void>;
}

// ─── Bus/Event Definition ─────────────────────────────────
export interface BusEventDefinition {
  name: string;
  description?: string;
  channel?: string;
  payload?: Record<string, string>;
}

// ─── Module Category ───────────────────────────────────────
export type ModuleCategory = 'erp' | 'ai-tools' | 'marketing' | 'system' | 'productivity';

// ─── Module Manifest ───────────────────────────────────────
export interface ModuleManifest {
  id: string;
  name: string;
  summary?: string;
  version: string;
  description: string;
  icon: string;              // Lucide icon name
  color?: string;            // Theme color for the module
  category: ModuleCategory;
  depends: string[];
  autoInstall?: boolean;
  application?: boolean;
  sequence?: number;
  license?: string;
  data?: string[];           // Data files to load (XML, CSV)
  demo?: string[];           // Demo data files to load
  services?: Record<string, () => Promise<any>>;
  requiredTier: 'free' | 'pro' | 'enterprise';
  isCore: boolean;

  // Lifecycle hooks
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onActivate?: (services: ServiceMap) => Promise<void>;
  onDeactivate?: () => Promise<void>;
  pre_init_hook?: (services: ServiceMap) => Promise<void>;
  post_init_hook?: (services: ServiceMap) => Promise<void>;

  // Contributions
   routes: RouteDefinition[];
   sidebarItems: SidebarItem[];
   models: ModelDefinition[];
   views: ViewRegistration[];
   dashboardWidgets: WidgetDefinition[];
  settingsPages: SettingsPageDef[];
  actions: ActionDefinition[];
  busEvents?: BusEventDefinition[];
  controllers?: any[]; // List of Controller classes to register
}

// ─── Service Map (injected into modules) ───────────────────
export interface ServiceMap {
  get<T = any>(name: string): T;
  has(name: string): boolean;
}

export interface ModuleHookContext {
  env: Environment;
  services: ServiceMap;
  manifest: ModuleManifest;
}

// ─── Module State ──────────────────────────────────────────
export type ModuleStatus = 'registered' | 'installed' | 'active' | 'inactive' | 'error';

export interface ModuleState {
  manifest: ModuleManifest;
  status: ModuleStatus;
  error?: string;
  installedAt?: string;
  activatedAt?: string;
}
