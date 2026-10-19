-- UP
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    org_id UUID NOT NULL,
    status campaign_status DEFAULT 'draft',
    budget NUMERIC(15, 2) DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    channels JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaigns are accessible by organization members" 
ON campaigns FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

