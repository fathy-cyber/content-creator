BEGIN;

-- ══════════════════════════════════════════════════════════════
-- ROLES & PERMISSIONS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS roles (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT  NOT NULL UNIQUE,   -- 'admin','manager','sales_rep','accountant'
  description TEXT,
  is_system   BOOLEAN DEFAULT FALSE,   -- system roles cannot be deleted
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  resource    TEXT  NOT NULL,   -- 'invoices','projects','clients'
  action      TEXT  NOT NULL,   -- 'create','read','update','delete','approve'
  description TEXT,
  UNIQUE (resource, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id     UUID NOT NULL,   -- references auth.users
  role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by  UUID,
  granted_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,     -- temporary role support
  PRIMARY KEY (user_id, role_id)
);

-- ── Seed system roles ─────────────────────────────────────────
INSERT INTO roles (name, description, is_system) VALUES
  ('admin',      'Full system access',                    TRUE),
  ('manager',    'Manage projects, approve billing',      TRUE),
  ('sales_rep',  'Manage CRM, create orders',             TRUE),
  ('accountant', 'Manage invoices and payments',          TRUE),
  ('support',    'Manage support tickets',                TRUE),
  ('viewer',     'Read-only access to all modules',       TRUE)
ON CONFLICT (name) DO NOTHING;

-- ── Seed permissions ──────────────────────────────────────────
INSERT INTO permissions (resource, action) VALUES
  -- Invoices
  ('invoices',  'create'),  ('invoices',  'read'),
  ('invoices',  'update'),  ('invoices',  'delete'),
  ('invoices',  'approve'), ('invoices',  'send'),
  -- Projects
  ('projects',  'create'),  ('projects',  'read'),
  ('projects',  'update'),  ('projects',  'delete'),
  ('projects',  'complete'),
  -- Billing
  ('billing',   'read'),    ('billing',   'adjust'),
  ('billing',   'approve'), ('billing',   'writeoff'),
  -- Clients
  ('clients',   'create'),  ('clients',  'read'),
  ('clients',   'update'),  ('clients',  'delete'),
  -- Orders
  ('orders',    'create'),  ('orders',    'read'),
  ('orders',    'confirm'), ('orders',    'cancel'),
  -- Tickets
  ('tickets',   'create'),  ('tickets',   'read'),
  ('tickets',   'assign'),  ('tickets',   'resolve')
ON CONFLICT (resource, action) DO NOTHING;

-- ── Assign permissions to roles ───────────────────────────────
-- Admin: everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE  r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Manager: projects + billing + read-all
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE  r.name = 'manager'
  AND (
    (p.resource = 'projects')
    OR (p.resource = 'billing')
    OR (p.resource IN ('invoices','clients','orders','tickets') AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;

-- Accountant: invoices + billing read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE  r.name = 'accountant'
  AND (
    p.resource = 'invoices'
    OR (p.resource = 'billing' AND p.action = 'read')
    OR (p.resource = 'clients' AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;

-- Sales Rep: clients + orders
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE  r.name = 'sales_rep'
  AND p.resource IN ('clients', 'orders')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- DB FUNCTION: Check permission (used in RLS policies)
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION has_permission(
  p_user_id  UUID,
  p_resource TEXT,
  p_action   TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE   -- result is stable within a transaction
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM   user_roles       ur
    JOIN   role_permissions rp ON rp.role_id       = ur.role_id
    JOIN   permissions      p  ON p.id             = rp.permission_id
    WHERE  ur.user_id    = p_user_id
      AND  p.resource    = p_resource
      AND  p.action      = p_action
      AND  (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES using has_permission()
-- ══════════════════════════════════════════════════════════════

-- Invoices RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_read"   ON invoices;
DROP POLICY IF EXISTS "invoices_write"  ON invoices;
DROP POLICY IF EXISTS "invoices_delete" ON invoices;

CREATE POLICY "invoices_read"
  ON invoices FOR SELECT TO authenticated
  USING (has_permission(auth.uid(), 'invoices', 'read'));

CREATE POLICY "invoices_write"
  ON invoices FOR INSERT TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'invoices', 'create'));

CREATE POLICY "invoices_update"
  ON invoices FOR UPDATE TO authenticated
  USING (has_permission(auth.uid(), 'invoices', 'update'));

-- Billing Sessions RLS
ALTER TABLE billing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_read"
  ON billing_sessions FOR SELECT TO authenticated
  USING (has_permission(auth.uid(), 'billing', 'read'));

CREATE POLICY "billing_write"
  ON billing_sessions FOR ALL TO authenticated
  USING (has_permission(auth.uid(), 'billing', 'approve'));

-- Service role bypasses all RLS (for background jobs)
CREATE POLICY "service_role_bypass_invoices"
  ON invoices FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_bypass_billing"
  ON billing_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
