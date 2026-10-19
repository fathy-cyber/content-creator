/**
 * Context Bridge Types
 */

export interface Workspace {
    id: string;
    name: string;
    slug: string;
}

export interface Client {
    id: string;
    name: string;
    industry: string;
    website?: string;
}

export interface Project {
    id: string;
    name: string;
    clientId: string;
    status: string;
}

export interface GlobalContext {
    activeWorkspaceId: string | null;
    activeUserId: string | null;
    activeClientId: string | null;
    activeProjectId: string | null;
    activeClient: Client | null;
    activeProject: Project | null;
}

export interface ContextState extends GlobalContext {
    isContextLoaded: boolean;
}
