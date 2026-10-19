import { BrandVoice } from './types';
import { brandVoiceService } from './BrandVoiceService';
import { serviceRegistry } from '../registry/ServiceRegistry';

/**
 * BrandVoiceInjector handles caching and injecting brand voice constraints 
 * into AI prompts.
 */
export class BrandVoiceInjector {
    private cache = new Map<string, { voice: BrandVoice, expiresAt: number }>();
    private readonly TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Injects brand voice constraints into a prompt string using a specific brand voice ID.
     */
    async inject(promptString: string, brandVoiceId: string): Promise<string> {
        const voice = await this.getCachedOrFetch(brandVoiceId);
        if (!voice) return promptString;

        const constraints = `=== BRAND INTELLIGENCE PROFILE (MUST FOLLOW) ===\n` +
            `Tone: ${voice.tone_descriptors.join(', ') || 'Professional'}\n` +
            `Positioning: ${voice.positioning_statement || 'Standard'}\n` +
            `Value Props: ${voice.value_propositions.join(' | ') || 'Core values'}\n` +
            `Competitive Edge: ${voice.competitive_differentiators.join(' | ') || 'None'}\n` +
            `Approved Phrases: ${voice.approved_phrases.join(', ') || 'None'}\n` +
            `Forbidden Words: ${voice.forbidden_words.join(', ') || 'None'}\n` +
            `Legal Constraints: ${voice.legal_constraints.join(', ') || 'None'}\n` +
            `Target audience: ${voice.target_audience || 'General'}\n` +
            `============================================\n\n`;

        return constraints + promptString;
    }

    /**
     * Injects the appropriate brand voice for a client.
     */
    async injectForClient(promptString: string, clientId: string, workspaceId: string): Promise<string> {
        const { data: voice, error } = await brandVoiceService.getBrandVoiceForClient(clientId, workspaceId);
        if (error || !voice) return promptString;

        return this.inject(promptString, voice.id);
    }

    private async getCachedOrFetch(id: string): Promise<BrandVoice | null> {
        const cached = this.cache.get(id);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.voice;
        }

        const { data, error } = await brandVoiceService.getBrandVoice(id);
        if (error || !data) return null;

        this.cache.set(id, {
            voice: data,
            expiresAt: Date.now() + this.TTL,
        });

        return data;
    }

    /**
     * Invalidates a specific brand voice from the cache.
     */
    invalidateCache(id: string): void {
        this.cache.delete(id);
    }
}

export const brandVoiceInjector = new BrandVoiceInjector();
serviceRegistry.registerService('brandVoiceInjector', brandVoiceInjector);
