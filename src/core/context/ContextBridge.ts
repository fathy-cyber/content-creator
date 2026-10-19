import { createClient } from '@supabase/supabase-js';
import { useContextStore } from './ContextStore';
import { GlobalContext, Client, Project } from './types';
import { eventBus } from '../events/EventBus';
import { serviceRegistry } from '../registry/ServiceRegistry';

/**
 * Hook to access global context state.
 */
export function useGlobalContext<T = any>(selector: (state: any) => T): T {
    return useContextStore((state) => selector(state));
}

/**
 * ContextBridge is a wrapper around ContextStore that handles 
 * data fetching and event emission.
 */
export class ContextBridge {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    /**
     * Sets the active workspace and updates the global state.
     */
    async setActiveWorkspace(workspaceId: string): Promise<void> {
        const { data: workspace, error } = await this.supabase
            .from('workspaces')
            .select('*')
            .eq('id', workspaceId)
            .single();

        if (error || !workspace) {
            throw new Error(`ContextBridgeError: Workspace ${workspaceId} not found.`);
        }

        // Update Zustand store
        useContextStore.getState().setActiveWorkspace(workspace as any);

        // Emit event
        await eventBus.emit('context.workspace.changed', { 
            workspaceId: workspace.id, 
            workspace 
        }, 'core');
    }

    /**
     * Sets the active client and updates the global state.
     */
    async setActiveClient(clientId: string): Promise<void> {
        const { data: client, error } = await this.supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (error || !client) {
            throw new Error(`ContextBridgeError: Client ${clientId} not found.`);
        }

        // Update Zustand store
        useContextStore.getState().setActiveClient(client as Client);

        // Emit event
        await eventBus.emit('context.client.changed', { 
            clientId: client.id, 
            client 
        }, 'core');
    }

    /**
     * Sets the active project and updates the global state.
     */
    async setActiveProject(projectId: string): Promise<void> {
        const { data: project, error } = await this.supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error || !project) {
            throw new Error(`ContextBridgeError: Project ${projectId} not found.`);
        }

        // Update Zustand store
        useContextStore.getState().setActiveProject(project as Project);

        // Emit event
        await eventBus.emit('context.project.changed', { 
            projectId: project.id, 
            project 
        }, 'core');
    }

    /**
     * Returns the current global context.
     */
    getContext(): GlobalContext {
        const state = useContextStore.getState();
        return {
            activeWorkspaceId: state.activeWorkspaceId,
            activeUserId: state.activeUserId,
            activeClientId: state.activeClientId,
            activeProjectId: state.activeProjectId,
            activeClient: state.activeClient,
            activeProject: state.activeProject,
        };
    }

    /**
     * Ensures the authenticated user has a corresponding record in the public.users table.
     */
    private async ensureUserProfile(user: any): Promise<void> {
        const { data, error } = await this.supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            console.log(`[ContextBridge] User profile missing for ${user.id}. Creating...`);
            const { error: createError } = await this.supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.user_metadata?.name || 'New User',
                });

            if (createError) {
                console.error(`[ContextBridge] Failed to create user profile: ${createError.message}`);
            }
        }
    }

    /**
     * Initializes the user session by finding their default workspace.
     * If no workspace exists, it creates a default one.
     */
    async initializeSession(): Promise<void> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return;

        await this.ensureUserProfile(user);

        const { data: workspaces, error } = await this.supabase
            .from('workspaces')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1);

        let defaultWorkspace;

        if (error || !workspaces || workspaces.length === 0) {
            console.log(`[ContextBridge] No workspace found for user ${user.id}. Creating default...`);
            const { data: newWorkspace, error: createError } = await this.supabase
                .from('workspaces')
                .insert({
                    name: 'My Business Workspace',
                    owner_id: user.id,
                })
                .select()
                .single();

            if (createError || !newWorkspace) {
                console.error(`[ContextBridge] Failed to create default workspace: ${createError?.message}`);
                return;
            }
            defaultWorkspace = newWorkspace;
        } else {
            defaultWorkspace = workspaces[0];
        }

        await this.setActiveWorkspace(defaultWorkspace.id);
        
        // Also set active user in store
        useContextStore.getState().setActiveUser(user.id);
        
        console.log(`[ContextBridge] Session initialized for workspace ${defaultWorkspace.id}`);
    }

    getActiveClient(): Client | null {
        return this.getContext().activeClient;
    }

    getActiveProject(): Project | null {
        return this.getContext().activeProject;
    }

    /**
     * Enriches AI inputs with current context data.
     */
    enrichAIInputs(inputs: Record<string, unknown>): Record<string, unknown> {
        const context = this.getContext();
        return {
            ...inputs,
            contextClientName: context.activeClient?.name || 'Unknown Client',
            contextIndustry: context.activeClient?.industry || 'Unknown Industry',
            contextProjectName: context.activeProject?.name || 'Unknown Project',
        };
    }
}

export const contextBridge = new ContextBridge();

// Register with ServiceRegistry
serviceRegistry.registerService('context', contextBridge);
