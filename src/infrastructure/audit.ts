// src/infrastructure/audit.ts
import { auditService, type AuditEntry, type AuditModule } from '../shared/audit/auditService';

export async function auditLog(data: AuditEntry): Promise<void> {
  // Default to standard client for general use
  await auditService.log(data);
}

export async function fetchAuditLogs(filters: { entityType?: string; limit?: number; offset?: number } = {}) {
  return await auditService.getModuleActivity(
    (filters.entityType as AuditModule) || 'system',
    undefined,
    undefined,
    filters.limit || 100
  );
}



