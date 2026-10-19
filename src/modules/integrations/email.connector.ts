import { BaseConnector } from '../../core/integrations/base-connector';
import { ConnectorActionResponse } from '../../core/integrations/types';
import { apiManager } from '../../core/integrations/api-manager';

export class EmailConnector extends BaseConnector {
  private readonly API_BASE_URL = 'https://api.sendgrid.com/v3';

  protected async testConnection(): Promise<void> {
    const apiKey = this.getCredential('apiKey');
    // SendGrid doesn't have a simple "me" endpoint, so we check API key validity via a lightweight call
    await apiManager.get(`${this.API_BASE_URL}/templates`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  }

  async sendMessage(recipient: string, message: string, options?: any): Promise<ConnectorActionResponse> {
    try {
      const apiKey = this.getCredential('apiKey');
      const fromEmail = this.getCredential('fromEmail');

      const response = await apiManager.post(
        `${this.API_BASE_URL}/mail/send`,
        {
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: fromEmail },
          subject: options?.subject || 'Notification from Ayech AI',
          content: [{ type: 'text/plain', value: message }],
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );

      return { 
        success: true, 
        message: 'Email sent successfully', 
        data: response.data 
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchData(query: any): Promise<ConnectorActionResponse> {
    try {
      const apiKey = this.getCredential('apiKey');
      const response = await apiManager.get(`${this.API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      return { 
        success: true, 
        message: 'Email stats fetched successfully', 
        data: response.data 
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
