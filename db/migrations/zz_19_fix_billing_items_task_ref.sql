-- =============================================================================
-- FIX BILLING_ITEMS TASK REFERENCE
-- 1. Ensure task_id references project_tasks(id)
-- 2. Ensure task_id is BIGINT
-- =============================================================================

BEGIN;

-- 1. Drop all constraints on task_id to avoid ambiguity and ensure clean state
-- We don't know all names, but we know the ones we've seen.
ALTER TABLE billing_items DROP CONSTRAINT IF EXISTS billing_items_task_id_fkey;
ALTER TABLE billing_items DROP CONSTRAINT IF EXISTS fk_billing_items_invoice_line;

-- 2. Fix the type to BIGINT to match project_tasks.id (BIGSERIAL)
-- We use a cast to text then to bigint to handle any potential UUIDs if they exist,
-- though it will fail if they are not numeric. 
-- If they are UUIDs, we have a bigger problem.
ALTER TABLE billing_items ALTER COLUMN task_id TYPE BIGINT USING task_id::text::bigint;

-- 3. Add the correct foreign key constraint
ALTER TABLE billing_items
  ADD CONSTRAINT billing_items_task_id_fkey
  FOREIGN KEY (task_id)
  REFERENCES project_tasks(id)
  ON DELETE SET NULL;

COMMIT;
