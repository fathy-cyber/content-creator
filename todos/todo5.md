Based on the architectural redesign in `docs/audit-2.md`, the project must transition from a "collection of AI tools" to a "Modular Agency Operating System." 

The following is the consolidated, checkable TODO list to upgrade the project to an enterprise-grade OS.

### 🏗️ PHASE 1: The Core Kernel (Runtime & Governance)
*This phase is the absolute priority. All subsequent features depend on this foundation.*

**1.1 Service & Module Registry**
- [ ] Create `core/registry/ServiceRegistry.ts` (Implement `registerService`, `getService<T>`, `hasService`).
- [ ] Create `core/registry/ModuleRegistry.ts` (Implement `registerModule`, `getModule`, dependency validation).
- [ ] **Refactor**: Replace all direct cross-module imports (e.g., `marketing` $\rightarrow$ `content`) with `getService()` calls.

**1.2 Foundation Database Migrations**
- [ ] `001_workspaces.sql`: Implement the top-level tenant container.
- [ ] `002_clients.sql`: Canonical client table (remove client data from module-specific tables).
- [ ] `003_projects.sql`: Canonical project table linked to clients.
- [ ] `004_assets_v2.sql`: Global versioned asset store with state machine (`draft` $\rightarrow$ `published`).
- [ ] `005_brand_voices.sql`: Workspace/Client-level brand guidelines.
- [ ] `006_event_store.sql`: Persistent event table for guaranteed delivery.
- [ ] `007_audit_log.sql`: Append-only mutation logs (Who, What, When).
- [ ] `008_rbac.sql`: Role-based access control with field-level permissions.

**1.3 Intelligence Layer (Core AI)**
- [ ] Create `core/ai/aiGateway.ts`: Single entry point for all AI calls.
- [ ] Implement `BrandVoiceInjector`: Automatically merge brand constraints into prompts.
- [ ] Implement `ContextBridge`: Automatically enrich prompts with active client/project data.
- [ ] Centralize all prompt templates in `core/ai/prompts/registry.ts`.

**1.4 System Orchestration**
- [ ] **Persistent Event Bus**: Implement `EventBus.ts` that writes to DB before notifying listeners.
- [ ] **Context Manager**: Implement `ContextBridge.ts` to track `activeClient` across the entire session.
- [ ] **Workflow Engine**: Build a generic engine for state transitions (e.g., Client Approval $\rightarrow$ Published).

---

### 📦 PHASE 2: Content Studio Hardening (The Production Engine)
*Transforming `content` from a UI module to a pure service layer.*

- [ ] **UI Decoupling**: Move all components (e.g., `PostGenerator`) out of `content/` and into respective application modules (e.g., `marketing/ui/`).
- [ ] **Repurposing Engine**: Build `repurposerService.ts` (Long-form $\rightarrow$ Multi-channel derivatives).
- [ ] **Localization Engine**: Build `translationService.ts` with tone-preservation.
- [ ] **Template Manager**: Implement `templateService.ts` to save and share "Winning Prompts."
- [ ] **Version Control**: Implement full Asset Diffing and Rollback capabilities in `AssetManager`.

---

### 🚀 PHASE 3: Application Layer (Agency Tools)
*Building high-value tools on top of the new Kernel.*

- [ ] **Competitive Intelligence**: Build `CompetitorAnalyzer` (Gap analysis $\rightarrow$ Counter-angle strategy).
- [ ] **ICP Engine**: Build `PersonaBuilder` (Structured persona $\rightarrow$ Prompt injection).
- [ ] **Landing Page Studio**: Build `LandingPageWriter` using AIDA/PAS frameworks.
- [ ] **Client Portal**: Create a token-based review page for clients to approve/reject assets.

---

### 🔗 PHASE 4: Ecosystem Integration (The "OS" Experience)
*Connecting the silos into a seamless workflow.*

- [ ] **Cross-Module Event Wiring**:
    - [ ] `business.plan.finalized` $\rightarrow$ trigger `marketing.strategy.draft`.
    - [ ] `support.complaint.received` $\rightarrow$ trigger `strategy.product_gap_analysis`.
    - [ ] `asset.approved` $\rightarrow$ trigger `social.publish_job`.
- [ ] **Global Context UI**: Add `ClientSwitcher` and `ProjectSwitcher` to the global navigation.
- [ ] **Unified Dashboard**: Context-aware home screen aggregating widgets from all active modules.
- [ ] **Bridge Routes**: Implement "One-Click" transitions (e.g., Persona $\rightarrow$ Ad Copy).

---

### 🛡️ PHASE 5: Enterprise Governance & Quality
- [ ] **Security**: Audit all RLS policies to ensure `workspace_id` filtering on every table.
- [ ] **Performance**: Implement React Query for caching and add DB indexes to all FKs.
- [ ] **Observability**: Build an Admin Panel to track AI costs, event failures, and audit logs.
- [ ] **UX Standards**: Standardize all forms with Zod validation and all lists with skeletons/pagination.