-- ═══════════════════════════════════════════════════════════════
-- EMPLOYEES SCHEMA
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- 1. Employee Role Enum
CREATE TYPE employee_role AS ENUM (
  'admin',
  'project_manager',
  'developer',
  'designer',
  'marketer',
  'consultant',
  'accountant'
);

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  role            employee_role NOT NULL DEFAULT 'developer',
  
  -- Financials for Revenue Governance
  billable_rate   NUMERIC(10,3) NOT NULL DEFAULT 0, -- Rate charged to clients (TND/hr)
  cost_rate       NUMERIC(10,3) NOT NULL DEFAULT 0, -- Internal cost to agency (TND/hr)
  
  department      TEXT,
  phone           TEXT,
  address         TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- 3. Indexes
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_active ON employees(is_active);

-- 4. Security Policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read employees" 
  ON employees FOR SELECT 
  USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow admin manage employees" 
  ON employees FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMIT;
