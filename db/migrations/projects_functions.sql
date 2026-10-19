-- Project Service Functions (Security Definer)

-- Drop old functions with VARCHAR sales_order_id before signature change
DROP FUNCTION IF EXISTS public.create_project(VARCHAR, TEXT, VARCHAR, DATE, DATE, VARCHAR, INTEGER, NUMERIC, BIGINT, VARCHAR, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.update_project(BIGINT, VARCHAR, TEXT, VARCHAR, DATE, DATE, VARCHAR, INTEGER, NUMERIC, BIGINT, VARCHAR, VARCHAR, INTEGER, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION public.create_project(
  p_name VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_manager_id VARCHAR DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_status VARCHAR DEFAULT 'active',
  p_progress INTEGER DEFAULT 0,
  p_budget NUMERIC DEFAULT 0,
  p_customer_id BIGINT DEFAULT NULL,
  p_customer_name VARCHAR DEFAULT NULL,
  p_sales_order_id UUID DEFAULT NULL,
  p_tasks_count INTEGER DEFAULT 0,
  p_completed_tasks_count INTEGER DEFAULT 0
) RETURNS project_projects AS $$
DECLARE
  v_project project_projects;
BEGIN
  INSERT INTO project_projects (
    name, description, manager_id, start_date, end_date,
    status, progress, budget, customer_id, customer_name,
    sales_order_id, tasks_count, completed_tasks_count, active
  ) VALUES (
    p_name, p_description, p_manager_id, p_start_date, p_end_date,
    p_status, p_progress, p_budget, p_customer_id, p_customer_name,
    p_sales_order_id, p_tasks_count, p_completed_tasks_count, true
  )
  RETURNING * INTO v_project;
  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_project(
  p_id BIGINT,
  p_name VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_manager_id VARCHAR DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_progress INTEGER DEFAULT NULL,
  p_budget NUMERIC DEFAULT NULL,
  p_customer_id BIGINT DEFAULT NULL,
  p_customer_name VARCHAR DEFAULT NULL,
  p_sales_order_id UUID DEFAULT NULL,
  p_tasks_count INTEGER DEFAULT NULL,
  p_completed_tasks_count INTEGER DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
) RETURNS project_projects AS $$
DECLARE
  v_project project_projects;
BEGIN
  UPDATE project_projects SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    manager_id = COALESCE(p_manager_id, manager_id),
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    status = COALESCE(p_status, status),
    progress = COALESCE(p_progress, progress),
    budget = COALESCE(p_budget, budget),
    customer_id = COALESCE(p_customer_id, customer_id),
    customer_name = COALESCE(p_customer_name, customer_name),
    sales_order_id = COALESCE(p_sales_order_id, sales_order_id),
    tasks_count = COALESCE(p_tasks_count, tasks_count),
    completed_tasks_count = COALESCE(p_completed_tasks_count, completed_tasks_count),
    active = COALESCE(p_active, active),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_project;
  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_project(p_id BIGINT) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM project_projects WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_projects() 
RETURNS SETOF project_projects LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM project_projects ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_project_by_id(p_id BIGINT) 
RETURNS project_projects LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM project_projects WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.create_task(
  p_name VARCHAR,
  p_project_id BIGINT,
  p_description TEXT DEFAULT NULL,
  p_assigned_to VARCHAR DEFAULT NULL,
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
    project_id, name, description, assigned_to, stage,
    priority, deadline, estimated_hours, actual_hours, quantity,
    progress, order_index, active
  ) VALUES (
    p_project_id, p_name, p_description, p_assigned_to, p_stage,
    p_priority, p_deadline, p_estimated_hours, p_actual_hours, p_quantity,
    p_progress, p_order_index, true
  )
  RETURNING * INTO v_task;
  RETURN v_task;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_task(
  p_id BIGINT,
  p_name VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_assigned_to VARCHAR DEFAULT NULL,
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
    assigned_to = COALESCE(p_assigned_to, assigned_to),
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

CREATE OR REPLACE FUNCTION public.delete_task(p_id BIGINT) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM project_tasks WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_tasks_by_project(p_project_id BIGINT) 
RETURNS SETOF project_tasks LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM project_tasks WHERE project_id = p_project_id ORDER BY order_index ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_task_by_id(p_id BIGINT) 
RETURNS project_tasks LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM project_tasks WHERE id = p_id;
$$;

-- Grants (explicit signatures)
GRANT EXECUTE ON FUNCTION public.create_project(VARCHAR, TEXT, VARCHAR, DATE, DATE, VARCHAR, INTEGER, NUMERIC, BIGINT, VARCHAR, UUID, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_project(BIGINT, VARCHAR, TEXT, VARCHAR, DATE, DATE, VARCHAR, INTEGER, NUMERIC, BIGINT, VARCHAR, UUID, INTEGER, INTEGER, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_project(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_projects() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_by_id(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_task(VARCHAR, BIGINT, TEXT, VARCHAR, DATE, NUMERIC, NUMERIC, VARCHAR, INTEGER, VARCHAR, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_task(BIGINT, VARCHAR, TEXT, VARCHAR, DATE, NUMERIC, NUMERIC, VARCHAR, INTEGER, VARCHAR, INTEGER, INTEGER, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_task(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tasks_by_project(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_by_id(BIGINT) TO anon, authenticated;
