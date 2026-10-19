
# ERP Architecture Compliance & Execution Audit Prompt

You are acting as a Senior ERP Software Architect and Enterprise Code Auditor.

Your mission is to audit the CURRENT project implementation against the specifications and requirements defined in `todo3.md`.

The audit must be STRICT, TECHNICAL, and EVIDENCE-BASED.

Do NOT trust TODO checkboxes blindly.

For every item marked `[x]`, verify whether:

* the implementation REALLY exists,
* it is production-grade,
* modules are correctly integrated,
* architecture follows enterprise ERP standards,
* cross-module communication actually works,
* code is not mocked/fake/partial,
* workflows are executable end-to-end.

---

# AUDIT OBJECTIVES

Analyze the entire codebase and determine:

1. Which TODO tasks are FULLY implemented
2. Which tasks are PARTIALLY implemented
3. Which tasks are FAKE implementations or placeholders
4. Which tasks are architecturally incorrect
5. Which tasks violate Odoo-like ERP architecture principles
6. Which tasks are missing tests, events, or persistence
7. Which workflows break under real usage

---

# REQUIRED AUDIT METHOD

For EACH item in `todo3.md`, perform ALL the following checks:

## 1. Structural Verification

Verify:

* files exist,
* services exist,
* entities/models exist,
* migrations exist,
* repositories exist,
* APIs/routes/controllers exist,
* UI integration exists if required.

Provide exact file paths.

---

## 2. Runtime Workflow Verification

Verify workflows are ACTUALLY executable.

Example:

* Sales Order → Invoice
* Ticket → Project Task escalation
* Approved Timesheet → Invoice
* Marketing Lead → CRM Lead
* Invoice Payment → CRM metrics

Trace the REAL execution flow:

* UI
* API
* Service layer
* Domain layer
* Events
* Database persistence

Detect broken chains.

---

## 3. Event Architecture Audit

Verify:

* events are emitted,
* consumers exist,
* handlers execute correctly,
* retry handling exists,
* event persistence exists,
* DLQ exists,
* idempotency exists,
* correlation IDs exist.

Detect:

* fire-and-forget fake events,
* dead consumers,
* circular dependencies,
* missing subscribers.

---

## 4. Database Integrity Audit

Verify:

* foreign keys exist,
* migrations were applied,
* constraints are enforced,
* no implicit naming relations remain,
* no duplicated IDs/contracts exist,
* transactional consistency exists.

Check:

* cascade policies,
* orphan records,
* invalid references.

---

## 5. Enterprise ERP Architecture Compliance

Verify whether the project truly follows:

* modular ERP architecture,
* bounded contexts,
* domain isolation,
* shared contracts,
* event-driven integration,
* scalable service boundaries.

Detect:

* tight coupling,
* direct cross-module imports,
* business logic inside controllers,
* duplicated logic,
* frontend/backend contract mismatches.

---

## 6. Frontend Integration Audit

Verify:

* realtime subscriptions work,
* websocket gateway exists,
* activity feeds are functional,
* UI reacts to backend events,
* ERP entity linking works.

Detect:

* static mock UIs,
* missing live synchronization,
* disconnected dashboards.

---

## 7. Production Readiness Audit

Check:

* logging,
* RBAC,
* audit trails,
* workflow engine robustness,
* async jobs,
* queue handling,
* retry strategies,
* error boundaries,
* transactional safety.

Detect:

* TODO placeholders,
* console.log debugging,
* mock repositories,
* hardcoded data,
* fake analytics.

---

# OUTPUT FORMAT

Generate a FULL audit report with the following structure:

# ERP Audit Report

## Executive Summary

* Architecture score (/10)
* Production readiness score (/10)
* ERP compliance score (/10)
* Major architectural risks
* Critical missing enterprise features

---

# Detailed TODO Verification

For EACH todo item:

## Task Name

Status:

* ✅ Fully Implemented
* ⚠️ Partially Implemented
* ❌ Missing
* 🚨 Architecturally Incorrect

### Evidence

* file paths
* services
* events
* migrations
* APIs
* database entities

### Problems Found

* missing logic
* broken workflows
* fake implementations
* coupling issues
* scalability risks

### Required Fixes

Provide exact technical fixes.

---

# Cross-Module Workflow Audit

Verify:

* CRM ↔ Sales
* Sales ↔ Inventory
* Sales ↔ Projects
* Projects ↔ Invoicing
* Invoicing ↔ CRM
* Support ↔ Projects
* Marketing ↔ CRM
* Analytics ↔ All Modules

For EACH workflow:

* show event chain,
* services involved,
* DB writes,
* failures,
* missing integrations.

---

# Event System Audit

Verify:

* Event bus
* Persistence
* Replay support
* DLQ
* Retry queues
* Correlation IDs
* Idempotency
* Versioning

Provide architectural score.

---

# Final Verdict

Provide:

* whether this is truly an enterprise-grade ERP,
* whether it resembles Odoo-like architecture,
* scalability limitations,
* refactoring priorities,
* top 10 critical fixes before production.

---

# IMPORTANT RULES

* Do NOT assume implementation correctness from TODO checkboxes.
* Do NOT accept mocked logic as completed.
* Do NOT ignore partial implementations.
* Be extremely strict.
* Prefer architectural correctness over surface-level completion.
* Trace REAL execution paths.
* Detect hidden technical debt.
* Detect fake event-driven architecture.
* Detect anti-patterns and coupling issues.
* Provide actionable fixes with exact file references.
