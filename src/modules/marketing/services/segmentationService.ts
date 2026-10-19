import { z } from 'zod';
import { supabase } from '@/lib/supabase';

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  filters: any;
  lead_count: number;
  created_by: string | null;
  org_id: string;
  created_at: string;
  updated_at: string;
}

const CreateSegmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  filters: z.any(),
  org_id: z.string().uuid(),
  created_by: z.string().uuid().optional().nullable(),
});

const UpdateSegmentSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  filters: z.any().optional(),
});

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const segmentationService = {
  /**
   * Creates a new audience segment.
   */
  async createSegment(data: z.infer<typeof CreateSegmentSchema>): Promise<Segment> {
    const validated = CreateSegmentSchema.parse(data);
    
    const { data: segment, error } = await supabase
      .from('audience_segments')
      .insert(validated)
      .select()
      .single();
      
    if (error) supabaseError('Failed to create segment', error);
    return segment as Segment;
  },

  /**
   * Lists all segments for an organization.
   */
  async listSegments(orgId: string): Promise<Segment[]> {
    const { data, error } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('org_id', orgId);
      
    if (error) supabaseError('Failed to list segments', error);
    return data || [];
  },

  /**
   * Evaluates which leads fit into a segment based on filters.
   */
  async evaluateSegment(segmentId: string): Promise<{ leads: any[], count: number }> {
    const { data: segment, error: sErr } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('id', segmentId)
      .single();
    if (sErr) supabaseError('Failed to fetch segment for evaluation', sErr);

    const filters = segment?.filters;
    let query = supabase.from('marketing_leads').select('*', { count: 'exact' });

    if (filters?.score_min) query = query.gte('score', filters.score_min);
    if (filters?.score_max) query = query.lte('score', filters.score_max);
    if (filters?.source) query = query.eq('source', filters.source);
    if (filters?.status) {
      if (Array.isArray(filters.status)) query = query.in('status', filters.status);
      else query = query.eq('status', filters.status);
    }
    if (filters?.campaign_id) query = query.eq('campaign_id', filters.campaign_id);
    if (filters?.created_after) query = query.gte('created_at', filters.created_after);
    if (filters?.created_before) query = query.lte('created_at', filters.created_before);

    const { data, error, count } = await query;
    if (error) supabaseError('Failed to evaluate segment', error);

    return { leads: data || [], count: count || 0 };
  },

  /**
   * Updates a segment.
   */
  async updateSegment(id: string, data: z.infer<typeof UpdateSegmentSchema>): Promise<Segment> {
    const validated = UpdateSegmentSchema.parse(data);
    
    const { data: segment, error } = await supabase
      .from('audience_segments')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) supabaseError('Failed to update segment', error);
    return segment as Segment;
  },

  /**
   * Deletes a segment.
   */
  async deleteSegment(id: string): Promise<void> {
    const { error } = await supabase
      .from('audience_segments')
      .delete()
      .eq('id', id);
      
    if (error) supabaseError('Failed to delete segment', error);
  },

  /**
   * Fetches leads belonging to a segment.
   */
  async getLeadsInSegment(segmentId: string): Promise<any[]> {
    const { leads } = await this.evaluateSegment(segmentId);
    return leads;
  },
};
