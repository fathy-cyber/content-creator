import { PromptTemplate } from '../types';

export interface PromptDefinition {
    template: PromptTemplate;
    temperature: number;
}

/**
 * Prompt Registry contains all system prompt templates.
 * All templates are instructed to return valid JSON.
 */
export const promptRegistry: Record<string, PromptDefinition> = {
    // Content Generation
    'POST.LINKEDIN': {
        temperature: 0.8,
        template: (inputs) => `Create a high-engagement LinkedIn post in ${inputs.language || 'English'} about ${inputs.topic}. 
        Tone: ${inputs.tone || 'Professional'}. 
        Target Audience: ${inputs.audience || 'General'}. 
        Key Message: ${inputs.keyMessage || inputs.topic}.
        Return JSON: { "post": string, "cta": string }`,
    },
    'POST.INSTAGRAM': {
        temperature: 0.8,
        template: (inputs) => `Create an Instagram caption in ${inputs.language || 'English'} about ${inputs.topic}.
        Tone: ${inputs.tone || 'Casual'}. 
        Context: ${inputs.keyMessage || inputs.topic}.
        Return JSON: { "caption": string, "hashtags": string[] }`,
    },
    'POST.TWITTER': {
        temperature: 0.7,
        template: (inputs) => `Create a Twitter thread (up to 5 tweets) in ${inputs.language || 'English'} about ${inputs.topic}.
        Tone: ${inputs.tone || 'Punchy'}. 
        Key Message: ${inputs.keyMessage || inputs.topic}.
        Return JSON: { "tweets": [{ "text": string, "charCount": number }] }`,
    },
    'POST.FACEBOOK': {
        temperature: 0.8,
        template: (inputs) => `Create a Facebook post in ${inputs.language || 'English'} about ${inputs.topic}.
        Tone: ${inputs.tone || 'Community-focused'}. 
        Target Audience: ${inputs.audience || 'General'}.
        Return JSON: { "post": string, "cta": string }`,
    },
    'AD_COPY.GOOGLE': {
        temperature: 0.3,
        template: (inputs) => `Create Google Search Ads for ${inputs.productName}.
        Keywords: ${inputs.keywords}.
        Return JSON: { "ads": [{ "headline1": string, "headline2": string, "headline3": string, "description1": string, "description2": string }] }`,
    },
    'AD_COPY.META': {
        temperature: 0.7,
        template: (inputs) => `Create Meta Ad Copy for ${inputs.productName}.
        Angle: ${inputs.usp}.
        Audience: ${inputs.audience}.
        Goal: ${inputs.goal}.
        Return JSON: { "primaryText": string, "headline": string, "cta": string }`,
    },
    'AD_COPY.DISPLAY': {
        temperature: 0.6,
        template: (inputs) => `Create Display Ad Copy for ${inputs.productName}.
        Return JSON: { "headlines": string[], "descriptions": string[] }`,
    },
    'PRODUCT_DESC.ECOMMERCE': {
        temperature: 0.5,
        template: (inputs) => `Write an e-commerce product description for ${inputs.productName}.
        Features: ${JSON.stringify(inputs.features)}.
        Benefits: ${JSON.stringify(inputs.benefits)}.
        Return JSON: { "title": string, "description": string, "bulletPoints": string[] }`,
    },
    'PRODUCT_DESC.B2B': {
        temperature: 0.4,
        template: (inputs) => `Write a B2B product description for ${inputs.productName}.
        Value Prop: ${inputs.valueProp}.
        Return JSON: { "overview": string, "keyCapabilities": string[], "businessImpact": string }`,
    },
    'PRODUCT_DESC.TEASER': {
        temperature: 0.8,
        template: (inputs) => `Write a short, mysterious teaser for ${inputs.productName}.
        Return JSON: { "teaser": string, "cta": string }`,
    },
    'SALES_SCRIPT.COLD_CALL': {
        temperature: 0.6,
        template: (inputs) => `Write a cold call sales script for ${inputs.product}.
        Target Persona: ${inputs.persona}.
        Return JSON: { "opening": string, "valueProp": string, "objectionHandling": { [key: string]: string }, "closing": string }`,
    },
    'SALES_SCRIPT.DISCOVERY': {
        temperature: 0.4,
        template: (inputs) => `Write a discovery call script for ${inputs.product}.
        Return JSON: { "intro": string, "discoveryQuestions": string[], "qualificationCriteria": string[] }`,
    },
    'SALES_SCRIPT.OBJECTION': {
        temperature: 0.5,
        template: (inputs) => `Provide a script to handle the objection: "${inputs.objection}" for ${inputs.product}.
        Return JSON: { "empathyStatement": string, "reframing": string, "proofPoint": string, "closingQuestion": string }`,
    },
    'SALES_SCRIPT.CLOSING': {
        temperature: 0.6,
        template: (inputs) => `Write a closing script for ${inputs.product}.
        Return JSON: { "summary": string, "finalOffer": string, "commitmentAsk": string }`,
    },
    'EMAIL.SUBJECT': {
        temperature: 0.8,
        template: (inputs) => `Generate 5 high-open-rate subject lines for an email about ${inputs.topic}.
        Return JSON: { "subjects": string[] }`,
    },
    'EMAIL.BODY': {
        temperature: 0.7,
        template: (inputs) => `Write an email body for ${inputs.topic}.
        Goal: ${inputs.goal}.
        Return JSON: { "body": string, "cta": string }`,
    },
    'CAMPAIGN_PLAN': {
        temperature: 0.5,
        template: (inputs: Record<string, any>) => `Create a comprehensive marketing campaign plan.
        Goal: ${inputs.goal || 'Not specified'}.
        Budget: ${inputs.budget || 'Not specified'} TND.
        Duration: ${inputs.duration || 'Not specified'}.
        Target Audience: ${inputs.audience || 'General'}.
        Selected Channels: ${(inputs.channels || []).join(', ') || 'Not specified'}.
        Return JSON: { "timeline": [{ "name": string, "tasks": string[] }], "budgetAllocation": { [channel: string]: number }, "milestones": string[] }`,
    },
    'CTA_SUGGESTIONS': {
        temperature: 0.8,
        template: (inputs) => `Suggest 10 powerful CTAs for ${inputs.product}.
        Return JSON: { "ctas": string[] }`,
    },
    // Conversion Optimizer
    'CONVERSION.OPTIMIZE': {
        temperature: 0.4,
        template: (inputs) => `You are a conversion optimization expert. Analyze this landing page funnel and provide specific, actionable recommendations for improvement.
        URL: ${inputs.url}
        Primary Goal: ${inputs.goal}
        Target Audience: ${inputs.audience || 'General'}
        Known Friction Points: ${inputs.frictionPoints || 'None specified'}
        For each recommendation, identify the specific element causing friction, what it currently does, what to change it to, the expected impact level (High/Medium/Low), and the reasoning.
        Return JSON: { "recommendations": [{ "title": string, "current": string, "recommendation": string, "impact": "High" | "Medium" | "Low", "reasoning": string }] }`,
    },
    // New Agency Tools
    'COMPETITOR.GAP_ANALYSIS': {
        temperature: 0.3,
        template: (inputs) => `Analyze this competitor ad copy: "${inputs.competitorAdCopy}".
        Our product: ${inputs.ourProduct}.
        Our USP: ${inputs.ourUSP}.
        Return JSON: { "angles": string[], "weaknesses": string[], "gaps": string[], "emotionalTriggers": string[] }`,
    },
    'COMPETITOR.COUNTER_ANGLE': {
        temperature: 0.6,
        template: (inputs) => `Based on this competitor analysis: ${JSON.stringify(inputs.competitorAnalysis)}.
        Brand Voice: ${inputs.brandVoice}.
        Target Persona: ${inputs.targetPersona}.
        Return JSON: { "counterAngles": string[], "suggestedHooks": string[], "adCopy": string }`,
    },
    'PERSONA.ICP_BUILDER': {
        temperature: 0.5,
        template: (inputs) => `Build an Ideal Customer Profile (ICP) for the industry: ${inputs.industry}, product: ${inputs.product}.
        Existing data: ${JSON.stringify(inputs.existingCustomerData)}.
        Return JSON: { "name": string, "ageRange": string, "jobTitle": string, "painPoints": string[], "goals": string[], "objections": string[], "preferredChannels": string[], "languageStyle": string, "buyingTriggers": string[] }`,
    },
    'SEO.META_TAGS': {
      temperature: 0.25,
      template: (inputs) => `You are an SEO specialist. Generate optimized meta tags for a web page.
Page Title: ${String(inputs.pageTitle || '')}
Page Content: ${String(inputs.pageContent || '').substring(0, 2000)}
Primary Keyword: ${String(inputs.primaryKeyword)}
Secondary Keywords: ${((inputs.secondaryKeywords || []) as string[]).join(', ')}
Target Audience: ${inputs.targetAudience || 'General'}
Brand: ${inputs.brandName || ''}
Tone: ${inputs.tone || 'Professional'}
Return JSON: {
  "titleTag": string,
  "metaDescription": string,
  "ogTitle": string,
  "ogDescription": string,
  "ogImage": string,
  "keywords": string[],
  "structuredData": { "@context": "https://schema.org", "@type": string, "name": string, "description": string },
  "h1Tag": string,
  "urlSlug": string
}`,
    },
    'MARKETING.AB_TEST_VARIANTS': {
      temperature: 0.5,
      template: (inputs) => `You are a conversion rate optimization expert. Design A/B test variants for a marketing asset.
Current Version: ${String(inputs.currentVersion)}
Goal: ${String(inputs.goal)}
Element to Test: ${String(inputs.element)}
Hypothesis: ${String(inputs.hypothesis)}
Target Audience: ${String(inputs.targetAudience || 'General')}
Brand Voice: ${String(inputs.brandVoice || 'Professional')}
Number of Variants: ${String(inputs.variantCount || 2)}
Return JSON: {
  "variants": [{
    "name": string,
    "description": string,
    "changes": string[],
    "expectedImpact": string,
    "risk": "Low" | "Medium" | "High"
  }],
  "recommendedSampleSize": number,
  "estimatedDurationDays": number,
  "successMetrics": string[]
}`,
    },
    'MARKETING.UGC_ANALYZE': {
      temperature: 0.4,
      template: (inputs) => `You are a social media analyst. Analyze this user-generated content for marketing use.
Content Source: ${String(inputs.source || 'Manual Entry')}
Content Text: ${String(inputs.contentText)}
Content Type: ${String(inputs.contentType || 'review')}
Brand Name: ${String(inputs.brandName || '')}
Return JSON: {
  "sentiment": "positive" | "neutral" | "negative",
  "keyThemes": string[],
  "tone": string,
  "suggestedTags": string[],
  "marketingUseCases": string[],
  "quotableSnippet": string,
  "recommendedFormat": "testimonial" | "social_proof" | "case_study" | "social_post" | "ad",
  "approvalScore": number
}`,
    },
    'LANDING_PAGE.AIDA': {
        temperature: 0.6,
        template: (inputs) => `Write landing page copy using the AIDA framework for ${inputs.product}.
        Target Persona: ${inputs.targetPersona}.
        USP: ${inputs.USP}.
        CTA: ${inputs.CTA}.
        Return JSON: { "attention": { "headline": string, "subheadline": string }, "interest": { "body": string }, "desire": { "bullets": string[] }, "action": { "cta": string, "urgencyLine": string } }`,
    },
    'LANDING_PAGE.PAS': {
        temperature: 0.6,
        template: (inputs) => `Write landing page copy using the PAS framework for ${inputs.product}.
        Target Persona: ${inputs.targetPersona}.
        Main Problem: ${inputs.mainProblem}.
        Return JSON: { "problem": string, "agitation": string, "solution": string, "cta": string }`,
    },
    'REPURPOSE.LONG_TO_TWEETS': {
        temperature: 0.7,
        template: (inputs) => `Repurpose this long-form content into ${inputs.count || 5} tweets.
        Content: ${inputs.longFormContent}.
        Return JSON: { "tweets": [{ "text": string, "charCount": number }] }`,
    },
    'REPURPOSE.LONG_TO_LINKEDIN': {
        temperature: 0.7,
        template: (inputs) => `Repurpose this long-form content into a LinkedIn post.
        Tone: ${inputs.tone}.
        Content: ${inputs.longFormContent}.
        Return JSON: { "posts": [{ "hook": string, "body": string, "cta": string }] }`,
    },
    'REPURPOSE.LONG_TO_INSTAGRAM': {
        temperature: 0.7,
        template: (inputs) => `Repurpose this long-form content into an Instagram post.
        Content: ${inputs.longFormContent}.
        Return JSON: { "caption": string, "hashtags": string[], "reelScript": string }`,
    },
    'REPURPOSE.LONG_TO_AD': {
        temperature: 0.6,
        template: (inputs) => `Repurpose this long-form content into an ad for ${inputs.platform}.
        Content: ${inputs.longFormContent}.
        Return JSON: { "headline": string, "primaryText": string, "cta": string }`,
    },
    'TRANSLATE': {
        temperature: 0.3,
        template: (inputs) => `Translate the following content from ${inputs.fromLanguage} to ${inputs.toLanguage}.
        Tone descriptors: ${(inputs.toneDescriptors as string[]).join(', ')}.
        Content: ${inputs.content}.
        Return JSON: { "translatedContent": string, "adaptationNotes": string }`,
    },
    'BRAND_VOICE.EXTRACT': {
        temperature: 0.5,
        template: (inputs) => `Analyze these sample texts and extract the brand voice: ${JSON.stringify(inputs.exampleCopy)}.
        Return JSON: { "toneDescriptors": string[], "forbiddenWords": string[], "valuePropositions": string[], "targetAudience": string }`,
    },
    'YOUTUBE.TITLE': {
        temperature: 0.8,
        template: (inputs) => `Generate 5 click-worthy YouTube titles for a video about ${inputs.topic}.
        Return JSON: { "titles": string[] }`,
    },
};
