-- UP
CREATE TABLE scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    field TEXT NOT NULL,
    operator TEXT NOT NULL CHECK (operator IN ('equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'exists', 'not_exists', 'regex')),
    value TEXT DEFAULT '',
    points INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE scoring_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES marketing_leads(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES scoring_rules(id) ON DELETE SET NULL,
    rule_name TEXT,
    points INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scoring rules are accessible by organization members"
ON scoring_rules FOR ALL
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Scoring history is accessible by organization members"
ON scoring_history FOR ALL
USING (lead_id IN (SELECT id FROM marketing_leads WHERE org_id = (SELECT org_id FROM users WHERE id = auth.uid())))
WITH CHECK (lead_id IN (SELECT id FROM marketing_leads WHERE org_id = (SELECT org_id FROM users WHERE id = auth.uid())));

CREATE INDEX idx_scoring_rules_org_id ON scoring_rules(org_id);
CREATE INDEX idx_scoring_rules_active ON scoring_rules(is_active);
CREATE INDEX idx_scoring_history_lead_id ON scoring_history(lead_id);
CREATE INDEX idx_scoring_history_created_at ON scoring_history(created_at);

-- DOWN
DROP TABLE IF EXISTS scoring_history;
DROP TABLE IF EXISTS scoring_rules;
