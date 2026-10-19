-- UP
CREATE TABLE audience_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    org_id UUID NOT NULL,
    filters JSONB NOT NULL DEFAULT '[]'::jsonb,
    lead_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Segments are accessible by organization members" 
ON audience_segments FOR ALL 
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_segments_org_id ON audience_segments(org_id);


