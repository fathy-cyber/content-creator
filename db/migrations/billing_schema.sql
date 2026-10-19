-- ═══════════════════════════════════════════════════════════════
-- BILLING SCHEMA
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- 1. Enums
CREATE TYPE billing_model AS ENUM (
  'time_and_material',
  'fixed_price',
  'milestone',
  'hybrid'
);

CREATE TYPE project_billing_status AS ENUM (
  'not_started',        -- project not yet completed
  'pending_review',     -- project done, awaiting billing review
  'in_review',          -- billing session opened by manager
  'approved',           -- billing review approved, ready to invoice
  'invoiced',           -- invoice generated
  'partially_invoiced', -- some milestones invoiced, more pending
  'written_off'         -- project completed, no invoice (pro-bono etc.)
);

CREATE TYPE billing_item_source AS ENUM (
  'timesheet',    -- T&M: hours logged
  'task',         -- T&M: flat task cost
  'milestone',    -- Milestone billing
  'expense',      -- Reimbursable expense
  'fixed',        -- Fixed price line
  'retainer',     -- Monthly retainer base
  'adjustment',   -- Manual adjustment (discount / surcharge)
  'writeoff'      -- Written off (reduces billable amount)
);

-- 2. Extend Projects
ALTER TABLE project_projects
  ADD COLUMN IF NOT EXISTS billing_model billing_model NOT NULL DEFAULT 'time_and_material',
  ADD COLUMN IF NOT EXISTS billing_status project_billing_status NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS retainer_amount NUMERIC(12,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_reviewed_by UUID REFERENCES employees(id),
  ADD COLUMN IF NOT EXISTS billing_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_notes TEXT;

-- 3. Billing Sessions
CREATE TABLE IF NOT EXISTS billing_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sales_order_id  UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  reviewed_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','rejected','cancelled')),
  billing_model   billing_model NOT NULL,
  gross_amount    NUMERIC(12,3) NOT NULL DEFAULT 0,
  adjustments     NUMERIC(12,3) NOT NULL DEFAULT 0,
  net_amount      NUMERIC(12,3) NOT NULL DEFAULT 0,
  currency        CHAR(3)       NOT NULL DEFAULT 'TND',
  review_notes    TEXT,
  approved_at     TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_billing_sessions_project ON billing_sessions(project_id);
CREATE INDEX idx_billing_sessions_status ON billing_sessions(status) WHERE deleted_at IS NULL;

-- 4. Billing Items
CREATE TABLE IF NOT EXISTS billing_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_session_id  UUID NOT NULL REFERENCES billing_sessions(id) ON DELETE CASCADE,
  source_type         billing_item_source NOT NULL,
  task_id             BIGINT REFERENCES tasks(id)        ON DELETE SET NULL,
  timesheet_id        UUID REFERENCES timesheets(id)   ON DELETE SET NULL,
  milestone_id        UUID REFERENCES milestones(id)   ON DELETE SET NULL,
  expense_id          UUID REFERENCES expenses(id)     ON DELETE SET NULL,
  description         TEXT NOT NULL,
  quantity            NUMERIC(10,4) DEFAULT 0,
  unit_price          NUMERIC(12,3) DEFAULT 0,
  amount              NUMERIC(12,3) DEFAULT 0,
  original_quantity   NUMERIC(10,4) DEFAULT 0,
  original_unit_price NUMERIC(12,3) DEFAULT 0,
  original_amount     NUMERIC(12,3) DEFAULT 0,
  adjustment_reason   TEXT DEFAULT '',
  is_billable         BOOLEAN NOT NULL DEFAULT TRUE,
  is_written_off      BOOLEAN NOT NULL DEFAULT FALSE,
  writeoff_reason     TEXT DEFAULT '',
  is_billed           BOOLEAN NOT NULL DEFAULT FALSE,
  billed_at           TIMESTAMPTZ DEFAULT NULL,
  invoice_line_item_id UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_items_session ON billing_items(billing_session_id);
CREATE INDEX idx_billing_items_task ON billing_items(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_billing_items_timesheet ON billing_items(timesheet_id) WHERE timesheet_id IS NOT NULL;
CREATE INDEX idx_billing_items_milestone ON billing_items(milestone_id) WHERE milestone_id IS NOT NULL;
CREATE INDEX idx_billing_items_billed ON billing_items(is_billed, billing_session_id);

-- 5. Extend Tasks
ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS is_billable      BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_billed        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS billed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_rate     NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS writeoff_hours   NUMERIC(8,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_item_id  UUID REFERENCES billing_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS timesheet_id     UUID REFERENCES timesheets(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS milestone_id     UUID REFERENCES milestones(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expense_id       UUID REFERENCES expenses(id)      ON DELETE SET NULL;


-- 6. Extend Timesheets
ALTER TABLE timesheets
  ADD COLUMN IF NOT EXISTS is_billed    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS billed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS writeoff_hours NUMERIC(8,3) DEFAULT 0;

-- 7. Extend Invoice Line Items
ALTER TABLE billing_items
  ADD CONSTRAINT fk_billing_items_invoice_line
  FOREIGN KEY (task_id)
  REFERENCES project_tasks(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

-- 9. Billing Session Audit Log
CREATE TABLE IF NOT EXISTS billing_session_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_session_id  UUID NOT NULL REFERENCES billing_sessions(id) ON DELETE CASCADE,
  billing_item_id     UUID REFERENCES billing_items(id)    ON DELETE SET NULL,
  event_type          TEXT NOT NULL,
  performed_by        UUID REFERENCES employees(id),
  old_value           JSONB,
  new_value           JSONB,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_events_session ON billing_session_events(billing_session_id, created_at DESC);

COMMIT;
