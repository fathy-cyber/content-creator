import { supabase } from '@/lib/supabase';
import { 
  Platform, AdPlatform, DescVariant, ScriptType, 
  PostInputs, AdInputs, ProductInputs, ScriptInputs, EmailInputs, PlanInputs, CTAInputs,
  PROMPTS 
} from '../constants/prompts';

export interface GeneratedContent {
  content?: string;
  title?: string;
  metadata?: any;
  [key: string]: any;
}

export interface MediaGeneratedContent {
  url: string;
  metadata?: any;
}

export interface CampaignPlanContent {
  timeline: any[];
  budgetAllocation: Record<string, number>;
  milestones: any[];
}

async function callMarketingAI(promptKey: string, inputs: any): Promise<any> {
  let attempts = 0;
  const maxRetries = 2;
  
  while (attempts <= maxRetries) {
    try {
      const { data, error } = await supabase.functions.invoke('smooth-processor', {
        body: { promptKey, inputs },
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned from AI service');
      
      let finalResult = data;
      if (data && typeof data === 'object' && 'result' in data) {
        finalResult = data.result;
      }

      if (typeof finalResult === 'string') {
        // 1. Try to extract JSON from markdown code blocks
        const jsonMatch = finalResult.match(/```json\s*([\s\S]*?)\s*```/) || 
                          finalResult.match(/```\s*([\s\S]*?)\s*```/);
        
        const contentToParse = jsonMatch ? jsonMatch[1] : finalResult.trim();

        if (contentToParse.startsWith('{') || contentToParse.startsWith('[')) {
          try {
            return JSON.parse(contentToParse);
          } catch (e) {
            // Fallback to original string if parsing fails
            return finalResult;
          }
        }
      }
      
      return finalResult;
    } catch (err: any) {
      attempts++;
      if (attempts > maxRetries) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('AI service failed after retries');
}

export const aiService = {
  /**
   * Generates a social media post based on platform and inputs.
   */
  async generatePost(platform: Platform, inputs: PostInputs): Promise<GeneratedContent> {
    const promptKey = `POST.${platform}`;
    const result = await callMarketingAI(promptKey, inputs);
    return result as GeneratedContent;
  },

  /**
   * Generates ad copy for a specific platform.
   */
  async generateAdCopy(platform: AdPlatform, inputs: AdInputs): Promise<GeneratedContent> {
    const promptKey = `AD_COPY.${platform}`;
    const result = await callMarketingAI(promptKey, inputs);
    return result as GeneratedContent;
  },

  /**
   * Generates a product description based on the variant.
   */
  async generateProductDescription(variant: DescVariant, inputs: ProductInputs): Promise<GeneratedContent> {
    const promptKey = `PRODUCT_DESC.${variant}`;
    const result = await callMarketingAI(promptKey, inputs);
    return result as GeneratedContent;
  },

  /**
   * Generates a sales script for a given type.
   */
  async generateSalesScript(type: ScriptType, inputs: ScriptInputs): Promise<GeneratedContent> {
    const promptKey = `SALES_SCRIPT.${type}`;
    const result = await callMarketingAI(promptKey, inputs);
    return result as GeneratedContent;
  },

  /**
   * Generates 5 email subject line variants.
   */
  async generateEmailSubjects(inputs: EmailInputs): Promise<string[]> {
    const promptKey = 'EMAIL.SUBJECT';
    const result = await callMarketingAI(promptKey, inputs);
    return result as string[];
  },

  /**
   * Generates the body content for an email.
   */
  async generateEmailBody(inputs: EmailInputs): Promise<GeneratedContent> {
    const promptKey = 'EMAIL.BODY';
    const result = await callMarketingAI(promptKey, inputs);
    return result as GeneratedContent;
  },

  /**
   * Generates a comprehensive campaign plan.
   */
  async generateCampaignPlan(inputs: PlanInputs): Promise<CampaignPlanContent> {
    const promptKey = 'CAMPAIGN_PLAN';
    const result = await callMarketingAI(promptKey, inputs);
    return result as CampaignPlanContent;
  },

  /**
   * Suggests 5 alternatives for a given CTA.
   */
  async suggestCTAs(currentCTA: string, context: string): Promise<string[]> {
    const promptKey = 'CTA_SUGGESTIONS';
    const result = await callMarketingAI(promptKey, { currentCTA, context });
    return result as string[];
  },

  /**
   * Generates an AI image based on a prompt.
   */
  async generateImage(prompt: string, aspect_ratio: '1:1' | '16:9' | '4:5' = '1:1'): Promise<MediaGeneratedContent> {
    const { data, error } = await supabase.functions.invoke('media-gen', {
      body: { type: 'image', prompt, aspect_ratio },
    });
    if (error || !data) throw new Error(error?.message || 'Image generation failed');
    return data as MediaGeneratedContent;
  },

  /**
   * Generates an AI video/animation based on a prompt.
   */
  async generateVideo(prompt: string, duration: number = 5): Promise<MediaGeneratedContent> {
    const { data, error } = await supabase.functions.invoke('media-gen', {
      body: { type: 'video', prompt, duration },
    });
    if (error || !data) throw new Error(error?.message || 'Video generation failed');
    return data as MediaGeneratedContent;
  },
};
