import React from 'react';
import { motion } from 'motion/react';
import {
  Megaphone, MessageCircle,
  Calendar, ArrowRight, TrendingUp, Sparkles, Activity,
  Users, Search, Layout, Hash, MessageSquareQuote,
  Target, FlaskConical, BrainCircuit, ClipboardList,
  Calculator, BarChart3, DollarSign, Share2, Mail,
  Filter, Funnel
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MARKETING_TOOLS = [
  {
    id: 'persona',
    title: 'ICP Builder',
    desc: 'Define your ideal customer profile with AI-powered audience insights.',
    icon: Users,
    color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    path: '/marketing/persona'
  },
  {
    id: 'competitor',
    title: 'Competitor Spy',
    desc: 'Research the competitive landscape and uncover market opportunities.',
    icon: Search,
    color: 'bg-red-50 text-red-600 group-hover:bg-red-100',
    path: '/marketing/competitor'
  },
  {
    id: 'landing',
    title: 'Landing Page Writer',
    desc: 'Create high-converting landing page copy with AI assistance.',
    icon: Layout,
    color: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
    path: '/marketing/landing-page'
  },
  {
    id: 'seo',
    title: 'SEO Meta Generator',
    desc: 'Optimize pages for search discovery with meta tags and keywords.',
    icon: Hash,
    color: 'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100',
    path: '/marketing/seo'
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Templates',
    desc: 'Professional templates for sales, support, and follow-ups on WhatsApp.',
    icon: MessageCircle,
    color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    path: '/marketing/whatsapp-templates'
  },
  {
    id: 'ugc',
    title: 'UGC Curator',
    desc: 'Collect, approve, and showcase user-generated content and reviews.',
    icon: MessageSquareQuote,
    color: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100',
    path: '/marketing/ugc'
  },
  {
    id: 'conversion',
    title: 'Conversion Optimizer',
    desc: 'Analyze your landing page copy and get tips to increase sales.',
    icon: Target,
    color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
    path: '/marketing/conversion'
  },
  {
    id: 'abtest',
    title: 'A/B Test Designer',
    desc: 'Validate changes with experiments and data-driven decisions.',
    icon: FlaskConical,
    color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    path: '/marketing/ab-test'
  },
  {
    id: 'lead-scoring',
    title: 'Lead Scoring Workbench',
    desc: 'Qualify incoming leads automatically with AI scoring rules.',
    icon: BrainCircuit,
    color: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
    path: '/marketing/lead-scoring'
  },
  {
    id: 'campaigns',
    title: 'Campaign Manager',
    desc: 'Plan and execute multi-channel marketing campaigns.',
    icon: Calendar,
    color: 'bg-sky-50 text-sky-600 group-hover:bg-sky-100',
    path: '/marketing/campaigns'
  },
  {
    id: 'campaign-planner',
    title: 'Campaign Planner',
    desc: 'Plan your multi-channel marketing campaigns step-by-step.',
    icon: ClipboardList,
    color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
    path: '/marketing/campaign-planner'
  },
  {
    id: 'roi',
    title: 'ROI Calculator',
    desc: 'Model and measure returns on your marketing investments.',
    icon: Calculator,
    color: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
    path: '/marketing/roi-calculator'
  },
  {
    id: 'analytics',
    title: 'Marketing Analytics',
    desc: 'Unified dashboard for multi-channel attribution and performance.',
    icon: BarChart3,
    color: 'bg-zinc-50 text-zinc-600 group-hover:bg-zinc-100',
    path: '/marketing/analytics'
  },
  {
    id: 'ads',
    title: 'Ads Manager',
    desc: 'Track and optimize Google, Meta, LinkedIn, and TikTok ads.',
    icon: DollarSign,
    color: 'bg-lime-50 text-lime-600 group-hover:bg-lime-100',
    path: '/marketing/ads'
  },
  {
    id: 'social',
    title: 'Social Media Manager',
    desc: 'Multi-platform scheduling, listening, and unified social inbox.',
    icon: Share2,
    color: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
    path: '/marketing/social'
  },
  {
    id: 'email',
    title: 'Email Marketing',
    desc: 'Segmentation, automation, and high-deliverability email campaigns.',
    icon: Mail,
    color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    path: '/marketing/email'
  },
  {
    id: 'audience',
    title: 'Audience Segmentation',
    desc: 'Build targeted segments based on behavior, demographics, and more.',
    icon: Filter,
    color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    path: '/marketing/leads'
  },
  {
    id: 'funnel',
    title: 'Funnel Builder',
    desc: 'Design and optimize your sales funnel for maximum conversions.',
    icon: Funnel,
    color: 'bg-stone-50 text-stone-600 group-hover:bg-stone-100',
    path: '/marketing/funnel'
  }
];

export default function MarketingLanding() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" /> AI Marketing Hub
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Create content that converts.
          </h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-xl">
            From social media posts to ad copy and WhatsApp campaigns, Ayech AI helps you launch full-scale marketing efforts in minutes, not days.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/marketing/campaigns" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Manage Campaigns
            </Link>
            <Link to="/marketing/campaign-planner" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 backdrop-blur-md">
              <Calendar className="w-5 h-5" /> New Campaign
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-emerald-500" />
            Marketing Tools Toolkit
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MARKETING_TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                key={tool.id}
              >
                <Link to={tool.path} className="group block h-full bg-white border border-zinc-200 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-zinc-200/50 hover:border-zinc-300 relative overflow-hidden">
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors ${tool.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {tool.desc}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-semibold text-zinc-400 group-hover:text-emerald-600 transition-colors">
                    Open Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Metrics Mock */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 mt-4 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" /> Recent Campaign Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                <th className="pb-3 px-4 font-semibold">Campaign Name</th>
                <th className="pb-3 px-4 font-semibold">Platform</th>
                <th className="pb-3 px-4 font-semibold">Status</th>
                <th className="pb-3 px-4 font-semibold text-right">Reach</th>
                <th className="pb-3 px-4 font-semibold text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-4 font-medium text-zinc-900">Ramadan Special Offer Promo</td>
                <td className="py-4 px-4 text-zinc-600">Facebook Ads</td>
                <td className="py-4 px-4"><span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-semibold">Active</span></td>
                <td className="py-4 px-4 text-right font-mono font-semibold text-zinc-700">12,450</td>
                <td className="py-4 px-4 text-right text-emerald-600 font-semibold">+4.2%</td>
              </tr>
              <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-4 font-medium text-zinc-900">New Collection Announcement</td>
                <td className="py-4 px-4 text-zinc-600">Instagram / Organic</td>
                <td className="py-4 px-4"><span className="bg-zinc-100 text-zinc-600 text-xs px-2 py-1 rounded font-semibold">Scheduled</span></td>
                <td className="py-4 px-4 text-right font-mono font-semibold text-zinc-500">--</td>
                <td className="py-4 px-4 text-right text-zinc-400 font-semibold">--</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-4 font-medium text-zinc-900">Spring Clean Service Promo</td>
                <td className="py-4 px-4 text-zinc-600">WhatsApp List</td>
                <td className="py-4 px-4"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold">Completed</span></td>
                <td className="py-4 px-4 text-right font-mono font-semibold text-zinc-700">850</td>
                <td className="py-4 px-4 text-right text-emerald-600 font-semibold text-lg hover:text-emerald-700"><Activity className="w-5 h-5 ml-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
