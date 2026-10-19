You are a senior software architect specialized in Odoo 17 internals, ERP frameworks, modular monoliths, and enterprise platform refactoring.

Your task is to analyze and refactor the CURRENT existing project so that its architecture matches the real Odoo architecture described in `odoo.md`.

IMPORTANT CONSTRAINTS:

* DO NOT rewrite the project from scratch.
* DO NOT delete existing modules/features/business logic.
* DO NOT remove existing functionality unless absolutely necessary.
* DO NOT create fake/demo architecture disconnected from the existing codebase.
* Preserve current features and modules.
* Your goal is STRUCTURAL REFACTORING and ARCHITECTURAL ALIGNMENT.
* Incrementally transform the existing project into a true Odoo-like architecture.

The project is implemented with:

* Frontend: React + Next.js
* Existing backend/services/modules already implemented
* Existing modules must be preserved and reorganized correctly

Your mission is to review the current architecture and refactor it to match these Odoo architectural principles:

---

1. TARGET ARCHITECTURE (MANDATORY)

---

The final architecture MUST contain:

## A. CORE KERNEL LAYER

Create or refactor a central kernel/core responsible for:

* application bootstrap
* module loading lifecycle
* registry management
* service registration
* dependency injection
* event bus
* environment/context management
* permissions/security hooks
* ORM abstraction
* model registry
* scheduled jobs
* RPC/API layer
* addon/module discovery

The kernel must behave similarly to:

* Odoo Registry
* Odoo Environment
* Odoo module loader
* Odoo service layer

Expected folders (adapt to existing project):

/kernel
/core
/server
/framework

Examples:

* registry manager
* module loader
* service container
* env/context object
* hooks system
* event bus
* lifecycle manager

---

## B. ADDONS/MODULE SYSTEM

The project MUST become truly modular like Odoo.

Each business feature must become an isolated addon/module.

Examples:

* crm
* sales
* inventory
* accounting
* hr
* messaging
* ai
* workflow
* notifications

Each module should contain:

* manifest/config metadata
* models
* services
* routes/controllers
* UI components
* hooks
* permissions
* events
* state/store
* migrations
* tests

Create/refactor toward a structure like:

/addons
/crm
manifest.ts
models/
services/
routes/
ui/
hooks/
events/
store/
/sales
/inventory

or

/modules
/crm
/sales

The architecture MUST support:

* module auto-discovery
* dependency graphs
* lazy loading
* enable/disable modules
* module initialization lifecycle
* inter-module extension

---

## C. MODULE MANIFEST SYSTEM

Implement a manifest system equivalent to Odoo's **manifest**.py.

Each module should declare:

* name
* version
* dependencies
* services
* routes
* events
* permissions
* migrations
* hooks
* exports

Example:

export default {
name: "crm",
version: "1.0.0",
depends: ["base", "mail"],
services: [],
routes: [],
events: [],
}

The kernel must dynamically read manifests.

---

## D. MODEL REGISTRY & ORM ABSTRACTION

Refactor the backend so models are registered centrally.

Implement:

* model registry
* model inheritance
* extension mechanism
* lifecycle hooks
* service injection
* environment access

Support concepts equivalent to:

* _inherit
* _inherits
* model extension
* method override
* hooks/plugins

Avoid tight coupling.

---

## E. INTER-MODULE COMMUNICATION

Modules must communicate through:

* service registry
* event bus
* hooks
* contracts/interfaces
* registry lookups
* dependency injection

Avoid:

* direct imports everywhere
* circular dependencies
* hardcoded cross-module calls

Refactor current spaghetti dependencies into clean modular interactions.

---

## F. SERVICE LAYER

Implement/refactor:

* centralized services
* injectable services
* shared infrastructure services

Examples:

* auth service
* notification service
* cache service
* AI service
* workflow engine
* websocket/bus service
* RPC gateway

Services should be discoverable and injectable by modules.

---

## G. EVENT BUS / REALTIME BUS

Implement an Odoo-like bus system:

* pub/sub
* websocket events
* internal events
* realtime notifications

Modules should communicate through events instead of direct coupling.

---

## H. REQUEST ENVIRONMENT

Create an Environment object similar to Odoo's env.

It should encapsulate:

* current user
* permissions
* request context
* services
* models
* transaction/session
* tenant/workspace info

All business logic should access shared resources through env/context.

---

## I. LIFECYCLE HOOKS

Support lifecycle hooks:

* module install
* module load
* module init
* app startup
* migrations
* post-init hooks
* pre-init hooks

---

## J. FRONTEND MODULARIZATION

Refactor React/Next.js frontend into addon-based frontend modules.

Avoid one giant frontend.

Frontend modules should support:

* route injection
* menu injection
* component registry
* extension points
* plugin architecture
* shared UI kernel

---

## K. CLEAN DEPENDENCY GRAPH

Analyze all current dependencies and refactor toward:

* layered architecture
* clean dependency direction
* minimal coupling
* domain isolation
* shared kernel utilities only when appropriate

---

2. AUDIT PHASE (MANDATORY FIRST)

---

Before refactoring:

1. Analyze the ENTIRE current architecture.
2. Identify:

   * anti-patterns
   * tight coupling
   * duplicated logic
   * missing kernel abstractions
   * invalid module boundaries
   * direct cross-module dependencies
   * missing service layers
   * missing registries
   * missing lifecycle management
3. Compare the current implementation against:

   * Odoo kernel
   * Odoo addons system
   * Odoo module communication
   * Odoo registry architecture
4. Produce a detailed GAP ANALYSIS.

---

3. REFACTOR STRATEGY

---

Refactor incrementally.

DO NOT break the project.

For each refactor:

* explain why
* explain architectural benefit
* preserve compatibility
* preserve existing features

Prefer:

* adapters
* wrappers
* compatibility layers
* migration paths

instead of destructive rewrites.

---

4. OUTPUT FORMAT

---

For each phase provide:

## CURRENT PROBLEM

## WHY IT VIOLATES ODOO ARCHITECTURE

## TARGET ARCHITECTURE

## REFACTOR PLAN

## DIRECTORY STRUCTURE

## CODE CHANGES

## MIGRATION STRATEGY

## RISKS

## COMPATIBILITY NOTES

Then implement the refactor step-by-step.

---

5. FINAL OBJECTIVE

---

Transform the current project into a true enterprise-grade Odoo-like platform with:

* kernel-driven architecture
* addon ecosystem
* module manifests
* registries
* extensibility
* plugin architecture
* service-oriented internals
* event-driven communication
* clean module boundaries
* dependency-managed addons
* scalable frontend/backend modularity

while preserving the existing project and modules.

The result must feel architecturally similar to Odoo 17 internally, even though the stack is React + Next.js.
