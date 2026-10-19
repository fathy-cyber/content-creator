-- UP
CREATE TYPE ab_test_winner AS ENUM ('a', 'b', 'none', 'pending');

CREATE TABLE funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id),
    org_id UUID NOT NULL,
    stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variant_a JSONB NOT NULL,
    variant_b JSONB NOT NULL,
    metric TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    org_id UUID NOT NULL,
    results JSONB DEFAULT '{}'::jsonb,
    winner ab_test_winner DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funnels are accessible by organization members" 
ON funnels FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "AB Tests are accessible by organization members" 
ON ab_tests FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_funnels_org_id ON funnels(org_id);
CREATE INDEX idx_funnels_campaign_id ON funnels(campaign_id);
CREATE INDEX idx_abtests_org_id ON ab_tests(org_id);
CREATE INDEX idx_abtests_campaign_id ON ab_tests(campaign_id);

-- DOWN
