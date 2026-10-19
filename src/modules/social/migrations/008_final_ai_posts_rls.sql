-- Phase 1.3: Final RLS Fix for ai_posts
-- Remove all previous policies and apply a single, permissive authenticated policy.

DROP POLICY IF EXISTS "Allow authenticated users to view posts" ON ai_posts;
DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON ai_posts;
DROP POLICY IF EXISTS "Allow creators to update their posts" ON ai_posts;
DROP POLICY IF EXISTS "Allow creators to delete their posts" ON ai_posts;

-- All operations allowed for any authenticated user
CREATE POLICY "Authenticated users full access" 
ON ai_posts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
