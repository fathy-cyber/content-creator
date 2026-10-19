-- ═══════════════════════════════════════════════════════════════
-- TIMESHEETS SCHEMA
-- ═══════════════════════════════════════════════════════════════

BEGIN;

CREATE TYPE timesheet_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected'
);

CREATE TABLE IF NOT EXISTS timesheets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      BIGINT NOT NULL REFERENCES project_projects(id) ON DELETE CASCADE,
  task_id         BIGINT REFERENCES project_tasks(id) ON DELETE SET NULL,
  employee_id     UUID NOT NULL REFERENCES employees(id),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  hours           NUMERIC(10,2) NOT NULL DEFAULT 0,
  billable_hours  NUMERIC(10,2) NOT NULL DEFAULT 0,
  description     TEXT DEFAULT '',
  status          timesheet_status NOT NULL DEFAULT 'draft',
  is_billed       BOOLEAN NOT NULL DEFAULT FALSE,
  billed_at       TIMESTAMPTZ DEFAULT NULL,
  writeoff_hours  NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timesheets_project ON timesheets(project_id);
CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_timesheets_billed ON timesheets(is_billed, project_id);

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read timesheets" 
  ON timesheets FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated manage own timesheets" 
  ON timesheets FOR ALL 
  USING (auth.uid() = employee_id);

CREATE POLICY "Allow manager manage project timesheets" 
  ON timesheets FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM project_projects p 
      WHERE p.id = timesheets.project_id AND p.manager_id = auth.uid()::text
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON timesheets TO anon, authenticated;

COMMIT;
