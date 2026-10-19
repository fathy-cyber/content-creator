-- Phase 1: 001_social_accounts.sql
-- Setup social media account linkages and Vault references

CREATE TYPE social_platform AS ENUM (
  'linkedin', 'facebook', 'instagram', 'x', 'tiktok', 'youtube'
);

CREATE TYPE account_status AS ENUM (
  'active', 'expired', 'revoked', 'error'
);

CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform social_platform NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL, -- platform internal ID
  vault_access_id TEXT NOT NULL, -- Supabase Vault secret ID
  vault_refresh_id TEXT, -- Supabase Vault secret ID
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  status account_status DEFAULT 'active',
  connected_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, account_id)
);

-- RLS Setup
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view connected accounts (for the single-tenant agency)
CREATE POLICY "Allow authenticated users to read social accounts" 
ON social_accounts FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Writes are handled via service_role or app-level admin checks in service layer
-- To allow admins to write via API if needed:
-- CREATE POLICY "Allow admins to manage social accounts" 
-- ON social_accounts FOR ALL 
-- USING (auth.jwt() -> 'role' = 'admin');

-- Indexes
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_status ON social_accounts(status);
CREATE INDEX idx_social_accounts_connected_by ON social_accounts(connected_by);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

/*
-- DOWN Migration
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS social_accounts;
DROP TYPE IF EXISTS account_status;
DROP TYPE IF EXISTS social_platform;
*/
