import { IntegrationConfig, ConnectorActionResponse } from './types';
import { apiManager } from './api-manager';

export abstract class BaseConnector {
  protected config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  /**
   * Validates the connector configuration and credentials.
   */
  async validateConnection(): Promise<ConnectorActionResponse> {
    try {
      await this.testConnection();
      return { success: true, message: 'Connection validated successfully' };
    } catch (error: any) {
      return { success: false, message: `Connection validation failed: ${error.message}`, error };
    }
  }

  /**
   * Implementation-specific connection test.
   */
  protected abstract testConnection(): Promise<void>;

  /**
   * Sends a message through the integration.
   */
  abstract sendMessage(recipient: string, message: string, options?: any): Promise<ConnectorActionResponse>;

  /**
   * Fetches data from the external service.
   */
  abstract fetchData(query: any): Promise<ConnectorActionResponse>;

  /**
   * Helper to get a credential securely.
   * In a real system, this would decrypt the value from the DB.
   */
  protected getCredential(key: string): string {
    const value = this.config.credentials[key];
    if (!value) {
      throw new Error(`Missing required credential: ${key}`);
    }
    // Simulation of decryption
    return value;
  }

  /**
   * Standardized error handler for connector actions.
   */
  protected handleError(error: any): ConnectorActionResponse {
    console.error(`[${this.constructor.name}] Error:`, error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
