import { EventName, EventPayloadMap, EventHandler } from './types';
import { eventStore } from './EventStore';
import { serviceRegistry } from '../registry/ServiceRegistry';

/**
 * EventBus is the central communication hub.
 * It ensures that all events are persisted before being dispatched.
 * 
 * Supports exact match and wildcard listeners:
 *   eventBus.on('crm:contact.created', handler)
 *   eventBus.on('crm:*', handler)       // all crm events
 *   eventBus.on('*', handler)            // all events
 */
export class EventBus {
    private handlers = new Map<string, Set<EventHandler<any>>>();
    private channels = new Map<string, Set<EventHandler<any>>>();
    private broadcastProvider?: (message: any) => void;

    /**
     * Emits an event. 
     * 1. Persists to EventStore FIRST.
     * 2. Dispatches to all registered handlers (including wildcards).
     */
    async emit(
        eventName: string,
        payload: any,
        options?: string | { sourceModule?: string; workspaceId?: string; sourceEntityId?: string },
    ): Promise<void> {
        let eventId: string | undefined;
        const sourceModule = typeof options === 'string' ? options : options?.sourceModule || 'system';
        const workspaceId = typeof options === 'object' ? options?.workspaceId : undefined;

        try {
            // 1. Persist to EventStore first
            eventId = await eventStore.persistEvent({
                event_name: eventName as any,
                payload,
                source_module: sourceModule,
                workspace_id: workspaceId,
            });
        } catch (e) {
            console.error(`[EventBus] Failed to persist event ${eventName}:`, e);
        }

        await this.dispatch(eventName, payload, eventId);
    }

    /**
     * Dispatches an event to all matching handlers.
     */
    async dispatch(eventName: string, payload: any, eventId?: string): Promise<void> {
        // Find all matching handlers (exact match and wildcards)
        const matchingHandlers = new Set<EventHandler<any>>();
        
        for (const [pattern, handlers] of this.handlers.entries()) {
            if (this.matchPattern(pattern, eventName)) {
                handlers.forEach(h => matchingHandlers.add(h));
            }
        }

        if (matchingHandlers.size === 0) {
            if (eventId) await eventStore.markDelivered(eventId);
            return;
        }

        const handlerPromises = Array.from(matchingHandlers).map(async (handler) => {
            try {
                await handler(payload);
            } catch (error: any) {
                console.error(`[EventBus] Handler for ${eventName} failed:`, error);
                if (eventId) await eventStore.markFailed(eventId, error.message);
                throw error;
            }
        });

        try {
            await Promise.all(handlerPromises);
            if (eventId) await eventStore.markDelivered(eventId);
        } catch (e) {
            // Individual handler failures are handled inside the map.
        }
    }

    /**
     * Registers a handler for a specific event pattern.
     * Supports legacy signature: on(pattern, handlerName, module, handler)
     * Returns an unsubscribe function.
     */
    on<T = any>(pattern: T, arg2: any, arg3?: any, arg4?: any): () => void {
        let handler: EventHandler<any>;
        
        if (typeof arg2 === 'function') {
            handler = arg2;
        } else if (typeof arg4 === 'function') {
            handler = arg4;
        } else {
            throw new Error(`[EventBus] Invalid handler registration for pattern "${pattern}"`);
        }

        if (!this.handlers.has(pattern as string)) {
            this.handlers.set(pattern as string, new Set());
        }
        this.handlers.get(pattern as string)!.add(handler);

        return () => this.off(pattern as string, handler);
    }

    /**
     * Removes a handler for a specific event pattern.
     */
    off<T = any>(pattern: T, handler: EventHandler<any>): void {
        const eventHandlers = this.handlers.get(pattern as string);
        if (eventHandlers) {
            eventHandlers.delete(handler);
        }
    }

    /**
     * Registers a handler that only runs once.
     */
    async once<T = any>(pattern: T, handler: EventHandler<any>): Promise<void> {
        const wrapper = async (payload: any) => {
            this.off(pattern, wrapper);
            await handler(payload);
        };
        this.on(pattern, wrapper);
    }

    /**
     * Check if a pattern matches an event name.
     */
    private matchPattern(pattern: string, event: string): boolean {
        if (pattern === '*') return true;
        if (pattern === event) return true;

        if (pattern.endsWith(':*')) {
            const prefix = pattern.slice(0, -1);
            return event.startsWith(prefix);
        }

        if (pattern.endsWith('.*')) {
            const prefix = pattern.slice(0, -1);
            return event.startsWith(prefix);
        }

        return false;
    }

    /**
     * Odoo-style Bus Channel: Subscribe
     */
    subscribe(channel: string, handler: EventHandler<any>): () => void {
        if (!this.channels.has(channel)) {
            this.channels.set(channel, new Set());
        }
        this.channels.get(channel)!.add(handler);
        return () => this.channels.get(channel)?.delete(handler);
    }

    /**
     * Odoo-style Bus Channel: Publish
     */
    publish(channel: string, payload: any, userId?: string): void {
        const message = {
            channel,
            payload,
            timestamp: Date.now(),
            userId,
        };

        const handlers = this.channels.get(channel);
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(payload, channel);
                } catch (err) {
                    console.error(`[EventBus] Error in channel "${channel}" handler:`, err);
                }
            }
        }

        if (this.broadcastProvider) {
            this.broadcastProvider(message);
        }
    }

    setBroadcastProvider(provider: (message: any) => void): void {
        this.broadcastProvider = provider;
    }

    async replayPendingEvents(): Promise<number> {
        const pendingEvents = await eventStore.getPendingEvents();
        if (pendingEvents.length === 0) return 0;

        for (const event of pendingEvents) {
            await this.dispatch(
                event.event_name,
                event.payload,
                event.id
            );
        }

        return pendingEvents.length;
    }

    listHandlers(pattern: string): number {
        return this.handlers.get(pattern)?.size || 0;
    }
}

export const eventBus = new EventBus();

export async function initEventBus(): Promise<void> {
    await eventBus.replayPendingEvents();
}

// Register with ServiceRegistry
serviceRegistry.registerService('eventBus', eventBus);
