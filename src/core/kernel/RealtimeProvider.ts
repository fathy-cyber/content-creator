import { EventBus } from '../events/EventBus';
import { BusMessage } from '../events/types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface RealtimeProvider {
  connect(): Promise<void>;
  disconnect(): void;
  send(channel: string, payload: any): void;
  get status(): ConnectionStatus;
}

export class WebSocketProvider implements RealtimeProvider {
  private ws: WebSocket | null = null;
  private url: string;
  private eventBus: EventBus;
  private _status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: BusMessage[] = [];
  private eventHandlers = new Map<string, Set<(data: any) => void>>();

  constructor(url: string, eventBus: EventBus) {
    this.url = url;
    this.eventBus = eventBus;
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  async connect(): Promise<void> {
    if (this._status === 'connected') return;

    this._status = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this._status = 'connected';
          this.reconnectAttempts = 0;
          console.log('[WebSocketProvider] Connected');
          this.flushQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as BusMessage;
            this.eventBus.publish(message.channel, message.payload, message.userId);
          } catch (err) {
            console.error('[WebSocketProvider] Parse error:', err);
          }
        };

        this.ws.onclose = () => {
          this._status = 'disconnected';
          console.log('[WebSocketProvider] Disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocketProvider] Error:', error);
          if (this._status === 'connecting') {
            reject(error);
          }
        };
      } catch (error) {
        this._status = 'disconnected';
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._status = 'disconnected';
  }

  send(channel: string, payload: any): void {
    const message: BusMessage = {
      channel,
      payload,
      timestamp: Date.now(),
    };

    if (this._status !== 'connected') {
      this.messageQueue.push(message);
      return;
    }

    this.ws?.send(JSON.stringify(message));
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws?.send(JSON.stringify(message));
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketProvider] Max reconnect attempts reached');
      return;
    }

    this._status = 'reconnecting';
    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect().catch(() => {
        console.log('[WebSocketProvider] Reconnect failed, retrying...');
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }
}

export class SSEProvider implements RealtimeProvider {
  private eventSource: EventSource | null = null;
  private url: string;
  private eventBus: EventBus;
  private _status: ConnectionStatus = 'disconnected';
  private eventHandlers = new Map<string, Set<(data: any) => void>>();

  constructor(url: string, eventBus: EventBus) {
    this.url = url;
    this.eventBus = eventBus;
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  async connect(): Promise<void> {
    if (this._status === 'connected') return;

    this._status = 'connecting';

    return new Promise((resolve, reject) => {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        this._status = 'connected';
        console.log('[SSEProvider] Connected');
        resolve();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (err) {
          console.error('[SSEProvider] Parse error:', err);
        }
      };

      this.eventSource.onerror = (error) => {
        const wasConnecting = this._status === 'connecting';
        console.error('[SSEProvider] Error:', error);
        this._status = 'disconnected';
        this.eventSource?.close();
        if (wasConnecting) {
          reject(error);
        }
      };
    });
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
    this._status = 'disconnected';
  }

  send(channel: string, payload: any): void {
    console.warn('[SSEProvider] SSE is one-way. Use fetch to send:', channel);
  }

  private handleMessage(message: BusMessage): void {
    this.eventBus.publish(message.channel, message.payload, message.userId);
  }
}
