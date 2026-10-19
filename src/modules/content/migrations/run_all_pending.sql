-- ============================================================
-- Run this entire script in Supabase Dashboard > SQL Editor
-- Paste and click "Run" — all statements use IF NOT EXISTS / DROP IF EXISTS so it's safe to re-run.
-- ============================================================

-- 1. Content Hub tables

CREATE TABLE IF NOT EXISTS public.personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age_range TEXT,
    job_title TEXT,
    pain_points TEXT[] DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',
    objections TEXT[] DEFAULT '{}',
    preferred_channels TEXT[] DEFAULT '{}',
    language_style TEXT,
    buying_triggers TEXT[] DEFAULT '{}',
    org_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Personas are accessible by org" ON public.personas;
CREATE POLICY "Personas are accessible by org" ON public.personas FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    prompt_key TEXT NOT NULL,
    default_inputs JSONB DEFAULT '{}',
    category TEXT,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    org_id UUID NOT NULL
);

ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Templates are accessible by org" ON public.content_templates;
CREATE POLICY "Templates are accessible by org" ON public.content_templates FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT '',
    ad_library_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Competitors are accessible by org" ON public.competitors;
CREATE POLICY "Competitors are accessible by org" ON public.competitors FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));


