import React, { useState, useCallback } from 'react';
import { ProjectListRow } from '@/types/project.types';
import { ProjectListTable } from '@/components/projects/ProjectListTable';
import { ProjectCardModal } from '@/components/projects/ProjectCardModal';

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectListRow | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <p className="text-slate-500 text-sm">Manage your agency's projects, resources, and financials</p>
      </div>

       <div key={refreshKey}>
         <ProjectListTable 
           onProjectClick={handleProjectClick} 
           onNewProject={handleNewProject} 
         />
       </div>

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
          onClose={handleModalClose}
          onUpdated={() => {
            refreshProjects();
            setIsNewProjectModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
