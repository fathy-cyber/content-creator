// =============================================================================
// DASHBOARD MODULE MANIFEST — modules/@ayech/mod-dashboard/manifest.ts
// =============================================================================
// Purpose: Declares all capabilities of the dashboard module
// =============================================================================

import type { ModuleManifest } from '@ayech/core';

const manifest: ModuleManifest = {
  // ── Identity ────────────────────────────────────────────────────────────────
  id: 'mod-dashboard',
  name: 'Dashboard',
  slug: 'dashboard',
  version: '1.0.0',
  description:
    'Central hub with business overview, quick actions, AI insights, and activity feed',
  icon: 'LayoutDashboard',
  color: '#3B82F6',
  author: 'Ayech Team',

  // ── Classification ──────────────────────────────────────────────────────────
  category: 'core',
  tags: ['dashboard', 'overview', 'analytics', 'insights', 'home'],
  tier: 'free',

  // ── Dependencies ────────────────────────────────────────────────────────────
  dependencies: [],
  coreVersion: '1.0.0',

  // ── Navigation ──────────────────────────────────────────────────────────────
  navigation: [
    {
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      labelFr: 'Tableau de bord',
      icon: 'LayoutDashboard',
      path: '/dashboard',
      order: 0,
    },
  ],

  // ── Routes ──────────────────────────────────────────────────────────────────
  routes: [
    {
      path: '/dashboard',
      component: 'pages/DashboardPage',
      auth: true,
      tier: 'free',
      breadcrumb: [{ label: 'Dashboard', labelAr: 'لوحة التحكم', labelFr: 'Tableau de bord' }],
    },
  ],

  // ── API Routes ──────────────────────────────────────────────────────────────
  apiRoutes: [
    {
      method: 'GET',
      path: '/api/dashboard/stats',
      handler: 'api/stats',
      auth: true,
      tier: 'free',
      rateLimit: { max: 60, windowMs: 60000 },
    },
    {
      method: 'GET',
      path: '/api/dashboard/activity',
      handler: 'api/activity',
      auth: true,
      tier: 'free',
      rateLimit: { max: 30, windowMs: 60000 },
    },
    {
      method: 'GET',
      path: '/api/dashboard/insights',
      handler: 'api/insights',
      auth: true,
      tier: 'free',
      rateLimit: { max: 10, windowMs: 60000 },
    },
  ],

  // ── Widgets ─────────────────────────────────────────────────────────────────
  widgets: [
    {
      id: 'quick-stats',
      component: 'widgets/QuickStats',
      title: 'Quick Stats',
      gridPosition: { col: 1, row: 1, width: 4, height: 1 },
      refreshInterval: 30000,
    },
    {
      id: 'quick-actions',
      component: 'widgets/QuickActions',
      title: 'Quick Actions',
      gridPosition: { col: 1, row: 2, width: 2, height: 1 },
    },
    {
      id: 'recent-activity',
      component: 'widgets/RecentActivity',
      title: 'Recent Activity',
      gridPosition: { col: 3, row: 2, width: 2, height: 1 },
      refreshInterval: 60000,
    },
    {
      id: 'ai-insights',
      component: 'widgets/AIInsights',
      title: 'AI Insights',
      gridPosition: { col: 1, row: 3, width: 4, height: 1 },
      refreshInterval: 300000,
    },
  ],

  // ── Commands ────────────────────────────────────────────────────────────────
  commands: [
    {
      id: 'go-dashboard',
      label: 'Go to Dashboard',
      labelAr: 'اذهب للوحة التحكم',
      labelFr: 'Aller au tableau de bord',
      icon: 'LayoutDashboard',
      action: 'navigate',
      path: '/dashboard',
      keywords: ['home', 'dashboard', 'overview', 'main', 'لوحة التحكم'],
    },
  ],

  // ── Hooks ───────────────────────────────────────────────────────────────────
  hooks: [
    {
      name: 'dashboard:quick-actions',
      description: 'Extension point for modules to add quick actions to dashboard',
      type: 'filter',
    },
    {
      name: 'dashboard:widgets',
      description: 'Extension point for modules to add dashboard widgets',
      type: 'filter',
    },
    {
      name: 'dashboard:stats',
      description: 'Extension point for modules to contribute stats to dashboard',
      type: 'filter',
    },
  ],

  // ── Extensions ──────────────────────────────────────────────────────────────
  extensions: [],

  // ── Migrations ──────────────────────────────────────────────────────────────
  migrations: [],

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  lifecycle: {
    onInstall: async () => {
      console.log('[mod-dashboard] Installed — core dashboard module ready');
    },
    onEnable: async () => {
      console.log('[mod-dashboard] Enabled');
    },
    onDisable: async () => {
      console.log('[mod-dashboard] Disabled');
    },
  },
};

export default manifest;
