/**
 * AI Gateway Types
 */

export type AIProvider = 'gemini' | 'openrouter' | 'groq';

export interface AIRequest {
    promptKey: string;
    inputs: Record<string, unknown>;
    brandVoiceId?: string;
    clientId?: string;
    temperature?: number;
    maxTokens?: number;
    provider?: AIProvider;
}

export interface AIResponse {
    content: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
    };
    latencyMs: number;
    provider: AIProvider;
    model: string;
}

export type PromptTemplate = (inputs: Record<string, unknown>) => string;

export interface GeneratedContent {
    text: string;
    structuredData?: unknown;
}

export interface AIProviderInstance {
    generate(prompt: string, temperature: number, maxTokens?: number): Promise<string>;
}
