-- 003_compatibility_views.sql
-- This migration creates compatibility views so new modules can use 
-- 'clients' and 'projects' names while the data stays in ERP tables.

-- 1. Clients View (Maps to crm_contacts)
DROP TABLE IF EXISTS public.clients CASCADE;
DROP VIEW IF EXISTS public.clients CASCADE;

CREATE VIEW public.clients AS
SELECT
  id,
  name,
  industry,
  website,
  logo_url,
  metadata,
  created_by,
  created_at,
  updated_at
FROM public.crm_contacts
WHERE type = 'company';

-- 2. Projects View (Maps to project_projects)
DROP TABLE IF EXISTS public.projects CASCADE;
DROP VIEW IF EXISTS public.projects CASCADE;

CREATE VIEW public.projects AS
SELECT
  id,
  name,
  description,
  status,
  start_date,
  end_date,
  customer_id as client_id,
  metadata,
  created_by,
  created_at,
  updated_at
FROM public.project_projects;
