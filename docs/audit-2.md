Excellent audit.  
It shows good direction, but it is still **feature-centric**, not yet **architecture-centric**.

Right now your vision is:

> Add more tools.

What you actually need is:

> Redesign the system as a modular Agency Operating System with a real kernel, model extension system, workflow engine, and governance layer.

Below is a **corrected, enterprise-grade architecture redesign** + structural improvements.

---

# 🔥 CORE PROBLEM

Your system is currently:

- Modular at folder level ✅
- Feature-rich at UI level ✅
- Event-aware at surface level ✅
- But still:
  - Hard-linked ❌
  - Not model-extensible ❌
  - Not workflow-native ❌
  - Not audit-driven ❌
  - Not multi-tenant ready ❌
  - Not plugin-safe ❌

You are building an Agency OS.
You need:

- Kernel
- Registry
- Extension system
- Workflow engine
- Policy layer
- Observability layer

Not just tools.

---

# ✅ ENTERPRISE-GRADE AGENCY OS REDESIGN

---

# 🧠 1. Redefine the System as 4 Layers

Instead of modules only, structure the OS like this:

```
Kernel (Core Runtime)
│
├── Domain Models Layer
│
├── Application Modules
│
└── Automation & Intelligence Layer
```

---

# 🏗️ LAYER 1 — THE KERNEL (Non-Negotiable)

Create:

```
/core
```

This is NOT a module.
This is the operating system runtime.

## Must Contain:

### ✅ 1. Service Registry

```ts
registerService(name, implementation)
getService(name)
```

No direct imports between modules.

---

### ✅ 2. Model Registry (Critical)

```ts
registerModel('crm.contact', schema)
extendModel('crm.contact', extraFields)
```

This allows:

- marketing extends crm.contact
- support extends crm.contact
- automation listens to crm.contact changes

Odoo-like extensibility.

---

### ✅ 3. Global Event Bus

Not simple emitter.

Must support:

- persistent events
- retry
- idempotency
- event versioning

Events stored in DB:

```
system_events
-------------
id
event_name
payload JSONB
status
processed_at
```

---

### ✅ 4. Workflow Engine (NEW — Missing)

Instead of ad-hoc logic:

Create generic workflow engine:

```
workflow_definitions
workflow_instances
workflow_steps
```

Used for:

- Client approval
- Asset approval
- Campaign lifecycle
- Support escalation
- Strategy review

This replaces hard-coded status logic.

---

### ✅ 5. Policy Engine (Enterprise Addition)

Define policies:

- Role-based
- Entity-based
- Field-level

Example:

```
Editor can edit draft assets.
Client cannot see internal notes.
```

Do NOT rely only on role strings.

---

# 🏢 2. Redesign the Domain Layer (Shared Entity Graph)

Instead of silo tables, create canonical entities:

```
core.client
core.project
core.organization
core.asset
core.task
core.campaign
core.contact
```

Modules extend them.

Example:

Marketing:

```
extend core.asset:
  marketing_metadata JSONB
```

Support:

```
extend core.contact:
  satisfaction_score
```

This eliminates duplication.

---

# 🔗 3. Replace “Shared Entity Store” with “Entity Graph”

Instead of tagging by EntityType,
create relationship graph:

```
entity_relations
----------------
from_entity_id
to_entity_id
relation_type
```

Example:

- campaign → asset
- asset → client
- support_ticket → product
- complaint → strategy_note

This enables:

- cross-module intelligence
- AI reasoning across entities
- dependency tracking

---

# 🧠 4. Centralize AI as an Intelligence Layer

Move AI out of modules entirely.

Create:

```
/core/ai
```

With:

- provider abstraction
- prompt registry
- brand injection middleware
- cost tracking
- memory store
- vector indexing

Every module uses:

```
ai.run('marketing.post.generate', context)
```

Not raw LLM calls.

---

# 🎨 5. Fix Content vs Marketing Responsibility

Correct structure:

```
content/
  ├── assetModelExtension.ts
  ├── contentService.ts
  ├── repurposer.ts
  └── localizationService.ts

marketing/
  ├── campaignService.ts
  ├── leadService.ts
  ├── planner.ts
  └── ui/
```

Content = Production engine  
Marketing = Strategy & orchestration  

No UI in content.

---

# 🚀 6. Add Missing Enterprise Capabilities

Your audit listed useful tools.
Now let’s professionalize them.

---

## ✅ Brand Voice Vault → Upgrade to Brand Intelligence Profile

Instead of simple tone settings:

```
brand_profiles
--------------
id
tone_profile JSONB
forbidden_words TEXT[]
value_props TEXT[]
positioning_statement
approved_phrases TEXT[]
legal_constraints TEXT[]
competitive_differentiators TEXT[]
```

AI automatically merges this.

Also version brand profiles.

---

## ✅ Content Repurposer → Upgrade to Asset Lineage System

Track:

```
parent_asset_id
derivative_asset_id
transformation_type
```

Now you can:

- Analyze performance of derivative trees
- Optimize formats by ROI

Enterprise feature.

---

## ✅ Competitor Spy → Upgrade to Competitive Intelligence Module

Store:

```
competitor_entities
competitor_assets
gap_analysis_reports
```

Allow AI to:

- Compare messaging clusters
- Suggest strategic angles

Not just ad copy analysis.

---

## ✅ Customer Persona Generator → Upgrade to ICP Engine

Instead of simple generator:

```
icp_profiles
-------------
pain_points
desired_outcomes
budget_range
decision_maker_type
buying_triggers
channels
```

Link ICP to:

- campaigns
- assets
- segments

---

# 🔄 7. Implement Real Cross-Module Workflows

Instead of:

> Business triggers marketing draft

Define:

```
workflow: business.plan.finalized
    step 1 → generate marketing strategy
    step 2 → notify marketing team
    step 3 → create campaign draft
```

Workflows are configuration-driven.

Not hardcoded.

---

# 🧩 8. Replace “ContextState” with Session Context Manager

Implement:

```
activeEntityContext
-------------------
entity_id
entity_type
user_id
```

Loaded on login.

All module queries auto-filter by context.

---

# 🔐 9. Enterprise Governance Additions

Missing completely:

### ✅ Audit Log System

```
audit_logs
----------
entity_id
action
before_state
after_state
user_id
timestamp
```

Mandatory for enterprise.

---

### ✅ Observability

Track:

- AI usage per module
- Workflow failure rates
- Event processing times
- Publish success rate

---

### ✅ Feature Flags

```
feature_flags
-------------
module
flag
enabled
```

Enable/disable modules without breaking system.

---

# 🧠 10. Upgrade RBAC to ABAC (Advanced)

Instead of simple roles:

Implement:

Attribute-based access control.

Example:

```
User can edit asset
IF asset.client_id == user.client_id
AND status != approved
```

More powerful than role-only.

---

# 🏗️ FINAL ENTERPRISE-GRADE TODO LIST

---

## 🧱 PHASE 1 — Kernel

- [ ] Implement Service Registry
- [ ] Implement Model Registry with extension support
- [ ] Implement Persistent Event Bus
- [ ] Build Workflow Engine
- [ ] Build Policy Engine
- [ ] Add Audit Log System

---

## 🏢 PHASE 2 — Domain Unification

- [ ] Create canonical core entities
- [ ] Implement Entity Graph relationships
- [ ] Migrate module tables to extensions
- [ ] Centralize Client/Project schema

---

## 🧠 PHASE 3 — Intelligence Layer

- [ ] Central AI provider abstraction
- [ ] Brand Intelligence Profile system
- [ ] ICP engine
- [ ] Competitive Intelligence module
- [ ] Asset lineage tracking
- [ ] Localization engine

---

## 🚀 PHASE 4 — Ecosystem Integration

- [ ] Cross-module workflow definitions
- [ ] Unified dashboard powered by entity graph
- [ ] Global context manager
- [ ] Observability dashboard
- [ ] Feature flags

---

# 🎯 What This Transforms Your System Into

From:

> AI marketing tool suite

To:

> Enterprise-grade Agency Operating System with:
- Extensible models
- Cross-domain intelligence
- Workflow automation
- Governance
- Auditability
- Scalability

---

# 🏆 Final Strategic Advice

Right now you’re designing modules.

Start designing:

- Kernel
- Entity graph
- Workflow engine
- Intelligence layer

That’s what makes it Odoo-like.

---

# 🏗️ Enterprise Agency OS — Complete Architecture & TODO List

---

## 🔍 Phase 0 — Audit Findings & Critical Fixes

### What the Audit Got Right
- ✅ Correctly identifies the Content vs Marketing responsibility blur
- ✅ Correctly flags hard-linked imports as an architectural debt
- ✅ Correctly identifies missing Brand Voice as a cross-cutting concern
- ✅ Correctly recommends a Service Registry pattern

### What the Audit Missed or Got Wrong

```
┌─────────────────────────────────────────────────────────────────────┐
│  GAP 1: No mention of a Tenant/Workspace model                      │
│  Even single-tenant ERPs need a "Workspace" concept                 │
│  to separate Clients from each other inside the same installation   │
│                                                                     │
│  GAP 2: Event Bus described but no delivery guarantee               │
│  A fire-and-forget eventBus fails silently in production            │
│  Enterprise needs: persistent events + at-least-once delivery       │
│                                                                     │
│  GAP 3: RBAC described at module level only                         │
│  Real agency OS needs RBAC at: module + entity + field level        │
│  Example: Copywriter can edit asset body but NOT change status      │
│                                                                     │
│  GAP 4: Brand Voice Vault scoped incorrectly                        │
│  Audit puts it in both marketing AND content                         │
│  It belongs in CORE — it is a workspace-level configuration         │
│                                                                     │
│  GAP 5: No API Gateway mentioned                                     │
│  Direct module-to-module calls don't scale                          │
│  All inter-module calls should go through a typed contract layer    │
│                                                                     │
│  GAP 6: Asset Versioning design is incomplete                       │
│  Draft→V1→V2→Approved is a state machine, not just a version field  │
│  Needs: branch support, diff tracking, rollback capability          │
│                                                                     │
│  GAP 7: No mention of Audit Logging                                 │
│  Enterprise OS must log WHO changed WHAT and WHEN                   │
│  Especially critical for client approval workflows                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Corrected Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENCY OS — LAYER MODEL                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 4 — PRESENTATION                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │marketing │ │ content  │ │  social  │ │ business │ │ support  │         │
│  │  /ui     │ │  /ui     │ │  /ui     │ │  /ui     │ │  /ui     │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │             │             │             │             │              │
│  LAYER 3 — APPLICATION (Module Service Layer)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │marketing │ │ content  │ │  social  │ │ business │ │ support  │         │
│  │ /services│ │ /services│ │ /services│ │ /services│ │ /services│         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │             │             │             │             │              │
│  LAYER 2 — CORE PLATFORM (The Kernel)                                       │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  core/                                                           │       │
│  │  ├── ai/          ← ALL LLM calls live here                      │       │
│  │  ├── assets/      ← Global Asset Manager (versioned)             │       │
│  │  ├── entities/    ← Client, Project, Workspace models            │       │
│  │  ├── events/      ← Persistent Event Bus                         │       │
│  │  ├── registry/    ← Service Registry (hot-swap)                  │       │
│  │  ├── rbac/        ← Global permission system                     │       │
│  │  ├── context/     ← Active entity state bridge                   │       │
│  │  ├── brand/       ← Brand Voice Vault                            │       │
│  │  └── audit/       ← Audit log for all mutations                  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  LAYER 1 — INFRASTRUCTURE                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  Supabase (Postgres + RLS + Vault + Realtime + Edge Functions)   │       │
│  │  n8n (workflow automation)                                        │       │
│  │  Supabase Storage (media assets)                                 │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Complete Folder Structure

```
src/
├── core/                                    ← THE KERNEL
│   ├── manifest.ts                          ← OS-level manifest
│   ├── index.ts                             ← Core public API
│   │
│   ├── registry/
│   │   ├── ServiceRegistry.ts              ← getService() / registerService()
│   │   └── ModuleRegistry.ts               ← registerModule() / getModule()
│   │
│   ├── ai/
│   │   ├── aiGateway.ts                    ← Single entry point for ALL AI calls
│   │   ├── providers/
│   │   │   ├── geminiProvider.ts
│   │   │   └── openrouterProvider.ts
│   │   ├── prompts/
│   │   │   ├── registry.ts                 ← All prompt templates registered here
│   │   │   └── builder.ts                  ← Injects BrandVoice + Context into prompts
│   │   └── types.ts
│   │
│   ├── assets/
│   │   ├── AssetManager.ts                 ← Global versioned asset store
│   │   ├── VersionController.ts            ← Branch, diff, rollback
│   │   └── types.ts
│   │
│   ├── entities/
│   │   ├── ClientService.ts                ← Clients (shared across all modules)
│   │   ├── ProjectService.ts               ← Projects
│   │   ├── WorkspaceService.ts             ← Workspace config
│   │   └── types.ts
│   │
│   ├── events/
│   │   ├── EventBus.ts                     ← Persistent event emitter
│   │   ├── EventStore.ts                   ← Supabase-backed event persistence
│   │   ├── EventRouter.ts                  ← Routes events to correct listeners
│   │   └── types.ts
│   │
│   ├── brand/
│   │   ├── BrandVoiceService.ts            ← CRUD for brand guidelines
│   │   ├── BrandVoiceInjector.ts           ← Merges brand voice into prompts
│   │   └── types.ts
│   │
│   ├── rbac/
│   │   ├── PermissionService.ts            ← can(user, action, resource)
│   │   ├── RoleService.ts                  ← Role definitions
│   │   ├── PolicyEngine.ts                 ← Policy evaluation
│   │   └── types.ts
│   │
│   ├── context/
│   │   ├── ContextBridge.ts                ← Global activeClient/activeProject
│   │   ├── ContextStore.ts                 ← Persisted context state
│   │   └── types.ts
│   │
│   └── audit/
│       ├── AuditLogger.ts                  ← Log all mutations with actor
│       └── types.ts
│
├── modules/
│   │
│   ├── marketing/                          ← APPLICATION LAYER
│   │   ├── manifest.ts
│   │   ├── index.ts
│   │   ├── services/
│   │   │   ├── campaignService.ts          ← Uses core/entities, core/assets
│   │   │   ├── leadService.ts
│   │   │   ├── analyticsService.ts
│   │   │   ├── segmentationService.ts
│   │   │   ├── competitorService.ts        ← NEW: Ad spy / gap analysis
│   │   │   └── personaService.ts           ← NEW: ICP generator
│   │   ├── events/
│   │   │   ├── emitters.ts
│   │   │   └── listeners.ts
│   │   ├── migrations/
│   │   └── components/
│   │       ├── campaigns/
│   │       ├── leads/
│   │       ├── analytics/
│   │       └── tools/
│   │           ├── CompetitorAnalyzer.tsx  ← NEW
│   │           ├── PersonaBuilder.tsx      ← NEW
│   │           └── LandingPageWriter.tsx   ← NEW
│   │
│   ├── content/                            ← PURE SERVICE LAYER (no UI)
│   │   ├── manifest.ts
│   │   ├── index.ts                        ← Only exports services, zero components
│   │   ├── services/
│   │   │   ├── generatorService.ts         ← All content generation
│   │   │   ├── repurposerService.ts        ← NEW: Long-form → multi-format
│   │   │   ├── translationService.ts       ← NEW: Localization engine
│   │   │   └── templateService.ts          ← NEW: Winning prompt templates
│   │   ├── events/
│   │   └── migrations/
│   │       ├── 001_content_templates.sql
│   │       └── 002_content_jobs.sql
│   │
│   ├── social/                             ← APPLICATION LAYER
│   │   ├── manifest.ts
│   │   ├── index.ts
│   │   ├── services/
│   │   │   ├── accountService.ts
│   │   │   ├── publisherService.ts
│   │   │   ├── approvalService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── rateLimitService.ts
│   │   ├── events/
│   │   ├── migrations/
│   │   └── components/
│   │
│   ├── business/                           ← APPLICATION LAYER
│   │   ├── manifest.ts
│   │   ├── index.ts
│   │   └── services/
│   │       ├── advisoryService.ts
│   │       └── strategyService.ts
│   │
│   └── support/                            ← APPLICATION LAYER
│       ├── manifest.ts
│       ├── index.ts
│       └── services/
│           ├── ticketService.ts
│           └── feedbackService.ts
│
└── supabase/
    ├── functions/
    │   ├── ai-gateway/                     ← Single Edge Function for ALL AI
    │   ├── event-processor/                ← Processes persistent event queue
    │   ├── token-refresh/
    │   └── analytics-fetch/
    └── migrations/
        ├── core/
        │   ├── 001_workspaces.sql
        │   ├── 002_clients.sql
        │   ├── 003_projects.sql
        │   ├── 004_assets_v2.sql           ← Versioned global asset store
        │   ├── 005_brand_voices.sql
        │   ├── 006_event_store.sql
        │   ├── 007_audit_log.sql
        │   └── 008_rbac.sql
        └── modules/
            ├── marketing/
            ├── content/
            ├── social/
            └── support/
```

---

## ✅ MASTER TODO LIST

---

## 🏗️ PHASE 1 — Core Kernel (Do This First — Everything Depends On It)

### 1.1 — Service Registry

- [ ] Create `core/registry/ServiceRegistry.ts`
  - [ ] Implement `registerService(name, instance)` function
  - [ ] Implement `getService<T>(name): T` function with type safety
  - [ ] Implement `hasService(name): boolean` check
  - [ ] Add service initialization order resolver (dependency-aware boot)
  - [ ] Throw descriptive error when service not found (not silent undefined)
- [ ] Create `core/registry/ModuleRegistry.ts`
  - [ ] Implement `registerModule(manifest)` at app boot
  - [ ] Implement `getModule(id)` to retrieve module manifest
  - [ ] Implement `isModuleInstalled(id): boolean`
  - [ ] Validate module dependencies on registration (fail fast if dep missing)
- [ ] Replace ALL direct cross-module imports with `getService()` calls
  - [ ] Marketing → Content: replace import with `getService('content')`
  - [ ] Social → Marketing: replace import with `getService('marketing')`
  - [ ] Any module → Core AI: replace import with `getService('ai')`
- [ ] Write unit tests for ServiceRegistry (register, get, missing, circular dep)

### 1.2 — Core Database Migrations

- [ ] `core/migrations/001_workspaces.sql`
  - [ ] Table `workspaces`: `id`, `name`, `slug`, `settings` (jsonb), `created_at`
  - [ ] This is the top-level container for all data in the OS
  - [ ] RLS: all tables will filter by `workspace_id`
- [ ] `core/migrations/002_clients.sql`
  - [ ] Table `clients`: `id`, `workspace_id`, `name`, `industry`, `website`, `logo_url`, `metadata` (jsonb), `created_at`, `updated_at`
  - [ ] Remove client data from any module-specific table (marketing, etc.)
  - [ ] RLS + indexes on `workspace_id`
- [ ] `core/migrations/003_projects.sql`
  - [ ] Table `projects`: `id`, `workspace_id`, `client_id` (FK), `name`, `description`, `status`, `start_date`, `end_date`, `metadata` (jsonb)
  - [ ] RLS + indexes
- [ ] `core/migrations/004_assets_v2.sql` (replaces `marketing/003_assets.sql`)
  - [ ] Table `assets`: `id`, `workspace_id`, `client_id` (FK nullable), `project_id` (FK nullable), `entity_type` (enum: `campaign/lead/brief/plan/post/script/persona/template`), `entity_id` (uuid), `type` (existing enum), `platform`, `title`, `status` (full state machine enum), `created_by`, `created_at`, `updated_at`
  - [ ] Table `asset_versions`: `id`, `asset_id` (FK), `version_number` (int), `content` (text), `diff_from_previous` (text), `created_by`, `created_at`, `change_summary` (text)
  - [ ] Table `asset_approvals`: `id`, `asset_id`, `version_id`, `stage` (enum: `internal_review/client_review/approved/rejected`), `actor_id`, `comment`, `created_at`
  - [ ] RLS on all three tables
  - [ ] Migrate existing `marketing_assets` data into new `assets` table
- [ ] `core/migrations/005_brand_voices.sql`
  - [ ] Table `brand_voices`: `id`, `workspace_id`, `client_id` (FK nullable — null = workspace default), `name`, `tone_descriptors` (text[]), `forbidden_words` (text[]), `value_propositions` (text[]), `example_copy` (text), `target_audience` (text), `is_default` (boolean), `created_at`, `updated_at`
  - [ ] RLS + index on `client_id`
- [ ] `core/migrations/006_event_store.sql`
  - [ ] Table `events`: `id`, `workspace_id`, `event_name`, `payload` (jsonb), `source_module`, `status` (enum: `pending/delivered/failed/dead`), `retry_count` (int), `created_at`, `delivered_at`, `error` (text)
  - [ ] Index on `status`, `event_name`, `created_at`
  - [ ] This makes the event bus PERSISTENT — no lost events on crash
- [ ] `core/migrations/007_audit_log.sql`
  - [ ] Table `audit_log`: `id`, `workspace_id`, `actor_id`, `action` (string), `entity_type`, `entity_id`, `before` (jsonb), `after` (jsonb), `ip_address`, `user_agent`, `created_at`
  - [ ] Index on `entity_type`, `entity_id`, `actor_id`
  - [ ] This table is APPEND ONLY — no UPDATE or DELETE RLS policies
- [ ] `core/migrations/008_rbac.sql`
  - [ ] Table `roles`: `id`, `workspace_id`, `name`, `description`, `is_system` (boolean)
  - [ ] Table `permissions`: `id`, `role_id`, `module`, `resource`, `action` (enum: `create/read/update/delete/approve/publish`), `conditions` (jsonb — for field-level rules)
  - [ ] Table `user_roles`: `id`, `user_id`, `role_id`, `client_id` (FK nullable — role scoped to client), `granted_by`, `created_at`
  - [ ] Seed system roles: `super_admin`, `admin`, `manager`, `copywriter`, `reviewer`, `client_viewer`

### 1.3 — Core AI Gateway

- [ ] Create `core/ai/aiGateway.ts`
  - [ ] Single function: `generateContent(request: AIRequest): Promise<AIResponse>`
  - [ ] `AIRequest` type: `{ promptKey, inputs, brandVoiceId?, clientId?, temperature? }`
  - [ ] Automatically calls `BrandVoiceInjector` before sending prompt
  - [ ] Automatically calls `ContextBridge` to enrich inputs with active context
  - [ ] Routes to correct provider (Gemini / OpenRouter) based on `promptKey`
  - [ ] All calls go through Supabase Edge Function `/functions/v1/ai-gateway`
  - [ ] Logs every AI call to audit log (promptKey, token usage, latency)
  - [ ] Never called directly from any module — always via `getService('ai').generate()`
- [ ] Create `core/ai/providers/geminiProvider.ts`
  - [ ] Implement `generate(prompt, temperature): Promise<string>`
  - [ ] Handle rate limit (15 RPM free tier) with queue
  - [ ] Retry on 429 with exponential backoff
- [ ] Create `core/ai/providers/openrouterProvider.ts`
  - [ ] Implement `generate(model, prompt, temperature): Promise<string>`
  - [ ] Model selection based on task complexity
- [ ] Create `core/ai/prompts/registry.ts`
  - [ ] Move ALL prompt templates from `marketing/constants/prompts.ts` here
  - [ ] Add new prompts:
    - [ ] `PROMPTS.COMPETITOR.GAP_ANALYSIS(inputs)`
    - [ ] `PROMPTS.COMPETITOR.COUNTER_ANGLE(inputs)`
    - [ ] `PROMPTS.PERSONA.ICP_BUILDER(inputs)`
    - [ ] `PROMPTS.LANDING_PAGE.AIDA(inputs)`
    - [ ] `PROMPTS.LANDING_PAGE.PAS(inputs)`
    - [ ] `PROMPTS.REPURPOSE.LONG_TO_TWEETS(inputs)`
    - [ ] `PROMPTS.REPURPOSE.LONG_TO_LINKEDIN(inputs)`
    - [ ] `PROMPTS.REPURPOSE.LONG_TO_INSTAGRAM(inputs)`
    - [ ] `PROMPTS.REPURPOSE.LONG_TO_AD(inputs)`
    - [ ] `PROMPTS.TRANSLATE(inputs)` — with tone preservation instruction
    - [ ] `PROMPTS.BRAND_VOICE.EXTRACT(inputs)` — derive brand voice from example copy
- [ ] Create `core/ai/prompts/builder.ts`
  - [ ] Function `buildPrompt(promptKey, inputs, brandVoice?, context?): string`
  - [ ] Injects brand voice section into every prompt automatically:
    ```
    BRAND VOICE CONSTRAINTS:
    - Tone: {tone_descriptors}
    - Never use: {forbidden_words}
    - Always emphasize: {value_propositions}
    - Target audience: {target_audience}
    ```
  - [ ] Injects active context (client name, product, industry) automatically
  - [ ] Returns final assembled prompt string

### 1.4 — Brand Voice Vault

- [ ] Create `core/brand/BrandVoiceService.ts`
  - [ ] `createBrandVoice(data)` — validate + insert into `brand_voices`
  - [ ] `getBrandVoice(id)` — fetch single
  - [ ] `getBrandVoiceForClient(clientId)` — fetch client-specific or workspace default
  - [ ] `listBrandVoices()` — all voices for workspace
  - [ ] `updateBrandVoice(id, changes)` — partial update
  - [ ] `deleteBrandVoice(id)` — soft delete
  - [ ] `extractBrandVoiceFromCopy(exampleCopy)` — AI-powered: analyze sample copy and generate brand voice config
  - [ ] `setDefault(id)` — set as workspace default
- [ ] Create `core/brand/BrandVoiceInjector.ts`
  - [ ] `inject(promptString, brandVoiceId): Promise<string>` — fetches voice and merges
  - [ ] `injectForClient(promptString, clientId): Promise<string>` — auto-resolves correct voice
  - [ ] Cache brand voices in memory (5 min TTL) — avoid DB call on every prompt

### 1.5 — Persistent Event Bus

- [ ] Create `core/events/EventBus.ts`
  - [ ] `emit(eventName, payload, sourceModule)` — writes to `events` table first, THEN notifies listeners
  - [ ] `on(eventName, handler)` — register listener
  - [ ] `off(eventName, handler)` — unregister listener
  - [ ] Guarantee: event is persisted before handler is called
- [ ] Create `core/events/EventStore.ts`
  - [ ] `persistEvent(event)` — insert into `events` table
  - [ ] `markDelivered(eventId)` — update status
  - [ ] `markFailed(eventId, error)` — update status + increment retry
  - [ ] `getPendingEvents()` — fetch undelivered events (for recovery on restart)
  - [ ] `getDeadEvents()` — fetch failed events for admin review
- [ ] Create `core/events/EventRouter.ts`
  - [ ] On app startup: replay all `pending` events from `events` table
  - [ ] Implement dead letter queue: after 3 failed retries → status = `dead` + alert
  - [ ] Subscribe to Supabase Realtime on `events` table for cross-tab delivery
- [ ] Create `supabase/functions/event-processor/index.ts`
  - [ ] pg_cron runs every 30 seconds
  - [ ] Fetches all `pending` events older than 10 seconds (missed by in-memory bus)
  - [ ] Re-delivers them to correct module listeners via HTTP
  - [ ] Guarantees at-least-once delivery

### 1.6 — Context Bridge

- [ ] Create `core/context/ContextBridge.ts`
  - [ ] `setActiveClient(clientId)` — updates global context
  - [ ] `setActiveProject(projectId)` — updates global context
  - [ ] `getActiveClient(): Client | null`
  - [ ] `getActiveProject(): Project | null`
  - [ ] `getContext(): GlobalContext` — returns full context object
  - [ ] `clearContext()` — on logout
  - [ ] Persists context to localStorage (survives page refresh)
  - [ ] Emits `context.client.changed` and `context.project.changed` events
- [ ] Create `core/context/ContextStore.ts`
  - [ ] Zustand store (or React Context) for reactive context updates
  - [ ] All module components subscribe to context changes
  - [ ] When `activeClient` changes: all open forms auto-populate client fields
- [ ] Wire context into AI Gateway
  - [ ] `aiGateway.generateContent()` reads `ContextBridge.getContext()` automatically
  - [ ] Enriches prompt with: client name, industry, product, target market
  - [ ] No module needs to manually pass client context to AI calls

### 1.7 — Global Asset Manager

- [ ] Create `core/assets/AssetManager.ts`
  - [ ] `createAsset(data)` — creates asset + first version simultaneously
  - [ ] `getAsset(id)` — returns asset + latest version content
  - [ ] `getAssetWithHistory(id)` — returns asset + all versions
  - [ ] `listAssets(filters)` — filterable by `entity_type`, `entity_id`, `client_id`, `status`
  - [ ] `saveNewVersion(assetId, content, changeSummary)` — creates new version record
  - [ ] `publishAsset(assetId)` — moves through approval state machine
  - [ ] `getAssetsByEntity(entityType, entityId)` — all assets tagged to a Campaign, Lead, etc.
- [ ] Create `core/assets/VersionController.ts`
  - [ ] `getVersionHistory(assetId)` — all versions ordered by number
  - [ ] `rollbackToVersion(assetId, versionNumber)` — creates new version cloned from old
  - [ ] `diffVersions(versionId1, versionId2)` — text diff between two versions
  - [ ] `getCurrentVersion(assetId)` — latest version content
- [ ] Implement Asset State Machine
  - [ ] States: `draft → internal_review → client_review → approved → published → archived`
  - [ ] Transitions are permission-gated (only `reviewer` can move to `internal_review`)
  - [ ] Each transition creates an `asset_approvals` record
  - [ ] Each transition emits an event via EventBus
  - [ ] Rejection at any stage: goes back to `draft` with rejection comment

### 1.8 — RBAC Engine

- [ ] Create `core/rbac/PermissionService.ts`
  - [ ] `can(userId, action, resource, entityId?): Promise<boolean>`
  - [ ] `canOrThrow(userId, action, resource, entityId?)` — throws if not permitted
  - [ ] `getUserPermissions(userId): Promise<Permission[]>`
  - [ ] `getUserRole(userId, clientId?): Promise<Role>`
  - [ ] Cache permissions per user (2 min TTL)
- [ ] Create `core/rbac/PolicyEngine.ts`
  - [ ] Evaluate `conditions` jsonb field for field-level rules
  - [ ] Example condition: `{ "field": "status", "operator": "not_in", "values": ["approved", "published"] }`
  - [ ] Means: copywriter can edit asset only when NOT already approved
- [ ] Seed default permission matrix:

```
┌─────────────────┬────────────┬──────────┬─────────┬────────────┬───────────────┐
│ Action          │ SuperAdmin │ Manager  │Copywriter│ Reviewer  │ ClientViewer  │
├─────────────────┼────────────┼──────────┼─────────┼────────────┼───────────────┤
│ Create asset    │ ✅         │ ✅       │ ✅      │ ✅         │ ❌            │
│ Edit draft      │ ✅         │ ✅       │ ✅      │ ✅         │ ❌            │
│ Submit review   │ ✅         │ ✅       │ ✅      │ ❌         │ ❌            │
│ Internal approve│ ✅         │ ✅       │ ❌      │ ✅         │ ❌            │
│ Client approve  │ ✅         │ ✅       │ ❌      │ ❌         │ ✅            │
│ Publish         │ ✅         │ ✅       │ ❌      │ ❌         │ ❌            │
│ View analytics  │ ✅         │ ✅       │ ✅      │ ✅         │ ✅ (own only) │
│ Manage clients  │ ✅         │ ✅       │ ❌      │ ❌         │ ❌            │
│ Manage brand    │ ✅         │ ✅       │ ❌      │ ❌         │ ❌            │
│ Configure RBAC  │ ✅         │ ❌       │ ❌      │ ❌         │ ❌            │
└─────────────────┴────────────┴──────────┴─────────┴────────────┴───────────────┘
```

### 1.9 — Audit Logger

- [ ] Create `core/audit/AuditLogger.ts`
  - [ ] `log(action, entityType, entityId, before, after)` — inserts into `audit_log`
  - [ ] Auto-captures `actor_id` from auth context
  - [ ] Auto-captures `ip_address` and `user_agent` from request headers
  - [ ] Never blocks the main operation (fire and forget with error catch)
- [ ] Wire audit logger into all service write operations:
  - [ ] Every `createAsset`, `updateAsset`, `publishAsset`
  - [ ] Every approval state transition
  - [ ] Every brand voice change
  - [ ] Every RBAC role grant/revoke
  - [ ] Every client create/update/delete

---

## 📦 PHASE 2 — Content Studio Hardening

### 2.1 — Content Module Restructure (Remove All UI)

- [ ] Delete all component files from `content/` module
- [ ] Move `PostGenerator.tsx` → `marketing/components/content/`
- [ ] Move `AdCopyCreator.tsx` → `marketing/components/content/`
- [ ] Move `ContentLibrary.tsx` → `marketing/components/content/`
- [ ] Update all imports after move
- [ ] Confirm `content/index.ts` exports ZERO React components
- [ ] Confirm `content/index.ts` exports ONLY service functions and types

### 2.2 — Content Repurposer

- [ ] Create `content/services/repurposerService.ts`
  - [ ] Define `RepurposeJob` type: `{ sourceAssetId, sourceContent, targetFormats, clientId }`
  - [ ] Define `RepurposeResult` type: `{ format, platform, content, assetId }`
  - [ ] Implement `repurposeAsset(job: RepurposeJob): Promise<RepurposeResult[]>`
    - [ ] Validate source asset exists and has content
    - [ ] For each target format: call `core/ai/aiGateway` with correct prompt
    - [ ] Auto-save each derivative as a new asset linked to source via `entity_id`
    - [ ] Return all created derivative assets
  - [ ] Implement `repurposeLongFormToSocial(content, platforms[])`:
    - [ ] `platforms` can include: `twitter_thread`, `linkedin_post`, `instagram_caption`, `facebook_post`, `ad_headline`
    - [ ] Each platform gets its own AI call with platform-specific prompt
    - [ ] All saved to `assets` table with `entity_type: 'repurpose_derivative'`
  - [ ] Implement `repurposeBlogToVideo(blogContent)`:
    - [ ] Extract key points
    - [ ] Generate video script
    - [ ] Generate social captions per platform
  - [ ] Add `repurpose_jobs` table: track status of bulk repurpose operations

### 2.3 — Translation & Localization Engine

- [ ] Create `content/services/translationService.ts`
  - [ ] Implement `translateAsset(assetId, targetLanguages[])`:
    - [ ] Fetch asset content
    - [ ] For each language: call AI Gateway with `PROMPTS.TRANSLATE`
    - [ ] Prompt must include: maintain tone, preserve brand voice, adapt idioms
    - [ ] Save translated version as new asset with `language` field set
  - [ ] Implement `translateContent(content, fromLang, toLang, brandVoiceId?)`
  - [ ] Implement `getSupportedLanguages()` — return list of supported locales
  - [ ] Add `language` column to `assets` table (ISO 639-1 code)
  - [ ] Add `parent_asset_id` column to `assets` table (link translation to original)

### 2.4 — Template Manager

- [ ] Create `content/services/templateService.ts`
  - [ ] Define `ContentTemplate` type: `{ id, name, promptKey, defaultInputs, category, is_shared }`
  - [ ] `saveAsTemplate(assetId, name, category)` — save a winning prompt structure
  - [ ] `createFromTemplate(templateId, overrideInputs)` — generate new asset from template
  - [ ] `listTemplates(category?)` — filterable list
  - [ ] `shareTemplate(id)` — mark as shared (visible to all workspace users)
  - [ ] `cloneTemplate(id)` — create personal copy of shared template
  - [ ] Create `content_templates` migration table

### 2.5 — Asset Versioning (Full Implementation)

- [ ] Update `AssetManager.createAsset()` to always create version 1 simultaneously
- [ ] Update `AssetManager.updateAsset()` to NEVER overwrite — always create new version
- [ ] Implement version diff: show what changed between V1 and V2 (text diff)
- [ ] Add `VersionHistoryPanel.tsx` component in `marketing/components/content/`
  - [ ] Shows timeline of all versions
  - [ ] Shows who made each version and when
  - [ ] Shows change summary per version
  - [ ] "Restore this version" button → calls `VersionController.rollbackToVersion()`
- [ ] Add `AssetCompareView.tsx` — side-by-side diff of any two versions

---

## 🚀 PHASE 3 — New Agency Tools

### 3.1 — Competitor Ad Spy & Analyzer

- [ ] Create `marketing/services/competitorService.ts`
  - [ ] `analyzeCompetitorAd(adCopy, competitorName, ourProduct)`:
    - [ ] AI call: extract angles, hooks, CTAs, emotional triggers from competitor ad
    - [ ] AI call: identify gaps and weaknesses
    - [ ] AI call: generate counter-angle strategy
    - [ ] Return: `{ analysis, gaps, counterAngles, suggestedHooks }`
  - [ ] `generateCounterAd(competitorAnalysis, brandVoiceId)`:
    - [ ] Use competitor gap analysis + brand voice to write competing ad
  - [ ] `trackCompetitor(name, platform, adLibraryUrl?)`:
    - [ ] Store competitor records in `competitors` table
  - [ ] Create `competitors` migration table
- [ ] Create `marketing/components/tools/CompetitorAnalyzer.tsx`
  - [ ] Input: competitor ad copy (paste or URL)
  - [ ] Input: our product / USP
  - [ ] Output: analysis cards (angles, gaps, weaknesses)
  - [ ] Output: counter-angle suggestions
  - [ ] "Generate Counter-Ad" → saves to Content Library

### 3.2 — Customer Persona (ICP) Generator

- [ ] Create `marketing/services/personaService.ts`
  - [ ] Define `Persona` type: `{ id, name, age_range, job_title, pain_points[], goals[], objections[], preferred_channels[], language_style, buying_triggers[] }`
  - [ ] `generatePersona(inputs)`:
    - [ ] Inputs: industry, product, existing customer data (optional)
    - [ ] AI call with `PROMPTS.PERSONA.ICP_BUILDER`
    - [ ] Returns structured Persona object
  - [ ] `savePersona(persona)` → insert into `personas` table
  - [ ] `listPersonas(clientId?)` → list all ICPs for client or workspace
  - [ ] `linkPersonaToCampaign(personaId, campaignId)`
  - [ ] `injectPersonaIntoPrompt(personaId, promptString)`:
    - [ ] Appends persona context to any prompt
    - [ ] Similar to BrandVoiceInjector but for audience targeting
  - [ ] Create `personas` migration table
- [ ] Create `marketing/components/tools/PersonaBuilder.tsx`
  - [ ] Multi-step form: industry → product → existing data
  - [ ] "Generate Persona" button → displays structured ICP card
  - [ ] Save to Personas library
  - [ ] "Use in Campaign" → links persona to active campaign
  - [ ] "Generate Ad for this Persona" → pre-fills AdCopyCreator

### 3.3 — Landing Page Copywriter

- [ ] Create `marketing/services/landingPageService.ts`
  - [ ] `generateAIDAPage(inputs)`:
    - [ ] Sections: Attention (headline), Interest, Desire, Action
    - [ ] Each section is a separate AI call for quality
    - [ ] Returns full page structure with copy for each section
  - [ ] `generatePASPage(inputs)`:
    - [ ] Sections: Problem, Agitation, Solution
  - [ ] `generateHeroSection(inputs)` — headline + subheadline + CTA only
  - [ ] `generateFAQSection(product, objections[])` — from persona objections
  - [ ] `generateTestimonialFramework(product)` — template for collecting testimonials
  - [ ] `saveLandingPage(pageContent)` → saves as structured asset
- [ ] Create `marketing/components/tools/LandingPageWriter.tsx`
  - [ ] Framework selector: AIDA vs PAS vs Hero Only
  - [ ] Section-by-section preview (not just a text blob)
  - [ ] Per-section regenerate button
  - [ ] Export as: plain text / HTML / copy-to-clipboard per section
  - [ ] Save full page as asset

### 3.4 — Client Approval Workflow (Full Implementation)

- [ ] Extend `core/assets/AssetManager.ts` with approval workflow:
  - [ ] `submitForInternalReview(assetId, submitterId)`
  - [ ] `approveInternally(assetId, reviewerId, comment?)`
  - [ ] `submitForClientReview(assetId, managerId)`
  - [ ] `approveAsClient(assetId, clientUserId, comment?)`
  - [ ] `rejectAsClient(assetId, clientUserId, reason)` → back to draft
- [ ] Create `ClientPortal` mini-module:
  - [ ] Public-facing review page (no login required, token-based access)
  - [ ] URL format: `/review/{asset_id}?token={review_token}`
  - [ ] Shows asset content (text + media)
  - [ ] Approve / Request Changes buttons
  - [ ] Comment field for change requests
  - [ ] Token expires after 7 days
  - [ ] Token stored in `asset_approvals` table
- [ ] Create `review_tokens` migration table:
  - [ ] `id`, `asset_id`, `token` (uuid), `expires_at`, `used_at`, `client_email`
- [ ] Implement approval notification system:
  - [ ] On `submitForClientReview`: send email with review link
  - [ ] On `approveAsClient`: notify manager via Telegram or email
  - [ ] On `rejectAsClient`: notify copywriter with reason

---

## 🔗 PHASE 4 — Cross-Module Integration

### 4.1 — Cross-Module Event Wiring

- [ ] Register all cross-module event listeners at app boot in `core/events/EventRouter.ts`:
  - [ ] `business.plan.finalized` → auto-create Marketing Strategy draft asset
  - [ ] `support.complaint.received` → feed into Product Improvement suggestions in Strategy module
  - [ ] `marketing.lead.qualified` → auto-create CRM contact + deal
  - [ ] `social.post.published` → update campaign analytics
  - [ ] `asset.approved` → trigger social publishing workflow
  - [ ] `client.created` → auto-create default Brand Voice for client
  - [ ] `project.completed` → trigger case study generation (LinkedIn post draft)
  - [ ] `context.client.changed` → reload all module data for new client

### 4.2 — Context Bridge UI Integration

- [ ] Add `ClientSwitcher` component to global nav bar
  - [ ] Dropdown showing all clients in workspace
  - [ ] On select: calls `ContextBridge.setActiveClient()`
  - [ ] All open forms react immediately (auto-populate client name, industry, etc.)
- [ ] Add `ProjectSwitcher` component to global nav bar
  - [ ] Filtered by active client
  - [ ] On select: calls `ContextBridge.setActiveProject()`
- [ ] Wire all module forms to read from context:
  - [ ] `PostGenerator`: pre-fills product name and audience from active client
  - [ ] `CampaignPlanner`: pre-fills client and links to active project
  - [ ] `PersonaBuilder`: pre-fills industry from active client
  - [ ] `LandingPageWriter`: pre-fills product from active client

### 4.3 — Bridge Routes (One-Click Cross-Module Flows)

- [ ] Implement `business/analyze → marketing/plan` bridge:
  - [ ] "Create Marketing Plan" button on Business Plan completion screen
  - [ ] Pre-fills CampaignPlanner with business plan context
  - [ ] Emits `business.plan.finalized` event to trigger auto-draft
- [ ] Implement `persona → ad_copy` bridge:
  - [ ] "Generate Ad for this Persona" button on PersonaBuilder output
  - [ ] Navigates to AdCopyCreator pre-filled with persona data
- [ ] Implement `support.complaint → strategy` bridge:
  - [ ] Complaint tickets with high frequency → surfaced in Strategy module
  - [ ] "Analyze Product Gap" button generates improvement suggestions
- [ ] Implement `content → social` bridge:
  - [ ] "Publish This Asset" button on approved assets
  - [ ] Opens SocialMediaManager with content pre-filled
  - [ ] Creates publish_job and triggers n8n workflow

### 4.4 — Unified Dashboard

- [ ] Create `core/components/Dashboard.tsx`
  - [ ] Context-aware: changes all widgets when `activeClient` changes
  - [ ] Widget: Recent Assets (filterable by status)
  - [ ] Widget: Active Campaigns summary
  - [ ] Widget: Pending Approvals (with quick approve/reject)
  - [ ] Widget: Published Posts analytics (7-day summary)
  - [ ] Widget: Open Leads / Pipeline stage
  - [ ] Widget: Pending Events (failed events in EventStore)
  - [ ] Widget: Brand Voice quick-view for active client
  - [ ] Widgets are module-aware: only show if module is installed
  - [ ] Each widget links to the relevant module view

---

## 🛡️ PHASE 5 — Enterprise Quality & Security

### 5.1 — Security Hardening

- [ ] Audit ALL Supabase tables — confirm RLS enabled on every table
- [ ] Add `workspace_id` filter to ALL RLS policies
- [ ] Confirm Supabase Vault used for: OAuth tokens, API keys, review tokens
- [ ] Add API rate limiting on Edge Functions (per workspace, per user)
- [ ] Implement CSRF protection on all webhook endpoints
- [ ] Add Content Security Policy headers
- [ ] Audit all AI prompts for prompt injection risks (user inputs sanitized before insertion)

### 5.2 — Performance

- [ ] Add pagination (limit 20) to every list query across all modules
- [ ] Implement React Query (or SWR) for all data fetching with cache invalidation
- [ ] Add database indexes audit — confirm all FK columns and filter columns are indexed
- [ ] Implement `AssetManager` response caching (5 min TTL, invalidate on write)
- [ ] Add `BrandVoiceInjector` in-memory cache (5 min TTL per client)
- [ ] Implement lazy loading for all module components (code splitting)
- [ ] Add Supabase connection pooling configuration

### 5.3 — Observability

- [ ] Add structured logging to all Edge Functions (JSON format)
- [ ] Add error tracking (Sentry or equivalent) for Edge Functions
- [ ] Create `Admin Panel` component showing:
  - [ ] Event Store health (pending, delivered, dead event counts)
  - [ ] AI Gateway usage (calls per day, token usage, cost estimate)
  - [ ] Failed publish jobs
  - [ ] Audit log viewer (filterable by user, entity, date)
  - [ ] Service Registry status (which modules are loaded)

### 5.4 — UX Standards (Apply to ALL Components)

- [ ] Every list view: loading skeleton, empty state with CTA, pagination
- [ ] Every form: Zod validation, field-level errors, disabled submit while loading
- [ ] Every async operation: optimistic UI update where possible
- [ ] Every destructive action: confirmation dialog with typed confirmation for critical actions
- [ ] Every approval action: comment field (optional on approve, required on reject)
- [ ] Global: keyboard navigation support (K-bar for power users)
- [ ] Global: Supabase Realtime subscription on all critical tables for live updates

---

## 📐 Execution Order (Critical Path)

```
PHASE 1 — Core Kernel
  1.2 Database Migrations (run first — everything needs the schema)
      ↓
  1.3 AI Gateway (needed by all modules)
      ↓
  1.4 Brand Voice Vault (needed by AI Gateway)
      ↓
  1.5 Event Bus (needed by all modules)
      ↓
  1.6 Context Bridge (needed by UI modules)
      ↓
  1.1 Service Registry (needed to wire modules together)
      ↓
  1.7 Global Asset Manager (replaces module-specific asset services)
      ↓
  1.8 RBAC Engine (gates all operations)
      ↓
  1.9 Audit Logger (wire into all services)

PHASE 2 — Content Studio
  2.1 Remove UI from content module
      ↓
  2.2 Repurposer + 2.3 Translation + 2.4 Templates + 2.5 Versioning
  (can be done in parallel after 2.1)

PHASE 3 — New Tools
  3.1 Competitor Analyzer
  3.2 Persona Builder      ← do this before 3.1 (personas feed competitor counter-ads)
  3.3 Landing Page Writer
  3.4 Client Approval Workflow
  (can be done in parallel)

PHASE 4 — Integration
  4.1 Event Wiring         ← needs Phase 1 event bus complete
  4.2 Context Bridge UI    ← needs Phase 1 context bridge complete
  4.3 Bridge Routes        ← needs Phase 3 tools complete
  4.4 Unified Dashboard    ← needs everything else complete

PHASE 5 — Quality
  (run in parallel with Phase 4 — never leave to the end)
```