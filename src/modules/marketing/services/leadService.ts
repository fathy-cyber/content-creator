import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { emitters } from '../events/emitters';

export interface Lead {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  source: string;
  campaign_id: string | null;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  metadata: Record<string, any>;
  org_id: string;
  created_at: string;
  updated_at: string;
}

const CreateLeadSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  source: z.string(),
  campaign_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
  org_id: z.string().uuid(),
});

const UpdateLeadSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const leadService = {
  /**
   * Creates a new marketing lead.
   */
  async createLead(data: z.infer<typeof CreateLeadSchema>): Promise<Lead> {
    const validated = CreateLeadSchema.parse(data);
    
    const { data: lead, error } = await supabase
      .from('marketing_leads')
      .insert({
        ...validated,
        score: 0,
        status: 'new',
      })
      .select()
      .single();
      
    if (error) supabaseError('Failed to create lead', error);
    
    const createdLead = lead as Lead;
    emitters.leadCreated(createdLead);
    
    return createdLead;
  },

  /**
   * Fetches a lead by ID.
   */
  async getLead(id: string): Promise<Lead> {
    const { data: lead, error } = await supabase
      .from('marketing_leads')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) supabaseError('Failed to fetch lead', error);
    return lead as Lead;
  },

  /**
   * Lists leads with pagination.
   */
  async listLeads(params: { limit: number, offset: number, status?: string, campaign_id?: string }): Promise<{ leads: Lead[], total: number }> {
    let query = supabase
      .from('marketing_leads')
      .select('*', { count: 'exact' });

    if (params.status) query = query.eq('status', params.status);
    if (params.campaign_id) query = query.eq('campaign_id', params.campaign_id);

    const { data, error, count } = await query
      .range(params.offset, params.offset + params.limit - 1)
      .order('created_at', { ascending: false });

    if (error) supabaseError('Failed to list leads', error);
    return { leads: (data || []) as Lead[], total: count || 0 };
  },

  /**
   * Updates lead information.
   */
  async updateLead(id: string, data: z.infer<typeof UpdateLeadSchema>): Promise<Lead> {
    const validated = UpdateLeadSchema.parse(data);
    
    const { data: lead, error } = await supabase
      .from('marketing_leads')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) supabaseError('Failed to update lead', error);
    return lead as Lead;
  },

  /**
   * Deletes a lead.
   */
  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_leads')
      .delete()
      .eq('id', id);
      
    if (error) supabaseError('Failed to delete lead', error);
  },

  /**
   * Calculates and updates lead score based on predefined rules.
   */
  async scoreLead(leadId: string): Promise<Lead> {
    const lead = await this.getLead(leadId);
    let score = 0;

    // Scoring rules
    if (lead.source === 'referral') score += 20;
    if (lead.source === 'organic') score += 10;
    if (lead.email) score += 15;
    if (lead.phone) score += 10;
    if (lead.metadata?.company) score += 15;

    // Touchpoint scoring
    const { count: touchpointsCount } = await supabase
      .from('touchpoints')
      .select('*', { count: 'exact', head: true })
      .eq('lead_id', leadId);
    
    score += Math.min((touchpointsCount || 0) * 5, 25);

    const previousStatus = lead.status;
    const newStatus = score >= 70 ? 'qualified' : lead.status;

    const { data: updatedLead, error } = await supabase
      .from('marketing_leads')
      .update({ score, status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (error) supabaseError('Failed to update lead score', error);
    
    const finalLead = updatedLead as Lead;
    if (newStatus === 'qualified' && previousStatus !== 'qualified') {
      emitters.leadScored(finalLead, score, 'Automated scoring reached threshold');
    }

    return finalLead;
  },

  /**
   * Marks a lead as converted.
   */
  async convertLead(id: string): Promise<Lead> {
    return this.updateLead(id, { status: 'converted' });
  },

  /**
   * Tracks a new touchpoint for a lead.
   */
  async trackTouchpoint(data: { lead_id: string, campaign_id: string | null, channel: string, source: string, medium: string, utm_campaign: string, page_url: string, event_type: string, org_id: string }): Promise<void> {
    const { error } = await supabase
      .from('touchpoints')
      .insert(data);
      
    if (error) supabaseError('Failed to track touchpoint', error);
  },
};
