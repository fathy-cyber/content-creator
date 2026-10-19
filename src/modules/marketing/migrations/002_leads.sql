-- UP
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

CREATE TABLE marketing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    source TEXT,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    org_id UUID NOT NULL,
    score INT DEFAULT 0,
    status lead_status DEFAULT 'new',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads are accessible by organization members" 
ON marketing_leads FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_leads_org_id ON marketing_leads(org_id);
CREATE INDEX idx_leads_email ON marketing_leads(email);
CREATE INDEX idx_leads_campaign_id ON marketing_leads(campaign_id);
CREATE INDEX idx_leads_status ON marketing_leads(status);

-- DOWN
