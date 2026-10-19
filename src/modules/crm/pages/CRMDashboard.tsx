/**
 * CRM Dashboard — Overview of contacts, leads, and pipeline health.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, TrendingUp, DollarSign, Target,
  ArrowUpRight, ArrowDownRight, Plus, Activity
} from 'lucide-react';
import { motion } from 'motion/react';

// Demo data
const stats = [
  { label: 'Total Contacts', value: '1,247', change: '+12%', icon: Users, color: 'bg-indigo-50 text-indigo-600', trend: 'up' },
  { label: 'Active Leads', value: '89', change: '+23%', icon: UserPlus, color: 'bg-emerald-50 text-emerald-600', trend: 'up' },
  { label: 'Pipeline Value', value: '145,000 TND', change: '+8%', icon: DollarSign, color: 'bg-amber-50 text-amber-600', trend: 'up' },
  { label: 'Win Rate', value: '34%', change: '-2%', icon: Target, color: 'bg-rose-50 text-rose-600', trend: 'down' },
];

const recentActivities = [
  { id: 1, type: 'call', summary: 'Called Ahmed Ben Ali about pricing', time: '2 hours ago', contact: 'Ahmed Ben Ali' },
  { id: 2, type: 'email', summary: 'Sent proposal to Café Délice', time: '4 hours ago', contact: 'Café Délice' },
  { id: 3, type: 'meeting', summary: 'Meeting with Tunisie Telecom team', time: 'Yesterday', contact: 'Tunisie Telecom' },
  { id: 4, type: 'whatsapp', summary: 'Follow-up message to Fatma Souissi', time: 'Yesterday', contact: 'Fatma Souissi' },
  { id: 5, type: 'note', summary: 'Updated deal terms for Carrefour', time: '2 days ago', contact: 'Carrefour Tunisia' },
];

const pipelineStages = [
  { stage: 'New', count: 23, value: '34,500 TND', color: 'bg-blue-500' },
  { stage: 'Qualified', count: 18, value: '42,000 TND', color: 'bg-indigo-500' },
  { stage: 'Proposition', count: 12, value: '28,000 TND', color: 'bg-violet-500' },
  { stage: 'Negotiation', count: 8, value: '24,500 TND', color: 'bg-amber-500' },
  { stage: 'Won', count: 28, value: '16,000 TND', color: 'bg-emerald-500' },
];

const activityIcons: Record<string, string> = {
  call: '📞', email: '📧', meeting: '🤝', whatsapp: '💬', note: '📝', task: '✅',
};

export default function CRMDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic text-zinc-900 font-serif tracking-tight">
            CRM
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-bold">
            Manage your customer relationships and sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/crm/contacts/new')}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-black italic hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-black text-zinc-900 italic tracking-tight">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black italic text-zinc-900 font-serif uppercase tracking-wide">
              Pipeline Overview
            </h2>
            <button
              onClick={() => navigate('/crm/leads')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View Pipeline →
            </button>
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage, idx) => {
              const maxCount = Math.max(...pipelineStages.map(s => s.count));
              const widthPercent = (stage.count / maxCount) * 100;
              return (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-24 text-xs font-bold text-zinc-600 shrink-0">{stage.stage}</div>
                  <div className="flex-1 h-8 bg-zinc-50 rounded-xl overflow-hidden relative">
                    <motion.div
                      className={`h-full rounded-xl ${stage.color} flex items-center px-3`}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: idx * 0.08 + 0.3, duration: 0.5 }}
                    >
                      <span className="text-[10px] font-black text-white">{stage.count}</span>
                    </motion.div>
                  </div>
                  <div className="w-28 text-right text-xs font-bold text-zinc-500 shrink-0">{stage.value}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black italic text-zinc-900 font-serif uppercase tracking-wide">
              Recent Activity
            </h2>
            <Activity className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-sm shrink-0">
                  {activityIcons[activity.type] || '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-700 truncate">{activity.summary}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{activity.contact} · {activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'All Contacts', icon: Users, href: '/crm/contacts', color: 'from-indigo-500 to-indigo-600' },
          { label: 'Leads Pipeline', icon: UserPlus, href: '/crm/leads', color: 'from-violet-500 to-violet-600' },
          { label: 'New Contact', icon: Plus, href: '/crm/contacts/new', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Reports', icon: TrendingUp, href: '/crm', color: 'from-amber-500 to-amber-600' },
        ].map((action, idx) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 + 0.5 }}
            onClick={() => navigate(action.href)}
            className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-sm hover:shadow-md transition-all group text-left active:scale-95"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-zinc-900 italic">{action.label}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
