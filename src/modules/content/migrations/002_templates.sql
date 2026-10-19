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
CREATE POLICY "Templates are accessible by org" ON public.content_templates FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
