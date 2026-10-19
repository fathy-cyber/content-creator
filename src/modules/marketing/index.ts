import { campaignService } from './services/campaignService';
import { leadService } from './services/leadService';
import { analyticsService } from './services/analyticsService';
import { segmentationService } from './services/segmentationService';
import { Asset } from '@/core/assets/types';

export const listCampaigns = campaignService.listCampaigns;
export const createCampaign = campaignService.createCampaign;
export const updateCampaign = campaignService.updateCampaign;
export const deleteCampaign = campaignService.deleteCampaign;
export const getCampaign = campaignService.getCampaign;
export const launchCampaign = campaignService.launchCampaign.bind(campaignService);
export const pauseCampaign = campaignService.pauseCampaign.bind(campaignService);
export const completeCampaign = campaignService.completeCampaign.bind(campaignService);
export const saveCampaignPlan = campaignService.saveCampaignPlan;
export const loadCampaignPlan = campaignService.loadCampaignPlan;
export const saveFunnel = campaignService.saveFunnel;
export const loadFunnel = campaignService.loadFunnel;
export const listFunnels = campaignService.listFunnels;

export const listLeads = leadService.listLeads;
export const createLead = leadService.createLead;
export const updateLead = leadService.updateLead;
export const getLead = leadService.getLead;
export const convertLead = leadService.convertLead;

export const getDashboardSummary = analyticsService.getDashboardSummary.bind(analyticsService);
export const getCampaignROI = analyticsService.getCampaignROI;
export const getConversionRate = analyticsService.getConversionRate;
export const getChannelPerformance = analyticsService.getChannelPerformance;
export const attributeSaleToCamera = analyticsService.attributeSaleToCamera;

export const createSegment = segmentationService.createSegment;
export const listSegments = segmentationService.listSegments;
export const updateSegment = segmentationService.updateSegment;
export const deleteSegment = segmentationService.deleteSegment;
export const evaluateSegment = segmentationService.evaluateSegment;

export type { Segment } from './services/segmentationService';
export type { DashboardSummary, ChannelPerformance } from './services/analyticsService';
export type { Campaign } from './services/campaignService';
export type { Lead } from './services/leadService';
export type { Asset };
// The prompt types are now internal to the AI Gateway/Registry and shouldn't be exported from marketing.
