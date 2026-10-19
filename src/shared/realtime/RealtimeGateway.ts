// src/shared/realtime/RealtimeGateway.ts
// ════════════════════════════════════════════════════════════════
// Uses Supabase Realtime to push DB changes to all connected clients
// No polling. No manual refresh. UI updates instantly.
// ════════════════════════════════════════════════════════════════

import { supabase } from '../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeCallback<T = unknown> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new:       T | null;
  old:       T | null;
}) => void;

class RealtimeGateway {
  private channels = new Map<string, RealtimeChannel>();

  // ── Subscribe to a table's changes ──────────────────────────
  subscribe<T>(
    channelName: string,
    table:       string,
    callback:    RealtimeCallback<T>,
    filter?:     string    // e.g., 'status=eq.pending'
  ): () => void {           // returns unsubscribe function

    // Reuse existing channel if same name
    if (this.channels.has(channelName)) {
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event:  '*',
          schema: 'public',
          table,
          filter,
        },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new:       payload.new  as T ?? null,
            old:       payload.old  as T ?? null,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] ✅ Subscribed: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] ❌ Error on channel: ${channelName}`);
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    for (const [name] of this.channels) {
      this.unsubscribe(name);
    }
  }
}

export const realtimeGateway = new RealtimeGateway();
