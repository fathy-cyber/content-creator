BEGIN;

SET LOCAL search_path = public;

-- ==============================
-- Timesheets
-- ==============================
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Drop (optional, but keeps behavior consistent)
DROP POLICY IF EXISTS "Allow authenticated full timesheets"
ON public.timesheets;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'timesheets'
      AND policyname = 'Allow authenticated full timesheets'
  ) THEN
    CREATE POLICY "Allow authenticated full timesheets"
    ON public.timesheets
    FOR ALL
    USING (auth.role() IN ('authenticated', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;
END $$;

GRANT ALL ON public.timesheets TO authenticated;

-- ==============================
-- Milestones
-- ==============================
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full milestones"
ON public.milestones;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'milestones'
      AND policyname = 'Allow authenticated full milestones'
  ) THEN
    CREATE POLICY "Allow authenticated full milestones"
    ON public.milestones
    FOR ALL
    USING (auth.role() IN ('authenticated', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;
END $$;

GRANT ALL ON public.milestones TO authenticated;

-- ==============================
-- Expenses
-- ==============================
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full expenses"
ON public.expenses;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'expenses'
      AND policyname = 'Allow authenticated full expenses'
  ) THEN
    CREATE POLICY "Allow authenticated full expenses"
    ON public.expenses
    FOR ALL
    USING (auth.role() IN ('authenticated', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;
END $$;

GRANT ALL ON public.expenses TO authenticated;

-- ==============================
-- Billing session events
-- ==============================
ALTER TABLE public.billing_session_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full billing_session_events"
ON public.billing_session_events;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'billing_session_events'
      AND policyname = 'Allow authenticated full billing_session_events'
  ) THEN
    CREATE POLICY "Allow authenticated full billing_session_events"
    ON public.billing_session_events
    FOR ALL
    USING (auth.role() IN ('authenticated', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;
END $$;

GRANT ALL ON public.billing_session_events TO authenticated;

-- ==============================
-- Billing items
-- ==============================
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full billing_items"
ON public.billing_items;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'billing_items'
      AND policyname = 'Allow authenticated full billing_items'
  ) THEN
    CREATE POLICY "Allow authenticated full billing_items"
    ON public.billing_items
    FOR ALL
    USING (auth.role() IN ('authenticated', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;
END $$;

GRANT ALL ON public.billing_items TO authenticated;

-- ==============================
-- Billing sessions
-- ==============================
ALTER TABLE public.billing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full billing_sessions"
ON public.billing_sessions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'billing_sessions'
      AND policyname = 'Allow authenticated full billing_sessions'
  ) THEN
    CREATE POLICY "Allow authenticated full billing_sessions"
    ON public.billing_sessions
    FOR ALL
    USING (auth.role() IN ('authenticated', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;
END $$;

GRANT ALL ON public.billing_sessions TO authenticated;

COMMIT;
