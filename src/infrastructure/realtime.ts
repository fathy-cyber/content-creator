// src/infrastructure/realtime.ts
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeCallback<T = unknown> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new:       T | null;
  old:       T | null;
}) => void;

class RealtimeGateway {
  private channels = new Map<string, RealtimeChannel>();

  subscribe<T>(channelName: string, table: string, callback: RealtimeCallback<T>, filter?: string): () => void {
    if (this.channels.has(channelName)) return () => this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes' as any, { event: '*', schema: 'public', table, filter }, (payload: any) => {
        callback({ eventType: payload.eventType, new: payload.new as T ?? null, old: payload.old as T ?? null });
      })
      .subscribe();

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

  // New: Emit a generic realtime event for UI notifications
  async notify(channel: string, payload: any) {
    await supabase.channel(channel).send({
      type: 'broadcast',
      event: 'system_notification',
      payload,
    });
  }
}

export const realtimeGateway = new RealtimeGateway();
