-- Fix foreign keys: milestones and timesheets should reference project_projects
-- Note: This changes the type from UUID to BIGINT to match project_projects.id
-- If UUID project_id values already exist, this migration requires data migration.

BEGIN;

-- ==============================
-- 1. Milestones: Change project_id type and FK
-- ==============================
-- Step A: Drop the old FK constraint
ALTER TABLE milestones
  DROP CONSTRAINT IF EXISTS milestones_project_id_fkey;

-- Step B: Change column type from UUID to BIGINT
-- (If data exists, you'll need to migrate IDs first - this assumes no data or pre-migrated data)
ALTER TABLE milestones
  ALTER COLUMN project_id TYPE BIGINT
  USING project_id::BIGINT;

-- Step C: Add the correct FK
ALTER TABLE milestones
  ADD CONSTRAINT milestones_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES project_projects(id)
  ON DELETE CASCADE;

-- ==============================
-- 2. Timesheets: Change project_id type and FK
-- ==============================
-- Step A: Drop the old FK constraint
ALTER TABLE timesheets
  DROP CONSTRAINT IF EXISTS timesheets_project_id_fkey;

-- Step B: Change column type from UUID to BIGINT
ALTER TABLE timesheets
  ALTER COLUMN project_id TYPE BIGINT
  USING project_id::BIGINT;

-- Step C: Add the correct FK
ALTER TABLE timesheets
  ADD CONSTRAINT timesheets_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES project_projects(id)
  ON DELETE CASCADE;

-- ==============================
-- 3. Expenses: Already references project_projects (verify)
-- ==============================
-- (No change needed - already correct)

-- ==============================
-- 4. Support Tickets: Already references project_projects (verify)
-- ==============================
-- (No change needed - already correct)

-- Re-grant permissions if needed
GRANT SELECT, INSERT, UPDATE, DELETE ON milestones TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON timesheets TO anon, authenticated;

COMMIT;

-- NOTE: If you get "cannot cast type uuid to bigint" errors, you need to
-- migrate the UUID values to BIGINT first. One approach:
--   1) Add new column project_id_new BIGINT
--   2) Populate it by mapping UUID to corresponding project_projects.id
--   3) Drop old FK, drop old column, rename new column
-- Or consider changing project_projects.id to UUID instead (major schema change).
