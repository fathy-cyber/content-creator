import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RequestSchema = z.object({
  publish_job_id: z.string().uuid(),
});

async function getSecret(vaultId: string) {
  const { data, error } = await supabase.rpc('get_vault_secret', { secret_id: vaultId });
  if (error) throw new Error(`Vault retrieval failed: ${error.message}`);
  return data;
}

async function fetchLinkedInAnalytics(postId: string, token: string) {
  const response = await fetch(`https://api.linkedin.com/v2/organizationalEntityShareStatistics?urn=${postId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`LinkedIn analytics failed: ${await response.text()}`);
  const data = await response.json();
  return {
    impressions: data.totalShareStatistics?.impressionCount || 0,
    clicks: data.totalShareStatistics?.clickCount || 0,
    likes: 0, // Simplified
    comments: 0,
    shares: 0,
    reach: 0,
    raw: data,
  };
}

async function fetchFacebookAnalytics(postId: string, token: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${postId}/insights?metric=post_impressions,post_engagements,post_reactions_by_type_total`, {
    params: { access_token: token },
  });
  if (!response.ok) throw new Error(`Facebook analytics failed: ${await response.text()}`);
  const data = await response.json();
  
  const metrics = data.data || [];
  const getMetric = (name: string) => metrics.find((m: any) => m.name === name)?.values[0]?.value || 0;

  return {
    impressions: getMetric('post_impressions'),
    reach: getMetric('post_impressions'), // approximation
    likes: getMetric('post_reactions_by_type_total'),
    comments: 0,
    shares: 0,
    clicks: getMetric('post_engagements'),
    raw: data,
  };
}

async function fetchInstagramAnalytics(postId: string, token: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${postId}/insights?metric=impressions,reach,engagement`, {
    params: { access_token: token },
  });
  if (!response.ok) throw new Error(`Instagram analytics failed: ${await response.text()}`);
  const data = await response.json();
  
  const metrics = data.data || [];
  const getMetric = (name: string) => metrics.find((m: any) => m.name === name)?.values[0]?.value || 0;

  return {
    impressions: getMetric('impressions'),
    reach: getMetric('reach'),
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: getMetric('engagement'),
    raw: data,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const { publish_job_id } = RequestSchema.parse(body);

    const { data: job, error: jobErr } = await supabase
      .from('publish_jobs')
      .select('*, social_accounts(*)')
      .eq('id', publish_job_id)
      .single();

    if (jobErr || !job) throw new Error("Publish job not found");
    const account = job.social_accounts;
    if (!account) throw new Error("Associated social account not found");

    let token = await getSecret(account.vault_access_id);
    let analytics;

    try {
      if (job.platform === 'linkedin') {
        analytics = await fetchLinkedInAnalytics(job.external_post_id, token);
      } else if (job.platform === 'facebook') {
        analytics = await fetchFacebookAnalytics(job.external_post_id, token);
      } else if (job.platform === 'instagram') {
        analytics = await fetchInstagramAnalytics(job.external_post_id, token);
      } else {
        throw new Error(`Analytics not implemented for platform ${job.platform}`);
      }
    } catch (e: any) {
      if (e.message.includes('401') || e.message.includes('auth')) {
        // Trigger token refresh and retry once
        const { data: refreshRes } = await supabase.functions.invoke('token-refresh', {
          body: { social_account_id: account.id },
        });
        
        if (refreshRes?.error) throw new Error(`Token refresh failed: ${refreshRes.error}`);
        
        token = await getSecret(account.vault_access_id);
        // Retry fetch
        if (job.platform === 'linkedin') analytics = await fetchLinkedInAnalytics(job.external_post_id, token);
        else if (job.platform === 'facebook') analytics = await fetchFacebookAnalytics(job.external_post_id, token);
        else if (job.platform === 'instagram') analytics = await fetchInstagramAnalytics(job.external_post_id, token);
      } else {
        throw e;
      }
    }

    const engagementRate = analytics.reach > 0 
      ? ((analytics.likes + analytics.comments + analytics.shares + analytics.clicks) / analytics.reach) * 100 
      : 0;

    const { error: insertErr } = await supabase.from('post_analytics').insert({
      publish_job_id,
      impressions: analytics.impressions,
      reach: analytics.reach,
      likes: analytics.likes,
      comments: analytics.comments,
      shares: analytics.shares,
      clicks: analytics.clicks,
      engagement_rate: engagementRate,
      raw_data: analytics.raw,
    });

    if (insertErr) throw insertErr;

    // Emit event
    await supabase.from('event_store').insert({
      event_name: 'social.analytics.fetched',
      source_module: 'social',
      source_entity_id: publish_job_id,
      payload: { publish_job_id, engagement_rate: engagementRate },
      status: 'pending',
      process_after: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, engagement_rate: engagementRate }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
