import { createClient } from '@supabase/supabase-js';
import { useContextStore } from '../context/ContextStore';
import { AuditEntry } from './types';
import { serviceRegistry } from '../registry/ServiceRegistry';

/**
 * AuditLogger provides a non-blocking way to log all mutations across the system.
 */
export class AuditLogger {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    /**
     * Logs an action. This is a fire-and-forget operation to avoid blocking the main thread.
     */
    log(
        action: string,
        entityType: string,
        entityId: string,
        before: any,
        after: any,
        metadata?: { ipAddress?: string, userAgent?: string }
    ): void {
        (async () => {
            try {
                const { activeWorkspaceId } = useContextStore.getState();
                const { data: { user } } = await this.supabase.auth.getUser();
                const actor_id = user?.id || '00000000-0000-0000-0000-000000000000';
                const workspace_id = activeWorkspaceId || '00000000-0000-0000-0000-000000000000';

                await this.supabase.from('audit_log').insert({
                    workspace_id,
                    actor_id,
                    action,
                    entity_type: entityType,
                    entity_id: entityId,
                    before,
                    after,
                    ip_address: metadata?.ipAddress,
                    user_agent: metadata?.userAgent,
                });
            } catch (err) {
                console.error('[AuditLogger] Failed to write audit entry:', err);
            }
        })();
    }


    /**
     * Retrieves audit logs based on filters.
     */
    async getAuditLog(filters: { 
        entityType?: string, 
        entityId?: string, 
        actorId?: string, 
        dateRange?: { start: string, end: string },
        limit?: number,
        offset?: number
    }): Promise<{ data: AuditEntry[], count: number, error: Error | null }> {
        try {
            let query = this.supabase.from('audit_log').select('*', { count: 'exact' });

            if (filters.entityType) query = query.eq('entity_type', filters.entityType);
            if (filters.entityId) query = query.eq('entity_id', filters.entityId);
            if (filters.actorId) query = query.eq('actor_id', filters.actorId);
            if (filters.dateRange) {
                query = query.gte('created_at', filters.dateRange.start).lte('created_at', filters.dateRange.end);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

            if (error) throw error;
            return { data: (data || []) as AuditEntry[], count: count || 0, error: null };
        } catch (e: any) {
            return { data: [], count: 0, error: e };
        }
    }
}

export const auditLogger = new AuditLogger();

// Register with ServiceRegistry
serviceRegistry.registerService('audit', auditLogger);
