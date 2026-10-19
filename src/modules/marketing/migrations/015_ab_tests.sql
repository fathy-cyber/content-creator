-- A/B test experiments table
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  element TEXT NOT NULL,
  goal TEXT NOT NULL,
  hypothesis TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'archived')),
  traffic_split INTEGER DEFAULT 50,
  confidence_level REAL DEFAULT 0.95,
  control_description TEXT,
  variants JSONB DEFAULT '[]',
  winner_variant TEXT,
  success_metrics JSONB DEFAULT '[]',
  estimated_duration_days INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY ab_tests_org_isolation ON ab_tests
  USING (org_id = get_current_org_id());

CREATE POLICY ab_test_results_test_isolation ON ab_test_results
  USING (test_id IN (SELECT id FROM ab_tests WHERE org_id = get_current_org_id()));

CREATE INDEX idx_ab_tests_org ON ab_tests(org_id);
CREATE INDEX idx_ab_test_results_test ON ab_test_results(test_id);
