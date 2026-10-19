import { getService } from '@/core';
import { z } from 'zod';
import { runAgent } from '../agents/agentClient';

export const CreateABTestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  element: z.string().min(1),
  goal: z.string().min(1),
  hypothesis: z.string().optional(),
  controlDescription: z.string().optional(),
  trafficSplit: z.number().int().min(10).max(90).default(50),
  confidenceLevel: z.number().min(0.8).max(0.99).default(0.95),
});

export type ABTestInput = z.infer<typeof CreateABTestSchema>;

export interface ABTest {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  element: string;
  goal: string;
  hypothesis: string | null;
  status: string;
  traffic_split: number;
  confidence_level: number;
  control_description: string | null;
  variants: ABVariant[];
  winner_variant: string | null;
  success_metrics: string[];
  estimated_duration_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface ABVariant {
  name: string;
  description: string;
  changes: string[];
  expectedImpact: string;
  risk: 'Low' | 'Medium' | 'High';
}

function getSupabase() {
  return getService<any>('supabase');
}

async function getOrgId(): Promise<string> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const { data: userData } = await supabase
    .from('users').select('org_id').eq('id', user.id).single();
  if (!userData?.org_id) throw new Error('Organization ID not found');
  return userData.org_id;
}

export const abTestService = {
  async generateVariants(input: {
    currentVersion: string;
    goal: string;
    element: string;
    hypothesis: string;
    targetAudience?: string;
    brandVoice?: string;
    variantCount?: number;
  }) {
    const prompt = `Design A/B test variants for a ${input.element} with goal: "${input.goal}". Current version: "${input.currentVersion}". Hypothesis: "${input.hypothesis}". Target audience: "${input.targetAudience || ''}". Brand voice: "${input.brandVoice || ''}". Number of variants: ${input.variantCount || 2}.

Return ONLY valid JSON with these exact fields: variants (array of objects each with name, description, changes (array of strings), expectedImpact, risk ("Low"|"Medium"|"High")), recommendedSampleSize (number), estimatedDurationDays (number), successMetrics (array of strings). No markdown, no explanation.`;
    const result = await runAgent(prompt);
    const parsed = JSON.parse(result.output || '{}');
    return parsed as {
      variants: ABVariant[];
      recommendedSampleSize: number;
      estimatedDurationDays: number;
      successMetrics: string[];
    };
  },

  async create(data: ABTestInput, variants: ABVariant[], successMetrics: string[], estimatedDays?: number) {
    const supabase = getSupabase();
    const orgId = await getOrgId();
    const { data: test, error } = await supabase
      .from('ab_tests')
      .insert({
        org_id: orgId,
        name: data.name,
        description: data.description || null,
        element: data.element,
        goal: data.goal,
        hypothesis: data.hypothesis || null,
        control_description: data.controlDescription || null,
        traffic_split: data.trafficSplit,
        confidence_level: data.confidenceLevel,
        variants,
        success_metrics: successMetrics,
        estimated_duration_days: estimatedDays || null,
      })
      .select()
      .single();
    if (error) throw error;
    return test as ABTest;
  },

  async list() {
    const supabase = getSupabase();
    const orgId = await getOrgId();
    const { data, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ABTest[];
  },

  async updateStatus(id: string, status: string, winner?: string) {
    const supabase = getSupabase();
    const updates: Record<string, any> = { status };
    if (winner) updates.winner_variant = winner;
    const { data, error } = await supabase
      .from('ab_tests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ABTest;
  },

  calculateSampleSize(baseConversionRate: number, minimumDetectableEffect: number, confidence: number = 0.95, power: number = 0.8): number {
    const z = confidence === 0.99 ? 2.576 : confidence === 0.95 ? 1.96 : 1.645;
    const beta = power === 0.9 ? 1.282 : 0.842;
    const p1 = baseConversionRate / 100;
    const p2 = (baseConversionRate + minimumDetectableEffect) / 100;
    const pAvg = (p1 + p2) / 2;
    const numerator = Math.pow(z * Math.sqrt(2 * pAvg * (1 - pAvg)) + beta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const denominator = Math.pow(p2 - p1, 2);
    return Math.ceil(numerator / denominator);
  },

  calculateSignificance(controlConversions: number, controlTotal: number, variantConversions: number, variantTotal: number): number {
    if (controlTotal === 0 || variantTotal === 0) return 0;
    const p1 = controlConversions / controlTotal;
    const p2 = variantConversions / variantTotal;
    const pPooled = (controlConversions + variantConversions) / (controlTotal + variantTotal);
    const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / controlTotal + 1 / variantTotal));
    if (se === 0) return 0;
    const z = Math.abs(p2 - p1) / se;
    return (1 - 0.5 * (1 + erf(z / Math.sqrt(2)))) * 100;
  },
};

function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
