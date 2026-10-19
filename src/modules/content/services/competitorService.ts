import { getService } from '@/core';
import { supabase } from '@/lib/supabase';

export interface CompetitorAnalysis {
  angles: string[];
  weaknesses: string[];
  gaps: string[];
  emotionalTriggers: string[];
}

export interface CounterAngle {
  counterAngles: string[];
  suggestedHooks: string[];
  adCopy: string;
}

export interface Competitor {
  id: string;
  name: string;
  platform: string;
  adLibraryUrl?: string;
  created_at: string;
}

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const competitorService = {
  async analyzeCompetitorAd(adCopy: string, competitorName: string, ourProduct: string, ourUSP: string) {
    const ai = getService<any>('ai');
    
    try {
      const response = await ai.generate({
        promptKey: 'COMPETITOR.GAP_ANALYSIS',
        inputs: {
          competitorAdCopy: adCopy,
          competitorName: competitorName,
          ourProduct: ourProduct,
          ourUSP: ourUSP,
        },
      });
      
      const content = response.content;
      let parsed;
      try {
        parsed = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        parsed = { angles: [], weaknesses: [], gaps: [], emotionalTriggers: [] };
      }
      
      return {
        analysis: parsed as CompetitorAnalysis,
        competitorName,
      };
    } catch (error) {
      console.error('[CompetitorService] analyzeCompetitorAd error:', error);
      throw error;
    }
  },

  async generateCounterAd(competitorAnalysis: CompetitorAnalysis, brandVoice: string, targetPersona: string) {
    const ai = getService<any>('ai');
    
    try {
      const response = await ai.generate({
        promptKey: 'COMPETITOR.COUNTER_ANGLE',
        inputs: {
          competitorAnalysis,
          brandVoice,
          targetPersona,
        },
      });

      const content = response.content;
      let parsed;
      try {
        parsed = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        parsed = { counterAngles: [], suggestedHooks: [], adCopy: 'Failed to generate counter-ad' };
      }
      
      return parsed as CounterAngle;
    } catch (error) {
      console.error('[CompetitorService] generateCounterAd error:', error);
      throw error;
    }
  },

  async trackCompetitor(name: string, platform: string, adLibraryUrl?: string) {
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
        .from('competitors')
        .insert({
          name,
          platform,
          ad_library_url: adLibraryUrl,
          org_id: userData.org_id,
        })
        .select()
        .single();

      if (error) supabaseError('Failed to track competitor', error);
      return data as Competitor;
    } catch (error) {
      console.error('[CompetitorService] trackCompetitor error:', error);
      throw error;
    }
  },

  async listCompetitors() {
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
        .from('competitors')
        .select('*')
        .eq('org_id', userData.org_id)
        .order('created_at', { ascending: false });

      if (error) supabaseError('Failed to list competitors', error);
      
      return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        platform: c.platform,
        adLibraryUrl: c.ad_library_url,
        created_at: c.created_at,
      })) as Competitor[];
    } catch (error) {
      console.error('[CompetitorService] listCompetitors error:', error);
      return [];
    }
  },

  async deleteCompetitor(id: string) {
    try {
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', id);

      if (error) supabaseError('Failed to delete competitor', error);
      return { success: true };
    } catch (error) {
      console.error('[CompetitorService] deleteCompetitor error:', error);
      throw error;
    }
  },

  async saveAnalysis(analysis: CompetitorAnalysis, competitorName: string) {
    const assets = getService<any>('assets');
    return assets.createAsset({
      title: `Competitor Analysis - ${competitorName}`,
      type: 'competitor_analysis',
      content: JSON.stringify(analysis),
      platform: 'WEB',
      entity_type: 'competitor_analysis',
      entity_id: '00000000-0000-0000-0000-000000000000',
    });
  },
};
