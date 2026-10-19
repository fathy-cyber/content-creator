-- =============================================================================
-- BILLING COMPLETE FIXES
-- Applies RLS, fixes foreign keys, updates extraction function,
-- and aligns timesheets/milestones column types with project_projects.id (BIGINT)
-- =============================================================================
-- WARNING: This migration TRUNCATES timesheets and milestones tables.
-- Backup data first if needed.
-- =============================================================================

BEGIN;

-- ==============================
-- 1. RLS Policies for Billing Tables
-- ==============================
ALTER TABLE billing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_session_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated manage billing sessions" ON billing_sessions;
CREATE POLICY "Allow authenticated manage billing sessions"
ON billing_sessions FOR ALL
USING (auth.role() IN ('authenticated', 'anon'))
WITH CHECK (auth.role() IN ('authenticated', 'anon'));

DROP POLICY IF EXISTS "Allow authenticated manage billing items" ON billing_items;
CREATE POLICY "Allow authenticated manage billing items"
ON billing_items FOR ALL
USING (auth.role() IN ('authenticated', 'anon'))
WITH CHECK (auth.role() IN ('authenticated', 'anon'));

DROP POLICY IF EXISTS "Allow authenticated manage billing session events" ON billing_session_events;
CREATE POLICY "Allow authenticated manage billing session events"
ON billing_session_events FOR ALL
USING (auth.role() IN ('authenticated', 'anon'))
WITH CHECK (auth.role() IN ('authenticated', 'anon'));

GRANT SELECT, INSERT, UPDATE, DELETE ON billing_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON billing_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON billing_session_events TO anon, authenticated;

-- ==============================
-- 2. Fix FK: billing_sessions → project_projects
-- ==============================
ALTER TABLE billing_sessions
  DROP CONSTRAINT IF EXISTS billing_sessions_project_id_fkey,
  ADD CONSTRAINT billing_sessions_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES project_projects(id)
  ON DELETE CASCADE;

-- ==============================
-- 3. Fix timesheets: project_id BIGINT → project_projects, task_id → project_tasks
-- ==============================
-- Clear any existing timesheets data to safely change column types
TRUNCATE timesheets RESTART IDENTITY CASCADE;

ALTER TABLE timesheets
  DROP CONSTRAINT IF EXISTS timesheets_project_id_fkey,
  ALTER COLUMN project_id TYPE BIGINT,
  ADD CONSTRAINT timesheets_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES project_projects(id) ON DELETE CASCADE;

ALTER TABLE timesheets
  DROP CONSTRAINT IF EXISTS timesheets_task_id_fkey,
  ALTER COLUMN task_id TYPE BIGINT,
  ADD CONSTRAINT timesheets_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL;

-- Update RLS policy on timesheets to use correct table name
DROP POLICY IF EXISTS "Allow manager manage project timesheets" ON timesheets;
CREATE POLICY "Allow manager manage project timesheets"
ON timesheets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_projects p
    WHERE p.id = timesheets.project_id AND p.manager_id = auth.uid()
  )
);

-- ==============================
-- 4. Fix milestones: project_id BIGINT → project_projects
-- ==============================
TRUNCATE milestones RESTART IDENTITY CASCADE;

ALTER TABLE milestones
  DROP CONSTRAINT IF EXISTS milestones_project_id_fkey,
  ALTER COLUMN project_id TYPE BIGINT,
  ADD CONSTRAINT milestones_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES project_projects(id) ON DELETE CASCADE;

-- Update RLS policy on milestones
DROP POLICY IF EXISTS "Allow manager manage project milestones" ON milestones;
CREATE POLICY "Allow manager manage project milestones"
ON milestones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_projects p
    WHERE p.id = milestones.project_id AND p.manager_id = auth.uid()
  )
);

-- ==============================
-- 5. Update fn_extract_billable_items function
-- ==============================
CREATE OR REPLACE FUNCTION public.fn_extract_billable_items(
  p_billing_session_id  UUID,
  p_project_id          BIGINT,
  p_billing_model       billing_model
)
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER := 0;
  v_item  RECORD;
BEGIN

  -- T&M or HYBRID: Extract approved timesheets
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
        COALESCE(pt.title, t.description) AS task_label,
        concat(emp.full_name, ' - ', COALESCE(pt.title, t.description)) AS label
      FROM timesheets t
      JOIN employees emp ON emp.id = t.employee_id
      LEFT JOIN project_tasks pt ON pt.id = t.task_id
      WHERE t.project_id = p_project_id
        AND t.status = 'approved'
        AND t.is_billed = FALSE
        AND t.billable_hours > 0
    LOOP
      INSERT INTO billing_items (
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

  -- FIXED or HYBRID base: Extract from sales order line items
  IF p_billing_model IN ('fixed_price', 'hybrid') THEN
    FOR v_item IN
      SELECT
        oli.id, oli.product_name AS description,
        oli.quantity, oli.unit_price, oli.total AS subtotal
      FROM sales_orders so
      JOIN sales_order_items oli ON oli.order_id = so.id
      JOIN project_projects p ON p.sales_order_id = so.id
      WHERE p.id = p_project_id
    LOOP
      INSERT INTO billing_items (
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

  -- MILESTONE: Extract reached (unbilled) milestones
  IF p_billing_model IN ('milestone', 'hybrid') THEN
    FOR v_item IN
      SELECT id, name, invoice_amount
      FROM   milestones
      WHERE  project_id = p_project_id
        AND  status = 'reached'
        AND  invoice_trigger = TRUE
        AND  id NOT IN (
          SELECT milestone_id FROM billing_items
          WHERE  milestone_id IS NOT NULL AND is_billed = TRUE
        )
    LOOP
      INSERT INTO billing_items (
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

  -- ALL MODELS: Extract unbilled reimbursable expenses
  FOR v_item IN
    SELECT id, description, amount
    FROM   expenses
    WHERE  project_id = p_project_id
      AND  is_billable = TRUE
      AND  approved_by IS NOT NULL
      AND  id NOT IN (
        SELECT expense_id FROM billing_items
        WHERE  expense_id IS NOT NULL AND is_billed = TRUE
      )
  LOOP
    INSERT INTO billing_items (
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
GRANT SELECT, INSERT, UPDATE ON project_projects TO anon, authenticated;

COMMIT;
