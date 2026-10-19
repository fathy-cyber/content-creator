/**
 * Core Public API
 * This is the only entry point modules are allowed to use for core services.
 */

export { serviceRegistry } from './registry/ServiceRegistry';
export { moduleRegistry } from './registry/ModuleRegistry';
export { getService, registerService } from './registry/ServiceRegistry'; 
 // Note: getService/registerService need to be exported from ServiceRegistry class or as standalone functions. 

// I'll update ServiceRegistry.ts to export these standalone functions for convenience.
// For now, I'll export the instances.

export { eventBus } from './events/EventBus';
export { contextBridge } from './context/ContextBridge';
export { useContextStore } from './context/ContextStore';

// Shared Types
export * from './types'; // If types.ts exists at src/core/types.ts
export * from './assets/types';
export * from './brand/types';
export * from './context/types';
export * from './events/types';
export * from './rbac/types';
export * from './audit/types';
