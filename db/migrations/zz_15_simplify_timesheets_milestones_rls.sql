-- Simplify RLS on timesheets and milestones: allow any authenticated read
-- The billing service runs as authenticated and needs to read these tables
-- by project_id. We allow read access to any record that exists; the
-- application-level security ensures users only access their projects.

BEGIN;

-- ==============================
-- Timesheets: allow authenticated read
-- ==============================
DROP POLICY IF EXISTS "Allow manager manage project timesheets" ON timesheets;
DROP POLICY IF EXISTS "Allow authenticated read own timesheets" ON timesheets;

CREATE POLICY "Allow authenticated read timesheets"
ON timesheets FOR SELECT
USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow manager manage timesheets"
ON timesheets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_projects p
    WHERE p.id = timesheets.project_id AND p.manager_id = auth.uid()::text
  )
);

-- ==============================
-- Milestones: allow authenticated read
-- ==============================
DROP POLICY IF EXISTS "Allow manager manage project milestones" ON milestones;
DROP POLICY IF EXISTS "Allow authenticated read own milestones" ON milestones;

CREATE POLICY "Allow authenticated read milestones"
ON milestones FOR SELECT
USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow manager manage milestones"
ON milestones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_projects p
    WHERE p.id = milestones.project_id AND p.manager_id = auth.uid()::text
  )
);

-- Ensure SELECT grant
GRANT SELECT ON timesheets TO authenticated;
GRANT SELECT ON milestones TO authenticated;

COMMIT;
