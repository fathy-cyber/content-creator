-- ═══════════════════════════════════════════════════════════════
-- EXPENSES FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.approve_expense(p_expense_id UUID, p_manager_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE expenses
  SET approved_by = p_manager_id,
      updated_at = NOW()
  WHERE id = p_expense_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_expense(UUID, UUID) TO authenticated;
