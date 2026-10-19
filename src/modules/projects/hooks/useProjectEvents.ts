// src/modules/projects/hooks/useProjectEvents.ts
// ════════════════════════════════════════════════════════════════
// Hook to listen for project-related UI events and trigger updates.
// Used for tab invalidation (e.g. refresh data when a task is moved).
// ════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { uiEventBus } from '@/shared/events/uiEventBus';
import { EventName } from '@/shared/events/event-names';

export function useProjectEvents(relevantEvents: EventName[]) {
  // We track a version number. When it increments, components using it 
  // (e.g. inside a useQuery dependency array) will automatically re-fetch.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    console.log(`[useProjectEvents] Subscribing to events:`, relevantEvents);
    const unsubscribes = relevantEvents.map(eventName => 
      uiEventBus.on(eventName, (payload) => {
        console.log(`[useProjectEvents] Event received: ${eventName}`, payload);
        setVersion(v => v + 1);
      })
    );
    
    return () => {
      console.log(`[useProjectEvents] Unsubscribing from events`);
      unsubscribes.forEach(unsub => unsub());
    };
  }, [relevantEvents]);


  return version;
}
