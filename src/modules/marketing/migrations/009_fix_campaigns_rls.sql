DROP POLICY IF EXISTS "Campaigns are accessible by organization members" ON campaigns;

CREATE POLICY "Campaigns are accessible by organization members"
ON campaigns FOR ALL
USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
