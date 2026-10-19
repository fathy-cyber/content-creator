import { createClient } from '@supabase/supabase-js';
import { AppEvent } from './types';

/**
 * EventStore handles the persistence of events to the database.
 * This ensures that events are not lost if the application crashes.
 */
export class EventStore {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    /**
     * Persists an event to the database before it is dispatched.
     */
    async persistEvent(event: Omit<AppEvent, 'id' | 'status' | 'attempts' | 'created_at'>): Promise<string> {
        const { data, error } = await this.supabase
            .from('event_store')
            .insert({
                ...event,
                status: 'pending',
                attempts: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('[EventStore] Failed to persist event:', error);
            throw error;
        }

        return data.id;
    }

    /**
     * Marks an event as successfully delivered.
     */
    async markDelivered(eventId: string): Promise<void> {
        const { error } = await this.supabase
            .from('event_store')
            .update({ 
                status: 'processed', 
                processed_at: new Date().toISOString() 
            })
            .eq('id', eventId);

        if (error) console.error(`[EventStore] Failed to mark delivered ${eventId}:`, error);
    }

    /**
     * Marks an event as failed and schedules a retry.
     */
    async markFailed(eventId: string, error: string): Promise<void> {
        const { data: event, error: fetchError } = await this.supabase
            .from('event_store')
            .select('attempts')
            .eq('id', eventId)
            .single();

        if (fetchError) {
            console.error(`[EventStore] Failed to fetch event for failure marking ${eventId}:`, fetchError);
            return;
        }

        const retryCount = (event?.attempts || 0) + 1;
        const status = retryCount >= 3 ? 'dead' : 'failed';
        
        // Exponential backoff: 1m, 5m, 15m
        const retryDelays = [60000, 300000, 900000];
        const nextRetryAt = new Date(Date.now() + (retryDelays[retryCount - 1] || 900000)).toISOString();

        const { error: updateError } = await this.supabase
            .from('event_store')
            .update({
                status,
                attempts: retryCount,
                error,
                process_after: nextRetryAt,
            })
            .eq('id', eventId);

        if (updateError) console.error(`[EventStore] Failed to mark failed ${eventId}:`, updateError);
    }

    /**
     * Fetches pending events that are ready for retry.
     */
    async getPendingEvents(): Promise<AppEvent[]> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from('event_store')
            .select('*')
            .eq('status', 'pending')
            .lte('process_after', now)
            .or('process_after.is.null,process_after.lte.' + now);

        if (error) {
            console.error('[EventStore] Failed to get pending events:', error);
            return [];
        }

        return (data || []) as AppEvent[];
    }

    /**
     * Fetches dead events for manual intervention.
     */
    async getDeadEvents(): Promise<AppEvent[]> {
        const { data, error } = await this.supabase
            .from('event_store')
            .select('*')
            .eq('status', 'dead');

        if (error) {
            console.error('[EventStore] Failed to get dead events:', error);
            return [];
        }

        return (data || []) as AppEvent[];
    }
}

export const eventStore = new EventStore();
