-- 002_enterprise_modules.sql
-- New system-level tables for Enterprise features (Audit, Events, RBAC, Brand Voice)
-- All tables are configured for a single-tenant agency (no workspace_id).

-- =============================================================================
-- 1. Brand Voice Management
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brand_voices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           BIGINT REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    tone_descriptors    TEXT[] DEFAULT '{}',
    forbidden_words     TEXT[] DEFAULT '{}',
    value_propositions  TEXT[] DEFAULT '{}',
    example_copy        TEXT,
    target_audience     TEXT,
    is_default          BOOLEAN DEFAULT false,
    created_by          UUID REFERENCES auth.users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. Event Store
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE public.event_status AS ENUM ('pending','delivered','failed','dead');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.events (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name     TEXT NOT NULL,
    payload        JSONB NOT NULL DEFAULT '{}',
    source_module  TEXT NOT NULL,
    status         public.event_status DEFAULT 'pending',
    retry_count    INT DEFAULT 0,
    error          TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    delivered_at   TIMESTAMPTZ,
    next_retry_at  TIMESTAMPTZ
);

-- =============================================================================
-- 3. Business Audit Log
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id     UUID REFERENCES auth.users(id),
    action       TEXT NOT NULL,
    entity_type  TEXT NOT NULL,
    entity_id    TEXT, -- TEXT to support both BIGINT and UUID legacy IDs
    before       JSONB,
    after        JSONB,
    ip_address   TEXT,
    user_agent   TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. RBAC (Role Based Access Control)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    description  TEXT,
    is_system    BOOLEAN DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id     UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    module      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    action      TEXT NOT NULL,
    conditions  JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    client_id   BIGINT REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    granted_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id, client_id)
);
