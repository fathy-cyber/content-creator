# Debugging: Cannot Open Billing Session for New Project

## Step 1: Read the Logs Carefully

```
WHAT THE LOGS TELL US
─────────────────────────────────────────────────────────────────────────

✓ EventBus working:
  [EventBus] Registering handler: generateInvoiceFromSession 
  for event: billing.session.approved [Module: invoice]
  → The billing session handler IS registered

✓ Project events working:
  [useProjectEvents] Subscribing to events (project.updated, etc.)
  → Project event system IS working

✓ Project data loading:
  [ProjectCardModal] Fetched data: 0/4 tasks complete
  → Project 49 IS loading

✗ THE PROBLEM — NOT IN THE LOGS:
  The billing session open action produces NO log output at all.
  This means the error happens BEFORE any billing code runs,
  likely in the UI layer (button click → function never called)
  OR the function throws silently.
─────────────────────────────────────────────────────────────────────────
```

---

## Step 2: Find the Exact Failure Point

```bash
# Run these to locate the billing session code
grep -rn "openBillingSession\|billing.session\|SESSION_OPENED\|BillingSession" src/ \
  --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# Find the billing tab component
find src -name "*Billing*" -o -name "*billing*" | grep -v node_modules

# Find where openBillingSession is called
grep -rn "openBillingSession" src/ --include="*.ts" --include="*.tsx"
```

---

## Step 3: The Most Likely Causes

```
CAUSE 1 — Missing tables (most likely for a new project)
  billing_sessions table does not exist in Supabase yet
  → INSERT fails silently or with unhandled error

CAUSE 2 — No billable items found
  New project has no timesheets/expenses/milestones yet
  → collectBillableItems() returns []
  → throws "No billable items found"
  → UI catches nothing → nothing happens

CAUSE 3 — Wrong project_id type
  project_projects.id = bigint
  billing_sessions.project_id expects bigint
  → passing string "49" instead of number 49

CAUSE 4 — Missing contact_id
  New project might not have customer_id set
  → billing_sessions.contact_id NOT NULL constraint fails

CAUSE 5 — RLS blocking the INSERT
  Row Level Security on billing_sessions
  → anon/authenticated role cannot insert
```

---

## Step 4: Verify Tables Exist

```sql
-- Run in Supabase SQL Editor

-- Check which billing tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'billing_sessions',
    'billing_session_items', 
    'invoices',
    'invoice_lines',
    'invoice_payments',
    'sales_orders'
  );

-- Check billing_sessions columns if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'billing_sessions'
ORDER BY ordinal_position;

-- Check the project that fails (project 49)
SELECT 
  p.id,
  p.name,
  p.customer_id,
  p.billing_model,
  p.billing_status,
  c.name as customer_name,
  -- Count billable items
  (SELECT COUNT(*) FROM timesheets t 
   WHERE t.project_id = p.id 
   AND t.is_billed = false) as unbilled_timesheets,
  (SELECT COUNT(*) FROM expenses e 
   WHERE e.project_id = p.id 
   AND e.is_billed = false) as unbilled_expenses,
  (SELECT COUNT(*) FROM milestones m 
   WHERE m.project_id = p.id 
   AND m.invoice_trigger = true 
   AND m.is_billed = false
   AND m.status = 'completed') as billable_milestones
FROM project_projects p
LEFT JOIN crm_contacts c ON c.id = p.customer_id
WHERE p.id = 49;
```

---

## Step 5: Add Proper Error Handling to the Billing UI

```tsx
// Find your billing tab or billing session button component
// Add this defensive wrapper around the openBillingSession call

// src/modules/billing/components/BillingSessionOpener.tsx
'use client'

import { useState }           from 'react'
import { openBillingSession } from '../billingEngine'
import { AlertCircle, Loader2, Plus } from 'lucide-react'

interface Props {
  projectId:  number
  contactId:  number | null
  employeeId: string
}

export function BillingSessionOpener({ 
  projectId, 
  contactId,
  employeeId 
}: Props) {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  async function handleOpen() {
    setError(null)
    setSuccess(null)

    // ── Pre-flight checks BEFORE calling the engine ──

    if (!projectId) {
      setError('No project selected')
      return
    }

    if (!contactId) {
      setError(
        'This project has no client assigned. ' +
        'Go to the Client tab and assign a contact first.'
      )
      return
    }

    setLoading(true)

    try {
      console.log('[BillingSession] Opening session for project:', projectId)

      const result = await openBillingSession({
        projectId,
        contactId,
        createdBy: employeeId,
      })

      console.log('[BillingSession] Session opened:', result.sessionId)
      setSuccess(
        `Billing session opened with ${result.items.length} items collected`
      )

    } catch (err: unknown) {
      console.error('[BillingSession] Failed to open session:', err)

      // Parse the error to give a helpful message
      const message = err instanceof Error ? err.message : String(err)

      if (message.includes('No billable items')) {
        setError(
          'No billable items found for this project. ' +
          'Make sure you have: approved timesheets, billable expenses, ' +
          'completed milestones with invoice_trigger=true, or done billable tasks.'
        )
      } else if (message.includes('not found')) {
        setError(`Project or contact not found: ${message}`)
      } else if (message.includes('violates')) {
        setError(
          `Database constraint error. Check that: ` +
          `1) billing_sessions table exists, ` +
          `2) contact_id is valid, ` +
          `3) project_id is valid. ` +
          `Details: ${message}`
        )
      } else {
        setError(`Unexpected error: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleOpen}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 
                   text-white rounded-lg hover:bg-blue-700 
                   disabled:opacity-50 transition-colors text-sm font-medium"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Plus className="w-4 h-4" />
        }
        {loading ? 'Opening session...' : 'Open Billing Session'}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 
                       border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">✓ {success}</p>
        </div>
      )}
    </div>
  )
}
```

---

## Step 6: Fix the billingEngine — Handle New Projects

```typescript
// src/modules/billing/billingEngine.ts
// The key fix: allow opening a session even with 0 items
// + better error messages + type safety

export async function openBillingSession(
  input: OpenBillingSessionInput
): Promise<{ sessionId: string; items: CollectedItem[] }> {

  console.log('[BillingEngine] Opening session:', input)

  // ── 1. Validate inputs ──────────────────────────────────────────────
  if (!input.projectId) {
    throw new Error('projectId is required')
  }

  if (!input.contactId) {
    throw new Error(
      'contactId is required. Assign a client to the project first.'
    )
  }

  // ── 2. Load project ─────────────────────────────────────────────────
  const { data: project, error: projectError } = await supabase
    .from('project_projects')
    .select('id, name, customer_id, billing_model, billing_status, active')
    .eq('id', input.projectId)   // projectId is number (bigint)
    .single()

  if (projectError) {
    console.error('[BillingEngine] Project fetch error:', projectError)
    throw new Error(`Failed to load project: ${projectError.message}`)
  }

  if (!project) {
    throw new Error(`Project ${input.projectId} not found`)
  }

  if (!project.active) {
    throw new Error('Cannot open billing session for an archived project')
  }

  console.log('[BillingEngine] Project loaded:', project.name)

  // ── 3. Check for existing open session ──────────────────────────────
  const { data: existingSession } = await supabase
    .from('billing_sessions')
    .select('id, reference, status')
    .eq('project_id', input.projectId)
    .in('status', ['open', 'reviewing', 'approved'])
    .maybeSingle()

  if (existingSession) {
    throw new Error(
      `A billing session is already open for this project: ` +
      `${existingSession.reference} (${existingSession.status}). ` +
      `Close or invoice the existing session first.`
    )
  }

  // ── 4. Collect billable items ────────────────────────────────────────
  const items = await collectBillableItems(
    input.projectId,
    input.periodStart,
    input.periodEnd,
  )

  console.log(`[BillingEngine] Collected ${items.length} billable items`)

  // ── KEY FIX: Allow empty sessions for new projects ──
  // New projects legitimately have no items yet
  // The manager can add manual lines in the session UI
  // Only block if billing_model requires items
  // (for milestone billing, warn but allow)

  // ── 5. Calculate totals ──────────────────────────────────────────────
  const subtotalLabor      = items
    .filter(i => i.source_type === 'timesheet')
    .reduce((s, i) => s + i.amount, 0)
  const subtotalExpenses   = items
    .filter(i => i.source_type === 'expense')
    .reduce((s, i) => s + i.amount, 0)
  const subtotalMilestones = items
    .filter(i => i.source_type === 'milestone')
    .reduce((s, i) => s + i.amount, 0)
  const subtotalTasks      = items
    .filter(i => i.source_type === 'task')
    .reduce((s, i) => s + i.amount, 0)
  const subtotal           = subtotalLabor + subtotalExpenses
                           + subtotalMilestones + subtotalTasks
  const taxRate            = input.taxRate ?? 0
  const taxAmount          = subtotal * (taxRate / 100)
  const total              = subtotal + taxAmount

  // ── 6. Create the billing session ───────────────────────────────────
  const { data: session, error: sessionError } = await supabase
    .from('billing_sessions')
    .insert({
      project_id:          Number(input.projectId),   // ensure number
      contact_id:          Number(input.contactId),   // ensure number
      sales_order_id:      input.salesOrderId ?? null,
      title:               `Billing — ${project.name}`,
      period_start:        input.periodStart ?? null,
      period_end:          input.periodEnd ?? null,
      status:              'open',
      subtotal_labor:      subtotalLabor,
      subtotal_expenses:   subtotalExpenses,
      subtotal_milestones: subtotalMilestones,
      subtotal_tasks:      subtotalTasks,
      subtotal,
      tax_rate:            taxRate,
      tax_amount:          taxAmount,
      total,
      created_by:          input.createdBy,
    })
    .select()
    .single()

  if (sessionError) {
    console.error('[BillingEngine] Session insert error:', sessionError)
    throw new Error(
      `Failed to create billing session: ${sessionError.message} ` +
      `(code: ${sessionError.code})`
    )
  }

  if (!session) {
    throw new Error('Billing session was not created (no data returned)')
  }

  console.log('[BillingEngine] Session created:', session.id, session.reference)

  // ── 7. Insert collected items (only if any) ──────────────────────────
  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('billing_session_items')
      .insert(items.map(item => ({
        billing_session_id: session.id,
        source_type:        item.source_type,
        source_id:          item.source_id,
        description:        item.description,
        quantity:           item.quantity,
        unit:               item.unit,
        unit_price:         item.unit_price,
        amount:             item.amount,
        tax_rate:           item.tax_rate,
        tax_amount:         item.amount * (item.tax_rate / 100),
        is_included:        true,
      })))

    if (itemsError) {
      console.error('[BillingEngine] Items insert error:', itemsError)
      // Don't throw — session is created, items can be added manually
      console.warn('[BillingEngine] Session created but items failed to insert')
    }
  }

  // ── 8. Update project billing_status ────────────────────────────────
  await supabase
    .from('project_projects')
    .update({
      billing_status: 'in_progress',
      updated_at:     new Date().toISOString(),
    })
    .eq('id', Number(input.projectId))

  console.log('[BillingEngine] Session open complete')

  return { sessionId: session.id, items }
}
```

---

## Step 7: Check Supabase RLS

```sql
-- Run in Supabase SQL Editor
-- Check if RLS is blocking the insert

-- 1. See RLS policies on billing_sessions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'billing_sessions';

-- 2. If no policies exist but RLS is enabled → nobody can insert
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'billing_sessions';

-- 3. Quick fix: allow authenticated users to manage billing sessions
-- (adjust based on your security model)

ALTER TABLE billing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_users_billing_sessions"
  ON billing_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Same for billing_session_items
CREATE POLICY "authenticated_users_billing_items"
  ON billing_session_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## Step 8: Add Debug Logging to Find Exact Failure

```typescript
// Temporarily add this to your billing button handler
// to see exactly where it breaks

async function debugOpenBillingSession(projectId: number) {
  console.group('[BillingDebug] Opening session')
  
  // Step 1: Check project exists
  console.log('Step 1: Loading project', projectId, typeof projectId)
  const { data: proj, error: projErr } = await supabase
    .from('project_projects')
    .select('id, name, customer_id, active')
    .eq('id', projectId)
    .single()
  console.log('Project:', proj, 'Error:', projErr)

  // Step 2: Check contact
  if (proj?.customer_id) {
    console.log('Step 2: Loading contact', proj.customer_id)
    const { data: contact, error: contactErr } = await supabase
      .from('crm_contacts')
      .select('id, name')
      .eq('id', proj.customer_id)
      .single()
    console.log('Contact:', contact, 'Error:', contactErr)
  } else {
    console.warn('Step 2: NO customer_id on project!')
  }

  // Step 3: Check billing_sessions table exists
  console.log('Step 3: Testing billing_sessions table access')
  const { data: testData, error: tableErr } = await supabase
    .from('billing_sessions')
    .select('id')
    .limit(1)
  console.log('Table access:', testData, 'Error:', tableErr)

  // Step 4: Count billable items
  const [ts, ex, ms] = await Promise.all([
    supabase.from('timesheets').select('id', { count: 'exact', head: true })
      .eq('project_id', projectId).eq('is_billed', false),
    supabase.from('expenses').select('id', { count: 'exact', head: true })
      .eq('project_id', projectId).eq('is_billed', false),
    supabase.from('milestones').select('id', { count: 'exact', head: true })
      .eq('project_id', projectId).eq('is_billed', false)
      .eq('invoice_trigger', true).eq('status', 'completed'),
  ])
  console.log('Billable items:', {
    timesheets: ts.count,
    expenses:   ex.count,
    milestones: ms.count,
  })

  console.groupEnd()
}

// Call it on button click before the real function
// debugOpenBillingSession(projectId)
```

---

