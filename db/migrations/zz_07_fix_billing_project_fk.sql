-- Fix foreign key: billing_sessions.project_id should reference project_projects.id
-- The billing_sessions FK was incorrectly pointing to a non-existent 'projects' table

BEGIN;

-- Drop existing FK constraint (name may vary, handle gracefully)
ALTER TABLE billing_sessions
  DROP CONSTRAINT IF EXISTS billing_sessions_project_id_fkey,
  ADD CONSTRAINT billing_sessions_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES project_projects(id)
  ON DELETE CASCADE;

COMMIT;
