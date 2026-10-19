-- Fix project_projects.sales_order_id type mismatch
-- Align with sales_orders.id (UUID)

-- 1) Drop existing FK constraint if present
ALTER TABLE IF EXISTS public.project_projects
  DROP CONSTRAINT IF EXISTS project_projects_sales_order_id_fkey;

-- 2) Convert sales_order_id from VARCHAR to UUID
ALTER TABLE public.project_projects
  ALTER COLUMN sales_order_id TYPE UUID
  USING CASE
    WHEN sales_order_id IS NULL THEN NULL
    WHEN sales_order_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN sales_order_id::uuid
    ELSE NULL
  END;

-- 3) Re-add FK with default NO ACTION (original behavior)
ALTER TABLE public.project_projects
  ADD CONSTRAINT project_projects_sales_order_id_fkey
  FOREIGN KEY (sales_order_id)
  REFERENCES public.sales_orders (id);

-- 4) Drop and recreate project functions with UUID sales_order_id parameter
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

-- 5) Regrant execute permissions with explicit signatures
GRANT EXECUTE ON FUNCTION public.create_project(VARCHAR, TEXT, VARCHAR, DATE, DATE, VARCHAR, INTEGER, NUMERIC, BIGINT, VARCHAR, UUID, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_project(BIGINT, VARCHAR, TEXT, VARCHAR, DATE, DATE, VARCHAR, INTEGER, NUMERIC, BIGINT, VARCHAR, UUID, INTEGER, INTEGER, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_project(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_projects() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_by_id(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_task(VARCHAR, BIGINT, TEXT, VARCHAR, DATE, NUMERIC, INTEGER, VARCHAR, INTEGER, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_task(BIGINT, VARCHAR, TEXT, VARCHAR, DATE, NUMERIC, INTEGER, VARCHAR, INTEGER, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_task(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tasks_by_project(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_by_id(BIGINT) TO anon, authenticated;
