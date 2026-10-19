import { eventBus } from '@/shared/events';
import { Lead, Campaign, Asset } from '../index';
import type { ScoringRule } from '../services/scoringService';

export const emitters = {
  /**
   * Emits event when a new lead is created.
   */
  leadCreated(lead: Lead): void {
    void eventBus.emit('marketing.lead.created', { lead });
  },

  /**
   * Emits event when a lead score is updated and it reaches qualification.
   */
  leadScored(lead: Lead, score: number, reason: string): void {
    void eventBus.emit('marketing.lead.scored', { lead, score, reason });
  },

  /**
   * Emits event when a campaign is launched.
   */
  campaignLaunched(campaign: Campaign): void {
    void eventBus.emit('marketing.campaign.launched', { campaign });
  },

  /**
   * Emits event when a campaign is ended.
   */
  campaignEnded(campaign: Campaign, metrics: any): void {
    void eventBus.emit('marketing.campaign.ended', { campaign, metrics });
  },

  /**
   * Emits event when a marketing asset is published.
   */
  assetPublished(asset: Asset): void {
    void eventBus.emit('marketing.asset.published', { asset });
  },

  /**
   * Emits event when a scoring rule is created.
   */
  ruleCreated(rule: ScoringRule): void {
    void eventBus.emit('marketing.rule.created', { rule });
  },

  /**
   * Emits event when a scoring rule is updated.
   */
  ruleUpdated(rule: ScoringRule): void {
    void eventBus.emit('marketing.rule.updated', { rule });
  },

  /**
   * Emits event when a scoring rule is deleted.
   */
  ruleDeleted(ruleId: string, ruleName: string): void {
    void eventBus.emit('marketing.rule.deleted', { ruleId, ruleName });
  },
};
