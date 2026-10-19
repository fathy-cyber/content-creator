BEGIN;

-- ══════════════════════════════════════════════════════════════
-- GLOBAL AUDIT LOGGING
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type      TEXT        NOT NULL,   -- 'Invoice', 'Project', 'Contact'
  entity_id        TEXT        NOT NULL,   -- The record ID
  action           TEXT        NOT NULL,   -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'
  old_data         JSONB,                  -- State before change
  new_data         JSONB,                  -- State after change
  performed_by     UUID,                   -- The user who did it
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

COMMIT;
