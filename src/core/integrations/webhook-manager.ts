import { eventBus } from '../events/EventBus';
import { WebhookPayload, IntegrationId } from './types';

export class WebhookManager {
  private static instance: WebhookManager;

  private constructor() {}

  public static getInstance(): WebhookManager {
    if (!WebhookManager.instance) {
      WebhookManager.instance = new WebhookManager();
    }
    return WebhookManager.instance;
  }

  /**
   * Processes an incoming webhook request.
   * This method would be called by the Next.js Route Handler.
   */
  async handleWebhook(integrationId: IntegrationId, payload: any): Promise<{ success: boolean; message: string }> {
    console.log(`[WebhookManager] Received webhook for integration: ${integrationId}`);

    try {
      // 1. Validate and normalize the payload
      const normalizedPayload: WebhookPayload = {
        integrationId,
        event: payload.event || 'generic.event',
        data: payload.data || payload,
        timestamp: new Date().toISOString(),
      };

      // 2. Publish internal event to the mod-workflow engine
      // We use a specific namespace for integration events
      const internalEventName = `integration:${integrationId}.${normalizedPayload.event}`;
      
      console.log(`[WebhookManager] Publishing internal event: ${internalEventName}`);
      
      // We emit to the event bus. The workflow engine should be listening for these.
       await eventBus.emit(internalEventName, normalizedPayload, 'integrations');

      
      // Also emit a generic integration event for logging/monitoring
       await eventBus.emit('integration:webhook.received', normalizedPayload, 'integrations');


      return { 
        success: true, 
        message: `Webhook processed and event ${internalEventName} published.` 
      };

    } catch (error: any) {
      console.error(`[WebhookManager] Error processing webhook for ${integrationId}:`, error);
      return { 
        success: false, 
        message: `Failed to process webhook: ${error.message}` 
      };
    }
  }
}

export const webhookManager = WebhookManager.getInstance();
