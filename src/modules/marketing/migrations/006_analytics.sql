-- UP
CREATE TABLE touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES marketing_leads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    channel TEXT NOT NULL,
    source TEXT,
    medium TEXT,
    utm_campaign TEXT,
    page_url TEXT,
    event_type TEXT NOT NULL,
    org_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE campaign_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    budget_allocation JSONB NOT NULL DEFAULT '{}'::jsonb,
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Touchpoints are accessible by organization members" 
ON touchpoints FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Campaign plans are accessible by organization members" 
ON campaign_plans FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_touchpoints_org_id ON touchpoints(org_id);
CREATE INDEX idx_touchpoints_lead_id ON touchpoints(lead_id);
CREATE INDEX idx_touchpoints_campaign_id ON touchpoints(campaign_id);
CREATE INDEX idx_plans_org_id ON campaign_plans(org_id);
CREATE INDEX idx_plans_campaign_id ON campaign_plans(campaign_id);

