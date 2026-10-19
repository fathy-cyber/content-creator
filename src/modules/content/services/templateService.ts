import { getService } from '@/core';
import { assetManager } from '@/core/assets/AssetManager';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

export interface ContentTemplate {
  id: string;
  name: string;
  promptKey: string;
  defaultInputs: any;
  category: string;
  is_shared: boolean;
  created_at: string;
  org_id?: string;
}

const TemplateSchema = z.object({
  name: z.string().min(1),
  prompt_key: z.string().min(1),
  default_inputs: z.any().optional().default({}),
  category: z.string().optional(),
  is_shared: z.boolean().optional().default(false),
  org_id: z.string().uuid(),
});

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const templateService = {
  async saveAsTemplate(assetId: string, name: string, category: string) {
    const asset = await assetManager.getAsset(assetId);
    if (asset.error || !asset.data) throw new Error('Asset not found');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!userData?.org_id) throw new Error('Organization ID not found for user');

      const validated = TemplateSchema.parse({
        name,
        prompt_key: 'DYNAMIC_TEMPLATE', 
        default_inputs: { content: asset.data.currentContent },
        category,
        org_id: userData.org_id,
      });

      const { data, error } = await supabase
        .from('content_templates')
        .insert(validated)
        .select()
        .single();

      if (error) supabaseError('Failed to save template', error);
      return data as ContentTemplate;
    } catch (error) {
      console.error('[TemplateService] saveAsTemplate error:', error);
      throw error;
    }
  },

  async createFromTemplate(templateId: string, overrideInputs: any) {
    const ai = getService<any>('ai');
    
    try {
      const { data: template, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !template) supabaseError('Template not found', error);

      const inputs = { ...template.default_inputs, ...overrideInputs };
      
      const response = await ai.generate({
        promptKey: template.prompt_key,
        inputs,
      });

      return typeof response.content === 'string' ? JSON.parse(response.content) : response.content;
    } catch (error) {
      console.error('[TemplateService] createFromTemplate error:', error);
      throw error;
    }
  },

  async listTemplates(category?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!userData?.org_id) throw new Error('Organization ID not found for user');

      let query = supabase
        .from('content_templates')
        .select('*')
        .eq('org_id', userData.org_id);

      if (category) query = query.eq('category', category);

      const { data, error } = await query;

      if (error) supabaseError('Failed to list templates', error);
      return (data || []) as ContentTemplate[];
    } catch (error) {
      console.error('[TemplateService] listTemplates error:', error);
      return [];
    }
  },

  async shareTemplate(id: string) {
    try {
      const { error } = await supabase
        .from('content_templates')
        .update({ is_shared: true })
        .eq('id', id);

      if (error) supabaseError('Failed to share template', error);
      return { success: true };
    } catch (error) {
      console.error('[TemplateService] shareTemplate error:', error);
      throw error;
    }
  },

  async cloneTemplate(id: string) {
    try {
      const { data: template, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !template) supabaseError('Template not found', error);

      const { data: cloned, error: cloneErr } = await supabase
        .from('content_templates')
        .insert({
          ...template,
          id: undefined,
          name: `Clone of ${template.name}`,
        })
        .select()
        .single();

      if (cloneErr) supabaseError('Failed to clone template', cloneErr);
      return cloned;
    } catch (error) {
      console.error('[TemplateService] cloneTemplate error:', error);
      throw error;
    }
  }
};
