-- Wrapper to retrieve a secret from the vault
CREATE OR REPLACE FUNCTION public.get_vault_secret(secret_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  decrypted_secret TEXT;
BEGIN
  -- Use vault.decrypted_secrets view to get the secret
  SELECT decrypted_secret INTO decrypted_secret
  FROM vault.decrypted_secrets
  WHERE id = secret_id;

  RETURN decrypted_secret;
END;
$$;
