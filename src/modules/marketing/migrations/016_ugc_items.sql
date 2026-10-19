-- User Generated Content items table
CREATE TABLE IF NOT EXISTS ugc_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'manual',
  source_url TEXT,
  content_type TEXT NOT NULL DEFAULT 'review' CHECK (content_type IN ('review', 'testimonial', 'social_post', 'comment', 'mention', 'case_study', 'other')),
  content_text TEXT NOT NULL,
  author_name TEXT,
  author_handle TEXT,
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  key_themes JSONB DEFAULT '[]',
  suggested_tags JSONB DEFAULT '[]',
  marketing_use_cases JSONB DEFAULT '[]',
  quotable_snippet TEXT,
  recommended_format TEXT DEFAULT 'testimonial',
  approval_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ugc_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY ugc_items_org_isolation ON ugc_items
  USING (org_id = get_current_org_id());

CREATE INDEX idx_ugc_items_org ON ugc_items(org_id);
CREATE INDEX idx_ugc_items_status ON ugc_items(status);
CREATE INDEX idx_ugc_items_sentiment ON ugc_items(sentiment);
