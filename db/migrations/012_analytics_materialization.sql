BEGIN;

-- ══════════════════════════════════════════════════════════════
-- ANALYTICS MATERIALIZATION
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS analytics_kpis (
  kpi_name     TEXT PRIMARY KEY,
  value        NUMERIC NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION materialize_kpis()
RETURNS VOID AS $$
DECLARE
  v_cac NUMERIC;
  v_utilization NUMERIC;
  v_start_date DATE := '2026-01-01';
  v_end_date DATE := CURRENT_DATE;
BEGIN
  -- 1. Calculate CAC: (Marketing Spend) / (New Customers)
  SELECT 
    COALESCE(SUM(actual_spend), 0) / 
    NULLIF((SELECT count(*) FROM crm_contacts WHERE category = 'customer' AND created_at >= v_start_date AND created_at <= v_end_date), 0)
  INTO v_cac
  FROM marketing_campaigns
  WHERE "startDate" >= v_start_date AND "endDate" <= v_end_date;

  -- 2. Calculate Utilization: (Actual Hours / Available Hours) * 100
  -- Available = 10 employees * 160h = 1600h
  SELECT 
    (COALESCE(SUM(actual_hours), 0) / 1600.0) * 100
  INTO v_utilization
  FROM project_tasks
  WHERE updated_at >= v_start_date AND updated_at <= v_end_date;

  -- 3. Upsert into KPI table
  INSERT INTO analytics_kpis (kpi_name, value, updated_at)
  VALUES 
    ('CAC', COALESCE(v_cac, 0), NOW()),
    ('ResourceUtilization', COALESCE(v_utilization, 0), NOW())
  ON CONFLICT (kpi_name) DO UPDATE 
  SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

END;
$$ LANGUAGE plpgsql;

COMMIT;
