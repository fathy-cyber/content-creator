import { getService } from '@/core';
import { assetManager } from '@/core/assets/AssetManager';

export interface TranslationRequest {
  assetId: string;
  targetLanguages: string[];
}

export interface TranslationResult {
  sourceAssetId: string;
  translatedAssets: {
    language: string;
    assetId: string;
  }[];
}

export const translationService = {
  /**
   * Translates an existing asset into multiple target languages.
   */
  async translateAsset(request: TranslationRequest): Promise<{ data: TranslationResult | null, error: Error | null }> {
    const { assetId, targetLanguages } = request;
    const ai = getService<any>('ai');

    try {
      const asset = await assetManager.getAsset(assetId);
      if (asset.error || !asset.data) throw new Error('Source asset not found');

      const sourceContent = asset.data.currentContent;
      const sourceLanguage = asset.data.language || 'en';
      const translatedAssets: { language: string; assetId: string }[] = [];

      for (const lang of targetLanguages) {
        const response = await ai.generate({
          promptKey: 'TRANSLATE',
          inputs: {
            content: sourceContent,
            fromLanguage: sourceLanguage,
            toLanguage: lang,
            toneDescriptors: asset.data.title ? [asset.data.title] : [], // Simplified
          },
        });

        const parsed = JSON.parse(response.content);
        const translatedText = parsed.translatedContent;

        const { data: newAsset, error: assetError } = await assetManager.createAsset({
          workspace_id: asset.data.workspace_id,
          client_id: asset.data.client_id,
          project_id: asset.data.project_id,
          entity_type: asset.data.entity_type,
          entity_id: asset.data.entity_id,
          type: asset.data.type,
          title: `[${lang}] ${asset.data.title}`,
          content: translatedText,
          platform: asset.data.platform,
          language: lang,
          parent_asset_id: assetId,
          transformation_type: 'translation',
        });

        if (assetError || !newAsset) throw new Error(`Failed to save translation for ${lang}`);
        translatedAssets.push({ language: lang, assetId: newAsset.id });
      }

      return { 
        data: { sourceAssetId: assetId, translatedAssets }, 
        error: null 
      };
    } catch (e: any) {
      console.error('[TranslationService] translateAsset error:', e);
      return { data: null, error: e };
    }
  },

  /**
   * Generic content translation without creating an asset.
   */
  async translateContent(content: string, fromLang: string, toLang: string, brandVoiceId?: string): Promise<{ data: string | null, error: Error | null }> {
    const ai = getService<any>('ai');
    try {
      const response = await ai.generate({
        promptKey: 'TRANSLATE',
        inputs: {
          content,
          fromLanguage: fromLang,
          toLanguage: toLang,
          toneDescriptors: [], // In real app, fetch from brandVoiceId
        },
      });
      const parsed = JSON.parse(response.content);
      return { data: parsed.translatedContent, error: null };
    } catch (e: any) {
      console.error('[TranslationService] translateContent error:', e);
      return { data: null, error: e };
    }
  },

  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'French' },
      { code: 'ar', name: 'Arabic' },
      { code: 'es', name: 'Spanish' },
      { code: 'de', name: 'German' },
    ];
  }
};
