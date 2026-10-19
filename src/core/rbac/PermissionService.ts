import { createClient } from '@supabase/supabase-js';
import { Permission, ResourceAction } from './types';
import { roleService } from './RoleService';
import { policyEngine } from './PolicyEngine';
import { serviceRegistry } from '../registry/ServiceRegistry';

/**
 * PermissionService is the primary entry point for RBAC checks.
 * Implements caching to avoid excessive DB calls.
 */
export class PermissionService {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );
    private cache = new Map<string, { permissions: Permission[], expiresAt: number }>();
    private readonly TTL = 2 * 60 * 1000; // 2 minutes

    /**
     * Checks if a user has permission to perform an action on a resource.
     */
    async can(userId: string, action: ResourceAction, resource: string, module: string, context?: any): Promise<boolean> {
        try {
            const permissions = await this.getPermissionsForUser(userId);
            
            if (!policyEngine.hasPermission(permissions, module, resource, action)) {
                return false;
            }

            // Find the specific permission to evaluate its conditions
            const permission = permissions.find(p => p.module === module && p.resource === resource && p.action === action);
            if (permission && permission.conditions) {
                return policyEngine.evaluateConditions(permission.conditions, context || {});
            }

            return true;
        } catch (e) {
            console.error(`[PermissionService] Error during can() check:`, e);
            return false;
        }
    }

    /**
     * Checks permission and throws a PermissionDeniedError if false.
     */
    async canOrThrow(userId: string, action: ResourceAction, resource: string, module: string, context?: any): Promise<void> {
        const allowed = await this.can(userId, action, resource, module, context);
        if (!allowed) {
            throw new Error(`PermissionDeniedError: User ${userId} does not have permission to ${action} ${resource} in ${module}.`);
        }
    }

    private async getPermissionsForUser(userId: string): Promise<Permission[]> {
        const cached = this.cache.get(userId);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.permissions;
        }

        // Fetch effective role
        const role = await roleService.getEffectiveRole(userId);
        
        // Fetch permissions for that role
        const { data, error } = await this.supabase
            .from('permissions')
            .select('*')
            .eq('role_id', role.id);

        if (error) throw error;

        const permissions = (data || []) as Permission[];
        this.cache.set(userId, {
            permissions,
            expiresAt: Date.now() + this.TTL,
        });

        return permissions;
    }

    /**
     * Invalidates permission cache for a user.
     */
    invalidateCache(userId: string): void {
        this.cache.delete(userId);
    }
}

export const permissionService = new PermissionService();

// Register with ServiceRegistry
serviceRegistry.registerService('permissions', permissionService);
