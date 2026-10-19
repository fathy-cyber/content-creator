import { BaseConnector } from '../../core/integrations/base-connector';
import { ConnectorActionResponse } from '../../core/integrations/types';
import { apiManager } from '../../core/integrations/api-manager';

export class FacebookConnector extends BaseConnector {
  private readonly API_BASE_URL = 'https://graph.facebook.com/v17.0';

  protected async testConnection(): Promise<void> {
    const token = this.getCredential('accessToken');
    await apiManager.get(`${this.API_BASE_URL}/me`, {
      params: { access_token: token },
    });
  }

  async sendMessage(recipient: string, message: string, options?: any): Promise<ConnectorActionResponse> {
    try {
      const token = this.getCredential('accessToken');
      
      const response = await apiManager.post(
        `${this.API_BASE_URL}/me/messages`,
        {
          recipient: { id: recipient },
          message: { text: message },
          ...options?.extraParams,
        },
        {
          params: { access_token: token },
        }
      );

      return { 
        success: true, 
        message: 'Facebook message sent successfully', 
        data: response.data 
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchData(query: any): Promise<ConnectorActionResponse> {
    try {
      const token = this.getCredential('accessToken');
      const response = await apiManager.get(`${this.API_BASE_URL}/me/feed`, {
        params: { ...query, access_token: token },
      });

      return { 
        success: true, 
        message: 'Facebook data fetched successfully', 
        data: response.data 
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
