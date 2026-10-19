// src/shared/auth/PermissionGuard.tsx

import React, { type ReactNode } from 'react';
import { usePermission, type Resource, type Action } from './usePermission';

interface Props {
  resource:  Resource;
  action:    Action;
  fallback?: ReactNode;
  children:  ReactNode;
}

export function PermissionGuard({
  resource, action, fallback = null, children,
}: Props) {
  const { can, isLoading } = usePermission();

  if (isLoading) return null;
  if (!can(resource, action)) return <>{fallback}</>;
  return <>{children}</>;
}
