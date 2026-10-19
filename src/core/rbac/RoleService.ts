import { createClient } from '@supabase/supabase-js';
import { Role, UserRole } from './types';

/**
 * RoleService handles the management of roles and user role assignments.
 */
export class RoleService {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    async listRoles(workspaceId: string): Promise<Role[]> {
        const { data, error } = await this.supabase
            .from('roles')
            .select('*')
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        return (data || []) as Role[];
    }

    async getRole(id: string): Promise<Role> {
        const { data, error } = await this.supabase
            .from('roles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw new Error(`RoleNotFoundError: Role ${id} not found.`);
        return data as Role;
    }

    async createRole(data: Partial<Role>): Promise<Role> {
        if (data.is_system) throw new Error('System roles cannot be created manually.');

        const { data: role, error } = await this.supabase
            .from('roles')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return role as Role;
    }

    async assignRole(userId: string, roleId: string, clientId?: string): Promise<UserRole> {
        const { data, error } = await this.supabase
            .from('user_roles')
            .insert({ user_id: userId, role_id: roleId, client_id: clientId })
            .select()
            .single();

        if (error) throw error;
        return data as UserRole;
    }

    async revokeRole(userId: string, roleId: string, clientId?: string): Promise<void> {
        const { error } = await this.supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role_id', roleId)
            .eq('client_id', clientId || null); // Handle null for workspace-wide roles

        if (error) throw error;
    }

    async getUserRoles(userId: string): Promise<UserRole[]> {
        const { data, error } = await this.supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return (data || []) as UserRole[];
    }

    /**
     * Determines the effective role for a user, prioritize client-scoped role.
     */
    async getEffectiveRole(userId: string, clientId?: string): Promise<Role> {
        const roles = await this.getUserRoles(userId);
        
        // 1. Priority: Client-scoped role
        if (clientId) {
            const clientRole = roles.find(ur => ur.client_id === clientId);
            if (clientRole) return this.getRole(clientRole.role_id);
        }

        // 2. Priority: Workspace role (client_id is null)
        const workspaceRole = roles.find(ur => !ur.client_id);
        if (workspaceRole) return this.getRole(workspaceRole.role_id);

        // 3. Fallback: Default role (mocked as client_viewer)
        // In a real system, we'd fetch the 'client_viewer' role for the workspace.
        throw new Error('No effective role found for user.');
    }
}

export const roleService = new RoleService();
