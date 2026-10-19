/**
 * Social Media Publishing System - Public API
 * This file serves as the single entry point for the social module.
 */

import { accountService } from './services/accountService';
import { approvalService } from './services/approvalService';
import { publisherService } from './services/publisherService';
import { analyticsService } from './services/analyticsService';

export const listAccounts = accountService.listAccounts;
export const connectAccount = accountService.connectAccount;
export const connectWithToken = accountService.connectWithToken;
export const disconnectAccount = accountService.disconnectAccount;

export const refreshToken = accountService.refreshToken;
export const getAccountStatus = accountService.getAccountStatus;

export const saveDraft = approvalService.saveDraft;
export const createDraft = approvalService.createDraft;
export const submitForReview = approvalService.submitForReview;
export const approvePost = approvalService.approvePost;
export const rejectPost = approvalService.rejectPost;
export const schedulePost = approvalService.schedulePost;
export const listPosts = approvalService.listPosts;
export const getPost = approvalService.getPost;

export const listPublishJobs = publisherService.listPublishJobs;
export const getPublishJob = publisherService.getPublishJob;
export const retryJob = publisherService.retryJob;

export const getPostAnalytics = analyticsService.getPostAnalytics;
export const getLatestAnalytics = analyticsService.getLatestAnalytics;
export const getSummaryByPlatform = analyticsService.getSummaryByPlatform;
export const getCampaignPostAnalytics = analyticsService.getCampaignPostAnalytics;
export const triggerAnalyticsFetch = analyticsService.triggerAnalyticsFetch;

// --- Types ---
export type { 
  SocialAccount 
} from './services/accountService';

export type { 
  AiPost, 
  ApprovalEvent, 
  PostStatus 
} from './services/approvalService';

export type { 
  PublishJob, 
  JobStatus 
} from './services/publisherService';

export type { 
  PostAnalytics, 
  AnalyticsSummary, 
  ChannelBreakdown 
} from './services/analyticsService';

export type { 
  RateLimitWindow 
} from './services/rateLimitService';

export type { 
  PlatformConfig 
} from './constants/platforms';
