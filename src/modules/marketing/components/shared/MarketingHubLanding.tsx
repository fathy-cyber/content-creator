import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Mail, 
  Share2, 
  Target, 
  DollarSign, 
  Calendar, 
  BarChart3 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HubCard = ({ title, description, icon: Icon, href, color }) => (
  <Link 
    to={href} 
    className="group p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col h-full"
  >
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
      color
    )}>
      <Icon size={24} className="text-white" />
    </div>
    <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed mb-6 flex-1">{description}</p>
    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-blue-600 transition-colors uppercase tracking-wider">
      Explore Module
    </div>
  </Link>
);

export default function MarketingHubLanding() {
  const modules = [
    {
      title: 'Campaign Manager',
      description: 'Plan, execute, and track multi-channel marketing campaigns and ROI.',
      icon: TrendingUp,
      href: '/marketing/campaigns',
      color: 'bg-blue-500',
    },
    {
      title: 'Email Marketing',
      description: 'Segmentation, automation, and high-deliverability email campaigns.',
      icon: Mail,
      href: '/marketing/email',
      color: 'bg-indigo-500',
    },
    {
      title: 'Social Media Manager',
      description: 'Multi-platform scheduling, listening, and unified social inbox.',
      icon: Share2,
      href: '/marketing/social',
      color: 'bg-pink-500',
    },
    {
      title: 'Lead Generation',
      description: 'Build forms, landing pages, and capture high-quality leads.',
      icon: Target,
      href: '/marketing/leads',
      color: 'bg-orange-500',
    },
    {
      title: 'Ads Manager',
      description: 'Track and optimize Google, Meta, LinkedIn, and TikTok ads.',
      icon: DollarSign,
      href: '/marketing/ads',
      color: 'bg-emerald-500',
    },
    {
      title: 'Events & Webinars',
      description: 'Manage online/offline events and webinar attendance.',
      icon: Calendar,
      href: '/marketing/events',
      color: 'bg-purple-500',
    },
    {
      title: 'Marketing Analytics',
      description: 'Unified dashboard for multi-channel attribution and ROI.',
      icon: BarChart3,
      href: '/marketing/analytics',
      color: 'bg-zinc-700',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Marketing Hub</h1>
        <p className="text-zinc-500 mt-1">Plan, execute, track and optimize all marketing activities.</p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {modules.map((module, idx) => (
           <HubCard key={idx} {...(module as any)} />
         ))}
       </div>

    </div>
  );
}
