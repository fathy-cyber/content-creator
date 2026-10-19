import { AIProviderInstance } from '../types';
import { supabase } from '@/lib/supabase';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const PROXY_PATH = '/groq/openai/v1/chat/completions';

function systemMessage(): string {
  return 'You are a professional copywriter. Output ONLY the final raw text response. Do not include any thinking, brainstorming, outlines, preamble, or introductions. Start immediately with the result.';
}

async function proxyFetch(prompt: string, temperature: number, maxTokens: number | undefined, signal: AbortSignal): Promise<string> {
  const response = await fetch(PROXY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemMessage() },
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens ?? 1024,
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq proxy error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content;
  if (!result) throw new Error('Groq returned empty response');
  return result.trim();
}

function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => { clearTimeout(id); },
  };
}

/**
 * GroqProvider handles interaction with Groq API.
 * Optimized for speed and high throughput.
 */
export class GroqProvider implements AIProviderInstance {
  private readonly defaultModel = DEFAULT_MODEL;

  async generate(prompt: string, temperature: number, maxTokens?: number): Promise<string> {
    try {
      const result = await this.callViaProxy(prompt, temperature, maxTokens);
      return result;
    } catch (error: any) {
      console.error('[GroqProvider] Proxy attempt failed:', error.message);
      try {
        return await this.callViaEdgeFunction(prompt, temperature, maxTokens);
      } catch (edgeError: any) {
        console.error('[GroqProvider] Edge fallback failed:', edgeError.message);
        throw edgeError;
      }
    }
  }

  private async callViaProxy(prompt: string, temperature: number, maxTokens?: number): Promise<string> {
    const { signal, clear } = timeoutSignal(20000);
    try {
      return await proxyFetch(prompt, temperature, maxTokens, signal);
    } finally {
      clear();
    }
  }

  private async callViaEdgeFunction(prompt: string, temperature: number, maxTokens?: number): Promise<string> {
    let attempts = 0;
    const maxRetries = 1;

    while (attempts <= maxRetries) {
      try {
        await supabase.auth.getSession();

        const { signal, clear } = timeoutSignal(10000);
        try {
          const { data, error } = await supabase.functions.invoke('ai-gateway', {
            body: { provider: 'groq', prompt, temperature, maxTokens, model: this.defaultModel },
          }) as any;

          if (error) throw new Error(error.message || `Groq edge function error: ${error.status}`);
          return data.content;
        } finally {
          clear();
        }
      } catch (error: any) {
        if (error.message?.includes('timed out') || error.message?.includes('Failed to fetch') || error.message?.includes('HTTP error')) {
          throw error;
        }
        attempts++;
        if (attempts > maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Groq generation failed via edge function');
  }
}

export const groqProvider = new GroqProvider();
