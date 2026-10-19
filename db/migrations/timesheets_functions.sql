-- ═══════════════════════════════════════════════════════════════
-- TIMESHEETS FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.approve_timesheet(p_timesheet_id UUID, p_manager_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE timesheets
  SET status = 'approved',
      updated_at = NOW()
  WHERE id = p_timesheet_id 
    AND status = 'submitted';

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_timesheet(p_timesheet_id UUID, p_manager_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE timesheets
  SET status = 'rejected',
      updated_at = NOW()
  WHERE id = p_timesheet_id 
    AND status = 'submitted';

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_timesheet(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_timesheet(UUID, UUID) TO authenticated;
