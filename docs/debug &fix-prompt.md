# Debug & Fix Prompt: Project → Billing Session → Invoice Flow

---

```
═══════════════════════════════════════════════════════════════════════════════
MISSION: DIAGNOSE & FIX THE BROKEN FLOW
═══════════════════════════════════════════════════════════════════════════════

You are a Senior Full-Stack Engineer doing a surgical debug session on a
partially-working billing pipeline. The flow Project → BillingSession →
Invoice is implemented but broken. Previous fixes addressed schema issues
and NULL sync problems, but the end-to-end flow still does not produce a
sent invoice as expected.

Your job is to:
  1. Trace the EXACT failure point in the pipeline
  2. Verify every layer (DB → Repository → Service → Event → UI)
  3. Fix only what is broken, preserve what works
  4. Prove the fix works with a verifiable test checklist

═══════════════════════════════════════════════════════════════════════════════
KNOWN CONTEXT — WHAT WAS ALREADY FIXED
═══════════════════════════════════════════════════════════════════════════════

  FIX 1 — Schema Corrections (applied via migration):
  ├── project_tasks.project_id:  UUID → BIGINT (corrected type)
  ├── project_tasks.assigned_to: renamed → employee_id (UUID)
  ├── billing_items.task_id:     now points to project_tasks(id)
  └── Removed duplicate create_task / update_task RPC overloads

  FIX 2 — billingService.ts Sync (applied in code):
  └── On session approval: loops billing items → updates project_tasks
      with billing_item_id, billing_rate, billed_at

  EXPECTED FLOW (still not working end-to-end):
  ┌─────────────────────────────────────────────────────────────┐
  │  1. Project status → 'completed'                           │
  │       ↓ (event: PROJECT_COMPLETED)                         │
  │  2. billing.session created (status: 'open')               │
  │     billing_items populated via fn_extract_billable_items  │
  │       ↓ (manager action)                                   │
  │  3. Manager reviews + approves billing session             │
  │       ↓ (event: BILLING_SESSION_APPROVED)                  │
  │  4. Invoice generated (status: 'draft')                    │
  │       ↓ (auto-transition)                                  │
  │  5. Invoice status → 'sent'          ← BROKEN HERE?       │
  │       ↓ (event: INVOICE_SENT)                              │
  │  6. Client notified                                        │
  └─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
STEP 1 — FULL PIPELINE TRACE (DO THIS FIRST)
═══════════════════════════════════════════════════════════════════════════════

  Before writing any code, trace every layer of the pipeline.
  For each layer, answer: ✅ Working | ❌ Broken | ⚠️ Partial | ❓ Unknown

  OUTPUT THIS TABLE:

  ┌────┬─────────────────────────────────────────────┬────────┬──────────────┐
  │ #  │ Pipeline Layer                              │ Status │ Evidence     │
  ├────┼─────────────────────────────────────────────┼────────┼──────────────┤
  │ 01 │ DB: project_tasks schema (types correct?)  │   ?    │              │
  │ 02 │ DB: billing_items.task_id FK valid?         │   ?    │              │
  │ 03 │ DB: fn_extract_billable_items() returns > 0 │   ?    │              │
  │ 04 │ DB: billing_sessions row created on complete│   ?    │              │
  │ 05 │ DB: billing_items rows populated            │   ?    │              │
  │ 06 │ Event: PROJECT_COMPLETED fires              │   ?    │              │
  │ 07 │ Event: billing.session.opened fires         │   ?    │              │
  │ 08 │ Service: openBillingSession() returns ok()  │   ?    │              │
  │ 09 │ DB: billing_session.status = 'open'         │   ?    │              │
  │ 10 │ Service: approveSession() returns ok()      │   ?    │              │
  │ 11 │ Event: BILLING_SESSION_APPROVED fires       │   ?    │              │
  │ 12 │ Service: generateInvoiceFromSession() ok()  │   ?    │              │
  │ 13 │ DB: invoice row created (status = 'draft')  │   ?    │              │
  │ 14 │ DB: invoice_line_items rows created         │   ?    │              │
  │ 15 │ DB: billing_items.is_billed = true          │   ?    │              │
  │ 16 │ DB: timesheets.is_billed = true             │   ?    │              │
  │ 17 │ DB: project.billing_status = 'invoiced'     │   ?    │              │
  │ 18 │ Transition: invoice 'draft' → 'sent'        │   ?    │              │
  │ 19 │ Event: INVOICE_SENT fires                   │   ?    │              │
  │ 20 │ UI: Invoice visible in invoice list         │   ?    │              │
  └────┴─────────────────────────────────────────────┴────────┴──────────────┘

  HOW TO GATHER EVIDENCE FOR EACH LAYER:

  For DB layers (01-05, 09, 13-17):
  Run these diagnostic queries in Supabase SQL editor:

  ```sql
  -- [01] Check project_tasks schema
  SELECT column_name, data_type, is_nullable
  FROM   information_schema.columns
  WHERE  table_name = 'project_tasks'
  ORDER BY ordinal_position;

  -- [02] Check billing_items FK target
  SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name  AS foreign_table,
    ccu.column_name AS foreign_column
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage  AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'billing_items';

  -- [03] Test fn_extract_billable_items manually
  -- Replace with real IDs from your data
  DO $$
  DECLARE
    v_session_id UUID := gen_random_uuid();
    v_project_id UUID := '<YOUR_COMPLETED_PROJECT_ID>';
    v_count      INTEGER;
  BEGIN
    -- Create temp session
    INSERT INTO billing_sessions(id, project_id, status, billing_model,
                                 gross_amount, adjustments, net_amount, currency)
    VALUES (v_session_id, v_project_id, 'open', 'time_and_material', 0, 0, 0, 'TND');

    -- Run extraction
    SELECT fn_extract_billable_items(v_session_id, v_project_id, 'time_and_material')
    INTO   v_count;

    RAISE NOTICE 'Extracted % items', v_count;

    -- Show what was extracted
    PERFORM * FROM billing_items WHERE billing_session_id = v_session_id;

    -- Cleanup
    DELETE FROM billing_items    WHERE billing_session_id = v_session_id;
    DELETE FROM billing_sessions WHERE id = v_session_id;
  END $$;

  -- [04] Check if billing session was created for your project
  SELECT id, project_id, status, billing_model,
         gross_amount, net_amount, created_at
  FROM   billing_sessions
  WHERE  project_id = '<YOUR_PROJECT_ID>'
  ORDER BY created_at DESC;

  -- [05] Check billing items
  SELECT id, source_type, description, quantity,
         unit_price, amount, is_billable, is_billed,
         task_id, timesheet_id, milestone_id
  FROM   billing_items
  WHERE  billing_session_id = '<YOUR_SESSION_ID>';

  -- [13] Check if invoice was created
  SELECT id, invoice_number, status, project_id,
         order_id, total, created_at
  FROM   invoices
  WHERE  project_id = '<YOUR_PROJECT_ID>'
  ORDER BY created_at DESC;

  -- [14] Check invoice line items
  SELECT ili.*, bi.source_type
  FROM   invoice_line_items ili
  LEFT JOIN billing_items bi ON bi.invoice_line_item_id = ili.id
  WHERE  ili.invoice_id = '<YOUR_INVOICE_ID>';

  -- [15-16] Check billed flags
  SELECT id, is_billed, billed_at
  FROM   billing_items
  WHERE  billing_session_id = '<YOUR_SESSION_ID>';

  SELECT id, is_billed, billed_at
  FROM   timesheets
  WHERE  project_id = '<YOUR_PROJECT_ID>';

  -- [17] Check project billing status
  SELECT id, status, billing_status, billing_reviewed_at
  FROM   projects
  WHERE  id = '<YOUR_PROJECT_ID>';
  ```

  For Event layers (06, 07, 11, 19):
  Add these temporary debug logs to your services and check console output:

  ```typescript
  // In billingService.ts — at the top of each event listener
  console.log('[DEBUG][EVENT RECEIVED]', EVENT_NAMES.PROJECT_COMPLETED, { projectId });
  console.log('[DEBUG][EVENT RECEIVED]', EVENT_NAMES.BILLING_SESSION_APPROVED, { sessionId });

  // In invoiceService.ts
  console.log('[DEBUG][EVENT RECEIVED]', EVENT_NAMES.INVOICE_CREATED, { invoiceId });
  ```

═══════════════════════════════════════════════════════════════════════════════
STEP 2 — COMMON FAILURE POINTS: DIAGNOSE EACH ONE
═══════════════════════════════════════════════════════════════════════════════

  Based on the symptoms described, check these specific failure points:

  ── FAILURE POINT A: fn_extract_billable_items returns 0 items ──────────────

  Cause candidates:
  ├── A1: timesheets.status != 'approved' (still 'submitted' or 'draft')
  ├── A2: timesheets.is_billed = true (already flagged from a previous run)
  ├── A3: timesheets.project_id type mismatch (UUID vs BIGINT join fails)
  ├── A4: project.billing_model is NULL (function condition never matches)
  └── A5: project.sales_order_id is NULL (fixed price query returns nothing)

  Diagnostic query:
  ```sql
  -- Check timesheet eligibility for your project
  SELECT
    t.id,
    t.status,
    t.is_billed,
    t.billable_hours,
    t.project_id,
    p.billing_model,
    e.billable_rate,
    e.full_name
  FROM   timesheets t
  JOIN   projects   p   ON p.id = t.project_id
  JOIN   employees  e   ON e.id = t.employee_id
  WHERE  t.project_id = '<YOUR_PROJECT_ID>';

  -- If status != 'approved', this is your problem:
  UPDATE timesheets
  SET    status = 'approved'
  WHERE  project_id = '<YOUR_PROJECT_ID>'
    AND  status = 'submitted';
  ```

  ── FAILURE POINT B: openBillingSession() silently fails ────────────────────

  Cause candidates:
  ├── B1: project.status is not exactly 'completed' (case mismatch?)
  ├── B2: EVENT_NAMES.PROJECT_COMPLETED constant value mismatch
  │       (publisher uses 'project.completed', listener expects 'PROJECT_COMPLETED')
  ├── B3: EventBus listener not registered (module not imported at startup)
  └── B4: Result<T,E> error swallowed in event listener (no console.error)

  Diagnostic:
  ```typescript
  // CHECK B2: Verify event name constants match exactly
  // In shared/events/event-names.ts — print all names
  console.log('EVENT_NAMES:', JSON.stringify(EVENT_NAMES, null, 2));

  // CHECK B3: Verify billingService is imported at app startup
  // In your main.ts or app entry point:
  import '../../modules/billing/billing.service'; // side-effect import
  import '../../modules/invoice/invoice.service'; // side-effect import
  import '../../modules/crm/crm.service';         // side-effect import

  // CHECK B4: Wrap listener in explicit error boundary
  eventBus.on(EVENT_NAMES.PROJECT_COMPLETED, async ({ projectId }) => {
    console.log('[Billing] PROJECT_COMPLETED received for:', projectId);
    try {
      const result = await billingService.openBillingSession(projectId);
      if (isErr(result)) {
        console.error('[Billing] openBillingSession FAILED:', result.error);
        return;
      }
      console.log('[Billing] Session opened:', result.data.id);
    } catch (e) {
      console.error('[Billing] UNEXPECTED ERROR in listener:', e);
    }
  });
  ```

  ── FAILURE POINT C: generateInvoiceFromSession() creates draft, not sent ───

  This is likely the primary reported issue.
  The invoice is created with status: 'draft' but never transitions to 'sent'.

  Root cause analysis:
  ├── C1: generateInvoiceFromSession() hardcodes status: 'draft'
  │       (intentional design, but missing auto-send step)
  ├── C2: No sendInvoice() call after invoice creation
  ├── C3: BILLING_SESSION_APPROVED listener does not chain to sendInvoice()
  └── C4: invoice.sent event never fires → client never notified

  Fix location: billing.service.ts → generateInvoiceFromSession()
  The invoice should auto-transition to 'sent' after creation for
  billing-session-generated invoices (pre-approved by manager).

  ── FAILURE POINT D: Broken FK causing 400 on billing item creation ─────────

  Verify the FK chain is fully consistent post-migration:
  ```sql
  -- Full FK audit for billing pipeline tables
  SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name  AS references_table,
    ccu.column_name AS references_column,
    rc.delete_rule,
    rc.update_rule
  FROM information_schema.table_constraints    tc
  JOIN information_schema.key_column_usage     kcu
    ON kcu.constraint_name = tc.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
  JOIN information_schema.referential_constraints rc
    ON rc.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN (
      'billing_sessions','billing_items',
      'billing_session_events','invoice_line_items'
    )
  ORDER BY tc.table_name, tc.constraint_name;

  -- Check for orphaned billing_items (broken FK = 400 on insert)
  SELECT bi.id, bi.task_id, pt.id AS matched_task
  FROM   billing_items bi
  LEFT JOIN project_tasks pt ON pt.id = bi.task_id
  WHERE  bi.task_id IS NOT NULL
    AND  pt.id IS NULL;
  -- If rows returned → orphaned FKs → this causes 400 on related inserts
  ```

  ── FAILURE POINT E: NULL task values after approval ────────────────────────

  The billingService fix (looping billing items to update project_tasks)
  may still fail if:
  ├── E1: billing_items.task_id is NULL (timesheet-sourced items have no task)
  ├── E2: project_tasks.billing_item_id column does not exist yet
  ├── E3: project_tasks.billing_rate column does not exist yet
  ├── E4: The update query uses wrong ID type (UUID vs BIGINT mismatch)
  └── E5: RLS policy blocks the update (Supabase row-level security)

  Diagnostic:
  ```sql
  -- Check project_tasks has the new billing columns
  SELECT column_name, data_type
  FROM   information_schema.columns
  WHERE  table_name = 'project_tasks'
    AND  column_name IN ('billing_item_id','billing_rate','billed_at');
  -- If no rows → columns missing → migration didn't run

  -- Check RLS policies
  SELECT tablename, policyname, permissive, roles, cmd, qual
  FROM   pg_policies
  WHERE  tablename = 'project_tasks';
  ```

═══════════════════════════════════════════════════════════════════════════════
STEP 3 — IMPLEMENT ALL FIXES
═══════════════════════════════════════════════════════════════════════════════

  Based on your diagnosis from Steps 1 and 2, implement the following fixes.
  Deliver COMPLETE file contents for every file you touch.

  ── FIX 1: Migration — Ensure Schema is Fully Consistent ────────────────────

  File: infrastructure/migrations/007_fix_billing_pipeline.sql

  ```sql
  BEGIN;

  -- ── Ensure project_tasks has correct types ──────────────────────
  -- IMPORTANT: Do NOT change project_id type if data exists.
  -- Instead, verify and only alter if column is empty.

  DO $$
  BEGIN
    -- Add billing columns to project_tasks if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name = 'project_tasks'
        AND  column_name = 'billing_item_id'
    ) THEN
      ALTER TABLE project_tasks ADD COLUMN billing_item_id UUID
        REFERENCES billing_items(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name = 'project_tasks'
        AND  column_name = 'billing_rate'
    ) THEN
      ALTER TABLE project_tasks ADD COLUMN billing_rate NUMERIC(10,3);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name = 'project_tasks'
        AND  column_name = 'billed_at'
    ) THEN
      ALTER TABLE project_tasks ADD COLUMN billed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name = 'project_tasks'
        AND  column_name = 'is_billed'
    ) THEN
      ALTER TABLE project_tasks
        ADD COLUMN is_billed BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
  END $$;

  -- ── Fix billing_items.task_id FK (point to project_tasks) ───────
  ALTER TABLE billing_items
    DROP CONSTRAINT IF EXISTS billing_items_task_id_fkey;

  ALTER TABLE billing_items
    ADD CONSTRAINT billing_items_task_id_fkey
    FOREIGN KEY (task_id)
    REFERENCES  project_tasks(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;

  -- ── Add invoice_line_items traceability columns if missing ───────
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name  = 'invoice_line_items'
        AND  column_name = 'billing_item_id'
    ) THEN
      ALTER TABLE invoice_line_items
        ADD COLUMN billing_item_id UUID
          REFERENCES billing_items(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name  = 'invoice_line_items'
        AND  column_name = 'task_id'
    ) THEN
      ALTER TABLE invoice_line_items
        ADD COLUMN task_id UUID
          REFERENCES project_tasks(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name  = 'invoice_line_items'
        AND  column_name = 'timesheet_id'
    ) THEN
      ALTER TABLE invoice_line_items
        ADD COLUMN timesheet_id UUID
          REFERENCES timesheets(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE  table_name  = 'invoice_line_items'
        AND  column_name = 'milestone_id'
    ) THEN
      ALTER TABLE invoice_line_items
        ADD COLUMN milestone_id UUID
          REFERENCES milestones(id) ON DELETE SET NULL;
    END IF;
  END $$;

  -- ── Add missing index for performance ────────────────────────────
  CREATE INDEX IF NOT EXISTS idx_billing_items_task_id
    ON billing_items(task_id) WHERE task_id IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_project_tasks_billing_item
    ON project_tasks(billing_item_id) WHERE billing_item_id IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_invoice_line_items_billing_item
    ON invoice_line_items(billing_item_id) WHERE billing_item_id IS NOT NULL;

  -- ── Fix fn_extract_billable_items to use project_tasks ───────────
  CREATE OR REPLACE FUNCTION fn_extract_billable_items(
    p_billing_session_id  UUID,
    p_project_id          UUID,
    p_billing_model       TEXT   -- use TEXT to avoid enum cast issues
  )
  RETURNS INTEGER
  LANGUAGE plpgsql AS $$
  DECLARE
    v_count INTEGER := 0;
    v_item  RECORD;
  BEGIN

    -- ── T&M / HYBRID: Approved, unbilled timesheets ───────────────
    IF p_billing_model IN ('time_and_material', 'hybrid') THEN
      FOR v_item IN
        SELECT
          t.id              AS timesheet_id,
          t.task_id,
          t.billable_hours,
          t.description,
          t.date,
          COALESCE(t.billing_rate, e.billable_rate, 0) AS rate,
          e.full_name
        FROM  timesheets t
        JOIN  employees  e  ON e.id = t.employee_id
        WHERE t.project_id    = p_project_id
          AND t.status        = 'approved'
          AND t.is_billed     = FALSE
          AND t.billable_hours > 0
          AND t.deleted_at   IS NULL
      LOOP
        INSERT INTO billing_items (
          billing_session_id,
          source_type,
          timesheet_id,
          task_id,
          description,
          quantity,
          unit_price,
          amount,
          original_quantity,
          original_unit_price,
          original_amount,
          is_billable
        ) VALUES (
          p_billing_session_id,
          'timesheet',
          v_item.timesheet_id,
          v_item.task_id,
          COALESCE(
            v_item.full_name || ' – ' || v_item.description,
            v_item.description,
            'Timesheet entry'
          ),
          v_item.billable_hours,
          v_item.rate,
          v_item.billable_hours * v_item.rate,
          v_item.billable_hours,
          v_item.rate,
          v_item.billable_hours * v_item.rate,
          TRUE
        );
        v_count := v_count + 1;
      END LOOP;
    END IF;

    -- ── FIXED / HYBRID: Service line items from sales order ────────
    IF p_billing_model IN ('fixed_price', 'hybrid') THEN
      FOR v_item IN
        SELECT oli.description, oli.quantity, oli.unit_price, oli.subtotal
        FROM   sales_orders     so
        JOIN   order_line_items oli ON oli.order_id = so.id
        JOIN   projects         p   ON p.sales_order_id = so.id
        WHERE  p.id = p_project_id
          AND  oli.item_type = 'service'
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

    -- ── MILESTONE / HYBRID: Reached, unbilled milestones ───────────
    IF p_billing_model IN ('milestone', 'hybrid') THEN
      FOR v_item IN
        SELECT m.id, m.name, m.invoice_amount
        FROM   milestones m
        WHERE  m.project_id      = p_project_id
          AND  m.status          = 'reached'
          AND  m.invoice_trigger = TRUE
          AND  m.invoice_amount  > 0
          AND  m.id NOT IN (
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
          'Milestone: ' || v_item.name,
          1, v_item.invoice_amount, v_item.invoice_amount,
          1, v_item.invoice_amount, v_item.invoice_amount,
          TRUE
        );
        v_count := v_count + 1;
      END LOOP;
    END IF;

    -- ── ALL MODELS: Approved, billable, unbilled expenses ──────────
    FOR v_item IN
      SELECT e.id, e.description, e.amount
      FROM   expenses e
      WHERE  e.project_id   = p_project_id
        AND  e.is_billable  = TRUE
        AND  e.approved_by  IS NOT NULL
        AND  e.deleted_at   IS NULL
        AND  e.id NOT IN (
          SELECT expense_id FROM billing_items
          WHERE  expense_id IS NOT NULL
            AND  is_billed = TRUE
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
        'Expense: ' || v_item.description,
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

  ── FIX 2: billing.service.ts — Auto-send Invoice After Generation ───────────

  ```typescript
  // modules/billing/billing.service.ts
  // CHANGE: generateInvoiceFromSession()
  // After invoice is created with status 'draft',
  // immediately transition it to 'sent'
  // because manager approval IS the send authorization.

  async generateInvoiceFromSession(
    sessionId: string
  ): Promise<Result<string, DomainError>> {

    const sessionResult = await this.getSession(sessionId);
    if (isErr(sessionResult)) return sessionResult;
    const session = sessionResult.data;

    // ── Guard: session must be approved ──
    if (session.status !== 'approved') {
      return err(
        new BusinessRuleError(
          `Cannot generate invoice: session is "${session.status}", expected "approved"`,
          { sessionId }
        )
      );
    }

    // ── Guard: prevent duplicate invoice generation ──
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number, status')
      .eq('project_id', session.projectId)
      .in('status', ['draft', 'sent', 'unpaid', 'partial', 'paid'])
      .not('id', 'is', null)
      .maybeSingle();

    if (existingInvoice) {
      console.log(
        `[Billing] Invoice already exists for project ${session.projectId}:`,
        existingInvoice.invoice_number
      );
      // Return existing invoice ID — idempotent
      return ok(existingInvoice.id);
    }

    // ── Fetch project ──
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*, clients(company_name)')
      .eq('id', session.projectId)
      .single();

    if (projErr || !project) {
      return err(new NotFoundError('Project', session.projectId));
    }

    // ── Filter billable items ──
    const billableItems = session.items.filter(
      (item) => item.isBillable && !item.isWrittenOff && item.amount > 0
    );

    if (billableItems.length === 0) {
      return err(
        new BusinessRuleError(
          'No billable items to invoice',
          { sessionId, totalItems: session.items.length }
        )
      );
    }

    // ── Calculate financials ──
    const subtotal  = session.netAmount;
    const taxRate   = 0.19;
    const taxAmount = Math.round(subtotal * taxRate * 1000) / 1000;
    const total     = subtotal + taxAmount;

    // ── Generate invoice number ──
    const invoiceNumber = await invoiceRepository.generateInvoiceNumber('INV');

    // ── Create invoice as DRAFT first ──
    const { data: invoiceRow, error: invoiceErr } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id:       project.sales_order_id ?? null,
        project_id:     session.projectId,
        client_id:      project.client_id,
        customer_name:  project.clients?.company_name ?? 'Client',
        type:           'standard',
        status:         'draft',          // start as draft
        issue_date:     new Date().toISOString().split('T')[0],
        due_date:       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          .toISOString().split('T')[0],
        subtotal,
        tax_amount:     taxAmount,
        total,
        amount_paid:    0,
        amount_due:     total,
        notes: `Generated from billing session (${session.billingModel}). ` +
               `Reviewed and approved by manager.`,
      })
      .select()
      .single();

    if (invoiceErr || !invoiceRow) {
      return err(mapSupabaseError(invoiceErr, 'generateInvoiceFromSession'));
    }

    // ── Create invoice line items ──
    const lineItems = billableItems.map((item) => ({
      invoice_id:      invoiceRow.id,
      description:     item.description,
      quantity:        item.quantity,
      unit_price:      item.unitPrice,
      subtotal:        item.amount,
      type:            this.mapSourceToLineItemType(item.sourceType),
      billing_item_id: item.id,
      task_id:         item.taskId      ?? null,
      timesheet_id:    item.timesheetId ?? null,
      milestone_id:    item.milestoneId ?? null,
      expense_id:      item.expenseId   ?? null,
    }));

    const { error: lineItemsErr } = await supabase
      .from('invoice_line_items')
      .insert(lineItems);

    if (lineItemsErr) {
      // Rollback invoice
      await supabase.from('invoices').delete().eq('id', invoiceRow.id);
      return err(mapSupabaseError(lineItemsErr, 'createInvoiceLineItems'));
    }

    // ── Mark billing items as billed ──
    const now = new Date().toISOString();
    const billingItemIds = billableItems.map((i) => i.id);

    await supabase
      .from('billing_items')
      .update({ is_billed: true, billed_at: now })
      .in('id', billingItemIds);

    // ── Mark source records as billed ──
    const timesheetIds = billableItems
      .filter((i) => i.timesheetId != null)
      .map((i) => i.timesheetId!);

    const taskIds = billableItems
      .filter((i) => i.taskId != null)
      .map((i) => i.taskId!);

    if (timesheetIds.length > 0) {
      await supabase
        .from('timesheets')
        .update({ is_billed: true, billed_at: now })
        .in('id', timesheetIds);
    }

    if (taskIds.length > 0) {
      await supabase
        .from('project_tasks')
        .update({ is_billed: true, billed_at: now })
        .in('id', taskIds);
    }

    // ── Sync billing_item_id back to project_tasks ────────────────
    // (Fixes the NULL task values issue)
    for (const item of billableItems) {
      if (item.taskId) {
        const { error: syncErr } = await supabase
          .from('project_tasks')
          .update({
            billing_item_id: item.id,
            billing_rate:    item.unitPrice,
            billed_at:       now,
          })
          .eq('id', item.taskId);

        if (syncErr) {
          console.warn(
            `[Billing] Could not sync billing_item_id to task ${item.taskId}:`,
            syncErr.message
          );
          // Non-fatal: log and continue
        }
      }
    }

    // ── NOW: Transition draft → sent ─────────────────────────────
    // Manager approval IS the authorization to send.
    // No separate manual step needed for billing-session invoices.
    const { error: sendErr } = await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', invoiceRow.id);

    if (sendErr) {
      console.error(
        '[Billing] Invoice created but failed to transition to sent:',
        sendErr.message
      );
      // Non-fatal: invoice exists as draft, can be sent manually
    }

    // ── Update project billing status ──
    await supabase
      .from('projects')
      .update({ billing_status: 'invoiced' })
      .eq('id', session.projectId);

    // ── Audit log ──
    await this.logSessionEvent(
      sessionId, null,
      'invoice_generated',
      null,
      {
        invoiceId:     invoiceRow.id,
        invoiceNumber,
        total,
        status:        sendErr ? 'draft' : 'sent',
      }
    );

    // ── Publish events ──
    void eventBus.emit(EVENT_NAMES.INVOICE_CREATED, {
      invoice: {
        id:         invoiceRow.id,
        number:     invoiceNumber,
        total,
        customerId: project.client_id,
        status:     'sent',
      },
    });

    // Only emit INVOICE_SENT if transition succeeded
    if (!sendErr) {
      void eventBus.emit(EVENT_NAMES.INVOICE_SENT, {
        invoiceId:    invoiceRow.id,
        clientId:     project.client_id,
        invoiceNumber,
        total,
        dueDate:      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString().split('T')[0],
      });
    }

    console.log(
      `[Billing] ✅ Invoice ${invoiceNumber} generated and sent` +
      ` for project ${session.projectId}`
    );

    return ok(invoiceRow.id);
  },
  ```

  ── FIX 3: Event Registration — Ensure Modules Load at Startup ───────────────

  ```typescript
  // src/main.tsx or src/app.ts — ADD THESE IMPORTS
  // These are side-effect imports that register EventBus listeners

  // ⚠️ ORDER MATTERS: dependencies first
  import './modules/crm/crm.service';        // no dependencies
  import './modules/sales/sales.service';    // depends on CRM
  import './modules/project/project.service'; // depends on Sales
  import './modules/billing/billing.service'; // depends on Project
  import './modules/invoice/invoice.service'; // depends on Billing
  ```

  ── FIX 4: Event Names — Verify Constants are Consistent ────────────────────

  ```typescript
  // shared/events/event-names.ts — COMPLETE FILE
  // Ensure every publisher and subscriber uses the SAME constant

  export const EVENT_NAMES = {
    // CRM
    CRM_DEAL_WON:              'crm.deal.won',
    CRM_CLIENT_PAYMENT_RECORDED: 'crm.client.payment_recorded',
    CRM_CLIENT_AGING_UPDATED:  'crm.client.aging_updated',

    // Sales
    SALES_ORDER_CONFIRMED:     'sales.order.confirmed',
    SALES_ORDER_CANCELLED:     'sales.order.cancelled',

    // Project
    PROJECT_CREATED:           'project.created',
    PROJECT_COMPLETED:         'project.completed',
    PROJECT_TIMESHEET_APPROVED:'project.timesheet.approved',
    PROJECT_MILESTONE_REACHED: 'project.milestone.reached',

    // Billing
    BILLING_SESSION_OPENED:    'billing.session.opened',
    BILLING_SESSION_APPROVED:  'billing.session.approved',
    BILLING_SESSION_REJECTED:  'billing.session.rejected',
    BILLING_ITEM_ADJUSTED:     'billing.item.adjusted',
    BILLING_ITEM_WRITTEN_OFF:  'billing.item.written_off',

    // Invoice
    INVOICE_CREATED:           'invoice.created',
    INVOICE_SENT:              'invoice.sent',
    INVOICE_PAID:              'invoice.paid',
    INVOICE_OVERDUE:           'invoice.overdue',
    INVOICE_CANCELLED:         'invoice.cancelled',

    // Expense
    EXPENSE_APPROVED:          'expense.approved',
  } as const;

  export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];
  ```

═══════════════════════════════════════════════════════════════════════════════
STEP 4 — VERIFICATION CHECKLIST (RUN AFTER FIXES)
═══════════════════════════════════════════════════════════════════════════════

  Run through this checklist in order.
  Every item must pass before the flow is considered fixed.

  PHASE A — Database Health
  □ A1: Run migration 007 — no errors
  □ A2: project_tasks has columns: billing_item_id, billing_rate,
         billed_at, is_billed
  □ A3: billing_items FK points to project_tasks (not a ghost 'tasks' table)
  □ A4: invoice_line_items has columns: billing_item_id, task_id,
         timesheet_id, milestone_id
  □ A5: fn_extract_billable_items() returns > 0 for a project with
         approved timesheets

  PHASE B — Event Flow
  □ B1: Complete a project → console shows:
         "[Billing] PROJECT_COMPLETED received for: <id>"
         "[Billing] ✅ Billing session opened for project <id>"
  □ B2: Check DB: billing_sessions row exists with status = 'open'
  □ B3: Check DB: billing_items rows exist (count > 0)
  □ B4: Approve session → console shows:
         "[Billing] BILLING_SESSION_APPROVED received for: <id>"
         "[Billing] ✅ Invoice INV-XXXXXX generated and sent for project <id>"
  □ B5: Check DB: invoices row exists with status = 'sent'
  □ B6: Check DB: invoice_line_items rows exist, billing_item_id populated
  □ B7: Check DB: billing_items.is_billed = true for all billed items
  □ B8: Check DB: timesheets.is_billed = true
  □ B9: Check DB: project_tasks.billing_item_id populated (not NULL)
  □ B10: Check DB: project.billing_status = 'invoiced'

  PHASE C — UI Verification
  □ C1: Invoice appears in invoice list with status badge 'Sent'
  □ C2: Invoice detail shows correct line items matching billing items
  □ C3: Each line item traces back to task/timesheet/milestone
  □ C4: Project detail shows billing_status = 'Invoiced'
  □ C5: No 400 errors in browser console or network tab

  PHASE D — Edge Cases
  □ D1: Completing the SAME project twice does NOT create duplicate sessions
         (ConflictError returned, no second session)
  □ D2: Approving session twice does NOT create duplicate invoices
         (idempotency guard returns existing invoice ID)
  □ D3: A project with 0 approved timesheets creates a session with 0 items
         → approveSession() returns BusinessRuleError (not a crash)

═══════════════════════════════════════════════════════════════════════════════
FINAL OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

  Deliver your response in this structure:

  ## 1. PIPELINE TRACE TABLE
  (completed table from Step 1 with ✅/❌/⚠️ for each layer)

  ## 2. ROOT CAUSE SUMMARY
  (2-3 sentences: exactly what was broken and why)

  ## 3. MIGRATION 007
  (complete SQL file)

  ## 4. FIXED billing.service.ts
  (complete file — generateInvoiceFromSession + event listeners)

  ## 5. FIXED event-names.ts
  (complete file)

  ## 6. STARTUP IMPORTS FIX
  (main.tsx additions)

  ## 7. VERIFICATION RESULTS
  (run the checklist, mark each ✅ or ❌ with evidence)

  ## 8. UPDATED TODOS.md
  (mark Phase 3 items as complete or note remaining gaps)
```