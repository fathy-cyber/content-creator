import { z } from 'zod';
import { getService } from '@/core';
import { useContextStore } from '@/core/context/ContextStore';
import { GeneratedContent } from '@/core/ai/types';
import { Asset } from '@/core/assets/types';
import { toast } from 'sonner';

/**
 * GeneratorService handles the high-level logic for generating content.
 * It delegates the actual AI generation to the aiGateway and persistence to the AssetManager.
 */
export class GeneratorService {
    private ai = getService<any>('ai');
    private assets = getService<any>('assets');

    /**
     * Helper to handle AI generation and asset creation
     */
    private async generateAndSave(
        promptKey: string, 
        inputs: Record<string, unknown>, 
        assetType: Asset['type'], 
        assetTitle: string, 
        clientId?: string
    ): Promise<{ content: string, assetId: string, error: Error | null }> {
        try {
            const response = await this.ai.generate({
                promptKey,
                inputs,
                clientId,
            });

            const content = response.content;
            const parsed = typeof content === 'string' ? JSON.parse(content) : content;
            const finalText = typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : parsed;

            const { data: asset, error: assetError } = await this.assets.createAsset({
                workspace_id: useContextStore.getState().activeWorkspaceId,
                client_id: clientId,
                title: assetTitle,
                type: assetType,
                content: finalText,
                entity_type: assetType,
                entity_id: `${assetType}_${Date.now()}`,
            });

            if (assetError) throw assetError;

            return { content: finalText, assetId: asset!.id, error: null };
        } catch (e: any) {
            return { content: '', assetId: '', error: e };
        }
    }

    /**
     * Generates a social media post and saves it as an asset.
     */
    async generatePost(platform: string, inputs: Record<string, unknown>, clientId?: string): Promise<{ content: string, assetId: string, error: Error | null }> {
        return this.generateAndSave(
            `POST.${platform.toUpperCase()}`,
            inputs,
            'post',
            `Generated ${platform} post`,
            clientId
        );
    }

    /**
     * Generates ad copy and saves it as an asset.
     */
    async generateAdCopy(platform: string, inputs: Record<string, unknown>, clientId?: string): Promise<{ content: string, assetId: string, error: Error | null }> {
        return this.generateAndSave(
            `AD_COPY.${platform.toUpperCase()}`,
            inputs,
            'ad_copy',
            `Generated ${platform} ad copy`,
            clientId
        );
    }

    /**
     * Generates product descriptions.
     */
    async generateProductDescription(variant: string, inputs: Record<string, unknown>, clientId?: string): Promise<{ content: string, assetId: string, error: Error | null }> {
        return this.generateAndSave(
            `PRODUCT_DESC.${variant.toUpperCase()}`,
            inputs,
            'product_description',
            `Generated ${variant} product description`,
            clientId
        );
    }

    /**
     * Generates sales scripts.
     */
    async generateSalesScript(type: string, inputs: Record<string, unknown>, clientId?: string): Promise<{ content: string, assetId: string, error: Error | null }> {
        return this.generateAndSave(
            `SALES_SCRIPT.${type.toUpperCase()}`,
            inputs,
            'sales_script',
            `Generated ${type} sales script`,
            clientId
        );
    }

    /**
     * Generates email content.
     */
    async generateEmailContent(type: 'SUBJECT' | 'BODY', inputs: Record<string, unknown>, clientId?: string): Promise<{ content: string, assetId: string, error: Error | null }> {
        return this.generateAndSave(
            `EMAIL.${type}`,
            inputs,
            'email',
            `Generated ${type} email`,
            clientId
        );
    }

    /**
     * Generates a blog post outline.
     */
    async generateBlogOutline(inputs: Record<string, unknown>, clientId?: string): Promise<{ content: string, assetId: string, error: Error | null }> {
        return this.generateAndSave(
            'BLOG.OUTLINE',
            inputs,
            'document',
            `Blog Outline: ${inputs.topic}`,
            clientId
        );
    }

    /**
     * Generates a full blog post draft.
     */
    async generateBlogDraft(inputs: Record<string, unknown>, clientId?: string): Promise<{ content: string, assetId: string, error: Error | null }> {
        return this.generateAndSave(
            'BLOG.DRAFT',
            inputs,
            'document',
            `Blog Draft: ${inputs.topic}`,
            clientId
        );
    }
}

export const generatorService = new GeneratorService();
