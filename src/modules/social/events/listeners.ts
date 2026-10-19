import { eventBus } from '@/core/events/EventBus';
import { approvalService } from '../services/approvalService';
import { analyticsService } from '../services/analyticsService';
import { publisherService } from '../services/publisherService';
import { supabase, supabaseService } from '@/lib/supabase';

const db = supabaseService ?? supabase;

/**
 * Mapping from AssetManager status to Social Module status
 */
const STATUS_MAP: Record<string, string> = {
    draft: 'draft',
    internal_review: 'in_review',
    client_review: 'in_review',
    approved: 'approved',
    published: 'published',
    scheduled: 'scheduled',
    archived: 'archived',
    rejected: 'rejected',
};

/**
 * Initializes all social module event listeners.
 * This should be called once during app startup.
 */
export async function initSocialListeners() {
  
  // Helper: register a handler on the event bus
  const register = (eventName: string, handler: any) => {
    try { eventBus.on(eventName as any, handler); } catch (e) { console.error('Failed to register on event bus', e); }
  };

  // Listener: Sync newly created assets to ai_posts
  register('asset.created', async (payload: any) => {
    console.log('[SocialListeners] Received asset.created event:', payload);
    try {
      const { asset } = payload;
      if (!asset) {
        console.error('[SocialListeners] No asset found in payload');
        return;
      }

      if (asset.type === 'post') {
        console.log(`[SocialListeners] Syncing post asset ${asset.id} to ai_posts...`);
        
        // Fetch the current user to avoid foreign key violations on created_by
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) console.error('[SocialListeners] Auth getUser error:', authError);
        
        const userId = user?.id || asset.created_by;

        console.log(`[SocialListeners] Syncing with userId: ${userId}`);

        if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
            console.warn(`[SocialListeners] No valid user ID found for asset ${asset.id}, skipping sync.`);
            return;
        }

        // Fetch the initial version content
        console.log(`[SocialListeners] Fetching version content for ${asset.id}...`);
        const { data: version, error: versionError } = await supabase
            .from('asset_versions')
            .select('content')
            .eq('asset_id', asset.id)
            .order('version_number', { ascending: true })
            .limit(1)
            .single();

        if (versionError) console.error('[SocialListeners] Error fetching version:', versionError);

        // Map platform to enum values
        const platformMap: Record<string, string> = {
            'linkedin': 'linkedin',
            'facebook': 'facebook',
            'instagram': 'instagram',
            'twitter': 'x',
            'tiktok': 'tiktok',
            'youtube': 'youtube',
        };
        const platform = platformMap[asset.platform?.toLowerCase()] || 'facebook';

        console.log(`[SocialListeners] Checking if ai_post already exists for asset ${asset.id}...`);
        const { data: existingPost, error: existingError } = await db
          .from('ai_posts')
          .select('id,status')
          .eq('id', asset.id)
          .single();

        if (existingError && existingError.code !== 'PGRST116') {
          console.error('[SocialListeners] Error checking existing ai_post:', existingError);
        }

        const desiredStatus = STATUS_MAP[asset.status] || 'draft';

        if (existingPost) {
          if (existingPost.status === 'draft' && desiredStatus !== 'draft') {
            console.log(`[SocialListeners] Updating existing ai_post ${asset.id} status from draft to ${desiredStatus}`);
            await db.from('ai_posts').update({ status: desiredStatus }).eq('id', asset.id);
          } else {
            console.log(`[SocialListeners] ai_post already exists for asset ${asset.id}, skipping create.`);
          }
        } else {
          console.log(`[SocialListeners] Creating ai_post for asset ${asset.id} with platform ${platform}...`);
          const { error: insertError } = await db.from('ai_posts').insert({
            id: asset.id,
            platform: platform,
            prompt_key: 'ASSET_SYNC',
            prompt_inputs: { title: asset.title },
            generated_content: version?.content || '',
            status: 'draft',
            campaign_id: null,
            created_by: userId,
          });

          if (insertError) {
            console.error('[SocialListeners] Insert failed:', insertError);
          } else {
            console.log(`[SocialListeners] Successfully created ai_post for asset ${asset.id}`);
          }
        }
      } else {
        console.log(`[SocialListeners] Skipping asset ${asset.id} as it is not a post (type: ${asset.type})`);
      }
    } catch (error) {
      console.error('[SocialListeners] Unexpected error in asset.created listener:', error);
    }
  });

  // Initialize synchronization for existing assets
  try {
    console.log('[SocialListeners] Starting initial sync of assets to ai_posts...');
    const { syncedCount, errors } = await approvalService.syncAssetsToPosts();
    console.log(`[SocialListeners] Initial sync complete. Synced ${syncedCount} posts. Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.error('[SocialListeners] Sync errors:', errors);
    }
  } catch (e) {
    console.error('[SocialListeners] Critical failure during initial sync:', e);
  }

  // Listener: Sync asset status changes to ai_posts


  // Listener: Sync asset status changes to ai_posts

  // Listener: Sync asset status changes to ai_posts
  register('asset.status.changed', async (payload: any) => {
    try {
      const { assetId, to } = payload;
      const newStatus = STATUS_MAP[to];
      if (newStatus) {
        console.log(`[SocialListeners] Updating ai_post ${assetId} status to ${newStatus}...`);
        await db.from('ai_posts').update({ status: newStatus }).eq('id', assetId);
      }
    } catch (error) {
      console.error('[SocialListeners] Failed to sync asset status change to ai_posts:', error);
    }
  });

  // Listener: Handle published assets from marketing module
  eventBus.on('marketing.asset.published' as any, async (payload: any) => {
    try {
      // If the asset is a post and has a target platform, auto-create a draft in social module
      if (payload.type === 'post' && payload.platform) {
        await approvalService.createDraft({
          topic: payload.title || 'Imported from Asset',
          tone: payload.tone || 'Professional',
          audience: payload.target_audience || 'General',
          keyMessage: payload.content,
          language: payload.language || 'English',
          platform: payload.platform,
          campaignId: payload.campaign_id,
          mediaUrls: payload.media_urls,
        });
      }
    } catch (error) {
      console.error('[SocialListeners] Failed to create draft from published asset:', error);
    }
  });

  // Listener: Handle ended campaigns to fetch final analytics
  eventBus.on('marketing.campaign.ended' as any, async (payload: any) => {
    try {
      const { campaign_id } = payload;
      
      // Find all published posts linked to this campaign
      const { data: posts } = await approvalService.listPosts({ 
        campaignId: campaign_id, 
        status: 'published' 
      });

      if (!posts) return;

      // For each published post, trigger a final analytics fetch
      for (const post of posts) {
        // We need the publish_job_id associated with this post
        const { data: jobs } = await publisherService.listPublishJobs({ 
          platform: post.platform 
          // In a real query we'd filter by ai_post_id
        });

        const job = jobs?.find(j => j.ai_post_id === post.id);
        if (job) {
          await analyticsService.triggerAnalyticsFetch(job.id);
        }
      }
    } catch (error) {
      console.error('[SocialListeners] Failed to fetch analytics for ended campaign:', error);
    }
  });
}
