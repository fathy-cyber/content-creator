import { promptRegistry } from './registry';

/**
 * PromptBuilder assembles the final prompt string by combining the template,
 * brand voice constraints, and active context.
 */
export class PromptBuilder {
    buildPrompt(
        promptKey: string, 
        inputs: Record<string, unknown>, 
        brandVoice?: any, 
        context?: any
    ): string {
        const definition = promptRegistry[promptKey];
        if (!definition) {
            throw new Error(`PromptKeyError: Prompt key '${promptKey}' not found in registry.`);
        }

        let assembledPrompt = '';

        // 1. Prepend Brand Voice Constraints
        if (brandVoice) {
            assembledPrompt += `=== BRAND VOICE CONSTRAINTS (MUST FOLLOW) ===\n`;
            assembledPrompt += `Tone: ${brandVoice.tone_descriptors?.join(', ') || 'Professional'}\n`;
            assembledPrompt += `Never use these words: ${brandVoice.forbidden_words?.join(', ') || 'None'}\n`;
            assembledPrompt += `Always emphasize: ${brandVoice.value_propositions?.join(' | ') || 'Core values'}\n`;
            assembledPrompt += `Target audience: ${brandVoice.target_audience || 'General'}\n`;
            assembledPrompt += `============================================\n\n`;
        }

        // 2. Prepend Active Context
        if (context) {
            assembledPrompt += `=== ACTIVE CONTEXT ===\n`;
            assembledPrompt += `Client: ${context.client?.name || 'Unknown'}\n`;
            assembledPrompt += `Industry: ${context.client?.industry || 'Unknown'}\n`;
            assembledPrompt += `Product/Service: ${context.product || 'Not specified'}\n`;
            assembledPrompt += `======================\n\n`;
        }

        // 3. The actual prompt template
        assembledPrompt += definition.template(inputs);

        return assembledPrompt;
    }
}

export const promptBuilder = new PromptBuilder();
