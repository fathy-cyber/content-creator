-- ═══════════════════════════════════════════════════════════════
-- EXPENSES SCHEMA
-- ═══════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      BIGINT NOT NULL REFERENCES project_projects(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  amount          NUMERIC(12,3) NOT NULL DEFAULT 0,
  category        TEXT DEFAULT 'general',
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  is_billable     BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by     UUID REFERENCES employees(id),
  is_billed       BOOLEAN NOT NULL DEFAULT FALSE,
  billed_at       TIMESTAMPTZ DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_billed ON expenses(is_billed, project_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read expenses" 
  ON expenses FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated insert expenses" 
  ON expenses FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow manager manage project expenses" 
  ON expenses FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM project_projects p 
      WHERE p.id = expenses.project_id AND p.manager_id = auth.uid()::text
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO anon, authenticated;

COMMIT;
