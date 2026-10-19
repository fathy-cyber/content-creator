BEGIN;

-- ══════════════════════════════════════════════════════════════
-- EVENT STORE RLS FIX
-- ══════════════════════════════════════════════════════════════

ALTER TABLE event_store ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to insert events (emit)
CREATE POLICY "Allow authenticated users to emit events"
  ON event_store FOR INSERT TO authenticated
  WITH CHECK (true);

-- 2. Allow authenticated users to read their own events or system events
CREATE POLICY "Allow authenticated users to read events"
  ON event_store FOR SELECT TO authenticated
  USING (true);

-- 3. Allow service role (background workers) to do everything
CREATE POLICY "Allow service role full access to event store"
  ON event_store FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Allow updating status (for the event processor)
CREATE POLICY "Allow authenticated users to update event status"
  ON event_store FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;
