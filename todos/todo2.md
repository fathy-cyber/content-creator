# ERP Architecture Alignment TODO

## Executive Summary

Architecture maturity is significantly higher than previously estimated.

The system already contains:

- Event-driven architecture
- Shared typed events
- CRM → Project onboarding
- Sales → Project automation
- Sales → Inventory synchronization
- Shared Supabase RPC strategy
- Cross-module automation infrastructure

Estimated Architecture Maturity:
- Infrastructure Layer: 80%
- Event Architecture: 85%
- Core ERP Workflows: 65%
- Analytics Layer: 25%
- Support Module: 20%
- Invoice Automation: 45%
- HR Integration: 40%

Overall Estimated Maturity:
≈ 68/100

---

# VERIFIED EXISTING IMPLEMENTATIONS

## Event Infrastructure (Already Implemented)

Confirmed in guidelines:

- EventBus class
- eventBus singleton
- Typed shared events
- Publish/subscribe communication
- Sales → Project events
- CRM → Project onboarding
- Inventory synchronization
- Automation triggers

Status:
✅ IMPLEMENTED

Required Actions:
- Standardize event naming conventions
- Add retry/failure handling
- Add dead-letter queue support
- Add event persistence/auditing

---

# VERIFIED COMMUNICATIONS

## CRM → Project
Status:
✅ IMPLEMENTED

Evidence:
- crm.contact.created onboarding
- project.created events

Remaining Tasks:
- Add client lifecycle synchronization
- Add CRM timeline integration
- Add bidirectional status synchronization

Priority:
MEDIUM

---

## Sales → Project
Status:
✅ IMPLEMENTED

Evidence:
- sales.order.confirmed
- sales.order.cancelled
- project auto-creation trigger

Remaining Gaps:
- Replace name-based linkage with foreign keys
- Add transactional rollback safety
- Add hybrid order handling validation
- Add project template generation

Critical TODO:
- Add `sales_order_id` FK in `projects`

Priority:
HIGH

---

## Sales → Inventory
Status:
✅ IMPLEMENTED

Evidence:
- Inventory consumes sales.order.confirmed

Remaining Tasks:
- Add inventory reservation workflow
- Add rollback on cancellation
- Add low-stock automation events

Priority:
MEDIUM

---

# MISSING OR PARTIALLY IMPLEMENTED COMMUNICATIONS

## CRM → Sales

Expected:
- Contact synchronization
- Deal conversion
- Lead qualification transfer

Current Status:
⚠️ PARTIAL

Missing:
- Formal deal → quotation conversion
- Shared client context service
- Opportunity lifecycle sync

TODO:
- Implement crm.deal.won → sales.order.draft pipeline
- Add shared customer contract interfaces
- Add customer credit validation

Priority:
HIGH

---

## Sales → Invoice

Expected:
- Auto invoice generation
- Payment synchronization
- Revenue propagation

Current Status:
⚠️ PARTIAL

Missing:
- Production-grade invoice persistence
- Automated invoice lifecycle
- Payment reconciliation

TODO:
- Replace mock invoice storage
- Create invoice domain module
- Implement invoice.created events
- Implement invoice.paid synchronization

Priority:
CRITICAL

---

## Project → Invoice

Expected:
- Timesheet billing
- Milestone billing
- Expense billing

Current Status:
⚠️ PARTIAL

Missing:
- Approved timesheet invoice generation
- Milestone-trigger invoices
- Billable expense propagation

TODO:
- Implement project.timesheet.approved consumers
- Implement milestone invoice automation
- Add expense billing workflow

Priority:
HIGH

---

## Invoice → CRM

Expected:
- Payment history
- Client financial profile
- Risk indicators

Current Status:
❌ MISSING

TODO:
- Sync invoice payment history into CRM
- Add client aging metrics
- Add overdue account indicators

Priority:
HIGH

---

## Support → CRM

Expected:
- Ticket history
- SLA history
- Customer support profile

Current Status:
⚠️ PARTIAL

Missing:
- Real support backend
- CRM ticket timeline integration

TODO:
- Implement support module
- Add support.ticket.created events
- Add client support history aggregation

Priority:
HIGH

---

## Support → Project

Expected:
- Bug → task conversion
- Project-linked tickets

Current Status:
❌ MISSING

TODO:
- Implement bug escalation workflow
- Auto-create tasks from tickets
- Link tickets to project milestones

Priority:
HIGH

---

## Marketing → CRM

Expected:
- Lead ingestion
- Campaign attribution
- Lead scoring

Current Status:
⚠️ PARTIAL

Missing:
- Real campaign engine
- Attribution tracking
- Lead scoring automation

TODO:
- Implement campaign entities
- Implement marketing.lead.scored
- Add CRM campaign attribution

Priority:
MEDIUM

---

# DEPENDENCY GRAPH VALIDATION

## VERIFIED CORRECT DEPENDENCIES

### Level 0
- HR
- Marketing

Architecture Status:
✅ VALID

---

### Level 1
- CRM depends on HR + Marketing

Architecture Status:
✅ VALID

---

### Level 2
- Sales depends on CRM + HR

Architecture Status:
✅ VALID

---

### Level 3
- Project depends on Sales + HR
- Invoice depends on Sales + Project
- Support depends on CRM

Architecture Status:
✅ VALID

---

### Level 4
- Analytics aggregates all modules

Architecture Status:
⚠️ NOT YET IMPLEMENTED

TODO:
- Build centralized analytics aggregation service
- Add KPI materialization layer
- Add async reporting jobs

Priority:
HIGH

---

# CRITICAL ARCHITECTURE VIOLATIONS

## ERP Monolith Structure

Problem:
Multiple bounded contexts still exist under:
- src/modules/erp/

Impact:
- Weak domain isolation
- Shared deployment coupling
- Harder scaling
- Difficult ownership boundaries

Required Refactor:
Move toward:
- src/modules/crm/
- src/modules/sales/
- src/modules/project/
- src/modules/invoice/
- src/modules/hr/
- src/modules/support/

Priority:
HIGH

---

## Weak Database Relationships

Problem:
Some workflows rely on implicit naming conventions instead of FK relations.

Critical Missing Relations:
- projects.sales_order_id
- invoices.project_id consistency
- ticket.project_id enforcement
- deal.sales_order linkage

Priority:
CRITICAL

---

# INFRASTRUCTURE IMPROVEMENTS

## Event System Hardening

Current:
- Event bus exists

Missing:
- Event persistence
- Replay capability
- Failure recovery
- Idempotency handling
- Distributed processing

TODO:
- Add event store
- Add retry queues
- Add dead-letter queue
- Add correlation IDs
- Add event versioning

Priority:
HIGH

---

## Realtime Synchronization

Current:
⚠️ PARTIAL

Missing:
- Unified websocket gateway
- Cross-module live updates
- Presence/state synchronization

TODO:
- Add realtime gateway
- Add module subscriptions
- Add dashboard live metrics

Priority:
MEDIUM

---

## Shared Domain Contracts

Current:
⚠️ PARTIAL

Missing:
- Shared DTOs
- Typed contracts
- Module interface boundaries

TODO:
Create:
- shared/contracts/
- shared/types/
- shared/events/

Priority:
HIGH

---

# ANALYTICS ARCHITECTURE TODO

## Missing Analytics Aggregator

Expected:
Analytics must consume:

- Marketing spend
- CRM CAC
- Sales LTV
- Project utilization
- Invoice cash flow
- HR utilization
- Support SLA metrics

Current:
❌ Mostly absent

TODO:
Implement:
- analyticsService
- KPI aggregation jobs
- Materialized reporting tables
- Cross-module reporting APIs

Priority:
CRITICAL

---

# FRONTEND ARCHITECTURE TODO

## Cross-Module UI Synchronization

Missing:
- Automatic UI refresh after events
- Shared entity views
- Linked navigation contexts

TODO:
- Add reactive event subscriptions
- Add global ERP entity linking
- Add unified activity feed

Priority:
MEDIUM

---

# ENTERPRISE FEATURES STILL MISSING

## Permissions & RBAC
TODO:
- Role-based access control
- Module-scoped permissions
- Record ownership

Priority:
HIGH

---

## Audit Logging
TODO:
- Entity audit history
- Event audit trail
- User action logs

Priority:
HIGH

---

## Workflow Engine
TODO:
- Declarative workflow rules
- Automation builder
- Approval chains

Priority:
MEDIUM

---

# RECOMMENDED FINAL TARGET ARCHITECTURE

src/
├── modules/
│   ├── crm/
│   ├── sales/
│   ├── project/
│   ├── invoice/
│   ├── hr/
│   ├── support/
│   ├── marketing/
│   └── analytics/
│
├── shared/
│   ├── events/
│   ├── contracts/
│   ├── types/
│   ├── rpc/
│   └── utils/
│
├── infrastructure/
│   ├── eventbus/
│   ├── websocket/
│   ├── queues/
│   ├── notifications/
│   └── auth/
│
└── automation/
    ├── triggers/
    ├── workflows/
    └── schedulers/

---

# PRIORITIZED IMPLEMENTATION ROADMAP

## Phase 1 — Critical Data Integrity
- Replace implicit relations with FK constraints
- Refactor invoice persistence
- Normalize cross-module IDs

## Phase 2 — Complete Missing Modules
- Support
- Marketing
- Analytics

## Phase 3 — Complete Financial Automation
- Timesheet billing
- Milestone billing
- Payment synchronization

## Phase 4 — Event Infrastructure Hardening
- Retry queues
- Event persistence
- Distributed processing

## Phase 5 — Enterprise Features
- RBAC
- Audit logs
- Workflow engine
