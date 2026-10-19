Phase 4 is complete.

✓ **FILE WRITTEN**: `src/modules/projects/events/projectEventHandlers.ts`
✓ **HANDLERS REGISTERED**: 
  - `TASK_STAGE_CHANGED` (Project & Milestone counters)
  - `TASK_CREATED` / `TASK_DELETED` (Project counters)
  - `TIMESHEET_LOGGED` (Task actual hours & Billing status)
  - `TIMESHEET_APPROVED` (Billing status)
  - `MILESTONE_COMPLETED` (Invoice trigger signal)
  - `MILESTONE_BILLED` (Project billing status)
  - `PROJECT_STATUS_CHANGED` (Completion warnings)
✓ **IDEMPOTENCY CHECK**: All handlers use absolute counts (`COUNT`, `SUM`) rather than relative increments, making them safe to run multiple times.
✓ **ERROR HANDLING**: Every handler is wrapped in a `try/catch` block and re-throws errors to allow the `eventProcessor` to manage retries via the `event_store` status.

Phase 5 is complete.
✓ **FILE WRITTEN**: `src/modules/projects/events/projectRealtimeSubscriptions.ts`
✓ **BRIDGE IMPLEMENTED**: Supabase Realtime $\rightarrow$ PersistentEventBus + UIEventBus.
✓ **EVENTS MAPPED**: Timesheets, Tasks (Stage/Assignee), Milestones (Billed/Completed), Expenses.

Phase 6 is complete.
✓ **FILE WRITTEN**: `src/modules/projects/hooks/useProjectEvents.ts`
✓ **FUNCTIONALITY**: Hook that tracks a version counter based on UI events for component invalidation.

Phase 7 is complete.
✓ **FILE UPDATED**: `src/main.tsx`
✓ **REGISTRY CREATED**: `src/shared/events/eventHandlerRegistry.ts`
✓ **FLOW**: App Startup $\rightarrow$ Register Handlers $\rightarrow$ Replay Pending Events.

Phase 8 is complete.
✓ **FILE UPDATED**: `src/lib/projects/projects.mutations.ts`
✓ **INTEGRATION**: All project mutations now emit corresponding domain events via `projectEventPublisher`.

Phase 9 is complete.
✓ **FILE UPDATED**: `src/components/projects/ProjectCardModal.tsx`
✓ **UI REFRESH**: Implemented `useProjectEvents` to trigger `onUpdated()` automatically when project data changes in the background.
