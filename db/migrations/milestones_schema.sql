-- ═══════════════════════════════════════════════════════════════
-- MILESTONES SCHEMA
-- ═══════════════════════════════════════════════════════════════

BEGIN;

CREATE TYPE milestone_status AS ENUM (
  'pending',
  'reached',
  'overdue'
);

CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      BIGSERIAL  NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  target_date     DATE,
  status          milestone_status NOT NULL DEFAULT 'pending',
  invoice_amount  NUMERIC(12,3) NOT NULL DEFAULT 0,
  invoice_trigger BOOLEAN NOT NULL DEFAULT TRUE,
  is_billed       BOOLEAN NOT NULL DEFAULT FALSE,
  billed_at       TIMESTAMPTZ,
  progress        INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read milestones" 
  ON milestones FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow manager manage project milestones" 
  ON milestones FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = milestones.project_id AND p.manager_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON milestones TO anon, authenticated;

COMMIT;
