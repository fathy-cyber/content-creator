-- =============================================================================
-- ENTERPRISE-GRADE RPC JOIN
-- Replaces fragile PostgREST embedding with a robust, single-query join
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_billing_session_items(p_session_id UUID)
RETURNS TABLE (
    id                  UUID,
    billing_session_id  UUID,
    source_type         billing_item_source,
    task_id             BIGINT,
    timesheet_id        UUID,
    milestone_id        UUID,
    expense_id          UUID,
    description         TEXT,
    quantity            NUMERIC,
    unit_price          NUMERIC,
    amount              NUMERIC,
    is_billable         BOOLEAN,
    is_written_off      BOOLEAN,
    -- Joined fields
    timesheet_date      DATE,
    timesheet_hours     NUMERIC,
    milestone_name      TEXT,
    expense_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bi.id,
        bi.billing_session_id,
        bi.source_type,
        bi.task_id,
        bi.timesheet_id,
        bi.milestone_id,
        bi.expense_id,
        bi.description,
        bi.quantity,
        bi.unit_price,
        bi.amount,
        bi.is_billable,
        bi.is_written_off,
        t.date AS timesheet_date,
        t.billable_hours AS timesheet_hours,
        m.name AS milestone_name,
        e.description AS expense_description
    FROM billing_items bi
    LEFT JOIN timesheets t ON bi.timesheet_id = t.id
    LEFT JOIN milestones m ON bi.milestone_id = m.id
    LEFT JOIN expenses e ON bi.expense_id = e.id
    WHERE bi.billing_session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_billing_session_items(UUID) TO anon, authenticated;

COMMIT;
