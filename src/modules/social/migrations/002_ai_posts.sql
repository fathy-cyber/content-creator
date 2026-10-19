-- Phase 1: 002_ai_posts.sql
-- Setup storage for AI generated content and approval workflow

CREATE TYPE post_status AS ENUM (
  'draft', 'in_review', 'approved', 'rejected',
  'scheduled', 'published', 'archived'
);

CREATE TABLE ai_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  platform social_platform NOT NULL,
  prompt_key TEXT NOT NULL,
  prompt_inputs JSONB NOT NULL,
  generated_content TEXT NOT NULL,
  hashtags TEXT[],
  media_urls TEXT[], -- Supabase Storage public URLs
  status post_status DEFAULT 'draft',
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Setup
ALTER TABLE ai_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view posts" 
ON ai_posts FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to create posts" 
ON ai_posts FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow creators to update their posts" 
ON ai_posts FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Allow creators to delete their posts" 
ON ai_posts FOR DELETE 
USING (created_by = auth.uid());

-- Indexes
CREATE INDEX idx_ai_posts_status ON ai_posts(status);
CREATE INDEX idx_ai_posts_platform ON ai_posts(platform);
CREATE INDEX idx_ai_posts_campaign_id ON ai_posts(campaign_id);
CREATE INDEX idx_ai_posts_scheduled_for ON ai_posts(scheduled_for);
CREATE INDEX idx_ai_posts_created_by ON ai_posts(created_by);

-- Trigger for updated_at
CREATE TRIGGER update_ai_posts_updated_at
    BEFORE UPDATE ON ai_posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

/*
-- DOWN Migration
DROP TRIGGER IF EXISTS update_ai_posts_updated_at ON ai_posts;
DROP TABLE IF EXISTS ai_posts;
DROP TYPE IF EXISTS post_status;
*/
