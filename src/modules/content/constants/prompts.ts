export type Platform = 'LINKEDIN' | 'INSTAGRAM' | 'TWITTER' | 'FACEBOOK';
export type AdPlatform = 'GOOGLE' | 'META' | 'DISPLAY';
export type DescVariant = 'ECOMMERCE' | 'B2B' | 'TEASER';
export type ScriptType = 'COLD_CALL' | 'DISCOVERY' | 'OBJECTION' | 'CLOSING';

export interface PostInputs {
  topic: string;
  tone: string;
  audience: string;
  keyMessage: string;
  language: string;
}

export interface AdInputs {
  productName: string;
  usp: string;
  audience: string;
  goal: string;
}

export interface ProductInputs {
  productName: string;
  features: string[];
  benefits: string[];
  targetCustomer: string;
}

export interface ScriptInputs {
  product: string;
  prospectProfile: string;
  painPoints: string[];
}

export interface EmailInputs {
  productName: string;
  goal: string;
  audience: string;
  keyBenefits: string[];
}

export interface PlanInputs {
  goal: string;
  budget: number;
  duration: string;
  audience: string;
}

export interface CTAInputs {
  currentCTA: string;
  context: string;
}

export const PROMPTS = {
  POST: {
    LINKEDIN: (inputs: PostInputs) => `Create a professional LinkedIn post in ${inputs.language} about ${inputs.topic}. 
    Tone: ${inputs.tone}. Target Audience: ${inputs.audience}. 
    Key Message: ${inputs.keyMessage}. 
    Include relevant hashtags and a call to action. 
    Return the response as a JSON object with a 'content' field.`,
    INSTAGRAM: (inputs: PostInputs) => `Create an engaging Instagram caption in ${inputs.language} about ${inputs.topic}. 
    Tone: ${inputs.tone}. Target Audience: ${inputs.audience}. 
    Key Message: ${inputs.keyMessage}. 
    Include emojis and hashtags. 
    Return the response as a JSON object with a 'content' field.`,
    TWITTER: (inputs: PostInputs) => `Create a punchy tweet in ${inputs.language} about ${inputs.topic}. 
    Tone: ${inputs.tone}. Target Audience: ${inputs.audience}. 
    Key Message: ${inputs.keyMessage}. 
    Return the response as a JSON object with a 'content' field.`,
    FACEBOOK: (inputs: PostInputs) => `Create a community-focused Facebook post in ${inputs.language} about ${inputs.topic}. 
    Tone: ${inputs.tone}. Target Audience: ${inputs.audience}. 
    Key Message: ${inputs.keyMessage}. 
    Return the response as a JSON object with a 'content' field.`,
  },
  AD_COPY: {
    GOOGLE: (inputs: AdInputs) => `Create a high-converting Google Search Ad for ${inputs.productName}. 
    USP: ${inputs.usp}. Audience: ${inputs.audience}. Goal: ${inputs.goal}. 
    Provide 3 headlines (max 30 chars) and 2 descriptions (max 90 chars). 
    Return the response as a JSON object with 'headlines' (array) and 'descriptions' (array).`,
    META: (inputs: AdInputs) => `Create a compelling Meta (Facebook/Instagram) ad for ${inputs.productName}. 
    USP: ${inputs.usp}. Audience: ${inputs.audience}. Goal: ${inputs.goal}. 
    Provide 3 variants of primary text, 5 winning headlines, and 3 link descriptions. 
    You MUST return the response as a valid JSON object. Do not include any conversational text before or after the JSON.
    Expected format:
    {
      "primaryText": ["text 1", "text 2", "text 3"],
      "headlines": ["head 1", "head 2", "head 3", "head 4", "head 5"],
      "descriptions": ["desc 1", "desc 2", "desc 3"],
      "ctas": ["cta 1", "cta 2", "cta 3", "cta 4", "cta 5"]
    }`,
    DISPLAY: (inputs: AdInputs) => `Create a visual-first display ad copy for ${inputs.productName}. 
    USP: ${inputs.usp}. Audience: ${inputs.audience}. Goal: ${inputs.goal}. 
    Provide a short punchy headline and a subheadline. 
    Return the response as a JSON object with 'headline' and 'subheadline'.`,
  },
  PRODUCT_DESC: {
    ECOMMERCE: (inputs: ProductInputs) => `Write a persuasive e-commerce product description for ${inputs.productName}. 
    Features: ${inputs.features.join(', ')}. Benefits: ${inputs.benefits.join(', ')}. 
    Target Customer: ${inputs.targetCustomer}. 
    Focus on emotional triggers and benefits. 
    You MUST return the response as a valid JSON object. Do not include any conversational text before or after the JSON.
    Expected format:
    {
      "title": "Catchy Product Name",
      "content": "The full persuasive description..."
    }`,
    B2B: (inputs: ProductInputs) => `Write a professional B2B product description for ${inputs.productName}. 
    Features: ${inputs.features.join(', ')}. Benefits: ${inputs.benefits.join(', ')}. 
    Target Customer: ${inputs.targetCustomer}. 
    Focus on efficiency, ROI, and professionalism. 
    Return the response as a JSON object with a 'content' field.`,
    TEASER: (inputs: ProductInputs) => `Write a mysterious and exciting product teaser for ${inputs.productName}. 
    Key highlights: ${inputs.features.slice(0, 2).join(', ')}. 
    Target Customer: ${inputs.targetCustomer}. 
    Create anticipation. 
    Return the response as a JSON object with a 'content' field.`,
  },
  SALES_SCRIPT: {
    COLD_CALL: (inputs: ScriptInputs) => `Create a cold call script for ${inputs.product}. 
    Prospect Profile: ${inputs.prospectProfile}. Pain Points: ${inputs.painPoints.join(', ')}. 
    Include opening, hook, value proposition, and call to action. 
    You MUST return the response as a valid JSON object. Do not include any conversational text before or after the JSON.
    Expected format:
    {
      "content": "The full script text..."
    }`,
    DISCOVERY: (inputs: ScriptInputs) => `Create a discovery call script for ${inputs.product}. 
    Prospect Profile: ${inputs.prospectProfile}. Pain Points: ${inputs.painPoints.join(', ')}. 
    Focus on open-ended questions to uncover needs. 
    You MUST return the response as a valid JSON object. Do not include any conversational text before or after the JSON.
    Expected format:
    {
      "content": "The full script text..."
    }`,
    OBJECTION: (inputs: ScriptInputs) => `Create a script for handling common objections for ${inputs.product}. 
    Prospect Profile: ${inputs.prospectProfile}. Common Objections: ${inputs.painPoints.join(', ')}. 
    Use the 'Feel-Felt-Found' technique. 
    You MUST return the response as a valid JSON object. Do not include any conversational text before or after the JSON.
    Expected format:
    {
      "content": "The full script text..."
    }`,
    CLOSING: (inputs: ScriptInputs) => `Create a closing script for ${inputs.product}. 
    Prospect Profile: ${inputs.prospectProfile}. Pain Points: ${inputs.painPoints.join(', ')}. 
    Focus on urgency and clear next steps. 
    You MUST return the response as a valid JSON object. Do not include any conversational text before or after the JSON.
    Expected format:
    {
      "content": "The full script text..."
    }`,
  },
  EMAIL: {
    SUBJECT: (inputs: EmailInputs) => `Generate 5 high-open-rate subject lines for an email about ${inputs.productName}. 
    Goal: ${inputs.goal}. Audience: ${inputs.audience}. Key Benefits: ${inputs.keyBenefits.join(', ')}. 
    Return the response as a JSON array of strings.`,
    BODY: (inputs: EmailInputs) => `Write a high-converting email body for ${inputs.productName}. 
    Goal: ${inputs.goal}. Audience: ${inputs.audience}. Key Benefits: ${inputs.keyBenefits.join(', ')}. 
    Include a clear CTA. 
    Return the response as a JSON object with a 'content' field.`,
  },
  CAMPAIGN_PLAN: (inputs: PlanInputs) => `Generate a detailed marketing campaign plan for a goal of ${inputs.goal}. 
    Budget: ${inputs.budget}. Duration: ${inputs.duration}. Audience: ${inputs.audience}. 
    Include a timeline, budget allocation per channel, and key milestones. 
    Return the response as a JSON object with 'timeline' (array), 'budgetAllocation' (object), and 'milestones' (array).`,
  CTA_SUGGESTIONS: (inputs: CTAInputs) => `Suggest 5 alternative CTAs for the current CTA: "${inputs.currentCTA}". 
    Context: ${inputs.context}. 
    Make them more urgent, benefit-driven, or curious. 
    Return the response as a JSON array of strings.`,
};
