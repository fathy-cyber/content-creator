```
You are a senior principal engineer and software architect upgrading an existing 
Odoo-like Agency ERP system to enterprise grade.

The system is built with:
- Frontend: React + TypeScript + Tailwind CSS
- Backend/DB: Supabase (PostgreSQL + RLS + Vault + Realtime + Edge Functions + pg_cron)
- AI: Google Gemini API (free tier: gemini-1.5-flash) via existing lib/gemini.ts
- Workflow Automation: n8n (self-hosted)
- State Management: Zustand
- Data Fetching: React Query (TanStack Query v5)
- Validation: Zod
- Event System: internal eventBus (to be replaced by persistent EventBus)
- Existing modules: marketing, content, social (partially complete)

---

## YOUR MISSION

Upgrade the current project from a "Monolithic-Lite" architecture to a 
fully decoupled, enterprise-grade Agency OS following the exact todo list 
and folder structure provided below.

You will work ONE PHASE at a time.
You will work ONE FILE at a time within each phase.
You will write COMPLETE files — no placeholders, no "// TODO", no "// implement later".
At the end of each phase you will write:
"✅ Phase X complete — ready for Phase X+1"

Before starting any phase, you will:
1. List every file you will create or modify in that phase
2. State which existing files will be deleted or replaced
3. Confirm zero TypeScript errors are expected before proceeding

---

## ABSOLUTE RULES (never break these under any circumstance)

### Architecture Rules
1. NO module imports directly from another module.
   ALL cross-module communication goes through:
   - `core/registry/ServiceRegistry.ts` via `getService('serviceName')`
   - `core/events/EventBus.ts` via `emit()` and `on()`
   NEVER: `import { something } from '@/modules/content'` inside marketing
   ALWAYS: `const contentService = getService('content')`

2. `content` module has ZERO React components.
   It is a pure service layer.
   All UI lives in the consuming module (marketing, social, etc.)

3. ALL AI calls go through `core/ai/aiGateway.ts` ONLY.
   No module calls Gemini directly.
   No module imports lib/gemini.ts directly.
   The gateway is accessed via: `getService('ai').generate(request)`

4. ALL asset operations go through `core/assets/AssetManager.ts` ONLY.
   No module has its own asset table or asset service.
   Accessed via: `getService('assets').createAsset(data)`

5. Brand Voice is ALWAYS injected automatically by the AI Gateway.
   No component or service manually builds brand voice strings.
   The gateway reads active context and injects brand voice transparently.

6. The EventBus is PERSISTENT.
   Events are written to the `events` Supabase table BEFORE handlers are called.
   A crash between emit and handler does not lose the event.

7. RBAC is enforced at the SERVICE layer, not the UI layer.
   UI may hide buttons for UX, but the service always calls:
   `await permissionService.canOrThrow(userId, action, resource)`
   before any write operation.

8. The Audit Logger fires on EVERY mutation across ALL services.
   It is non-blocking (fire and forget with silent catch).
   Signature: `auditLogger.log(action, entityType, entityId, before, after)`

9. ALL Supabase tables have RLS enabled.
   ALL RLS policies include `workspace_id` scoping.
   Exception: `audit_log` is append-only (INSERT only policy).

10. Context Bridge is the SINGLE SOURCE OF TRUTH for active client/project.
    No component stores clientId in local state if it comes from global context.
    All forms read from `useContext()` or `ContextStore` automatically.

### Code Quality Rules
11. Every exported function has a JSDoc comment.
12. Every service file exports its TypeScript types at the top of the file.
13. Every write operation has a Zod schema validating input before DB call.
14. Every async operation returns `{ data, error }` pattern — never throws raw.
15. Every list query is paginated (default limit: 20).
16. Complete files only. If a file exceeds ~400 lines, write
    "Continuing [filename] — Part 2..." and resume immediately.

---

## TARGET FOLDER STRUCTURE

Implement exactly this structure.
Do not add folders not listed here.
Do not remove folders listed here.

```
src/
├── core/
│   ├── manifest.ts
│   ├── index.ts
│   ├── registry/
│   │   ├── ServiceRegistry.ts
│   │   └── ModuleRegistry.ts
│   ├── ai/
│   │   ├── aiGateway.ts
│   │   ├── providers/
│   │   │   ├── geminiProvider.ts
│   │   │   └── openrouterProvider.ts
│   │   ├── prompts/
│   │   │   ├── registry.ts
│   │   │   └── builder.ts
│   │   └── types.ts
│   ├── assets/
│   │   ├── AssetManager.ts
│   │   ├── VersionController.ts
│   │   └── types.ts
│   ├── entities/
│   │   ├── ClientService.ts
│   │   ├── ProjectService.ts
│   │   ├── WorkspaceService.ts
│   │   └── types.ts
│   ├── events/
│   │   ├── EventBus.ts
│   │   ├── EventStore.ts
│   │   ├── EventRouter.ts
│   │   └── types.ts
│   ├── brand/
│   │   ├── BrandVoiceService.ts
│   │   ├── BrandVoiceInjector.ts
│   │   └── types.ts
│   ├── rbac/
│   │   ├── PermissionService.ts
│   │   ├── RoleService.ts
│   │   ├── PolicyEngine.ts
│   │   └── types.ts
│   ├── context/
│   │   ├── ContextBridge.ts
│   │   ├── ContextStore.ts
│   │   └── types.ts
│   └── audit/
│       ├── AuditLogger.ts
│       └── types.ts
│
├── modules/
│   ├── marketing/
│   │   ├── manifest.ts
│   │   ├── index.ts
│   │   ├── services/
│   │   │   ├── campaignService.ts
│   │   │   ├── leadService.ts
│   │   │   ├── analyticsService.ts
│   │   │   ├── segmentationService.ts
│   │   │   ├── competitorService.ts
│   │   │   └── personaService.ts
│   │   ├── events/
│   │   │   ├── emitters.ts
│   │   │   └── listeners.ts
│   │   ├── migrations/
│   │   └── components/
│   │       ├── campaigns/
│   │       ├── leads/
│   │       ├── analytics/
│   │       └── tools/
│   │           ├── CompetitorAnalyzer.tsx
│   │           ├── PersonaBuilder.tsx
│   │           └── LandingPageWriter.tsx
│   │
│   ├── content/
│   │   ├── manifest.ts
│   │   ├── index.ts
│   │   ├── services/
│   │   │   ├── generatorService.ts
│   │   │   ├── repurposerService.ts
│   │   │   ├── translationService.ts
│   │   │   └── templateService.ts
│   │   ├── events/
│   │   └── migrations/
│   │
│   ├── social/
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
│   ├── business/
│   │   ├── manifest.ts
│   │   ├── index.ts
│   │   └── services/
│   │       ├── advisoryService.ts
│   │       └── strategyService.ts
│   │
│   └── support/
│       ├── manifest.ts
│       ├── index.ts
│       └── services/
│           ├── ticketService.ts
│           └── feedbackService.ts
│
└── supabase/
    ├── functions/
    │   ├── ai-gateway/
    │   │   └── index.ts
    │   ├── event-processor/
    │   │   └── index.ts
    │   ├── token-refresh/
    │   │   └── index.ts
    │   └── analytics-fetch/
    │       └── index.ts
    └── migrations/
        ├── core/
        │   ├── 001_workspaces.sql
        │   ├── 002_clients.sql
        │   ├── 003_projects.sql
        │   ├── 004_assets_v2.sql
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

## PHASE INSTRUCTIONS

===================================================================
PHASE 1 — CORE KERNEL (The Foundation)
Execute in this exact sub-phase order:
1A → Database Migrations
1B → Service Registry & Module Registry  
1C → AI Gateway & Providers & Prompt System
1D → Brand Voice Vault
1E → Persistent Event Bus
1F → Context Bridge
1G → Global Asset Manager
1H → RBAC Engine
1I → Audit Logger
1J → Core index.ts & manifest.ts (wire everything together)
===================================================================

---

### PHASE 1A — Database Migrations

Write all 8 SQL migration files.

Each file MUST contain:
- CREATE TYPE statements before CREATE TABLE (if enums needed)
- UP migration (full CREATE TABLE)
- All columns with correct types, constraints, defaults
- ALTER TABLE ... ENABLE ROW LEVEL SECURITY
- RLS policies (SELECT, INSERT, UPDATE, DELETE) scoped to:
  auth.uid() and workspace_id
- Indexes on all FK columns, status columns, and frequently filtered columns
- DOWN migration as a comment block at the bottom (DROP statements)
- updated_at trigger using a reusable trigger function

`001_workspaces.sql`:
  workspaces:
    id            UUID PK DEFAULT gen_random_uuid()
    name          TEXT NOT NULL
    slug          TEXT UNIQUE NOT NULL
    settings      JSONB DEFAULT '{}'
    created_at    TIMESTAMPTZ DEFAULT NOW()
    updated_at    TIMESTAMPTZ DEFAULT NOW()

  RLS: all authenticated users in the workspace can SELECT
  Only workspace owner (created_by) can UPDATE

`002_clients.sql`:
  clients:
    id            UUID PK DEFAULT gen_random_uuid()
    workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE
    name          TEXT NOT NULL
    industry      TEXT
    website       TEXT
    logo_url      TEXT
    metadata      JSONB DEFAULT '{}'
    created_by    UUID REFERENCES auth.users(id)
    created_at    TIMESTAMPTZ DEFAULT NOW()
    updated_at    TIMESTAMPTZ DEFAULT NOW()

`003_projects.sql`:
  projects:
    id            UUID PK DEFAULT gen_random_uuid()
    workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE
    client_id     UUID REFERENCES clients(id) ON DELETE SET NULL
    name          TEXT NOT NULL
    description   TEXT
    status        TEXT DEFAULT 'active'
                  CHECK (status IN ('active','paused','completed','archived'))
    start_date    DATE
    end_date      DATE
    metadata      JSONB DEFAULT '{}'
    created_by    UUID REFERENCES auth.users(id)
    created_at    TIMESTAMPTZ DEFAULT NOW()
    updated_at    TIMESTAMPTZ DEFAULT NOW()

`004_assets_v2.sql`:
  CREATE TYPE asset_entity_type AS ENUM (
    'campaign','lead','brief','plan','post',
    'script','persona','template','repurpose_derivative'
  );
  CREATE TYPE asset_content_type AS ENUM (
    'post','ad_copy','product_description','sales_script',
    'email','whatsapp_template','landing_page',
    'persona','competitor_analysis','translation','repurposed'
  );
  CREATE TYPE asset_status AS ENUM (
    'draft','internal_review','client_review',
    'approved','published','archived','rejected'
  );

  assets:
    id              UUID PK
    workspace_id    UUID NOT NULL REFERENCES workspaces(id)
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL
    entity_type     asset_entity_type
    entity_id       UUID
    type            asset_content_type NOT NULL
    platform        TEXT
    title           TEXT NOT NULL
    status          asset_status DEFAULT 'draft'
    language        TEXT DEFAULT 'en'
    parent_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL
    created_by      UUID REFERENCES auth.users(id)
    created_at      TIMESTAMPTZ DEFAULT NOW()
    updated_at      TIMESTAMPTZ DEFAULT NOW()

  asset_versions:
    id               UUID PK
    asset_id         UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE
    version_number   INT NOT NULL
    content          TEXT NOT NULL
    diff_from_prev   TEXT
    change_summary   TEXT
    created_by       UUID REFERENCES auth.users(id)
    created_at       TIMESTAMPTZ DEFAULT NOW()
    UNIQUE(asset_id, version_number)

  asset_approvals:
    id          UUID PK
    asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE
    version_id  UUID REFERENCES asset_versions(id)
    stage       TEXT NOT NULL
                CHECK (stage IN (
                  'submitted','internal_review','client_review',
                  'approved','rejected','escalated'
                ))
    actor_id    UUID REFERENCES auth.users(id)
    comment     TEXT
    created_at  TIMESTAMPTZ DEFAULT NOW()

  review_tokens:
    id          UUID PK
    asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE
    token       UUID UNIQUE DEFAULT gen_random_uuid()
    client_email TEXT NOT NULL
    expires_at  TIMESTAMPTZ NOT NULL
    used_at     TIMESTAMPTZ
    created_at  TIMESTAMPTZ DEFAULT NOW()

`005_brand_voices.sql`:
  brand_voices:
    id                  UUID PK
    workspace_id        UUID NOT NULL REFERENCES workspaces(id)
    client_id           UUID REFERENCES clients(id) ON DELETE CASCADE
    name                TEXT NOT NULL
    tone_descriptors    TEXT[] DEFAULT '{}'
    forbidden_words     TEXT[] DEFAULT '{}'
    value_propositions  TEXT[] DEFAULT '{}'
    example_copy        TEXT
    target_audience     TEXT
    is_default          BOOLEAN DEFAULT false
    created_by          UUID REFERENCES auth.users(id)
    created_at          TIMESTAMPTZ DEFAULT NOW()
    updated_at          TIMESTAMPTZ DEFAULT NOW()

  Constraint: only one brand_voice can have is_default=true per client_id
  (use a partial unique index)

`006_event_store.sql`:
  CREATE TYPE event_status AS ENUM (
    'pending','delivered','failed','dead'
  );

  events:
    id             UUID PK
    workspace_id   UUID REFERENCES workspaces(id)
    event_name     TEXT NOT NULL
    payload        JSONB NOT NULL DEFAULT '{}'
    source_module  TEXT NOT NULL
    status         event_status DEFAULT 'pending'
    retry_count    INT DEFAULT 0
    error          TEXT
    created_at     TIMESTAMPTZ DEFAULT NOW()
    delivered_at   TIMESTAMPTZ
    next_retry_at  TIMESTAMPTZ

  Indexes: status, event_name, created_at, next_retry_at
  RLS: service_role only (never accessed from client)

`007_audit_log.sql`:
  audit_log:
    id           UUID PK
    workspace_id UUID REFERENCES workspaces(id)
    actor_id     UUID REFERENCES auth.users(id)
    action       TEXT NOT NULL
    entity_type  TEXT NOT NULL
    entity_id    UUID
    before       JSONB
    after        JSONB
    ip_address   TEXT
    user_agent   TEXT
    created_at   TIMESTAMPTZ DEFAULT NOW()

  CRITICAL RLS RULES:
  - SELECT: auth.uid() IS NOT NULL (authenticated users can read their workspace logs)
  - INSERT: auth.uid() IS NOT NULL
  - UPDATE: DENY ALL (no policy — append only)
  - DELETE: DENY ALL (no policy — append only)
  Indexes: entity_type + entity_id, actor_id, created_at

`008_rbac.sql`:
  roles:
    id           UUID PK
    workspace_id UUID NOT NULL REFERENCES workspaces(id)
    name         TEXT NOT NULL
    description  TEXT
    is_system    BOOLEAN DEFAULT false
    created_at   TIMESTAMPTZ DEFAULT NOW()
    UNIQUE(workspace_id, name)

  permissions:
    id          UUID PK
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE
    module      TEXT NOT NULL
    resource    TEXT NOT NULL
    action      TEXT NOT NULL
                CHECK (action IN (
                  'create','read','update','delete','approve','publish'
                ))
    conditions  JSONB DEFAULT '{}'
    created_at  TIMESTAMPTZ DEFAULT NOW()

  user_roles:
    id          UUID PK
    user_id     UUID NOT NULL REFERENCES auth.users(id)
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE
    client_id   UUID REFERENCES clients(id) ON DELETE CASCADE
    granted_by  UUID REFERENCES auth.users(id)
    created_at  TIMESTAMPTZ DEFAULT NOW()
    UNIQUE(user_id, role_id, client_id)

  Seed system roles after table creation:
  INSERT INTO roles (name, description, is_system) VALUES:
  ('super_admin', 'Full system access', true)
  ('admin', 'Workspace administration', true)
  ('manager', 'Campaign and team management', true)
  ('copywriter', 'Content creation and editing', true)
  ('reviewer', 'Internal content review and approval', true)
  ('client_viewer', 'Read-only client portal access', true)

After completing all 8 migrations, write the pg_cron scheduler SQL:
`supabase/migrations/core/009_pg_cron_jobs.sql`
  Job 1: every 30 seconds → call event-processor Edge Function
         (re-deliver pending events older than 10 seconds)
  Job 2: every hour → escalate asset_approvals stuck > 48h
  Job 3: every 6 hours → check token expiry in social_accounts

---

### PHASE 1B — Service Registry & Module Registry

`core/registry/ServiceRegistry.ts`:
  - Internal Map<string, unknown> store
  - `registerService<T>(name: string, instance: T): void`
    Throws if name already registered (prevent silent overwrites)
  - `getService<T>(name: string): T`
    Throws descriptive ServiceNotFoundError if not registered
    Error message must include: name, list of registered services
  - `hasService(name: string): boolean`
  - `unregisterService(name: string): void` (for testing)
  - `listServices(): string[]`
  - Export singleton instance: `export const serviceRegistry = new ServiceRegistry()`

`core/registry/ModuleRegistry.ts`:
  - Internal Map<string, ModuleManifest> store
  - `registerModule(manifest: ModuleManifest): void`
    Validates all dependencies are already registered
    Throws if dependency not found
    Emits 'module.registered' event after registration
  - `getModule(id: string): ModuleManifest`
  - `isModuleInstalled(id: string): boolean`
  - `listModules(): ModuleManifest[]`
  - `getModuleLoadOrder(): string[]`
    Returns modules in dependency-resolved order
    Uses topological sort (implement Kahn's algorithm)
  - Export singleton: `export const moduleRegistry = new ModuleRegistry()`

---

### PHASE 1C — AI Gateway, Providers & Prompt System

`core/ai/types.ts`:
  Export all TypeScript interfaces:
  - AIRequest: { promptKey, inputs, brandVoiceId?, clientId?,
                 temperature?, maxTokens?, provider? }
  - AIResponse: { content, usage: { inputTokens, outputTokens }, 
                  latencyMs, provider, model }
  - AIProvider: 'gemini' | 'openrouter'
  - PromptTemplate: (inputs: Record<string, unknown>) => string
  - GeneratedContent: { text: string, structuredData?: unknown }

`core/ai/providers/geminiProvider.ts`:
  - Initialize Gemini client from env (call via Edge Function only)
  - `generate(prompt: string, temperature: number): Promise<string>`
  - Implement token bucket rate limiter (15 RPM free tier)
    Use in-memory Map with sliding window
    If rate limited: wait and retry (do not throw immediately)
  - Retry logic: max 3 retries, exponential backoff (1s, 2s, 4s)
  - On parse failure from Gemini: retry once with stricter JSON instruction appended
  - Return raw string (parsing happens in gateway)

`core/ai/providers/openrouterProvider.ts`:
  - `generate(model: string, prompt: string, temperature: number): Promise<string>`
  - Default model: 'google/gemini-flash-1.5' (free via OpenRouter)
  - Complex tasks model: 'anthropic/claude-3-haiku' (cheap, good quality)
  - Same retry logic as geminiProvider

`core/ai/prompts/registry.ts`:
  Register ALL prompt templates. Each template:
  - Accepts typed inputs object
  - Instructs Gemini to return valid JSON
  - Specifies exact JSON output shape in the prompt
  - Temperature hint (creative: 0.7-0.9, structured: 0.2-0.4)

  Implement templates for these promptKeys:
  Content Generation:
  - POST.LINKEDIN, POST.INSTAGRAM, POST.TWITTER, POST.FACEBOOK
  - AD_COPY.GOOGLE, AD_COPY.META, AD_COPY.DISPLAY
  - PRODUCT_DESC.ECOMMERCE, PRODUCT_DESC.B2B, PRODUCT_DESC.TEASER
  - SALES_SCRIPT.COLD_CALL, SALES_SCRIPT.DISCOVERY,
    SALES_SCRIPT.OBJECTION, SALES_SCRIPT.CLOSING
  - EMAIL.SUBJECT, EMAIL.BODY
  - CAMPAIGN_PLAN, CTA_SUGGESTIONS

  New Agency Tools:
  - COMPETITOR.GAP_ANALYSIS
    Inputs: competitorAdCopy, ourProduct, ourUSP
    Output JSON: { angles[], weaknesses[], gaps[], emotionalTriggers[] }

  - COMPETITOR.COUNTER_ANGLE
    Inputs: competitorAnalysis, brandVoice, targetPersona
    Output JSON: { counterAngles[], suggestedHooks[], adCopy }

  - PERSONA.ICP_BUILDER
    Inputs: industry, product, existingCustomerData?
    Output JSON: { name, ageRange, jobTitle, painPoints[],
                   goals[], objections[], preferredChannels[],
                   languageStyle, buyingTriggers[] }

  - LANDING_PAGE.AIDA
    Inputs: product, targetPersona, USP, CTA
    Output JSON: { attention: { headline, subheadline },
                   interest: { body }, desire: { bullets[] },
                   action: { cta, urgencyLine } }

  - LANDING_PAGE.PAS
    Inputs: product, targetPersona, mainProblem
    Output JSON: { problem, agitation, solution, cta }

  - REPURPOSE.LONG_TO_TWEETS
    Inputs: longFormContent, count (default 5)
    Output JSON: { tweets: [{ text, charCount }] }

  - REPURPOSE.LONG_TO_LINKEDIN
    Inputs: longFormContent, tone
    Output JSON: { posts: [{ hook, body, cta }] }

  - REPURPOSE.LONG_TO_INSTAGRAM
    Inputs: longFormContent
    Output JSON: { caption, hashtags[], reelScript? }

  - REPURPOSE.LONG_TO_AD
    Inputs: longFormContent, platform
    Output JSON: { headline, primaryText, cta }

  - TRANSLATE
    Inputs: content, fromLanguage, toLanguage, toneDescriptors[]
    Output JSON: { translatedContent, adaptationNotes }

  - BRAND_VOICE.EXTRACT
    Inputs: exampleCopy (3-5 sample texts)
    Output JSON: { toneDescriptors[], forbiddenWords[],
                   valuePropositions[], targetAudience }

  - YOUTUBE.TITLE, CAMPAIGN_PLAN, CTA_SUGGESTIONS (already existed)

`core/ai/prompts/builder.ts`:
  `buildPrompt(promptKey, inputs, brandVoice?, context?): string`:
  - Fetch template from registry
  - If brandVoice provided: prepend brand voice block:
    ```
    === BRAND VOICE CONSTRAINTS (MUST FOLLOW) ===
    Tone: {tone_descriptors.join(', ')}
    Never use these words: {forbidden_words.join(', ')}
    Always emphasize: {value_propositions.join(' | ')}
    Target audience: {target_audience}
    ============================================
    ```
  - If context provided: prepend context block:
    ```
    === ACTIVE CONTEXT ===
    Client: {client.name}
    Industry: {client.industry}
    Product/Service: {context.product}
    ======================
    ```
  - Append JSON instruction suffix:
    ```
    CRITICAL: Return ONLY valid JSON matching the schema above.
    No markdown. No explanation. No code blocks. Pure JSON only.
    ```
  - Return assembled prompt string

`core/ai/aiGateway.ts`:
  This is the ONLY entry point for all AI calls in the system.

  `generate(request: AIRequest): Promise<AIResponse>`:
  1. Validate request with Zod schema
  2. Fetch brand voice: if request.clientId → BrandVoiceInjector.injectForClient()
     else if request.brandVoiceId → BrandVoiceInjector.inject()
  3. Fetch active context from ContextBridge.getContext()
  4. Build final prompt: promptBuilder.buildPrompt(key, inputs, brandVoice, context)
  5. Select provider based on promptKey (complex tasks → openrouter, simple → gemini)
  6. Call provider.generate(prompt, temperature)
  7. Parse JSON response (try/catch — retry once with stricter suffix on failure)
  8. Log to audit: { action: 'ai.generate', entity_type: 'ai_request',
                     after: { promptKey, tokenUsage, latencyMs } }
  9. Return typed AIResponse

  Register self with ServiceRegistry on initialization:
  `serviceRegistry.registerService('ai', aiGatewayInstance)`

  Also write `supabase/functions/ai-gateway/index.ts`:
  Deno Edge Function that:
  - Validates Authorization header (service_role or valid JWT)
  - Validates request body (promptKey + inputs)
  - Calls Gemini API server-side using GEMINI_API_KEY from Deno.env
  - Returns { content, usage }
  - Never exposes API key to client

---

### PHASE 1D — Brand Voice Vault

`core/brand/types.ts`:
  Export: BrandVoice, CreateBrandVoiceInput, UpdateBrandVoiceInput,
          BrandVoiceExtractionResult

`core/brand/BrandVoiceService.ts`:
  Functions (all return { data, error } pattern):
  - createBrandVoice(input: CreateBrandVoiceInput)
    Zod validation → insert → auditLogger.log → emit 'brand.voice.created'
  - getBrandVoice(id: string)
  - getBrandVoiceForClient(clientId: string)
    Returns client-specific voice OR workspace default if none exists
    Priority: client-specific → workspace default → null
  - listBrandVoices(clientId?: string)
  - updateBrandVoice(id, changes)
    Zod validation → update → auditLogger.log → invalidate cache
  - deleteBrandVoice(id)
    Prevent deletion of workspace default (throw descriptive error)
  - setDefault(id, clientId?)
    Set is_default=true, set all others to false for same client
  - extractBrandVoiceFromCopy(exampleCopy: string[])
    Calls aiGateway.generate({ promptKey: 'BRAND_VOICE.EXTRACT', inputs: { exampleCopy } })
    Returns BrandVoiceExtractionResult for user to review before saving

`core/brand/BrandVoiceInjector.ts`:
  Internal cache: Map<string, { voice: BrandVoice, expiresAt: number }>
  Cache TTL: 5 minutes

  - inject(promptString, brandVoiceId): Promise<string>
    Fetch from cache or DB → build constraint block → prepend to prompt
  - injectForClient(promptString, clientId): Promise<string>
    Call getBrandVoiceForClient → if found inject → if not return prompt unchanged
  - invalidateCache(id): void
    Called by BrandVoiceService.updateBrandVoice()

  Register BrandVoiceService with ServiceRegistry:
  `serviceRegistry.registerService('brandVoice', brandVoiceServiceInstance)`

---

### PHASE 1E — Persistent Event Bus

`core/events/types.ts`:
  Export: AppEvent, EventHandler, EventName (union of all event strings),
          EventPayloadMap (maps event name to its payload type)

  Define ALL event names and their payload types:
  Core events:
  - 'module.registered': { moduleId, manifest }
  - 'context.client.changed': { clientId, client }
  - 'context.project.changed': { projectId, project }
  - 'brand.voice.created': { brandVoiceId, clientId }
  - 'asset.created': { assetId, type, clientId }
  - 'asset.status.changed': { assetId, from: AssetStatus, to: AssetStatus }
  - 'asset.approved': { assetId, clientId, approvedBy }
  - 'asset.published': { assetId, platform }

  Marketing events:
  - 'marketing.lead.created': { leadId, source, campaignId }
  - 'marketing.lead.scored': { leadId, score, status }
  - 'marketing.campaign.launched': { campaignId }
  - 'marketing.campaign.ended': { campaignId, metrics }
  - 'marketing.persona.created': { personaId, clientId }

  Content events:
  - 'content.repurpose.completed': { sourceAssetId, derivativeIds[] }
  - 'content.translation.completed': { sourceAssetId, translatedAssetIds[] }

  Social events:
  - 'social.post.published': { publishJobId, platform, externalPostId }
  - 'social.post.publish.dead': { publishJobId }
  - 'social.token.expired': { accountId, platform }

  Business events:
  - 'business.plan.finalized': { planId, clientId }

  Support events:
  - 'support.complaint.received': { ticketId, severity }

`core/events/EventStore.ts`:
  - persistEvent(event: AppEvent): Promise<string> (returns event id)
    INSERT into events table BEFORE returning
    This is called by EventBus BEFORE dispatching to handlers
  - markDelivered(eventId: string): Promise<void>
  - markFailed(eventId: string, error: string): Promise<void>
    Increments retry_count, sets next_retry_at (exponential backoff)
    If retry_count >= 3: set status = 'dead'
  - getPendingEvents(): Promise<AppEvent[]>
    Events with status='pending' AND next_retry_at <= NOW()
  - getDeadEvents(): Promise<AppEvent[]>

`core/events/EventBus.ts`:
  Internal: Map<EventName, Set<EventHandler>>

  - emit<T extends EventName>(
      eventName: T,
      payload: EventPayloadMap[T],
      sourceModule: string
    ): Promise<void>
    
    Flow:
    1. Persist event to EventStore FIRST (get eventId)
    2. Get all handlers for eventName
    3. For each handler: try { await handler(payload) } catch { markFailed }
    4. If all handlers succeed: markDelivered(eventId)
    5. If any handler fails: markFailed(eventId, error) — other handlers still run

  - on<T extends EventName>(eventName: T, handler: EventHandler<T>): () => void
    Returns unsubscribe function
  - off<T extends EventName>(eventName: T, handler: EventHandler<T>): void
  - once<T extends EventName>(eventName: T, handler: EventHandler<T>): void
  - listHandlers(eventName: EventName): number (count of handlers)

  Export singleton: `export const eventBus = new EventBus()`
  Register with ServiceRegistry: `serviceRegistry.registerService('eventBus', eventBus)`

`core/events/EventRouter.ts`:
  `initEventRouter()`:
  - Called ONCE at app startup (in main.tsx or App.tsx)
  - Replays all pending events from EventStore (recovery on restart)
  - Sets up Supabase Realtime subscription on events table
    for cross-browser-tab event delivery
  - Registers all cross-module event listeners:

    'business.plan.finalized' →
      Fetch plan data → create Marketing Strategy asset draft
      via AssetManager.createAsset()

    'support.complaint.received' →
      If severity === 'high': emit to strategy module
      Create product improvement suggestion asset

    'context.client.changed' →
      Invalidate BrandVoiceInjector cache for old client
      Preload brand voice for new client

    'asset.approved' →
      If asset has social platform set: notify social module
      Emit 'social.post.ready_to_schedule'

    'social.post.published' →
      Update campaign analytics
      Call analyticsService.attributePostToCampaign()

    'marketing.lead.scored' →
      If score >= 70: create CRM contact via CRM module service

    'client.created' →
      Auto-create default brand voice for client

  Also write `supabase/functions/event-processor/index.ts`:
  Deno Edge Function:
  - Called by pg_cron every 30 seconds
  - Fetches pending events older than 10 seconds
  - Re-dispatches them to module-specific webhook endpoints
  - Updates event status based on response

---

### PHASE 1F — Context Bridge

`core/context/types.ts`:
  Export: GlobalContext, ActiveClient, ActiveProject, ContextState

`core/context/ContextStore.ts`:
  Zustand store with persist middleware (localStorage):
  State shape:
  {
    activeClientId: string | null,
    activeClient: Client | null,
    activeProjectId: string | null,
    activeProject: Project | null,
    activeWorkspaceId: string | null,
    isContextLoaded: boolean
  }
  Actions:
  - setActiveClient(client: Client | null)
  - setActiveProject(project: Project | null)
  - setActiveWorkspace(workspace: Workspace)
  - clearContext()
  - loadContextFromStorage() (called on app init)

`core/context/ContextBridge.ts`:
  Wrapper around ContextStore that also fires events:

  - setActiveClient(clientId: string): Promise<void>
    Fetch client from ClientService
    Update ContextStore
    Emit 'context.client.changed'
    Invalidate brand voice cache for previous client
    Return void

  - setActiveProject(projectId: string): Promise<void>
    Fetch project from ProjectService
    Update ContextStore
    Emit 'context.project.changed'

  - getContext(): GlobalContext
    Returns current context from ContextStore

  - getActiveClient(): Client | null
  - getActiveProject(): Project | null

  - enrichAIInputs(inputs: Record<string, unknown>): Record<string, unknown>
    Takes any AI inputs object
    Merges in: client name, industry, product from active context
    Returns enriched inputs
    Called automatically by aiGateway before every generate()

  Register with ServiceRegistry:
  `serviceRegistry.registerService('context', contextBridgeInstance)`

  Also create React hook: `useGlobalContext()`
  Returns ContextStore state with typed selectors
  Components use this hook to react to context changes

---

### PHASE 1G — Global Asset Manager

`core/assets/types.ts`:
  Export all types: Asset, AssetVersion, AssetApproval, ReviewToken,
  CreateAssetInput, UpdateAssetInput, AssetFilters, VersionHistory,
  AssetStateMachineTransition

  Define state machine transitions:
  VALID_TRANSITIONS = {
    draft: ['internal_review'],
    internal_review: ['draft', 'client_review', 'approved'],
    client_review: ['draft', 'approved'],
    approved: ['published', 'archived'],
    published: ['archived'],
    archived: [],
    rejected: ['draft']
  }

`core/assets/VersionController.ts`:
  - getVersionHistory(assetId: string): Promise<AssetVersion[]>
    Returns all versions ordered by version_number ASC
  - getCurrentVersion(assetId: string): Promise<AssetVersion>
    Returns latest version
  - createVersion(assetId, content, changeSummary, createdBy): Promise<AssetVersion>
    Auto-increments version_number
    Calculates diff from previous version (simple line diff)
    INSERT into asset_versions
  - rollbackToVersion(assetId, targetVersionNumber): Promise<AssetVersion>
    Fetch target version content
    Create NEW version (do not modify history)
    New version changeSummary: 'Rolled back to version {n}'
  - diffVersions(versionId1, versionId2): Promise<string>
    Returns human-readable diff string

`core/assets/AssetManager.ts`:
  ALL functions enforce RBAC via permissionService.canOrThrow()
  ALL functions log to auditLogger
  ALL functions emit events via eventBus

  - createAsset(input: CreateAssetInput): Promise<{ data: Asset, error }>
    Zod validation
    RBAC: canOrThrow(userId, 'create', 'asset')
    INSERT into assets
    IMMEDIATELY call versionController.createVersion(id, input.content, 'Initial draft')
    Emit 'asset.created'
    auditLogger.log('asset.created', 'asset', id, null, asset)

  - getAsset(id: string): Promise<Asset & { currentContent: string }>
    Fetch asset + getCurrentVersion
    Return merged object

  - getAssetWithHistory(id: string): Promise<Asset & { versions: AssetVersion[] }>

  - listAssets(filters: AssetFilters): Promise<{ data: Asset[], count: number }>
    Filters: entity_type, entity_id, client_id, project_id,
             status, type, platform, language
    Paginated (limit 20, offset)

  - saveNewVersion(assetId, content, changeSummary, userId)
    RBAC: canOrThrow(userId, 'update', 'asset')
    Validate asset is not in 'published' or 'archived' state
    Call versionController.createVersion()
    Update assets.updated_at
    auditLogger.log

  - transitionStatus(assetId, toStatus, userId, comment?)
    Validate transition is allowed by VALID_TRANSITIONS
    RBAC: check specific permission based on transition
      draft→internal_review: 'create' permission
      internal_review→approved: 'approve' permission
      approved→published: 'publish' permission
    INSERT into asset_approvals
    UPDATE assets.status
    Emit 'asset.status.changed'
    auditLogger.log

  - generateReviewToken(assetId, clientEmail): Promise<ReviewToken>
    Generate token, set expires_at = NOW() + 7 days
    INSERT into review_tokens
    Return token (caller sends email)

  - validateReviewToken(token: string): Promise<Asset | null>
    Fetch token, check not expired, check not used
    Return associated asset

  - getAssetsByEntity(entityType, entityId): Promise<Asset[]>
  - getAssetsByCampaign(campaignId): Promise<Asset[]>

  Register: `serviceRegistry.registerService('assets', assetManagerInstance)`

---

### PHASE 1H — RBAC Engine

`core/rbac/types.ts`:
  Export: Role, Permission, UserRole, PermissionCheck,
          ResourceAction (create|read|update|delete|approve|publish)

`core/rbac/RoleService.ts`:
  - listRoles(workspaceId: string): Promise<Role[]>
  - getRole(id: string): Promise<Role>
  - createRole(data): Promise<Role> (non-system roles only)
  - assignRole(userId, roleId, clientId?): Promise<UserRole>
  - revokeRole(userId, roleId, clientId?): Promise<void>
  - getUserRoles(userId: string): Promise<UserRole[]>
  - getEffectiveRole(userId, clientId?): Promise<Role>
    Priority: client-scoped role → workspace role → default (client_viewer)

`core/rbac/PolicyEngine.ts`:
  - evaluateConditions(conditions: jsonb, context: Record<string, unknown>): boolean
    Evaluates condition objects like:
    { field: 'status', operator: 'not_in', values: ['approved', 'published'] }
    Supported operators: equals, not_equals, in, not_in, greater_than, less_than
  - getPermissionsForRole(roleId: string): Promise<Permission[]>
  - hasPermission(permissions, module, resource, action): boolean

`core/rbac/PermissionService.ts`:
  Internal cache: Map<userId, { permissions: Permission[], expiresAt: number }>
  Cache TTL: 2 minutes

  - can(userId, action, resource, context?): Promise<boolean>
    Fetch user's effective role permissions (from cache or DB)
    Find matching permission for (module, resource, action)
    If conditions present: evaluate via PolicyEngine.evaluateConditions(conditions, context)
    Return boolean

  - canOrThrow(userId, action, resource, context?): Promise<void>
    Calls can() → if false: throw PermissionDeniedError
    Error includes: userId, action, resource (for debugging)

  - invalidateCache(userId: string): void
    Called when user role changes

  Register: `serviceRegistry.registerService('permissions', permissionServiceInstance)`

---

### PHASE 1I — Audit Logger

`core/audit/types.ts`:
  Export: AuditEntry, AuditAction

`core/audit/AuditLogger.ts`:
  - log(
      action: string,
      entityType: string,
      entityId: string,
      before: unknown,
      after: unknown,
      metadata?: { ipAddress?, userAgent? }
    ): void   ← void, not Promise (fire and forget)

    Implementation:
    const actor_id = getCurrentUserId() (from Supabase auth)
    const workspace_id = getCurrentWorkspaceId() (from ContextBridge)
    
    supabase.from('audit_log').insert({...}).then().catch(err => {
      console.error('[AuditLogger] Failed to write audit entry:', err)
      // Never throw — never block the main operation
    })

  - getAuditLog(filters): Promise<AuditEntry[]>
    Filters: entityType, entityId, actorId, dateRange
    Paginated (limit 50)

  Register: `serviceRegistry.registerService('audit', auditLoggerInstance)`

---

### PHASE 1J — Core Wiring (index.ts & manifest.ts & App Boot)

`core/manifest.ts`:
  export const coreManifest = {
    id: 'core',
    name: 'Agency OS Core',
    version: '2.0.0',
    description: 'Kernel layer providing shared services for all modules',
    services: [
      'ai', 'assets', 'brandVoice', 'context',
      'eventBus', 'permissions', 'audit',
      'clients', 'projects', 'workspaces'
    ],
    migrations: [
      '001_workspaces.sql', '002_clients.sql', '003_projects.sql',
      '004_assets_v2.sql', '005_brand_voices.sql', '006_event_store.sql',
      '007_audit_log.sql', '008_rbac.sql', '009_pg_cron_jobs.sql'
    ]
  }

`core/index.ts`:
  Export ONLY the public API that modules are allowed to use:
  - From registry: serviceRegistry, moduleRegistry, getService, registerService
  - From events: eventBus (emit and on only — not EventStore internals)
  - From context: useGlobalContext, ContextBridge (setActiveClient, setActiveProject, getContext)
  - From types: all shared types (Client, Project, Asset, BrandVoice, etc.)
  
  DO NOT export: internal implementations, Supabase client, raw providers

`core/boot.ts` (NEW FILE — called once in main.tsx):
  `async function bootCore(): Promise<void>`
  Execute in this order:
  1. Initialize Supabase client
  2. Register ServiceRegistry (it registers itself)
  3. Initialize and register AuditLogger
  4. Initialize and register PermissionService
  5. Initialize and register BrandVoiceService + BrandVoiceInjector
  6. Initialize and register ContextBridge + load from localStorage
  7. Initialize and register EventBus + EventStore
  8. Initialize and register AssetManager + VersionController
  9. Initialize AI Gateway (registers providers + prompt registry)
  10. Initialize and register ClientService, ProjectService, WorkspaceService
  11. Call initEventRouter() (start listening + replay pending events)
  12. Register core module in ModuleRegistry
  13. Log boot completion to console (list all registered services)

  If ANY step throws: show full-screen error with service name that failed

===================================================================
PHASE 2 — CONTENT MODULE RESTRUCTURE & HARDENING
Execute after Phase 1 is fully complete and verified.
===================================================================

### PHASE 2A — Remove UI from Content Module

Tasks:
1. Move these files FROM content/ TO marketing/components/content/:
   - PostGenerator.tsx
   - AdCopyCreator.tsx  
   - ProductDescription.tsx
   - SalesScripts.tsx
   - ContentLibrary.tsx
2. Update ALL imports in moved files:
   - Replace any `import { ... } from '@/modules/content'`
     with `const service = getService('content')`
   - Replace any direct Gemini calls
     with `getService('ai').generate(request)`
3. Delete from content/: any remaining .tsx files
4. Verify content/index.ts exports ZERO React components
5. Fix all TypeScript errors from the moves

### PHASE 2B — Content Services (Pure Service Layer)

`content/services/generatorService.ts`:
  All generation functions — now delegate to core/ai/aiGateway:
  - generatePost(platform, inputs, clientId?): Promise<GeneratedContent>
    Calls: getService('ai').generate({ promptKey: 'POST.'+platform, inputs, clientId })
    Saves result as asset: getService('assets').createAsset(...)
    Returns { content, assetId }
  - generateAdCopy(platform, inputs, clientId?)
  - generateProductDescription(variant, inputs, clientId?)
  - generateSalesScript(type, inputs, clientId?)
  - generateEmailContent(type, inputs, clientId?)
  (Same pattern for all — delegate to AI gateway, save to asset manager)

`content/services/repurposerService.ts`:
  - repurposeAsset(sourceAssetId, targetFormats[], clientId?):
      Promise<{ format, assetId, content }[]>
    Fetch source asset content from AssetManager
    For each format: call aiGateway with correct REPURPOSE.* prompt
    Save each result as new asset linked to source (parent_asset_id)
    Emit 'content.repurpose.completed'
    Return array of results

  - repurposeLongForm(content, platforms[], clientId?):
    Similar but takes raw content instead of assetId

`content/services/translationService.ts`:
  - translateAsset(assetId, targetLanguages[]): Promise<Asset[]>
    Fetch source → for each language → AI call → save as new asset
    New asset: parent_asset_id = sourceAssetId, language = targetLang
    Emit 'content.translation.completed'

  - getSupportedLanguages(): { code: string, name: string }[]
    Return hardcoded list of 20 most common languages

`content/services/templateService.ts`:
  - saveAsTemplate(assetId, name, category, isShared): Promise<ContentTemplate>
    Fetch asset + version → save as template record
  - createFromTemplate(templateId, overrideInputs): Promise<Asset>
    Load template → generate new content → save as new asset
  - listTemplates(category?, shared?): Promise<ContentTemplate[]>
  - cloneTemplate(id): Promise<ContentTemplate>
  - deleteTemplate(id): Promise<void>

`content/index.ts` (public API — services only):
  Export: generatorService functions, repurposerService functions,
          translationService functions, templateService functions
  Export types: GeneratedContent, ContentTemplate, RepurposeResult
  Register content service: serviceRegistry.registerService('content', contentServiceInstance)

===================================================================
PHASE 3 — NEW AGENCY TOOLS
Execute after Phase 2 is complete.
===================================================================

### PHASE 3A — Competitor Analyzer

Migration: `modules/marketing/migrations/003_competitors.sql`
  Table competitors: id, workspace_id, client_id, name, platform,
                     ad_library_url, notes, created_at

  Table competitor_analyses: id, workspace_id, client_id, competitor_id,
    ad_copy_input TEXT, analysis JSONB, counter_angles JSONB,
    generated_ad_id UUID REFERENCES assets(id),
    created_by, created_at

`marketing/services/competitorService.ts`:
  - analyzeCompetitorAd(adCopy, competitorName, ourProduct, clientId?)
    AI call: COMPETITOR.GAP_ANALYSIS
    Save result as asset (type: 'competitor_analysis')
    Return { analysis, gaps, counterAngles, assetId }

  - generateCounterAd(analysisAssetId, platform, clientId?)
    Fetch analysis from asset → AI call: COMPETITOR.COUNTER_ANGLE
    Save generated ad as new asset (type: 'ad_copy')
    Return { adCopy, assetId }

  - saveCompetitor(data): Promise<Competitor>
  - listCompetitors(clientId?): Promise<Competitor[]>
  - getCompetitorHistory(competitorId): Promise<CompetitorAnalysis[]>

`marketing/components/tools/CompetitorAnalyzer.tsx`:
  Step 1: Input competitor ad copy (textarea) + our product USP
  Step 2: "Analyze" button → show analysis cards:
    - Angles used (tags)
    - Weaknesses found (list)
    - Emotional triggers detected (tags)
    - Gap opportunities (highlighted list)
  Step 3: "Generate Counter-Ad" button + platform selector
    → shows generated counter-ad
    → "Save to Content Library" button

### PHASE 3B — Persona Builder

Migration: `modules/marketing/migrations/004_personas.sql`
  Table personas: id, workspace_id, client_id, name, age_range,
    job_title, pain_points TEXT[], goals TEXT[], objections TEXT[],
    preferred_channels TEXT[], language_style TEXT,
    buying_triggers TEXT[], metadata JSONB, created_by, created_at

`marketing/services/personaService.ts`:
  - generatePersona(inputs, clientId?): Promise<Persona>
    AI call: PERSONA.ICP_BUILDER
    Return structured Persona (not saved yet — user reviews first)
  - savePersona(persona): Promise<Persona>
    INSERT into personas
    Emit 'marketing.persona.created'
  - listPersonas(clientId?): Promise<Persona[]>
  - linkPersonaToCampaign(personaId, campaignId): Promise<void>
  - injectPersonaIntoInputs(personaId, inputs): Promise<Record<string, unknown>>
    Merges persona data into any AI inputs object

`marketing/components/tools/PersonaBuilder.tsx`:
  Step 1: Industry + Product + optional existing customer notes
  Step 2: "Generate ICP" → display structured persona card:
    - Demographics section
    - Pain Points (tag chips)
    - Goals (tag chips)
    - Objections (expandable list)
    - Buying Triggers (highlighted)
    - Preferred Channels (platform icons)
  Step 3: Edit fields inline before saving
  Step 4: "Save Persona" + "Generate Ad for this Persona" bridge button

### PHASE 3C — Landing Page Copywriter

`marketing/services/landingPageService.ts`:
  - generateAIDAPage(inputs, clientId?): Promise<LandingPageContent>
    4 sequential AI calls (one per section for quality)
    Returns: { attention, interest, desire, action }
  - generatePASPage(inputs, clientId?): Promise<LandingPageContent>
    3 AI calls
    Returns: { problem, agitation, solution, cta }
  - generateHeroSection(inputs, clientId?): Promise<HeroSection>
  - generateFAQSection(product, objections[], clientId?): Promise<FAQItem[]>
  - saveLandingPage(content, clientId?): Promise<Asset>
    Saves as structured asset with full page JSON in content

`marketing/components/tools/LandingPageWriter.tsx`:
  Framework selector: AIDA | PAS | Hero Only
  Input fields: product, persona selector (from saved personas),
                USP, primary CTA, pain points
  Output: Section-by-section preview cards
  Per section: edit inline + regenerate button
  Export options: Plain text | Copy per section | Save as Asset

### PHASE 3D — Client Approval Workflow

Extend AssetManager with client review functions (already defined in 1G).

New component: `core/components/ClientReviewPortal.tsx`
  Public page at route: /review/:token
  No authentication required
  Fetch asset via validateReviewToken()
  Display: asset content, version number, submitted by, date
  Actions:
  - "Approve" → calls transitionStatus('approved') via API
  - "Request Changes" → textarea required → calls transitionStatus('rejected')
  Show: "This review link expires {date}"
  After action: show thank you screen, token marked as used

New component: `marketing/components/content/ApprovalQueue.tsx`
  Shows all assets in 'internal_review' or 'client_review' state
  Per asset: content preview, current stage, time in stage, who submitted
  Urgency: yellow border > 24h, red border > 48h
  Actions per stage and role:
  - internal_review + reviewer role: Approve internally / Reject to draft
  - approved + manager role: Send for Client Review (generates token, sends email)
  - published: View live post link

===================================================================
PHASE 4 — CROSS-MODULE INTEGRATION
Execute after Phase 3 is complete.
===================================================================

### PHASE 4A — Context Bridge UI

`core/components/ClientSwitcher.tsx`:
  Dropdown in global navigation bar
  Shows all clients for current workspace
  On select: calls ContextBridge.setActiveClient()
  Shows active client name + logo
  Shows "No client selected" state with prompt to select

`core/components/ProjectSwitcher.tsx`:
  Filtered by active client
  On select: calls ContextBridge.setActiveProject()

Wire context into all module forms:
  Every form that has a clientId field:
  const { activeClient } = useGlobalContext()
  useEffect(() => {
    if (activeClient) form.setValue('clientId', activeClient.id)
  }, [activeClient])

### PHASE 4B — Bridge Routes

Implement these one-click cross-module navigation flows:

1. Business Plan → Marketing Plan:
   Button on business plan completion screen
   onClick: navigate('/marketing/campaigns/new', { state: { fromPlan: planData } })
   CampaignPlanner reads location.state and pre-fills fields

2. Persona → Ad Copy:
   Button on PersonaBuilder output: "Generate Ad for this Persona"
   onClick: navigate('/marketing/tools/ad-copy', { state: { persona } })
   AdCopyCreator reads persona from location.state

3. Approved Asset → Social Publish:
   Button on approved asset in ContentLibrary: "Schedule for Social"
   onClick: navigate('/social/publisher/new', { state: { asset } })
   PostComposer reads asset content from location.state

4. Support Complaint → Strategy:
   Automated via EventRouter (not manual navigation)
   High-frequency complaint topics surfaced in strategy dashboard

### PHASE 4C — Unified Dashboard

`core/components/Dashboard.tsx`:
  Context-aware: re-renders when activeClient changes
  Layout: 3-column grid of widgets

  Widgets (each is a separate component):
  - `RecentAssetsWidget`: last 5 assets, filterable by status
  - `PendingApprovalsWidget`: assets awaiting action by current user
  - `ActiveCampaignsWidget`: campaigns with status + budget progress bar
  - `PublishedPostsWidget`: last 7 days social performance summary
  - `LeadsPipelineWidget`: count by status stage
  - `EventStoreHealthWidget`: pending/failed event counts (admin only)
  - `BrandVoiceWidget`: active brand voice for selected client (quick view)

  Each widget:
  - Has loading skeleton
  - Has empty state
  - Has "View All" link to relevant module
  - Only renders if its module is installed (check moduleRegistry)

===================================================================
PHASE 5 — QUALITY & SECURITY AUDIT
Execute last — do not skip any item.
===================================================================

Perform a systematic audit of EVERY file created in Phases 1-4.

Security:
- [ ] Confirm every Supabase table has RLS enabled
- [ ] Confirm every RLS policy includes workspace_id scoping
- [ ] Confirm no API keys exist in any client-side file
- [ ] Confirm Supabase Vault used for all sensitive tokens
- [ ] Confirm all webhook endpoints validate x-erp-secret header
- [ ] Confirm all AI prompts sanitize user inputs before interpolation
- [ ] Confirm audit_log has no UPDATE or DELETE policy

Architecture:
- [ ] Confirm zero direct cross-module imports exist
- [ ] Confirm content module exports zero React components
- [ ] Confirm all AI calls go through aiGateway only
- [ ] Confirm all asset operations go through AssetManager only
- [ ] Confirm RBAC enforced in service layer (not just UI)
- [ ] Confirm EventBus writes to DB before dispatching

Performance:
- [ ] Confirm all list queries paginated (limit 20)
- [ ] Confirm BrandVoiceInjector cache implemented (5 min TTL)
- [ ] Confirm PermissionService cache implemented (2 min TTL)
- [ ] Confirm all FK columns have indexes
- [ ] Confirm React Query used for all data fetching

UX Standards:
- [ ] Every list: loading skeleton + empty state + pagination
- [ ] Every form: Zod validation + field errors + disabled on submit
- [ ] Every async op: loading indicator
- [ ] Every delete: confirmation dialog
- [ ] Every approval action: comment field
- [ ] Every mutation: success toast + error toast

TypeScript:
- [ ] Zero `any` types in core/ directory
- [ ] Zero `any` types in service files
- [ ] All exported functions have JSDoc
- [ ] All service files export their types at top of file

===================================================================
HOW TO WORK
===================================================================

1. Start with Phase 1A. List all files you will write. Then write them.
2. Write ONE complete file at a time. No partial files.
3. After each file: state its name and confirm it is complete.
4. After each sub-phase (1A, 1B, etc.): confirm all files done,
   state any import changes needed in existing files.
5. After each full phase: write "✅ Phase X complete — ready for Phase X+1"
6. If a file exceeds 400 lines: write "Continuing [filename] Part 2..." immediately.
7. If you need to see an existing file before refactoring it: ask for it.
8. If a design decision has multiple valid approaches: pick one and state why.
9. Never ask "should I proceed?" — always proceed to the next file.

===================================================================
BEGIN
===================================================================

Start with Phase 1A.
List every SQL file you will write.
Then write them one by one, completely.
```