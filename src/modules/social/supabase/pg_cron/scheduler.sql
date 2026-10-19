-- Phase 6: pg_cron SCHEDULER
-- Automated background jobs for the Social Media Publishing System

-- Ensure pg_cron is enabled
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job 1: Publish Scheduler
-- Runs every minute to find approved+scheduled posts due for publishing.
-- It creates publish jobs and notifies n8n via pg_net.
SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *',
  $$
  DO $$
  DECLARE
    post_record RECORD;
    job_id UUID;
    n8n_url TEXT := (SELECT setting FROM pg_settings WHERE name = 'app.n8n_webhook_url'); -- Assume setting is configured
  BEGIN
    FOR post_record IN 
      SELECT id, platform, scheduled_for, created_by 
      FROM ai_posts 
      WHERE status = 'scheduled' AND scheduled_for <= NOW()
    LOOP
      -- Create publish job (idempotent via idempotency_key)
      INSERT INTO publish_jobs (
        ai_post_id, 
        social_account_id, 
        platform, 
        idempotency_key, 
        status
      )
      VALUES (
        post_record.id, 
        (SELECT id FROM social_accounts WHERE platform = post_record.platform AND status = 'active' LIMIT 1), 
        post_record.platform, 
        post_record.id || ':' || post_record.scheduled_for, 
        'pending'
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id INTO job_id;

      -- If job was created or exists, notify n8n
      IF job_id IS NOT NULL THEN
        PERFORM net.http_post(
          url := n8n_url,
          body := jsonb_build_object('publish_job_id', job_id),
          headers := jsonb_build_object('Content-Type', 'application/json')
        );
      END IF;

      -- Update post status to in_progress
      UPDATE ai_posts SET status = 'in_progress' WHERE id = post_record.id;
    END LOOP;
  END $$;
  $$
);

-- Job 2: Approval Escalation
-- Runs every hour to escalate posts stuck in review for > 48 hours.
SELECT cron.schedule(
  'escalate-pending-approvals',
  '0 * * * *',
  $$
  DO $$
  DECLARE
    post_record RECORD;
  BEGIN
    FOR post_record IN 
      SELECT id FROM ai_posts 
      WHERE status = 'in_review' 
      AND updated_at < NOW() - INTERVAL '48 hours'
    LOOP
      INSERT INTO approval_events (ai_post_id, actor_id, action, comment)
      VALUES (post_record.id, NULL, 'escalated', 'Auto-escalated due to review timeout (> 48h)');
    END LOOP;
  END $$;
  $$
);

-- Job 3: Token Expiry Check
-- Runs every 6 hours to proactively refresh tokens expiring within 24 hours.
SELECT cron.schedule(
  'proactive-token-refresh',
  '0 */6 * * *',
  $$
  DO $$
  DECLARE
    account_record RECORD;
  BEGIN
    FOR account_record IN 
      SELECT id FROM social_accounts 
      WHERE status = 'active' 
      AND token_expires_at < NOW() + INTERVAL '24 hours'
    LOOP
      PERFORM net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/token-refresh',
        body := jsonb_build_object('social_account_id', account_record.id),
        headers := jsonb_build_object('Content-Type', 'application/json')
      );
    END LOOP;
  END $$;
  $$
);

-- Job 4: Analytics Polling
-- Runs every day at 09:00 UTC to refresh analytics for posts published in last 30 days.
SELECT cron.schedule(
  'daily-analytics-refresh',
  '0 9 * * *',
  $$
  DO $$
  DECLARE
    job_record RECORD;
  BEGIN
    FOR job_record IN 
      SELECT id FROM publish_jobs 
      WHERE status = 'published' 
      AND published_at > NOW() - INTERVAL '30 days'
    LOOP
      PERFORM net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/analytics-fetch',
        body := jsonb_build_object('publish_job_id', job_record.id),
        headers := jsonb_build_object('Content-Type', 'application/json')
      );
    END LOOP;
  END $$;
  $$
);

/*
-- DOWN Migration
SELECT cron.unschedule('publish-scheduled-posts');
SELECT cron.unschedule('escalate-pending-approvals');
SELECT cron.unschedule('proactive-token-refresh');
SELECT cron.unschedule('daily-analytics-refresh');
*/
