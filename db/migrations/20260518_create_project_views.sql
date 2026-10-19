-- Deliverable 1: Project Management Views

-- Deliverable 1: Project Management Views

-- 1.1 v_project_list
-- Purpose: Power the projects list table (all projects, newest first)
DROP VIEW IF EXISTS v_project_list;
CREATE VIEW v_project_list AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.manager_id,
    p.start_date,
    p.end_date,
    p.customer_id,
    p.sales_order_id,
    CASE 
        WHEN p.status = 'archived' THEN 'archived'
        WHEN ts_progress.total_tasks_count > 0 AND ts_progress.completed_tasks_count = ts_progress.total_tasks_count THEN 'completed'
        WHEN ts_progress.completed_tasks_count > 0 OR ts_progress.avg_progress > 0 THEN 'active'
        ELSE p.status 
    END AS status,
    p.progress,
    p.budget,
    p.active,
    p.created_at,
    p.updated_at,
    p.billing_model,
    p.billing_status,
    p.retainer_amount,
    p.billing_reviewed_by,
    p.billing_reviewed_at,
    p.billing_notes,
    p.payment_status,
    c.name AS client_name,
    c.company AS client_company,

    -- CALCULATED COLUMNS (Overriding table columns to ensure real-time data)
    COALESCE((ts_progress.completed_tasks_count::float / NULLIF(ts_progress.total_tasks_count, 0)) * 100, 0) AS task_completion_pct,
    COALESCE(ts_progress.completed_tasks_count, 0) AS completed_tasks_count,
    COALESCE(ts_progress.total_tasks_count, 0) AS tasks_count,

    (p.end_date - CURRENT_DATE) AS days_remaining,
    (p.end_date < CURRENT_DATE AND p.status = 'active') AS is_overdue,
    COALESCE(ts.total_logged_hours, 0) AS total_logged_hours,
    COALESCE(ts.total_billable_hours, 0) AS total_billable_hours,
    COALESCE(ex.total_expenses, 0) AS total_expenses,
    COALESCE(ts.labor_cost, 0) AS labor_cost,
    COALESCE(ts.billable_value, 0) AS billable_value,
    (p.budget - COALESCE(ts.labor_cost, 0) - COALESCE(ex.total_expenses, 0)) AS gross_profit,
    ((p.budget - COALESCE(ts.labor_cost, 0) - COALESCE(ex.total_expenses, 0)) / NULLIF(p.budget, 0)) * 100 AS profit_margin,
    COALESCE(ms.milestone_count, 0) AS milestone_count,
    COALESCE(ms.billed_milestones_count, 0) AS billed_milestones_count,
    COALESCE(ms.pending_invoice_amount, 0) AS pending_invoice_amount
FROM project_projects p
LEFT JOIN crm_contacts c ON p.customer_id = c.id
LEFT JOIN (
    SELECT 
        project_id, 
        AVG(progress) AS avg_progress,
        COUNT(id) AS total_tasks_count,
        COUNT(id) FILTER (WHERE stage = 'done') AS completed_tasks_count
    FROM project_tasks 
    GROUP BY project_id
) ts_progress ON p.id = ts_progress.project_id
LEFT JOIN (
    SELECT 
        t.project_id,
        SUM(t.hours) AS total_logged_hours,
        SUM(t.billable_hours) AS total_billable_hours,
        SUM(t.hours * e.cost_rate) AS labor_cost,
        SUM(t.billable_hours * e.billable_rate) AS billable_value
    FROM timesheets t
    JOIN employees e ON t.employee_id = e.id
    GROUP BY t.project_id
) ts ON p.id = ts.project_id
LEFT JOIN (
    SELECT 
        project_id,
        SUM(amount) AS total_expenses
    FROM expenses
    GROUP BY project_id
) ex ON p.id = ex.project_id
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(id) AS milestone_count,
        COUNT(id) FILTER (WHERE is_billed = true) AS billed_milestones_count,
        SUM(invoice_amount) FILTER (WHERE NOT is_billed) AS pending_invoice_amount
    FROM milestones
    GROUP BY project_id
) ms ON p.id = ms.project_id;

-- 1.2 v_project_financials
-- Purpose: Power the Financials tab of a single project
CREATE OR REPLACE VIEW v_project_financials AS
SELECT 
    p.id AS project_id,
    p.budget,
    p.retainer_amount,
    p.billing_model,
    COALESCE(ts.labor_cost, 0) AS labor_cost,
    COALESCE(ts.billable_value, 0) AS billable_value,
    COALESCE(ts.writeoff_cost, 0) AS writeoff_cost,
    COALESCE(ts.total_logged_hours, 0) AS total_logged_hours,
    COALESCE(ts.total_billable_hours, 0) AS total_billable_hours,
    COALESCE(ts.total_writeoff_hours, 0) AS total_writeoff_hours,
    COALESCE(ex.expenses_total, 0) AS expenses_total,
    COALESCE(ex.expenses_billable, 0) AS expenses_billable,
    COALESCE(ex.expenses_internal, 0) AS expenses_internal,
    COALESCE(ms.milestone_invoiceable, 0) AS milestone_invoiceable,
    COALESCE(ms.milestone_billed, 0) AS milestone_billed,
    COALESCE(ms.milestone_pending, 0) AS milestone_pending,
    (COALESCE(ts.labor_cost, 0) + COALESCE(ex.expenses_total, 0)) AS total_expenses,
    (p.budget - (COALESCE(ts.labor_cost, 0) + COALESCE(ex.expenses_total, 0))) AS gross_profit,
    ((p.budget - (COALESCE(ts.labor_cost, 0) + COALESCE(ex.expenses_total, 0))) / NULLIF(p.budget, 0)) * 100 AS profit_margin
FROM project_projects p
LEFT JOIN (
    SELECT 
        t.project_id,
        SUM(t.hours * e.cost_rate) AS labor_cost,
        SUM(t.billable_hours * e.billable_rate) AS billable_value,
        SUM(t.writeoff_hours * e.billable_rate) AS writeoff_cost,
        SUM(t.hours) AS total_logged_hours,
        SUM(t.billable_hours) AS total_billable_hours,
        SUM(t.writeoff_hours) AS total_writeoff_hours
    FROM timesheets t
    JOIN employees e ON t.employee_id = e.id
    GROUP BY t.project_id
) ts ON p.id = ts.project_id
LEFT JOIN (
    SELECT 
        project_id,
        SUM(amount) AS expenses_total,
        SUM(amount) FILTER (WHERE is_billable = true) AS expenses_billable,
        SUM(amount) FILTER (WHERE is_billable = false) AS expenses_internal
    FROM expenses
    GROUP BY project_id
) ex ON p.id = ex.project_id
LEFT JOIN (
    SELECT 
        project_id,
        SUM(invoice_amount) FILTER (WHERE invoice_trigger = true) AS milestone_invoiceable,
        SUM(invoice_amount) FILTER (WHERE is_billed = true) AS milestone_billed,
        SUM(invoice_amount) FILTER (WHERE NOT is_billed AND invoice_trigger = true) AS milestone_pending
    FROM milestones
    GROUP BY project_id
) ms ON p.id = ms.project_id;

-- 1.3 v_project_tasks_detail
-- Purpose: Power the Task Board tab
CREATE OR REPLACE VIEW v_project_tasks_detail AS
SELECT 
    t.*,
    e.full_name AS assignee_name,
    e.role AS assignee_role,
    e.billable_rate AS assignee_billable_rate,
    e.cost_rate AS assignee_cost_rate,
    m.name AS milestone_name,
    COALESCE((SELECT SUM(hours) FROM timesheets WHERE task_id = t.id), 0) AS logged_hours,
    (t.actual_hours - t.estimated_hours) AS hours_variance,
    (t.deadline < CURRENT_DATE AND t.stage != 'done') AS is_overdue,
    (t.deadline - CURRENT_DATE) AS days_until_deadline
FROM project_tasks t
LEFT JOIN employees e ON t.employee_id = e.id
LEFT JOIN milestones m ON t.milestone_id::uuid = m.id;

-- 1.4 v_project_timesheets_detail
-- Purpose: Power the Timesheets tab
CREATE OR REPLACE VIEW v_project_timesheets_detail AS
SELECT 
    t.*,
    e.full_name AS employee_name,
    e.role AS employee_role,
    e.cost_rate AS employee_cost_rate,
    e.billable_rate AS employee_billable_rate,
    tk.name AS task_name,
    tk.stage AS task_stage,
    (t.hours * e.cost_rate) AS line_labor_cost,
    (t.billable_hours * e.billable_rate) AS line_billable_value,
    (t.writeoff_hours * e.billable_rate) AS line_writeoff_value,
    ((t.billable_hours * e.billable_rate) - (t.hours * e.cost_rate)) AS line_margin
FROM timesheets t
JOIN employees e ON t.employee_id = e.id
LEFT JOIN project_tasks tk ON t.task_id = tk.id;

-- 1.5 v_project_milestones_detail
-- Purpose: Power the Milestones tab
CREATE OR REPLACE VIEW v_project_milestones_detail AS
SELECT 
    m.*,
    (m.target_date - CURRENT_DATE) AS days_until_target,
    (m.target_date < CURRENT_DATE AND m.status != 'achieved') AS is_overdue,
    COALESCE((SELECT COUNT(*) FROM project_tasks WHERE milestone_id::text = m.id::text), 0) AS linked_tasks_count,
    COALESCE((SELECT COUNT(*) FROM project_tasks WHERE milestone_id::text = m.id::text AND stage = 'done'), 0) AS completed_tasks_count,
    (
        SELECT
            (
                (COUNT(*) FILTER (WHERE stage = 'done'))::float
                / NULLIF(COUNT(*), 0)
            ) * 100
        FROM project_tasks
        WHERE milestone_id::text = m.id::text
    )::double precision AS task_completion_pct
FROM milestones m;

-- 1.6 v_project_expenses_detail
-- Purpose: Power the Expenses section in Financials tab
CREATE OR REPLACE VIEW v_project_expenses_detail AS
SELECT 
    e.*,
    emp.full_name AS approver_name,
    CASE 
        WHEN e.category = 'travel' THEN 'Travel & Transport'
        WHEN e.category = 'software' THEN 'Software & Licenses'
        WHEN e.category = 'hardware' THEN 'Hardware & Equipment'
        WHEN e.category = 'meals' THEN 'Meals & Entertainment'
        ELSE COALESCE(e.category, 'Other')
    END AS category_label,
    (CURRENT_DATE - e.date) AS days_since
FROM expenses e
LEFT JOIN employees emp ON e.approved_by = emp.id;
