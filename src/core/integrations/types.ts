export type IntegrationId = string;

export interface IntegrationConfig {
  id: IntegrationId;
  type: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  isActive: boolean;
}

export interface WebhookPayload {
  integrationId: IntegrationId;
  event: string;
  data: any;
  timestamp: string;
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ConnectorActionResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: Error;
}

export interface SyncState {
  lastSyncedAt: Date;
  nextSyncAt: Date;
  status: 'idle' | 'syncing' | 'error';
  lastError?: string;
}
