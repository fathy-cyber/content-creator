-- 001_erp_enhancements.sql
-- This migration enhances existing ERP tables to support Supabase enterprise features
-- without breaking legacy ERP module compatibility.

-- 1. Enhance CRM Contacts (The source for 'clients')
ALTER TABLE public.crm_contacts 
    ADD COLUMN IF NOT EXISTS industry TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Enhance Project Projects (The source for 'projects')
ALTER TABLE public.project_projects 
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 3. Enhance Marketing Assets
ALTER TABLE public.marketing_assets 
    ADD COLUMN IF NOT EXISTS project_id BIGINT REFERENCES public.project_projects(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS client_id BIGINT REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS entity_type TEXT,
    ADD COLUMN IF NOT EXISTS entity_id UUID,
    ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS parent_asset_id UUID REFERENCES public.marketing_assets(id) ON DELETE SET NULL;
