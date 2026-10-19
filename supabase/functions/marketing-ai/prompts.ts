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
    LINKEDIN: (inputs: PostInputs) => `Create a professional LinkedIn post in ${inputs.language} about ${inputs.topic}. Tone: ${inputs.tone}. Target Audience: ${inputs.audience}. Key Message: ${inputs.keyMessage}. Include relevant hashtags and a call to action.`,
    INSTAGRAM: (inputs: PostInputs) => `Write a high-converting Instagram post in ${inputs.language} about ${inputs.topic}. Include a hook, value-driven body, emojis, and hashtags.`,
    TWITTER: (inputs: PostInputs) => `Create a punchy tweet in ${inputs.language} about ${inputs.topic}. Tone: ${inputs.tone}. Target Audience: ${inputs.audience}. Key Message: ${inputs.keyMessage}.`,
    FACEBOOK: (inputs: PostInputs) => `Create a community-focused Facebook post in ${inputs.language} about ${inputs.topic}. Tone: ${inputs.tone}. Target Audience: ${inputs.audience}. Key Message: ${inputs.keyMessage}.`,
  },
  AD_COPY: {
    GOOGLE: (inputs: AdInputs) => `Create a high-converting Google Search Ad for ${inputs.productName}. USP: ${inputs.usp}. Audience: ${inputs.audience}. Goal: ${inputs.goal}. Provide 3 headlines and 2 descriptions.`,
    META: (inputs: AdInputs) => `Create a compelling Meta ad for ${inputs.productName}. USP: ${inputs.usp}. Audience: ${inputs.audience}. Goal: ${inputs.goal}.`,
    DISPLAY: (inputs: AdInputs) => `Create a visual-first display ad copy for ${inputs.productName}. USP: ${inputs.usp}. Audience: ${inputs.audience}. Goal: ${inputs.goal}.`,
  },
  PRODUCT_DESC: {
    ECOMMERCE: (inputs: ProductInputs) => `Write a persuasive e-commerce product description for ${inputs.productName}. Features: ${inputs.features.join(', ')}. Benefits: ${inputs.benefits.join(', ')}. Target Customer: ${inputs.targetCustomer}.`,
    B2B: (inputs: ProductInputs) => `Write a professional B2B product description for ${inputs.productName}. Features: ${inputs.features.join(', ')}. Benefits: ${inputs.benefits.join(', ')}. Target Customer: ${inputs.targetCustomer}.`,
    TEASER: (inputs: ProductInputs) => `Write a mysterious and exciting product teaser for ${inputs.productName}. Key highlights: ${inputs.features.slice(0, 2).join(', ')}. Target Customer: ${inputs.targetCustomer}.`,
  },
  SALES_SCRIPT: {
    COLD_CALL: (inputs: ScriptInputs) => `Create a cold call script for ${inputs.product}. Prospect Profile: ${inputs.prospectProfile}. Pain Points: ${inputs.painPoints.join(', ')}.`,
    DISCOVERY: (inputs: ScriptInputs) => `Create a discovery call script for ${inputs.product}. Prospect Profile: ${inputs.prospectProfile}. Pain Points: ${inputs.painPoints.join(', ')}.`,
    OBJECTION: (inputs: ScriptInputs) => `Create a script for handling objections for ${inputs.product}. Prospect Profile: ${inputs.prospectProfile}. Objections: ${inputs.painPoints.join(', ')}.`,
    CLOSING: (inputs: ScriptInputs) => `Create a closing script for ${inputs.product}. Prospect Profile: ${inputs.prospectProfile}. Pain Points: ${inputs.painPoints.join(', ')}.`,
  },
  EMAIL: {
    SUBJECT: (inputs: EmailInputs) => `Generate 5 high-open-rate subject lines for an email about ${inputs.productName}. Goal: ${inputs.goal}. Audience: ${inputs.audience}.`,
    BODY: (inputs: EmailInputs) => `Write a high-converting email body for ${inputs.productName}. Goal: ${inputs.goal}. Audience: ${inputs.audience}.`,
  },
  CAMPAIGN_PLAN: (inputs: PlanInputs) => `Generate a detailed marketing campaign plan for ${inputs.goal}. Budget: ${inputs.budget}. Duration: ${inputs.duration}. Audience: ${inputs.audience}.`,
  CTA_SUGGESTIONS: (inputs: CTAInputs) => `Suggest 5 alternative CTAs for: "${inputs.currentCTA}". Context: ${inputs.context}.`,
};
