-- Fix all FOR ALL USING policies missing WITH CHECK (blocks INSERT)

DROP POLICY IF EXISTS "Leads are accessible by organization members" ON marketing_leads;
CREATE POLICY "Leads are accessible by organization members" ON marketing_leads FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Assets are accessible by organization members" ON marketing_assets;
CREATE POLICY "Assets are accessible by organization members" ON marketing_assets FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Segments are accessible by organization members" ON audience_segments;
CREATE POLICY "Segments are accessible by organization members" ON audience_segments FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Funnels are accessible by organization members" ON funnels;
CREATE POLICY "Funnels are accessible by organization members" ON funnels FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "AB Tests are accessible by organization members" ON ab_tests;
CREATE POLICY "AB Tests are accessible by organization members" ON ab_tests FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Touchpoints are accessible by organization members" ON touchpoints;
CREATE POLICY "Touchpoints are accessible by organization members" ON touchpoints FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Campaign plans are accessible by organization members" ON campaign_plans;
CREATE POLICY "Campaign plans are accessible by organization members" ON campaign_plans FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Content module tables (public schema)
DROP POLICY IF EXISTS "Personas are accessible by org" ON public.personas;
CREATE POLICY "Personas are accessible by org" ON public.personas FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Templates are accessible by org" ON public.content_templates;
CREATE POLICY "Templates are accessible by org" ON public.content_templates FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Competitors are accessible by org" ON public.competitors;
CREATE POLICY "Competitors are accessible by org" ON public.competitors FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
