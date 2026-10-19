-- Phase 1.4: Emergency RLS Disable
-- Disabling RLS entirely on core social tables to isolate the issue.
-- This is a debugging step to confirm if the error is indeed RLS-related.

ALTER TABLE ai_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE approval_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE publish_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_rate_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics DISABLE ROW LEVEL SECURITY;
