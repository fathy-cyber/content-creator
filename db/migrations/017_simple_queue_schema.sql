BEGIN;

-- ══════════════════════════════════════════════════════════════
-- SIMPLE JOB QUEUE SCHEMA
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS job_queue (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  payload      JSONB       NOT NULL DEFAULT '{}',
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','running','done','failed')),
  attempts     INTEGER     NOT NULL DEFAULT 0,
  max_attempts INTEGER     NOT NULL DEFAULT 3,
  error        TEXT,
  run_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  done_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_schedules (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  cron_expr  TEXT        NOT NULL,
  payload    JSONB       NOT NULL DEFAULT '{}',
  last_run   TIMESTAMPTZ,
  next_run   TIMESTAMPTZ,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_queue_pending
  ON job_queue(status, run_at)
  WHERE status = 'pending';

COMMIT;
