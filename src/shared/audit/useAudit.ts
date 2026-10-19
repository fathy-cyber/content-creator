// src/shared/audit/useAudit.ts

import { useCallback }   from 'react';
import { useAuth }       from '../../contexts/AuthContext';
import {
  auditService,
  buildAuditContext,
  type AuditAction,
  type AuditModule,
  type AuditContext,
} from './auditService';

export function useAudit(module: AuditModule) {
  const { user } = useAuth();

  const getContext = useCallback(
    (extra?: Partial<AuditContext>): AuditContext =>
      buildAuditContext(user, extra),
    [user]
  );

  const log = useCallback(
    (
      action:       AuditAction,
      entityType:   string,
      entityId:     string,
      entityLabel:  string,
      options?: {
        oldValues?:  Record<string, unknown>;
        newValues?:  Record<string, unknown>;
        notes?:      string;
      }
    ) => auditService.log({
      action,
      module,
      entityType,
      entityId,
      entityLabel,
      oldValues:  options?.oldValues,
      newValues:  options?.newValues,
      context:    getContext({ notes: options?.notes }),
    }),
    [module, getContext]
  );

  return { log, getContext };
}
