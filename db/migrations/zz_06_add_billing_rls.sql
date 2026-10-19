-- Add RLS Policies for Billing Tables
-- These policies allow authenticated users to manage billing data

BEGIN;

-- ==============================
-- Billing Sessions RLS
-- ==============================
ALTER TABLE billing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated manage billing sessions"
ON billing_sessions FOR ALL
USING (auth.role() IN ('authenticated', 'anon'))
WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- Billing Items RLS
-- ==============================
ALTER TABLE billing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated manage billing items"
ON billing_items FOR ALL
USING (auth.role() IN ('authenticated', 'anon'))
WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- Billing Session Events RLS
-- ==============================
ALTER TABLE billing_session_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated manage billing session events"
ON billing_session_events FOR ALL
USING (auth.role() IN ('authenticated', 'anon'))
WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- Grants (ensure table permissions exist)
-- ==============================
GRANT SELECT, INSERT, UPDATE, DELETE ON billing_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON billing_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON billing_session_events TO anon, authenticated;

COMMIT;
