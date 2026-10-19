-- UP
CREATE TYPE asset_type AS ENUM ('post', 'ad_copy', 'product_description', 'sales_script', 'email', 'whatsapp_template');
CREATE TYPE asset_status AS ENUM ('draft', 'approved', 'published', 'archived');

CREATE TABLE marketing_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    type asset_type NOT NULL,
    platform TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tone TEXT,
    created_by UUID REFERENCES auth.users(id),
    org_id UUID NOT NULL,
    status asset_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assets are accessible by organization members" 
ON marketing_assets FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_assets_org_id ON marketing_assets(org_id);
CREATE INDEX idx_assets_campaign_id ON marketing_assets(campaign_id);
CREATE INDEX idx_assets_type ON marketing_assets(type);

-- DOWN
DROP INDEX idx_assets_org_id;
DROP INDEX idx_assets_campaign_id;
DROP INDEX idx_assets_type;
DROP POLICY "Assets are accessible by organization members" ON marketing_assets;
DROP TABLE marketing_assets;
DROP TYPE asset_type;
DROP TYPE asset_status;
