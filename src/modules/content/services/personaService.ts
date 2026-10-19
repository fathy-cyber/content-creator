import { supabase } from '@/lib/supabase';
import { z } from 'zod';

export interface Persona {
  id: string;
  name: string;
  ageRange: string;
  jobTitle: string;
  painPoints: string[];
  goals: string[];
  objections: string[];
  preferredChannels: string[];
  languageStyle: string;
  buyingTriggers: string[];
  org_id?: string;
}

const PersonaSchema = z.object({
  name: z.string().min(1),
  ageRange: z.string().optional(),
  jobTitle: z.string().optional(),
  painPoints: z.array(z.string()).optional().default([]),
  goals: z.array(z.string()).optional().default([]),
  objections: z.array(z.string()).optional().default([]),
  preferredChannels: z.array(z.string()).optional().default([]),
  languageStyle: z.string().optional(),
  buyingTriggers: z.array(z.string()).optional().default([]),
  org_id: z.string().uuid(),
});

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
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

export const personaService = {
  async generatePersona(inputs: { industry: string, product: string, existingCustomerData?: any }) {
    try {
      const prompt = `Create an Ideal Customer Profile persona for industry: "${inputs.industry}". Product/service: "${inputs.product}". Existing customer data: "${inputs.existingCustomerData?.text || ''}".

Return ONLY valid JSON with these exact fields: name (string), ageRange (string), jobTitle (string), painPoints (array of strings), goals (array of strings), objections (array of strings), preferredChannels (array of strings), languageStyle (string), buyingTriggers (array of strings). No markdown, no explanation.`;
      return await runAgent(prompt) as Persona;
    } catch (error) {
      console.error('[PersonaService] generatePersona error:', error);
      throw error;
    }
  },

  async savePersona(personaData: Partial<Persona>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!userData?.org_id) throw new Error('Organization ID not found for user');

      const validated = PersonaSchema.parse({
        ...personaData,
        org_id: userData.org_id,
      });

      const { data, error } = await supabase
        .from('personas')
        .upsert({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) supabaseError('Failed to save persona', error);
      return data as Persona;
    } catch (error) {
      console.error('[PersonaService] savePersona error:', error);
      throw error;
    }
  },

  async listPersonas(clientId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!userData?.org_id) throw new Error('Organization ID not found for user');

      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('org_id', userData.org_id);

      if (error) supabaseError('Failed to list personas', error);
      
      return (data || []) as Persona[];
    } catch (error: any) {
      if (!error?.message?.includes('Could not find the table')) {
        console.warn('[PersonaService] listPersonas error:', error.message);
      }
      return [];
    }
  },

  async linkPersonaToCampaign(personaId: string, campaignId: string) {
    // This would typically be a join table persona_campaigns
    console.log(`[PersonaService] Linking persona ${personaId} to campaign ${campaignId}`);
    return { success: true };
  },

  async injectPersonaIntoPrompt(personaId: string, promptString: string) {
    const { data: persona, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .single();

    if (error || !persona) return promptString;

    return `${promptString}\n\nTARGET PERSONA CONTEXT:\nName: ${persona.name}\nJob: ${persona.job_title}\nPain Points: ${persona.pain_points.join(', ')}`;
  }
};
