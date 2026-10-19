-- =============================================================================
-- FIX PROJECT FUNCTIONS
-- Update create_task and update_task to use p_employee_id (UUID) instead of p_assigned_to (VARCHAR)
-- =============================================================================

BEGIN;

-- 1. Update create_task
CREATE OR REPLACE FUNCTION public.create_task(
  p_name VARCHAR,
  p_project_id BIGINT,
  p_description TEXT DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL,
  p_deadline DATE DEFAULT NULL,
  p_estimated_hours NUMERIC DEFAULT NULL,
  p_actual_hours NUMERIC DEFAULT NULL,
  p_stage VARCHAR DEFAULT 'todo',
  p_order_index INTEGER DEFAULT 0,
  p_priority VARCHAR DEFAULT 'medium',
  p_progress INTEGER DEFAULT 0,
  p_quantity INTEGER DEFAULT 1
) RETURNS project_tasks AS $$
DECLARE
  v_task project_tasks;
BEGIN
  INSERT INTO project_tasks (
    project_id, name, description, employee_id, stage,
    priority, deadline, estimated_hours, actual_hours, quantity,
    progress, order_index, active
  ) VALUES (
    p_project_id, p_name, p_description, p_employee_id, p_stage,
    p_priority, p_deadline, p_estimated_hours, p_actual_hours, p_quantity,
    p_progress, p_order_index, true
  )
  RETURNING * INTO v_task;
  RETURN v_task;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update update_task
CREATE OR REPLACE FUNCTION public.update_task(
  p_id BIGINT,
  p_name VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL,
  p_deadline DATE DEFAULT NULL,
  p_estimated_hours NUMERIC DEFAULT NULL,
  p_actual_hours NUMERIC DEFAULT NULL,
  p_stage VARCHAR DEFAULT NULL,
  p_order_index INTEGER DEFAULT NULL,
  p_priority VARCHAR DEFAULT NULL,
  p_progress INTEGER DEFAULT NULL,
  p_quantity INTEGER DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
) RETURNS project_tasks AS $$
DECLARE
  v_task project_tasks;
BEGIN
  UPDATE project_tasks SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    employee_id = COALESCE(p_employee_id, employee_id),
    stage = COALESCE(p_stage, stage),
    priority = COALESCE(p_priority, priority),
    deadline = COALESCE(p_deadline, deadline),
    estimated_hours = COALESCE(p_estimated_hours, estimated_hours),
    actual_hours = COALESCE(p_actual_hours, actual_hours),
    quantity = COALESCE(p_quantity, quantity),
    progress = COALESCE(p_progress, progress),
    order_index = COALESCE(p_order_index, order_index),
    active = COALESCE(p_active, active),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_task;
  RETURN v_task;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-grant permissions (since we recreated the functions)
GRANT EXECUTE ON FUNCTION public.create_task(VARCHAR, BIGINT, TEXT, UUID, DATE, NUMERIC, NUMERIC, VARCHAR, INTEGER, VARCHAR, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_task(BIGINT, VARCHAR, TEXT, UUID, DATE, NUMERIC, NUMERIC, VARCHAR, INTEGER, VARCHAR, INTEGER, INTEGER, BOOLEAN) TO anon, authenticated;

COMMIT;
