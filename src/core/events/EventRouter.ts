import { eventBus, EventBus } from './EventBus';
import { eventStore, EventStore } from './EventStore';
import { createClient } from '@supabase/supabase-js';
import { useContextStore } from '../context/ContextStore';
import { serviceRegistry } from '../registry/ServiceRegistry';
import { AssetManager } from '../assets/AssetManager';
import { BrandVoiceService } from '../brand/BrandVoiceService';
import { BrandVoiceInjector } from '../brand/BrandVoiceInjector';

/**
 * EventRouter manages cross-module event listeners and recovery.
 */
export class EventRouter {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    async initEventRouter(): Promise<void> {
        await this.replayPendingEvents();
        this.setupRealtimeSubscription();
        this.registerCrossModuleListeners();
        console.log('[EventRouter] Initialized and listening.');
    }

    private async replayPendingEvents(): Promise<void> {
        const pending = await eventStore.getPendingEvents();
        if (pending.length === 0) return;

        console.log(`[EventRouter] Replaying ${pending.length} pending events...`);
        for (const event of pending) {
            const handlers = (eventBus as any).handlers.get(event.event_name);
            if (handlers) {
                for (const handler of handlers) {
                    try {
                        await handler(event.payload);
                    } catch (e) {
                        await eventStore.markFailed(event.id!, (e as Error).message);
                    }
                }
                await eventStore.markDelivered(event.id!);
            }
        }
    }

    private setupRealtimeSubscription(): void {
        this.supabase
            .channel('public:events')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
                const event = payload.new as any;
                console.log(`[EventRouter] Realtime event received: ${event.event_name}`);
            })
            .subscribe();
    }

    private registerCrossModuleListeners(): void {
        eventBus.on('business.plan.finalized', async ({ planId, clientId }) => {
            const assets = serviceRegistry.getService<AssetManager>('assets');
            await assets.createAsset({
                workspace_id: useContextStore.getState().activeWorkspaceId,
                title: `Marketing Strategy for Plan ${planId}`,
                type: 'plan',
                client_id: clientId,
                entity_type: 'plan',
                entity_id: planId,
                content: 'Generated strategy based on finalized business plan...',
            });
        });

        eventBus.on('support.complaint.received', async ({ ticketId, severity }) => {
            if (severity === 'high') {
                await eventBus.emit('strategy.improvement.suggested', {
                    ticketId,
                    reason: 'High severity complaint received',
                }, 'core');
            }
        });

        eventBus.on('context.client.changed', async ({ clientId }) => {
            const injector = serviceRegistry.getService<BrandVoiceInjector>('brandVoiceInjector');
            injector.invalidateCache(clientId || ''); 
        });

        eventBus.on('asset.approved', async ({ assetId, platform }) => {
            if (platform) {
                await eventBus.emit('social.post.ready_to_schedule', { assetId, platform }, 'core');
            }
        });

        eventBus.on('social.post.published', async ({ publishJobId, platform }) => {
            const analytics = serviceRegistry.getService<any>('marketing.analytics');
            if (analytics) {
                await analytics.attributePostToCampaign(publishJobId, platform);
            }
        });

        eventBus.on('marketing.lead.scored', async ({ leadId, score }) => {
            if (score >= 70) {
                const crm = serviceRegistry.getService<any>('crm');
                if (crm) await crm.createContactFromLead(leadId);
            }
        });

        eventBus.on('client.created', async ({ clientId }) => {
            const brandVoice = serviceRegistry.getService<BrandVoiceService>('brandVoice');
            await brandVoice.createBrandVoice({
                workspace_id: useContextStore.getState().activeWorkspaceId,
                client_id: clientId,
                name: 'Default Voice',
                tone_descriptors: ['Professional', 'Trustworthy'],
                forbidden_words: [],
                value_propositions: [],
                approved_phrases: [],
                legal_constraints: [],
                competitive_differentiators: [],
                is_default: true,
            });
        });
    }
}

export const eventRouter = new EventRouter();
