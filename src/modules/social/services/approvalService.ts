import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { eventBus } from '@/core/events/EventBus';
import { rateLimitService } from './rateLimitService';
import { PLATFORMS } from '../constants/platforms';

/**
 * Types for Approval Workflow
 */
export type PostStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'scheduled' | 'published' | 'archived';

export interface AiPost {
  id: string;
  campaign_id: string | null;
  platform: string;
  prompt_key: string;
  prompt_inputs: any;
  generated_content: string;
  hashtags: string[];
  media_urls: string[];
  status: PostStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  scheduled_for: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalEvent {
  id: string;
  ai_post_id: string;
  actor_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'escalated' | 'expired';
  comment: string | null;
  created_at: string;
}

export interface SaveDraftInput {
  topic: string;
  tone: string;
  audience: string;
  keyMessage: string;
  language: string;
  platform: string;
  content: string;
  campaignId?: string;
  mediaUrls?: string[];
}

const SaveDraftSchema = z.object({
  topic: z.string().min(1),
  tone: z.string(),
  audience: z.string(),
  keyMessage: z.string(),
  language: z.string(),
  platform: z.string(),
  content: z.string().min(1),
  campaignId: z.string().uuid().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export interface SubmitPostInput {
  topic: string;
  tone: string;
  audience: string;
  keyMessage: string;
  language: string;
  platform: string;
  campaignId?: string;
  mediaUrls?: string[];
}

const SubmitPostSchema = z.object({
  topic: z.string().min(1),
  tone: z.string(),
  audience: z.string(),
  keyMessage: z.string(),
  language: z.string(),
  platform: z.string(),
  campaignId: z.string().uuid().optional().nullable(),
  mediaUrls: z.array(z.string().url()).optional(),
});

/**
 * ApprovalService manages the lifecycle of AI generated posts from draft to scheduled.
 */
export const approvalService = {
  /**
   * Internal helper to map asset statuses to social post statuses.
   */
  mapAssetStatusToPostStatus(status: string): PostStatus {
    const map: Record<string, PostStatus> = {
      draft: 'draft',
      internal_review: 'in_review',
      client_review: 'in_review',
      approved: 'approved',
      published: 'published',
      archived: 'archived',
      rejected: 'rejected',
    };
    return map[status] || 'draft';
  },

  /**
   * Saves already generated content as a draft post.
   */
  async saveDraft(input: SaveDraftInput): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const validated = SaveDraftSchema.parse(input);
      
      const { data: post, error: postErr } = await supabase
        .from('ai_posts')
        .insert({
          platform: validated.platform,
          prompt_key: 'MANUAL_SAVE',
          prompt_inputs: { topic: validated.topic, tone: validated.tone, audience: validated.audience, keyMessage: validated.keyMessage, language: validated.language },
          generated_content: validated.content,
          hashtags: [],
          media_urls: validated.mediaUrls || [],
          status: 'draft',
          campaign_id: validated.campaignId,
          created_by: (await supabase.auth.getUser()).data.user?.id || null,
        })
        .select()
        .single();

      if (postErr) throw postErr;

      await eventBus.emit('social.post.draft.created' as any, post, { sourceModule: 'social', sourceEntityId: post.id });

      return { data: post, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Generates a post via AI and creates a draft record.
   */
  async createDraft(input: SubmitPostInput): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const validated = SubmitPostSchema.parse(input);
      
      // Call marketing-ai Edge Function
      const { data: aiData, error: aiErr } = await supabase.functions.invoke('marketing-ai', {
        body: { 
          promptKey: `POST.${validated.platform.toUpperCase()}`, 
          inputs: { 
            topic: validated.topic, 
            tone: validated.tone, 
            audience: validated.audience, 
            keyMessage: validated.keyMessage, 
            language: validated.language 
          } 
        },
      });

      if (aiErr || !aiData) throw new Error(aiErr?.message || "AI generation failed");

      const { data: post, error: postErr } = await supabase
        .from('ai_posts')
        .insert({
          platform: validated.platform,
          prompt_key: `POST.${validated.platform.toUpperCase()}`,
          prompt_inputs: { topic: validated.topic, tone: validated.tone, audience: validated.audience, keyMessage: validated.keyMessage, language: validated.language },
          generated_content: aiData.content,
          hashtags: [], // AI might return these, would need parsing
          media_urls: validated.mediaUrls || [],
          status: 'draft',
          campaign_id: validated.campaignId,
          created_by: (await supabase.auth.getUser()).data.user?.id || null,
        })
        .select()
        .single();

      if (postErr) throw postErr;

      await eventBus.emit('social.post.draft.created' as any, post, { sourceModule: 'social', sourceEntityId: post.id });

      return { data: post, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Submits a draft post for review.
   */
  async submitForReview(postId: string): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const { data: post, error: postErr } = await supabase
        .from('ai_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postErr || !post) throw new Error("Post not found");
      if (post.status !== 'draft') throw new Error("Only drafts can be submitted for review");

      const { data: updatedPost, error: updateErr } = await supabase
        .from('ai_posts')
        .update({ status: 'in_review' })
        .eq('id', postId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      const { data: { user } } = await supabase.auth.getUser();
      const actorId = user?.id || null;

      const { error: eventErr } = await supabase.from('approval_events').insert({
        ai_post_id: postId,
        actor_id: actorId,
        action: 'submitted',
      });

      if (eventErr) {
        console.error('Approval event insert failed:', eventErr);
        throw eventErr;
      }

      await eventBus.emit('social.post.submitted' as any, updatedPost, { sourceModule: 'social', sourceEntityId: postId });

      return { data: updatedPost, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Approves a post in review.
   */
  async approvePost(postId: string, approverId: string): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const { data: post, error: postErr } = await supabase
        .from('ai_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postErr || !post) throw new Error("Post not found");
      if (post.status !== 'in_review') throw new Error("Post is not currently in review");

      const { data: updatedPost, error: updateErr } = await supabase
        .from('ai_posts')
        .update({ 
          status: 'approved', 
          approved_by: approverId, 
          approved_at: new Date().toISOString() 
        })
        .eq('id', postId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('approval_events').insert({
        ai_post_id: postId,
        actor_id: approverId,
        action: 'approved',
      });

      await eventBus.emit('social.post.approved' as any, updatedPost, { 
        sourceModule: 'social', 
        sourceEntityId: postId,
      });

      return { data: updatedPost, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Rejects a post in review.
   */
  async rejectPost(postId: string, actorId: string, reason: string): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const { data: post, error: postErr } = await supabase
        .from('ai_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postErr || !post) throw new Error("Post not found");
      if (post.status !== 'in_review') throw new Error("Post is not currently in review");

      const { data: updatedPost, error: updateErr } = await supabase
        .from('ai_posts')
        .update({ 
          status: 'rejected', 
          rejection_reason: reason 
        })
        .eq('id', postId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('approval_events').insert({
        ai_post_id: postId,
        actor_id: actorId,
        action: 'rejected',
        comment: reason,
      });

      await eventBus.emit('social.post.rejected' as any, updatedPost, { 
        sourceModule: 'social', 
        sourceEntityId: postId,
      });

      return { data: updatedPost, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Escalates a post that has been in review too long.
   */
  async escalatePost(postId: string): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const { data: updatedPost, error: updateErr } = await supabase
        .from('ai_posts')
        .update({ status: 'in_review' }) // Remains in review but marked via event
        .eq('id', postId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('approval_events').insert({
        ai_post_id: postId,
        actor_id: null,
        action: 'escalated',
      });

      await eventBus.emit('social.post.approval.expired' as any, updatedPost, { sourceModule: 'social', sourceEntityId: postId });

      return { data: updatedPost, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Schedules an approved post for publishing.
   */
  async schedulePost(postId: string, scheduledFor: Date, socialAccountId: string): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const { data: post, error: postErr } = await supabase
        .from('ai_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postErr || !post) throw new Error("Post not found");
      if (post.status !== 'approved') throw new Error("Only approved posts can be scheduled");
      if (scheduledFor <= new Date()) throw new Error("Scheduled date must be in the future");

      // Rate limit check
      const { data: limitCheck } = await rateLimitService.checkRateLimit(socialAccountId, post.platform);
      if (!limitCheck?.allowed) throw new Error("Rate limit exceeded for this account. Please schedule for later.");

      const { data: updatedPost, error: updateErr } = await supabase
        .from('ai_posts')
        .update({ 
          status: 'scheduled', 
          scheduled_for: scheduledFor.toISOString() 
        })
        .eq('id', postId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Create publish job via publisherService (implemented next)
      // Note: In a real setup, we import publisherService here
      // For now, we'll handle it in a unified index or via internal call
      
      await eventBus.emit('social.post.scheduled' as any, updatedPost, { 
        sourceModule: 'social', 
        sourceEntityId: postId,
      });

      return { data: updatedPost, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  /**
   * Synchronizes all assets of type 'post' from the core assets table to the social ai_posts table.
   * This ensures no posts are missed during migration or event failures.
   */
  async syncAssetsToPosts(): Promise<{ syncedCount: number, errors: any[] }> {
    try {
      const { data: assets, error: assetsErr } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'post');

      if (assetsErr) throw assetsErr;
      if (!assets || assets.length === 0) return { syncedCount: 0, errors: [] };

      const assetIds = assets.map(a => a.id);
      const { data: versions, error: versionsErr } = await supabase
        .from('asset_versions')
        .select('asset_id, content, version_number')
        .in('asset_id', assetIds)
        .order('version_number', { ascending: false });

      if (versionsErr) throw versionsErr;

      const latestVersionMap: Record<string, string> = {};
      if (versions) {
        for (const v of versions) {
          if (!latestVersionMap[v.asset_id]) {
            latestVersionMap[v.asset_id] = v.content;
          }
        }
      }

      const errors: any[] = [];
      let syncedCount = 0;

      for (const asset of assets) {
        try {
          const content = latestVersionMap[asset.id] || '';

          const platformMap: Record<string, string> = {
            'linkedin': 'linkedin', 'facebook': 'facebook', 'instagram': 'instagram',
            'twitter': 'x', 'tiktok': 'tiktok', 'youtube': 'youtube',
          };
          const platform = platformMap[asset.platform?.toLowerCase()] || 'facebook';

          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id || asset.created_by;

          const { error: upsertErr } = await supabase.from('ai_posts').upsert({
            id: asset.id,
            platform: platform,
            prompt_key: 'ASSET_SYNC',
            prompt_inputs: { title: asset.title },
            generated_content: content,
            status: this.mapAssetStatusToPostStatus(asset.status),
            campaign_id: null,
            created_by: userId,
          });

          if (upsertErr) throw upsertErr;
          syncedCount++;
        } catch (e: any) {
          errors.push({ assetId: asset.id, error: e.message });
        }
      }

      return { syncedCount, errors };
    } catch (e: any) {
      return { syncedCount: 0, errors: [e] };
    }
  },

  /**
   * Lists posts with pagination and filtering.
   */
  async listPosts(filters: { 
    status?: string; 
    platform?: string; 
    campaignId?: string; 
    createdBy?: string; 
    startDate?: string; 
    endDate?: string; 
    limit?: number; 
    offset?: number; 
  } = {}): Promise<{ data: AiPost[] | null, error: Error | null }> {
    try {
      let query = supabase
        .from('ai_posts')
        .select('*');

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.platform) query = query.eq('platform', filters.platform);
      if (filters.campaignId) query = query.eq('campaign_id', filters.campaignId);
      if (filters.createdBy) query = query.eq('created_by', filters.createdBy);
      if (filters.startDate) query = query.gte('created_at', filters.startDate);
      if (filters.endDate) query = query.lte('created_at', filters.endDate);

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
   * Gets a single post by ID.
   */
  async getPost(id: string): Promise<{ data: AiPost | null, error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('ai_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },
};
