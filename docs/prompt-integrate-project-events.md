╔═══════════════════════════════════════════════════════════════════════════╗
║           PROJECT MODULE — PERSISTENT EVENT SOURCING INTEGRATION          ║
║                    INTEGRATION GUIDE: integrate-project-events.md         ║
╚═══════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0 — MANDATORY READING BEFORE ANY ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a senior software architect integrating a Project Management module
into an existing enterprise-grade Event Sourcing system.

YOU MUST NOT WRITE A SINGLE LINE OF CODE until you have completed
the following reading checklist IN ORDER.

If any file is missing or unreadable, STOP and report which file
is missing before proceeding.

STEP 0.1 — READ THE INTEGRATION GUIDE
──────────────────────────────────────
Read the file: integrate-project-events.md

Extract and confirm your understanding of:
  □ The two architectures described (Core ERP vs Project module)
  □ The exact problem being solved
  □ The proposed solution structure
  □ Every file listed as NEW or MODIFIED
  □ The event flow diagram (User Action → DB → Worker → Realtime → UI)
  □ The constraint: DO NOT modify existing table structures

STEP 0.2 — READ THE EXISTING EVENT INFRASTRUCTURE
──────────────────────────────────────────────────
Read these files COMPLETELY — every line, every method signature:

  □ src/infrastructure/eventStore.ts
      Extract:
        - Class name and export (default or named?)
        - publish(name, payload) — exact parameter types
        - subscribe(name, handler) — exact signature, return type
        - Does subscribe() return an unsubscribe function?
        - How is the Supabase client instantiated inside?
        - Error handling pattern (throws? returns error object?)
        - Is it a singleton or instantiated per use?

  □ src/shared/events.ts
      Extract:
        - The exact variable name (EVENT_NAMES? EventNames? events?)
        - The naming convention of values:
            dot.notation    → 'crm.contact.created'
            SCREAMING_SNAKE → 'CRM_CONTACT_CREATED'
            slash/notation  → 'crm/contact/created'
        - Every existing namespace (CRM, SALES, INVENTORY, etc.)
        - Whether 'as const' is used (affects type inference)
        - Whether a union type of all values is exported
        - Is there a PROJECT namespace already? If yes, list its events.

  □ src/shared/realtime/RealtimeGateway.ts
      Extract:
        - Class name and export
        - subscribe() — exact signature including channel naming pattern
        - unsubscribe() — exact signature
        - How Supabase Realtime channels are created internally
        - The filter syntax it expects
        - Callback payload shape
        - Is it a singleton?

  □ src/workers/eventProcessor.ts
      Extract:
        - How it is started (setInterval? cron? Supabase function?)
        - How handlers are registered (registerHandler? eventBus.subscribe?)
        - The polling query (SELECT from event_store WHERE status=?)
        - How it marks events as processed
        - How it handles errors and retries
        - Where existing module handlers are registered
          (e.g. registerCrmHandlers(), registerSalesHandlers())
        - The exact function call pattern to add a new module

STEP 0.3 — READ THE EXISTING PROJECT MODULE
────────────────────────────────────────────
Read every file in the project module directory:

  □ src/modules/projects/ (or app/projects/ — find the actual path)
      For each file found, extract:
        - File path
        - What it does
        - Every mutation function (create, update, delete, stage change)
        - Whether it already calls eventBus.publish() anywhere
        - Whether it uses onSaved/onUpdated callbacks (the primitive pattern)
        - The supabase client pattern used (client component? server action?)

  □ Specifically identify:
      - Where tasks are created → which file, which function
      - Where task stage is changed → which file, which function
      - Where timesheets are logged → which file, which function
      - Where milestones are marked billed → which file, which function
      - Where expenses are added → which file, which function
      - Where project is saved/updated → which file, which function

STEP 0.4 — READ THE DATABASE SCHEMA
────────────────────────────────────
Run or read the schema for these tables:

  □ event_store
      Confirm columns: id, event_name, payload, status,
                       created_at, processed_at, error
      Confirm: are there any additional columns?
               (retry_count? source? correlation_id?)

  □ project_projects — confirm all column names and types
  □ project_tasks    — confirm: is the stage column named 'stage' or 'status'?
  □ milestones       — confirm: target_date or due_date?
  □ timesheets       — confirm: billable_hours and writeoff_hours exist?
  □ expenses         — confirm all column names
  □ employees        — confirm: cost_rate and billable_rate both exist?

STEP 0.5 — PRODUCE A READING REPORT (REQUIRED)
───────────────────────────────────────────────
Before writing any code, output a structured report in this exact format:

  ┌─ READING REPORT ────────────────────────────────────────────────────┐
  │                                                                      │
  │ INFRASTRUCTURE                                                       │
  │   eventBus export:        [singleton named 'eventBus' / class / ??] │
  │   publish() signature:    [exact signature]                          │
  │   subscribe() signature:  [exact signature]                          │
  │   subscribe() returns:    [unsubscribe fn / void / ??]              │
  │   event value format:     ['dot.notation' / 'SCREAMING_SNAKE' / ??] │
  │   PROJECT namespace:      [exists / MISSING]                         │
  │   RealtimeGateway export: [singleton / class / ??]                  │
  │   subscribe() channel:    [naming pattern found]                     │
  │   eventProcessor start:   [how it runs]                             │
  │   handler registration:   [exact pattern to add new module]         │
  │                                                                      │
  │ PROJECT MODULE                                                       │
  │   module path:            [src/modules/projects OR app/projects/...] │
  │   mutation files found:   [list]                                     │
  │   already uses eventBus:  [YES with list / NO]                      │
  │   primitive callbacks:    [YES — onSaved/refreshKey / NO]           │
  │   task stage change fn:   [file + function name]                    │
  │   timesheet create fn:    [file + function name]                    │
  │   milestone billed fn:    [file + function name]                    │
  │   expense create fn:      [file + function name]                    │
  │                                                                      │
  │ DATABASE                                                             │
  │   event_store columns:    [list all columns found]                  │
  │   task stage column:      ['stage' / 'status' / other]              │
  │   milestone date column:  ['target_date' / 'due_date' / other]      │
  │   writeoff_hours exists:  [YES / NO]                                │
  │   cost_rate exists:       [YES / NO]                                │
  │                                                                      │
  │ DISCREPANCIES FROM integrate-project-events.md                      │
  │   [List every assumption in the guide that does NOT match reality]  │
  │   [Example: "Guide assumes 'dot.notation' but actual is SNAKE_CASE"]│
  │                                                                      │
  │ READY TO PROCEED: [YES / NO — if NO, list what is blocking]        │
  └──────────────────────────────────────────────────────────────────────┘

Wait for confirmation before proceeding to Phase 1.
DO NOT start Phase 1 until the user replies "CONFIRMED" or "PROCEED".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — DESIGN THE INTEGRATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Using ONLY what you read in Phase 0 (not the assumptions in the guide),
produce an integration plan.

STEP 1.1 — DEFINE THE COMPLETE EVENT CATALOG
─────────────────────────────────────────────
List every event the Project module needs, using the EXACT naming
convention found in src/shared/events.ts.

Format each event as:
  EVENT_NAME        | Trigger                    | Publisher       | Handlers
  ──────────────────┼────────────────────────────┼─────────────────┼──────────
  project.task.stage_changed | user drags kanban | TaskBoardTab   | refreshProjectCounters
                                                                    refreshMilestoneProgress
  ...

Include events for:
  - Project: created, updated, archived, status_changed
  - Task: created, updated, deleted, stage_changed, assigned
  - Milestone: created, updated, completed, billed
  - Timesheet: logged, updated, approved, rejected
  - Expense: added, approved, deleted
  - Billing: billing_status_changed, payment_status_changed

STEP 1.2 — DEFINE EVERY FILE TO CREATE OR MODIFY
──────────────────────────────────────────────────
Using the ACTUAL file paths and patterns found in Phase 0,
list every file that will be touched:

  ACTION   | FILE PATH                                    | REASON
  ─────────┼──────────────────────────────────────────────┼──────────────
  MODIFY   | src/shared/events.ts                         | add PROJECT namespace
  CREATE   | src/shared/types/projectEvents.types.ts      | typed payloads
  CREATE   | src/modules/projects/events/publisher.ts     | publish wrappers
  CREATE   | src/modules/projects/events/handlers.ts      | server handlers
  CREATE   | src/modules/projects/events/realtime.ts      | DB→bus bridge
  CREATE   | src/modules/projects/hooks/useProjectEvents  | React hook
  MODIFY   | src/workers/eventProcessor.ts                | register handlers
  MODIFY   | [each mutation file found in Phase 0]        | add publish() calls

STEP 1.3 — DEFINE THE TYPED PAYLOAD FOR EACH EVENT
────────────────────────────────────────────────────
For each event in the catalog, define the TypeScript interface
that will be its payload, using ACTUAL column names from the DB
(from Phase 0.4), not assumed names.

Example (corrected to actual schema):
  interface TaskStageChangedPayload {
    projectId:  number    // bigint in DB → number in TS
    taskId:     number    // bigint in DB → number in TS
    taskName:   string
    oldStage:   string    // actual column name: 'stage'
    newStage:   string
    occurredAt: string
  }

STEP 1.4 — DEFINE THE HANDLER LOGIC
──────────────────────────────────────
For each event handler, describe in plain English:
  - TRIGGER: what event fires this handler
  - READS:   what it queries from the DB
  - WRITES:  what it updates in the DB
  - EMITS:   does it publish any downstream events?
  - RISK:    what could go wrong (race condition? missing data?)

Example:
  Handler: TASK_STAGE_CHANGED
  TRIGGER: any task moves to a new stage
  READS:   project_tasks WHERE project_id = X (count all, count done)
           project_tasks WHERE id = taskId (get milestone_id)
  WRITES:  project_projects SET tasks_count, completed_tasks_count, progress
           milestones SET progress (if milestone linked)
  EMITS:   nothing
  RISK:    race condition if two tasks move simultaneously →
           use a DB function or single UPDATE query

STEP 1.5 — DEFINE THE TAB INVALIDATION MAP
────────────────────────────────────────────
For each event, list which UI tabs must refresh or be marked stale:

  EVENT                    | ACTIVE TAB REFRESHES | INACTIVE TABS MARKED STALE
  ─────────────────────────┼──────────────────────┼────────────────────────────
  project.task.stage_changed | tasks              | overview, milestones, list
  project.timesheet.logged   | timesheets         | financials, overview, list
  ...

Output this as a TypeScript const object that will become
the TAB_INVALIDATION map in useProjectEvents.ts.

Present the plan. Wait for user confirmation before Phase 2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — IMPLEMENT: SHARED INFRASTRUCTURE CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement in this exact order. Each file must be 100% complete.
No truncation. No "// ... rest of code" comments.

FILE 2.1 — src/shared/events.ts  (MODIFY)
──────────────────────────────────────────
Rules:
  □ Copy the ENTIRE existing file content first
  □ Add ONLY the PROJECT namespace block
  □ Use the EXACT same naming convention as existing namespaces
  □ Use 'as const' if the existing file uses it
  □ Do NOT rename, reorder, or reformat any existing code
  □ The PROJECT namespace must be alphabetically placed or
    placed at the end — match the existing ordering style

FILE 2.2 — src/shared/types/projectEvents.types.ts  (CREATE)
─────────────────────────────────────────────────────────────
Rules:
  □ Use ACTUAL DB column names (from Phase 0.4)
  □ bigint DB columns → number in TypeScript
  □ uuid DB columns → string in TypeScript
  □ timestamptz → string (ISO format) in TypeScript
  □ Every event in the catalog must have a typed payload interface
  □ Export a master map: ProjectEventPayloadMap
      { [EVENT_NAMES.PROJECT.X]: XPayload }
  □ Export TypedProjectPublish generic helper type
  □ All interfaces extend BaseProjectPayload
      { projectId: number; occurredAt: string; triggeredBy?: string }

After writing each file, output:
  ✓ FILE WRITTEN: [path]
  ✓ EXPORTS: [list of named exports]
  ✓ BREAKING CHANGES: [none / list any]

Wait for confirmation before Phase 3.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — IMPLEMENT: PROJECT EVENT PUBLISHER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE 3.1 — src/modules/projects/events/projectEventPublisher.ts  (CREATE)
───────────────────────────────────────────────────────────────────────────
Rules:
  □ Import eventBus using the EXACT import path and export name
    found in Phase 0.2 (not assumed path)
  □ Import EVENT_NAMES using exact export name from events.ts
  □ Import all payload types from projectEvents.types.ts
  □ Create one named export per event: projectEventPublisher object
  □ Each method is a thin wrapper:
      methodName: (payload: XPayload) =>
        eventBus.publish(EVENT_NAMES.PROJECT.X, payload)
  □ The publish call must match the EXACT signature found in
    eventStore.ts (Phase 0.2) — do not assume the signature
  □ If eventBus.publish() is async → all methods must be async
  □ If eventBus.publish() throws on error → wrap in try/catch
    and log but do not re-throw (mutations must not fail silently
    if event publishing fails — DB write already succeeded)
  □ Add JSDoc comment on each method explaining when to call it

After writing, output:
  ✓ FILE WRITTEN: [path]
  ✓ METHODS: [list all method names]
  ✓ MATCHES eventBus.publish() signature: [YES/NO + explanation]

Wait for confirmation before Phase 4.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — IMPLEMENT: PROJECT EVENT HANDLERS (SERVER-SIDE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE 4.1 — src/modules/projects/events/projectEventHandlers.ts  (CREATE)
──────────────────────────────────────────────────────────────────────────
Rules:
  □ Use supabase SERVICE ROLE client (server-side — never anon key)
  □ Import eventBus using EXACT path and name from Phase 0.2
  □ Import EVENT_NAMES using EXACT path from Phase 0.2
  □ Match the handler registration pattern EXACTLY as used in
    existing modules (found in eventProcessor.ts in Phase 0.2)
  □ Export a single function: registerProjectEventHandlers()
  □ Every handler listed in the integration plan (Phase 1.4) must
    be implemented completely — no stubs, no TODOs
  □ Each handler must:
      1. Cast the raw payload to the correct typed interface
      2. Validate projectId exists before any DB operation
      3. Use a try/catch and log errors without crashing the worker
      4. Be idempotent (safe to run twice on the same event)

  Implement these handlers in this order:

  HANDLER 1: TASK_STAGE_CHANGED
    Logic:
      a. Count all active tasks for project → tasks_count
      b. Count tasks WHERE stage = 'done' → completed_tasks_count
      c. Calculate progress = (completed / total) * 100
      d. UPDATE project_projects SET tasks_count, completed_tasks_count,
         progress, updated_at WHERE id = projectId
      e. SELECT milestone_id FROM project_tasks WHERE id = taskId
      f. If milestone_id is not null:
           COUNT tasks WHERE milestone_id = X (total and done)
           UPDATE milestones SET progress WHERE id = milestone_id

  HANDLER 2: TASK_CREATED / TASK_DELETED
    Logic:
      Same as HANDLER 1 steps a-d only

  HANDLER 3: TIMESHEET_LOGGED
    Logic:
      a. If taskId is present:
           SUM hours FROM timesheets WHERE task_id = taskId
           UPDATE project_tasks SET actual_hours WHERE id = taskId
      b. Check if project billing_status = 'not_started'
           If any approved+unbilled timesheet exists →
           UPDATE project_projects SET billing_status = 'in_progress'

  HANDLER 4: TIMESHEET_APPROVED
    Logic:
      a. COUNT timesheets WHERE project_id = X AND status = 'approved'
         AND is_billed = false
      b. If count > 0 AND current billing_status = 'not_started':
           UPDATE project_projects SET billing_status = 'in_progress'

  HANDLER 5: MILESTONE_COMPLETED
    Logic:
      a. If invoice_trigger = false OR invoice_amount = 0 → skip
      b. INSERT into event_store:
           event_name: 'project.billing.invoice_ready'
           payload: { projectId, milestoneId, milestoneName,
                      amount, occurredAt }
           status: 'pending'

  HANDLER 6: MILESTONE_BILLED
    Logic:
      a. SELECT all milestones WHERE project_id = X
         AND invoice_trigger = true
      b. If ALL have is_billed = true:
           UPDATE project_projects SET billing_status = 'billed'
      c. Else:
           UPDATE project_projects SET billing_status = 'in_progress'

  HANDLER 7: PROJECT_STATUS_CHANGED
    Logic:
      a. If newStatus != 'completed' → skip
      b. COUNT unbilled approved timesheets for project
      c. COUNT unbilled invoice-trigger milestones for project
      d. If either count > 0:
           INSERT into event_store:
             event_name: 'project.billing.completion_warning'
             payload: { projectId, unbilledTimesheets,
                        unbilledMilestones, occurredAt }
             status: 'pending'

  HANDLER 8: EXPENSE_ADDED / EXPENSE_DELETED
    Logic:
      No DB side effects needed.
      The views (v_project_financials) recompute automatically.
      Log the event for audit trail only.

After writing, output:
  ✓ FILE WRITTEN: [path]
  ✓ HANDLERS REGISTERED: [list]
  ✓ IDEMPOTENCY CHECK: [confirm each handler is safe to run twice]
  ✓ ERROR HANDLING: [confirm each handler has try/catch]

Wait for confirmation before Phase 5.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — IMPLEMENT: REALTIME SUBSCRIPTIONS BRIDGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE 5.1 — src/modules/projects/events/projectRealtimeSubscriptions.ts
───────────────────────────────────────────────────────────────────────
Rules:
  □ Import RealtimeGateway using EXACT path and export found in Phase 0.2
  □ Import eventBus using EXACT path found in Phase 0.2
  □ Use the EXACT subscribe() signature found in RealtimeGateway
  □ Use the EXACT channel naming pattern found in RealtimeGateway
  □ Each subscription bridges ONE table change to ONE eventBus.publish()
  □ Detect semantic changes (stage change vs generic update) by
    comparing payload.old vs payload.new
  □ Export one function: subscribeToProjectRealtime(projectId, options)
  □ Return an unsubscribe cleanup function
  □ The cleanup must call RealtimeGateway.unsubscribe() for every
    channel that was opened

  Subscribe to these tables with filter project_id = projectId:
    - timesheets   (INSERT → TIMESHEET_LOGGED)
    - timesheets   (UPDATE WHERE status changes to 'approved' → TIMESHEET_APPROVED)
    - project_tasks (INSERT → TASK_CREATED)
    - project_tasks (UPDATE → detect stage change → TASK_STAGE_CHANGED
                              detect assignee change → TASK_ASSIGNED
                              else → TASK_UPDATED)
    - project_tasks (DELETE → TASK_DELETED)
    - milestones   (INSERT → MILESTONE_CREATED)
    - milestones   (UPDATE → detect is_billed change → MILESTONE_BILLED
                              detect status→completed → MILESTONE_COMPLETED
                              else → MILESTONE_UPDATED)
    - expenses     (INSERT → EXPENSE_ADDED)
    - expenses     (DELETE → EXPENSE_DELETED)
    - project_projects (UPDATE → detect status change → PROJECT_STATUS_CHANGED
                                 else → PROJECT_UPDATED)

After writing, output:
  ✓ FILE WRITTEN: [path]
  ✓ CHANNELS OPENED: [list all channel names]
  ✓ CLEANUP REGISTERED: [YES/NO]
  ✓ MATCHES RealtimeGateway.subscribe() signature: [YES + explanation]

Wait for confirmation before Phase 6.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — IMPLEMENT: REACT HOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE 6.1 — src/modules/projects/hooks/useProjectEvents.ts  (CREATE)
────────────────────────────────────────────────────────────────────
Rules:
  □ 'use client' directive at top
  □ Import eventBus using EXACT path found in Phase 0.2
  □ Import EVENT_NAMES using EXACT path found in Phase 0.2
  □ If eventBus.subscribe() returns an unsubscribe function →
    call it in useEffect cleanup
  □ If eventBus.subscribe() does NOT return unsubscribe →
    implement a workaround (ref-based handler removal)
  □ Use useRef for the onRefresh callback to avoid stale closures
  □ The TAB_INVALIDATION map must match EXACTLY what was defined
    in Phase 1.5

  Hook signature:
    useProjectEvents({
      projectId:  number
      activeTab:  string
      onRefresh:  () => void | Promise<void>
    }): {
      staleTabs:   Set<string>
      clearStale:  (tabId: string) => void
      lastEventAt: number | null
    }

  Behavior:
    □ On mount: subscribe to ALL project event names in EVENT_NAMES.PROJECT
    □ On each event:
        1. Check payload.projectId matches — ignore if not
        2. Look up TAB_INVALIDATION[eventName]
        3. If activeTab is in the list → call onRefresh() immediately
        4. All other tabs in the list → add to staleTabs Set
        5. Update lastEventAt timestamp
    □ When activeTab changes → clear it from staleTabs
    □ On unmount: unsubscribe from all

After writing, output:
  ✓ FILE WRITTEN: [path]
  ✓ SUBSCRIBE CLEANUP: [how unsubscribe is handled]
  ✓ STALE CLOSURE RISK: [how onRefresh is stabilized]
  ✓ TAB_INVALIDATION events count: [number of entries]

Wait for confirmation before Phase 7.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — MODIFY: EVENT PROCESSOR REGISTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE 7.1 — src/workers/eventProcessor.ts  (MODIFY)
────────────────────────────────────────────────────
Rules:
  □ Read the ENTIRE existing file first
  □ Find the exact location where other module handlers are registered
    (e.g. registerCrmHandlers(), registerSalesHandlers())
  □ Add ONLY:
      import { registerProjectEventHandlers }
        from '@/modules/projects/events/projectEventHandlers'
      registerProjectEventHandlers()
  □ Place the import with other module imports (same grouping)
  □ Place the registration call with other module registrations
    (same grouping, same ordering style)
  □ Do NOT modify any other line in this file
  □ Output the FULL modified file (not just the diff)

After writing, output:
  ✓ LINES ADDED: [exactly 2 lines — import + registration call]
  ✓ POSITION: [line numbers where added]
  ✓ EXISTING CODE UNCHANGED: [YES]

Wait for confirmation before Phase 8.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 8 — MODIFY: PROJECT MUTATIONS (ADD PUBLISH CALLS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For EACH mutation file identified in Phase 0.3:

Rules that apply to ALL mutation files:
  □ Read the ENTIRE file before modifying
  □ Add import for projectEventPublisher at the top
  □ In each mutation function, publish AFTER a successful DB write
  □ NEVER publish if the DB write returned an error
  □ Publishing failure must NOT cause the mutation to fail
    (wrap publish in try/catch, log error, continue)
  □ Keep all existing onSaved/onUpdated callbacks in place
    (do not remove the primitive pattern yet — add events alongside)
  □ Output the FULL modified file

For each mutation, apply this pattern:
  ┌──────────────────────────────────────────────────────────────────┐
  │  // BEFORE (existing code)                                       │
  │  const { error } = await supabase.from('x').update(data)        │
  │  if (error) throw error                                          │
  │  onSaved?.()                                                     │
  │                                                                  │
  │  // AFTER (add event publishing)                                 │
  │  const { error } = await supabase.from('x').update(data)        │
  │  if (error) throw error                                          │
  │  try {                                                           │
  │    await projectEventPublisher.xUpdated({ ...typedPayload })    │
  │  } catch (eventError) {                                          │
  │    console.error('[ProjectEvent] publish failed:', eventError)   │
  │  }                                                               │
  │  onSaved?.()                                                     │
  └──────────────────────────────────────────────────────────────────┘

Specific mutations to modify:

  8.1 — createProject / updateProject
    Publish: PROJECT_CREATED / PROJECT_UPDATED / PROJECT_STATUS_CHANGED
    Note: for STATUS_CHANGED, compare old status vs new status
    Payload must include: projectId, projectName, changedFields[], occurredAt

  8.2 — archiveProject
    Publish: PROJECT_ARCHIVED
    Payload: projectId, projectName, occurredAt

  8.3 — createTask
    Publish: TASK_CREATED
    Payload: projectId, taskId, taskName, stage, assigneeId, occurredAt

  8.4 — updateTaskStage
    Publish: TASK_STAGE_CHANGED
    Payload: projectId, taskId, taskName, oldStage, newStage, occurredAt
    Note: oldStage must be fetched or passed from the UI state

  8.5 — updateTask (generic)
    Publish: TASK_UPDATED
    Payload: projectId, taskId, taskName, changedFields[], occurredAt
    Note: TASK_ASSIGNED if employee_id changed

  8.6 — deleteTask
    Publish: TASK_DELETED
    Payload: projectId, taskId, taskName, occurredAt

  8.7 — createMilestone
    Publish: MILESTONE_CREATED
    Payload: projectId, milestoneId, milestoneName, targetDate,
             invoiceAmount, invoiceTrigger, occurredAt

  8.8 — updateMilestone
    Publish: MILESTONE_UPDATED
    If new status = 'completed': also publish MILESTONE_COMPLETED
    Payload: projectId, milestoneId, milestoneName, changedFields[]

  8.9 — markMilestoneBilled
    Publish: MILESTONE_BILLED
    Payload: projectId, milestoneId, milestoneName,
             invoiceAmount, billedAt, occurredAt

  8.10 — createTimesheet
    Publish: TIMESHEET_LOGGED
    Payload: all timesheet fields + employeeName + occurredAt

  8.11 — approveTimesheet
    Publish: TIMESHEET_APPROVED
    Payload: projectId, timesheetId, employeeId, approvedById, occurredAt

  8.12 — createExpense
    Publish: EXPENSE_ADDED
    Payload: projectId, expenseId, description, amount, category,
             isBillable, occurredAt

  8.13 — deleteExpense
    Publish: EXPENSE_DELETED
    Payload: projectId, expenseId, description, amount, occurredAt

After each file, output:
  ✓ FILE MODIFIED: [path]
  ✓ MUTATIONS UPDATED: [list function names]
  ✓ EVENTS PUBLISHED: [list event names]
  ✓ EXISTING CALLBACKS PRESERVED: [YES]
  ✓ PUBLISH WRAPPED IN TRY/CATCH: [YES]

Wait for confirmation before Phase 9.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 9 — MODIFY: UI COMPONENTS (WIRE THE HOOK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILE 9.1 — ProjectCardModal  (MODIFY)
────────────────────────────────────────────────────────────────────────────
Rules:
  □ Read the ENTIRE existing file first
  □ Add useProjectEvents hook call at the top of the component
  □ Pass activeTab and onRefresh to the hook
  □ Use staleTabs to show orange dot indicator on stale tab buttons
  □ When tab changes → call clearStale(newTabId)
  □ Start Realtime subscription on mount using subscribeToProjectRealtime()
  □ Cleanup on unmount
  □ Keep all existing logic — only ADD the event wiring
  □ Output the FULL modified file

  Add to tab button render:
    {staleTabs.has(tab.id) && activeTab !== tab.id && (
      <span
        className="absolute top-1 right-1 w-2 h-2
                   bg-orange-400 rounded-full animate-pulse"
        title="New activity — click to refresh"
      />
    )}

FILE 9.2 — Each Tab Component  (MODIFY)
────────────────────────────────────────────────────────────────────────────
For: OverviewTab, TaskBoardTab, MilestonesTab,
     TimesheetsTab, FinancialsTab, ClientPortalTab

For each tab component:
  □ Read the ENTIRE existing file first
  □ Wrap the main data fetch in useCallback(async () => {...}, [projectId])
  □ The useCallback result is the onRefresh function
  □ Call onRefresh in useEffect on mount (initial load)
  □ Pass onRefresh up to ProjectCardModal via a prop or ref
    (choose the pattern that matches the existing component API)
  □ Do NOT add useProjectEvents inside each tab
    (the hook lives in ProjectCardModal only)
  □ Keep all existing mutation calls + publish() is already added in Phase 8
  □ Output the FULL modified file

After Phase 9, output:
  ✓ COMPONENTS MODIFIED: [list]
  ✓ STALE INDICATORS: [working on tabs YES/NO]
  ✓ REFRESH PATTERN: [describe how onRefresh flows from modal to tabs]

Wait for confirmation before Phase 10.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 10 — VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After all phases are complete, run through this checklist
and report the result of each item:

EVENT COMPLETENESS
  □ Every mutation in the project module publishes an event
  □ Every event in EVENT_NAMES.PROJECT has a typed payload
  □ Every event has at least one subscriber (handler or UI hook)
  □ No event name is duplicated or misspelled

TYPE SAFETY
  □ No 'any' types in any new file
  □ All payload casts in handlers are to specific interfaces
  □ TypedProjectPublish enforces payload-to-event-name mapping
  □ All DB column names match the actual schema (Phase 0.4)

INFRASTRUCTURE COMPATIBILITY
  □ eventBus.publish() called with exact signature from Phase 0.2
  □ eventBus.subscribe() called with exact signature from Phase 0.2
  □ RealtimeGateway.subscribe() called with exact signature
  □ RealtimeGateway.unsubscribe() called in all cleanup functions
  □ registerProjectEventHandlers() called in eventProcessor.ts
  □ Import paths use the same alias (@/ vs relative) as existing code

RESILIENCE
  □ All handler functions have try/catch
  □ All publish() calls in mutations have try/catch
  □ Handlers are idempotent (safe to run twice)
  □ Realtime subscriptions clean up on component unmount
  □ eventBus subscriptions clean up on component unmount

UI BEHAVIOR
  □ Active tab refreshes immediately on relevant event
  □ Inactive tabs show orange dot indicator
  □ Dot disappears when user clicks the stale tab
  □ Project list row updates when financials change
  □ No infinite refresh loops

BACKWARD COMPATIBILITY
  □ No existing onSaved/onUpdated callbacks were removed
  □ No existing mutation signatures were changed
  □ No existing component props were removed
  □ eventProcessor.ts has exactly 2 new lines added

Output the checklist with [✓ PASS] or [✗ FAIL — reason] for each item.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE CONSTRAINTS — NEVER VIOLATE THESE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ NEVER modify existing DB table structures
✗ NEVER assume an import path — use only paths confirmed in Phase 0
✗ NEVER assume a method signature — use only signatures confirmed in Phase 0
✗ NEVER use 'any' type in TypeScript
✗ NEVER remove existing callback patterns (onSaved, refreshKey, etc.)
  until explicitly instructed — ADD events alongside them
✗ NEVER truncate a file — every output must be 100% complete
✗ NEVER skip a phase — each phase depends on the previous
✗ NEVER start a phase without reading confirmation from the user
✗ NEVER use column names that differ from what Phase 0.4 confirmed:
    - project_tasks.stage (not .status)
    - milestones.target_date (not .due_date)
    - crm_contacts.name (not .full_name)
    - project_projects.id is bigint (number in TS, not string)
✗ NEVER publish an event before the DB write succeeds
✗ NEVER let a publish() failure cause a mutation to throw
✗ NEVER add logic to eventProcessor.ts beyond the 2 required lines

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEGIN: Start with Phase 0.
Read integrate-project-events.md first.
Then read every infrastructure file listed in Phase 0.2.
Then produce the Reading Report.
Do not proceed further until the user confirms.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━