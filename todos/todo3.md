# ERP Architecture Alignment TODO

## 🚀 Phase 1: Critical Data Integrity & Infrastructure [x]
- [x] Replace implicit naming-based relations with formal Foreign Key (FK) constraints
  - [x] Add `sales_order_id` FK in `projects` table
  - [x] Ensure `invoices.project_id` consistency
  - [x] Enforce `ticket.project_id` relation
  - [x] Link `deal.sales_order` explicitly
- [x] Refactor invoice persistence to production-grade (remove mocks)
- [x] Normalize cross-module IDs and implement shared domain contracts (`shared/contracts/`, `shared/types/`)
- [x] Refactor bounded contexts from `src/modules/erp/` to individual module folders (e.g., `src/modules/crm/`, `src/modules/sales/`, etc.)

## 🛠️ Phase 2: Missing Modules & Core Workflows [x]
- [x] **Support Module**
  - [x] Implement support backend and entities
  - [x] Add `support.ticket.created` events
  - [x] Implement bug escalation workflow (Ticket ----> Project Task)
  - [x] Add client support history aggregation in CRM
- [x] **Marketing Module**
  - [x] Implement campaign entities and attribution tracking
  - [x] Implement `marketing.lead.scored` automation
  - [x] Integrate lead ingestion into CRM
- [x] **Analytics Module**
  - [x] Build centralized `analyticsService` for cross-module aggregation
  - [x] Implement KPI materialization layer and async reporting jobs
  - [x] Create cross-module reporting APIs (CAC, LTV, Utilization)

## 💰 Phase 3: Financial Automation
- [x] **Sales $\rightarrow$ Invoice**
  - [x] Implement automated invoice lifecycle (Draft $\rightarrow$ Sent $\rightarrow$ Paid)
  - [ ] Implement payment reconciliation and revenue propagation
- [x] **Project $\rightarrow$ Invoice**
  - [x] Implement automation for approved timesheets $\rightarrow$ Invoices
  - [x] Implement milestone-trigger invoice generation
  - [x] Implement billable expense propagation to invoices
- [ ] **Invoice $\rightarrow$ CRM**
  - [ ] Sync payment history and client aging metrics into CRM
  - [ ] Add overdue account indicators to client profiles

## ⚡ Phase 4: Event System Hardening
- [x] Implement event persistence (Event Store) for audit and replay
- [x] Add retry queues and Dead-Letter Queues (DLQ) for failure recovery
- [x] Implement idempotency handling and correlation IDs for distributed tracing
- [x] Add event versioning to prevent breaking changes in consumers
 
## 🔐 Phase 5: Enterprise Features
- [x] **Permissions & RBAC**
  - [x] Implement Role-Based Access Control (RBAC)
  - [x] Add module-scoped permissions and record ownership
- [x] **Audit Logging**
  - [x] Implement entity audit history and event audit trails
  - [x] Add detailed user action logs
- [x] **Workflow Engine**
  - [x] Build declarative workflow rules and automation builder
  - [x] Implement approval chains for financial/project documents
 
## 🎨 Phase 6: Frontend & Realtime Sync
- [x] Add reactive event subscriptions to UI for automatic refresh
- [x] Implement global ERP entity linking and unified activity feed
- [x] Build unified websocket gateway for cross-module live updates

