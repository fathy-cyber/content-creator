-- 1. Types
CREATE TYPE public.asset_entity_type AS ENUM (
    'campaign','lead','brief','plan','post',
    'script','persona','template','repurpose_derivative'
);

CREATE TYPE public.asset_content_type AS ENUM (
    'post','ad_copy','product_description','sales_script',
    'email','whatsapp_template','landing_page',
    'persona','competitor_analysis','translation','repurposed'
);

DROP TYPE public.asset_status CASCADE;
CREATE TYPE public.asset_status AS ENUM (
    'draft','internal_review','client_review',
    'approved','published','archived','rejected'
);

-- 2. Main Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    -- FIXED: Reference the actual table crm_contacts instead of the view clients
    client_id       BIGINT REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    -- FIXED: Reference the actual table project_projects instead of the view projects
    project_id      BIGINT REFERENCES public.project_projects(id) ON DELETE SET NULL,
    entity_type     public.asset_entity_type,
    entity_id       TEXT,
    type            public.asset_content_type NOT NULL,
    platform        TEXT,
    title           TEXT NOT NULL,
    status          public.asset_status DEFAULT 'draft',
    language        TEXT DEFAULT 'en',
    parent_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Asset Versions Table
CREATE TABLE IF NOT EXISTS public.asset_versions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id         UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    version_number   INT NOT NULL,
    content          TEXT NOT NULL,
    diff_from_prev   TEXT,
    change_summary   TEXT,
    created_by       UUID REFERENCES auth.users(id),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, version_number)
);

-- 4. Asset Approvals Table
CREATE TABLE IF NOT EXISTS public.asset_approvals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    version_id  UUID REFERENCES public.asset_versions(id),
    stage       TEXT NOT NULL CHECK (stage IN (
                  'submitted','internal_review','client_review',
                  'approved','rejected','escalated'
                )),
    actor_id    UUID REFERENCES auth.users(id),
    comment     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Review Tokens Table
CREATE TABLE IF NOT EXISTS public.review_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    token       UUID UNIQUE DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tokens ENABLE ROW LEVEL SECURITY;

-- 7. Policies for Assets
CREATE POLICY "Assets viewable by workspace members" 
ON public.assets FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.workspaces WHERE id = public.assets.workspace_id AND owner_id = auth.uid()));

CREATE POLICY "Assets insertable by workspace members" 
ON public.assets FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()));

CREATE POLICY "Assets updatable by workspace members" 
ON public.assets FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.workspaces WHERE id = public.assets.workspace_id AND owner_id = auth.uid()));

CREATE POLICY "Assets deletable by workspace members" 
ON public.assets FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.workspaces WHERE id = public.assets.workspace_id AND owner_id = auth.uid()));

-- 8. Policies for Versions
CREATE POLICY "Versions viewable by workspace members" 
ON public.asset_versions FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.assets 
    WHERE id = public.asset_versions.asset_id 
    AND EXISTS (SELECT 1 FROM public.workspaces WHERE id = (SELECT workspace_id FROM public.assets WHERE id = public.asset_versions.asset_id) AND owner_id = auth.uid())
));

CREATE POLICY "Versions insertable by workspace members" 
ON public.asset_versions FOR INSERT TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.assets 
    WHERE id = asset_id 
    AND EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND created_by = auth.uid())
));

-- 9. Policies for Approvals
DROP POLICY IF EXISTS "Approvals viewable by workspace members" ON public.asset_approvals;
DROP POLICY IF EXISTS "Approvals insertable by workspace members" ON public.asset_approvals;

CREATE POLICY "Approvals viewable by workspace members" 
ON public.asset_approvals FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.assets 
    WHERE public.assets.id = public.asset_approvals.asset_id 
    AND EXISTS (SELECT 1 FROM public.workspaces WHERE public.workspaces.id = public.assets.workspace_id AND public.workspaces.owner_id = auth.uid())
));

CREATE POLICY "Approvals insertable by workspace members" 
ON public.asset_approvals FOR INSERT TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.assets 
    WHERE public.assets.id = asset_id 
    AND EXISTS (SELECT 1 FROM public.workspaces WHERE public.workspaces.id = public.assets.workspace_id AND public.workspaces.owner_id = auth.uid())
));

-- 10. Policies for Tokens
CREATE POLICY "Tokens viewable by authorized" 
ON public.review_tokens FOR SELECT TO authenticated 
USING (true);

-- 11. Trigger for updated_at
CREATE TRIGGER set_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- 12. INDEXES
CREATE INDEX idx_assets_workspace_id ON public.assets(workspace_id);
CREATE INDEX idx_assets_client_id ON public.assets(client_id);
CREATE INDEX idx_assets_project_id ON public.assets(project_id);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_entity ON public.assets(entity_type, entity_id);
CREATE INDEX idx_asset_versions_asset_id ON public.asset_versions(asset_id);
CREATE INDEX idx_asset_approvals_asset_id ON public.asset_approvals(asset_id);
CREATE INDEX idx_review_tokens_token ON public.review_tokens(token);