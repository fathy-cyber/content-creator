/**
 * Event Bus Types
 */

export type EventName = 
    // Core events
    | 'module.registered'
    | 'context.client.changed'
    | 'context.project.changed'
    | 'context.workspace.changed'
    | 'brand.voice.created'
    | 'asset.created'
    | 'asset.status.changed'
    | 'asset.approved'
    | 'asset.published'
    // Marketing events
    | 'marketing.lead.created'
    | 'marketing.lead.scored'
    | 'marketing.campaign.launched'
    | 'marketing.campaign.ended'
    | 'marketing.persona.created'
    | 'strategy.improvement.suggested'
    // Content events
    | 'content.repurpose.completed'
    | 'content.translation.completed'
    // Social events
    | 'social.post.published'
    | 'social.post.publish.dead'
    | 'social.post.ready_to_schedule'
    | 'social.token.expired'
    // Business events
    | 'business.plan.finalized'
    // Support events
    | 'support.complaint.received'
    | 'client.created'
    // Integration events
    | 'sales.order.confirmed'
    | 'crm.contact.converted'
    | 'crm.deal.lost'
    | 'project.completed';

export interface EventPayloadMap {
    'module.registered': { moduleId: string, manifest: any };
    'context.client.changed': { clientId: string | null, client: any };
    'context.project.changed': { projectId: string | null, project: any };
    'brand.voice.created': { brandVoiceId: string, clientId: string };
    'asset.created': { asset: any, type: string, clientId: string };
    'asset.status.changed': { assetId: string, from: string, to: string };
    'asset.approved': { assetId: string, clientId: string, approvedBy: string, platform?: string };
    'asset.published': { assetId: string, platform: string };
    'marketing.lead.created': { leadId: string, source: string, campaignId: string };
    'marketing.lead.scored': { leadId: string, score: number, status: string };
    'marketing.campaign.launched': { campaignId: string };
    'marketing.campaign.ended': { campaignId: string, metrics: any };
    'marketing.persona.created': { personaId: string, clientId: string };
    'strategy.improvement.suggested': { ticketId: string, reason: string };
    'content.repurpose.completed': { sourceAssetId: string, derivativeIds: string[] };
    'content.translation.completed': { sourceAssetId: string, translatedAssetIds: string[] };
    'social.post.published': { publishJobId: string, platform: string, externalPostId: string };
    'social.post.publish.dead': { publishJobId: string };
    'social.post.ready_to_schedule': { assetId: string, platform: string };
    'social.token.expired': { accountId: string, platform: string };
    'business.plan.finalized': { planId: string, clientId: string };
    'support.complaint.received': { ticketId: string, severity: 'low' | 'medium' | 'high' };
    'client.created': { clientId: string };
    'sales.order.confirmed': { order: any };
    'crm.contact.converted': { contact: any };
    'crm.deal.lost': { deal: any };
    'project.completed': { project: any };
}

export interface AppEvent {
    id?: string;
    workspace_id?: string;
    event_name: EventName;
    payload: any;
    source_module: string;
    status: 'pending' | 'processed' | 'failed' | 'dead';
    attempts: number;
    error?: string;
    created_at?: string;
    processed_at?: string;
}

export type EventHandler<T = any> = (payload: any, eventName?: string) => Promise<void> | void;

export interface BusMessage {
  channel: string;
  payload: any;
  timestamp: number;
  userId?: string;
}
