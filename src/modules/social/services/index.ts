import { accountService } from './accountService';
import { approvalService } from './approvalService';
import { publisherService } from './publisherService';
import { analyticsService } from './analyticsService';
import { rateLimitService } from './rateLimitService';

export const socialService = {
  ...accountService,
  ...approvalService,
  ...publisherService,
  ...analyticsService,
  ...rateLimitService,
};

export default socialService;
