import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { emitters } from '@/modules/marketing/events/emitters';

export interface Asset {
  id: string;
  campaign_id: string | null;
  type: 'post' | 'ad_copy' | 'product_description' | 'sales_script' | 'email' | 'whatsapp_template' | 'document' | 'internal_doc';
  platform: string | null;
  title: string;
  content: string;
  tone: string | null;
  status: 'draft' | 'approved' | 'published' | 'archived';
  created_by: string | null;
  org_id: string;
  created_at: string;
  updated_at: string;
}

const SaveAssetSchema = z.object({
  campaign_id: z.string().uuid().optional().nullable(),
  type: z.enum(['post', 'ad_copy', 'product_description', 'sales_script', 'email', 'whatsapp_template', 'document', 'internal_doc']),
  platform: z.string().optional().nullable(),
  title: z.string().min(1),
  content: z.string().min(1),
  tone: z.string().optional().nullable(),
  status: z.enum(['draft', 'approved', 'published', 'archived']).default('draft'),
  created_by: z.string().uuid().optional().nullable(),
  org_id: z.string().uuid(),
});

const UpdateAssetSchema = z.object({
  campaign_id: z.string().uuid().optional().nullable(),
  platform: z.string().optional().nullable(),
  title: z.string().optional(),
  content: z.string().optional(),
  tone: z.string().optional().nullable(),
  status: z.enum(['draft', 'approved', 'published', 'archived']).optional(),
});

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const assetService = {
  /**
   * Saves a new asset.
   */
  async saveAsset(data: z.infer<typeof SaveAssetSchema>): Promise<Asset> {
    const validated = SaveAssetSchema.parse(data);
    
    const { data: asset, error } = await supabase
      .from('marketing_assets')
      .insert(validated)
      .select()
      .single();
      
    if (error) supabaseError('Failed to save asset', error);
    return asset as Asset;
  },

  /**
   * Fetches an asset by ID.
   */
  async getAsset(id: string): Promise<Asset> {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) supabaseError('Failed to fetch asset', error);
    return data as Asset;
  },

  /**
   * Lists assets with pagination.
   */
  async listAssets(params: { limit: number, offset: number, type?: string, status?: string, campaign_id?: string }): Promise<{ assets: Asset[], total: number }> {
    let query = supabase
      .from('marketing_assets')
      .select('*', { count: 'exact' });

    if (params.type) query = query.eq('type', params.type);
    if (params.status) query = query.eq('status', params.status);
    if (params.campaign_id) query = query.eq('campaign_id', params.campaign_id);

    const { data, error, count } = await query
      .range(params.offset, params.offset + params.limit - 1)
      .order('created_at', { ascending: false });

    if (error) supabaseError('Failed to list assets', error);
    return { assets: (data || []) as Asset[], total: count || 0 };
  },

  /**
   * Updates an asset.
   */
  async updateAsset(id: string, data: z.infer<typeof UpdateAssetSchema>): Promise<Asset> {
    const validated = UpdateAssetSchema.parse(data);
    
    const { data: asset, error } = await supabase
      .from('marketing_assets')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) supabaseError('Failed to update asset', error);
    return asset as Asset;
  },

  /**
   * Deletes an asset.
   */
  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_assets')
      .delete()
      .eq('id', id);
      
    if (error) supabaseError('Failed to delete asset', error);
  },

  /**
   * Publishes an asset and emits event.
   */
  async publishAsset(id: string): Promise<Asset> {
    const asset = await this.updateAsset(id, { status: 'published' });
    emitters.assetPublished(asset);
    return asset;
  },

  /**
   * Links an asset to a campaign.
   */
  async linkAssetToCampaign(assetId: string, campaignId: string): Promise<Asset> {
    return this.updateAsset(assetId, { campaign_id: campaignId });
  },

  /**
   * Lists assets associated with a specific campaign.
   */
  async getAssetsByCampaign(campaignId: string): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('campaign_id', campaignId);
      
    if (error) supabaseError('Failed to fetch assets for campaign', error);
    return data || [];
  },
};
