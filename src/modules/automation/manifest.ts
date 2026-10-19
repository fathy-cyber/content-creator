import { lazy } from 'react';
import type { ModuleManifest } from '../../core/types/ModuleManifest';

// Lazy-load automation components
const AutomationLanding = lazy(() => import('./ui/AutomationLanding'));
const AutomationDashboard = lazy(() => import('./ui/AutomationDashboard'));
const VisualFlowBuilder = lazy(() => import('./ui/VisualFlowBuilder'));
const IntegrationManager = lazy(() => import('./ui/IntegrationManager'));
const TemplateGallery = lazy(() => import('./ui/TemplateLibrary'));
const ExecutionLogs = lazy(() => import('./ui/ExecutionLogs'));
const TasksManager = lazy(() => import('./ui/TasksManager'));
const CRMSalesAutomation = lazy(() => import('./ui/CRMSalesAutomation'));
const MarketingAutomation = lazy(() => import('./ui/MarketingAutomation'));
const FinancialAutomation = lazy(() => import('./ui/FinancialAutomation'));
const LearningCenter = lazy(() => import('./ui/LearningCenter'));
const AppIntegrations = lazy(() => import('./ui/AppIntegrations'));
const TaskProjectAutomation = lazy(() => import('./ui/TaskProjectAutomation'));

export const AutomationManifest: ModuleManifest = {
  id: 'automation',
  name: 'Automation Hub',
  version: '1.0.0',
  description: 'Automate workflows, integrations, and tasks.',
  icon: 'Zap',
  color: '#3b82f6',
   category: 'productivity',
  depends: [],
  requiredTier: 'free',
  isCore: false,

  routes: [
    { path: '/dashboard', component: AutomationDashboard, label: 'Dashboard' },
    { path: '/automation', component: AutomationLanding, label: 'Automation Landing' },
    { path: '/automation/dashboard', component: AutomationDashboard, label: 'Dashboard' },
    { path: '/automation/builder', component: VisualFlowBuilder, label: 'Workflow Builder' },
    { path: '/automation/integrations', component: IntegrationManager, label: 'Integrations' },
    { path: '/automation/templates', component: TemplateGallery, label: 'Templates' },
    { path: '/automation/logs', component: ExecutionLogs, label: 'Execution Logs' },
    { path: '/automation/tasks', component: TasksManager, label: 'Tasks Manager' },
    { path: '/automation/crm-sales', component: CRMSalesAutomation, label: 'CRM & Sales Automation' },
    { path: '/automation/marketing', component: MarketingAutomation, label: 'Marketing Automation' },
    { path: '/automation/finance', component: FinancialAutomation, label: 'Financial Automation' },
    { path: '/automation/learn', component: LearningCenter, label: 'Learning Center' },
    { path: '/automation/app-integrations', component: AppIntegrations, label: 'App Integrations' },
    { path: '/automation/task-project', component: TaskProjectAutomation, label: 'Task & Project Automation' },
  ],

  sidebarItems: [
    { id: 'auto-hub', label: 'Automation', href: '/automation', icon: 'Zap', sequence: 10 },
    { id: 'auto-dash', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', sequence: 5 },
    { id: 'auto-dash-sub', label: 'Dashboard', href: '/automation/dashboard', icon: 'LayoutDashboard', parentId: 'auto-hub', sequence: 11 },
    { id: 'auto-builder', label: 'Workflow Builder', href: '/automation/builder', icon: 'GitBranch', parentId: 'auto-hub', sequence: 12 },
    { id: 'auto-integrations', label: 'Integrations', href: '/automation/integrations', icon: 'Plug', parentId: 'auto-hub', sequence: 13 },
    { id: 'auto-templates', label: 'Templates', href: '/automation/templates', icon: 'Library', parentId: 'auto-hub', sequence: 14 },
    { id: 'auto-tasks', label: 'Tasks', href: '/automation/tasks', icon: 'CheckSquare', parentId: 'auto-hub', sequence: 15 },
  ],

  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export default AutomationManifest;

