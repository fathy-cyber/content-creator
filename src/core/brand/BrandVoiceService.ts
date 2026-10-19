import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { 
    BrandVoice, 
    CreateBrandVoiceInput, 
    UpdateBrandVoiceInput, 
    BrandVoiceExtractionResult 
} from './types';
import { serviceRegistry } from '../registry/ServiceRegistry';

const BrandVoiceSchema = z.object({
    workspace_id: z.string().uuid(),
    client_id: z.string().uuid().optional(),
    name: z.string().min(1),
    tone_descriptors: z.array(z.string()).default([]),
    forbidden_words: z.array(z.string()).default([]),
    value_propositions: z.array(z.string()).default([]),
    positioning_statement: z.string().optional(),
    approved_phrases: z.array(z.string()).default([]),
    legal_constraints: z.array(z.string()).default([]),
    competitive_differentiators: z.array(z.string()).default([]),
    example_copy: z.string().optional(),
    target_audience: z.string().optional(),
    is_default: z.boolean().default(false),
});

export class BrandVoiceService {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    /**
     * Creates a new brand voice.
     */
    async createBrandVoice(input: CreateBrandVoiceInput): Promise<{ data: BrandVoice | null, error: Error | null }> {
        try {
            const validated = BrandVoiceSchema.parse(input);
            const { data, error } = await this.supabase
                .from('brand_voices')
                .insert(validated)
                .select()
                .single();

            if (error) throw error;

            // Log to audit and emit event (mocked)
            // auditLogger.log('brand.voice.created', 'brand_voice', data.id, null, data);
            // eventBus.emit('brand.voice.created', { brandVoiceId: data.id, clientId: data.client_id }, 'core');

            return { data, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Retrieves a brand voice by ID.
     */
    async getBrandVoice(id: string): Promise<{ data: BrandVoice | null, error: Error | null }> {
        const { data, error } = await this.supabase
            .from('brand_voices')
            .select('*')
            .eq('id', id)
            .single();

        return { data, error: error ? new Error(error.message) : null };
    }

    /**
     * Retrieves the brand voice for a client, falling back to workspace default.
     */
    async getBrandVoiceForClient(clientId: string, workspaceId: string): Promise<{ data: BrandVoice | null, error: Error | null }> {
        // 1. Try client-specific voice
        const { data: clientVoice, error: clientError } = await this.supabase
            .from('brand_voices')
            .select('*')
            .eq('client_id', clientId)
            .eq('is_default', true)
            .single();

        if (clientVoice) return { data: clientVoice, error: null };

        // 2. Try workspace default
        const { data: workspaceVoice, error: workspaceError } = await this.supabase
            .from('brand_voices')
            .select('*')
            .eq('workspace_id', workspaceId)
            .eq('is_default', true)
            .is('client_id', null)
            .single();

        return { data: workspaceVoice, error: workspaceError ? new Error(workspaceError.message) : null };
    }

    /**
     * Lists brand voices with optional client filter.
     */
    async listBrandVoices(clientId?: string, workspaceId?: string): Promise<{ data: BrandVoice[], error: Error | null }> {
        let query = this.supabase.from('brand_voices').select('*');
        if (workspaceId) query = query.eq('workspace_id', workspaceId);
        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query;
        return { data: data || [], error: error ? new Error(error.message) : null };
    }

    /**
     * Updates an existing brand voice.
     */
    async updateBrandVoice(id: string, changes: UpdateBrandVoiceInput): Promise<{ data: BrandVoice | null, error: Error | null }> {
        try {
            const { data, error } = await this.supabase
                .from('brand_voices')
                .update(changes)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Log and invalidate cache (mocked)
            // auditLogger.log('brand.voice.updated', 'brand_voice', id, null, changes);
            // brandVoiceInjector.invalidateCache(id);

            return { data, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Deletes a brand voice. Prevents deletion of workspace default.
     */
    async deleteBrandVoice(id: string): Promise<{ data: null, error: Error | null }> {
        const { data: voice, error: fetchError } = await this.getBrandVoice(id);
        if (fetchError || !voice) return { data: null, error: fetchError || new Error('Voice not found') };

        if (voice.is_default && !voice.client_id) {
            return { data: null, error: new Error('Cannot delete the workspace default brand voice.') };
        }

        const { error } = await this.supabase.from('brand_voices').delete().eq('id', id);
        return { data: null, error: error ? new Error(error.message) : null };
    }

    /**
     * Sets a brand voice as default for a client.
     */
    async setDefault(id: string, clientId?: string, workspaceId?: string): Promise<{ data: null, error: Error | null }> {
        try {
            // Reset all other defaults for this client/workspace
            const resetQuery = this.supabase.from('brand_voices').update({ is_default: false });
            if (clientId) {
                resetQuery.eq('client_id', clientId);
            } else if (workspaceId) {
                resetQuery.eq('workspace_id', workspaceId).is('client_id', null);
            } else {
                throw new Error('clientId or workspaceId is required to set default');
            }
            await resetQuery;

            // Set current as default
            const { error } = await this.supabase.from('brand_voices').update({ is_default: true }).eq('id', id);
            if (error) throw error;

            return { data: null, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Extracts brand voice from provided copies using AI.
     */
    async extractBrandVoiceFromCopy(exampleCopy: string[]): Promise<{ data: BrandVoiceExtractionResult | null, error: Error | null }> {
        try {
            const ai = serviceRegistry.getService<any>('ai');
            const response = await ai.generate({
                promptKey: 'BRAND_VOICE.EXTRACT',
                inputs: { exampleCopy },
            });

            const result = JSON.parse(response.content) as BrandVoiceExtractionResult;
            return { data: result, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }
}

export const brandVoiceService = new BrandVoiceService();
serviceRegistry.registerService('brandVoice', brandVoiceService);
