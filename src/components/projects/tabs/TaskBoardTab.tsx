import React, { useState, useEffect } from 'react';
import { 
  ProjectTaskDetail, 
  TaskStage, 
  TaskPriority 
} from '@/types/project.types';
import { 
  updateTaskStage, 
  updateTaskOrder,
  updateTask
} from '@/lib/projects/projects.mutations';
import { 
  fetchProjectTasks 
} from '@/lib/projects/projects.queries';
import { 
  PriorityBadge 
} from '../ui/PriorityBadge';
import { 
  StatusBadge 
} from '../ui/StatusBadge';
import { 
  EmptyState 
} from '../ui/EmptyState';
import { 
  Plus, 
  MoreVertical, 
  Clock, 
  User as UserIcon 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { useProjectEvents } from '@/modules/projects/hooks/useProjectEvents';
import { EVENT_NAMES } from '@/shared/events/event-names';



type TaskBoardTabProps = {
  projectId: number;
  onTaskClick: (task: ProjectTaskDetail) => void;
};

const TASK_BOARD_RELEVANT_EVENTS = [
  EVENT_NAMES.PROJECT_TASK_CREATED,
  EVENT_NAMES.PROJECT_TASK_UPDATED,
  EVENT_NAMES.PROJECT_TASK_DELETED,
  EVENT_NAMES.PROJECT_TASK_STAGE_CHANGED,
];

export const TaskBoardTab = ({ projectId, onTaskClick }: TaskBoardTabProps) => {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [tasks, setTasks] = useState<ProjectTaskDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for task updates to refresh the board in real-time
  const projectVersion = useProjectEvents(TASK_BOARD_RELEVANT_EVENTS);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  useEffect(() => {
    if (projectVersion > 0) {
      loadTasks();
    }
  }, [projectVersion]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchProjectTasks(projectId);
      setTasks(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = parseInt(draggableId);
    const newStage = destination.droppableId as TaskStage;
    
    // Optimistic update
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, stage: newStage } : t
    );
    setTasks(updatedTasks);

    try {
      await updateTaskStage(taskId, newStage);
    } catch (e) {
      loadTasks(); // Revert on error
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading tasks...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (tasks.length === 0) return <EmptyState icon="📋" title="No tasks yet" description="Start by adding your first task to the project" actionLabel="Add Task" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button 
            onClick={() => setView('kanban')}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
              view === 'kanban' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Kanban
          </button>
          <button 
            onClick={() => setView('table')}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
              view === 'table' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Table
          </button>
        </div>
        <button className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700">
          <Plus className="w-3 h-3 mr-1" /> Add Task
        </button>
      </div>

      {view === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {(['todo', 'in_progress', 'review', 'done'] as TaskStage[]).map(stage => (
              <div key={stage} className="flex flex-col min-w-[280px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {stage.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold">
                      {tasks.filter(t => t.stage === stage).length}
                    </span>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-blue-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 p-2 rounded-lg transition-colors min-h-[500px]",
                        snapshot.isDraggingOver ? "bg-blue-50/50" : "bg-slate-50/50"
                      )}
                    >
                       {tasks.filter(t => t.stage === stage).map((task, index) => (
                         <div key={task.id}>
                           <Draggable draggableId={task.id.toString()} index={index}>
                             {(provided) => (
                               <div 
                                 ref={provided.innerRef}
                                 {...provided.draggableProps}
                                 {...provided.dragHandleProps}
                                 onClick={() => onTaskClick(task)}
                                 className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-3 cursor-pointer hover:border-blue-300 transition-colors group"
                               >
                                 <div className="flex items-start justify-between mb-2">
                                   <span className="text-sm font-semibold text-slate-800 leading-tight">
                                     {task.name}
                                   </span>
                                   <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600">
                                     <MoreVertical className="w-3 h-3" />
                                   </button>
                                 </div>
                                 
                                 <div className="flex flex-wrap gap-2 mb-3">
                                   <PriorityBadge priority={task.priority} />
                                   {task.is_billable && (
                                     <span className="text-[10px] font-medium px-1.5 py-0.5 bg-green-50 text-green-600 rounded border border-green-100">
                                       Billable
                                     </span>
                                   )}
                                 </div>
                                 
                                 <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                   <div className="flex items-center gap-2">
                                     <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                                       {task.assignee_name?.charAt(0) || '?'}
                                     </div>
                                     <span className="text-[11px] text-slate-500 truncate max-w-[80px]">
                                       {task.assignee_name || 'Unassigned'}
                                     </span>
                                   </div>
                                   <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                     <Clock className="w-3 h-3" />
                                     <span>{task.actual_hours} / {task.estimated_hours}h</span>
                                   </div>
                                 </div>
                                 
                                  <div className="mt-3">
                                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                      <span>Progress</span>
                                      <span>{task.progress}%</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100" 
                                      value={task.progress} 
                                      onChange={async (e) => {
                                        const newProgress = parseInt(e.target.value);
                                        await updateTask(task.id, { progress: newProgress });
                                        await loadTasks();
                                      }}
                                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                  </div>
                                </div>
                             )}
                           </Draggable>
                         </div>
                       ))}
                      {provided.droppableProps.ref && provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Task Name</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Est. Hrs</th>
                <th className="px-4 py-3">Actual Hrs</th>
                <th className="px-4 py-3">Variance</th>
                <th className="px-4 py-3">Billable</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Milestone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task, i) => (
                <tr 
                  key={task.id} 
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{task.name}</td>
                  <td className="px-4 py-3 text-slate-600">{task.assignee_name || '-'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.stage} type="task" />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(task.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{task.estimated_hours}h</td>
                  <td className="px-4 py-3 text-slate-600">{task.actual_hours}h</td>
                  <td className={cn(
                    "px-4 py-3",
                    task.hours_variance > 0 ? "text-red-500" : "text-green-500"
                  )}>
                    {task.hours_variance > 0 ? `+${task.hours_variance}` : task.hours_variance}h
                  </td>
                  <td className="px-4 py-3 text-center">
                    {task.is_billable ? '✅' : '❌'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">
                    {task.milestone_name || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
