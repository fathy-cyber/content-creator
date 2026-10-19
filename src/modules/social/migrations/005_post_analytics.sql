-- Phase 1: 005_post_analytics.sql
-- Tracking platform performance and rate limits

CREATE TABLE platform_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  posts_sent INT DEFAULT 0,
  posts_limit INT NOT NULL,
  api_calls_made INT DEFAULT 0,
  api_calls_limit INT NOT NULL
);

CREATE TABLE post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_job_id UUID NOT NULL REFERENCES publish_jobs(id) ON DELETE CASCADE,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  impressions INT DEFAULT 0,
  reach INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  clicks INT DEFAULT 0,
  engagement_rate NUMERIC(5,2),
  raw_data JSONB
);

-- RLS Setup
ALTER TABLE platform_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their analytics
CREATE POLICY "Allow authenticated users to view platform rate limits" 
ON platform_rate_limits FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view post analytics" 
ON post_analytics FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Write operations restricted to service_role (n8n/Edge Functions)
-- No INSERT/UPDATE policies provided for authenticated users.

-- Indexes
CREATE INDEX idx_platform_rate_limits_account_window ON platform_rate_limits(social_account_id, window_start);
CREATE INDEX idx_post_analytics_job_id ON post_analytics(publish_job_id);
CREATE INDEX idx_post_analytics_fetched_at ON post_analytics(fetched_at);

/*
-- DOWN Migration
DROP TABLE IF EXISTS post_analytics;
DROP TABLE IF EXISTS platform_rate_limits;
*/
