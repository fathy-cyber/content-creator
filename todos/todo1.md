# TODOS.md — Refactor Plan for Current Project

> This plan is derived from `guidelines.md` and the existing implementation in `src/modules/erp`, `src/modules/crm`, and Supabase migrations.
> Follow the current repo architecture and event-driven rules. If a task would require a large new feature or cross-module DB dependency not already partially present, stop and ask for approval.

## OVERVIEW

- Goal: refactor the current ERP/CRM/Sales/Project implementation into a clean, event-driven architecture.
- Priority: preserve existing behavior, remove unsafe direct cross-module DB access, and align current modules with shared foundation guidelines.
- Scope: project creation, task progress/status, shared contact/employee data, sales event flow, and safe fallback handling.

---

## PHASE 0 — CURRENT STATE AUDIT & CLEANUP

- [x] 🔴 Audit all current module data access in `src/modules/**/*.ts`.
- [x] 🔴 Confirm every inter-module integration uses `eventBus` and not direct `supabase.from()` calls for other module tables.
- [x] 🔴 Document the current schema: `crm_contacts`, `sales_orders`, `project_projects`, `project_tasks`, `project_time_entries`, `project_milestones`, and mock `hrmService`.
  - current state: `crm_contacts` exists as CRM contact storage
  - `clients` table is not present in repo migrations
  - `employees` are still mock-backed in `src/modules/erp/hrmService.ts`
  - `users` table exists in `supabase_schema.sql`, but full auth/user flow is not yet integrated into ERP modules
- [x] 🔴 Identify missing shared foundation objects: `clients`, `contacts`, `employees`, and `users`.
- [x] 🔴 Define the minimum safe refactor surface for the current repo before adding new shared DB tables.
  - safe surface: existing CRM and ERP tables are used inside their own modules
  - safe surface: `sales.order.confirmed` + `crm.contact.created` project creation flows are event-driven
  - safe surface: avoid adding `clients` or `employees` DB tables until shared domain model alignment is approved
- [x] 🟠 Remove or isolate any data access that violates module boundaries. (Audit found no cross-module direct table access.)

---

## PHASE 1 — SHARED FOUNDATION ALIGNMENT ✅ COMPLETE

### 1.1 Shared schema cleanup
- [x] 🔴 Add `clients` table migration to match guideline shared model.
- [x] 🔴 Add `contacts` table migration and migrate/alias existing `crm_contacts` if needed.
- [x] 🔴 Add `employees` table migration and replace mock HR data with a DB-backed service.
- [x] 🔴 Add `users` table migration only if auth is required by current repo scope.
- [x] 🔴 Keep existing project tables and service functions, but align names with shared domain where possible.
- [x] 🟠 Add indexes on frequently queried columns: `clients.status`, `contacts.email`, `employees.is_active`, `project_projects.status`, `project_tasks.project_id`.

### 1.2 Shared services and RPCs
- [x] 🔴 Build shared service functions for `clients`, `contacts`, `employees` in Supabase migrations.
- [x] 🔴 Ensure `src/modules/crm/crmService.ts` uses shared contact RPCs, not raw table access.
- [x] 🔴 Ensure HRM/employee services use shared `employees` DB access where available, with mock fallback.
- [x] 🔴 Ensure `src/lib/supabase.ts` centralizes `supabase` and `supabaseService` clients consistently.
- [x] 🟠 Fix sales-inventory communication: when sales order is confirmed, deduct product quantities from inventory accordingly.

---

## PHASE 2 — EVENT-DRIVEN MODULE FLOW

### 2.1 Event bus hygiene
 - [x] 🔴 Confirm `src/core/kernel/EventBus.ts` is the single source of truth for event dispatch.
 - [x] 🔴 Confirm `src/shared/events.ts` exports the same singleton used by all modules.
 - [x] 🔴 Add event payload validation for published events where missing.
 - [x] 🟠 Add event documentation for current event names used by the repo.

### 2.2 Sales → Project flow
 - [x] 🔴 Verify `src/modules/erp/salesService.ts` publishes `sales.order.confirmed`.
 - [x] 🔴 Verify `src/modules/erp/projectService.ts` subscribes to `sales.order.confirmed` and creates projects.
 - [x] 🔴 Verify `projectService` publishes `project.created` after auto-creation.
 - [x] 🟠 Verify cancelled sales orders publish `sales.order.cancelled` and cancel linked projects.
 - [x] 🟠 Ensure `inventoryService` only consumes `sales.order.confirmed` and does not read project tables.

### 2.3 CRM → Project flow
 - [x] 🔴 Verify `crmService` emits `crm.contact.created` on new contact creation.
 - [x] 🔴 Verify `projectService` consumes `crm.contact.created` to create onboarding projects.
- [ ] 🟡 Confirm CRM and Project modules do not directly query each other’s tables.

---

## PHASE 3 — PROJECT MODULE REFACTOR

### 3.1 Backend service cleanup
 - [x] 🔴 Refactor `src/modules/erp/projectService.ts` to centralize task creation/update logic.
 - [x] 🔴 Remove unsafe direct cross-module SQL; keep project-task operations inside project service only.
 - [x] 🔴 Keep `supabaseService.from('project_tasks')` fallback only if absolutely required, and document why.
 - [x] 🔴 Add or verify Supabase service functions for `create_task`, `update_task`, `get_tasks_by_project`, `update_project`.
 - [x] 🔴 Ensure `recalculateProjectProgress()` updates `status` to:
  - `completed` when all tasks are 100%
  - `in-progress` otherwise when tasks exist
 - [x] 🔴 Ensure `recalculateProjectProgress()` also updates `tasks_count` and `completed_tasks_count`.
 - [x] 🔴 Add strict error handling for missing RPCs and schema mismatch, without noisy retries.

### 3.2 UI and page state
 - [x] 🔴 Refactor `src/modules/erp/pages/ProjectList.tsx` so project state refreshes after task updates.
 - [x] 🔴 Ensure task progress edits trigger backend recalculation and updated project status.
 - [x] 🔴 Keep event-driven refresh semantics: reload project record after backend update.
 - [x] 🟠 Add UI badges for `planning`, `in-progress`, `completed`, and any other current statuses.

### 3.3 Manifests and module metadata
 - [x] 🔴 Verify `ProjectManifest` defines bus events for `crm.contact.created` and `sales.order.confirmed` only.
 - [x] 🔴 Verify `SalesManifest` defines `sales.order.confirmed` and `sales.order.cancelled` properly.
 - [x] 🔴 Verify `HRMManifest` and `CRMManifest` do not claim ownership of project tables.
 - [x] 🟠 Align manifest model definitions with actual Supabase table schema.

---

## PHASE 4 — TESTS & SAFETY

 - [x] 🔴 Add unit tests for `projectService.recalculateProjectProgress()`.
 - [x] 🔴 Add integration tests for `sales.order.confirmed -> project created` flow.
 - [x] 🔴 Add tests for `eventBus` publish/subscribe behavior in current repo.
 - [x] 🔴 Add regression test for task progress changing project status from `planning` to `in-progress`.
- [ ] 🟠 Add tests for fallback RPC absence, schema mismatch, and service-role inserts.
- [ ] 🟡 Add UI test coverage for `ProjectList` task progress edit flow.

---

## PHASE 5 — DOCUMENTATION & CONSISTENCY

 - [x] 🔴 Update README or repo docs with current event-driven architecture.
 - [x] 🔴 Add architecture note in `guidelines.md` for the actual repo implementation.
- [ ] 🔴 Keep `TODOS.md` limited to refactor tasks relevant to the current codebase.
- [ ] 🟠 Remove stale or irrelevant TODO items from the previous comprehensive agency build plan.
- [ ] 🟡 Add explicit “approval required” notes for any feature that extends beyond current module scope.

---

## APPROVAL RULE

> If a task depends on a feature that is not already implemented or safe to refactor in the current repo, do not implement it without approval.
> Examples:
> - creating a full `clients` shared table if the repo currently only has `crm_contacts`
> - replacing mock `hrmService` with a full employee DB layer before approval
> - introducing a new cross-module DB join between CRM and Project without an event bus path

