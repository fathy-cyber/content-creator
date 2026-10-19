import { getService } from '@/core';
import { z } from 'zod';
import { runAgent } from '../agents/agentClient';

export const SEOPageSchema = z.object({
  url: z.string().url(),
  pageTitle: z.string().optional(),
  pageContent: z.string().optional(),
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.array(z.string()).default([]),
  targetAudience: z.string().optional(),
  brandName: z.string().optional(),
  tone: z.string().default('Professional'),
});

export type SEOPageInput = z.infer<typeof SEOPageSchema>;

export interface SEOResult {
  titleTag: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string[];
  structuredData: Record<string, any>;
  h1Tag: string;
  urlSlug: string;
}

function getSupabase() {
  return getService<any>('supabase');
}

async function getOrgId(): Promise<string> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!userData?.org_id) throw new Error('Organization ID not found for user');
  return userData.org_id;
}

export const seoService = {
  async generate(input: SEOPageInput): Promise<SEOResult> {
    const prompt = `Generate SEO meta tags for a page titled "${input.pageTitle || ''}" with content: "${input.pageContent || ''}". Primary keyword: "${input.primaryKeyword}". Secondary keywords: ${(input.secondaryKeywords || []).join(', ')}. Target audience: "${input.targetAudience || ''}". Brand name: "${input.brandName || ''}". Tone: "${input.tone || 'Professional'}".

Return ONLY valid JSON with these exact fields: titleTag, metaDescription, ogTitle, ogDescription, ogImage, keywords (array), structuredData (object), h1Tag, urlSlug. No markdown, no explanation.`;
    const result = await runAgent(prompt);
    const parsed = JSON.parse(result.output || '{}');
    return parsed as SEOResult;
  },

  async save(input: SEOPageInput, tags: SEOResult) {
    const supabase = getSupabase();
    const orgId = await getOrgId();
    const { data, error } = await supabase
      .from('seo_pages')
      .insert({
        org_id: orgId,
        url: input.url,
        page_title: input.pageTitle,
        page_content: input.pageContent,
        primary_keyword: input.primaryKeyword,
        secondary_keywords: input.secondaryKeywords,
        generated_tags: tags,
        status: 'draft',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async list() {
    const supabase = getSupabase();
    const orgId = await getOrgId();
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};
