### 1. Marketing Module Audit: Missing Tools
The current module covers content generation and basic planning. To move from a "toolset" to an "Agency OS," the following gaps should be filled:

**For Brands/Startups (Growth-Centric):**
*   **Competitor Ad Spy/Analyzer**: Tool to input competitor ad copy and get a "gap analysis" or "counter-angle" strategy.
*   **Landing Page Copy-Writer**: Focused on AIDA/PAS frameworks specifically for conversion pages, not just short-form ads.
*   **Customer Persona Generator**: A tool to build detailed ICPs (Ideal Customer Profiles) that then feed into all other generators (Post, Ad, Script).

**For Agencies (Operational-Centric):**
*   **Brand Voice Vault**: A central repository where a brand's tone, forbidden words, and value props are stored and automatically injected into all AI prompts.
*   **Multi-Channel Content repurposer**: Tool to turn one "Long-form Blog/Video" into 5 Tweets, 2 LinkedIn posts, and 1 Instagram Reel script.
*   **Approval Workflow**: A "Client Review" state for assets (draft $\rightarrow$ internal review $\rightarrow$ client approval $\rightarrow$ scheduled).

---

### 2. OS Architecture & Inter-module Communication
The current architecture follows a **Siloed Module Pattern** (each module has its own routes and services). To achieve an **Odoo-like Integrated OS**, the communication must evolve:

**Current State:**
*   Modules are independent.
*   Data (like `campaign_id`) is passed as a simple ID, but there is no shared "Entity Graph."

**Recommended "OS" Architecture:**
*   **Shared Entity Store**: Instead of `saveAsset` in `marketing`, use a global `AssetManager` that tags content by `EntityType` (e.g., `Lead`, `Campaign`, `Client`).
*   **Event-Driven Triggering**: 
    *   *Example*: When a "Business Plan" is finalized in `/business`, it should trigger a "Marketing Strategy" draft in `/marketing`.
    *   *Example*: A "Complaint" in `/support` should feed into "Product Improvement" suggestions in `/strategy`.
*   **Cross-Module Context (The "Thread")**: Implement a global `ContextState` (e.g., `activeClient`, `activeProject`) so that switching from `/business` to `/marketing` doesn't require re-entering the product name or target audience.
*   **Service Layer Abstraction**: Move `aiService` from `/modules/content` to a global `core/ai` layer, as every module (Support, Strategy, Business) now relies on the same LLM processing logic.

### 1. Content Module Audit: Missing Tools
The `content` module currently acts as a "Headless Factory"—it provides the AI logic and asset storage, but lacks high-level orchestration. To move from a simple generator to a professional **Content Studio**, the following are missing:

*   **Content Repurposer**: A tool to transform a "source" asset (e.g., a long-form product description) into multiple "derivative" assets (e.g., 3 Tweets, 1 FB post, 1 Ad headline).
*   **Brand Voice Vault**: A central configuration tool where a user defines brand guidelines (Tone, Forbidden Words, Value Propositions). This should be a "Global Parameter" injected into every prompt across all modules.
*   **Localization & Translation Engine**: A service to translate generated content into multiple languages while maintaining the AI-generated tone and intent.
*   **Template Manager**: Ability for users to save "Winning Prompts" or "Structures" as templates to ensure consistency across different campaigns.
*   **Asset Versioning**: Currently, `saveAsset` overwrites or creates new ones. An enterprise OS needs "Version History" (Draft $\rightarrow$ V1 $\rightarrow$ V2 $\rightarrow$ Approved).

---

### 2. Redundancy: Content vs. Marketing
There is a "Responsibility Blur" between these two modules.

*   **The Conflict**: `PostGenerator` and `ContentLibrary` live in the `content` folder but are routed/managed in the `marketing` manifest. Conversely, `AdCopyCreator` lives in `marketing` but depends entirely on `content` services.
*   **The Verdict**: They are not redundant in function, but they are **architecturally inconsistent**.
*   **The Fix**: `content` should be a **Pure Service Layer** (No UI, only logic and data). `marketing` (and other modules like `social` or `support`) should be the **UI/Application Layer** that consumes those services.

---

### 3. Odoo-like OS Architecture Review
The `manifest.ts` shows an attempt at a modular system (`depends`, `events`), but the actual implementation is still "Monolithic-Lite" (direct imports).

**Current Gap**: Communication is **Hard-Linked**. If you remove the `content` module, the `marketing` module crashes because of `import { ... } from '@/modules/content'`.

**Odoo-style Vision**:
*   **Decoupled Communication**: Modules should communicate via a **Service Registry** or **Event Bus**.
*   **Model Extension**: Instead of `marketing` having its own `leads` table, it should be able to "extend" a core `crm.contact` model.
*   **Contextual Continuity**: The OS should maintain a "Global Context" (e.g., `Active_Client_ID`). When switching from the Business Advisory module to Marketing, the OS knows exactly which client's data to load without the user re-selecting it.

---

### 4. Enterprise-Grade Modular OS TODO List

#### 🏗️ Phase 1: Core Infrastructure (The "Kernel")
- [ ] **Implement Global Service Registry**: Replace direct imports with a `getService('content')` pattern to allow module hot-swapping.
- [ ] **Centralize Entity Schema**: Move `Clients`, `Organizations`, and `Projects` to a `core` module to prevent data duplication.
- [ ] **Build Global Event Bus**: Implement a real event emitter for the `events` listed in `manifest.ts` (e.g., `marketing.lead.created` $\rightarrow$ triggers `automation.welcome_email`).
- [ ] **Unified Context Bridge**: Create a global state for `activeEntity` (Client/Project) to allow seamless inter-module navigation.

#### 📦 Phase 2: Content Studio Hardening (The "Factory")
- [ ] **Implement Brand Voice Injector**: Create a service that merges "Brand Guidelines" into every AI prompt automatically.
- [ ] **Develop Content Repurposing Logic**: Build a "Source $\rightarrow$ Derivative" pipeline in `aiService`.
- [ ] **Add Asset Versioning**: Update `assetService` to support `version_id` and `approval_status`.

#### 🚀 Phase 3: Module Integration (The "Ecosystem")
- [ ] **Cross-Module Workflows**: Create "Bridge Routes" (e.g., `/business/analyze` $\rightarrow$ one-click $\rightarrow$ `/marketing/plan`).
- [ ] **Global RBAC**: Implement a permission system where "Editor" in `content` doesn't necessarily mean "Admin" in `marketing`.
- [ ] **Unified Dashboard**: A "Home" view that aggregates widgets from all active modules based on the current `activeEntity`.