import { AIProviderInstance } from '../types';
import { supabase } from '@/lib/supabase';

/**
 * GeminiProvider handles interaction with Google Gemini API.
 * Implements rate limiting and retry logic.
 */
export class GeminiProvider implements AIProviderInstance {
    private readonly model = 'gemini-1.5-flash';
    private readonly rateLimitWindowMs = 60000; // 1 minute
    private readonly maxRequestsPerWindow = 15; // Free tier 15 RPM
    private requestTimestamps: number[] = [];

    /**
     * Generates content using Gemini API via an internal fetch to a Supabase Edge Function
     * to keep API keys secure on the server.
     */
    async generate(prompt: string, temperature: number, maxTokens?: number): Promise<string> {
        await this.handleRateLimit();

        let attempts = 0;
        const maxRetries = 3;

        while (attempts <= maxRetries) {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                const invokePromise = supabase.functions.invoke('ai-gateway', {
                    body: {
                        provider: 'gemini',
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
                    throw new Error(error.message || `Gemini API error: ${error.status}`);
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
        throw new Error('Gemini generation failed after maximum retries');
    }

    private async handleRateLimit(): Promise<void> {
        const now = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(
            ts => now - ts < this.rateLimitWindowMs
        );

        if (this.requestTimestamps.length >= this.maxRequestsPerWindow) {
            const oldestTs = this.requestTimestamps[0];
            const waitTime = this.rateLimitWindowMs - (now - oldestTs);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.handleRateLimit(); // Re-check after waiting
        }

        this.requestTimestamps.push(now);
    }
}

export const geminiProvider = new GeminiProvider();
