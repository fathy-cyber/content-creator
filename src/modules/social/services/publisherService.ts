import { supabase } from '@/lib/supabase';
import { z } from 'zod';

/**
 * Types for Publishing Jobs
 */
export type JobStatus = 'pending' | 'in_progress' | 'published' | 'failed' | 'retrying' | 'dead';

export interface PublishJob {
  id: string;
  ai_post_id: string;
  social_account_id: string;
  platform: string;
  status: JobStatus;
  idempotency_key: string;
  external_post_id: string | null;
  published_at: string | null;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  last_error: string | null;
  error_code: 'rate_limit' | 'auth' | 'platform' | 'network' | 'fatal' | null;
  n8n_execution_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePublishJobInput {
  ai_post_id: string;
  social_account_id: string;
  platform: string;
  scheduled_for: string;
}

const CreatePublishJobSchema = z.object({
  ai_post_id: z.string().uuid(),
  social_account_id: z.string().uuid(),
  platform: z.string(),
  scheduled_for: z.string().datetime(),
});

/**
 * PublisherService manages the actual dispatch of posts to n8n and tracks job status.
 */
export const publisherService = {
  /**
   * Creates a publish job with idempotency.
   */
  async createPublishJob(input: CreatePublishJobInput): Promise<{ data: PublishJob | null, error: Error | null }> {
    try {
      const validated = CreatePublishJobSchema.parse(input);
      
      const idempotencyKey = `${validated.ai_post_id}:${validated.social_account_id}:${validated.scheduled_for}`;

      // Upsert with idempotency key to prevent duplicates
      const { data, error } = await supabase
        .from('publish_jobs')
        .upsert({
          ai_post_id: validated.ai_post_id,
          social_account_id: validated.social_account_id,
          platform: validated.platform,
          idempotency_key: idempotencyKey,
          status: 'pending',
        }, { onConflict: 'idempotency_key' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Lists publish jobs with pagination and filtering.
   */
  async listPublishJobs(filters: { 
    status?: string; 
    platform?: string; 
    dateRange?: { start: string, end: string }; 
    limit?: number; 
    offset?: number; 
  } = {}): Promise<{ data: PublishJob[] | null, error: Error | null }> {
    try {
      let query = supabase
        .from('publish_jobs')
        .select('*');

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.platform) query = query.eq('platform', filters.platform);
      if (filters.dateRange) {
        query = query.gte('created_at', filters.dateRange.start).lte('created_at', filters.dateRange.end);
      }

      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      
      const { data, error } = await query.range(offset, offset + limit - 1);
      if (error) throw error;

      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Gets a single publish job by ID.
   */
  async getPublishJob(id: string): Promise<{ data: PublishJob | null, error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('publish_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Manually retries a failed job.
   */
  async retryJob(id: string): Promise<{ data: PublishJob | null, error: Error | null }> {
    try {
      const { data: job, error: jobErr } = await this.getPublishJob(id);
      if (jobErr || !job) throw new Error("Job not found");
      if (job.status !== 'failed') throw new Error("Only failed jobs can be retried");
      if (job.retry_count >= job.max_retries) throw new Error("Maximum retry attempts reached");

      const { data: updatedJob, error: updateErr } = await supabase
        .from('publish_jobs')
        .update({ 
          status: 'pending', 
          retry_count: job.retry_count + 1,
          next_retry_at: new Date(Date.now() + Math.pow(2, job.retry_count) * 60_000).toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Notify n8n to pick it up
      await this.notifyN8n(updatedJob.id);

      return { data: updatedJob, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Marks a job as dead (no more retries).
   */
  async markDead(id: string, reason: string): Promise<{ data: PublishJob | null, error: Error | null }> {
    try {
      const { data: updatedJob, error: updateErr } = await supabase
        .from('publish_jobs')
        .update({ 
          status: 'dead', 
          last_error: reason, 
          error_code: 'fatal' 
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return { data: updatedJob, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Triggers the n8n webhook to process the job.
   */
  async notifyN8n(publishJobId: string): Promise<{ data: void | null, error: Error | null }> {
    try {
      const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
      if (!N8N_WEBHOOK_URL) throw new Error("N8N_WEBHOOK_URL not configured");

      // We use a non-blocking fetch with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish_job_id: publishJobId }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return { data: undefined, error: null };
    } catch (e: any) {
      // We log but don't necessarily fail the service call since it's a notification
      console.error(`[PublisherService] n8n notification failed: ${e.message}`);
      return { data: null, error: e };
    }
  },
};
