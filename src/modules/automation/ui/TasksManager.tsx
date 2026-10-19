'use client';

import React, { useState, useEffect } from 'react';
import cron from 'cron-parser';
import { 
  Plus, 
  Search, 
  Trash2, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { tasksApi } from '../api/tasks.api';
import { cn } from '../../../lib/utils';

interface ScheduledJob {
  id: string;
  workflowId: string;
  workflow?: { name: string };
  cron: string | null;
  nextRun: Date;
  status: string;
  payload: any;
  createdAt: Date;
}

interface Alert {
  id: string;
  recipientId: string;
  channel: string;
  payload: any;
  status: string;
  createdAt: Date;
}

export default function TasksManager() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    workflowId: '',
    cron: '* * * * *',
    payload: '{}',
  });
  const [cronPreview, setCronPreview] = useState('');
  const [cronError, setCronError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    validateCron(formData.cron);
  }, [formData.cron]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [jobsRes, alertsRes, workflowsRes] = await Promise.all([
        tasksApi.getJobs(),
        tasksApi.getAlerts(),
        tasksApi.getWorkflows(),
      ]);

      if ('error' in jobsRes) throw new Error(jobsRes.error);
      if ('error' in alertsRes) throw new Error(alertsRes.error);
      if ('error' in workflowsRes) throw new Error(workflowsRes.error);

      setJobs(jobsRes as ScheduledJob[]);
      setAlerts(alertsRes as Alert[]);
      setWorkflows(workflowsRes as { id: string; name: string }[]);
    } catch (error: any) {
      toast.error(`Failed to load data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  function validateCron(cronString: string) {
    try {
      const interval = cron.parse(cronString);
      setCronPreview(interval.next().toDate().toLocaleString());
      setCronError('');
    } catch (e: any) {
      setCronPreview('');
      setCronError(e.message || 'Invalid cron expression');
    }
  }

  async function handleScheduleJob(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await tasksApi.scheduleJob({
        workflowId: formData.workflowId,
        cron: formData.cron,
        payload: JSON.parse(formData.payload),
      });

      if ('error' in res) throw new Error(res.error);

      toast.success('Job scheduled successfully');
      setIsModalOpen(false);
      setFormData({ workflowId: '', cron: '* * * * *', payload: '{}' });
      await fetchData();
    } catch (error: any) {
      toast.error(`Scheduling failed: ${error.message || 'Unknown error'}`);
    }
  }

  async function handleCancelJob(id: string) {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    try {
      const res = await tasksApi.cancelJob(id);
      if ('error' in res) throw new Error(res.error);
      toast.success('Job cancelled');
      await fetchData();
    } catch (error: any) {
      toast.error(`Cancellation failed: ${error.message || 'Unknown error'}`);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      const res = await tasksApi.markAlertRead(id);
      if ('error' in res) throw new Error(res.error);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'READ' } : a));
    } catch (error: any) {
      toast.error(`Failed to mark as read: ${error.message || 'Unknown error'}`);
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await tasksApi.markAllAlertsRead();
      if ('error' in res) throw new Error(res.error);
      setAlerts(prev => prev.map(a => ({ ...a, status: 'READ' })));
      toast.success('All alerts marked as read');
    } catch (error: any) {
      toast.error(`Failed to mark all as read: ${error.message || 'Unknown error'}`);
    }
  }

  const filteredJobs = jobs.filter(job => 
    job.workflow?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.cron?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mr-3"></div>
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Task Scheduler</h1>
          <p className="text-zinc-500 text-sm">Manage and monitor your automated workflow schedules.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Schedule New Job
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Table Section */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search jobs by name or cron..." 
                  className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all border border-zinc-200">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Job Name</th>
                    <th className="px-6 py-3 font-semibold">Cron Expression</th>
                    <th className="px-6 py-3 font-semibold">Next Run</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-zinc-900">
                          {job.workflow?.name || 'Unknown Workflow'}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">{job.id}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-600">
                        {job.cron || 'Once'}
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {new Date(job.nextRun).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          job.status === 'PENDING' ? "bg-blue-100 text-blue-700" : 
                          job.status === 'COMPLETED' ? "bg-green-100 text-green-700" : 
                          "bg-zinc-100 text-zinc-600"
                        )}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleCancelJob(job.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No scheduled jobs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts Center */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col h-full max-h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Bell className="w-4 h-4 text-indigo-600" />
                Alerts Center
              </div>
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-all"
              >
                Mark all read
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={cn(
                    "p-3 rounded-lg border transition-all group",
                    alert.status === 'UNSENT' 
                      ? "bg-amber-50 border-amber-100" 
                      : "bg-zinc-50 border-zinc-100 opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        alert.status === 'UNSENT' ? "bg-amber-200 text-amber-700" : "bg-zinc-200 text-zinc-500"
                      )}>
                        {alert.status === 'UNSENT' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 leading-tight">
                          {alert.payload?.message || 'System Notification'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                          <span className="uppercase font-bold">{alert.channel}</span>
                          <span>•</span>
                          <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    {alert.status === 'UNSENT' && (
                      <button 
                        onClick={() => handleMarkRead(alert.id)}
                        className="p-1 text-zinc-400 hover:text-indigo-600 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-zinc-400 text-sm">
                  No alerts available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">Schedule New Job</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleScheduleJob} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Workflow</label>
                <select 
                  className="w-full p-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                  value={formData.workflowId}
                  onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}
                  required
                >
                  <option value="">Select a workflow...</option>
                  {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>{wf.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  Cron Expression
                  <span className="text-[10px] font-normal text-zinc-400">(Standard Cron Format)</span>
                </label>
                <input 
                  type="text" 
                  className={cn(
                    "w-full p-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all",
                    cronError ? "border-red-500 focus:border-red-500" : "border-zinc-200 focus:border-indigo-500"
                  )}
                  value={formData.cron}
                  onChange={(e) => setFormData({ ...formData, cron: e.target.value })}
                  placeholder="* * * * *"
                  required
                />
                {cronError ? (
                  <p className="text-xs text-red-500 font-medium">{cronError}</p>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    <Calendar className="w-3 h-3" />
                    <span>Next run: <strong className="text-zinc-700">{cronPreview}</strong></span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Payload (JSON)</label>
                <textarea 
                  className="w-full p-2.5 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24"
                  value={formData.payload}
                  onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!!cronError || !formData.workflowId}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Schedule Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
