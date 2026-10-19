/**
 * React integration for the Module Kernel.
 * 
 * Provides KernelProvider context and hooks to access
 * the kernel, its services, and module data from React components.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { kernel, Kernel } from '../kernel/Kernel';
import { supabase } from '../../lib/supabase';
import { SupabaseAdapter } from '../orm/SupabaseAdapter';
import type { Environment } from '../orm/environment';
import type {
  ModuleState,
  RouteDefinition,
  SidebarItem,
  ModelDefinition,
  ModuleManifest,
} from '../types/ModuleManifest';

// ─── Context ───────────────────────────────────────────────

interface KernelContextValue {
  kernel: Kernel;
  env: Environment | null;
  isBooted: boolean;
  modules: ModuleState[];
  activeModules: ModuleState[];
  routes: RouteDefinition[];
  sidebarItems: SidebarItem[];
  models: ModelDefinition[];
  installModule: (id: string) => Promise<boolean>;
  uninstallModule: (id: string) => Promise<boolean>;
  isModuleActive: (id: string) => boolean;
  refreshModules: () => void;
}

const KernelContext = createContext<KernelContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────

interface KernelProviderProps {
  children: React.ReactNode;
  manifests: ModuleManifest[];
  installedIds?: string[];
}

export function KernelProvider({ children, manifests, installedIds }: KernelProviderProps) {
  const [isBooted, setIsBooted] = useState(false);
  const [revision, setRevision] = useState(0);
  const bootStarted = React.useRef(false);
 
  // Register and boot
  useEffect(() => {
    if (kernel.isBooted) {
      setIsBooted(true);
      return;
    }
    if (bootStarted.current) return;
    bootStarted.current = true;
 
    async function boot() {

      const adapter = new SupabaseAdapter(supabase);
      await kernel.init(adapter);
      
      kernel.registerModules(manifests);
      await kernel.boot(installedIds);
      setIsBooted(true);
    }
    boot().catch(console.error);
  }, []); // Boot once

  // Listen for module changes to trigger re-renders
  useEffect(() => {
    const unsub1 = kernel.events.on('kernel:module.installed', () => setRevision(r => r + 1));
    const unsub2 = kernel.events.on('kernel:module.uninstalled', () => setRevision(r => r + 1));
    const unsub3 = kernel.events.on('kernel:module.activated', () => setRevision(r => r + 1));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const modules = useMemo(() => kernel.getModules(), [revision, isBooted]);
  const activeModules = useMemo(() => kernel.getModules('active'), [revision, isBooted]);
  const routes = useMemo(() => kernel.getRoutes(), [revision, isBooted]);
  const sidebarItems = useMemo(() => kernel.getSidebarItems(), [revision, isBooted]);
  const models = useMemo(() => kernel.getModels(), [revision, isBooted]);

  const env = useMemo(() => {
    if (!isBooted || !kernel.adapter) return null;
    return kernel.createEnv('current_user');
  }, [revision, isBooted]);

  const installModule = useCallback(async (id: string) => {
    const result = await kernel.installModule(id);
    if (result) setRevision(r => r + 1);
    return result;
  }, []);

  const uninstallModule = useCallback(async (id: string) => {
    const result = await kernel.uninstallModule(id);
    if (result) setRevision(r => r + 1);
    return result;
  }, []);

  const isModuleActive = useCallback((id: string) => {
    return kernel.getModule(id)?.status === 'active';
  }, [revision]);

  const refreshModules = useCallback(() => {
    setRevision(r => r + 1);
  }, []);

  const value: KernelContextValue = {
    kernel,
    env,
    isBooted,
    modules,
    activeModules,
    routes,
    sidebarItems,
    models,
    installModule,
    uninstallModule,
    isModuleActive,
    refreshModules,
  };

  return (
    <KernelContext.Provider value={value}>
      {children}
    </KernelContext.Provider>
  );
}

// ─── Hooks ─────────────────────────────────────────────────

export function useKernel(): KernelContextValue {
  const ctx = useContext(KernelContext);
  if (!ctx) throw new Error('useKernel must be used within a KernelProvider');
  return ctx;
}

export function useModules() {
  const { modules, activeModules, installModule, uninstallModule, isModuleActive } = useKernel();
  return { modules, activeModules, installModule, uninstallModule, isModuleActive };
}

export function useRoutes() {
  return useKernel().routes;
}

export function useSidebarItems() {
  return useKernel().sidebarItems;
}

export function useModels() {
  return useKernel().models;
}

export function useModel(modelName: string) {
  const { env } = useKernel();
  return env.models[modelName];
}

export function useEnv() {
  return useKernel().env;
}
