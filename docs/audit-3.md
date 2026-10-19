I have completed the architectural inspection and migration audit of the modular platform.

### A. Audit Report

| Module | Service / Tool | Status | Implementation Details | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **Marketing** | `campaignService` | **Full** | Supabase CRUD, campaign lifecycle events | Supabase, EventBus |
| | `analyticsService` | **Partial** | Mocked global ROI; Supabase for leads/channels | Supabase |
| | `competitorService` | **Partial** | AI gap analysis implemented; tracking/listing mocked | AI Service |
| | `landingPageService`| **Full** | AI-driven page generation (AIDA/PAS) | AI Service, Asset Manager |
| | `leadService` | **Full** | Lead CRUD, scoring logic, touchpoint tracking | Supabase, EventBus |
| | `personaService` | **Partial** | AI ICP generation implemented; storage mocked | AI Service |
| | `segmentationService`| **Full** | Dynamic lead filtering and segment management | Supabase |
| **Content** | `aiService` | **Full** | Integration with `smooth-processor` & `media-gen` | Supabase Functions |
| | `assetService` | **Full** | Central asset CRUD and lifecycle | Supabase, EventBus |
| | `generatorService` | **Full** | High-level generation wrapper | AI Service, Asset Manager |
| | `repurposerService` | **Full** | Cross-platform content transformation | AI Service, Asset Manager |
| | `templateService` | **Partial** | Template application implemented; storage mocked | AI Service, Asset Manager |
| | `translationService` | **Full** | Multi-language asset translation | AI Service, Asset Manager |
| **Social** | `accountService` | **Full** | OAuth2, Supabase Vault, token refresh | Supabase, Vault, Functions |
| | `analyticsService` | **Full** | Metric aggregation and `analytics-fetch` trigger | Supabase, Functions |
| | `approvalService` | **Full** | Review workflow, AI drafts, scheduling | Supabase, EventBus, AI |
| | `publisherService` | **Full** | Idempotent job management, n8n dispatch | Supabase, n8n |
| | `rateLimitService` | **Full** | Daily quota tracking per platform | Supabase |

---

### B. Inter-Module Communication Map

*   **Service Registry (DI):** Modules access cross-module logic via `getService('serviceName')` (e.g., `marketing` $\rightarrow$ `ai`).
*   **Event Bus (Pub/Sub):** Asynchronous communication via `eventBus.emit()`.
    *   `marketing.leadService` $\rightarrow$ `leadCreated` event.
    *   `social.approvalService` $\rightarrow$ `social.post.approved` event.
*   **Data Layer (Supabase):** Shared access to tables like `assets`, `ai_posts`, and `marketing_leads`.
*   **Infrastructure:** Centralized AI Gateway and Asset Manager act as the core "backbone" for `marketing`, `content`, and `social`.

---

### C. Migration Plan (`marketing` $\rightarrow$ `content_hub`)

**Items to Move/Integrate into `content_hub`:**
1.  **Components:** Move `AdCopyCreator`, `ProductDescription`, `SalesScripts`, `PostGenerator`, and `ContentLibrary` from `marketing/components` to `content_hub` to centralize "creation" tools.
2.  **Services:** Adapt `landingPageService` and `competitorService` into the `content` module as they are fundamentally content-generation tools.
3.  **Logic:** Move the "Persona" logic (`personaService`) to `content_hub` as a prerequisite for content generation.

**Items to remain in `marketing`:**
1.  `campaignService`, `leadService`, and `segmentationService` (Core CRM/Growth functions).
2.  `analyticsService` (Marketing-specific ROI and conversion tracking).

---

### D. Safe Refactor Plan

1.  **Phase 1 (Service Extraction):** Move `landingPageService` and `personaService` to `src/modules/content/services` and update all `getService` references.
2.  **Phase 2 (Component Migration):** Move visual components from `marketing/components/content` to `content/components`. Update imports in `src/pages/content`.
3.  **Phase 3 (Mock Replacement):** Replace mocks in `personaService` and `templateService` with real Supabase table implementations.
4.  **Phase 4 (Verification):** Run existing tests in `src/test` to ensure inter-module event flows (e.g., Lead $\rightarrow$ Campaign $\rightarrow$ Post) remain intact.