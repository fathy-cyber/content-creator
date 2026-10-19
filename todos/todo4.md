# TODO: Inter-Module Communication & Real-time Synchronization

## Goal
Implement a robust event-driven architecture to ensure that actions in one part of the Project module (e.g., logging time) immediately refresh related data across all other tabs and the main project list, including support for multi-user real-time updates via Supabase.

## Current Architecture Gap Analysis
- **Current State**: Most updates rely on manual `onUpdated` callbacks passed through props or simple page-level refresh keys.
- **The Gap**: No centralized event bus or state synchronization mechanism. If a user updates a task in the `TaskBoardTab`, the `FinancialsTab` or `OverviewTab` remains stale until a full page refresh or modal close/re-open.
- **Real-time Gap**: No implementation of Supabase Realtime listeners to handle changes made by other users/tabs.

## Requirement Matrix

| User Action | Event Emitted | Tabs/Components to Refresh |
| :--- | :--- | :--- |
| [Timesheets] Log time | `TIMESHEET_CREATED` | Financials, Overview, List Row |
| [Tasks] Drag to Done | `TASK_STAGE_CHANGED` | Overview, Milestones, List Row |
| [Tasks] Create task | `TASK_CREATED` | Overview, List Row |
| [Expenses] Add expense | `EXPENSE_CREATED` | Financials, Overview, List Row |
| [Milestones] Mark Billed | `MILESTONE_BILLED` | Financials, Client Tab, List Row |
| [Overview] Save project | `PROJECT_UPDATED` | Overview, Financials, List Row |
| [Timesheets] Approve | `TIMESHEET_APPROVED` | Financials, Timesheets |

## Implementation Plan

### Phase 1: Event Infrastructure
- [ ] Create a lightweight `ProjectEventBus` (using `mitt` or a custom `EventTarget` implementation) to handle in-app communication.
- [ ] Define a strongly typed set of project events.
- [ ] Implement a `useProjectEvents` hook to allow tabs to subscribe to specific events and trigger local re-fetches.

### Phase 2: Mutation Integration
- [ ] Update all mutations in `src/lib/projects/projects.mutations.ts` to emit the corresponding event upon success.
- [ ] Example: `updateTaskStage` $\rightarrow$ emit `TASK_STAGE_CHANGED`.

### Phase 3: Tab-level Integration
- [ ] **OverviewTab**: Subscribe to `TASK_CREATED`, `TASK_STAGE_CHANGED`, `PROJECT_UPDATED`.
- [ ] **FinancialsTab**: Subscribe to `TIMESHEET_CREATED`, `EXPENSE_CREATED`, `PROJECT_UPDATED`, `TIMESHEET_APPROVED`.
- [ ] **MilestonesTab**: Subscribe to `TASK_STAGE_CHANGED`.
- [ ] **ClientPortalTab**: Subscribe to `MILESTONE_BILLED`, `PROJECT_UPDATED`.
- [ ] **ProjectListTable**: Subscribe to all project-level events to refresh the summary row.

### Phase 4: Supabase Realtime
- [ ] Create a `useProjectRealtime(projectId)` hook.
- [ ] Set up Supabase `postgres_changes` listeners for `project_tasks`, `timesheets`, `expenses`, and `milestones`.
- [ ] Map database changes to the `ProjectEventBus` events to trigger the same refresh flow as local actions.

## Verification
- [ ] **Test Case 1**: Open project in two tabs $\rightarrow$ Log time in Tab A $\rightarrow$ Verify Financials update in Tab B.
- [ ] **Test Case 2**: Move task to Done $\rightarrow$ Verify Overview Progress bar and Task Count update instantly.
- [ ] **Test Case 3**: Add expense $\rightarrow$ Verify Gross Profit in List Row updates immediately.
