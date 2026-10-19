import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { KernelProvider, useRoutes } from './core/react/KernelProvider';
import { ModuleLoadingFallback } from './core/kernel/ModuleLoader';
import { Toaster } from 'sonner';
import { discoverModules } from './core/kernel/ModuleDiscovery';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));

// Auth + public pages (always available, not module-gated)
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Onboarding = lazy(() => import('./pages/auth/Onboarding'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Landing = lazy(() => import('./pages/public/Landing'));
const Pricing = lazy(() => import('./pages/public/Pricing'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

export default function App() {
  const [manifests, setManifests] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const discovered = await discoverModules();
      setManifests(discovered);
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) {
    return <ModuleLoadingFallback />;
  }

    return (
      <AuthProvider>
        <Router>
          <Suspense fallback={<ModuleLoadingFallback />}>
            <Routes>
              {/* Public Routes - Outside KernelProvider to ensure they always load */}
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected/Kernel Routes */}
              <Route
                element={
                  <KernelProvider manifests={manifests} installedIds={defaultInstalledIds}>
                    <DashboardLayout />
                  </KernelProvider>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
                <Route path="/*" element={<DynamicModuleRoutes />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </Suspense>
        </Router>
      </AuthProvider>
    );
}

const defaultInstalledIds = [
  'dashboard', 'app-store', 'core-chat',
  'business-advisory', 'marketing', 'automation',
  'content-hub', 'support', 'strategy', 'settings',
  'crm',
  'inventory', 'sales', 'project', 'invoice', 'hrm',
  'marketing-hub',
  'billing',
  'social',
];

// AppRoutes is now integrated directly into App for better structure and stability.
// Remove old AppRoutes definition.

/**
 * DynamicModuleRoutes — Renders routes from all active kernel modules.
 * Replaces the previous 100+ hardcoded <Route> declarations.
 */
function DynamicModuleRoutes() {
  const routes = useRoutes();

  return (
    <Suspense fallback={<ModuleLoadingFallback />}>
      <Routes>
        {routes.map((route) => (
          <Route
            // @ts-ignore - React 19 typing issue with react-router
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<ModuleLoadingFallback />}>
                <route.component />
              </Suspense>
            }
          />
        ))}
      </Routes>
    </Suspense>
  );
}
