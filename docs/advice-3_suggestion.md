ERROR 1: POST /rpc/create_task → 404
         RPC function doesn't exist in Supabase

ERROR 2: POST /billing_items → 400
         null billing_session_id violates NOT NULL constraint
         (createBillingItem called without a session)

ERROR 3: POST /rpc/update_task → 404
         RPC function doesn't exist in Supabase

ERROR 4: PATCH /project_projects?id=eq.11 → 400
         Wrong table name (project_projects vs projects)


-- ══════════════════════════════════════════════════════════════
-- CHECK 1: Which RPC functions actually exist?
-- ══════════════════════════════════════════════════════════════
SELECT
  routine_name,
  routine_type,
  specific_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_task', 'update_task',
    'create_project_task', 'update_project_task',
    'get_tasks', 'get_project_tasks'
  )
ORDER BY routine_name;
-- If empty → functions never existed or were dropped


RESULT OUTPUT :
routine_name,routine_type,specific_name
create_task,FUNCTION,create_task_23171
update_task,FUNCTION,update_task_23172

-- ══════════════════════════════════════════════════════════════
-- CHECK 2: What is the actual projects table name?
-- ══════════════════════════════════════════════════════════════
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema = 'public'
  AND  table_name LIKE '%project%'
ORDER BY table_name;
-- Shows: project_tasks, project_projects, projects ?
-- You need to know the REAL name

RESULT :
table_name
project_projects
project_tasks

-- ══════════════════════════════════════════════════════════════
-- CHECK 3: What columns does the projects table have?
-- ══════════════════════════════════════════════════════════════
SELECT column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  table_name IN ('projects', 'project_projects')
ORDER BY table_name, ordinal_position;

--
RESULT : 
column_name,data_type,is_nullable
id,bigint,NO
name,character varying,NO
description,text,YES
manager_id,character varying,YES
start_date,date,YES
end_date,date,YES
customer_id,bigint,YES
customer_name,character varying,YES
sales_order_id,uuid,YES
status,character varying,YES
progress,integer,YES
budget,numeric,YES
tasks_count,integer,YES
completed_tasks_count,integer,YES
active,boolean,YES
created_at,timestamp without time zone,YES
updated_at,timestamp without time zone,YES
billing_model,USER-DEFINED,NO
billing_status,USER-DEFINED,NO
retainer_amount,numeric,YES
billing_reviewed_by,uuid,YES
billing_reviewed_at,timestamp with time zone,YES
billing_notes,text,YES
payment_status,USER-DEFINED,YES


-- ══════════════════════════════════════════════════════════════
-- CHECK 4: What columns does project_tasks have?
-- ══════════════════════════════════════════════════════════════
SELECT column_name, data_type, is_nullable, column_default
FROM   information_schema.columns
WHERE  table_name = 'project_tasks'
ORDER BY ordinal_position;
--
RESULT :

column_name,data_type,is_nullable,column_default
id,bigint,NO,nextval('project_tasks_id_seq'::regclass)
project_id,bigint,NO,null
name,character varying,NO,null
description,text,YES,null
employee_id,uuid,YES,null
deadline,date,YES,null
estimated_hours,numeric,YES,null
actual_hours,numeric,YES,null
stage,character varying,YES,'todo'::character varying
priority,character varying,YES,'medium'::character varying
quantity,integer,YES,1
progress,integer,YES,0
order_index,integer,YES,0
active,boolean,YES,true
created_at,timestamp without time zone,YES,now()
updated_at,timestamp without time zone,YES,now()
is_billable,boolean,NO,true
is_billed,boolean,NO,false
billed_at,timestamp with time zone,YES,null
billing_rate,numeric,YES,null
writeoff_hours,numeric,YES,0
billing_item_id,uuid,YES,null
timesheet_id,uuid,YES,null
milestone_id,uuid,YES,null
expense_id,uuid,YES,null

-- ══════════════════════════════════════════════════════════════
-- CHECK 5: Find the open billing session for project 15
-- ══════════════════════════════════════════════════════════════
SELECT id, project_id, status, billing_model,
       gross_amount, net_amount, created_at
FROM   billing_sessions
WHERE  project_id = '11'   -- try both formats
   OR  project_id::text = '11'
ORDER BY created_at DESC
LIMIT 5;

--
RESULT :

id,project_id,status,billing_model,gross_amount,net_amount,created_at
54e75022-81e5-4790-8769-a09e42b97d84,11,approved,time_and_material,30.000,60.000,2026-05-16 10:54:29.63313+00

===================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- FIX 1: Create create_task RPC (was 404)
-- Replaces any broken/ambiguous overloads
-- ══════════════════════════════════════════════════════════════

-- Drop ALL overloads first (fixes "best candidate" ambiguity)
DROP FUNCTION IF EXISTS create_task(uuid, text, text, text, text, uuid, numeric, date);
DROP FUNCTION IF EXISTS create_task(bigint, text, text, text, text, uuid, numeric, date);
DROP FUNCTION IF EXISTS create_task(text, text, text, text, text, uuid, numeric, date);
DROP FUNCTION IF EXISTS create_task CASCADE;

-- Check actual project_tasks column types first, then create
-- This function uses the CORRECT types matching your schema
CREATE OR REPLACE FUNCTION create_task(
  p_project_id    BIGINT,         -- matches project_tasks.project_id type
  p_title         TEXT,
  p_description   TEXT    DEFAULT NULL,
  p_status        TEXT    DEFAULT 'todo',
  p_priority      TEXT    DEFAULT 'medium',
  p_employee_id   UUID    DEFAULT NULL,    -- renamed from assigned_to
  p_estimated_hours NUMERIC DEFAULT NULL,
  p_due_date      DATE    DEFAULT NULL,
  p_is_billable   BOOLEAN DEFAULT TRUE
)
RETURNS SETOF project_tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO project_tasks (
    project_id,
    title,
    description,
    status,
    priority,
    employee_id,
    estimated_hours,
    due_date,
    is_billable,
    created_at,
    updated_at
  ) VALUES (
    p_project_id,
    p_title,
    NULLIF(p_description, ''),
    p_status,
    p_priority,
    p_employee_id,
    p_estimated_hours,
    p_due_date,
    p_is_billable,
    NOW(),
    NOW()
  )
  RETURNING *;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- FIX 2: Create update_task RPC (was 404)
-- ══════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS update_task CASCADE;

CREATE OR REPLACE FUNCTION update_task(
  p_id            BIGINT,
  p_title         TEXT    DEFAULT NULL,
  p_description   TEXT    DEFAULT NULL,
  p_status        TEXT    DEFAULT NULL,
  p_priority      TEXT    DEFAULT NULL,
  p_employee_id   UUID    DEFAULT NULL,
  p_estimated_hours NUMERIC DEFAULT NULL,
  p_actual_hours  NUMERIC DEFAULT NULL,
  p_due_date      DATE    DEFAULT NULL,
  p_is_billable   BOOLEAN DEFAULT NULL,
  p_billing_rate  NUMERIC DEFAULT NULL
)
RETURNS SETOF project_tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE project_tasks SET
    title           = COALESCE(p_title,           title),
    description     = COALESCE(p_description,     description),
    status          = COALESCE(p_status,           status),
    priority        = COALESCE(p_priority,         priority),
    employee_id     = COALESCE(p_employee_id,      employee_id),
    estimated_hours = COALESCE(p_estimated_hours,  estimated_hours),
    actual_hours    = COALESCE(p_actual_hours,     actual_hours),
    due_date        = COALESCE(p_due_date,         due_date),
    is_billable     = COALESCE(p_is_billable,      is_billable),
    billing_rate    = COALESCE(p_billing_rate,     billing_rate),
    updated_at      = NOW()
  WHERE id = p_id
  RETURNING *;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- FIX 3: Fix the projects table name confusion
-- Check which one actually exists and create a view/alias
-- ══════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- If 'project_projects' exists but 'projects' doesn't → rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE  table_name = 'project_projects'
      AND  table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE  table_name = 'projects'
      AND  table_schema = 'public'
  ) THEN
    ALTER TABLE project_projects RENAME TO projects;
    RAISE NOTICE 'Renamed project_projects → projects';

  -- If both exist → create a view alias
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE  table_name = 'project_projects'
      AND  table_schema = 'public'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE  table_name = 'projects'
      AND  table_schema = 'public'
  ) THEN
    RAISE NOTICE 'Both tables exist — check which is authoritative';

  ELSE
    RAISE NOTICE 'projects table already correct';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- FIX 4: Ensure project_tasks has all required columns
-- ══════════════════════════════════════════════════════════════

ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS is_billable     BOOLEAN   DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_billed       BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS billed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_rate    NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS billing_item_id UUID,
  ADD COLUMN IF NOT EXISTS actual_hours    NUMERIC(8,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- Add FK for billing_item_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE  constraint_name = 'project_tasks_billing_item_id_fkey'
      AND  table_name = 'project_tasks'
  ) THEN
    ALTER TABLE project_tasks
      ADD CONSTRAINT project_tasks_billing_item_id_fkey
      FOREIGN KEY (billing_item_id)
      REFERENCES  billing_items(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- FIX 5: Grant RPC execute permissions
-- ══════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION create_task TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_task TO authenticated, service_role;

-- ══════════════════════════════════════════════════════════════
-- FIX 6: Add updated_at trigger to project_tasks
-- ══════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trg_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER trg_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMIT;


========================================================================

// ProjectList.tsx — Complete fixed version of affected functions

// ══════════════════════════════════════════════════════════════
// FIX ERROR 1 & 3: create_task / update_task RPC → 404
// Use direct table insert/update instead of broken RPCs
// ══════════════════════════════════════════════════════════════

// ── Replace your saveNewTask function ────────────────────────
const saveNewTask = async (
  projectId: number | string,
  taskData: {
    title:          string;
    description?:   string;
    status?:        string;
    priority?:      string;
    employee_id?:   string;
    estimated_hours?: number;
    due_date?:      string;
    is_billable?:   boolean;
  }
) => {
  try {
    // ── Direct table insert (bypass broken RPC) ──
    const { data: newTask, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id:     Number(projectId),
        title:          taskData.title,
        description:    taskData.description     ?? null,
        status:         taskData.status          ?? 'todo',
        priority:       taskData.priority        ?? 'medium',
        employee_id:    taskData.employee_id     ?? null,
        estimated_hours: taskData.estimated_hours ?? null,
        due_date:       taskData.due_date        ?? null,
        is_billable:    taskData.is_billable     ?? true,
        actual_hours:   0,
        created_at:     new Date().toISOString(),
        updated_at:     new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[ProjectList] Failed to create task:', error.message);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    console.log('[ProjectList] ✅ Task created:', newTask.id);

    // ── FIX ERROR 2: Only create billing item if session exists ──
    await tryCreateBillingItemForTask(newTask, projectId);

    return newTask;

  } catch (e) {
    console.error('[ProjectList] saveNewTask error:', e);
    throw e;
  }
};

// ══════════════════════════════════════════════════════════════
// FIX ERROR 2: null billing_session_id
// Only create billing item if an OPEN session exists
// ══════════════════════════════════════════════════════════════

const tryCreateBillingItemForTask = async (
  task:      { id: number; title: string; estimated_hours?: number | null },
  projectId: number | string
): Promise<void> => {

  try {
    // Step 1: Find open billing session for this project
    const { data: session, error: sessionError } = await supabase
      .from('billing_sessions')
      .select('id, status, billing_model')
      .eq('project_id', String(projectId))
      .eq('status', 'open')
      .is('deleted_at', null)
      .maybeSingle();

    if (sessionError) {
      console.warn(
        '[ProjectList] Could not query billing sessions:',
        sessionError.message
      );
      return; // Non-fatal: task saved, billing item skipped
    }

    if (!session) {
      // No open session → this is normal (project not completed yet)
      // Tasks will be extracted when project completes via fn_extract_billable_items
      console.log(
        `[ProjectList] No open billing session for project ${projectId}. ` +
        `Task will be included when project completes.`
      );
      return;
    }

    // Step 2: Session exists and is open → add task as billing item
    const { error: itemError } = await supabase
      .from('billing_items')
      .insert({
        billing_session_id: session.id,            // ← NOT NULL satisfied
        source_type:        'task',
        task_id:            task.id,
        description:        task.title,
        quantity:           task.estimated_hours ?? 0,
        unit_price:         0,                     // rate set later
        amount:             0,
        original_quantity:  task.estimated_hours ?? 0,
        original_unit_price: 0,
        original_amount:    0,
        is_billable:        true,
        is_written_off:     false,
        is_billed:          false,
      });

    if (itemError) {
      console.warn(
        '[ProjectList] Could not auto-create billing item for task:',
        itemError.message
      );
      // Non-fatal: task is saved, billing item can be added manually
      return;
    }

    console.log(
      `[ProjectList] ✅ Auto-created billing item for task ${task.id} ` +
      `in session ${session.id}`
    );

  } catch (e) {
    // NEVER let billing item creation crash the task save
    console.warn('[ProjectList] tryCreateBillingItemForTask failed silently:', e);
  }
};

// ══════════════════════════════════════════════════════════════
// FIX: updateTask — use direct table update (RPC was 404)
// ══════════════════════════════════════════════════════════════

const updateExistingTask = async (
  taskId:   number,
  updates:  Partial<{
    title:           string;
    description:     string;
    status:          string;
    priority:        string;
    employee_id:     string;
    estimated_hours: number;
    actual_hours:    number;
    due_date:        string;
    is_billable:     boolean;
    billing_rate:    number;
  }>
) => {
  const { data, error } = await supabase
    .from('project_tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('[ProjectList] Failed to update task:', error.message);
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return data;
};

===================================================================

// ══════════════════════════════════════════════════════════════
// FIX ERROR 4: PATCH /project_projects → 400
// Wrong table name used when updating project billing_status
// ══════════════════════════════════════════════════════════════

// Find every occurrence of 'project_projects' in billingService.ts
// and replace with the correct table name.

// ── Helper: get correct projects table name ───────────────────
// Add this constant at the top of billingService.ts

const PROJECTS_TABLE = 'projects'; // ← Change to 'project_projects'
                                   //   if that's your actual table name
                                   //   (check diagnostic query output)

// ── Fix updateProjectBillingStatus() ─────────────────────────
async updateProjectBillingStatus(
  projectId: string | number,
  billingStatus: string,
  extraFields: Record<string, any> = {}
): Promise<void> {

  const { error } = await supabase
    .from(PROJECTS_TABLE)               // ← uses constant, easy to fix
    .update({
      billing_status: billingStatus,
      updated_at:     new Date().toISOString(),
      ...extraFields,
    })
    .eq('id', projectId);

  if (error) {
    console.error(
      `[BillingService] Failed to update project ${projectId} billing_status:`,
      error.message,
      '\nTable used:', PROJECTS_TABLE,
      '\nIf 400: check actual table name with diagnostic query'
    );
    // Non-fatal: log and continue
    // The invoice/session are correct, only the status field failed
  }
},

// ── Replace all inline project updates in billing service ─────
// BEFORE (broken):
await supabase
  .from('project_projects')      // ❌ wrong table
  .update({ billing_status: 'invoiced' })
  .eq('id', session.projectId);

// AFTER (fixed):
await this.updateProjectBillingStatus(session.projectId, 'invoiced');

// ══════════════════════════════════════════════════════════════
// Also fix openBillingSession() project status update
// ══════════════════════════════════════════════════════════════

// BEFORE:
await supabase
  .from('project_projects')      // ❌
  .update({ billing_status: 'in_review' })
  .eq('id', projectId);

// AFTER:
await this.updateProjectBillingStatus(projectId, 'in_review');

// ══════════════════════════════════════════════════════════════
// And approveSession() project status update
// ══════════════════════════════════════════════════════════════

// AFTER:
await this.updateProjectBillingStatus(
  session.projectId,
  'approved',
  {
    billing_reviewed_by: dto.reviewedBy,
    billing_reviewed_at: now,
    billing_notes:       dto.reviewNotes ?? null,
  }
);

==========================================================

// ══════════════════════════════════════════════════════════════
// The exact error:
// "null value in column billing_session_id violates not-null constraint"
//
// billingService.createBillingItem() is called WITHOUT a sessionId
// from ProjectList.tsx line 237
//
// Fix: make billingSessionId required + add guard
// ══════════════════════════════════════════════════════════════

async createBillingItem(
  data: {
    billingSessionId: string;    // ← REQUIRED, not optional
    sourceType:       string;
    taskId?:          number | null;
    timesheetId?:     string | null;
    milestoneId?:     string | null;
    expenseId?:       string | null;
    description:      string;
    quantity?:        number;
    unitPrice?:       number;
    isBillable?:      boolean;
  }
): Promise<Result<BillingItem, DomainError>> {

  // ── Guard: billingSessionId is mandatory ──
  if (!data.billingSessionId) {
    return err(
      new ValidationError(
        'billingSessionId is required to create a billing item. ' +
        'Ensure an open billing session exists for this project first.',
        { received: data.billingSessionId }
      )
    );
  }

  // ── Guard: verify session exists and is open ──
  const { data: session, error: sessionCheckError } = await supabase
    .from('billing_sessions')
    .select('id, status')
    .eq('id', data.billingSessionId)
    .maybeSingle();

  if (sessionCheckError || !session) {
    return err(new NotFoundError('BillingSession', data.billingSessionId));
  }

  if (session.status !== 'open') {
    return err(
      new BusinessRuleError(
        `Cannot add billing item: session is "${session.status}", expected "open"`,
        { sessionId: data.billingSessionId, status: session.status }
      )
    );
  }

  const quantity  = data.quantity  ?? 0;
  const unitPrice = data.unitPrice ?? 0;
  const amount    = quantity * unitPrice;

  const { data: item, error } = await supabase
    .from('billing_items')
    .insert({
      billing_session_id:  data.billingSessionId,   // ← guaranteed not null
      source_type:         data.sourceType,
      task_id:             data.taskId        ?? null,
      timesheet_id:        data.timesheetId   ?? null,
      milestone_id:        data.milestoneId   ?? null,
      expense_id:          data.expenseId     ?? null,
      description:         data.description,
      quantity,
      unit_price:          unitPrice,
      amount,
      original_quantity:   quantity,
      original_unit_price: unitPrice,
      original_amount:     amount,
      is_billable:         data.isBillable    ?? true,
      is_written_off:      false,
      is_billed:           false,
    })
    .select()
    .single();

  if (error) {
    return err(mapSupabaseError(error, 'createBillingItem'));
  }

  // ── Recalculate session totals ──
  await this.recalculateSessionTotals(data.billingSessionId);

  return ok(this.toItemEntity(item));
},

=====================================================================

┌────┬────────────────────────────────────┬──────────────────────────────────────────┐
│ #  │ Error                              │ Fix                                      │
├────┼────────────────────────────────────┼──────────────────────────────────────────┤
│ 1  │ POST /rpc/create_task → 404        │ Migration 009: DROP + recreate           │
│    │                                    │ create_task() with correct param types   │
│    │                                    │ OR use direct .insert() into             │
│    │                                    │ project_tasks (bypass RPC)               │
├────┼────────────────────────────────────┼──────────────────────────────────────────┤
│ 2  │ POST /billing_items → 400          │ Add guard in createBillingItem():        │
│    │ null billing_session_id            │ check session exists before insert       │
│    │                                    │ In ProjectList: only call if session     │
│    │                                    │ is open (tryCreateBillingItemForTask)    │
├────┼────────────────────────────────────┼──────────────────────────────────────────┤
│ 3  │ POST /rpc/update_task → 404        │ Migration 009: DROP + recreate           │
│    │                                    │ update_task() with correct param types   │
│    │                                    │ OR use direct .update() on              │
│    │                                    │ project_tasks (bypass RPC)               │
├────┼────────────────────────────────────┼──────────────────────────────────────────┤
│ 4  │ PATCH /project_projects → 400      │ Add PROJECTS_TABLE constant              │
│    │ Wrong table name                   │ Replace all 'project_projects' with      │
│    │                                    │ correct table name from diagnostic       │
│    │                                    │ Add updateProjectBillingStatus() helper  │
└────┴────────────────────────────────────┴──────────────────────────────────────────┘

========================================================

-- After running migration 009:

-- ✅ Check RPCs exist
SELECT routine_name, specific_name
FROM   information_schema.routines
WHERE  routine_schema = 'public'
  AND  routine_name IN ('create_task', 'update_task');
-- Must return 2 rows

-- ✅ Test create_task RPC
SELECT * FROM create_task(
  15,                    -- project_id (BIGINT)
  'Test Task',           -- title
  'Test description',    -- description
  'todo',                -- status
  'medium',              -- priority
  NULL,                  -- employee_id
  2.5,                   -- estimated_hours
  NULL,                  -- due_date
  TRUE                   -- is_billable
);
-- Must return 1 row with the new task

-- ✅ Test update_task RPC
SELECT * FROM update_task(
  1,                     -- task id (use real id from above)
  'Updated Title'        -- new title
);

-- ✅ Check correct projects table name
SELECT table_name FROM information_schema.tables
WHERE  table_schema = 'public'
  AND  table_name IN ('projects', 'project_projects');
-- Use whichever name appears → set as PROJECTS_TABLE constant

-- ✅ Verify billing item creation works (no null session)
INSERT INTO billing_items (
  billing_session_id, source_type, description,
  quantity, unit_price, amount,
  is_billable, is_written_off, is_billed
) VALUES (
  'c4229fb6-a700-4ce4-82a1-b5130c7fa1bb',  -- real session ID
  'task', 'Test item', 1, 100, 100,
  TRUE, FALSE, FALSE
)
RETURNING id;
-- Must succeed without NOT NULL error