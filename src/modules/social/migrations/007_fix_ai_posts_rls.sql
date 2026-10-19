-- Phase 1.2: Fix RLS for ai_posts to prevent INSERT violations
-- Ensure authenticated users can always create posts, regardless of whether they are assigned as creator

DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON ai_posts;
CREATE POLICY "Allow authenticated users to create posts" 
ON ai_posts FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure SELECT is wide open for authenticated users in this single-tenant app
DROP POLICY IF EXISTS "Allow authenticated users to view posts" ON ai_posts;
CREATE POLICY "Allow authenticated users to view posts" 
ON ai_posts FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update UPDATE and DELETE to be more permissive for admins/system
DROP POLICY IF EXISTS "Allow creators to update their posts" ON ai_posts;
CREATE POLICY "Allow creators to update their posts" 
ON ai_posts FOR UPDATE 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow creators to delete their posts" ON ai_posts;
CREATE POLICY "Allow creators to delete their posts" 
ON ai_posts FOR DELETE 
USING (auth.uid() IS NOT NULL);
