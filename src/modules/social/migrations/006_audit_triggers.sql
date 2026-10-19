-- Phase 9: Security & Integrity Audit
-- Ensuring updated_at triggers are present on all mutable tables.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all mutable social tables
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_posts_updated_at ON ai_posts;
CREATE TRIGGER update_ai_posts_updated_at
    BEFORE UPDATE ON ai_posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_publish_jobs_updated_at ON publish_jobs;
CREATE TRIGGER update_publish_jobs_updated_at
    BEFORE UPDATE ON publish_jobs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
