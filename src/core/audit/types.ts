/**
 * Audit Logger Types
 */

export interface AuditEntry {
    id: string;
    workspace_id: string;
    actor_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    before?: any;
    after?: any;
    ip_address?: string;
    user_agent?: string;
    created_at?: string;
}

export type AuditAction = string;
