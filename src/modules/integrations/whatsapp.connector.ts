import { BaseConnector } from '../../core/integrations/base-connector';
import { ConnectorActionResponse } from '../../core/integrations/types';
import { apiManager } from '../../core/integrations/api-manager';

export class WhatsAppConnector extends BaseConnector {
  private readonly API_BASE_URL = 'https://graph.facebook.com/v17.0';

  protected async testConnection(): Promise<void> {
    const token = this.getCredential('accessToken');
    const phoneId = this.getCredential('phoneNumberId');
    
    // Simple call to check if the token is valid
    await apiManager.get(`${this.API_BASE_URL}/${phoneId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async sendMessage(recipient: string, message: string, options?: any): Promise<ConnectorActionResponse> {
    try {
      const token = this.getCredential('accessToken');
      const phoneId = this.getCredential('phoneNumberId');

      const response = await apiManager.post(
        `${this.API_BASE_URL}/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: recipient,
          type: options?.type || 'text',
          text: { body: message },
          ...options?.extraParams,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { 
        success: true, 
        message: 'WhatsApp message sent successfully', 
        data: response.data 
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchData(query: any): Promise<ConnectorActionResponse> {
    try {
      const token = this.getCredential('accessToken');
      const response = await apiManager.get(`${this.API_BASE_URL}/me/messages`, {
        params: query,
        headers: { Authorization: `Bearer ${token}` },
      });

      return { 
        success: true, 
        message: 'WhatsApp data fetched successfully', 
        data: response.data 
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
