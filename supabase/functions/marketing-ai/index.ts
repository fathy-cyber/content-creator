import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { PROMPTS } from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
    const rawBody = await req.text();
    if (!rawBody) throw new Error("Request body is empty");
    let parsed;
    try { parsed = JSON.parse(rawBody); } catch { throw new Error("Invalid JSON body"); }
    const { promptKey, inputs = {} } = parsed;
    if (!promptKey) throw new Error("promptKey is required");

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

    const promptTemplate = promptMap[promptKey];
    if (!promptTemplate) throw new Error(`Invalid promptKey: ${promptKey}`);
    const finalPrompt = promptTemplate(inputs);

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
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Groq API error (${response.status}): ${JSON.stringify(data)}`);
    
    const resultRaw = data.choices?.[0]?.message?.content;
    if (!resultRaw) throw new Error("Groq returned empty response");

    let finalResult = resultRaw.trim();
    if (finalResult.startsWith('"') && finalResult.endsWith('"')) {
      finalResult = finalResult.slice(1, -1);
    }

    return new Response(JSON.stringify({ result: finalResult }), {
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
