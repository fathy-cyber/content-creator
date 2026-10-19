// src/shared/auth/usePermission.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────
export type Resource =
  | 'invoices' | 'projects' | 'billing'
  | 'clients'  | 'orders'   | 'tickets';

export type Action =
  | 'create' | 'read'   | 'update'
  | 'delete' | 'approve'| 'send'
  | 'confirm'| 'cancel' | 'complete'
  | 'adjust' | 'writeoff'| 'assign'
  | 'resolve';

export interface UsePermissionResult {
  can:       (resource: Resource, action: Action) => boolean;
  isLoading: boolean;
}

// ── Permission cache (per session) ────────────────────────────
const permissionCache = new Map<string, boolean>();

export function usePermission(): UsePermissionResult {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading]     = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setPermissions(new Set());
      setIsLoading(false);
      return;
    }

    const loadPermissions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            role:roles (
              role_permissions (
                permission:permissions (resource, action)
              )
            )
          `)
          .eq('user_id', user.id)
          .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

        if (error) throw error;

        const perms = new Set<string>();
        for (const ur of data ?? []) {
          for (const rp of (ur.role as any)?.role_permissions ?? []) {
            const p = rp.permission;
            if (p) perms.add(`${p.resource}:${p.action}`);
          }
        }
        setPermissions(perms);
      } catch (e) {
        console.error('[RBAC] Failed to load permissions:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [user?.id]);

  const can = useCallback(
    (resource: Resource, action: Action): boolean => {
      return permissions.has(`${resource}:${action}`);
    },
    [permissions]
  );

  return { can, isLoading };
}
