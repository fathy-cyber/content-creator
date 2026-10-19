-- SEO meta pages & tags table
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  page_title TEXT,
  page_content TEXT,
  primary_keyword TEXT,
  secondary_keywords JSONB DEFAULT '[]',
  generated_tags JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY seo_pages_org_isolation ON seo_pages
  USING (org_id = get_current_org_id());

CREATE INDEX idx_seo_pages_org ON seo_pages(org_id);
CREATE INDEX idx_seo_pages_url ON seo_pages(url);
