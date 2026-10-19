'use client';

import React from 'react';
import { Search, Filter, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface JobsTableProps {
  jobs: ScheduledJob[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCancelJob: (id: string) => void;
}

export default function JobsTable({ jobs, searchQuery, setSearchQuery, onCancelJob }: JobsTableProps) {
  const filteredJobs = jobs.filter(job => 
    job.workflow?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.cron?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
                    onClick={() => onCancelJob(job.id)}
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
  );
}
