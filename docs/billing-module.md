# Enterprise-Grade Project → Invoice Billing Architecture

## 🧠 Conceptual Foundation First

```
THE CORE PROBLEM:
─────────────────────────────────────────────────────────────────
A "completed project" and a "billable invoice" are NOT the same thing.

Project Domain  = "Did we deliver the work?"  (effort, tasks, hours)
Invoice Domain  = "What do we charge?"         (money, legal document)

The GAP between them is the BILLING REVIEW PHASE.
This gap is where business decisions happen:
  - "Write off 3h because client was unhappy"
  - "Charge the fixed price, not actual hours"
  - "Add a 10% discount for loyalty"
  - "Split into 2 invoices (deposit + final)"

Enterprise systems ALWAYS model this gap explicitly.
─────────────────────────────────────────────────────────────────
```

---

## 🗺️ Complete Domain Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BILLING DOMAIN MAP                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PROJECT DOMAIN              BILLING DOMAIN        INVOICE DOMAIN   │
│  ─────────────               ──────────────        ──────────────   │
│                                                                     │
│  ┌──────────┐               ┌──────────────┐      ┌─────────────┐  │
│  │  Tasks   │──billable?───►│   Billing    │      │   Invoice   │  │
│  ├──────────┤               │   Session    │─────►├─────────────┤  │
│  │Timesheets│──hours────────├──────────────┤      │Line Items   │  │
│  ├──────────┤               │Billing Items │      │(immutable)  │  │
│  │Milestones│──triggered────├──────────────┤      └─────────────┘  │
│  ├──────────┤               │  Adjustments │                        │
│  │ Expenses │──costs────────├──────────────┤                        │
│  └──────────┘               │  Writeoffs   │                        │
│                             └──────────────┘                        │
│                                    ▲                                │
│                             Manager Review                          │
│                             (The Business Gap)                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Billing Models: Full Specification

```
┌─────────────────────────────────────────────────────────────────────┐
│ MODEL 1: TIME & MATERIAL (T&M)                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Source of truth: Approved timesheets + expenses                     │
│ Price formula:   Σ(billable_hours × employee_rate) + expenses       │
│ Invoice trigger: Manual (after billing review)                      │
│ Write-offs:      Common (8h logged → 6h billed)                    │
│ Example:         Dev project, consulting engagement                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MODEL 2: FIXED PRICE                                                │
├─────────────────────────────────────────────────────────────────────┤
│ Source of truth: Original sales order line items                    │
│ Price formula:   Agreed price (regardless of actual hours)          │
│ Invoice trigger: Project completion or milestone                    │
│ Write-offs:      N/A (price is fixed)                              │
│ Billing review:  Still needed (verify deliverables, add extras)    │
│ Example:         Website build for $5,000                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MODEL 3: MILESTONE-BASED                                            │
├─────────────────────────────────────────────────────────────────────┤
│ Source of truth: Milestone definitions + completion status          │
│ Price formula:   Pre-agreed amount per milestone                    │
│ Invoice trigger: Milestone marked as reached                        │
│ Write-offs:      Per milestone negotiation                         │
│ Example:         30% on kickoff, 40% mid, 30% delivery             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MODEL 4: HYBRID (Retainer + T&M)                                    │
├─────────────────────────────────────────────────────────────────────┤
│ Source of truth: Base retainer (fixed) + overflow hours (T&M)      │
│ Price formula:   base_fee + Σ(extra_hours × rate)                  │
│ Invoice trigger: Monthly/periodic + on completion                   │
│ Write-offs:      On T&M portion only                               │
│ Example:         $2,000/mo retainer + $150/h extras               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Migration: `005_billing_review_system.sql`

```sql
BEGIN;

-- ═══════════════════════════════════════════════════════════════
-- EXTEND PROJECTS: Add billing model + status
-- ═══════════════════════════════════════════════════════════════

-- Billing model enum
CREATE TYPE billing_model AS ENUM (
  'time_and_material',
  'fixed_price',
  'milestone',
  'hybrid'
);

-- Extended project status (includes billing states)
CREATE TYPE project_billing_status AS ENUM (
  'not_started',        -- project not yet completed
  'pending_review',     -- project done, awaiting billing review
  'in_review',          -- billing session opened by manager
  'approved',           -- billing review approved, ready to invoice
  'invoiced',           -- invoice generated
  'partially_invoiced', -- some milestones invoiced, more pending
  'written_off'         -- project completed, no invoice (pro-bono etc.)
);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS billing_model
    billing_model NOT NULL DEFAULT 'time_and_material',
  ADD COLUMN IF NOT EXISTS billing_status
    project_billing_status NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS retainer_amount
    NUMERIC(12,3) DEFAULT 0,          -- for hybrid model
  ADD COLUMN IF NOT EXISTS billing_reviewed_by
    UUID REFERENCES employees(id),
  ADD COLUMN IF NOT EXISTS billing_reviewed_at
    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_notes
    TEXT;

-- ═══════════════════════════════════════════════════════════════
-- BILLING SESSIONS
-- The formal "billing review" record
-- Created when project → pending_review
-- Closed when → approved / written_off
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS billing_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sales_order_id  UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  reviewed_by     UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- State
  status          TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','approved','rejected','cancelled')),
  billing_model   billing_model NOT NULL,

  -- Financials (computed from billing_items, stored for audit)
  gross_amount    NUMERIC(12,3) NOT NULL DEFAULT 0, -- before adjustments
  adjustments     NUMERIC(12,3) NOT NULL DEFAULT 0, -- sum of write-offs/discounts
  net_amount      NUMERIC(12,3) NOT NULL DEFAULT 0, -- final billable amount
  currency        CHAR(3)       NOT NULL DEFAULT 'TND',

  -- Review metadata
  review_notes    TEXT,
  approved_at     TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,

  -- Audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_billing_sessions_project
  ON billing_sessions(project_id);
CREATE INDEX idx_billing_sessions_status
  ON billing_sessions(status)
  WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- BILLING ITEMS
-- Individual line items within a billing session
-- Sourced from: tasks, timesheets, milestones, or expenses
-- ═══════════════════════════════════════════════════════════════

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

CREATE TABLE IF NOT EXISTS billing_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent session
  billing_session_id  UUID NOT NULL
    REFERENCES billing_sessions(id) ON DELETE CASCADE,

  -- Source traceability (FK to originating record)
  source_type         billing_item_source NOT NULL,
  task_id             UUID REFERENCES tasks(id)        ON DELETE SET NULL,
  timesheet_id        UUID REFERENCES timesheets(id)   ON DELETE SET NULL,
  milestone_id        UUID REFERENCES milestones(id)   ON DELETE SET NULL,
  expense_id          UUID REFERENCES expenses(id)     ON DELETE SET NULL,

  -- Item details
  description         TEXT NOT NULL,
  quantity            NUMERIC(10,4) NOT NULL DEFAULT 1,  -- hours or units
  unit_price          NUMERIC(12,3) NOT NULL DEFAULT 0,
  amount              NUMERIC(12,3) NOT NULL DEFAULT 0,  -- quantity × unit_price

  -- Manager adjustments
  original_quantity   NUMERIC(10,4),   -- before manager edit
  original_unit_price NUMERIC(12,3),   -- before manager edit
  original_amount     NUMERIC(12,3),   -- before manager edit
  adjustment_reason   TEXT,            -- why was it changed?

  -- Billing decision
  is_billable         BOOLEAN NOT NULL DEFAULT TRUE,
  is_written_off      BOOLEAN NOT NULL DEFAULT FALSE,
  writeoff_reason     TEXT,

  -- Prevent double-billing: once billed, lock the source
  is_billed           BOOLEAN NOT NULL DEFAULT FALSE,
  billed_at           TIMESTAMPTZ,
  invoice_line_item_id UUID,  -- FK added after invoice_line_items exists

  -- Audit
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_items_session
  ON billing_items(billing_session_id);
CREATE INDEX idx_billing_items_task
  ON billing_items(task_id)
  WHERE task_id IS NOT NULL;
CREATE INDEX idx_billing_items_timesheet
  ON billing_items(timesheet_id)
  WHERE timesheet_id IS NOT NULL;
CREATE INDEX idx_billing_items_milestone
  ON billing_items(milestone_id)
  WHERE milestone_id IS NOT NULL;
CREATE INDEX idx_billing_items_billed
  ON billing_items(is_billed, billing_session_id);

-- ═══════════════════════════════════════════════════════════════
-- EXTEND TASKS: Billing lifecycle flags
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_billable      BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_billed        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS billed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_rate     NUMERIC(10,3), -- override employee rate
  ADD COLUMN IF NOT EXISTS writeoff_hours   NUMERIC(8,3) DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- EXTEND TIMESHEETS: Billing lifecycle flags
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE timesheets
  ADD COLUMN IF NOT EXISTS is_billed    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS billed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS writeoff_hours NUMERIC(8,3) DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- EXTEND INVOICE_LINE_ITEMS: Source traceability
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE invoice_line_items
  ADD COLUMN IF NOT EXISTS billing_item_id  UUID
    REFERENCES billing_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS task_id          UUID
    REFERENCES tasks(id)         ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS timesheet_id     UUID
    REFERENCES timesheets(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS milestone_id     UUID
    REFERENCES milestones(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expense_id       UUID
    REFERENCES expenses(id)      ON DELETE SET NULL;

-- Now add the back-reference from billing_items → invoice_line_items
ALTER TABLE billing_items
  ADD CONSTRAINT fk_billing_items_invoice_line
  FOREIGN KEY (invoice_line_item_id)
  REFERENCES invoice_line_items(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

-- ═══════════════════════════════════════════════════════════════
-- BILLING SESSION AUDIT LOG
-- Full history of every change made during review
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS billing_session_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_session_id  UUID NOT NULL
    REFERENCES billing_sessions(id) ON DELETE CASCADE,
  billing_item_id     UUID
    REFERENCES billing_items(id)    ON DELETE SET NULL,
  event_type          TEXT NOT NULL,
  -- 'item_added','item_removed','quantity_adjusted',
  -- 'price_adjusted','written_off','session_approved',
  -- 'session_reopened','invoice_generated'
  performed_by        UUID REFERENCES employees(id),
  old_value           JSONB,
  new_value           JSONB,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_events_session
  ON billing_session_events(billing_session_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- DB FUNCTION: Extract billable items from a completed project
-- Called when billing session is opened
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_extract_billable_items(
  p_billing_session_id  UUID,
  p_project_id          UUID,
  p_billing_model       billing_model
)
RETURNS INTEGER   -- returns count of items extracted
LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER := 0;
  v_item  RECORD;
BEGIN

  -- ── T&M or HYBRID: Extract approved timesheets ──
  IF p_billing_model IN ('time_and_material', 'hybrid') THEN
    FOR v_item IN
      SELECT
        t.id             AS timesheet_id,
        t.task_id,
        t.employee_id,
        t.billable_hours,
        e.billable_rate,
        t.description,
        t.date,
        concat(emp.full_name, ' - ', t.description) AS label
      FROM timesheets t
      JOIN employees  emp ON emp.id = t.employee_id
      -- employee billing rate (with task-level override)
      LEFT JOIN tasks e ON e.id = t.task_id
      WHERE t.project_id  = p_project_id
        AND t.status       = 'approved'
        AND t.is_billed    = FALSE
        AND t.billable_hours > 0
    LOOP
      INSERT INTO billing_items (
        billing_session_id, source_type,
        timesheet_id, task_id,
        description, quantity, unit_price, amount,
        original_quantity, original_unit_price, original_amount,
        is_billable
      ) VALUES (
        p_billing_session_id, 'timesheet',
        v_item.timesheet_id, v_item.task_id,
        v_item.label,
        v_item.billable_hours,
        COALESCE(v_item.billable_rate, 0),
        v_item.billable_hours * COALESCE(v_item.billable_rate, 0),
        -- store originals for audit trail
        v_item.billable_hours,
        COALESCE(v_item.billable_rate, 0),
        v_item.billable_hours * COALESCE(v_item.billable_rate, 0),
        TRUE
      );
      v_count := v_count + 1;
    END LOOP;
  END IF;

  -- ── FIXED or HYBRID base: Extract from sales order line items ──
  IF p_billing_model IN ('fixed_price', 'hybrid') THEN
    FOR v_item IN
      SELECT
        oli.id, oli.description,
        oli.quantity, oli.unit_price, oli.subtotal
      FROM sales_orders   so
      JOIN order_line_items oli ON oli.order_id = so.id
      JOIN projects        p   ON p.sales_order_id = so.id
      WHERE p.id = p_project_id
        AND oli.item_type = 'service'
    LOOP
      INSERT INTO billing_items (
        billing_session_id, source_type,
        description, quantity, unit_price, amount,
        original_quantity, original_unit_price, original_amount,
        is_billable
      ) VALUES (
        p_billing_session_id, 'fixed',
        v_item.description,
        v_item.quantity, v_item.unit_price, v_item.subtotal,
        v_item.quantity, v_item.unit_price, v_item.subtotal,
        TRUE
      );
      v_count := v_count + 1;
    END LOOP;
  END IF;

  -- ── MILESTONE: Extract reached (unbilled) milestones ──
  IF p_billing_model IN ('milestone', 'hybrid') THEN
    FOR v_item IN
      SELECT id, name, invoice_amount
      FROM   milestones
      WHERE  project_id    = p_project_id
        AND  status        = 'reached'
        AND  invoice_trigger = TRUE
        AND  id NOT IN (
          SELECT milestone_id FROM billing_items
          WHERE  milestone_id IS NOT NULL
            AND  is_billed = TRUE
        )
    LOOP
      INSERT INTO billing_items (
        billing_session_id, source_type,
        milestone_id,
        description, quantity, unit_price, amount,
        original_quantity, original_unit_price, original_amount,
        is_billable
      ) VALUES (
        p_billing_session_id, 'milestone',
        v_item.id,
        concat('Milestone: ', v_item.name),
        1, v_item.invoice_amount, v_item.invoice_amount,
        1, v_item.invoice_amount, v_item.invoice_amount,
        TRUE
      );
      v_count := v_count + 1;
    END LOOP;
  END IF;

  -- ── ALL MODELS: Extract unbilled reimbursable expenses ──
  FOR v_item IN
    SELECT id, description, amount
    FROM   expenses
    WHERE  project_id  = p_project_id
      AND  is_billable = TRUE
      AND  approved_by IS NOT NULL
      AND  id NOT IN (
        SELECT expense_id FROM billing_items
        WHERE  expense_id IS NOT NULL AND is_billed = TRUE
      )
  LOOP
    INSERT INTO billing_items (
      billing_session_id, source_type,
      expense_id,
      description, quantity, unit_price, amount,
      original_quantity, original_unit_price, original_amount,
      is_billable
    ) VALUES (
      p_billing_session_id, 'expense',
      v_item.id,
      concat('Expense: ', v_item.description),
      1, v_item.amount, v_item.amount,
      1, v_item.amount, v_item.amount,
      TRUE
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

COMMIT;
```

---

## STEP 2: Shared Contracts

### `shared/contracts/billing.contract.ts`

```typescript
import { z } from 'zod';
import { BaseEntitySchema } from './base.contract';

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export const BillingModelSchema = z.enum([
  'time_and_material',
  'fixed_price',
  'milestone',
  'hybrid',
]);
export type BillingModel = z.infer<typeof BillingModelSchema>;

export const BillingStatusSchema = z.enum([
  'not_started',
  'pending_review',
  'in_review',
  'approved',
  'invoiced',
  'partially_invoiced',
  'written_off',
]);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

export const BillingSessionStatusSchema = z.enum([
  'open',
  'approved',
  'rejected',
  'cancelled',
]);
export type BillingSessionStatus = z.infer<typeof BillingSessionStatusSchema>;

export const BillingItemSourceSchema = z.enum([
  'timesheet',
  'task',
  'milestone',
  'expense',
  'fixed',
  'retainer',
  'adjustment',
  'writeoff',
]);
export type BillingItemSource = z.infer<typeof BillingItemSourceSchema>;

// ─────────────────────────────────────────────────────────────
// BILLING ITEM
// ─────────────────────────────────────────────────────────────

export const BillingItemSchema = z.object({
  id:                z.string().uuid(),
  billingSessionId:  z.string().uuid(),
  sourceType:        BillingItemSourceSchema,

  // Source traceability FKs
  taskId:            z.string().uuid().nullable().optional(),
  timesheetId:       z.string().uuid().nullable().optional(),
  milestoneId:       z.string().uuid().nullable().optional(),
  expenseId:         z.string().uuid().nullable().optional(),

  // Financials
  description:       z.string().min(1),
  quantity:          z.number().nonnegative(),
  unitPrice:         z.number().nonnegative(),
  amount:            z.number(),

  // Audit trail of adjustments
  originalQuantity:  z.number().nonnegative().nullable().optional(),
  originalUnitPrice: z.number().nonnegative().nullable().optional(),
  originalAmount:    z.number().nullable().optional(),
  adjustmentReason:  z.string().nullable().optional(),

  // Billing decisions
  isBillable:        z.boolean().default(true),
  isWrittenOff:      z.boolean().default(false),
  writeoffReason:    z.string().nullable().optional(),

  // Anti-double-billing
  isBilled:          z.boolean().default(false),
  billedAt:          z.string().datetime().nullable().optional(),
  invoiceLineItemId: z.string().uuid().nullable().optional(),

  createdAt:         z.string().datetime(),
  updatedAt:         z.string().datetime(),
});
export type BillingItem = z.infer<typeof BillingItemSchema>;

// ─────────────────────────────────────────────────────────────
// BILLING SESSION
// ─────────────────────────────────────────────────────────────

export const BillingSessionSchema = z.object({
  id:            z.string().uuid(),
  projectId:     z.string().uuid(),
  salesOrderId:  z.string().uuid().nullable().optional(),
  reviewedBy:    z.string().uuid().nullable().optional(),
  status:        BillingSessionStatusSchema,
  billingModel:  BillingModelSchema,
  grossAmount:   z.number().nonnegative(),
  adjustments:   z.number(),              // can be negative (discounts)
  netAmount:     z.number().nonnegative(),
  currency:      z.string().length(3),
  reviewNotes:   z.string().nullable().optional(),
  approvedAt:    z.string().datetime().nullable().optional(),
  submittedAt:   z.string().datetime().nullable().optional(),
  items:         z.array(BillingItemSchema).default([]),
  createdAt:     z.string().datetime(),
  updatedAt:     z.string().datetime(),
});
export type BillingSession = z.infer<typeof BillingSessionSchema>;

// ─────────────────────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────────────────────

export const AdjustBillingItemSchema = z.object({
  quantity:         z.number().nonnegative().optional(),
  unitPrice:        z.number().nonnegative().optional(),
  description:      z.string().optional(),
  isBillable:       z.boolean().optional(),
  adjustmentReason: z.string().min(1),    // REQUIRED for audit trail
});
export type AdjustBillingItemDTO = z.infer<typeof AdjustBillingItemSchema>;

export const WriteOffItemSchema = z.object({
  writeoffReason: z.string().min(10),    // enforce meaningful reason
  partialHours:   z.number().nonnegative().optional(), // partial write-off
});
export type WriteOffItemDTO = z.infer<typeof WriteOffItemSchema>;

export const ApproveBillingSessionSchema = z.object({
  reviewNotes:    z.string().optional(),
  reviewedBy:     z.string().uuid(),
});
export type ApproveBillingSessionDTO = z.infer<typeof ApproveBillingSessionSchema>;

// ─────────────────────────────────────────────────────────────
// BILLING SUMMARY (computed view for UI)
// ─────────────────────────────────────────────────────────────

export interface BillingSummary {
  projectId:        string;
  projectName:      string;
  billingModel:     BillingModel;
  billingStatus:    BillingStatus;
  totalLoggedHours: number;
  totalBillableHours: number;
  totalWrittenOffHours: number;
  grossAmount:      number;
  totalAdjustments: number;
  netAmount:        number;
  currency:         string;
  itemCount:        number;
  writtenOffCount:  number;
  adjustedCount:    number;
}

// ─────────────────────────────────────────────────────────────
// BILLING POLICY (per-project configuration)
// ─────────────────────────────────────────────────────────────

export interface BillingPolicy {
  model:              BillingModel;
  defaultRate?:       number;          // fallback if employee has no rate
  requiresApproval:   boolean;         // always true for enterprise
  autoExtract:        boolean;         // auto-extract on project completion
  splitInvoices:      boolean;         // allow multiple invoices per project
  retainerAmount?:    number;          // for hybrid model
  taxRate:            number;
  currency:           string;
}
```

---

## STEP 3: Billing Service (Core Business Logic)

### `modules/billing/billing.service.ts`

```typescript
import { supabase } from '../../shared/database/supabase.client';
import { eventBus, EVENT_NAMES } from '../../shared/events';
import { type Result, ok, err, isOk, isErr } from '../../shared/types/result.type';
import {
  NotFoundError,
  BusinessRuleError,
  ConflictError,
  mapSupabaseError,
  type DomainError,
} from '../../shared/errors/domain.error';
import {
  type BillingSession,
  type BillingItem,
  type BillingModel,
  type BillingSummary,
  type AdjustBillingItemDTO,
  type WriteOffItemDTO,
  type ApproveBillingSessionDTO,
} from '../../shared/contracts/billing.contract';
import { invoiceService } from '../invoice/invoice.service';
import { type CreateInvoiceDTO } from '../../shared/contracts/invoice.contract';

// ─────────────────────────────────────────────────────────────
// BILLING SERVICE
// Orchestrates the full billing lifecycle:
//   Project Completed
//     → Open Billing Session (extract items)
//     → Manager Review (adjust, write-off)
//     → Approve Session
//     → Generate Invoice
// ─────────────────────────────────────────────────────────────

export const billingService = {

  // ═══════════════════════════════════════════════════════════
  // 1. OPEN BILLING SESSION
  // Called when project moves to 'completed'
  // Extracts all billable items based on billing model
  // ═══════════════════════════════════════════════════════════

  async openBillingSession(
    projectId: string
  ): Promise<Result<BillingSession, DomainError>> {

    // ── Fetch project ──
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('*, clients(company_name)')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (projError || !project) {
      return err(new NotFoundError('Project', projectId));
    }

    // ── Business rule: only completed projects can be billed ──
    if (project.status !== 'completed') {
      return err(
        new BusinessRuleError(
          'Cannot open billing session: project is not completed',
          { projectId, currentStatus: project.status }
        )
      );
    }

    // ── Business rule: no duplicate open sessions ──
    const { data: existingSession } = await supabase
      .from('billing_sessions')
      .select('id, status')
      .eq('project_id', projectId)
      .in('status', ['open', 'approved'])
      .is('deleted_at', null)
      .maybeSingle();

    if (existingSession) {
      return err(
        new ConflictError(
          `Billing session already exists for project ${projectId}`,
          { existingSessionId: existingSession.id, status: existingSession.status }
        )
      );
    }

    // ── Create billing session ──
    const { data: session, error: sessionError } = await supabase
      .from('billing_sessions')
      .insert({
        project_id:     projectId,
        sales_order_id: project.sales_order_id ?? null,
        status:         'open',
        billing_model:  project.billing_model,
        gross_amount:   0,
        adjustments:    0,
        net_amount:     0,
        currency:       'TND',
      })
      .select()
      .single();

    if (sessionError || !session) {
      return err(mapSupabaseError(sessionError, 'openBillingSession'));
    }

    // ── Extract billable items via DB function ──
    const { data: itemCount, error: extractError } = await supabase
      .rpc('fn_extract_billable_items', {
        p_billing_session_id: session.id,
        p_project_id:         projectId,
        p_billing_model:      project.billing_model,
      });

    if (extractError) {
      // Rollback: delete the session
      await supabase.from('billing_sessions').delete().eq('id', session.id);
      return err(mapSupabaseError(extractError, 'extractBillableItems'));
    }

    // ── Recalculate session totals ──
    const recalcResult = await this.recalculateSessionTotals(session.id);
    if (isErr(recalcResult)) return recalcResult;

    // ── Update project billing status ──
    await supabase
      .from('projects')
      .update({ billing_status: 'in_review' })
      .eq('id', projectId);

    // ── Audit event ──
    await this.logSessionEvent(session.id, null, 'session_opened', null, {
      itemCount,
      billingModel: project.billing_model,
    });

    // ── Notify project lead ──
    void eventBus.emit(EVENT_NAMES.BILLING_SESSION_OPENED, {
      sessionId:  session.id,
      projectId,
      itemCount,
      billingModel: project.billing_model,
    });

    return this.getSession(session.id);
  },

  // ═══════════════════════════════════════════════════════════
  // 2. GET SESSION (with items)
  // ═══════════════════════════════════════════════════════════

  async getSession(
    sessionId: string
  ): Promise<Result<BillingSession, DomainError>> {

    const { data: session, error } = await supabase
      .from('billing_sessions')
      .select(`
        *,
        billing_items (
          *,
          tasks       ( id, title ),
          timesheets  ( id, date, hours ),
          milestones  ( id, name ),
          expenses    ( id, description, amount )
        )
      `)
      .eq('id', sessionId)
      .is('deleted_at', null)
      .single();

    if (error || !session) {
      return err(new NotFoundError('BillingSession', sessionId));
    }

    return ok(this.toSessionEntity(session));
  },

  // ═══════════════════════════════════════════════════════════
  // 3. ADJUST BILLING ITEM
  // Manager modifies quantity or price of a billing item
  // Full audit trail maintained
  // ═══════════════════════════════════════════════════════════

  async adjustItem(
    itemId:     string,
    dto:        AdjustBillingItemDTO,
    managerId:  string
  ): Promise<Result<BillingItem, DomainError>> {

    // ── Fetch current item ──
    const { data: item, error } = await supabase
      .from('billing_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error || !item) return err(new NotFoundError('BillingItem', itemId));

    // ── Business rule: cannot adjust billed items ──
    if (item.is_billed) {
      return err(
        new BusinessRuleError(
          'Cannot adjust an already-billed item',
          { itemId, billedAt: item.billed_at }
        )
      );
    }

    // ── Business rule: session must be open ──
    const { data: session } = await supabase
      .from('billing_sessions')
      .select('status')
      .eq('id', item.billing_session_id)
      .single();

    if (session?.status !== 'open') {
      return err(
        new BusinessRuleError(
          'Cannot adjust items: billing session is not open',
          { sessionId: item.billing_session_id, sessionStatus: session?.status }
        )
      );
    }

    // ── Compute new amount ──
    const newQuantity  = dto.quantity  ?? item.quantity;
    const newUnitPrice = dto.unitPrice ?? item.unit_price;
    const newAmount    = newQuantity * newUnitPrice;

    // ── Capture old values for audit ──
    const oldValues = {
      quantity:   item.quantity,
      unit_price: item.unit_price,
      amount:     item.amount,
    };

    // ── Update item ──
    const { data: updated, error: updateError } = await supabase
      .from('billing_items')
      .update({
        quantity:          newQuantity,
        unit_price:        newUnitPrice,
        amount:            newAmount,
        description:       dto.description      ?? item.description,
        is_billable:       dto.isBillable       ?? item.is_billable,
        adjustment_reason: dto.adjustmentReason,
        // Preserve originals if first adjustment
        original_quantity:  item.original_quantity  ?? item.quantity,
        original_unit_price: item.original_unit_price ?? item.unit_price,
        original_amount:    item.original_amount    ?? item.amount,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) return err(mapSupabaseError(updateError, 'adjustItem'));

    // ── Recalculate session totals ──
    await this.recalculateSessionTotals(item.billing_session_id);

    // ── Audit log ──
    await this.logSessionEvent(
      item.billing_session_id, itemId,
      'item_adjusted',
      oldValues,
      { quantity: newQuantity, unit_price: newUnitPrice, amount: newAmount,
        reason: dto.adjustmentReason },
      managerId
    );

    return ok(this.toItemEntity(updated));
  },

  // ═══════════════════════════════════════════════════════════
  // 4. WRITE OFF ITEM
  // Manager removes a billing item from the invoice
  // Reason is mandatory for compliance
  // ═══════════════════════════════════════════════════════════

  async writeOffItem(
    itemId:    string,
    dto:       WriteOffItemDTO,
    managerId: string
  ): Promise<Result<BillingItem, DomainError>> {

    const { data: item, error } = await supabase
      .from('billing_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error || !item) return err(new NotFoundError('BillingItem', itemId));
    if (item.is_billed) {
      return err(new BusinessRuleError('Cannot write off a billed item', { itemId }));
    }

    // Partial write-off support (e.g., write off 2h of 5h)
    let finalQuantity = 0;
    let finalAmount   = 0;

    if (dto.partialHours !== undefined && dto.partialHours > 0) {
      // Partial: reduce quantity, keep item billable
      const remainingHours = item.quantity - dto.partialHours;
      if (remainingHours < 0) {
        return err(
          new BusinessRuleError(
            `Cannot write off ${dto.partialHours}h: item only has ${item.quantity}h`,
            { itemId, requested: dto.partialHours, available: item.quantity }
          )
        );
      }
      finalQuantity = remainingHours;
      finalAmount   = remainingHours * item.unit_price;

      // Create a separate write-off line for the written-off portion
      await supabase.from('billing_items').insert({
        billing_session_id:  item.billing_session_id,
        source_type:         'writeoff',
        task_id:             item.task_id,
        timesheet_id:        item.timesheet_id,
        description:         `Write-off: ${dto.partialHours}h from "${item.description}"`,
        quantity:            dto.partialHours,
        unit_price:          item.unit_price,
        amount:              -(dto.partialHours * item.unit_price), // negative
        is_billable:         false,
        is_written_off:      true,
        writeoff_reason:     dto.writeoffReason,
      });

      // Update original item with reduced quantity
      await supabase
        .from('billing_items')
        .update({ quantity: finalQuantity, amount: finalAmount })
        .eq('id', itemId);

    } else {
      // Full write-off: mark as non-billable
      await supabase
        .from('billing_items')
        .update({
          is_billable:     false,
          is_written_off:  true,
          writeoff_reason: dto.writeoffReason,
          amount:          0,
        })
        .eq('id', itemId);
    }

    // Recalculate session totals
    await this.recalculateSessionTotals(item.billing_session_id);

    // Audit log
    await this.logSessionEvent(
      item.billing_session_id, itemId,
      'item_written_off',
      { amount: item.amount, quantity: item.quantity },
      { partialHours: dto.partialHours, reason: dto.writeoffReason },
      managerId
    );

    const { data: updated } = await supabase
      .from('billing_items')
      .select('*')
      .eq('id', itemId)
      .single();

    return ok(this.toItemEntity(updated!));
  },

  // ═══════════════════════════════════════════════════════════
  // 5. ADD MANUAL ITEM
  // Manager adds an ad-hoc line (bonus service, etc.)
  // ═══════════════════════════════════════════════════════════

  async addManualItem(
    sessionId:   string,
    description: string,
    quantity:    number,
    unitPrice:   number,
    managerId:   string,
    sourceType:  'adjustment' | 'fixed' = 'adjustment'
  ): Promise<Result<BillingItem, DomainError>> {

    const { data: session } = await supabase
      .from('billing_sessions')
      .select('status')
      .eq('id', sessionId)
      .single();

    if (session?.status !== 'open') {
      return err(new BusinessRuleError('Cannot add items: session is not open'));
    }

    const amount = quantity * unitPrice;

    const { data, error } = await supabase
      .from('billing_items')
      .insert({
        billing_session_id: sessionId,
        source_type:        sourceType,
        description,
        quantity,
        unit_price:         unitPrice,
        amount,
        original_quantity:  quantity,
        original_unit_price: unitPrice,
        original_amount:    amount,
        is_billable:        true,
        is_written_off:     false,
      })
      .select()
      .single();

    if (error) return err(mapSupabaseError(error, 'addManualItem'));

    await this.recalculateSessionTotals(sessionId);
    await this.logSessionEvent(
      sessionId, data.id, 'item_added', null,
      { description, quantity, unit_price: unitPrice, amount },
      managerId
    );

    return ok(this.toItemEntity(data));
  },

  // ═══════════════════════════════════════════════════════════
  // 6. APPROVE BILLING SESSION
  // Manager signs off → triggers invoice generation
  // ═══════════════════════════════════════════════════════════

  async approveSession(
    sessionId: string,
    dto:       ApproveBillingSessionDTO
  ): Promise<Result<BillingSession, DomainError>> {

    const sessionResult = await this.getSession(sessionId);
    if (isErr(sessionResult)) return sessionResult;
    const session = sessionResult.data;

    // ── Business rules ──
    if (session.status !== 'open') {
      return err(
        new BusinessRuleError(
          `Cannot approve session in status: ${session.status}`
        )
      );
    }

    if (session.netAmount <= 0) {
      return err(
        new BusinessRuleError(
          'Cannot approve a billing session with zero or negative net amount. Use write_off instead.',
          { netAmount: session.netAmount }
        )
      );
    }

    const billableItems = session.items.filter(
      (i) => i.isBillable && !i.isWrittenOff
    );

    if (billableItems.length === 0) {
      return err(
        new BusinessRuleError(
          'Cannot approve: no billable items in session'
        )
      );
    }

    // ── Approve session ──
    const now = new Date().toISOString();
    const { error: approveError } = await supabase
      .from('billing_sessions')
      .update({
        status:       'approved',
        reviewed_by:  dto.reviewedBy,
        review_notes: dto.reviewNotes ?? null,
        approved_at:  now,
      })
      .eq('id', sessionId);

    if (approveError) return err(mapSupabaseError(approveError, 'approveSession'));

    // ── Update project billing status ──
    await supabase
      .from('projects')
      .update({
        billing_status:       'approved',
        billing_reviewed_by:  dto.reviewedBy,
        billing_reviewed_at:  now,
        billing_notes:        dto.reviewNotes ?? null,
      })
      .eq('id', session.projectId);

    // ── Audit log ──
    await this.logSessionEvent(
      sessionId, null, 'session_approved', null,
      { reviewedBy: dto.reviewedBy, netAmount: session.netAmount },
      dto.reviewedBy
    );

    // ── Publish event → triggers invoice generation ──
    void eventBus.emit(EVENT_NAMES.BILLING_SESSION_APPROVED, {
      sessionId,
      projectId:    session.projectId,
      netAmount:    session.netAmount,
      billingModel: session.billingModel,
      reviewedBy:   dto.reviewedBy,
    });

    return this.getSession(sessionId);
  },

  // ═══════════════════════════════════════════════════════════
  // 7. GENERATE INVOICE FROM APPROVED SESSION
  // Called by event listener after approval
  // Marks all items as "billed" to prevent double-billing
  // ═══════════════════════════════════════════════════════════

  async generateInvoiceFromSession(
    sessionId: string
  ): Promise<Result<string, DomainError>> {   // returns invoiceId

    const sessionResult = await this.getSession(sessionId);
    if (isErr(sessionResult)) return sessionResult;
    const session = sessionResult.data;

    if (session.status !== 'approved') {
      return err(
        new BusinessRuleError(
          `Cannot generate invoice: session status is "${session.status}", expected "approved"`,
          { sessionId }
        )
      );
    }

    // ── Fetch project for client info ──
    const { data: project } = await supabase
      .from('projects')
      .select('*, clients(company_name)')
      .eq('id', session.projectId)
      .single();

    if (!project) return err(new NotFoundError('Project', session.projectId));

    // ── Build invoice line items from billing items ──
    const billableItems = session.items.filter(
      (item) => item.isBillable && !item.isWrittenOff && item.amount > 0
    );

    const taxRate = 0.19; // 19% VAT
    const subtotal = session.netAmount;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // ── Create invoice via invoice service ──
    const invoiceResult = await invoiceService.createInvoice({
      orderId:      project.sales_order_id ?? undefined,
      projectId:    session.projectId,
      clientId:     project.client_id,
      customerName: project.clients?.company_name ?? 'Client',
      status:       'draft',  // manager sends manually after review
      subtotal,
      taxAmount,
      total,
      amountDue:    total,
      notes:        `Generated from billing session. Model: ${session.billingModel}. Reviewed by manager.`,
      items:        billableItems.map((item) => ({
        description:  item.description,
        quantity:     item.quantity,
        unitPrice:    item.unitPrice,
        subtotal:     item.amount,
        type:         this.mapSourceToLineItemType(item.sourceType),
        // Traceability FKs
        taskId:       item.taskId      ?? undefined,
        timesheetId:  item.timesheetId ?? undefined,
        milestoneId:  item.milestoneId ?? undefined,
        expenseId:    item.expenseId   ?? undefined,
        billingItemId: item.id,
      })),
    } as CreateInvoiceDTO);

    if (isErr(invoiceResult)) return invoiceResult;
    const invoice = invoiceResult.data;

    // ── Mark billing items as billed (ANTI-DOUBLE-BILLING) ──
    const now = new Date().toISOString();
    const billingItemIds = billableItems.map((i) => i.id);

    await supabase
      .from('billing_items')
      .update({ is_billed: true, billed_at: now })
      .in('id', billingItemIds);

    // ── Mark source records as billed ──
    const timesheetIds = billableItems
      .filter((i) => i.timesheetId)
      .map((i) => i.timesheetId!);

    const taskIds = billableItems
      .filter((i) => i.taskId && i.sourceType === 'task')
      .map((i) => i.taskId!);

    if (timesheetIds.length > 0) {
      await supabase
        .from('timesheets')
        .update({ is_billed: true, billed_at: now })
        .in('id', timesheetIds);
    }

    if (taskIds.length > 0) {
      await supabase
        .from('tasks')
        .update({ is_billed: true, billed_at: now })
        .in('id', taskIds);
    }

    // ── Update session: link to invoice ──
    await supabase
      .from('billing_sessions')
      .update({ status: 'approved' })  // stays approved, invoice is separate
      .eq('id', sessionId);

    // ── Update project billing status → invoiced ──
    await supabase
      .from('projects')
      .update({ billing_status: 'invoiced' })
      .eq('id', session.projectId);

    // ── Audit log ──
    await this.logSessionEvent(
      sessionId, null, 'invoice_generated', null,
      { invoiceId: invoice.id, total }
    );

    return ok(invoice.id);
  },

  // ═══════════════════════════════════════════════════════════
  // 8. GET BILLING SUMMARY (for UI dashboard)
  // ═══════════════════════════════════════════════════════════

  async getBillingSummary(
    projectId: string
  ): Promise<Result<BillingSummary, DomainError>> {

    const { data: project } = await supabase
      .from('projects')
      .select('*, billing_sessions(*)')
      .eq('id', projectId)
      .single();

    if (!project) return err(new NotFoundError('Project', projectId));

    const { data: items } = await supabase
      .from('billing_items')
      .select('*')
      .eq('billing_session_id',
        project.billing_sessions?.[0]?.id ?? '00000000-0000-0000-0000-000000000000'
      );

    const allItems = items ?? [];
    const billable = allItems.filter((i) => i.is_billable && !i.is_written_off);
    const writtenOff = allItems.filter((i) => i.is_written_off);
    const adjusted = allItems.filter(
      (i) => i.original_amount !== null && i.original_amount !== i.amount
    );

    const timesheetItems = allItems.filter((i) => i.source_type === 'timesheet');
    const totalLoggedHours    = timesheetItems.reduce((s, i) => s + Number(i.original_quantity ?? i.quantity), 0);
    const totalBillableHours  = timesheetItems.filter((i) => i.is_billable).reduce((s, i) => s + Number(i.quantity), 0);
    const totalWrittenOffHours = timesheetItems.filter((i) => i.is_written_off).reduce((s, i) => s + Number(i.original_quantity ?? 0), 0);

    const grossAmount    = allItems.reduce((s, i) => s + Number(i.original_amount ?? i.amount), 0);
    const netAmount      = billable.reduce((s, i) => s + Number(i.amount), 0);
    const totalAdjustments = grossAmount - netAmount;

    return ok({
      projectId,
      projectName:          project.name,
      billingModel:         project.billing_model,
      billingStatus:        project.billing_status,
      totalLoggedHours,
      totalBillableHours,
      totalWrittenOffHours,
      grossAmount,
      totalAdjustments,
      netAmount,
      currency:             project.billing_sessions?.[0]?.currency ?? 'TND',
      itemCount:            billable.length,
      writtenOffCount:      writtenOff.length,
      adjustedCount:        adjusted.length,
    });
  },

  // ═══════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  async recalculateSessionTotals(
    sessionId: string
  ): Promise<Result<void, DomainError>> {

    const { data: items } = await supabase
      .from('billing_items')
      .select('amount, original_amount, is_billable, is_written_off')
      .eq('billing_session_id', sessionId);

    if (!items) return ok(undefined);

    const grossAmount = items.reduce(
      (s, i) => s + Number(i.original_amount ?? i.amount), 0
    );
    const netAmount = items
      .filter((i) => i.is_billable && !i.is_written_off)
      .reduce((s, i) => s + Number(i.amount), 0);

    const adjustments = grossAmount - netAmount;

    const { error } = await supabase
      .from('billing_sessions')
      .update({ gross_amount: grossAmount, net_amount: netAmount, adjustments })
      .eq('id', sessionId);

    if (error) return err(mapSupabaseError(error, 'recalculateSessionTotals'));
    return ok(undefined);
  },

  async logSessionEvent(
    sessionId:  string,
    itemId:     string | null,
    eventType:  string,
    oldValue:   object | null,
    newValue:   object | null,
    performedBy?: string
  ): Promise<void> {
    await supabase.from('billing_session_events').insert({
      billing_session_id: sessionId,
      billing_item_id:    itemId,
      event_type:         eventType,
      old_value:          oldValue,
      new_value:          newValue,
      performed_by:       performedBy ?? null,
    });
  },

  mapSourceToLineItemType(
    source: string
  ): 'service' | 'product' | 'expense' | 'timesheet' {
    const map: Record<string, any> = {
      timesheet: 'timesheet',
      task:      'service',
      milestone: 'service',
      expense:   'expense',
      fixed:     'service',
      retainer:  'service',
      adjustment:'service',
    };
    return map[source] ?? 'service';
  },

  toSessionEntity(row: any): BillingSession {
    return {
      id:           row.id,
      projectId:    row.project_id,
      salesOrderId: row.sales_order_id ?? null,
      reviewedBy:   row.reviewed_by    ?? null,
      status:       row.status,
      billingModel: row.billing_model,
      grossAmount:  Number(row.gross_amount),
      adjustments:  Number(row.adjustments),
      netAmount:    Number(row.net_amount),
      currency:     row.currency,
      reviewNotes:  row.review_notes   ?? null,
      approvedAt:   row.approved_at    ?? null,
      submittedAt:  row.submitted_at   ?? null,
      items:        (row.billing_items ?? []).map((i: any) => this.toItemEntity(i)),
      createdAt:    row.created_at,
      updatedAt:    row.updated_at,
    };
  },

  toItemEntity(row: any): BillingItem {
    return {
      id:                row.id,
      billingSessionId:  row.billing_session_id,
      sourceType:        row.source_type,
      taskId:            row.task_id         ?? null,
      timesheetId:       row.timesheet_id    ?? null,
      milestoneId:       row.milestone_id    ?? null,
      expenseId:         row.expense_id      ?? null,
      description:       row.description,
      quantity:          Number(row.quantity),
      unitPrice:         Number(row.unit_price),
      amount:            Number(row.amount),
      originalQuantity:  row.original_quantity  ? Number(row.original_quantity)  : null,
      originalUnitPrice: row.original_unit_price ? Number(row.original_unit_price) : null,
      originalAmount:    row.original_amount    ? Number(row.original_amount)    : null,
      adjustmentReason:  row.adjustment_reason  ?? null,
      isBillable:        row.is_billable,
      isWrittenOff:      row.is_written_off,
      writeoffReason:    row.writeoff_reason     ?? null,
      isBilled:          row.is_billed,
      billedAt:          row.billed_at           ?? null,
      invoiceLineItemId: row.invoice_line_item_id ?? null,
      createdAt:         row.created_at,
      updatedAt:         row.updated_at,
    };
  },
};

// ─────────────────────────────────────────────────────────────
// EVENT WIRING
// ─────────────────────────────────────────────────────────────

// Project completed → auto-open billing session
eventBus.on(EVENT_NAMES.PROJECT_COMPLETED, async ({ projectId }) => {
  const result = await billingService.openBillingSession(projectId);
  if (isErr(result)) {
    console.error(`[Billing] Failed to open session for project ${projectId}:`,
      result.error.message);
  } else {
    console.log(`[Billing] ✅ Billing session opened for project ${projectId}`);
  }
});

// Billing approved → generate invoice
eventBus.on(EVENT_NAMES.BILLING_SESSION_APPROVED, async ({ sessionId }) => {
  const result = await billingService.generateInvoiceFromSession(sessionId);
  if (isErr(result)) {
    console.error(`[Billing] Failed to generate invoice from session ${sessionId}:`,
      result.error.message);
  } else {
    console.log(`[Billing] ✅ Invoice ${result.data} generated from session ${sessionId}`);
  }
});

export default billingService;
```

---

## STEP 4: Updated Event Names

```typescript
// shared/events/event-names.ts — add these

export const EVENT_NAMES = {
  // ... existing events ...

  // Billing lifecycle
  BILLING_SESSION_OPENED:   'billing.session.opened',
  BILLING_SESSION_APPROVED: 'billing.session.approved',
  BILLING_SESSION_REJECTED: 'billing.session.rejected',
  BILLING_ITEM_ADJUSTED:    'billing.item.adjusted',
  BILLING_ITEM_WRITTEN_OFF: 'billing.item.written_off',
  BILLING_INVOICE_GENERATED:'billing.invoice.generated',
} as const;
```

---

## 📊 Complete State Machine

```
PROJECT STATUS          BILLING STATUS         SESSION STATUS
──────────────          ──────────────         ──────────────
active                  not_started            (none)
         │
         ▼
completed      ────────►pending_review
                                 │
                    [Auto: open billing session]
                                 │
                                 ▼
                         in_review          ──► open
                                 │               │
                         [Manager actions]       │
                         ├─ adjustItem()         │
                         ├─ writeOffItem()       │
                         └─ addManualItem()      │
                                 │               │
                    [approveSession()]           │
                                 │               ▼
                         approved           ──► approved
                                 │               │
                    [generateInvoice()]          │
                                 │               │
                         invoiced           ──► (invoice created)
                                 │
                         ─────────────
                         written_off    (if netAmount = 0)
```

---

## ✅ What This Solves

```
REQUIREMENT                        SOLUTION
────────────────────────────────────────────────────────────────
Billing Review phase               billing_sessions table
                                   + openBillingSession()

Write-off hours                    writeOffItem() with
                                   partial write-off support
                                   + mandatory reason field

Manager price adjustment           adjustItem() with
                                   full audit trail
                                   (original values preserved)

Multiple billing models            fn_extract_billable_items()
(T&M / Fixed / Milestone /         handles all 4 models
Hybrid)                            via billing_model column

Trace invoice → task               billing_items.task_id FK
                                   invoice_line_items.task_id FK
                                   billing_items.invoice_line_item_id FK

Prevent double-billing             is_billed flag on
                                   billing_items + timesheets
                                   + tasks
                                   Checked before extraction

Full audit trail                   billing_session_events table
                                   Every action logged with
                                   old/new values + who + when
```