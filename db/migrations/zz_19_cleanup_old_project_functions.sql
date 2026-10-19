-- db/migrations/zz_19_cleanup_old_project_functions.sql
BEGIN;
-- 1. Drop the old create_task function (with p_assigned_to)
DROP FUNCTION IF EXISTS public.create_task(
  p_name VARCHAR,
  p_project_id BIGINT,
  p_description TEXT,
  p_assigned_to VARCHAR,
  p_deadline DATE,
  p_estimated_hours NUMERIC,
  p_actual_hours NUMERIC,
  p_stage VARCHAR,
  p_order_index INTEGER,
  p_priority VARCHAR,
  p_progress INTEGER,
  p_quantity INTEGER
);
-- 2. Drop the old update_task function (with p_assigned_to)
DROP FUNCTION IF EXISTS public.update_task(
  p_id BIGINT,
  p_name VARCHAR,
  p_description TEXT,
  p_assigned_to VARCHAR,
  p_deadline DATE,
  p_estimated_hours NUMERIC,
  p_actual_hours NUMERIC,
  p_stage VARCHAR,
  p_order_index INTEGER,
  p_priority VARCHAR,
  p_progress INTEGER,
  p_quantity INTEGER,
  p_active BOOLEAN
);
COMMIT;
