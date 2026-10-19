import React, { useState, useEffect } from 'react';
import { ProjectListRow } from '@/types/project.types';
import { fetchProjects } from '@/lib/projects/projects.queries';
import { StatusBadge } from './ui/StatusBadge';
import { ProgressBar } from './ui/ProgressBar';
import { SkeletonTable } from './ui/SkeletonTable';
import { useProjectEvents } from '@/modules/projects/hooks/useProjectEvents';
import { EVENT_NAMES } from '@/shared/events/event-names';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Search 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProjectListTableProps = {
  onProjectClick: (project: ProjectListRow) => void;
  onNewProject: () => void;
};

const PROJECT_LIST_RELEVANT_EVENTS = [
  EVENT_NAMES.PROJECT_CREATED,
  EVENT_NAMES.PROJECT_UPDATED,
  EVENT_NAMES.PROJECT_TASK_CREATED,
  EVENT_NAMES.PROJECT_TASK_UPDATED,
  EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED,
  EVENT_NAMES.PROJECT_MILESTONE_COMPLETED,
  EVENT_NAMES.PROJECT_MILESTONE_BILLED,
  EVENT_NAMES.PROJECT_TIMESHEET_LOGGED,
];

export const ProjectListTable = ({ onProjectClick, onNewProject }: ProjectListTableProps) => {
  const [projects, setProjects] = useState<ProjectListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ProjectListRow; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });

  // Listen for any project-related changes to refresh the list
  const projectVersion = useProjectEvents(PROJECT_LIST_RELEVANT_EVENTS);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectVersion > 0) {
      loadProjects();
    }
  }, [projectVersion]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof ProjectListRow) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredProjects = sortedProjects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client_company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <div className="p-8 text-center text-red-500">Error loading projects: {error}</div>;
  if (loading) return <SkeletonTable rows={10} cols={10} className="mt-12" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search projects or clients..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
                <th className="px-4 py-3 cursor-pointer hover:text-slate-800" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Project <SortIcon config={sortConfig} sortKey="name" /></div>
                </th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3 cursor-pointer hover:text-slate-800" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <SortIcon config={sortConfig} sortKey="status" /></div>
                </th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3 cursor-pointer hover:text-slate-800 text-right" onClick={() => handleSort('budget')}>
                  <div className="flex items-center justify-end gap-1">Budget <SortIcon config={sortConfig} sortKey="budget" /></div>
                </th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 cursor-pointer hover:text-slate-800" onClick={() => handleSort('end_date')}>
                  <div className="flex items-center gap-1">Deadline <SortIcon config={sortConfig} sortKey="end_date" /></div>
                </th>
                <th className="px-4 py-3">Tasks</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 cursor-pointer hover:text-slate-800" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">Created <SortIcon config={sortConfig} sortKey="created_at" /></div>
                </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.map(project => (
              <tr 
                key={project.id} 
                onClick={() => onProjectClick(project)}
                className={cn(
                  "hover:bg-blue-50/40 cursor-pointer transition-colors group",
                  project.is_overdue && "border-l-4 border-l-red-500"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{project.name}</span>
                    <span className="text-[10px] text-slate-400">ID: {project.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="flex flex-col">
                    <span>{project.client_name}</span>
                    <span className="text-xs text-slate-400">{project.client_company}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} type="project" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-700">{project.billing_model.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400">{project.billing_status.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">
                  ${project.budget.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20">
                      <ProgressBar value={project.task_completion_pct} size="sm" colorAuto />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{Math.round(project.task_completion_pct)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="flex flex-col">
                    <span>{new Date(project.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      project.is_overdue ? "text-red-500" : "text-slate-400"
                    )}>
                      {project.days_remaining > 0 ? `${project.days_remaining}d left` : `${Math.abs(project.days_remaining)}d overdue`}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {project.completed_tasks_count} / {project.tasks_count}
                </td>
                <td className={cn(
                  "px-4 py-3 text-right font-bold",
                  project.profit_margin >= 30 ? "text-green-600" : 
                  project.profit_margin >= 10 ? "text-yellow-600" : 
                  project.profit_margin < 0 ? "text-red-600" : "text-slate-800"
                )}>
                  <div>${project.gross_profit.toLocaleString()}</div>
                  <div className="text-[10px] font-normal opacity-70">
                    {project.profit_margin != null ? `${project.profit_margin.toFixed(1)}%` : 'N/A'} margin
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                  No projects found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SortIcon = ({ config, sortKey }: { config: { key: keyof ProjectListRow; direction: 'asc' | 'desc' }; sortKey: keyof ProjectListRow }) => {
  if (config.key !== sortKey) return <div className="w-3 h-3" />;
  return config.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
};
