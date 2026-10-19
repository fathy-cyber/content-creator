import { IntegrationConfig } from '../../core/integrations/types';
import { BaseConnector } from '../../core/integrations/base-connector';
import { WhatsAppConnector } from './whatsapp.connector';
import { FacebookConnector } from './facebook.connector';
import { EmailConnector } from './email.connector';

export const CONNECTOR_MAP: Record<string, new (config: IntegrationConfig) => BaseConnector> = {
  whatsapp: WhatsAppConnector,
  facebook: FacebookConnector,
  email: EmailConnector,
};

export function createConnector(config: IntegrationConfig): BaseConnector {
  const ConnectorClass = CONNECTOR_MAP[config.type];
  if (!ConnectorClass) {
    throw new Error(`Unsupported integration type: ${config.type}`);
  }
  return new ConnectorClass(config);
}
