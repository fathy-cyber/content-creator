Excellent ✅ — this changes everything.

You don’t need to **design** an event system.

You already have a **proper ERP-grade Persistent Event Sourcing architecture**.

The real issue is architectural inconsistency:
> The Project module is not integrated into the existing event-driven core.

This is not a feature gap.
It’s an integration gap.

---

# ✅ Final Verdict

You should **NOT build a new ProjectEventBus**.

You should:

> ✅ Migrate the Project module to the existing PersistentEventBus.

That is the clean, enterprise decision.

---

# ✅ Target Architecture (After Migration)

When something happens inside Project:

```
Mutation (API)
   ↓
PersistentEventBus.publish()
   ↓
event_store table
   ↓
eventProcessor worker
   ↓
Domain handlers (Project, Finance, CRM, Billing...)
   ↓
RealtimeGateway broadcast
   ↓
React UI auto-updates
```

No callbacks.
No refreshKey hacks.
No manual state syncing.

---

# ✅ What Needs to Be Done

You need to integrate Project mutations into the existing pipeline.

---

# ✅ 1️⃣ Identify Project Domain Events

Add new event types to:

```
src/shared/events.ts
```

Example:

```ts
export const EVENT_NAMES = {
  // Existing core events...

  // Project Domain
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_ARCHIVED: 'project.archived',

  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_COMPLETED: 'task.completed',
  TASK_DELETED: 'task.deleted',

  TIMESHEET_CREATED: 'timesheet.created',
  TIMESHEET_UPDATED: 'timesheet.updated',
  TIMESHEET_DELETED: 'timesheet.deleted',

  MILESTONE_CREATED: 'milestone.created',
  MILESTONE_COMPLETED: 'milestone.completed',
  MILESTONE_BILLED: 'milestone.billed',

  EXPENSE_CREATED: 'expense.created',
  EXPENSE_UPDATED: 'expense.updated',
  EXPENSE_BILLED: 'expense.billed',

  PROJECT_FINANCIAL_RECALCULATED: 'project.financial.recalculated',
};
```

---

# ✅ 2️⃣ Replace Primitive Callbacks with Event Publishing

Currently (primitive pattern):

```ts
await updateTask(...)
onUpdated()
setRefreshKey(prev => prev + 1)
```

Replace with:

```ts
await updateTask(...)

await PersistentEventBus.publish({
  eventName: EVENT_NAMES.TASK_UPDATED,
  aggregateId: projectId,
  payload: {
    taskId,
    projectId,
    updatedBy: userId,
  }
})
```

That’s it.

No manual refresh.

---

# ✅ 3️⃣ Handle Events in eventProcessor Worker

Inside:

```
src/workers/eventProcessor.ts
```

Add handlers for Project events.

Example:

```ts
if (event.eventName === EVENT_NAMES.TIMESHEET_CREATED) {
   await ProjectFinancialService.recalculate(event.payload.projectId)

   await PersistentEventBus.publish({
      eventName: EVENT_NAMES.PROJECT_FINANCIAL_RECALCULATED,
      aggregateId: event.payload.projectId,
      payload: { projectId: event.payload.projectId }
   })
}
```

---

# ✅ 4️⃣ Financial Recalculation Service

Centralize all financial logic:

```
ProjectFinancialService.recalculate(projectId)
```

This service:

- Queries SQL financial views
- Updates project health
- Updates billing_status
- Possibly updates CRM totals
- Stores snapshot if needed

This keeps ERP logic centralized.

---

# ✅ 5️⃣ Realtime UI Subscription (React Side)

Use your existing:

```
RealtimeGateway
```

In `ProjectDetailPage.tsx`:

```ts
useEffect(() => {
  const channel = RealtimeGateway.subscribe(
    `project-${projectId}`,
    (event) => {
      if (event.eventName === EVENT_NAMES.PROJECT_FINANCIAL_RECALCULATED ||
          event.eventName.startsWith('task.') ||
          event.eventName.startsWith('timesheet.') ||
          event.eventName.startsWith('expense.') ||
          event.eventName.startsWith('milestone.')) {
        
        queryClient.invalidateQueries(['project-dashboard', projectId])
      }
    }
  )

  return () => channel.unsubscribe()
}, [projectId])
```

Now:

✅ Any module update  
✅ Any worker recalculation  
✅ Any billing update  

→ UI refreshes automatically.

Enterprise-grade behavior.

---

# ✅ 6️⃣ Why This Is Architecturally Superior

Your system becomes:

### ✅ Consistent
Same pattern across CRM, Sales, Inventory, Projects.

### ✅ Auditable
Every task update is an event.
Every timesheet entry is traceable.

### ✅ Replayable
You can rebuild project financial state from event_store.

### ✅ Real-time
Project dashboards update instantly.

### ✅ ERP-grade
This is exactly how large systems (SAP, Odoo, NetSuite) behave internally.

---

# ✅ 7️⃣ Important Rule

Never compute financial logic in React.

React:
→ Displays

Worker:
→ Processes

Database:
→ Stores truth

Event store:
→ Records history

---

# ✅ 8️⃣ What You Should NOT Do

❌ Do not create a second event bus  
❌ Do not use component-level refresh hacks  
❌ Do not mix direct DB updates + events inconsistently  
❌ Do not let frontend compute profitability  

---

# ✅ 9️⃣ Migration Plan (Safe & Controlled)

Step 1:
Add event publishing to all Project mutations.

Step 2:
Add worker handlers.

Step 3:
Remove onUpdated and refreshKey patterns.

Step 4:
Connect Project UI to RealtimeGateway.

Step 5:
Test event replay from event_store.

---

# ✅ Final Architecture After Migration

You will have:

```
PersistentEventBus (single source of truth)
      ↓
event_store
      ↓
eventProcessor
      ↓
ProjectFinancialService
      ↓
RealtimeGateway
      ↓
React UI
```

And now:

Project module = same level as CRM & Sales.

No more split personality.

---

# ✅ Strategic Conclusion

You already built an enterprise backbone.

The mistake would be building another event layer.

The correct move:
> Integrate Projects into the existing Persistent Event Sourcing system.

This turns your agency OS into a unified, real-time ERP.

-------------

# Project Module — Integration into the Persistent Event Sourcing System

## First: Read the Existing Infrastructure

Before writing a single line, map exactly what exists.

```
EXISTING ARCHITECTURE (what you found)
─────────────────────────────────────────────────────────────────────────

src/infrastructure/eventStore.ts
    └── PersistentEventBus
          ├── publish(eventName, payload)  → writes to event_store table
          ├── subscribe(eventName, handler)
          └── connects to Supabase directly

src/shared/events.ts
    └── EVENT_NAMES = {
          CRM:       { CONTACT_CREATED, CONTACT_UPDATED, ... }
          SALES:     { ORDER_CREATED, ORDER_PAID, ... }
          INVENTORY: { STOCK_UPDATED, ... }
          ...
          PROJECT:   ← DOES NOT EXIST YET
        }

src/shared/realtime/RealtimeGateway.ts
    └── RealtimeGateway
          ├── subscribe(channel, table, filter, callback)
          └── unsubscribe(channel)

src/workers/eventProcessor.ts
    └── polls event_store WHERE status = 'pending'
          ├── processes each event
          ├── calls registered handlers
          └── marks event as 'processed'

DATABASE TABLE: event_store
    id, event_name, payload(jsonb), status, 
    created_at, processed_at, error

─────────────────────────────────────────────────────────────────────────
```

---

## Step 1: Read Each Existing File First

```typescript
// READ THESE FILES AND SHARE THEIR CONTENT BEFORE PROCEEDING:
//
// 1. src/infrastructure/eventStore.ts
//    → Need to know: publish() signature, subscribe() signature,
//      how payload is typed, error handling pattern
//
// 2. src/shared/events.ts  
//    → Need to know: exact EVENT_NAMES structure,
//      naming convention (SCREAMING_SNAKE? dot.notation?)
//
// 3. src/shared/realtime/RealtimeGateway.ts
//    → Need to know: subscribe() signature, channel naming,
//      filter syntax, callback signature
//
// 4. src/workers/eventProcessor.ts
//    → Need to know: how handlers are registered,
//      polling interval, retry logic, error handling
//
// 5. event_store table schema
//    → Run: SELECT column_name, data_type 
//           FROM information_schema.columns 
//           WHERE table_name = 'event_store'
```

---

## Step 2: Reconstruct What They Likely Look Like

Based on your description, here is the inferred architecture.
**Share the actual files to correct any assumptions.**

```typescript
// ─── INFERRED: src/infrastructure/eventStore.ts ───────────────────────

import { createClient } from '@supabase/supabase-js'

type Handler = (payload: Record<string, unknown>) => Promise<void>

class PersistentEventBus {
  private supabase = createClient(...)
  private handlers = new Map<string, Handler[]>()

  // Writes event to event_store table
  async publish(
    eventName: string,
    payload:   Record<string, unknown>
  ): Promise<void> {
    await this.supabase
      .from('event_store')
      .insert({ event_name: eventName, payload, status: 'pending' })
  }

  // Registers an in-process handler
  subscribe(eventName: string, handler: Handler): void {
    const existing = this.handlers.get(eventName) || []
    this.handlers.set(eventName, [...existing, handler])
  }

  // Called by eventProcessor to handle an event
  async process(eventName: string, payload: unknown): Promise<void> {
    const handlers = this.handlers.get(eventName) || []
    await Promise.all(handlers.map(h => h(payload as Record<string, unknown>)))
  }
}

export const eventBus = new PersistentEventBus()

// ─── INFERRED: src/shared/events.ts ──────────────────────────────────

export const EVENT_NAMES = {
  CRM: {
    CONTACT_CREATED: 'crm.contact.created',
    CONTACT_UPDATED: 'crm.contact.updated',
    CONTACT_DELETED: 'crm.contact.deleted',
  },
  SALES: {
    ORDER_CREATED:   'sales.order.created',
    ORDER_PAID:      'sales.order.paid',
  },
  INVENTORY: {
    STOCK_UPDATED:   'inventory.stock.updated',
  },
  // PROJECT: ← MISSING — we will add this
} as const

// ─── INFERRED: src/shared/realtime/RealtimeGateway.ts ────────────────

class RealtimeGateway {
  subscribe(
    channelName: string,
    config: {
      table:    string
      filter?:  string
      event:    'INSERT' | 'UPDATE' | 'DELETE' | '*'
    },
    callback: (payload: unknown) => void
  ): void { ... }

  unsubscribe(channelName: string): void { ... }
}

export const realtimeGateway = new RealtimeGateway()

// ─── INFERRED: event_store table ─────────────────────────────────────
// id           uuid PK
// event_name   text NOT NULL
// payload      jsonb
// status       text DEFAULT 'pending' (pending|processed|failed)
// created_at   timestamptz
// processed_at timestamptz
// error        text
// retry_count  integer DEFAULT 0
```

---

## Step 3: The Integration Plan

```
WHAT WE NEED TO ADD
─────────────────────────────────────────────────────────────────────────

1. src/shared/events.ts
   └── Add PROJECT namespace to EVENT_NAMES

2. src/shared/types/projectEvents.types.ts  (NEW)
   └── Strongly-typed payload for every project event

3. src/modules/projects/events/projectEventPublisher.ts  (NEW)
   └── Thin wrapper: calls eventBus.publish() with typed payloads
       Used by mutations (after successful DB write)

4. src/modules/projects/events/projectEventHandlers.ts  (NEW)
   └── Registers handlers on the eventBus
       Each handler decides what to do when an event arrives
       Registered once at app startup

5. src/modules/projects/events/projectRealtimeSubscriptions.ts  (NEW)
   └── Uses RealtimeGateway to subscribe to project table changes
       Bridges DB-level changes → eventBus.publish()

6. src/modules/projects/hooks/useProjectEvents.ts  (NEW)
   └── React hook for UI components
       Subscribes to RealtimeGateway for a specific project
       Triggers local state refresh when relevant event arrives

7. src/workers/eventProcessor.ts  (MODIFY)
   └── Register project event handlers on startup

─────────────────────────────────────────────────────────────────────────
```

---

## Step 4: Full Implementation

### 4.1 — Extend EVENT_NAMES

```typescript
// src/shared/events.ts
// ADD the PROJECT namespace — do not touch existing namespaces

export const EVENT_NAMES = {
  // ── existing namespaces (unchanged) ──
  CRM: {
    CONTACT_CREATED: 'crm.contact.created',
    CONTACT_UPDATED: 'crm.contact.updated',
    CONTACT_DELETED: 'crm.contact.deleted',
  },
  SALES: {
    ORDER_CREATED: 'sales.order.created',
    ORDER_PAID:    'sales.order.paid',
  },
  INVENTORY: {
    STOCK_UPDATED: 'inventory.stock.updated',
  },

  // ── NEW: Project namespace ──
  PROJECT: {
    // Project lifecycle
    PROJECT_CREATED:   'project.project.created',
    PROJECT_UPDATED:   'project.project.updated',
    PROJECT_ARCHIVED:  'project.project.archived',
    PROJECT_STATUS_CHANGED: 'project.project.status_changed',

    // Tasks
    TASK_CREATED:        'project.task.created',
    TASK_UPDATED:        'project.task.updated',
    TASK_DELETED:        'project.task.deleted',
    TASK_STAGE_CHANGED:  'project.task.stage_changed',
    TASK_ASSIGNED:       'project.task.assigned',

    // Milestones
    MILESTONE_CREATED:   'project.milestone.created',
    MILESTONE_UPDATED:   'project.milestone.updated',
    MILESTONE_COMPLETED: 'project.milestone.completed',
    MILESTONE_BILLED:    'project.milestone.billed',

    // Timesheets
    TIMESHEET_LOGGED:    'project.timesheet.logged',
    TIMESHEET_UPDATED:   'project.timesheet.updated',
    TIMESHEET_APPROVED:  'project.timesheet.approved',
    TIMESHEET_REJECTED:  'project.timesheet.rejected',

    // Expenses
    EXPENSE_ADDED:       'project.expense.added',
    EXPENSE_APPROVED:    'project.expense.approved',
    EXPENSE_DELETED:     'project.expense.deleted',

    // Billing
    BILLING_STATUS_CHANGED:  'project.billing.status_changed',
    PAYMENT_STATUS_CHANGED:  'project.payment.status_changed',
  },
} as const

// Derive the union type of all event name values
type EventNameTree = typeof EVENT_NAMES
type LeafValues<T> = T extends string
  ? T
  : { [K in keyof T]: LeafValues<T[K]> }[keyof T]

export type EventName = LeafValues<EventNameTree>

// Project-specific event name type
export type ProjectEventName =
  typeof EVENT_NAMES.PROJECT[keyof typeof EVENT_NAMES.PROJECT]
```

---

### 4.2 — Typed Event Payloads

```typescript
// src/shared/types/projectEvents.types.ts

import { EVENT_NAMES } from '@/shared/events'

// ── Base ──────────────────────────────────────────────────────────────

interface BaseProjectPayload {
  projectId:   number
  occurredAt:  string   // ISO timestamp
  triggeredBy?: string  // employee id or 'system'
}

// ── Project Events ─────────────────────────────────────────────────────

export interface ProjectCreatedPayload extends BaseProjectPayload {
  projectName:   string
  customerId?:   number
  billingModel:  string
  budget:        number
}

export interface ProjectUpdatedPayload extends BaseProjectPayload {
  projectName:   string
  changedFields: string[]
}

export interface ProjectArchivedPayload extends BaseProjectPayload {
  projectName: string
}

export interface ProjectStatusChangedPayload extends BaseProjectPayload {
  oldStatus: string
  newStatus: string
}

// ── Task Events ────────────────────────────────────────────────────────

export interface TaskCreatedPayload extends BaseProjectPayload {
  taskId:     number
  taskName:   string
  stage:      string
  assigneeId?: string
}

export interface TaskUpdatedPayload extends BaseProjectPayload {
  taskId:        number
  taskName:      string
  changedFields: string[]
}

export interface TaskDeletedPayload extends BaseProjectPayload {
  taskId:   number
  taskName: string
}

export interface TaskStageChangedPayload extends BaseProjectPayload {
  taskId:   number
  taskName: string
  oldStage: string
  newStage: string
}

export interface TaskAssignedPayload extends BaseProjectPayload {
  taskId:      number
  taskName:    string
  assigneeId:  string
  assigneeName: string
}

// ── Milestone Events ───────────────────────────────────────────────────

export interface MilestoneCreatedPayload extends BaseProjectPayload {
  milestoneId:    string
  milestoneName:  string
  targetDate:     string
  invoiceAmount:  number
  invoiceTrigger: boolean
}

export interface MilestoneUpdatedPayload extends BaseProjectPayload {
  milestoneId:   string
  milestoneName: string
  changedFields: string[]
}

export interface MilestoneCompletedPayload extends BaseProjectPayload {
  milestoneId:    string
  milestoneName:  string
  invoiceTrigger: boolean
  invoiceAmount:  number
}

export interface MilestoneBilledPayload extends BaseProjectPayload {
  milestoneId:   string
  milestoneName: string
  invoiceAmount: number
  billedAt:      string
}

// ── Timesheet Events ───────────────────────────────────────────────────

export interface TimesheetLoggedPayload extends BaseProjectPayload {
  timesheetId:   string
  employeeId:    string
  employeeName:  string
  taskId?:       number
  taskName?:     string
  date:          string
  hours:         number
  billableHours: number
  writeoffHours: number
  laborCost:     number     // hours × cost_rate
  billableValue: number     // billable_hours × billable_rate
}

export interface TimesheetApprovedPayload extends BaseProjectPayload {
  timesheetId:  string
  employeeId:   string
  approvedById: string
  hours:        number
  billableHours: number
}

export interface TimesheetRejectedPayload extends BaseProjectPayload {
  timesheetId:  string
  employeeId:   string
  rejectedById: string
  reason?:      string
}

// ── Expense Events ─────────────────────────────────────────────────────

export interface ExpenseAddedPayload extends BaseProjectPayload {
  expenseId:   string
  description: string
  amount:      number
  category:    string
  isBillable:  boolean
}

export interface ExpenseApprovedPayload extends BaseProjectPayload {
  expenseId:    string
  description:  string
  amount:       number
  approvedById: string
}

export interface ExpenseDeletedPayload extends BaseProjectPayload {
  expenseId:   string
  description: string
  amount:      number
}

// ── Billing Events ─────────────────────────────────────────────────────

export interface BillingStatusChangedPayload extends BaseProjectPayload {
  oldStatus: string
  newStatus: string
}

export interface PaymentStatusChangedPayload extends BaseProjectPayload {
  oldStatus: string
  newStatus: string
}

// ── Master union type (event name → payload) ───────────────────────────

export interface ProjectEventPayloadMap {
  [EVENT_NAMES.PROJECT.PROJECT_CREATED]:       ProjectCreatedPayload
  [EVENT_NAMES.PROJECT.PROJECT_UPDATED]:       ProjectUpdatedPayload
  [EVENT_NAMES.PROJECT.PROJECT_ARCHIVED]:      ProjectArchivedPayload
  [EVENT_NAMES.PROJECT.PROJECT_STATUS_CHANGED]:ProjectStatusChangedPayload
  [EVENT_NAMES.PROJECT.TASK_CREATED]:          TaskCreatedPayload
  [EVENT_NAMES.PROJECT.TASK_UPDATED]:          TaskUpdatedPayload
  [EVENT_NAMES.PROJECT.TASK_DELETED]:          TaskDeletedPayload
  [EVENT_NAMES.PROJECT.TASK_STAGE_CHANGED]:    TaskStageChangedPayload
  [EVENT_NAMES.PROJECT.TASK_ASSIGNED]:         TaskAssignedPayload
  [EVENT_NAMES.PROJECT.MILESTONE_CREATED]:     MilestoneCreatedPayload
  [EVENT_NAMES.PROJECT.MILESTONE_UPDATED]:     MilestoneUpdatedPayload
  [EVENT_NAMES.PROJECT.MILESTONE_COMPLETED]:   MilestoneCompletedPayload
  [EVENT_NAMES.PROJECT.MILESTONE_BILLED]:      MilestoneBilledPayload
  [EVENT_NAMES.PROJECT.TIMESHEET_LOGGED]:      TimesheetLoggedPayload
  [EVENT_NAMES.PROJECT.TIMESHEET_UPDATED]:     TimesheetLoggedPayload
  [EVENT_NAMES.PROJECT.TIMESHEET_APPROVED]:    TimesheetApprovedPayload
  [EVENT_NAMES.PROJECT.TIMESHEET_REJECTED]:    TimesheetRejectedPayload
  [EVENT_NAMES.PROJECT.EXPENSE_ADDED]:         ExpenseAddedPayload
  [EVENT_NAMES.PROJECT.EXPENSE_APPROVED]:      ExpenseApprovedPayload
  [EVENT_NAMES.PROJECT.EXPENSE_DELETED]:       ExpenseDeletedPayload
  [EVENT_NAMES.PROJECT.BILLING_STATUS_CHANGED]:BillingStatusChangedPayload
  [EVENT_NAMES.PROJECT.PAYMENT_STATUS_CHANGED]:PaymentStatusChangedPayload
}

// Typed publish helper — ensures payload matches event name
export type TypedProjectPublish = <K extends keyof ProjectEventPayloadMap>(
  eventName: K,
  payload:   ProjectEventPayloadMap[K]
) => Promise<void>
```

---

### 4.3 — Project Event Publisher

```typescript
// src/modules/projects/events/projectEventPublisher.ts
//
// Thin wrapper around the existing PersistentEventBus.
// Called by mutations after every successful DB write.

import { eventBus }    from '@/infrastructure/eventStore'
import { EVENT_NAMES } from '@/shared/events'
import type {
  TypedProjectPublish,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  ProjectArchivedPayload,
  ProjectStatusChangedPayload,
  TaskCreatedPayload,
  TaskUpdatedPayload,
  TaskDeletedPayload,
  TaskStageChangedPayload,
  TaskAssignedPayload,
  MilestoneCreatedPayload,
  MilestoneUpdatedPayload,
  MilestoneCompletedPayload,
  MilestoneBilledPayload,
  TimesheetLoggedPayload,
  TimesheetApprovedPayload,
  TimesheetRejectedPayload,
  ExpenseAddedPayload,
  ExpenseApprovedPayload,
  ExpenseDeletedPayload,
  BillingStatusChangedPayload,
  PaymentStatusChangedPayload,
} from '@/shared/types/projectEvents.types'

// ── Typed publish (enforces payload shape) ────────────────────────────

const publish: TypedProjectPublish = async (eventName, payload) => {
  await eventBus.publish(eventName, payload as Record<string, unknown>)
}

// ── Project publishers ─────────────────────────────────────────────────

export const projectEventPublisher = {

  // Project
  projectCreated: (p: ProjectCreatedPayload) =>
    publish(EVENT_NAMES.PROJECT.PROJECT_CREATED, p),

  projectUpdated: (p: ProjectUpdatedPayload) =>
    publish(EVENT_NAMES.PROJECT.PROJECT_UPDATED, p),

  projectArchived: (p: ProjectArchivedPayload) =>
    publish(EVENT_NAMES.PROJECT.PROJECT_ARCHIVED, p),

  projectStatusChanged: (p: ProjectStatusChangedPayload) =>
    publish(EVENT_NAMES.PROJECT.PROJECT_STATUS_CHANGED, p),

  // Tasks
  taskCreated: (p: TaskCreatedPayload) =>
    publish(EVENT_NAMES.PROJECT.TASK_CREATED, p),

  taskUpdated: (p: TaskUpdatedPayload) =>
    publish(EVENT_NAMES.PROJECT.TASK_UPDATED, p),

  taskDeleted: (p: TaskDeletedPayload) =>
    publish(EVENT_NAMES.PROJECT.TASK_DELETED, p),

  taskStageChanged: (p: TaskStageChangedPayload) =>
    publish(EVENT_NAMES.PROJECT.TASK_STAGE_CHANGED, p),

  taskAssigned: (p: TaskAssignedPayload) =>
    publish(EVENT_NAMES.PROJECT.TASK_ASSIGNED, p),

  // Milestones
  milestoneCreated: (p: MilestoneCreatedPayload) =>
    publish(EVENT_NAMES.PROJECT.MILESTONE_CREATED, p),

  milestoneUpdated: (p: MilestoneUpdatedPayload) =>
    publish(EVENT_NAMES.PROJECT.MILESTONE_UPDATED, p),

  milestoneCompleted: (p: MilestoneCompletedPayload) =>
    publish(EVENT_NAMES.PROJECT.MILESTONE_COMPLETED, p),

  milestoneBilled: (p: MilestoneBilledPayload) =>
    publish(EVENT_NAMES.PROJECT.MILESTONE_BILLED, p),

  // Timesheets
  timesheetLogged: (p: TimesheetLoggedPayload) =>
    publish(EVENT_NAMES.PROJECT.TIMESHEET_LOGGED, p),

  timesheetApproved: (p: TimesheetApprovedPayload) =>
    publish(EVENT_NAMES.PROJECT.TIMESHEET_APPROVED, p),

  timesheetRejected: (p: TimesheetRejectedPayload) =>
    publish(EVENT_NAMES.PROJECT.TIMESHEET_REJECTED, p),

  // Expenses
  expenseAdded: (p: ExpenseAddedPayload) =>
    publish(EVENT_NAMES.PROJECT.EXPENSE_ADDED, p),

  expenseApproved: (p: ExpenseApprovedPayload) =>
    publish(EVENT_NAMES.PROJECT.EXPENSE_APPROVED, p),

  expenseDeleted: (p: ExpenseDeletedPayload) =>
    publish(EVENT_NAMES.PROJECT.EXPENSE_DELETED, p),

  // Billing
  billingStatusChanged: (p: BillingStatusChangedPayload) =>
    publish(EVENT_NAMES.PROJECT.BILLING_STATUS_CHANGED, p),

  paymentStatusChanged: (p: PaymentStatusChangedPayload) =>
    publish(EVENT_NAMES.PROJECT.PAYMENT_STATUS_CHANGED, p),
}
```

---

### 4.4 — Project Event Handlers

```typescript
// src/modules/projects/events/projectEventHandlers.ts
//
// Registered once at app startup via eventProcessor.
// Each handler contains the BUSINESS LOGIC that runs after an event.

import { createClient }   from '@supabase/supabase-js'
import { EVENT_NAMES }    from '@/shared/events'
import { eventBus }       from '@/infrastructure/eventStore'
import type {
  TaskStageChangedPayload,
  TimesheetLoggedPayload,
  TimesheetApprovedPayload,
  MilestoneCompletedPayload,
  MilestoneBilledPayload,
  ExpenseAddedPayload,
  ProjectStatusChangedPayload,
} from '@/shared/types/projectEvents.types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // server-side: service role
)

// ── Helper: update project aggregate counters ─────────────────────────

async function refreshProjectCounters(projectId: number) {
  // Re-count tasks and update project_projects
  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('id, stage')
    .eq('project_id', projectId)
    .eq('active', true)

  if (!tasks) return

  const total     = tasks.length
  const completed = tasks.filter(t => t.stage === 'done').length
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0

  await supabase
    .from('project_projects')
    .update({
      tasks_count:           total,
      completed_tasks_count: completed,
      progress,
      updated_at:            new Date().toISOString(),
    })
    .eq('id', projectId)
}

async function refreshMilestoneProgress(
  projectId: number,
  milestoneId: string
) {
  // Count tasks linked to this milestone
  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('id, stage')
    .eq('project_id',  projectId)
    .eq('milestone_id', milestoneId)
    .eq('active',       true)

  if (!tasks || tasks.length === 0) return

  const total     = tasks.length
  const completed = tasks.filter(t => t.stage === 'done').length
  const progress  = Math.round((completed / total) * 100)

  await supabase
    .from('milestones')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', milestoneId)
}

// ── Register all handlers ──────────────────────────────────────────────

export function registerProjectEventHandlers(): void {

  // ── TASK_STAGE_CHANGED ──────────────────────────────────────────────
  //    When: user drags task to new column / updates stage
  //    Does: refresh project task counters + linked milestone progress

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.TASK_STAGE_CHANGED,
    async (raw) => {
      const payload = raw as unknown as TaskStageChangedPayload

      // 1. Refresh project counters (tasks_count, completed_tasks_count)
      await refreshProjectCounters(payload.projectId)

      // 2. If task is linked to a milestone, refresh milestone progress
      const { data: task } = await supabase
        .from('project_tasks')
        .select('milestone_id')
        .eq('id', payload.taskId)
        .single()

      if (task?.milestone_id) {
        await refreshMilestoneProgress(payload.projectId, task.milestone_id)
      }
    }
  )

  // ── TASK_CREATED / TASK_DELETED ─────────────────────────────────────
  //    Does: refresh project task counters

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.TASK_CREATED,
    async (raw) => {
      const payload = raw as unknown as { projectId: number }
      await refreshProjectCounters(payload.projectId)
    }
  )

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.TASK_DELETED,
    async (raw) => {
      const payload = raw as unknown as { projectId: number }
      await refreshProjectCounters(payload.projectId)
    }
  )

  // ── TIMESHEET_LOGGED ────────────────────────────────────────────────
  //    When: employee logs time
  //    Does: update actual_hours on the task

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.TIMESHEET_LOGGED,
    async (raw) => {
      const payload = raw as unknown as TimesheetLoggedPayload

      if (!payload.taskId) return

      // Sum all logged hours for this task
      const { data } = await supabase
        .from('timesheets')
        .select('hours')
        .eq('task_id', payload.taskId)

      const totalHours = (data || []).reduce(
        (sum, t) => sum + (Number(t.hours) || 0), 0
      )

      await supabase
        .from('project_tasks')
        .update({
          actual_hours: totalHours,
          updated_at:   new Date().toISOString(),
        })
        .eq('id', payload.taskId)
    }
  )

  // ── TIMESHEET_APPROVED ──────────────────────────────────────────────
  //    When: manager approves a timesheet
  //    Does: check if billing_status should change

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.TIMESHEET_APPROVED,
    async (raw) => {
      const payload = raw as unknown as TimesheetApprovedPayload

      // Check if project has any un-billed approved timesheets
      const { count } = await supabase
        .from('timesheets')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', payload.projectId)
        .eq('status',     'approved')
        .eq('is_billed',  false)

      if ((count ?? 0) > 0) {
        // Mark billing as in_progress if it was not_started
        await supabase
          .from('project_projects')
          .update({
            billing_status: 'in_progress',
            updated_at:     new Date().toISOString(),
          })
          .eq('id',            payload.projectId)
          .eq('billing_status', 'not_started')
      }
    }
  )

  // ── MILESTONE_COMPLETED ─────────────────────────────────────────────
  //    When: milestone status set to 'completed'
  //    Does: if invoice_trigger = true, prepare invoice signal

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.MILESTONE_COMPLETED,
    async (raw) => {
      const payload = raw as unknown as MilestoneCompletedPayload

      if (!payload.invoiceTrigger || payload.invoiceAmount <= 0) return

      // Signal that an invoice is ready to be raised
      // (the billing team sees this in their dashboard)
      await supabase.from('event_store').insert({
        event_name: 'project.billing.invoice_ready',
        payload: {
          projectId:     payload.projectId,
          milestoneId:   payload.milestoneId,
          milestoneName: payload.milestoneName,
          amount:        payload.invoiceAmount,
          occurredAt:    new Date().toISOString(),
        },
        status: 'pending',
      })
    }
  )

  // ── MILESTONE_BILLED ────────────────────────────────────────────────
  //    When: milestone marked as billed
  //    Does: check if ALL milestone-trigger milestones are billed
  //          if yes → update project billing_status to 'billed'

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.MILESTONE_BILLED,
    async (raw) => {
      const payload = raw as unknown as MilestoneBilledPayload

      const { data: milestones } = await supabase
        .from('milestones')
        .select('is_billed, invoice_trigger')
        .eq('project_id', payload.projectId)
        .eq('invoice_trigger', true)

      if (!milestones || milestones.length === 0) return

      const allBilled = milestones.every(m => m.is_billed)

      if (allBilled) {
        await supabase
          .from('project_projects')
          .update({
            billing_status: 'billed',
            updated_at:     new Date().toISOString(),
          })
          .eq('id', payload.projectId)
      }
    }
  )

  // ── PROJECT_STATUS_CHANGED ──────────────────────────────────────────
  //    When: project status changes to 'completed'
  //    Does: check for unbilled timesheets + unresolved milestones
  //          and log a warning event

  eventBus.subscribe(
    EVENT_NAMES.PROJECT.PROJECT_STATUS_CHANGED,
    async (raw) => {
      const payload = raw as unknown as ProjectStatusChangedPayload

      if (payload.newStatus !== 'completed') return

      // Check for unbilled approved timesheets
      const { count: unbilledTs } = await supabase
        .from('timesheets')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', payload.projectId)
        .eq('is_billed',  false)
        .eq('status',     'approved')

      // Check for unbilled milestone invoices
      const { count: unbilledMs } = await supabase
        .from('milestones')
        .select('id', { count: 'exact', head: true })
        .eq('project_id',    payload.projectId)
        .eq('invoice_trigger', true)
        .eq('is_billed',      false)

      if ((unbilledTs ?? 0) > 0 || (unbilledMs ?? 0) > 0) {
        // Log a warning — someone needs to handle these
        await supabase.from('event_store').insert({
          event_name: 'project.billing.completion_warning',
          payload: {
            projectId:         payload.projectId,
            unbilledTimesheets: unbilledTs ?? 0,
            unbilledMilestones: unbilledMs ?? 0,
            occurredAt:         new Date().toISOString(),
          },
          status: 'pending',
        })
      }
    }
  )

  console.log('[ProjectEventHandlers] All handlers registered ✓')
}
```

---

### 4.5 — Register in the Event Processor

```typescript
// src/workers/eventProcessor.ts  (MODIFY — add one import + one call)

import { registerProjectEventHandlers } from 
  '@/modules/projects/events/projectEventHandlers'

// ── existing handler registrations ──
// registerCrmEventHandlers()
// registerSalesEventHandlers()
// registerInventoryEventHandlers()

// ── ADD THIS ──
registerProjectEventHandlers()

// rest of existing eventProcessor code unchanged...
```

---

### 4.6 — Realtime Subscriptions Bridge

```typescript
// src/modules/projects/events/projectRealtimeSubscriptions.ts
//
// Bridges Supabase Realtime (DB changes) → PersistentEventBus
// Runs on the CLIENT side inside the project module.

import { realtimeGateway } from '@/shared/realtime/RealtimeGateway'
import { eventBus }        from '@/infrastructure/eventStore'
import { EVENT_NAMES }     from '@/shared/events'

interface SubscribeOptions {
  projectId:   number
  employeeMap: Record<string, string>  // id → full_name
}

export function subscribeToProjectRealtime({
  projectId,
  employeeMap,
}: SubscribeOptions): () => void {

  const prefix = `project-${projectId}`

  // ── timesheets ──────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-timesheets`,
    {
      table:  'timesheets',
      filter: `project_id=eq.${projectId}`,
      event:  'INSERT',
    },
    async (payload: any) => {
      const row = payload.new
      await eventBus.publish(EVENT_NAMES.PROJECT.TIMESHEET_LOGGED, {
        projectId,
        timesheetId:   row.id,
        employeeId:    row.employee_id,
        employeeName:  employeeMap[row.employee_id] ?? 'Unknown',
        taskId:        row.task_id     ?? null,
        date:          row.date,
        hours:         row.hours,
        billableHours: row.billable_hours,
        writeoffHours: row.writeoff_hours ?? 0,
        laborCost:     0,   // worker will compute from cost_rate
        billableValue: 0,   // worker will compute from billable_rate
        occurredAt:    new Date().toISOString(),
      })
    }
  )

  // ── tasks ───────────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-tasks`,
    {
      table:  'project_tasks',
      filter: `project_id=eq.${projectId}`,
      event:  'UPDATE',
    },
    async (payload: any) => {
      const old = payload.old
      const row = payload.new

      // Detect stage change
      if (old.stage !== row.stage) {
        await eventBus.publish(EVENT_NAMES.PROJECT.TASK_STAGE_CHANGED, {
          projectId,
          taskId:    row.id,
          taskName:  row.name,
          oldStage:  old.stage,
          newStage:  row.stage,
          occurredAt: new Date().toISOString(),
        })
        return
      }

      // Detect assignee change
      if (old.employee_id !== row.employee_id) {
        await eventBus.publish(EVENT_NAMES.PROJECT.TASK_ASSIGNED, {
          projectId,
          taskId:      row.id,
          taskName:    row.name,
          assigneeId:  row.employee_id,
          assigneeName: employeeMap[row.employee_id] ?? 'Unknown',
          occurredAt:  new Date().toISOString(),
        })
        return
      }

      // Generic update
      await eventBus.publish(EVENT_NAMES.PROJECT.TASK_UPDATED, {
        projectId,
        taskId:        row.id,
        taskName:      row.name,
        changedFields: Object.keys(row).filter(k => row[k] !== old[k]),
        occurredAt:    new Date().toISOString(),
      })
    }
  )

  // ── milestones ──────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-milestones`,
    {
      table:  'milestones',
      filter: `project_id=eq.${projectId}`,
      event:  '*',
    },
    async (payload: any) => {
      const old = payload.old ?? {}
      const row = payload.new ?? {}

      // Detect billing
      if (!old.is_billed && row.is_billed) {
        await eventBus.publish(EVENT_NAMES.PROJECT.MILESTONE_BILLED, {
          projectId,
          milestoneId:   row.id,
          milestoneName: row.name,
          invoiceAmount: row.invoice_amount,
          billedAt:      row.billed_at,
          occurredAt:    new Date().toISOString(),
        })
        return
      }

      // Detect completion
      if (old.status !== 'completed' && row.status === 'completed') {
        await eventBus.publish(EVENT_NAMES.PROJECT.MILESTONE_COMPLETED, {
          projectId,
          milestoneId:    row.id,
          milestoneName:  row.name,
          invoiceTrigger: row.invoice_trigger,
          invoiceAmount:  row.invoice_amount,
          occurredAt:     new Date().toISOString(),
        })
      }
    }
  )

  // ── expenses ────────────────────────────────────────────────────────
  realtimeGateway.subscribe(
    `${prefix}-expenses`,
    {
      table:  'expenses',
      filter: `project_id=eq.${projectId}`,
      event:  'INSERT',
    },
    async (payload: any) => {
      const row = payload.new
      await eventBus.publish(EVENT_NAMES.PROJECT.EXPENSE_ADDED, {
        projectId,
        expenseId:   row.id,
        description: row.description,
        amount:      row.amount,
        category:    row.category,
        isBillable:  row.is_billable,
        occurredAt:  new Date().toISOString(),
      })
    }
  )

  // Return cleanup function
  return () => {
    realtimeGateway.unsubscribe(`${prefix}-timesheets`)
    realtimeGateway.unsubscribe(`${prefix}-tasks`)
    realtimeGateway.unsubscribe(`${prefix}-milestones`)
    realtimeGateway.unsubscribe(`${prefix}-expenses`)
  }
}
```

---

### 4.7 — React Hook for UI Components

```typescript
// src/modules/projects/hooks/useProjectEvents.ts
//
// Used by every tab component.
// Subscribes to events for a specific project.
// Tells the component WHICH data to refresh.

import { useEffect, useCallback, useState, useRef } from 'react'
import { realtimeGateway }  from '@/shared/realtime/RealtimeGateway'
import { eventBus }         from '@/infrastructure/eventStore'
import { EVENT_NAMES }      from '@/shared/events'
import type { ProjectEventName } from '@/shared/events'

// Which tabs are invalidated by each event
const TAB_INVALIDATION: Record<ProjectEventName, string[]> = {
  [EVENT_NAMES.PROJECT.PROJECT_CREATED]:        ['list'],
  [EVENT_NAMES.PROJECT.PROJECT_UPDATED]:        ['overview', 'financials', 'list'],
  [EVENT_NAMES.PROJECT.PROJECT_ARCHIVED]:       ['list'],
  [EVENT_NAMES.PROJECT.PROJECT_STATUS_CHANGED]: ['overview', 'list'],
  [EVENT_NAMES.PROJECT.TASK_CREATED]:           ['tasks', 'overview', 'list'],
  [EVENT_NAMES.PROJECT.TASK_UPDATED]:           ['tasks', 'overview', 'milestones'],
  [EVENT_NAMES.PROJECT.TASK_DELETED]:           ['tasks', 'overview', 'list'],
  [EVENT_NAMES.PROJECT.TASK_STAGE_CHANGED]:     ['tasks', 'overview', 'milestones', 'list'],
  [EVENT_NAMES.PROJECT.TASK_ASSIGNED]:          ['tasks'],
  [EVENT_NAMES.PROJECT.MILESTONE_CREATED]:      ['milestones', 'overview'],
  [EVENT_NAMES.PROJECT.MILESTONE_UPDATED]:      ['milestones', 'financials'],
  [EVENT_NAMES.PROJECT.MILESTONE_COMPLETED]:    ['milestones', 'financials', 'overview'],
  [EVENT_NAMES.PROJECT.MILESTONE_BILLED]:       ['milestones', 'financials', 'list', 'client'],
  [EVENT_NAMES.PROJECT.TIMESHEET_LOGGED]:       ['timesheets', 'financials', 'overview', 'list'],
  [EVENT_NAMES.PROJECT.TIMESHEET_UPDATED]:      ['timesheets', 'financials'],
  [EVENT_NAMES.PROJECT.TIMESHEET_APPROVED]:     ['timesheets', 'financials'],
  [EVENT_NAMES.PROJECT.TIMESHEET_REJECTED]:     ['timesheets'],
  [EVENT_NAMES.PROJECT.EXPENSE_ADDED]:          ['financials', 'list', 'overview'],
  [EVENT_NAMES.PROJECT.EXPENSE_APPROVED]:       ['financials'],
  [EVENT_NAMES.PROJECT.EXPENSE_DELETED]:        ['financials', 'list'],
  [EVENT_NAMES.PROJECT.BILLING_STATUS_CHANGED]: ['overview', 'financials', 'list'],
  [EVENT_NAMES.PROJECT.PAYMENT_STATUS_CHANGED]: ['overview', 'client', 'list'],
}

interface UseProjectEventsOptions {
  projectId:  number
  activeTab:  string
  onRefresh:  () => void | Promise<void>
}

interface UseProjectEventsReturn {
  staleTabs:    Set<string>
  clearStale:   (tabId: string) => void
  lastEventAt:  number | null
}

export function useProjectEvents({
  projectId,
  activeTab,
  onRefresh,
}: UseProjectEventsOptions): UseProjectEventsReturn {

  const [staleTabs, setStaleTabs]     = useState<Set<string>>(new Set())
  const [lastEventAt, setLastEventAt] = useState<number | null>(null)
  const onRefreshRef                  = useRef(onRefresh)

  // Keep ref stable
  useEffect(() => { onRefreshRef.current = onRefresh }, [onRefresh])

  const clearStale = useCallback((tabId: string) => {
    setStaleTabs(prev => {
      const next = new Set(prev)
      next.delete(tabId)
      return next
    })
  }, [])

  useEffect(() => {
    if (!projectId) return

    // Subscribe to all project event names via eventBus
    const projectEventNames = Object.values(EVENT_NAMES.PROJECT) as ProjectEventName[]

    const unsubscribers = projectEventNames.map(eventName =>
      eventBus.subscribe(eventName, async (raw: unknown) => {
        const payload = raw as { projectId?: number }

        // Filter to this project only
        if (payload.projectId !== projectId) return

        const invalidated = TAB_INVALIDATION[eventName] ?? []

        setLastEventAt(Date.now())

        if (invalidated.includes(activeTab)) {
          // Active tab → refresh immediately
          await onRefreshRef.current()
        } else {
          // Inactive tabs → mark as stale
          setStaleTabs(prev => {
            const next = new Set(prev)
            invalidated.forEach(t => next.add(t))
            return next
          })
        }
      })
    )

    return () => {
      unsubscribers.forEach(unsub => {
        if (typeof unsub === 'function') unsub()
      })
    }
  }, [projectId, activeTab])

  return { staleTabs, clearStale, lastEventAt }
}
```

---

### 4.8 — Wire Into Mutations

```typescript
// src/modules/projects/lib/projects.mutations.ts
// Each mutation publishes its event after successful DB write

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { projectEventPublisher }        from '../events/projectEventPublisher'
import type { TaskStage }               from '@/shared/types/projectEvents.types'

const supabase = createClientComponentClient()

export async function updateTaskStage(
  taskId:    number,
  newStage:  TaskStage,
  projectId: number,
  taskName:  string,
  oldStage:  TaskStage,
) {
  const { error } = await supabase
    .from('project_tasks')
    .update({ stage: newStage, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) throw error

  // ✓ DB write succeeded → publish event
  await projectEventPublisher.taskStageChanged({
    projectId,
    taskId,
    taskName,
    oldStage,
    newStage,
    occurredAt: new Date().toISOString(),
  })
}

export async function createTimesheet(data: {
  projectId:     number
  taskId?:       number
  employeeId:    string
  employeeName:  string
  date:          string
  hours:         number
  billableHours: number
  writeoffHours: number
  description:   string
}) {
  const { data: row, error } = await supabase
    .from('timesheets')
    .insert({
      project_id:    data.projectId,
      task_id:       data.taskId ?? null,
      employee_id:   data.employeeId,
      date:          data.date,
      hours:         data.hours,
      billable_hours: data.billableHours,
      writeoff_hours: data.writeoffHours,
      description:   data.description,
      status:        'draft',
    })
    .select()
    .single()

  if (error) throw error

  // ✓ DB write succeeded → publish event
  await projectEventPublisher.timesheetLogged({
    projectId:     data.projectId,
    timesheetId:   row.id,
    employeeId:    data.employeeId,
    employeeName:  data.employeeName,
    taskId:        data.taskId,
    date:          data.date,
    hours:         data.hours,
    billableHours: data.billableHours,
    writeoffHours: data.writeoffHours,
    laborCost:     0,  // computed by handler
    billableValue: 0,  // computed by handler
    occurredAt:    new Date().toISOString(),
  })

  return row
}

export async function markMilestoneBilled(
  milestoneId: string,
  projectId:   number,
  milestoneName: string,
  invoiceAmount: number,
) {
  const billedAt = new Date().toISOString()

  const { error } = await supabase
    .from('milestones')
    .update({ is_billed: true, billed_at: billedAt })
    .eq('id', milestoneId)

  if (error) throw error

  // ✓ DB write succeeded → publish event
  await projectEventPublisher.milestoneBilled({
    projectId,
    milestoneId,
    milestoneName,
    invoiceAmount,
    billedAt,
    occurredAt: billedAt,
  })
}
```

---

## Complete Architecture After Integration

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER ACTION (e.g. log 3h timesheet)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [TimesheetsTab]
       │
       ├─ 1. createTimesheet(data)          ← mutations.ts
       │       │
       │       ├─ INSERT into timesheets    ← Supabase DB write
       │       │
       │       └─ publish(TIMESHEET_LOGGED) ← projectEventPublisher
       │               │
       │               └─ INSERT into event_store { status: 'pending' }
       │
  [eventProcessor worker - server]
       │
       ├─ 2. polls event_store
       │
       ├─ 3. finds TIMESHEET_LOGGED event
       │
       ├─ 4. calls registered handler
       │       │
       │       ├─ updates task.actual_hours
       │       └─ may update billing_status
       │
       └─ 5. marks event as 'processed'

  [Supabase Realtime - client]
       │
       ├─ 6. timesheets INSERT triggers realtimeGateway callback
       │
       └─ 7. eventBus.subscribe handlers in useProjectEvents() fire
               │
               ├─ activeTab = 'timesheets' → onRefresh() called
               │     └─ TimesheetsTab re-fetches from view
               │
               ├─ 'financials' tab → marked STALE (orange dot)
               │
               ├─ 'overview' tab  → marked STALE (orange dot)
               │
               └─ 'list' tab      → marked STALE (orange dot)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES ADDED / MODIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  MODIFIED (1 line each):
  ├─ src/shared/events.ts                          + PROJECT namespace
  └─ src/workers/eventProcessor.ts                 + registerProjectEventHandlers()

  NEW FILES:
  ├─ src/shared/types/projectEvents.types.ts       typed payloads
  ├─ src/modules/projects/events/
  │   ├─ projectEventPublisher.ts                  publish() wrappers
  │   ├─ projectEventHandlers.ts                   server-side handlers
  │   └─ projectRealtimeSubscriptions.ts           DB → eventBus bridge
  └─ src/modules/projects/hooks/
      └─ useProjectEvents.ts                       React hook for UI

  EXISTING FILES (unchanged):
  ├─ src/infrastructure/eventStore.ts              ← used as-is
  ├─ src/shared/realtime/RealtimeGateway.ts        ← used as-is
  └─ src/workers/eventProcessor.ts (logic)         ← used as-is

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> **Next step:** read carefully the actual content of `eventStore.ts`, `events.ts`, `RealtimeGateway.ts`, and `eventProcessor.ts` so the integration code above can be corrected to match your exact API signatures before any file is written.