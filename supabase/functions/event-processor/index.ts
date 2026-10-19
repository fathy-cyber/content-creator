import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Event Processor Edge Function
 * Triggered by pg_cron to process pending events.
 */
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    const { action } = await req.json();

    if (action === 'process_pending') {
      // Fetch pending events older than 10 seconds
      const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
      const { data: events, error } = await supabase
        .from('event_store')
        .select('*')
        .eq('status', 'pending')
        .lte('process_after', tenSecondsAgo)
        .or('process_after.is.null,process_after.lte.' + tenSecondsAgo);

      if (error) throw error;

      const results = await Promise.all(events.map(async (event) => {
        try {
          // Dispatch to module-specific webhook (example)
          const moduleWebhook = `https://your-project.supabase.co/functions/v1/${event.source_module}-handler`;
          const res = await fetch(moduleWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          });

          if (!res.ok) throw new Error(`Module handler responded with ${res.status}`);

            await supabase.from('event_store').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', event.id);
          return { id: event.id, status: 'success' };
        } catch (e) {
          await supabase.from('event_store').update({ 
            status: 'failed', 
            error: e.message,
            attempts: event.attempts + 1
          }).eq('id', event.id);
          return { id: event.id, status: 'failed', error: e.message };
        }
      }));

      return new Response(JSON.stringify({ processed: results.length, results }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
