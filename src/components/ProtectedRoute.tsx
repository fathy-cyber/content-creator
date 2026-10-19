import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface ProtectedRouteProps {
  appId: string;
  children: React.ReactNode;
}

export default function ProtectedRoute({ appId, children }: ProtectedRouteProps) {
  const { isInstalled } = useAppStore();
  const location = useLocation();

  if (!isInstalled(appId)) {
    // In a real app, we'd show a toast here
    console.warn(`Access denied to ${appId}. Redirecting to App Store.`);
    return <Navigate to="/apps" state={{ from: location, error: `Please install the ${appId} module first.` }} replace />;
  }

  return <>{children}</>;
}
