import { eventBus } from '@/core/events/EventBus';
import { 
  campaignService, 
  leadService, 
  analyticsService,
  scoringService,
} from '../services';
import { getService } from '@/core';

export function initMarketingListeners() {
  const ai = getService<any>('ai');
  const assets = getService<any>('assets');

  // 1. Sales Order Confirmed -> Attribute to Campaign
  eventBus.on('sales.order.confirmed', async ({ order }) => {
    try {
      const result = await leadService.listLeads({
        limit: 1,
        offset: 0,
      });

      if (result.leads && result.leads[0]) {
        await analyticsService.attributeSaleToCamera(result.leads[0].id, order.total_amount);
      }
    } catch (error) {
      console.error('[Marketing Listener] Error on sales.order.confirmed:', error);
    }
  });

  // 2. CRM Contact Converted -> Mark Lead as Converted
  eventBus.on('crm.contact.converted', async ({ contact }) => {
    try {
      const { leads } = await leadService.listLeads({
        limit: 1,
        offset: 0,
      });

      if (leads && leads[0]) {
        await leadService.convertLead(leads[0].id);
      }
    } catch (error) {
      console.error('[Marketing Listener] Error on crm.contact.converted:', error);
    }
  });

  // 3. CRM Deal Lost -> Flag channel in analytics
  eventBus.on('crm.deal.lost', async ({ deal }) => {
    try {
      console.log(`[Marketing Analytics] Lead from campaign ${deal.campaign_id} was lost.`);
    } catch (error) {
      console.error('[Marketing Listener] Error on crm.deal.lost:', error);
    }
  });

  // 4. Project Completed -> Generate Promotion
  eventBus.on('project.completed', async ({ project }) => {
    try {
      const response = await ai.generate({
        promptKey: 'POST.LINKEDIN',
        inputs: {
          topic: `Successful completion of ${project.name}`,
          tone: 'Proud and Professional',
          audience: 'Industry Peers & Potential Clients',
          keyMessage: `We just finished ${project.name} for our client, delivering ${project.results || 'exceptional results'}.`,
          language: 'English',
        },
      });

      const content = response.content;
      const parsed = JSON.parse(content);
      const finalText = typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : parsed;

      await assets.createAsset({
        workspace_id: project.org_id,
        title: `Case Study: ${project.name}`,
        type: 'post',
        content: finalText,
        platform: 'LINKEDIN',
        entity_type: 'post',
        entity_id: project.id,
      });

      console.log(`[Marketing Listener] Generated LinkedIn post for project ${project.id}`);
    } catch (error) {
      console.error('[Marketing Listener] Error on project.completed:', error);
    }
  });

  // 5. internal: marketing.lead.scored -> auto-qualify + CRM integration
  eventBus.on('marketing.lead.scored', async ({ lead, score, reason }) => {
    try {
      if (score >= 70 && lead.status === 'qualified') {
        console.log(`[Marketing Listener] Lead ${lead.id} (${lead.name || lead.email}) qualified with score ${score}. ${reason}`);
      }
    } catch (error) {
      console.error('[Marketing Listener] Error on marketing.lead.scored:', error);
    }
  });

  // 6. marketing.rule.created -> notify
  eventBus.on('marketing.rule.created', async ({ rule }) => {
    console.log(`[Marketing Listener] Scoring rule created: "${rule.name}" (${rule.points} pts)`);
  });

  // 7. marketing.rule.deleted -> check campaigns depending on this rule
  eventBus.on('marketing.rule.deleted', async ({ ruleId, ruleName }) => {
    console.log(`[Marketing Listener] Scoring rule removed: "${ruleName}" (${ruleId})`);
  });
}
