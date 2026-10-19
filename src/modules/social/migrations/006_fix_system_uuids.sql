-- Phase 1.1: Fix UUID constraints for system actions
-- Make created_by and actor_id nullable to allow system-generated entries

ALTER TABLE ai_posts ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE approval_events ALTER COLUMN actor_id DROP NOT NULL;

-- Update RLS to handle nullable created_by
DROP POLICY IF EXISTS "Allow creators to update their posts" ON ai_posts;
CREATE POLICY "Allow creators to update their posts" 
ON ai_posts FOR UPDATE 
USING (created_by = auth.uid() OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow creators to delete their posts" ON ai_posts;
CREATE POLICY "Allow creators to delete their posts" 
ON ai_posts FOR DELETE 
USING (created_by = auth.uid() OR created_by IS NULL);
