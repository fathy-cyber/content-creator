import React from 'react';
import { 
  MessageSquare, PenTool, TrendingUp, LayoutDashboard, ShoppingBag, 
  Megaphone, Zap, LifeBuoy, Target, Settings, Users, DollarSign, 
  CheckCircle2, ListTodo, Banknote
} from 'lucide-react';
import { AppManifest } from './types';
import { ModuleManifest } from '../core/types/ModuleManifest';
import { InvoiceManifest } from './invoice/manifest';
import { BillingManifest } from './billing/manifest';

export const CoreChatManifest: AppManifest = {



  id: 'core-chat',
  name: 'Ask Ayech',
  icon: <MessageSquare className="w-5 h-5" />,
  description: 'Core AI Chat assistant for business queries.',
  version: '1.0.0',
  isCore: true,
  sidebarLinks: [
    { label: 'Ask Ayech', href: '/chat', icon: <MessageSquare className="w-4 h-4" /> }
  ],
  dashboardWidgets: []
};

export const BusinessAdvisoryManifest: AppManifest = {
  id: 'business-advisory',
  name: 'Business Advisory',
  icon: <TrendingUp className="w-5 h-5" />,
  description: 'Financial planning and profit calculation tools.',
  version: '1.0.5',
  sidebarLinks: [
    { label: 'Advisory Hub', href: '/business', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Idea Validator', href: '/business/idea-validator', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Pricing Strategy', href: '/business/pricing', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Profit Calculator', href: '/business/calculator', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Business Plan', href: '/business/plan', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Market Analysis', href: '/business/market-analysis', icon: <TrendingUp className="w-4 h-4" /> }
  ],
  dashboardWidgets: []
};

export const MarketingManifest: AppManifest = {
  id: 'marketing',
  name: 'Marketing & Sales',
  icon: <Megaphone className="w-5 h-5" />,
  description: 'Marketing tools and sales scripts.',
  version: '1.0.0',
  sidebarLinks: [
    { label: 'Marketing Hub', href: '/marketing', icon: <Megaphone className="w-4 h-4" /> },
    { label: 'WhatsApp Templates', href: '/marketing/whatsapp-templates', icon: <Megaphone className="w-4 h-4" /> },
    { label: 'Campaign', href: '/marketing/campaigns', icon: <Megaphone className="w-4 h-4" /> },
    { label: 'Conversion', href: '/marketing/conversion', icon: <Megaphone className="w-4 h-4" /> }
  ],
  dashboardWidgets: []
};

export const AutomationManifest: AppManifest = {
  id: 'automation',
  name: 'Automation Hub',
  icon: <Zap className="w-5 h-5" />,
  description: 'Automate business workflows easily.',
  version: '1.0.0',
  sidebarLinks: [
    { label: 'Automation Hub', href: '/automation', icon: <Zap className="w-4 h-4" /> },
    { label: 'Workflow Builder', href: '/automation/builder', icon: <Zap className="w-4 h-4" /> },
    { label: 'CRM & Sales', href: '/automation/crm-sales', icon: <Users className="w-4 h-4" /> },
    { label: 'Marketing', href: '/automation/marketing', icon: <Zap className="w-4 h-4" /> },
    { label: 'Tasks & Projects', href: '/automation/tasks', icon: <ListTodo className="w-4 h-4" /> },
    { label: 'Finance', href: '/automation/finance', icon: <Banknote className="w-4 h-4" /> },
    { label: 'Integrations', href: '/automation/integrations', icon: <Zap className="w-4 h-4" /> },
    { label: 'Dashboard', href: '/automation/dashboard', icon: <Zap className="w-4 h-4" /> },
    { label: 'Template Library', href: '/automation/templates', icon: <Zap className="w-4 h-4" /> },
    { label: 'Learning Center', href: '/automation/learn', icon: <Zap className="w-4 h-4" /> }
  ],
  dashboardWidgets: []
};

export const ContentHubManifest: AppManifest = {
  id: 'content',
  name: 'Content Hub',
  icon: <PenTool className="w-5 h-5" />,
  description: 'AI-powered content generation and management.',
  version: '1.0.0',
  sidebarLinks: [
    { label: 'Content Hub', href: '/content', icon: <PenTool className="w-4 h-4" /> },
    { label: 'Studio', href: '/content/studio', icon: <PenTool className="w-4 h-4" /> },
    { label: 'Calendar', href: '/content/calendar', icon: <PenTool className="w-4 h-4" /> },
    { label: 'Post Generator', href: '/content/post-generator', icon: <PenTool className="w-4 h-4" /> },
    { label: 'Ad Copy Creator', href: '/content/ad-copy', icon: <PenTool className="w-4 h-4" /> },
    { label: 'Product Writer', href: '/content/product-description', icon: <PenTool className="w-4 h-4" /> },
    { label: 'Sales Scripts', href: '/content/sales-scripts', icon: <PenTool className="w-4 h-4" /> },
    { label: 'Content Library', href: '/content/assets', icon: <PenTool className="w-4 h-4" /> },
  ],
  dashboardWidgets: []
};

export const SupportManifest: AppManifest = {
  id: 'support',
  name: 'Customer Support',
  icon: <LifeBuoy className="w-5 h-5" />,
  description: 'AI customer support assistants.',
  version: '1.0.0',
  sidebarLinks: [
    { label: 'Support Hub', href: '/support', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'Reply Generator', href: '/support/reply-generator', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'Objections', href: '/support/objections', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'FAQ Builder', href: '/support/faq', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'Simulator', href: '/support/simulator', icon: <LifeBuoy className="w-4 h-4" /> },
    { label: 'Complaints', href: '/support/complaints', icon: <LifeBuoy className="w-4 h-4" /> }
  ],
  dashboardWidgets: []
};

export const StrategyManifest: AppManifest = {
  id: 'strategy',
  name: 'Digital Strategy',
  icon: <Target className="w-5 h-5" />,
  description: 'Digital growth and analysis strategies.',
  version: '1.0.0',
  sidebarLinks: [
    { label: 'Strategy Hub', href: '/strategy', icon: <Target className="w-4 h-4" /> },
    { label: 'Go Digital Guide', href: '/strategy/go-digital', icon: <Target className="w-4 h-4" /> },
    { label: 'Website Audit', href: '/strategy/website-audit', icon: <Target className="w-4 h-4" /> },
    { label: 'Funnel Builder', href: '/strategy/funnel', icon: <Target className="w-4 h-4" /> },
    { label: 'Lead Gen', href: '/strategy/lead-gen', icon: <Target className="w-4 h-4" /> },
    { label: 'Competitors', href: '/strategy/competitors', icon: <Target className="w-4 h-4" /> }
  ],
  dashboardWidgets: []
};

export const SettingsManifest: AppManifest = {
  id: 'settings',
  name: 'Settings',
  icon: <Settings className="w-5 h-5" />,
  description: 'App configuration and settings.',
  version: '1.0.0',
  sidebarLinks: [
    { label: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    { label: 'Profile', href: '/settings/profile', icon: <Settings className="w-4 h-4" /> },
    { label: 'Business', href: '/settings/business', icon: <Settings className="w-4 h-4" /> },
    { label: 'Language', href: '/settings/language', icon: <Settings className="w-4 h-4" /> },
    { label: 'Notifications', href: '/settings/notifications', icon: <Settings className="w-4 h-4" /> },
    { label: 'Accounts', href: '/settings/connected-accounts', icon: <Settings className="w-4 h-4" /> },
    { label: 'Billing', href: '/settings/billing', icon: <Settings className="w-4 h-4" /> },
    { label: 'Privacy', href: '/settings/privacy', icon: <Settings className="w-4 h-4" /> }
  ],
  dashboardWidgets: []
};

export const ModuleRegistry: (AppManifest | ModuleManifest)[] = [
  CoreChatManifest,
  BusinessAdvisoryManifest,
  MarketingManifest,
  AutomationManifest,
  ContentHubManifest,
  SupportManifest,
  StrategyManifest,
  SettingsManifest,
  InvoiceManifest,
  BillingManifest,
];
