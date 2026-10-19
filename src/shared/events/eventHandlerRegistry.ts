// src/shared/events/eventHandlerRegistry.ts
// ════════════════════════════════════════════════════════════════
// Central registry for all module-specific event handlers.
// Called during app startup to ensure all handlers are attached to the bus.
// ════════════════════════════════════════════════════════════════

import { registerProjectEventHandlers } from '@/modules/projects/events/projectEventHandlers';
import { registerBillingEventHandlers } from '@/modules/billing/billingService';

export async function registerAllEventHandlers(): Promise<void> {
  console.log('[EventHandlerRegistry] Registering all module handlers...');
  
  try {
    // Project Module
    registerProjectEventHandlers();
    
    // Billing Module
    registerBillingEventHandlers();
    
    // Add other modules here as they are implemented
    // registerMarketingEventHandlers();
    // registerSupportEventHandlers();

    console.log('[EventHandlerRegistry] All handlers registered successfully ✓');
  } catch (e) {
    console.error('[EventHandlerRegistry] Error registering handlers:', e);
    throw e;
  }
}
