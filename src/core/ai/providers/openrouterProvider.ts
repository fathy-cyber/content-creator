import { AIProviderInstance } from '../types';
import { supabase } from '@/lib/supabase';

/**
 * OpenRouterProvider handles interaction with various models via OpenRouter.
 */
export class OpenRouterProvider implements AIProviderInstance {
    private readonly defaultModel = 'google/gemini-flash-1.5';
    private readonly complexModel = 'anthropic/claude-3-haiku';

    async generate(prompt: string, temperature: number, maxTokens?: number): Promise<string> {
        let attempts = 0;
        const maxRetries = 3;

        while (attempts <= maxRetries) {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                const invokePromise = supabase.functions.invoke('ai-gateway', {
                    body: {
                        provider: 'openrouter',
                        prompt,
                        temperature,
                        maxTokens,
                    },
                });

                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('AI request timed out after 20s')), 20000);
                });

                const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any;

                if (error) {
                    throw new Error(error.message || `OpenRouter API error: ${error.status}`);
                }

                return data.content;

            } catch (error: any) {
                if (error.message?.includes('timed out')) throw error;
                attempts++;
                if (attempts > maxRetries) throw error;
                
                const delay = Math.pow(2, attempts - 1) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('OpenRouter generation failed after maximum retries');
    }

    private determineModel(prompt: string): string {
        // Simple heuristic: longer prompts or specific keywords suggest complex tasks
        if (prompt.length > 2000 || prompt.includes('ANALYSIS') || prompt.includes('STRATEGY')) {
            return this.complexModel;
        }
        return this.defaultModel;
    }
}

export const openrouterProvider = new OpenRouterProvider();
