import React, { useState, useEffect } from 'react';
import { ProjectListRow, ProjectFormData, ProjectTaskDetail } from '@/types/project.types';
import { 
  updateProject, 
  createProject,
  archiveProject
} from '@/lib/projects/projects.mutations';
import { 
  OverviewTab 
} from './tabs/OverviewTab';
import { 
  TaskBoardTab 
} from './tabs/TaskBoardTab';
import { 
  MilestonesTab 
} from './tabs/MilestonesTab';
import { 
  TimesheetsTab 
} from './tabs/TimesheetsTab';
import { 
  FinancialsTab 
} from './tabs/FinancialsTab';
import { 
  ClientPortalTab 
} from './tabs/ClientPortalTab';
import { 
  TaskDetailDrawer 
} from './TaskDetailDrawer';
import { 
   X, 
   Edit3, 
   Save, 
   Archive, 
   ChevronRight,
   ArrowLeft
 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectEvents } from '@/modules/projects/hooks/useProjectEvents';
import { EVENT_NAMES } from '@/shared/events/event-names';
import { fetchProjectById, fetchProjectTasks } from '@/lib/projects/projects.queries';

type ProjectCardModalProps = {
  projectId?: number;
  project?: ProjectListRow;
  isNew?: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

const PROJECT_RELEVANT_EVENTS = [
  EVENT_NAMES.PROJECT_UPDATED,
  EVENT_NAMES.PROJECT_TASK_CREATED,
  EVENT_NAMES.PROJECT_TASK_UPDATED,
  EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED,
  EVENT_NAMES.PROJECT_MILESTONE_COMPLETED,
  EVENT_NAMES.PROJECT_MILESTONE_BILLED,
  EVENT_NAMES.PROJECT_TIMESHEET_LOGGED,
];

export const ProjectCardModal = ({ projectId, project: initialProject, isNew, onClose, onUpdated }: ProjectCardModalProps) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTaskDetail | null>(null);
  const [project, setProject] = useState<ProjectListRow | null>(initialProject || null);
  
  const projectVersion = useProjectEvents(PROJECT_RELEVANT_EVENTS);

  const isFirstRender = React.useRef(true);

  const refreshProjectData = async () => {
    if (!projectId) return;
    console.log(`[ProjectCardModal] Refreshing data for project ${projectId}...`);
    try {
      const data = await fetchProjectById(projectId);
      console.log(`[ProjectCardModal] Fetched data: ${data.completed_tasks_count}/${data.tasks_count} tasks complete`);
      setProject(data as any);
      
      if (selectedTask) {
        const tasks = await fetchProjectTasks(projectId);
        const updatedTask = tasks.find(t => t.id === selectedTask.id);
        if (updatedTask) {
          setSelectedTask(updatedTask);
        }
      }
    } catch (e) {
      console.error('[ProjectCardModal] Failed to refresh project data:', e);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (projectId) {
      void refreshProjectData();
    }
  }, [projectVersion, projectId]);

  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    name: '',
    description: '',
    manager_id: '',
    start_date: '',
    end_date: '',
    customer_id: 0,
    status: 'active',
    budget: 0,
    billing_model: 'fixed',
    retainer_amount: 0,
    billing_status: 'not_started',
    payment_status: 'not_started',
    billing_notes: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        manager_id: project.manager_id || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        customer_id: project.customer_id || undefined,
        status: project.status || 'active',
        budget: project.budget || 0,
        billing_model: project.billing_model || 'fixed',
        retainer_amount: project.retainer_amount || 0,
        billing_status: project.billing_status || 'not_started',
        payment_status: project.payment_status || 'not_started',
        billing_notes: project.billing_notes || '',
      });
    }
  }, [project]);

  const tabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Tasks', label: 'Task Board' },
    { id: 'Milestones', label: 'Milestones' },
    { id: 'Timesheets', label: 'Timesheets' },
    { id: 'Financials', label: 'Financials' },
    { id: 'Client', label: 'Client' },
  ];

  const handleSaveOverview = async (data: Partial<ProjectFormData>) => {
    setIsSaving(true);
    try {
      if (isNew) {
        await createProject(data as ProjectFormData);
      } else if (projectId) {
        await updateProject(projectId, data);
        await refreshProjectData();
      }
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      await onUpdated();
    } catch (e) {
      alert('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  if (!project && !isNew) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-6xl max-h-[92vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button 
              onClick={onClose}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Projects</span>
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-slate-600">{project?.name || 'New Project'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {projectId && !isNew && (
              <button 
                onClick={async () => {
                  if (confirm('Archive this project?')) {
                    try {
                      await archiveProject(projectId);
                      await onUpdated();
                      onClose();
                    } catch (e) {
                      alert('Failed to archive project');
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-600 text-xs font-medium transition-colors"
              >
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
            )}
            
            {!isEditMode && !isNew && (
              <button 
                onClick={() => {
                  setIsEditMode(true);
                  setHasUnsavedChanges(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            
            {isEditMode && (
              <button 
                onClick={() => {
                  setIsEditMode(false);
                  setHasUnsavedChanges(false);
                }}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Cancel
              </button>
            )}
            
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-2 text-xs font-medium transition-all relative",
                    activeTab === tab.id 
                      ? "text-blue-600" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            {isEditMode && (
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-orange-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Unsaved Changes
                  </span>
                )}
                 <button 
                  onClick={async () => {
                    await handleSaveOverview(formData);
                    setHasUnsavedChanges(false);
                    setIsEditMode(false);
                  }}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            )}
          </div>
        
          <div className="flex-1 overflow-y-auto p-6">
             {activeTab === 'Overview' && (
               <OverviewTab 
                 projectId={projectId || 0} 
                 project={project} 
                 isEditMode={isEditMode || isNew} 
                 formData={formData}
                 setFormData={setFormData}
                 onSave={handleSaveOverview}
                 onCancel={() => setIsEditMode(false)}
               />
             )}
             {activeTab === 'Tasks' && (
               <TaskBoardTab 
                 projectId={projectId || 0} 
                 onTaskClick={(task) => {
                   setSelectedTask(task);
                 }}
               />
             )}
             {activeTab === 'Milestones' && (
               <MilestonesTab projectId={projectId || 0} />
             )}
             {activeTab === 'Timesheets' && (
               <TimesheetsTab projectId={projectId || 0} />
             )}
             {activeTab === 'Financials' && (
               <FinancialsTab 
                 projectId={projectId || 0} 
                 isEditMode={isEditMode} 
                 onUpdateProject={handleSaveOverview}
               />
             )}
             {activeTab === 'Client' && (
               <ClientPortalTab 
                 projectId={projectId || 0} 
                 project={project} 
                 isEditMode={isEditMode} 
                 onSave={handleSaveOverview}
               />
             )}
           </div>
        </div>
        
        {selectedTask && (
            <TaskDetailDrawer 
              task={selectedTask}
              projectId={projectId || 0}
              onClose={() => setSelectedTask(null)}
              onUpdate={async () => {
                await refreshProjectData();
                await onUpdated();
              }}
            />

        )}
      </div>
    </div>
  );
};
