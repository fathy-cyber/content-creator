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
CREATE POLICY "Personas are accessible by org" ON public.personas FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
