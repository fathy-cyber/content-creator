import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// --- PROMPTS CONFIGURATION ---
type Platform = 'LINKEDIN' | 'INSTAGRAM' | 'TWITTER' | 'FACEBOOK';
type AdPlatform = 'GOOGLE' | 'META' | 'DISPLAY';
type DescVariant = 'ECOMMERCE' | 'B2B' | 'TEASER';
type ScriptType = 'COLD_CALL' | 'DISCOVERY' | 'OBJECTION' | 'CLOSING';

interface PostInputs { topic: string; tone: string; audience: string; keyMessage: string; language: string; }
interface AdInputs { productName: string; usp: string; audience: string; goal: string; }
interface ProductInputs { productName: string; features: string[]; benefits: string[]; targetCustomer: string; }
interface ScriptInputs { product: string; prospectProfile: string; painPoints: string[]; }
interface EmailInputs { productName: string; goal: string; audience: string; keyBenefits: string[]; }
interface PlanInputs { goal: string; budget: number; duration: string; audience: string; }
interface CTAInputs { currentCTA: string; context: string; }

const PROMPTS = {
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
    const rawBody = await req.text();
    if (!rawBody) throw new Error("Request body is empty");
    let parsed;
    try { parsed = JSON.parse(rawBody); } catch { throw new Error("Invalid JSON body"); }
    const { promptKey, prompt, inputs = {} } = parsed;

    const promptMap: Record<string, any> = {
      "POST.INSTAGRAM": PROMPTS.POST.INSTAGRAM,
      "POST.LINKEDIN": PROMPTS.POST.LINKEDIN,
      "POST.TWITTER": PROMPTS.POST.TWITTER,
      "POST.FACEBOOK": PROMPTS.POST.FACEBOOK,
      "AD_COPY.GOOGLE": PROMPTS.AD_COPY.GOOGLE,
      "AD_COPY.META": PROMPTS.AD_COPY.META,
      "AD_COPY.DISPLAY": PROMPTS.AD_COPY.DISPLAY,
      "PRODUCT_DESC.ECOMMERCE": PROMPTS.PRODUCT_DESC.ECOMMERCE,
      "PRODUCT_DESC.B2B": PROMPTS.PRODUCT_DESC.B2B,
      "PRODUCT_DESC.TEASER": PROMPTS.PRODUCT_DESC.TEASER,
      "SALES_SCRIPT.COLD_CALL": PROMPTS.SALES_SCRIPT.COLD_CALL,
      "SALES_SCRIPT.DISCOVERY": PROMPTS.SALES_SCRIPT.DISCOVERY,
      "SALES_SCRIPT.OBJECTION": PROMPTS.SALES_SCRIPT.OBJECTION,
      "SALES_SCRIPT.CLOSING": PROMPTS.SALES_SCRIPT.CLOSING,
      "EMAIL.SUBJECT": PROMPTS.EMAIL.SUBJECT,
      "EMAIL.BODY": PROMPTS.EMAIL.BODY,
      "CAMPAIGN_PLAN": PROMPTS.CAMPAIGN_PLAN,
      "CTA_SUGGESTIONS": PROMPTS.CTA_SUGGESTIONS,
    };

    let finalPrompt;
    if (promptKey) {
      const promptTemplate = promptMap[promptKey];
      if (!promptTemplate) throw new Error(`Invalid promptKey: ${promptKey}`);
      finalPrompt = promptTemplate(inputs);
    } else if (prompt) {
      finalPrompt = prompt;
    } else {
      throw new Error("Either promptKey or prompt is required");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "You are a professional copywriter. Output ONLY the final raw text response. Do not include any thinking, brainstorming, outlines, preamble, or introductions. Start immediately with the result." 
          },
          { 
            role: "user", 
            content: finalPrompt 
          }
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) throw new Error(`Groq API error (${response.status}): ${JSON.stringify(data)}`);
    
    const resultRaw = data.choices?.[0]?.message?.content;
    if (!resultRaw) throw new Error("Groq returned empty response");

    let finalResult = resultRaw.trim();
    if (finalResult.startsWith('"') && finalResult.endsWith('"')) {
      finalResult = finalResult.slice(1, -1);
    }

    return new Response(JSON.stringify({ content: finalResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Unknown server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
