-- =============================================================================
-- BILLING COMPLETE FIXES — Idempotent (corrected)
-- - Fixes ALTER COLUMN blocked by RLS policy dependencies
-- - Schema-qualifies all objects
-- =============================================================================

BEGIN;

-- ==============================
-- 1. RLS Policies for Billing Tables (idempotent)
-- ==============================
ALTER TABLE public.billing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_session_events ENABLE ROW LEVEL SECURITY;

-- Drop & recreate policies
DROP POLICY IF EXISTS "Allow authenticated manage billing sessions" ON public.billing_sessions;
CREATE POLICY "Allow authenticated manage billing sessions"
ON public.billing_sessions
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated manage billing items" ON public.billing_items;
CREATE POLICY "Allow authenticated manage billing items"
ON public.billing_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated manage billing session events" ON public.billing_session_events;
CREATE POLICY "Allow authenticated manage billing session events"
ON public.billing_session_events
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_session_events TO anon, authenticated;

-- ==============================
-- 2. Fix FK: billing_sessions → project_projects (idempotent)
-- ==============================
ALTER TABLE public.billing_sessions
  DROP CONSTRAINT IF EXISTS billing_sessions_project_id_fkey;

ALTER TABLE public.billing_sessions
  ADD CONSTRAINT billing_sessions_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.project_projects(id) ON DELETE CASCADE;

-- ==============================
-- 3. Fix timesheets (idempotent) — WARNING: TRUNCATES data
-- ==============================

-- Drop any RLS policies that reference timesheets.project_id by removing all policies first
ALTER TABLE public.timesheets DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'timesheets'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I;',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
END $$;

-- Now safe to alter column type
TRUNCATE public.timesheets RESTART IDENTITY CASCADE;

ALTER TABLE public.timesheets
  DROP CONSTRAINT IF EXISTS timesheets_project_id_fkey;

ALTER TABLE public.timesheets
  ALTER COLUMN project_id TYPE BIGINT;

ALTER TABLE public.timesheets
  ADD CONSTRAINT timesheets_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.project_projects(id) ON DELETE CASCADE;

ALTER TABLE public.timesheets
  DROP CONSTRAINT IF EXISTS timesheets_task_id_fkey;

ALTER TABLE public.timesheets
  ALTER COLUMN task_id TYPE BIGINT;

ALTER TABLE public.timesheets
  ADD CONSTRAINT timesheets_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES public.project_tasks(id) ON DELETE SET NULL;

-- Re-enable RLS and recreate your policy
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manager manage project timesheets" ON public.timesheets;
CREATE POLICY "Allow manager manage project timesheets"
ON public.timesheets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_projects p
    WHERE p.id = public.timesheets.project_id
      AND p.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.project_projects p
    WHERE p.id = public.timesheets.project_id
      AND p.manager_id = auth.uid()
  )
);

-- ==============================
-- 4. Fix milestones (idempotent) — WARNING: TRUNCATES data
-- ==============================

ALTER TABLE public.milestones DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'milestones'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I;',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
END $$;

TRUNCATE public.milestones RESTART IDENTITY CASCADE;

ALTER TABLE public.milestones
  DROP CONSTRAINT IF EXISTS milestones_project_id_fkey;

ALTER TABLE public.milestones
  ALTER COLUMN project_id TYPE BIGINT;

ALTER TABLE public.milestones
  ADD CONSTRAINT milestones_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.project_projects(id) ON DELETE CASCADE;

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manager manage project milestones" ON public.milestones;
CREATE POLICY "Allow manager manage project milestones"
ON public.milestones
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_projects p
    WHERE p.id = public.milestones.project_id
      AND p.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.project_projects p
    WHERE p.id = public.milestones.project_id
      AND p.manager_id = auth.uid()
  )
);

-- ==============================
-- 5. Update fn_extract_billable_items (replace if exists)
-- ==============================

CREATE OR REPLACE FUNCTION public.fn_extract_billable_items(
  p_billing_session_id UUID,
  p_project_id BIGINT,
  p_billing_model billing_model
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER := 0;
  v_item  RECORD;
BEGIN

  IF p_billing_model IN ('time_and_material', 'hybrid') THEN
    FOR v_item IN
      SELECT
        t.id           AS timesheet_id,
        t.task_id,
        t.employee_id,
        t.billable_hours,
        emp.billable_rate,
        t.description,
        t.date,
        concat(emp.full_name, ' - ', t.description) AS label
      FROM public.timesheets t
      JOIN public.employees emp ON emp.id = t.employee_id
      LEFT JOIN public.project_tasks pt ON pt.id = t.task_id
      WHERE t.project_id = p_project_id
        AND t.status = 'approved'
        AND t.is_billed = FALSE
        AND t.billable_hours > 0
    LOOP
      INSERT INTO public.billing_items (
        billing_session_id, source_type,
        timesheet_id, task_id,
        description, quantity, unit_price, amount,
        original_quantity, original_unit_price, original_amount,
        is_billable
      ) VALUES (
        p_billing_session_id, 'timesheet',
        v_item.timesheet_id, v_item.task_id,
        v_item.label,
        v_item.billable_hours,
        COALESCE(v_item.billable_rate, 0),
        v_item.billable_hours * COALESCE(v_item.billable_rate, 0),
        v_item.billable_hours,
        COALESCE(v_item.billable_rate, 0),
        v_item.billable_hours * COALESCE(v_item.billable_rate, 0),
        TRUE
      );
      v_count := v_count + 1;
    END LOOP;
  END IF;

  IF p_billing_model IN ('fixed_price', 'hybrid') THEN
    FOR v_item IN
      SELECT
        oli.id,
        oli.product_name AS description,
        oli.quantity,
        oli.unit_price,
        oli.total AS subtotal
      FROM public.sales_orders so
      JOIN public.sales_order_items oli ON oli.order_id = so.id
      JOIN public.project_projects p ON p.sales_order_id = so.id
      WHERE p.id = p_project_id
    LOOP
      INSERT INTO public.billing_items (
        billing_session_id, source_type,
        description, quantity, unit_price, amount,
        original_quantity, original_unit_price, original_amount,
        is_billable
      ) VALUES (
        p_billing_session_id, 'fixed',
        v_item.description,
        v_item.quantity, v_item.unit_price, v_item.subtotal,
        v_item.quantity, v_item.unit_price, v_item.subtotal,
        TRUE
      );
      v_count := v_count + 1;
    END LOOP;
  END IF;

  IF p_billing_model IN ('milestone', 'hybrid') THEN
    FOR v_item IN
      SELECT id, name, invoice_amount
      FROM public.milestones
      WHERE project_id = p_project_id
        AND status = 'reached'
        AND invoice_trigger = TRUE
        AND id NOT IN (
          SELECT milestone_id
          FROM public.billing_items
          WHERE milestone_id IS NOT NULL
            AND is_billed = TRUE
        )
    LOOP
      INSERT INTO public.billing_items (
        billing_session_id, source_type,
        milestone_id,
        description, quantity, unit_price, amount,
        original_quantity, original_unit_price, original_amount,
        is_billable
      ) VALUES (
        p_billing_session_id, 'milestone',
        v_item.id,
        concat('Milestone: ', v_item.name),
        1, v_item.invoice_amount, v_item.invoice_amount,
        1, v_item.invoice_amount, v_item.invoice_amount,
        TRUE
      );
      v_count := v_count + 1;
    END LOOP;
  END IF;

  FOR v_item IN
    SELECT id, description, amount
    FROM public.expenses
    WHERE project_id = p_project_id
      AND is_billable = TRUE
      AND approved_by IS NOT NULL
      AND id NOT IN (
        SELECT expense_id
        FROM public.billing_items
        WHERE expense_id IS NOT NULL
          AND is_billed = TRUE
      )
  LOOP
    INSERT INTO public.billing_items (
      billing_session_id, source_type,
      expense_id,
      description, quantity, unit_price, amount,
      original_quantity, original_unit_price, original_amount,
      is_billable
    ) VALUES (
      p_billing_session_id, 'expense',
      v_item.id,
      concat('Expense: ', v_item.description),
      1, v_item.amount, v_item.amount,
      1, v_item.amount, v_item.amount,
      TRUE
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_extract_billable_items(UUID, BIGINT, billing_model) TO anon, authenticated;

-- ==============================
-- 6. Ensure grants for project_projects
-- ==============================
GRANT SELECT, INSERT, UPDATE ON public.project_projects TO anon, authenticated;

COMMIT;