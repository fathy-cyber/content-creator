// src/shared/audit/auditService.ts
// ════════════════════════════════════════════════════════════════
// Central audit service — used by ALL modules
// ════════════════════════════════════════════════════════════════

import { supabase }      from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────

export type AuditAction =
  // CRUD
  | 'CREATE'   | 'UPDATE'   | 'DELETE'   | 'RESTORE'
  // Finance
  | 'APPROVE'  | 'REJECT'   | 'SEND'     | 'PAY'
  | 'VOID'     | 'WRITEOFF' | 'REFUND'
  // Auth
  | 'LOGIN'    | 'LOGOUT'   | 'LOGIN_FAILED' | 'PASSWORD_CHANGED'
  // Workflow
  | 'CONFIRM'  | 'COMPLETE' | 'CANCEL'   | 'ESCALATE'
  | 'ASSIGN'   | 'REOPEN'
  // Data
  | 'EXPORT'   | 'IMPORT'   | 'BULK_DELETE';

export type AuditModule =
  | 'crm'      | 'sales'    | 'project'  | 'invoice'
  | 'billing'  | 'support'  | 'hr'       | 'marketing'
  | 'inventory'| 'analytics'| 'auth'     | 'system';

export type ActorType = 'user' | 'system' | 'worker' | 'api';

export interface AuditContext {
  userId?:       string;
  userEmail?:    string;
  userRole?:     string;
  actorType?:    ActorType;
  ipAddress?:    string;
  userAgent?:    string;
  correlationId?: string;
  source?:       'web' | 'api' | 'worker' | 'migration';
  notes?:        string;
}

export interface AuditFilters {
  module?:     AuditModule;
  action?:     string;
  userId?:     string;
  entityType?: string;
  dateFrom?:   string;
  dateTo?:     string;
  search?:     string;
  status?:     'success' | 'failure' | 'partial';
}

export interface AuditEntry {
  action:       AuditAction;
  module:       AuditModule;
  entityType:   string;
  entityId?:    string;
  entityLabel?: string;
  oldValues?:   Record<string, unknown>;
  newValues?:   Record<string, unknown>;
  context?:     AuditContext;
  status?:      'success' | 'failure' | 'partial';
  errorMessage?: string;
}

export interface AuditLog {
  id:            string;
  userId?:       string;
  userEmail?:    string;
  userRole?:     string;
  actorType:     ActorType;
  action:        AuditAction;
  module:        AuditModule;
  entityType:    string;
  entityId?:     string;
  entityLabel?:  string;
  oldValues?:    Record<string, unknown>;
  newValues?:    Record<string, unknown>;
  changedFields?: string[];
  diff?:         Record<string, { from: unknown; to: unknown }>;
  ipAddress?:    string;
  correlationId?: string;
  source:        string;
  status:        'success' | 'failure' | 'partial';
  errorMessage?: string;
  notes?:        string;
  createdAt:     string;
}

// ── Diff Calculator ───────────────────────────────────────────

function computeDiff(
  oldValues?: Record<string, unknown>,
  newValues?:  Record<string, unknown>
): {
  changedFields: string[];
  diff:          Record<string, { from: unknown; to: unknown }>;
} {
  if (!oldValues || !newValues) {
    return { changedFields: [], diff: {} };
  }

  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([
    ...Object.keys(oldValues),
    ...Object.keys(newValues),
  ]);

  // Skip noisy/internal fields
  const skipFields = new Set([
    'updated_at', 'created_at', 'deleted_at',
  ]);

  for (const key of allKeys) {
    if (skipFields.has(key)) continue;
    const oldVal = oldValues[key];
    const newVal = newValues[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { from: oldVal, to: newVal };
    }
  }

  return {
    changedFields: Object.keys(diff),
    diff,
  };
}

// ── Main Audit Service ────────────────────────────────────────

export const auditService = {

  // ── Log a single audit entry ───────────────────────────────
  async log(entry: AuditEntry, clientOverride?: any): Promise<string | null> {
    try {
      // Use provided client (e.g. supabaseAdmin in workers) or default to standard supabase
      const client = clientOverride ?? supabase;

      // Automatically attempt to resolve current user if context is missing
      let context = entry.context;
      if (!context || (!context.userId && !context.userEmail)) {
        const { data: { user } } = await client.auth.getUser();
        context = {
          ...context,
          userId: user?.id ?? context?.userId,
          userEmail: user?.email ?? context?.userEmail,
          actorType: user ? 'user' : (context?.actorType ?? 'system'),
          source: context?.source ?? 'web',
        };
      }

      const { data, error } = await client
        .from('audit_logs')
        .insert({
          // WHO
          user_id:        context.userId       ?? null,
          user_email:     context.userEmail    ?? null,
          user_role:      context.userRole     ?? null,
          actor_type:     context.actorType    ?? 'user',

          // WHAT
          action:         entry.action,

          // WHICH
          module:         entry.module,
          entity_type:    entry.entityType,
          entity_id:      entry.entityId              ?? null,
          entity_label:   entry.entityLabel           ?? null,

          // CHANGE
          old_data:       entry.oldValues             ?? null,
          new_data:       entry.newValues             ?? null,

          // CONTEXT
          ip_address:     context.ipAddress    ?? null,
          correlation_id: context.correlationId ?? null,
          source:         context.source       ?? 'web',
          notes:          context.notes        ?? null,

          // OUTCOME
          status:         entry.status                ?? 'success',
          error_message:  entry.errorMessage          ?? null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Audit] Failed to log:', error.message);
        return null;
      }

      return data?.id ?? null;

    } catch (e: any) {
      // NEVER let audit failure crash the main operation
      console.error('[Audit] Exception:', e.message);
      return null;
    }
  },

  // ── Convenience wrappers ───────────────────────────────────

  async logCreate(
    module:      AuditModule,
    entityType:  string,
    entityId:    string,
    entityLabel: string,
    newValues:   Record<string, unknown>,
    context?:    AuditContext,
    client?:     any
  ) {
    return this.log({
      action: 'CREATE', module, entityType,
      entityId, entityLabel, newValues, context,
    }, client);
  },

  async logUpdate(
    module:      AuditModule,
    entityType:  string,
    entityId:    string,
    entityLabel: string,
    oldValues:   Record<string, unknown>,
    newValues:   Record<string, unknown>,
    context?:    AuditContext,
    client?:     any
  ) {
    return this.log({
      action: 'UPDATE', module, entityType,
      entityId, entityLabel, oldValues, newValues, context,
    }, client);
  },

  async logDelete(
    module:      AuditModule,
    entityType:  string,
    entityId:    string,
    entityLabel: string,
    oldValues:   Record<string, unknown>,
    context?:    AuditContext,
    client?:     any
  ) {
    return this.log({
      action: 'DELETE', module, entityType,
      entityId, entityLabel, oldValues, context,
    }, client);
  },

  async logFinancial(
    action:      'APPROVE' | 'REJECT' | 'SEND' | 'PAY' | 'VOID' | 'WRITEOFF',
    module:      AuditModule,
    entityType:  string,
    entityId:    string,
    entityLabel: string,
    values:      Record<string, unknown>,
    context?:    AuditContext,
    client?:     any
  ) {
    return this.log({
      action, module, entityType,
      entityId, entityLabel, newValues: values, context,
    }, client);
  },

  // ── Query methods ────────────────────────────────────────

  async getEntityHistory(
    entityType: string,
    entityId:   string,
    limit:      number = 50
  ): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id',   entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []).map(mapRow);
  },

  async getUserActivity(
    userId: string,
    limit:  number = 100
  ): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []).map(mapRow);
  },

  async getModuleActivity(
    module?:    AuditModule,
    dateFrom?: string,
    dateTo?:   string,
    limit:     number = 200
  ): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (module) {
      query = query.eq('module', module);
    }

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo)   query = query.lte('created_at', dateTo);

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map(mapRow);
  },

  async getFinancialAudit(
    dateFrom?: string,
    dateTo?:   string
  ): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .in('module', ['invoice', 'billing', 'sales'])
      .in('action', ['APPROVE','PAY','VOID','WRITEOFF','SEND','REJECT'])
      .order('created_at', { ascending: false })
      .limit(500);

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo)   query = query.lte('created_at', dateTo);

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map(mapRow);
  },
};

// ── Row mapper ────────────────────────────────────────────────
function mapRow(row: any): AuditLog {
  const oldValues = row.old_data;
  const newValues = row.new_data;
  const { changedFields, diff } = computeDiff(oldValues, newValues);

  return {
    id:            row.id,
    userId:        row.user_id,
    userEmail:     row.user_email,
    userRole:      row.user_role,
    actorType:     row.actor_type,
    action:        row.action,
    module:        row.module,
    entityType:    row.entity_type,
    entityId:      row.entity_id,
    entityLabel:   row.entity_label,
    oldValues:     oldValues,
    newValues:     newValues,
    changedFields: changedFields,
    diff:          diff,
    ipAddress:     row.ip_address,
    correlationId: row.correlation_id,
    source:        row.source,
    status:        row.status,
    errorMessage:  row.error_message,
    notes:         row.notes,
    createdAt:     row.created_at,
  };
}

// ── Context builder (call in React components) ────────────────
export function buildAuditContext(
  user:    { id: string; email?: string } | null,
  options: Partial<AuditContext> = {}
): AuditContext {
  return {
    userId:    user?.id,
    userEmail: user?.email,
    actorType: 'user',
    source:    'web',
    ...options,
  };
}
