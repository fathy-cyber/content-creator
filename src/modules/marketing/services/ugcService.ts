import { getService } from '@/core';
import { z } from 'zod';
import { runAgent } from '../agents/agentClient';

export const CreateUGCItemSchema = z.object({
  source: z.string().default('manual'),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  contentType: z.enum(['review', 'testimonial', 'social_post', 'comment', 'mention', 'case_study', 'other']).default('review'),
  contentText: z.string().min(1),
  authorName: z.string().optional(),
  authorHandle: z.string().optional(),
});

export type UGCItemInput = z.infer<typeof CreateUGCItemSchema>;

export interface UGCAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  keyThemes: string[];
  tone: string;
  suggestedTags: string[];
  marketingUseCases: string[];
  quotableSnippet: string;
  recommendedFormat: string;
  approvalScore: number;
}

export interface UGCItem {
  id: string;
  org_id: string;
  source: string;
  source_url: string | null;
  content_type: string;
  content_text: string;
  author_name: string | null;
  author_handle: string | null;
  sentiment: string;
  key_themes: string[];
  suggested_tags: string[];
  marketing_use_cases: string[];
  quotable_snippet: string | null;
  recommended_format: string;
  approval_score: number;
  status: string;
  created_at: string;
  updated_at: string;
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

export const ugcService = {
  async analyze(input: UGCItemInput): Promise<UGCAnalysis> {
    const prompt = `Analyze this user-generated content for brand "". Content type: "${input.contentType}". Source: "${input.source}". Content text: "${input.contentText}".

Return ONLY valid JSON with these exact fields: sentiment ("positive"|"neutral"|"negative"), keyThemes (array of strings), tone (string), suggestedTags (array of strings), marketingUseCases (array of strings), quotableSnippet (string), recommendedFormat (string), approvalScore (number 0-10). No markdown, no explanation.`;
    const result = await runAgent(prompt);
    const parsed = JSON.parse(result.output || '{}');
    return parsed as UGCAnalysis;
  },

  async save(input: UGCItemInput, analysis: UGCAnalysis) {
    const supabase = getSupabase();
    const orgId = await getOrgId();
    const { data, error } = await supabase
      .from('ugc_items')
      .insert({
        org_id: orgId,
        source: input.source,
        source_url: input.sourceUrl || null,
        content_type: input.contentType,
        content_text: input.contentText,
        author_name: input.authorName || null,
        author_handle: input.authorHandle || null,
        sentiment: analysis.sentiment,
        key_themes: analysis.keyThemes,
        suggested_tags: analysis.suggestedTags,
        marketing_use_cases: analysis.marketingUseCases,
        quotable_snippet: analysis.quotableSnippet,
        recommended_format: analysis.recommendedFormat,
        approval_score: analysis.approvalScore,
        status: analysis.approvalScore >= 7 ? 'approved' : 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return data as UGCItem;
  },

  async list(status?: string) {
    const supabase = getSupabase();
    const orgId = await getOrgId();
    let query = supabase
      .from('ugc_items')
      .select('*')
      .eq('org_id', orgId);
    if (status) query = query.eq('status', status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as UGCItem[];
  },

  async updateStatus(id: string, status: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ugc_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as UGCItem;
  },
};
