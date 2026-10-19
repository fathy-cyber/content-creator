-- ═══════════════════════════════════════════════════════════════
-- EMPLOYEES FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_employee_rate(p_employee_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  SELECT billable_rate INTO v_rate
  FROM employees
  WHERE id = p_employee_id
    AND is_active = TRUE;
    
  RETURN COALESCE(v_rate, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_employee_rate(UUID) TO anon, authenticated;
