import React, { useState, useCallback } from 'react';
import { ProjectListRow } from '@/types/project.types';
import { ProjectListTable } from '@/components/projects/ProjectListTable';
import { ProjectCardModal } from '@/components/projects/ProjectCardModal';

export default function ProjectList() {
  const [selectedProject, setSelectedProject] = useState<ProjectListRow | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const handleProjectClick = (project: ProjectListRow) => {
    setSelectedProject(project);
  };

  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedProject(null);
    setIsNewProjectModalOpen(false);
  };

  const refreshProjects = useCallback(() => {
    // Soft refresh: avoid window.location.reload()
    console.log('[ProjectList] Soft refresh triggered');
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <p className="text-slate-500 text-sm">Manage your agency's projects, resources, and financials</p>
      </div>

      <ProjectListTable 
        onProjectClick={handleProjectClick} 
        onNewProject={handleNewProject} 
      />

      {selectedProject && (
        <ProjectCardModal 
          projectId={selectedProject.id} 
          project={selectedProject} 
          onClose={handleModalClose} 
          onUpdated={refreshProjects}
        />
      )}

      {isNewProjectModalOpen && (
        <ProjectCardModal 
          isNew 
          project={{
            id: 0,
            name: 'New Project',
            description: '',
            manager_id: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customer_id: 0,
            customer_name: '',
            sales_order_id: '',
            status: 'active',
            progress: 0,
            budget: 0,
            tasks_count: 0,
            completed_tasks_count: 0,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            billing_model: 'fixed',
            billing_status: 'not_started',
            retainer_amount: 0,
            billing_reviewed_by: '',
            billing_reviewed_at: '',
            billing_notes: '',
            payment_status: 'not_started',
            client_name: '',
            client_company: '',
            task_completion_pct: 0,
            days_remaining: 0,
            is_overdue: false,
            total_logged_hours: 0,
            total_billable_hours: 0,
            total_expenses: 0,
            labor_cost: 0,
            billable_value: 0,
            gross_profit: 0,
            profit_margin: 0,
            milestone_count: 0,
            billed_milestones_count: 0,
            pending_invoice_amount: 0,
          } as ProjectListRow}
          onClose={handleModalClose}
          onUpdated={() => {
            setIsNewProjectModalOpen(false);
            refreshProjects();
          }}
        />
      )}
    </div>
  );
}
