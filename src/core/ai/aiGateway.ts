import { AIRequest, AIResponse } from './types';
import { promptBuilder } from './prompts/builder';
import { geminiProvider } from './providers/geminiProvider';
import { openrouterProvider } from './providers/openrouterProvider';
import { groqProvider } from './providers/groqProvider';
import { serviceRegistry } from '../registry/ServiceRegistry';

/**
 * AIGateway is the single entry point for all AI calls in the system.
 * It handles brand voice injection, context enrichment, and provider selection.
 */
export class AIGateway {
    async generate(request: AIRequest): Promise<AIResponse> {
        // 1. Brand Voice Injection (Mocked until BrandVoiceInjector is implemented in 1D)
        const brandVoice = null; 
        
        // 2. Context Bridge Enrichment (Mocked until ContextBridge is implemented in 1F)
        const context = null; 

        // 3. Build final prompt
        const prompt = promptBuilder.buildPrompt(
            request.promptKey, 
            request.inputs, 
            brandVoice, 
            context
        );

        // 4. Select provider
        const providerKey = request.provider || this.selectProvider(request.promptKey);
        const provider = providerKey === 'openrouter' ? openrouterProvider : providerKey === 'groq' ? groqProvider : geminiProvider;

        const startTime = Date.now();
        try {
            const content = await provider.generate(
                prompt, 
                request.temperature ?? 0.7, 
                request.maxTokens
            );
            const latencyMs = Date.now() - startTime;

            // Clean up response: if it's a JSON string containing 'post' or 'content', unwrap it
            let finalContent = content;
            try {
                const parsed = JSON.parse(content);
                if (parsed && typeof parsed === 'object') {
                    finalContent = parsed.post || parsed.content || parsed.text || parsed.response || content;
                }
            } catch (e) {
                // Not JSON, keep as is
            }

            return {
                content: typeof finalContent === 'string' ? finalContent : JSON.stringify(finalContent),
                usage: { inputTokens: 0, outputTokens: 0 }, // Usage tracking requires provider support
                latencyMs,
                provider: providerKey,
                model: providerKey === 'gemini' ? 'gemini-1.5-flash' : providerKey === 'groq' ? 'llama-3.3-70b-versatile' : 'openrouter-selected',
            };
        } catch (error: any) {
            throw new Error(`AIGatewayError: ${error.message}`);
        }
    }

    private selectProvider(_promptKey: string): 'groq' {
        return 'groq';
    }
}

export const aiGateway = new AIGateway();

// Register with ServiceRegistry
serviceRegistry.registerService('ai', aiGateway);
