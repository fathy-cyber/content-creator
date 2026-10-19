-- Phase 1: 003_publish_jobs.sql
-- Setup the queue for actual social media publishing

CREATE TYPE job_status AS ENUM (
  'pending', 'in_progress', 'published', 'failed', 'retrying', 'dead'
);

CREATE TYPE error_code AS ENUM (
  'rate_limit', 'auth', 'platform', 'network', 'fatal'
);

CREATE TABLE publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_post_id UUID NOT NULL REFERENCES ai_posts(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id),
  platform social_platform NOT NULL,
  status job_status DEFAULT 'pending',
  idempotency_key TEXT UNIQUE NOT NULL,
  external_post_id TEXT,
  published_at TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  error_code error_code,
  n8n_execution_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- This table is accessed exclusively via Edge Functions and n8n.
-- We enable RLS but provide NO user policies, effectively restricting to service_role.
ALTER TABLE publish_jobs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_publish_jobs_status ON publish_jobs(status);
CREATE INDEX idx_publish_jobs_ai_post_id ON publish_jobs(ai_post_id);
CREATE INDEX idx_publish_jobs_next_retry_at ON publish_jobs(next_retry_at);
CREATE INDEX idx_publish_jobs_idempotency_key ON publish_jobs(idempotency_key);

-- Trigger for updated_at
CREATE TRIGGER update_publish_jobs_updated_at
    BEFORE UPDATE ON publish_jobs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

/*
-- DOWN Migration
DROP TRIGGER IF EXISTS update_publish_jobs_updated_at ON publish_jobs;
DROP TABLE IF EXISTS publish_jobs;
DROP TYPE IF EXISTS error_code;
DROP TYPE IF EXISTS job_status;
*/
