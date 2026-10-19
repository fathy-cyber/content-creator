import React, { useState } from 'react';
import { motion } from 'motion/react';
import SocialAccountsManager from './accounts/SocialAccountsManager';
import PostComposer from './publisher/PostComposer';
import ApprovalQueue from './publisher/ApprovalQueue';
import PublishCalendar from './publisher/PublishCalendar';
import PublishJobMonitor from './publisher/PublishJobMonitor';
import PostAnalyticsDashboard from './analytics/PostAnalyticsDashboard';

export default function SocialDashboard() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'composer' | 'queue' | 'calendar' | 'monitor' | 'analytics'>('queue');

  const tabs = [
    { id: 'accounts', label: 'Accounts', component: <SocialAccountsManager /> },
    { id: 'composer', label: 'Composer', component: <PostComposer /> },
    { id: 'queue', label: 'Approval Queue', component: <ApprovalQueue /> },
    { id: 'calendar', label: 'Calendar', component: <PublishCalendar /> },
    { id: 'monitor', label: 'Job Monitor', component: <PublishJobMonitor /> },
    { id: 'analytics', label: 'Analytics', component: <PostAnalyticsDashboard /> },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Social Media Publisher</h1>
          <p className="text-zinc-500">Manage your cross-platform content distribution.</p>
        </div>
      </div>

      <div className="flex border-b border-zinc-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-3 text-sm font-semibold transition-all border-b-2",
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-600 bg-emerald-50/30" 
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tabs.find(t => t.id === activeTab)?.component}
        </motion.div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
