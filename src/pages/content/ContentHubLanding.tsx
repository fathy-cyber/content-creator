import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PenTool, 
  Calendar, 
  FolderOpen, 
  Globe, 
  Share2, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Layout,
  Package,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HubCardProps {
  key?: any;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const HubCard = ({ title, description, icon: Icon, href, color }: HubCardProps) => (
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
    <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-emerald-600 transition-colors">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed mb-6 flex-1">{description}</p>
    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">
      Explore <ArrowRight size={14} />
    </div>
  </Link>
);

export default function ContentHubLanding() {
  const modules = [
    {
      title: 'Content Creation Studio',
      description: 'Professional rich text editor, AI writing assistant, and templates for all formats.',
      icon: PenTool,
      href: '/content/studio',
      color: 'bg-pink-500',
    },
    {
      title: 'Content Calendar',
      description: 'Visual scheduling, pipeline management, and team collaboration for your content.',
      icon: Calendar,
      href: '/content/calendar',
      color: 'bg-blue-500',
    },
    {
      title: 'Digital Asset Manager',
      description: 'Centralized library for images, videos, brand assets, and client files.',
      icon: FolderOpen,
      href: '/content/dam',
      color: 'bg-amber-500',
    },
    {
      title: 'Website & Blog Manager',
      description: 'Manage multi-blogs, SEO optimization, and landing page performance.',
      icon: Globe,
      href: '/content/website',
      color: 'bg-emerald-500',
    },
    {
      title: 'Social Media Manager',
      description: 'Multi-platform composer, recycling tools, and engagement analytics.',
      icon: Share2,
      href: '/content/social',
      color: 'bg-indigo-500',
    },
    {
      title: 'Knowledge Base',
      description: 'Internal wiki, client documentation, and AI-powered search.',
      icon: BookOpen,
      href: '/content/kb',
      color: 'bg-zinc-700',
    },
    {
      title: 'AI Post Generator',
      description: 'Generate high-impact social posts and ad copy in seconds using AI.',
      icon: Sparkles,
      href: '/content/post-generator',
      color: 'bg-purple-500',
    },
    {
      title: 'Ad Copy Creator',
      description: 'Professional ad headlines and body copy for Meta and Google Ads.',
      icon: Layout,
      href: '/content/ad-copy',
      color: 'bg-orange-500',
    },
    {
      title: 'Product Writer',
      description: 'AI-powered product descriptions and feature lists.',
      icon: Package,
      href: '/content/product-description',
      color: 'bg-blue-400',
    },
    {
      title: 'Sales Scripts',
      description: 'High-converting scripts for sales calls and outreach.',
      icon: MessageSquare,
      href: '/content/sales-scripts',
      color: 'bg-emerald-400',
    },
    {
      title: 'Content Library',
      description: 'Browse and manage all your generated marketing assets.',
      icon: FolderOpen,
      href: '/content/assets',
      color: 'bg-slate-500',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Content Hub</h1>
        <p className="text-zinc-500 mt-1">Create, manage, organize and distribute all your content from one place.</p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {modules.map((module, idx) => (
           <HubCard key={idx} {...(module as any)} />
         ))}
       </div>
    </div>
  );
}
