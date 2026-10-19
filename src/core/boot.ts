import { createClient } from '@supabase/supabase-js';
import { serviceRegistry } from './registry/ServiceRegistry';
import { moduleRegistry } from './registry/ModuleRegistry';
import { auditLogger } from './audit/AuditLogger';
import { permissionService } from './rbac/PermissionService';
import { brandVoiceService } from './brand/BrandVoiceService';
import { brandVoiceInjector } from './brand/BrandVoiceInjector';
import { workspaceService } from './services/WorkspaceService';
import { contextBridge } from './context/ContextBridge';
import { eventBus } from './events/EventBus';
import { eventStore } from './events/EventStore';
import { assetManager } from './assets/AssetManager';
import { aiGateway } from './ai/aiGateway';
import { eventRouter } from './events/EventRouter';
import { coreManifest } from './manifest';
import { initSocialListeners } from '../modules/social/events/listeners';

/**
 * bootCore initializes all core services in the required order.
 * This function must be called once at application startup.
 */
export async function bootCore(): Promise<void> {
    try {
        console.log('[Boot] Starting Core Kernel...');

        // 1. Initialize Supabase (handled by providers usually, but ensures env is ready)
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
            process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
        );

        // 2. Register ServiceRegistry (Implicitly registered as it's a singleton)
        
        // 3. Initialize and register AuditLogger
        serviceRegistry.registerService('audit', auditLogger);

        // 4. Initialize and register PermissionService
        serviceRegistry.registerService('permissions', permissionService);
        serviceRegistry.registerService('workspace', workspaceService);

        // 5. Initialize and register Brand Voice
        serviceRegistry.registerService('brandVoice', brandVoiceService);
        serviceRegistry.registerService('brandVoiceInjector', brandVoiceInjector);

        // 6. Initialize and register Context Bridge
        serviceRegistry.registerService('context', contextBridge);
        
        // 7. Initialize and register Event Bus
        serviceRegistry.registerService('eventBus', eventBus);
        serviceRegistry.registerService('eventStore', eventStore);

        // 8. Initialize and register Asset Manager
        serviceRegistry.registerService('assets', assetManager);

        // 9. Initialize AI Gateway
        serviceRegistry.registerService('ai', aiGateway);

        // 10. Register Core Module in ModuleRegistry
        moduleRegistry.registerModule(coreManifest);

        // 11. Initialize Event Router (Listeners + Recovery)
        await eventRouter.initEventRouter();
        await initSocialListeners();

        console.log('[Boot] Core Kernel successfully booted.');
        console.log('[Boot] Registered Services:', serviceRegistry.listServices());
        
    } catch (error: any) {
        console.error('[Boot] CRITICAL FAILURE during core boot:', error);
        // In a real app, we would render a full-screen error overlay here.
        throw error;
    }
}
