// src/shared/realtime/useRealtimeTable.ts

import { useEffect, useCallback, useRef } from 'react';
import { realtimeGateway } from './RealtimeGateway';

interface UseRealtimeTableOptions<T> {
  table:       string;
  channelName: string;
  filter?:     string;
  onInsert?:   (record: T) => void;
  onUpdate?:   (record: T) => void;
  onDelete?:   (record: T) => void;
  enabled?:    boolean;
}

export function useRealtimeTable<T>({
  table,
  channelName,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeTableOptions<T>) {

  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  // Keep refs current without re-subscribing
  useEffect(() => { onInsertRef.current = onInsert; }, [onInsert]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onDeleteRef.current = onDelete; }, [onDelete]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = realtimeGateway.subscribe<T>(
      channelName,
      table,
      ({ eventType, new: newRecord, old: oldRecord }) => {
        if (eventType === 'INSERT' && newRecord) {
          onInsertRef.current?.(newRecord);
        } else if (eventType === 'UPDATE' && newRecord) {
          onUpdateRef.current?.(newRecord);
        } else if (eventType === 'DELETE' && oldRecord) {
          onDeleteRef.current?.(oldRecord);
        }
      },
      filter
    );

    return unsubscribe;
  }, [channelName, table, filter, enabled]);
}

// ── Pre-built hooks per module ────────────────────────────────
export function useRealtimeInvoices(
  onUpdate: (invoice: any) => void,
  clientId?: string
) {
  useRealtimeTable({
    table:       'invoices',
    channelName: `invoices${clientId ? `-${clientId}` : ''}`,
    filter:      clientId ? `client_id=eq.${clientId}` : undefined,
    onInsert:    onUpdate,
    onUpdate,
  });
}

export function useRealtimeProjects(onUpdate: (project: any) => void) {
  useRealtimeTable({
    table:       'projects',
    channelName: 'projects-changes',
    onInsert:    onUpdate,
    onUpdate,
  });
}

export function useRealtimeBillingSessions(
  onUpdate: (session: any) => void,
  projectId?: string
) {
  useRealtimeTable({
    table:       'billing_sessions',
    channelName: `billing-sessions${projectId ? `-${projectId}` : ''}`,
    filter:      projectId ? `project_id=eq.${projectId}` : undefined,
    onInsert:    onUpdate,
    onUpdate,
  });
}

export function useRealtimeTickets(onUpdate: (ticket: any) => void) {
  useRealtimeTable({
    table:       'tickets',
    channelName: 'tickets-changes',
    onInsert:    onUpdate,
    onUpdate,
  });
}

export function useRealtimeEventStore(onEvent: (event: any) => void) {
  useRealtimeTable({
    table:       'event_store',
    channelName: 'event-store-monitor',
    onInsert:    onEvent,
    onUpdate:    onEvent,
  });
}
