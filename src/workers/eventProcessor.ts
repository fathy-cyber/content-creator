// src/workers/eventProcessor.ts
import { supabase } from '../lib/supabase';
import { eventBus } from '../core/events/EventBus';
import { realtimeGateway } from '../infrastructure/realtime';

/**
 * Background worker that polls for pending events in the event_store
 * and triggers the corresponding handlers in the eventBus.
 */
export async function processPendingEvents() {
  console.log('[EventProcessor] Scanning for pending events...');
  
  const { data: events, error } = await supabase
    .from('event_store')
    .select('id')
    .in('status', ['pending', 'failed'])
    .lte('process_after', new Date().toISOString())
    .lt('attempts', 3)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('[EventProcessor] Error fetching pending events:', error);
    return;
  }

  if (!events || events.length === 0) {
    return;
  }

  console.log(`[EventProcessor] Found ${events.length} events to process`);

   for (const { id } of events) {
     try {
       // 1. Fetch event details and process via the bus
       const { data: event, error: fetchError } = await supabase
         .from('event_store')
         .select('*')
         .eq('id', id)
         .single();

       if (fetchError || !event) {
         console.error(`[EventProcessor] Failed to fetch event ${id}:`, fetchError);
         continue;
       }

       await eventBus.dispatch(event.event_name, event.payload, id);

       // 2. Notify UI in realtime that a background event was processed
       void realtimeGateway.notify('system-events', {
         type: 'EVENT_PROCESSED',
         eventName: event.event_name,
         entityId: event.source_entity_id,
       });

     } catch (err) {
       console.error(`[EventProcessor] Critical error processing event ${id}:`, err);
     }
   }

}
