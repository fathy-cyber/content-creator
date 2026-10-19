/**
 * Existing Module Manifests — Wraps all existing Ayech AI pages 
 * into the new modular system without modifying any existing components.
 * 
 * Each existing module gets a manifest that exports its routes,
 * sidebar items, and metadata.
 * 
 * @deprecated Use ModuleDiscovery and individual manifest.ts files instead.
 */

import { lazy } from 'react';
import type { ModuleManifest } from '../core/types/ModuleManifest';
import { manifest as ContentManifest } from './content/manifest';

// ─── Lazy-loaded existing pages ────────────────────────────

const Dashboard = lazy(() => import('../pages/Dashboard'));
const AppStore = lazy(() => import('../pages/AppStore'));
const CoreChat = lazy(() => import('../pages/CoreChat'));

// Business Advisory
const BusinessAdvisory = lazy(() => import('../pages/BusinessAdvisory'));
const IdeaValidator = lazy(() => import('../pages/business/IdeaValidator'));
const PricingStrategy = lazy(() => import('../pages/business/PricingStrategy'));
const ProfitCalculator = lazy(() => import('../pages/business/ProfitCalculator'));
const BusinessPlan = lazy(() => import('../pages/business/BusinessPlan'));
const MarketAnalysis = lazy(() => import('../pages/business/MarketAnalysis'));

// Marketing
const MarketingLanding = lazy(() => import('../modules/marketing/components/shared/MarketingLanding'));
const WhatsAppTemplates = lazy(() => import('../modules/marketing/components/channels/WhatsAppTemplates'));
const CampaignPlanner = lazy(() => import('../modules/marketing/components/campaigns/CampaignPlanner'));
const CampaignManager = lazy(() => import('../modules/marketing/components/campaigns/CampaignManager'));
const ConversionOptimizer = lazy(() => import('../modules/marketing/components/leads/ConversionOptimizer'));

// Automation
const AutomationHub = lazy(() => import('./automation/AutomationHub'));

// Content Studio
const ContentStudio = lazy(() => import('../pages/ContentStudio'));
const ContentCalendar = lazy(() => import('../pages/content/ContentCalendar'));
const BlogWriter = lazy(() => import('../pages/content/BlogWriter'));
const VideoScript = lazy(() => import('../pages/content/VideoScript'));
const EmailCampaign = lazy(() => import('../pages/content/EmailCampaign'));
const CaptionGenerator = lazy(() => import('../pages/content/CaptionGenerator'));

// Support
const SupportLanding = lazy(() => import('../pages/support/SupportLanding'));
const ReplyGenerator = lazy(() => import('../pages/support/ReplyGenerator'));
const ObjectionHandler = lazy(() => import('../pages/support/ObjectionHandler'));
const FaqBuilder = lazy(() => import('../pages/support/FaqBuilder'));
const ConversationSimulator = lazy(() => import('../pages/support/ConversationSimulator'));
const ComplaintResolver = lazy(() => import('../pages/support/ComplaintResolver'));

// Strategy
const StrategyLanding = lazy(() => import('../pages/strategy/StrategyLanding'));
const GoDigitalGuide = lazy(() => import('../pages/strategy/GoDigitalGuide'));
const WebsiteAuditor = lazy(() => import('../pages/strategy/WebsiteAuditor'));
const FunnelBuilder = lazy(() => import('../pages/strategy/FunnelBuilder'));
const LeadGenPlanner = lazy(() => import('../pages/strategy/LeadGenPlanner'));
const CompetitorAnalysis = lazy(() => import('../pages/strategy/CompetitorAnalysis'));

// Settings
const SettingsLanding = lazy(() => import('../pages/settings/SettingsLanding'));
const ProfileSettings = lazy(() => import('../pages/settings/ProfileSettings'));
const BusinessProfile = lazy(() => import('../pages/settings/BusinessProfile'));
const LanguageRegion = lazy(() => import('../pages/settings/LanguageRegion'));
const Notifications = lazy(() => import('../pages/settings/Notifications'));
const ConnectedAccounts = lazy(() => import('../pages/settings/ConnectedAccounts'));
const SubscriptionBilling = lazy(() => import('../pages/settings/SubscriptionBilling'));
const PrivacySecurity = lazy(() => import('../pages/settings/PrivacySecurity'));


// ─── Module Manifests ──────────────────────────────────────

export const DashboardManifest: ModuleManifest = {
  id: 'dashboard',
  name: 'Dashboard',
  version: '1.0.0',
  description: 'Main application dashboard with analytics and quick actions.',
  icon: 'LayoutDashboard',
  color: '#6366f1',
  category: 'system',
  depends: [],
  requiredTier: 'free',
  isCore: true,
  routes: [
    { path: '/dashboard', component: Dashboard, label: 'Dashboard' },
  ],
  sidebarItems: [
    { id: 'dashboard', label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard', sequence: 1 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const AppStoreManifest: ModuleManifest = {
  id: 'app-store',
  name: 'App Store',
  version: '1.0.0',
  description: 'Browse, install, and manage application modules.',
  icon: 'ShoppingBag',
  color: '#8b5cf6',
  category: 'system',
  depends: [],
  requiredTier: 'free',
  isCore: true,
  routes: [
    { path: '/apps', component: AppStore, label: 'App Store' },
  ],
  sidebarItems: [
    { id: 'app-store', label: 'App Store', href: '/apps', icon: 'ShoppingBag', sequence: 2 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const CoreChatModuleManifest: ModuleManifest = {
  id: 'core-chat',
  name: 'Ask Ayech',
  version: '1.0.0',
  description: 'Core AI Chat assistant for business queries.',
  icon: 'MessageSquare',
  color: '#06b6d4',
  category: 'ai-tools',
  depends: [],
  requiredTier: 'free',
  isCore: true,
  routes: [
    { path: '/chat', component: CoreChat, label: 'Ask Ayech' },
  ],
  sidebarItems: [
    { id: 'core-chat', label: 'Ask Ayech', href: '/chat', icon: 'MessageSquare', sequence: 10 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const BusinessAdvisoryModuleManifest: ModuleManifest = {
  id: 'business-advisory',
  name: 'Business Advisory',
  version: '1.0.5',
  description: 'Strategic tools to validate, plan, and grow your business.',
  icon: 'TrendingUp',
  color: '#10b981',
  category: 'ai-tools',
  depends: [],
  requiredTier: 'free',
  isCore: false,
  routes: [
    { path: '/business', component: BusinessAdvisory, label: 'Advisory Hub' },
    { path: '/business/idea-validator', component: IdeaValidator, label: 'Idea Validator' },
    { path: '/business/pricing', component: PricingStrategy, label: 'Pricing Strategy' },
    { path: '/business/calculator', component: ProfitCalculator, label: 'Profit Calculator' },
    { path: '/business/plan', component: BusinessPlan, label: 'Business Plan' },
    { path: '/business/market-analysis', component: MarketAnalysis, label: 'Market Analysis' },
  ],
  sidebarItems: [
    { id: 'biz-hub', label: 'Advisory Hub', href: '/business', icon: 'TrendingUp', sequence: 20 },
    { id: 'biz-idea', label: 'Idea Validator', href: '/business/idea-validator', icon: 'Lightbulb', parentId: 'biz-hub', sequence: 21 },
    { id: 'biz-price', label: 'Pricing Strategy', href: '/business/pricing', icon: 'DollarSign', parentId: 'biz-hub', sequence: 22 },
    { id: 'biz-calc', label: 'Profit Calculator', href: '/business/calculator', icon: 'Calculator', parentId: 'biz-hub', sequence: 23 },
    { id: 'biz-plan', label: 'Business Plan', href: '/business/plan', icon: 'FileText', parentId: 'biz-hub', sequence: 24 },
    { id: 'biz-market', label: 'Market Analysis', href: '/business/market-analysis', icon: 'Search', parentId: 'biz-hub', sequence: 25 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const MarketingModuleManifest: ModuleManifest = {
  id: 'marketing',
  name: 'Marketing & Sales',
  version: '1.0.0',
  description: 'Marketing tools, ad copy, and sales scripts.',
  icon: 'Megaphone',
  color: '#f59e0b',
  category: 'marketing',
  depends: [],
  requiredTier: 'free',
  isCore: false,
  routes: [
    { path: '/marketing', component: MarketingLanding },
    { path: '/marketing/whatsapp-templates', component: WhatsAppTemplates },
    { path: '/marketing/campaign-planner', component: CampaignPlanner },
    { path: '/marketing/campaigns', component: CampaignManager },
    { path: '/marketing/conversion', component: ConversionOptimizer },
  ],
  sidebarItems: [
    { id: 'mkt-hub', label: 'Marketing Hub', href: '/marketing', icon: 'Megaphone', sequence: 30 },
    { id: 'mkt-wa', label: 'WhatsApp Templates', href: '/marketing/whatsapp-templates', icon: 'MessageCircle', parentId: 'mkt-hub', sequence: 34 },
    { id: 'mkt-camp', label: 'Campaign', href: '/marketing/campaigns', icon: 'Calendar', parentId: 'mkt-hub', sequence: 35 },
    { id: 'mkt-conv', label: 'Conversion', href: '/marketing/conversion', icon: 'Target', parentId: 'mkt-hub', sequence: 37 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const AutomationModuleManifest: ModuleManifest = {
  id: 'automation',
  name: 'Automation Hub',
  version: '1.0.0',
  description: 'Automate business workflows easily.',
  icon: 'Zap',
  color: '#ef4444',
  category: 'productivity',
  depends: [],
  requiredTier: 'free',
  isCore: false,
   routes: [
     { path: '/automation', component: AutomationHub, label: 'Automation Hub' },
     { path: '/automation/dashboard', component: AutomationHub, label: 'Automation Hub Dashboard' },
     { path: '/automation/builder', component: AutomationHub, label: 'Automation Hub Builder' },
     { path: '/automation/integrations', component: AutomationHub, label: 'Automation Hub Integrations' },
     { path: '/automation/templates', component: AutomationHub, label: 'Automation Hub Templates' },
     { path: '/automation/logs', component: AutomationHub, label: 'Automation Hub Logs' },
     { path: '/automation/tasks', component: AutomationHub, label: 'Automation Hub Tasks' },
     { path: '/automation/learn', component: AutomationHub, label: 'Automation Hub Learning' },
   ],

  sidebarItems: [
    { id: 'auto-hub', label: 'Automation Hub', href: '/automation/dashboard', icon: 'Zap', sequence: 40 },
    { id: 'auto-build', label: 'Workflow Builder', href: '/automation/builder', icon: 'GitBranch', parentId: 'auto-hub', sequence: 41 },
    { id: 'auto-tmpl', label: 'Templates', href: '/automation/templates', icon: 'Layout', parentId: 'auto-hub', sequence: 42 },
    { id: 'auto-intg', label: 'Integrations', href: '/automation/integrations', icon: 'Plug', parentId: 'auto-hub', sequence: 43 },
    { id: 'auto-tasks', label: 'Tasks', href: '/automation/tasks', icon: 'ListTodo', parentId: 'auto-hub', sequence: 44 },
    { id: 'auto-logs', label: 'Logs', href: '/automation/logs', icon: 'History', parentId: 'auto-hub', sequence: 45 },
    { id: 'auto-learn', label: 'Learning Center', href: '/automation/learn', icon: 'GraduationCap', parentId: 'auto-hub', sequence: 46 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const ContentStudioModuleManifest: ModuleManifest = {
  id: 'content-studio',
  name: 'Content Studio',
  version: '1.1.0',
  description: 'AI-powered content generation tools.',
  icon: 'PenTool',
  color: '#ec4899',
  category: 'ai-tools',
  depends: [],
  requiredTier: 'free',
  isCore: false,
  routes: [
    { path: '/content', component: ContentStudio },
    { path: '/content/calendar', component: ContentCalendar },
    { path: '/content/blog', component: BlogWriter },
    { path: '/content/video-script', component: VideoScript },
    { path: '/content/email', component: EmailCampaign },
    { path: '/content/captions', component: CaptionGenerator },
  ],
  sidebarItems: [
    { id: 'cnt-hub', label: 'Content Hub', href: '/content', icon: 'PenTool', sequence: 50 },
    { id: 'cnt-cal', label: 'Calendar', href: '/content/calendar', icon: 'Calendar', parentId: 'cnt-hub', sequence: 51 },
    { id: 'cnt-blog', label: 'Blog Writer', href: '/content/blog', icon: 'BookOpen', parentId: 'cnt-hub', sequence: 52 },
    { id: 'cnt-vid', label: 'Video Script', href: '/content/video-script', icon: 'Video', parentId: 'cnt-hub', sequence: 53 },
    { id: 'cnt-email', label: 'Email Campaign', href: '/content/email', icon: 'Mail', parentId: 'cnt-hub', sequence: 54 },
    { id: 'cnt-cap', label: 'Captions', href: '/content/captions', icon: 'Type', parentId: 'cnt-hub', sequence: 55 },
    { id: 'cnt-post', label: 'Post Generator', href: '/content/post-generator', icon: 'PenSquare', parentId: 'cnt-hub', sequence: 56 },
    { id: 'cnt-ad', label: 'Ad Copy Creator', href: '/content/ad-copy', icon: 'Megaphone', parentId: 'cnt-hub', sequence: 57 },
    { id: 'cnt-prod', label: 'Product Writer', href: '/content/product-description', icon: 'Package', parentId: 'cnt-hub', sequence: 58 },
    { id: 'cnt-sales', label: 'Sales Scripts', href: '/content/sales-scripts', icon: 'MessageSquare', parentId: 'cnt-hub', sequence: 59 },
    { id: 'cnt-library', label: 'Content Library', href: '/content/assets', icon: 'Library', parentId: 'cnt-hub', sequence: 60 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const SupportModuleManifest: ModuleManifest = {
  id: 'support',
  name: 'Customer Support',
  version: '1.0.0',
  description: 'AI customer support assistants.',
  icon: 'LifeBuoy',
  color: '#14b8a6',
  category: 'ai-tools',
  depends: [],
  requiredTier: 'free',
  isCore: false,
  routes: [
    { path: '/support', component: SupportLanding },
    { path: '/support/reply-generator', component: ReplyGenerator },
    { path: '/support/objections', component: ObjectionHandler },
    { path: '/support/faq', component: FaqBuilder },
    { path: '/support/simulator', component: ConversationSimulator },
    { path: '/support/complaints', component: ComplaintResolver },
  ],
  sidebarItems: [
    { id: 'sup-hub', label: 'Support Hub', href: '/support', icon: 'LifeBuoy', sequence: 60 },
    { id: 'sup-reply', label: 'Reply Generator', href: '/support/reply-generator', icon: 'MessageCircle', parentId: 'sup-hub', sequence: 61 },
    { id: 'sup-obj', label: 'Objections', href: '/support/objections', icon: 'Shield', parentId: 'sup-hub', sequence: 62 },
    { id: 'sup-faq', label: 'FAQ Builder', href: '/support/faq', icon: 'HelpCircle', parentId: 'sup-hub', sequence: 63 },
    { id: 'sup-sim', label: 'Simulator', href: '/support/simulator', icon: 'Users', parentId: 'sup-hub', sequence: 64 },
    { id: 'sup-comp', label: 'Complaints', href: '/support/complaints', icon: 'AlertTriangle', parentId: 'sup-hub', sequence: 65 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const StrategyModuleManifest: ModuleManifest = {
  id: 'strategy',
  name: 'Digital Strategy',
  version: '1.0.0',
  description: 'Digital growth and analysis strategies.',
  icon: 'Target',
  color: '#8b5cf6',
  category: 'ai-tools',
  depends: [],
  requiredTier: 'pro',
  isCore: false,
  routes: [
    { path: '/strategy', component: StrategyLanding },
    { path: '/strategy/go-digital', component: GoDigitalGuide },
    { path: '/strategy/website-audit', component: WebsiteAuditor },
    { path: '/strategy/funnel', component: FunnelBuilder },
    { path: '/strategy/lead-gen', component: LeadGenPlanner },
    { path: '/strategy/competitors', component: CompetitorAnalysis },
  ],
  sidebarItems: [
    { id: 'str-hub', label: 'Strategy Hub', href: '/strategy', icon: 'Target', sequence: 70 },
    { id: 'str-dig', label: 'Go Digital Guide', href: '/strategy/go-digital', icon: 'Globe', parentId: 'str-hub', sequence: 71 },
    { id: 'str-audit', label: 'Website Audit', href: '/strategy/website-audit', icon: 'Search', parentId: 'str-hub', sequence: 72 },
    { id: 'str-funnel', label: 'Funnel Builder', href: '/strategy/funnel', icon: 'Filter', parentId: 'str-hub', sequence: 73 },
    { id: 'str-lead', label: 'Lead Gen', href: '/strategy/lead-gen', icon: 'UserPlus', parentId: 'str-hub', sequence: 74 },
    { id: 'str-comp', label: 'Competitors', href: '/strategy/competitors', icon: 'Eye', parentId: 'str-hub', sequence: 75 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

export const SettingsModuleManifest: ModuleManifest = {
  id: 'settings',
  name: 'Settings',
  version: '1.0.0',
  description: 'App configuration and settings.',
  icon: 'Settings',
  color: '#71717a',
  category: 'system',
  depends: [],
  requiredTier: 'free',
  isCore: true,
  routes: [
    { path: '/settings', component: SettingsLanding },
    { path: '/settings/profile', component: ProfileSettings },
    { path: '/settings/business', component: BusinessProfile },
    { path: '/settings/language', component: LanguageRegion },
    { path: '/settings/notifications', component: Notifications },
    { path: '/settings/connected-accounts', component: ConnectedAccounts },
    { path: '/settings/billing', component: SubscriptionBilling },
    { path: '/settings/privacy', component: PrivacySecurity },
  ],
  sidebarItems: [
    { id: 'set-hub', label: 'Settings', href: '/settings', icon: 'Settings', sequence: 200 },
  ],
  models: [],
  views: [],
  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
};

// ─── All Existing Manifests ────────────────────────────────

export const existingModuleManifests: ModuleManifest[] = [
  DashboardManifest,
  AppStoreManifest,
  CoreChatModuleManifest,
  BusinessAdvisoryModuleManifest,
  MarketingModuleManifest,
  AutomationModuleManifest,
  ContentManifest,
  SupportModuleManifest,
  StrategyModuleManifest,
  SettingsModuleManifest,
];
