import { createClient } from '@supabase/supabase-js';
import { serviceRegistry } from '../registry/ServiceRegistry';
import { useContextStore } from '../context/ContextStore';

export interface Workspace {
    id: string;
    name: string;
    owner_id: string;
    created_at?: string;
}

export class WorkspaceService {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    /**
     * Creates a new workspace for the current user.
     */
    async createWorkspace(name: string): Promise<{ data: Workspace | null, error: Error | null }> {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) throw new Error('Authentication required to create a workspace');

            const { data: workspace, error } = await this.supabase
                .from('workspaces')
                .insert({
                    name,
                    owner_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;

            // Set as active workspace in global context
            useContextStore.getState().setActiveWorkspace(workspace as any);

            return { data: workspace as Workspace, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Retrieves all workspaces owned by the current user.
     */
    async listMyWorkspaces(): Promise<{ data: Workspace[], error: Error | null }> {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) throw new Error('Authentication required');

            const { data, error } = await this.supabase
                .from('workspaces')
                .select('*')
                .eq('owner_id', user.id);

            if (error) throw error;
            return { data: (data || []) as Workspace[], error: null };
        } catch (e: any) {
            return { data: [], error: e };
        }
    }

    /**
     * Retrieves a specific workspace by ID.
     */
    async getWorkspace(id: string): Promise<{ data: Workspace | null, error: Error | null }> {
        try {
            const { data, error } = await this.supabase
                .from('workspaces')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data: data as Workspace, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }
}

export const workspaceService = new WorkspaceService();
serviceRegistry.registerService('workspace', workspaceService);
