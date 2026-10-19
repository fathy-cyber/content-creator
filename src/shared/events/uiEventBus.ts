// src/shared/events/uiEventBus.ts
// ════════════════════════════════════════════════════════════════
// Lightweight local event emitter for UI-only notifications.
// Not persisted. Used for triggering re-fetches, toasts, etc.
// ════════════════════════════════════════════════════════════════

type Handler = (payload: any) => void;

class UIEventBus {
  private listeners = new Map<string, Set<Handler>>();

  emit(eventName: string, payload?: any): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (e) {
          console.error(`[UIEventBus] Error in handler for ${eventName}:`, e);
        }
      });
    }
  }

  on(eventName: string, handler: Handler): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(handler);
    
    return () => {
      this.listeners.get(eventName)?.delete(handler);
    };
  }

  off(eventName: string, handler: Handler): void {
    this.listeners.get(eventName)?.delete(handler);
  }
}

export const uiEventBus = new UIEventBus();
