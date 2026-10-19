/**
 * RBAC Types
 */

export type ResourceAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'publish';

export interface Role {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    is_system: boolean;
    created_at?: string;
}

export interface Permission {
    id: string;
    role_id: string;
    module: string;
    resource: string;
    action: ResourceAction;
    conditions?: any;
    created_at?: string;
}

export interface UserRole {
    id: string;
    user_id: string;
    role_id: string;
    client_id?: string;
    granted_by?: string;
    created_at?: string;
}

export interface PermissionCheck {
    userId: string;
    action: ResourceAction;
    resource: string;
    module: string;
    context?: any;
}
