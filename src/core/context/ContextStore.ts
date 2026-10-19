import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContextState, Client, Project, Workspace } from './types';

interface ContextActions {
    setActiveUser: (userId: string | null) => void;
    setActiveClient: (client: Client | null) => void;
    setActiveProject: (project: Project | null) => void;
    setActiveWorkspace: (workspace: Workspace) => void;
    clearContext: () => void;
    setContextLoaded: (loaded: boolean) => void;
}

/**
 * ContextStore is the single source of truth for the current active session.
 * Persisted in localStorage to maintain context across refreshes.
 */
export const useContextStore = create<ContextState & ContextActions>()(
    persist(
        (set) => ({
            activeWorkspaceId: null,
            activeUserId: null,
            activeClientId: null,
            activeClient: null,
            activeProjectId: null,
            activeProject: null,
            isContextLoaded: false,

            setActiveUser: (userId) => set({ activeUserId: userId }),
            setActiveClient: (client) => set({ 
                activeClient: client, 
                activeClientId: client?.id || null 
            }),
            setActiveProject: (project) => set({ 
                activeProject: project, 
                activeProjectId: project?.id || null 
            }),
            setActiveWorkspace: (workspace) => set({ 
                activeWorkspaceId: workspace.id 
            }),
            clearContext: () => set({
                activeUserId: null,
                activeClientId: null,
                activeClient: null,
                activeProjectId: null,
                activeProject: null,
            }),
            setContextLoaded: (loaded) => set({ isContextLoaded: loaded }),
        }),
        {
            name: 'agency-os-context',
        }
    )
);
