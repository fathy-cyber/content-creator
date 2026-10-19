BEGIN;

-- ══════════════════════════════════════════════════════════════
-- EVENT STORE RLS FINAL FIX
-- ══════════════════════════════════════════════════════════════

-- Reset RLS to ensure a clean state
ALTER TABLE event_store DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_store ENABLE ROW LEVEL SECURITY;

-- 1. Allow BOTH authenticated and anon users to emit events.
-- This ensures that events fired during onboarding or before 
-- the session is fully recognized are still persisted.
DROP POLICY IF EXISTS "Allow authenticated users to emit events" ON event_store;
CREATE POLICY "Allow all users to emit events"
  ON event_store FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- 2. Allow read access for all authenticated users.
DROP POLICY IF EXISTS "Allow authenticated users to read events" ON event_store;
CREATE POLICY "Allow authenticated users to read events"
  ON event_store FOR SELECT 
  TO authenticated
  USING (true);

-- 3. Allow status updates (used by the PersistentEventBus processor).
DROP POLICY IF EXISTS "Allow authenticated users to update event status" ON event_store;
CREATE POLICY "Allow authenticated users to update event status"
  ON event_store FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Service role bypass (Critical for background workers)
DROP POLICY IF EXISTS "Allow service role full access to event store" ON event_store;
CREATE POLICY "Allow service role full access to event store"
  ON event_store FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;
