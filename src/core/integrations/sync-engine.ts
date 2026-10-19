import { IntegrationConfig, SyncState } from './types';
import { createConnector } from '../../modules/integrations';

export class SyncEngine {
  private static instance: SyncEngine;
  private syncStates: Map<string, SyncState> = new Map();

  private constructor() {}

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  /**
   * Starts a synchronization process for a specific integration.
   */
  async syncIntegration(config: IntegrationConfig): Promise<SyncState> {
    const state: SyncState = {
      lastSyncedAt: new Date(),
      nextSyncAt: new Date(Date.now() + 60000), // Default 1 min
      status: 'syncing',
    };
    this.syncStates.set(config.id, state);

    try {
      console.log(`[SyncEngine] Starting sync for ${config.id} (${config.type})`);
      
      const connector = createConnector(config);
      
      // 1. Test connection first
      const connectionCheck = await connector.validateConnection();
      if (!connectionCheck.success) {
        throw new Error(`Connection failed: ${connectionCheck.message}`);
      }

      // 2. Fetch data from external service
      // In a real scenario, we would use the lastSyncedAt to fetch only new data
      const dataResult = await connector.fetchData({ since: state.lastSyncedAt.toISOString() });
      
      if (!dataResult.success) {
        throw new Error(`Data fetch failed: ${dataResult.message}`);
      }

      // 3. Sync data to internal DB (Simulated)
      await this.persistToInternalDB(config.id, dataResult.data);

      state.status = 'idle';
      state.lastSyncedAt = new Date();
      state.nextSyncAt = new Date(Date.now() + 60000);
      
      console.log(`[SyncEngine] Sync completed for ${config.id}`);
    } catch (error: any) {
      console.error(`[SyncEngine] Sync failed for ${config.id}:`, error);
      state.status = 'error';
      state.lastError = error.message;
    }

    this.syncStates.set(config.id, state);
    return state;
  }

  private async persistToInternalDB(integrationId: string, data: any): Promise<void> {
    // This is where the integration would call the ORM/Supabase to update records
    console.log(`[SyncEngine] Persisting ${JSON.stringify(data).length} bytes of data for ${integrationId} to DB...`);
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  getSyncState(integrationId: string): SyncState | undefined {
    return this.syncStates.get(integrationId);
  }

  /**
   * A basic polling loop that can be started on server boot.
   */
  async startPolling(integrations: IntegrationConfig[]) {
    console.log('[SyncEngine] Starting global polling loop...');
    
    setInterval(async () => {
      const now = new Date();
      for (const config of integrations) {
        const state = this.getSyncState(config.id);
        if (config.isActive && (!state || now >= state.nextSyncAt)) {
          await this.syncIntegration(config);
        }
      }
    }, 30000); // Check every 30 seconds
  }
}

export const syncEngine = SyncEngine.getInstance();
