ALTER TABLE public.users ADD COLUMN IF NOT EXISTS org_id UUID;

-- Backfill org_id for existing users from their default workspace
UPDATE public.users u
SET org_id = w.id
FROM public.workspaces w
WHERE w.owner_id = u.id
  AND u.org_id IS NULL;
