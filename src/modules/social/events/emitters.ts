import { eventBus } from '@/core/events/EventBus';
import { AiPost } from '../services/approvalService';
import { PublishJob } from '../services/publisherService';
import { PostAnalytics } from '../services/analyticsService';

/**
 * Event Payload Types
 */
export type SocialPostDraftCreatedPayload = AiPost;
export type SocialPostSubmittedPayload = AiPost;
export type SocialPostApprovedPayload = AiPost & { approver_id: string };
export type SocialPostRejectedPayload = AiPost & { reason: string };
export type SocialPostApprovalExpiredPayload = AiPost;
export type SocialPostScheduledPayload = AiPost & { scheduled_for: string };
export type SocialPostPublishedPayload = PublishJob & { external_post_id: string };
export type SocialPostPublishFailedPayload = PublishJob & { error: string; error_code: string };
export type SocialPostPublishDeadPayload = PublishJob;
export type SocialTokenRefreshedPayload = { account_id: string; platform: string };
export type SocialTokenExpiredPayload = { account_id: string; platform: string };
export type SocialTokenRevokedPayload = { account_id: string; platform: string };
export type SocialAnalyticsFetchedPayload = PostAnalytics;

/**
 * Social Event Emitters
 */
export const emitPostDraftCreated = (payload: SocialPostDraftCreatedPayload) => 
  eventBus.emit('social.post.draft.created' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostSubmitted = (payload: SocialPostSubmittedPayload) => 
  eventBus.emit('social.post.submitted' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostApproved = (payload: SocialPostApprovedPayload) => 
  eventBus.emit('social.post.approved' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostRejected = (payload: SocialPostRejectedPayload) => 
  eventBus.emit('social.post.rejected' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostApprovalExpired = (payload: SocialPostApprovalExpiredPayload) => 
  eventBus.emit('social.post.approval.expired' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostScheduled = (payload: SocialPostScheduledPayload) => 
  eventBus.emit('social.post.scheduled' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostPublished = (payload: SocialPostPublishedPayload) => 
  eventBus.emit('social.post.published' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostPublishFailed = (payload: SocialPostPublishFailedPayload) => 
  eventBus.emit('social.post.publish.failed' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitPostPublishDead = (payload: SocialPostPublishDeadPayload) => 
  eventBus.emit('social.post.publish.dead' as any, payload, { sourceModule: 'social', sourceEntityId: payload.id });

export const emitTokenRefreshed = (payload: SocialTokenRefreshedPayload) => 
  eventBus.emit('social.token.refreshed' as any, payload, { sourceModule: 'social', sourceEntityId: payload.account_id });

export const emitTokenExpired = (payload: SocialTokenExpiredPayload) => 
  eventBus.emit('social.token.expired' as any, payload, { sourceModule: 'social', sourceEntityId: payload.account_id });

export const emitTokenRevoked = (payload: SocialTokenRevokedPayload) => 
  eventBus.emit('social.token.revoked' as any, payload, { sourceModule: 'social', sourceEntityId: payload.account_id });

export const emitAnalyticsFetched = (payload: SocialAnalyticsFetchedPayload) => 
  eventBus.emit('social.analytics.fetched' as any, payload, { sourceModule: 'social', sourceEntityId: payload.publish_job_id });
