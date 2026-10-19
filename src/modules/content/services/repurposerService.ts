import { getService } from '@/core';
import { assetManager } from '@/core/assets/AssetManager';

export interface RepurposeJob {
  sourceAssetId: string;
  targetFormats: string[];
  clientId: string;
}

export interface RepurposeResult {
  format: string;
  platform: string;
  content: string;
  assetId: string;
}

export const repurposerService = {
  /**
   * Repurposes a source asset into multiple derivative formats.
   */
  async repurposeAsset(job: RepurposeJob): Promise<{ data: RepurposeResult[] | null, error: Error | null }> {
    const { sourceAssetId, targetFormats } = job;
    const ai = getService<any>('ai');

    try {
      const asset = await assetManager.getAsset(sourceAssetId);
      if (asset.error || !asset.data) throw new Error('Source asset not found');

      const sourceContent = asset.data.currentContent;
      const results: RepurposeResult[] = [];

      for (const format of targetFormats) {
        let promptKey = '';
        let platform = '';

        switch (format) {
          case 'twitter_thread':
            promptKey = 'REPURPOSE.LONG_TO_TWEETS';
            platform = 'TWITTER';
            break;
          case 'linkedin_post':
            promptKey = 'REPURPOSE.LONG_TO_LINKEDIN';
            platform = 'LINKEDIN';
            break;
          case 'instagram_caption':
            promptKey = 'REPURPOSE.LONG_TO_INSTAGRAM';
            platform = 'INSTAGRAM';
            break;
          case 'ad_copy':
            promptKey = 'REPURPOSE.LONG_TO_AD';
            platform = 'META';
            break;
          default:
            continue;
        }

        const response = await ai.generate({
          promptKey,
          inputs: {
            longFormContent: sourceContent,
            platform,
            count: 5,
            tone: 'Engaging',
          },
        });

        const parsed = JSON.parse(response.content);
        // Handle different prompt return formats
        const content = parsed.tweets ? JSON.stringify(parsed.tweets) : 
                        parsed.posts ? JSON.stringify(parsed.posts) : 
                        parsed.caption ? parsed.caption : 
                        parsed.primaryText || JSON.stringify(parsed);

        const { data: newAsset, error: assetError } = await assetManager.createAsset({
          workspace_id: asset.data.workspace_id,
          client_id: asset.data.client_id,
          project_id: asset.data.project_id,
          entity_type: 'repurpose_derivative',
          entity_id: sourceAssetId,
          type: 'post',
          title: `${format.replace('_', ' ')} version of ${asset.data.title}`,
          content: content,
          platform: platform,
          parent_asset_id: sourceAssetId,
          transformation_type: 'repurpose',
        });

        if (assetError || !newAsset) throw new Error(`Failed to save repurpose result for ${format}`);
        results.push({ format, platform, content, assetId: newAsset.id });
      }

      return { data: results, error: null };
    } catch (e: any) {
      console.error('[RepurposerService] repurposeAsset error:', e);
      return { data: null, error: e };
    }
  },

  /**
   * Special flow for long-form to video script repurposing.
   */
  async repurposeBlogToVideo(blogContent: string) {
    const ai = getService<any>('ai');
    try {
      const response = await ai.generate({
        promptKey: 'REPURPOSE.LONG_TO_INSTAGRAM', // Using similar logic
        inputs: {
          longFormContent: blogContent,
          platform: 'TIKTOK',
        },
      });
      return JSON.parse(response.content);
    } catch (e: any) {
      console.error('[RepurposerService] repurposeBlogToVideo error:', e);
      throw e;
    }
  }
};
