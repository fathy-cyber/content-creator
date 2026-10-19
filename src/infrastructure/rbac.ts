// src/infrastructure/rbac.ts
import { supabase } from '../lib/supabase';

export type Resource = 'invoices' | 'projects' | 'billing' | 'clients' | 'orders' | 'tickets';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'send' | 'confirm' | 'cancel' | 'complete' | 'adjust' | 'writeoff' | 'assign' | 'resolve';

export async function checkPermission(userId: string, resource: Resource, action: Action): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
  });

  if (error) {
    console.error(`[RBAC] Permission check error: ${error.message}`);
    return false;
  }

  return !!data;
}
