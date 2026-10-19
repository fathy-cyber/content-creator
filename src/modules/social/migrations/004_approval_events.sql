-- Phase 1: 004_approval_events.sql
-- Audit trail for post approvals and escalations

CREATE TYPE approval_action AS ENUM (
  'submitted', 'approved', 'rejected', 'escalated', 'expired'
);

CREATE TABLE approval_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_post_id UUID NOT NULL REFERENCES ai_posts(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action approval_action NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Setup
ALTER TABLE approval_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view approval events" 
ON approval_events FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to create approval events" 
ON approval_events FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_approval_events_ai_post_id ON approval_events(ai_post_id);
CREATE INDEX idx_approval_events_actor_id ON approval_events(actor_id);
CREATE INDEX idx_approval_events_action ON approval_events(action);

/*
-- DOWN Migration
DROP TABLE IF EXISTS approval_events;
DROP TYPE IF EXISTS approval_action;
*/
