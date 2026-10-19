import { APIResponse } from './types';

export interface APIManagerOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export class APIManager {
  private static instance: APIManager;

  private constructor() {}

  public static getInstance(): APIManager {
    if (!APIManager.instance) {
      APIManager.instance = new APIManager();
    }
    return APIManager.instance;
  }

  /**
   * Performs an HTTP request with retry logic and logging.
   */
  async request<T = any>(
    url: string,
    options: APIManagerOptions = {},
    retries = 3,
    backoff = 1000
  ): Promise<APIResponse<T>> {
    const { params, ...fetchOptions } = options;
    const startTime = Date.now();
    let attempt = 0;

    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, String(value));
      }
      const separator = url.includes('?') ? '&' : '?';
      finalUrl += `${separator}${searchParams.toString()}`;
    }

    while (attempt <= retries) {
      try {
        console.log(`[APIManager] Request to ${finalUrl} (Attempt ${attempt + 1})`);
        
        const response = await fetch(finalUrl, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        if (!response.ok) {
          // Handle rate limiting (429) or server errors (5xx) with retries
          if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // For other errors (4xx), don't retry
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;
        
        console.log(`[APIManager] Success: ${finalUrl} (${duration}ms)`);
        
        return {
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        };

      } catch (error: any) {
        attempt++;
        if (attempt > retries) {
          console.error(`[APIManager] Failed after ${retries + 1} attempts: ${finalUrl}. Error: ${error.message}`);
          throw error;
        }

        const delay = backoff * Math.pow(2, attempt - 1);
        console.warn(`[APIManager] Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unexpected failure in APIManager');
  }

  async get<T = any>(url: string, options: APIManagerOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, body: any, options: APIManagerOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>(url, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(body) 
    });
  }

  async put<T = any>(url: string, body: any, options: APIManagerOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>(url, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(body) 
    });
  }

  async delete<T = any>(url: string, options: APIManagerOptions = {}): Promise<APIResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const apiManager = APIManager.getInstance();
