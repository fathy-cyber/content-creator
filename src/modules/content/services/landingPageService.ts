import { getService } from '@/core';

export interface AIDAPage {
  attention: { headline: string, subheadline: string };
  interest: { body: string };
  desire: { bullets: string[] };
  action: { cta: string, urgencyLine: string };
}

export interface PASPage {
  problem: string;
  agitation: string;
  solution: string;
  cta: string;
}

async function runAgent(prompt: string): Promise<any> {
  const AGENT_API_URL = import.meta.env.VITE_DCA_API_URL || 'http://localhost:8010';
  const response = await fetch(`${AGENT_API_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    throw new Error(`Agent API error (${response.status}): ${await response.text()}`);
  }
  const result = await response.json();
  return JSON.parse(result.output || '{}');
}

export const landingPageService = {
  async generateAIDAPage(inputs: { product: string, targetPersona: string, USP: string, CTA: string }) {
    try {
      const prompt = `Write an AIDA landing page for product: "${inputs.product}". Target persona: "${inputs.targetPersona}". USP: "${inputs.USP}". CTA: "${inputs.CTA}".

Return ONLY valid JSON with these exact fields: attention (object with headline, subheadline), interest (object with body), desire (object with bullets array of strings), action (object with cta, urgencyLine). No markdown, no explanation.`;
      return await runAgent(prompt) as AIDAPage;
    } catch (error) {
      console.error('[LandingPageService] generateAIDAPage error:', error);
      throw error;
    }
  },

  async generatePASPage(inputs: { product: string, targetPersona: string, mainProblem: string }) {
    try {
      const prompt = `Write a PAS landing page for product: "${inputs.product}". Target persona: "${inputs.targetPersona}". Main problem: "${inputs.mainProblem}".

Return ONLY valid JSON with these exact fields: problem (string), agitation (string), solution (string), cta (string). No markdown, no explanation.`;
      return await runAgent(prompt) as PASPage;
    } catch (error) {
      console.error('[LandingPageService] generatePASPage error:', error);
      throw error;
    }
  },

  async generateHeroSection(inputs: { product: string, targetPersona: string, USP: string }) {
    try {
      const prompt = `Write a hero section (headline + subheadline) for product: "${inputs.product}". Target persona: "${inputs.targetPersona}". USP: "${inputs.USP}".

Return ONLY valid JSON with these exact fields: headline (string), subheadline (string). No markdown, no explanation.`;
      const parsed = await runAgent(prompt);
      return parsed;
    } catch (error) {
      console.error('[LandingPageService] generateHeroSection error:', error);
      throw error;
    }
  },

  async saveLandingPage(content: any) {
    const assets = getService<any>('assets');
    return assets.createAsset({
      title: `Landing Page - ${content.product || 'New Page'}`,
      type: 'landing_page',
      content: JSON.stringify(content),
      platform: 'WEB',
      entity_type: 'landing_page',
      entity_id: '00000000-0000-0000-0000-000000000000',
    });
  }
};
