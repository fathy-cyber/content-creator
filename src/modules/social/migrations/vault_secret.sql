
-- Add telegram to the social_platform enum
ALTER TYPE social_platform ADD VALUE IF NOT EXISTS 'telegram';

-- Add wordpress to the social_platform enum
ALTER TYPE social_platform ADD VALUE IF NOT EXISTS 'wordpress';

-- CORRECTED: Wrapper to create a secret in the vault
CREATE OR REPLACE FUNCTION public.create_vault_secret(secret TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret_id TEXT;
BEGIN
  -- vault.create_secret returns the UUID of the created secret directly
  secret_id := vault.create_secret(secret);
  RETURN secret_id;
END;
$$;

-- Wrapper to delete a secret from the vault
CREATE OR REPLACE FUNCTION public.delete_vault_secret(secret_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM vault.delete_secret(secret_id);
END;
$$;