BEGIN;

-- ══════════════════════════════════════════════════════════════
-- EMERGENCY EVENT STORE RLS FIX
-- ══════════════════════════════════════════════════════════════

-- 1. COMPLETELY DISABLE RLS
-- In an ERP, the event store is an append-only log. 
-- If RLS is causing critical data loss (42501), we disable it.
-- Security is then handled by the API layer and Service Role.
ALTER TABLE event_store DISABLE ROW LEVEL SECURITY;

-- 2. Ensure the service role can still operate
DROP POLICY IF EXISTS "Allow service role full access to event store" ON event_store;
CREATE POLICY "Allow service role full access to event store"
  ON event_store FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;
