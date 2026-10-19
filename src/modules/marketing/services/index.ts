import { campaignService } from './campaignService';
import { leadService } from './leadService';
import { analyticsService } from './analyticsService';
import { segmentationService } from './segmentationService';
import { competitorService } from './competitorService';
import { scoringService } from './scoringService';
import { roiService } from './roiService';
import { seoService } from './seoService';
import { abTestService } from './abTestService';
import { ugcService } from './ugcService';

export {
  campaignService,
  leadService,
  analyticsService,
  segmentationService,
  competitorService,
  scoringService,
  roiService,
  seoService,
  abTestService,
  ugcService,
};

export const marketingService = {
  ...campaignService,
  ...leadService,
  ...analyticsService,
  ...segmentationService,
  ...competitorService,
  ...scoringService,
  ...roiService,
  ...seoService,
  ...abTestService,
  ...ugcService,
};

export default marketingService;
