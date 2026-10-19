-- =============================================================================
-- FIX PROJECT_TASKS SCHEMA
-- 1. Rename assigned_to -> employee_id (UUID)
-- 2. Fix project_id type (UUID -> BIGINT)
-- 3. Add missing billing columns
-- =============================================================================

BEGIN;

-- 1) Rename assigned_to to employee_id and change its type to UUID referencing employees(id)
ALTER TABLE project_tasks RENAME COLUMN assigned_to TO employee_id;

ALTER TABLE project_tasks
  ALTER COLUMN employee_id TYPE UUID
  USING employee_id::uuid;

ALTER TABLE project_tasks
  ADD CONSTRAINT project_tasks_employee_id_fkey
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 2) Fix project_id type mismatch (project_tasks.project_id should be BIGINT to match project_projects.id)

-- Drop the RLS policy that depends on project_tasks.project_id (required for ALTER COLUMN TYPE)
DROP POLICY IF EXISTS "Allow public read tasks of active projects"
ON public.project_tasks;

ALTER TABLE project_tasks DROP CONSTRAINT IF EXISTS project_tasks_project_id_fkey;

ALTER TABLE project_tasks
  ALTER COLUMN project_id TYPE BIGINT
  USING project_id::text::bigint;

ALTER TABLE project_tasks
  ADD CONSTRAINT project_tasks_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES project_projects(id) ON DELETE CASCADE;

-- 3) Add missing columns if they don't exist
ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS billed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_rate    NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS writeoff_hours  NUMERIC(8,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_item_id UUID REFERENCES billing_items(id) ON DELETE SET NULL;

-- Recreate the policy (updated to the new BIGINT project_id type)
CREATE POLICY "Allow public read tasks of active projects"
ON public.project_tasks
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM project_projects p
    WHERE (p.id = project_tasks.project_id)
      AND (p.active = true)
  )
);

COMMIT;