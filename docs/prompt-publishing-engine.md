# 🤖 Execution Prompt — Social Media Publishing System

---

```
You are a senior full-stack engineer implementing a Social Media Content Publishing 
system inside an existing Odoo-like ERP application.

## TECH STACK (non-negotiable, do not suggest alternatives)
- Frontend: React + TypeScript
- Backend/DB: Supabase (PostgreSQL + RLS + Edge Functions + Storage + Vault + pg_cron)
- AI: Google Gemini API (via existing lib/gemini.ts)
- Workflow Automation: n8n (self-hosted)
- Validation: Zod
- Event System: internal eventBus

## SINGLE-TENANT CONTEXT (critical)
This app is downloaded and installed by ONE company.
- NO org_id in any table
- NO multi-tenancy logic
- RLS is still required but scoped to auth.uid() only
- Every user belongs to the same organization by definition

---

## ABSOLUTE RULES (never break these)

1. ZERO plain-text OAuth tokens stored in the database.
   ALL tokens go through Supabase Vault.
   Store only the vault_secret_id reference in social_accounts table.

2. ZERO direct Gemini API calls from the frontend or from n8n.
   ALL AI calls go through the Supabase Edge Function `/functions/v1/marketing-ai`.

3. ZERO business logic in React components.
   Components call service functions from `social/index.ts` only.

4. Every publish job MUST have an idempotency_key.
   Format: `${ai_post_id}:${social_account_id}:${scheduled_for_iso}`
   Use upsert with onConflict: 'idempotency_key' + ignoreDuplicates: true.

5. Error classification is MANDATORY before any retry.
   Never retry blindly. Classify first:
   - 'rate_limit'  → reschedule after window reset
   - 'auth'        → trigger token refresh, then retry once
   - 'platform'    → retry with exponential backoff (max 3)
   - 'network'     → retry immediately once
   - 'fatal'       → set status = 'dead', alert admin, do NOT retry

6. Every new Supabase table MUST have RLS enabled.
   Policy pattern: USING (created_by = auth.uid())
   Exception: publish_jobs and post_analytics use service_role key only
   (called from Edge Functions and n8n, never from client).

7. Supabase Vault MUST be used for token storage.
   Use vault.create_secret() to store, vault.decrypted_secrets() to retrieve.
   Never log, expose, or return raw tokens to the frontend.

8. All form inputs and service function inputs MUST be validated with Zod
   before any database write or API call.

9. Complete files only. No placeholders, no "// TODO", no "// implement later".

10. Work ONE phase at a time. State completion explicitly before moving to next phase.

---

## TARGET FOLDER STRUCTURE

Implement exactly this. Do not add or remove files unless explicitly instructed:

social/
├── manifest.ts
├── index.ts                          ← public API only
├── constants/
│   └── platforms.ts                  ← rate limits, scopes, API endpoints per platform
├── services/
│   ├── accountService.ts             ← OAuth connect, token store/retrieve via Vault
│   ├── publisherService.ts           ← create/manage publish jobs
│   ├── approvalService.ts            ← approval workflow, escalation logic
│   ├── analyticsService.ts           ← fetch + store post analytics
│   └── rateLimitService.ts           ← track and enforce rate limit windows
├── events/
│   ├── emitters.ts
│   └── listeners.ts
├── migrations/
│   ├── 001_social_accounts.sql
│   ├── 002_ai_posts.sql
│   ├── 003_publish_jobs.sql
│   ├── 004_approval_events.sql
│   └── 005_post_analytics.sql
├── components/
│   ├── accounts/
│   │   └── SocialAccountsManager.tsx ← connect/disconnect OAuth accounts
│   ├── publisher/
│   │   ├── PostComposer.tsx           ← create + edit ai_post drafts
│   │   ├── ApprovalQueue.tsx          ← review, approve, reject posts
│   │   ├── PublishCalendar.tsx        ← monthly calendar of scheduled posts
│   │   └── PublishJobMonitor.tsx      ← real-time status of publish jobs
│   └── analytics/
│       └── PostAnalyticsDashboard.tsx ← per-post and aggregate analytics
└── supabase/
    ├── functions/
    │   ├── marketing-ai/
    │   │   └── index.ts               ← Gemini proxy (already exists, extend it)
    │   ├── token-refresh/
    │   │   └── index.ts               ← refresh OAuth tokens server-side
    │   └── analytics-fetch/
    │       └── index.ts               ← poll platform analytics APIs
    └── pg_cron/
        └── scheduler.sql              ← pg_cron jobs for scheduling + analytics polling

---

## PHASE INSTRUCTIONS

Work through phases in strict order.
At the end of each phase write: "✅ Phase X complete — ready for Phase X+1."
If a file exceeds ~400 lines, write "Continuing [filename]..." and resume.

===================================================================
PHASE 0 — SCAFFOLD & MANIFEST
===================================================================

Tasks:
1. Create all folders and empty placeholder files matching the structure above.

2. Write `social/manifest.ts` with this exact shape:

   export const manifest = {
     id: 'social',
     name: 'Social Media Publisher',
     version: '1.0.0',
     dependencies: ['marketing'],
     migrations: [
       '001_social_accounts.sql',
       '002_ai_posts.sql',
       '003_publish_jobs.sql',
       '004_approval_events.sql',
       '005_post_analytics.sql',
     ],
     events: {
       emits: [
         'social.post.draft.created',
         'social.post.submitted',
         'social.post.approved',
         'social.post.rejected',
         'social.post.approval.expired',
         'social.post.scheduled',
         'social.post.published',
         'social.post.publish.failed',
         'social.post.publish.dead',
         'social.token.refreshed',
         'social.token.expired',
         'social.token.revoked',
         'social.analytics.fetched',
       ],
       listens: [
         'marketing.asset.published',
         'marketing.campaign.ended',
       ],
     },
   }

3. Write `social/constants/platforms.ts`:

   Define a PLATFORMS config object with an entry for each platform.
   Each entry must include:
   - apiBaseUrl: string
   - authUrl: string
   - tokenUrl: string
   - scopes: string[]
   - rateLimits: {
       postsPerDay: number,
       postsPerHour: number,
       apiCallsPerDay: number,
     }
   - mediaConstraints: {
       maxImageSizeMb: number,
       maxVideoSizeMb: number,
       supportedImageFormats: string[],
       supportedVideoFormats: string[],
       maxCaptionLength: number,
     }
   - supportsScheduling: boolean
   - requiresBusinessAccount: boolean
   - freeApiAvailable: boolean
   - notes: string        ← important caveats (e.g. X is not free for writes)

   Implement entries for:
   - linkedin   (Pages API, free, OAuth2, 150-char headline, partner API note)
   - facebook   (Graph API v18, free, Page permissions required)
   - instagram  (Content Publishing API, requires Facebook Business, Reels separate)
   - x          (freeApiAvailable: false, write requires $100/month Basic tier, notes: 'skip for MVP')
   - tiktok     (developer API, freeApiAvailable: true, notes: 'complex review process')
   - youtube    (Data API v3, free quota: 10,000 units/day, notes: 'video only')

===================================================================
PHASE 1 — DATABASE MIGRATIONS
===================================================================

Write all 5 SQL files. Each file MUST contain:
- UP migration (CREATE TABLE)
- DOWN migration (DROP TABLE) at the bottom as a comment block
- RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY
- RLS policies using auth.uid()
- Indexes on all foreign keys and filtered columns
- Enum types defined with CREATE TYPE before the table

`001_social_accounts.sql`:
  CREATE TYPE social_platform AS ENUM (
    'linkedin','facebook','instagram','x','tiktok','youtube'
  );
  CREATE TYPE account_status AS ENUM ('active','expired','revoked','error');

  social_accounts:
    id                UUID PK
    platform          social_platform NOT NULL
    account_name      TEXT NOT NULL
    account_id        TEXT NOT NULL              -- platform internal ID
    vault_access_id   TEXT NOT NULL              -- Supabase Vault secret ID
    vault_refresh_id  TEXT                       -- Supabase Vault secret ID
    token_expires_at  TIMESTAMPTZ
    scopes            TEXT[]
    status            account_status DEFAULT 'active'
    connected_by      UUID REFERENCES auth.users(id)
    last_used_at      TIMESTAMPTZ
    created_at        TIMESTAMPTZ DEFAULT NOW()
    updated_at        TIMESTAMPTZ DEFAULT NOW()
    UNIQUE(platform, account_id)

  RLS: all operations require auth.uid() IS NOT NULL (any authenticated user can read)
  Admin-only writes: enforce via app-level role check, not RLS
  Indexes: platform, status

`002_ai_posts.sql`:
  CREATE TYPE post_status AS ENUM (
    'draft','in_review','approved','rejected',
    'scheduled','published','archived'
  );

  ai_posts:
    id                  UUID PK
    campaign_id         UUID REFERENCES campaigns(id) ON DELETE SET NULL
    platform            social_platform NOT NULL
    prompt_key          TEXT NOT NULL
    prompt_inputs       JSONB NOT NULL
    generated_content   TEXT NOT NULL
    hashtags            TEXT[]
    media_urls          TEXT[]           -- Supabase Storage public URLs
    status              post_status DEFAULT 'draft'
    rejection_reason    TEXT
    approved_by         UUID REFERENCES auth.users(id)
    approved_at         TIMESTAMPTZ
    scheduled_for       TIMESTAMPTZ
    created_by          UUID REFERENCES auth.users(id) NOT NULL
    created_at          TIMESTAMPTZ DEFAULT NOW()
    updated_at          TIMESTAMPTZ DEFAULT NOW()

  RLS:
    SELECT: auth.uid() IS NOT NULL
    INSERT: auth.uid() IS NOT NULL
    UPDATE: created_by = auth.uid() OR role-based (handle in service layer)
    DELETE: created_by = auth.uid()
  Indexes: status, platform, campaign_id, scheduled_for, created_by

`003_publish_jobs.sql`:
  CREATE TYPE job_status AS ENUM (
    'pending','in_progress','published','failed','retrying','dead'
  );
  CREATE TYPE error_code AS ENUM (
    'rate_limit','auth','platform','network','fatal'
  );

  publish_jobs:
    id                  UUID PK
    ai_post_id          UUID NOT NULL REFERENCES ai_posts(id) ON DELETE CASCADE
    social_account_id   UUID NOT NULL REFERENCES social_accounts(id)
    platform            social_platform NOT NULL
    status              job_status DEFAULT 'pending'
    idempotency_key     TEXT UNIQUE NOT NULL
    external_post_id    TEXT
    published_at        TIMESTAMPTZ
    retry_count         INT DEFAULT 0
    max_retries         INT DEFAULT 3
    next_retry_at       TIMESTAMPTZ
    last_error          TEXT
    error_code          error_code
    n8n_execution_id    TEXT
    created_at          TIMESTAMPTZ DEFAULT NOW()
    updated_at          TIMESTAMPTZ DEFAULT NOW()

  RLS: service_role only (this table is NEVER accessed from client)
  Add comment: "-- This table is accessed exclusively via Edge Functions and n8n"
  Indexes: status, ai_post_id, next_retry_at, idempotency_key

`004_approval_events.sql`:
  CREATE TYPE approval_action AS ENUM (
    'submitted','approved','rejected','escalated','expired'
  );

  approval_events:
    id          UUID PK
    ai_post_id  UUID NOT NULL REFERENCES ai_posts(id) ON DELETE CASCADE
    actor_id    UUID NOT NULL REFERENCES auth.users(id)
    action      approval_action NOT NULL
    comment     TEXT
    created_at  TIMESTAMPTZ DEFAULT NOW()

  RLS: SELECT auth.uid() IS NOT NULL, INSERT auth.uid() IS NOT NULL
  Indexes: ai_post_id, actor_id, action

`005_post_analytics.sql`:
  platform_rate_limits:
    id                  UUID PK
    social_account_id   UUID REFERENCES social_accounts(id)
    window_start        TIMESTAMPTZ NOT NULL
    window_end          TIMESTAMPTZ NOT NULL
    posts_sent          INT DEFAULT 0
    posts_limit         INT NOT NULL
    api_calls_made      INT DEFAULT 0
    api_calls_limit     INT NOT NULL

  post_analytics:
    id                  UUID PK
    publish_job_id      UUID NOT NULL REFERENCES publish_jobs(id)
    fetched_at          TIMESTAMPTZ DEFAULT NOW()
    impressions         INT DEFAULT 0
    reach               INT DEFAULT 0
    likes               INT DEFAULT 0
    comments            INT DEFAULT 0
    shares              INT DEFAULT 0
    clicks              INT DEFAULT 0
    engagement_rate     NUMERIC(5,2)
    raw_data            JSONB

  RLS: SELECT auth.uid() IS NOT NULL, INSERT/UPDATE service_role only
  Indexes: publish_job_id, fetched_at

===================================================================
PHASE 2 — SUPABASE EDGE FUNCTIONS
===================================================================

Write 3 Edge Functions. Each must:
- Use Deno + TypeScript
- Import from 'https://deno.land/x/...' (Deno-compatible packages only)
- Read secrets from Deno.env.get() — never hardcode
- Return proper HTTP responses with status codes
- Handle CORS headers
- Validate request body with Zod before processing

`supabase/functions/marketing-ai/index.ts` (EXTEND existing):
  This function already exists. Extend it to handle these promptKeys:
  - 'POST.LINKEDIN', 'POST.INSTAGRAM', 'POST.FACEBOOK',
    'POST.TIKTOK', 'POST.YOUTUBE'
  - 'AD_COPY.GOOGLE', 'AD_COPY.META'
  - 'PRODUCT_DESC.ECOMMERCE', 'PRODUCT_DESC.B2B'
  - 'SALES_SCRIPT.COLD_CALL', 'SALES_SCRIPT.OBJECTION', 'SALES_SCRIPT.CLOSING'
  - 'EMAIL.SUBJECT', 'EMAIL.BODY'
  - 'CAMPAIGN_PLAN', 'CTA_SUGGESTIONS'

  Request shape: { promptKey: string, inputs: Record<string, unknown> }
  Response shape: { content: string, usage: { tokens: number } }

  Gemini call requirements:
  - Model: gemini-1.5-flash (free tier)
  - Temperature: 0.7 for creative, 0.3 for structured (plan/script)
  - Tell Gemini to return valid JSON in every prompt
  - Parse and validate the JSON before returning
  - On parse failure: retry once with a stricter prompt suffix

`supabase/functions/token-refresh/index.ts` (NEW):
  Purpose: refresh expired OAuth tokens server-side

  Flow:
  1. Receive { social_account_id: string }
  2. Fetch social_account record from DB
  3. Retrieve refresh_token from Vault using vault_refresh_id
  4. Call the correct platform token endpoint based on platform
  5. Store new access_token in Vault (update existing secret)
  6. Update token_expires_at in social_accounts
  7. Emit social.token.refreshed event via eventBus
  8. On failure: update status = 'error', emit social.token.expired

  Implement token refresh for:
  - LinkedIn: POST https://www.linkedin.com/oauth/v2/accessToken
  - Facebook/Instagram: GET https://graph.facebook.com/oauth/access_token
    (long-lived tokens, refresh every 60 days)
  - Generic fallback: log error, set status = 'expired'

`supabase/functions/analytics-fetch/index.ts` (NEW):
  Purpose: poll platform APIs for post performance metrics

  Flow:
  1. Receive { publish_job_id: string }
  2. Fetch publish_job → get external_post_id, social_account_id, platform
  3. Retrieve access_token from Vault
  4. Call correct analytics endpoint per platform:
     - LinkedIn: GET /v2/organizationalEntityShareStatistics
     - Facebook: GET /{post_id}/insights
     - Instagram: GET /{media_id}/insights
  5. Map response to post_analytics schema
  6. Calculate engagement_rate = ((likes+comments+shares) / reach) * 100
  7. Insert into post_analytics, store raw_data
  8. Emit social.analytics.fetched

  On auth error: trigger token-refresh function, retry once
  On any other error: log to publish_jobs.last_error, do not crash

===================================================================
PHASE 3 — SERVICES
===================================================================

Implement services in this order:
rateLimitService → accountService → approvalService → publisherService → analyticsService

For each service:
- Export TypeScript interfaces/types at the top
- Zod schema for every function that writes to DB
- Try/catch on every async operation
- Return { data, error } pattern (never throw)
- JSDoc on every exported function

`services/rateLimitService.ts`:
  Types: RateLimitWindow, RateLimitCheck

  Functions:
  - checkRateLimit(socialAccountId, platform):
      Promise<{ allowed: boolean, resetAt: Date | null, remaining: number }>
    → Query platform_rate_limits for current window
    → Compare posts_sent against PLATFORMS[platform].rateLimits.postsPerDay
    → Return whether posting is currently allowed

  - recordPost(socialAccountId, platform): Promise<void>
    → Increment posts_sent in current window
    → Create new window record if none exists for today

  - getCurrentWindow(socialAccountId): Promise<RateLimitWindow | null>
    → Return active rate limit window for account

  - getRateLimitStatus(socialAccountId): Promise<RateLimitStatus>
    → Return full status object for UI display

`services/accountService.ts`:
  Types: SocialAccount, ConnectAccountInput, OAuthCallbackInput

  Functions:
  - listAccounts(): Promise<SocialAccount[]>
    → Fetch all social_accounts
    → NEVER return vault_access_id or vault_refresh_id to the caller
    → Return sanitized account objects (mask token references)

  - connectAccount(input: ConnectAccountInput): Promise<{ authUrl: string }>
    → Generate OAuth authorization URL for the given platform
    → Use PLATFORMS[platform].authUrl + scopes + redirect_uri
    → Store a temporary state token in DB for CSRF protection

  - handleOAuthCallback(input: OAuthCallbackInput): Promise<SocialAccount>
    → Validate state token (CSRF check)
    → Exchange code for access_token + refresh_token
    → Store tokens in Supabase Vault using vault.create_secret()
    → Store only vault_access_id and vault_refresh_id in social_accounts
    → Return sanitized SocialAccount (no token data)

  - disconnectAccount(id: string): Promise<void>
    → Delete secrets from Vault
    → Set account status = 'revoked'
    → Emit social.token.revoked

  - refreshToken(id: string): Promise<void>
    → Call token-refresh Edge Function
    → Do not handle token logic here (Edge Function owns it)

  - getAccountStatus(id: string): Promise<AccountStatusReport>
    → Return { status, tokenExpiresAt, lastUsedAt, rateLimitStatus }

`services/approvalService.ts`:
  Types: AiPost, ApprovalEvent, SubmitPostInput, ReviewPostInput

  Functions:
  - createDraft(input: SubmitPostInput): Promise<AiPost>
    → Validate input with Zod
    → Call marketing-ai Edge Function to generate content
    → Insert into ai_posts with status = 'draft'
    → Emit social.post.draft.created

  - submitForReview(postId: string): Promise<AiPost>
    → Validate post exists and status === 'draft'
    → Update status = 'in_review'
    → Insert approval_event: action = 'submitted'
    → Emit social.post.submitted
    → Schedule escalation: if not reviewed in 48h, auto-escalate
      (use pg_cron or store escalation_due_at on the record)

  - approvePost(postId: string, approverId: string): Promise<AiPost>
    → Validate status === 'in_review'
    → Update status = 'approved', approved_by, approved_at
    → Insert approval_event: action = 'approved'
    → Emit social.post.approved

  - rejectPost(postId: string, actorId: string, reason: string): Promise<AiPost>
    → Validate status === 'in_review'
    → Update status = 'rejected', rejection_reason
    → Insert approval_event: action = 'rejected'
    → Emit social.post.rejected

  - escalatePost(postId: string): Promise<AiPost>
    → Update status = 'in_review' (stays in review, escalated to manager)
    → Insert approval_event: action = 'escalated'
    → Emit social.post.approval.expired (triggers manager notification)

  - schedulePost(postId: string, scheduledFor: Date, socialAccountId: string):
      Promise<AiPost>
    → Validate status === 'approved'
    → Validate scheduledFor is in the future
    → Check rateLimitService.checkRateLimit() before accepting
    → Update ai_posts: status = 'scheduled', scheduled_for
    → Call publisherService.createPublishJob()
    → Emit social.post.scheduled

  - listPosts(filters?: PostFilters): Promise<AiPost[]>
    → Paginated (limit 20)
    → Filterable by: status, platform, campaign_id, created_by, date range

  - getPost(id: string): Promise<AiPost>

`services/publisherService.ts`:
  Types: PublishJob, CreatePublishJobInput

  Functions:
  - createPublishJob(input: CreatePublishJobInput): Promise<PublishJob>
    → Build idempotency_key: `${ai_post_id}:${social_account_id}:${scheduled_for}`
    → Upsert with onConflict: 'idempotency_key', ignoreDuplicates: true
    → Return existing job if duplicate (idempotent)

  - listPublishJobs(filters?: JobFilters): Promise<PublishJob[]>
    → Filterable by: status, platform, date range
    → Paginated

  - getPublishJob(id: string): Promise<PublishJob>

  - retryJob(id: string): Promise<PublishJob>
    → Validate status === 'failed' AND retry_count < max_retries
    → Reset status = 'pending', increment retry_count
    → Update next_retry_at (exponential backoff: 2^retry_count minutes)
    → Notify n8n via webhook

  - markDead(id: string, reason: string): Promise<PublishJob>
    → Set status = 'dead', last_error = reason
    → Emit social.post.publish.dead
    → Insert admin notification (internal event)

  - notifyN8n(publishJobId: string): Promise<void>
    → POST to n8n webhook URL (stored in env: N8N_WEBHOOK_URL)
    → Payload: { publish_job_id, ai_post_id, platform, social_account_id }
    → Do not await response (fire and forget with timeout)

`services/analyticsService.ts`:
  Types: PostAnalytics, AnalyticsSummary, ChannelBreakdown

  Functions:
  - getPostAnalytics(publishJobId: string): Promise<PostAnalytics[]>
    → Return all analytics snapshots for a publish job (history)

  - getLatestAnalytics(publishJobId: string): Promise<PostAnalytics | null>
    → Return most recent analytics record

  - getSummaryByPlatform(): Promise<ChannelBreakdown[]>
    → Aggregate post_analytics grouped by platform
    → Return { platform, totalPosts, avgEngagementRate, totalReach, totalClicks }

  - getCampaignPostAnalytics(campaignId: string): Promise<AnalyticsSummary>
    → Join ai_posts → publish_jobs → post_analytics
    → Return aggregated metrics for all posts in a campaign

  - triggerAnalyticsFetch(publishJobId: string): Promise<void>
    → Call analytics-fetch Edge Function
    → Used manually or by pg_cron scheduler

===================================================================
PHASE 4 — EVENTS
===================================================================

`events/emitters.ts`:
  Define TypeScript payload types for ALL events listed in manifest.ts.
  Implement one typed emitter function per event.
  All emitters import from the core eventBus.
  Export all emitter functions.

  Events and their payload types:
  - social.post.draft.created     → payload: AiPost
  - social.post.submitted         → payload: AiPost
  - social.post.approved          → payload: AiPost & { approver_id: string }
  - social.post.rejected          → payload: AiPost & { reason: string }
  - social.post.approval.expired  → payload: AiPost
  - social.post.scheduled         → payload: AiPost & { scheduled_for: string }
  - social.post.published         → payload: PublishJob & { external_post_id: string }
  - social.post.publish.failed    → payload: PublishJob & { error: string, error_code: string }
  - social.post.publish.dead      → payload: PublishJob
  - social.token.refreshed        → payload: { account_id: string, platform: string }
  - social.token.expired          → payload: { account_id: string, platform: string }
  - social.token.revoked          → payload: { account_id: string, platform: string }
  - social.analytics.fetched      → payload: PostAnalytics

`events/listeners.ts`:
  Export: initSocialListeners() — called once at app startup

  Implement listeners for:

  'marketing.asset.published':
    → If asset.type === 'post' and asset.platform is set:
      Auto-create ai_post draft from asset content
      Call approvalService.createDraft()

  'marketing.campaign.ended':
    → For all published posts linked to campaign:
      Trigger analytics fetch for each
      Call analyticsService.triggerAnalyticsFetch() per publish_job

===================================================================
PHASE 5 — n8n WORKFLOW SPECIFICATION
===================================================================

Write a complete n8n workflow specification as a JSON file:
`social/n8n/publish-workflow.json`

This is a real importable n8n workflow. Implement these nodes in order:

Node 1 — Webhook Trigger
  - Method: POST
  - Path: /social-publish
  - Authentication: Header Auth (X-ERP-Secret header)
  - Response: immediately (async processing)

Node 2 — Validate & Parse
  - Function node
  - Extract: publish_job_id, ai_post_id, platform, social_account_id
  - Validate all fields are present
  - On missing fields: respond with error, stop workflow

Node 3 — Idempotency Check
  - HTTP Request to Supabase REST API
  - GET publish_jobs where idempotency_key matches AND status = 'published'
  - If already published: stop workflow (success, no duplicate)

Node 4 — Rate Limit Check
  - HTTP Request to Supabase REST API
  - GET platform_rate_limits for current window
  - If rate limited: wait until window_end, then continue
  - Use n8n Wait node with resume URL

Node 5 — Fetch Token (via Edge Function)
  - HTTP Request to Supabase Edge Function: /functions/v1/token-refresh
  - Request: { social_account_id }
  - Response: { access_token } (decrypted, in-memory only, not stored)
  - On auth error: set publish_job status = 'dead', stop

Node 6 — Fetch Post Content
  - HTTP Request to Supabase REST API
  - GET ai_posts where id = ai_post_id
  - Extract: generated_content, hashtags, media_urls, platform

Node 7 — Platform Router
  - Switch node branching on platform:
    → 'linkedin'   → Node 8a
    → 'facebook'   → Node 8b
    → 'instagram'  → Node 8c
    → default      → Error node

Node 8a — LinkedIn Publish
  - HTTP Request: POST https://api.linkedin.com/v2/ugcPosts
  - Headers: Authorization Bearer {access_token}
  - Body: LinkedIn UGC post format (author, lifecycleState, shareCommentary, etc.)
  - Capture response: id field as external_post_id

Node 8b — Facebook Publish
  - HTTP Request: POST https://graph.facebook.com/v18.0/{page_id}/feed
  - Body: { message, access_token }
  - Capture response: id as external_post_id

Node 8c — Instagram Publish
  - Two-step: first create media container, then publish
  - Step 1: POST /v18.0/{ig_user_id}/media
  - Step 2: POST /v18.0/{ig_user_id}/media_publish
  - Capture response: id as external_post_id

Node 9 — Error Classifier
  - Function node connected to error outputs of Nodes 8a/8b/8c
  - Classify error from HTTP status code and response body:
    - 429 → 'rate_limit'
    - 401 / 403 → 'auth'
    - 400 → 'fatal' (bad request, do not retry)
    - 500 / 502 / 503 → 'platform'
    - Network timeout → 'network'

Node 10 — Error Handler
  - Switch on error_code from Node 9:
    - 'rate_limit': Wait node (wait until rate window resets), then go to Node 8
    - 'auth': HTTP Request to token-refresh Edge Function, then retry Node 8 ONCE
    - 'platform': increment retry_count, if < max_retries: Wait(2^n minutes), retry
    - 'network': retry immediately once, then classify as 'platform' if fails again
    - 'fatal': go to Node 11 (mark dead)

Node 11 — Mark Dead
  - HTTP Request PATCH publish_jobs set status = 'dead', last_error, error_code
  - HTTP Request POST to internal notification endpoint (alert admin)

Node 12 — Mark Published
  - HTTP Request PATCH publish_jobs:
    status = 'published', external_post_id, published_at = NOW()
  - HTTP Request PATCH ai_posts: status = 'published'
  - HTTP Request to rateLimitService: record post sent

Node 13 — Schedule Analytics Fetch
  - Wait node: wait 24 hours
  - HTTP Request to Supabase Edge Function: /functions/v1/analytics-fetch
  - Body: { publish_job_id }
  - After first fetch: wait 48 more hours, fetch again (for trend data)

===================================================================
PHASE 6 — pg_cron SCHEDULER
===================================================================

Write `social/supabase/pg_cron/scheduler.sql`:

Job 1 — Publish Scheduler (runs every minute)
  Purpose: find approved+scheduled posts due for publishing, create publish jobs,
           notify n8n
  Logic:
  - SELECT ai_posts WHERE status = 'scheduled' AND scheduled_for <= NOW()
  - For each: call publisherService equivalent in SQL (insert publish_job if not exists)
  - Call pg_net.http_post to N8N_WEBHOOK_URL with publish_job_id
  - Update ai_posts.status = 'in_progress'

Job 2 — Approval Escalation (runs every hour)
  Purpose: escalate posts stuck in review for > 48 hours
  Logic:
  - SELECT ai_posts WHERE status = 'in_review'
    AND updated_at < NOW() - INTERVAL '48 hours'
  - For each: insert approval_event action = 'escalated'
  - Call pg_net.http_post to internal notification endpoint

Job 3 — Token Expiry Check (runs every 6 hours)
  Purpose: proactively refresh tokens expiring within 24 hours
  Logic:
  - SELECT social_accounts WHERE status = 'active'
    AND token_expires_at < NOW() + INTERVAL '24 hours'
  - For each: call pg_net.http_post to token-refresh Edge Function

Job 4 — Analytics Polling (runs every day at 09:00 UTC)
  Purpose: refresh analytics for posts published in last 30 days
  Logic:
  - SELECT publish_jobs WHERE status = 'published'
    AND published_at > NOW() - INTERVAL '30 days'
  - For each: call pg_net.http_post to analytics-fetch Edge Function

===================================================================
PHASE 7 — COMPONENTS
===================================================================

For EVERY component:
- Import ONLY from `../index.ts` or `../../social/index.ts`
- Zero business logic — components only call service functions and render
- Every async operation: loading skeleton, error state, success feedback
- Every list: empty state with actionable CTA, pagination (20 per page)
- Every form: Zod client-side validation, field-level errors
- Every delete/disconnect: confirmation dialog
- Success/error toasts on all mutations

`components/accounts/SocialAccountsManager.tsx`:
  Display:
  - List of connected accounts: platform icon, account name,
    status badge (active/expired/revoked), token expiry countdown,
    rate limit usage bar (posts sent today / daily limit)
  - "Connect Account" button per platform from PLATFORMS config
  - Only show platforms where freeApiAvailable === true (or with warning badge)

  Actions:
  - Connect: open OAuth flow → accountService.connectAccount()
  - Disconnect: confirmation dialog → accountService.disconnectAccount()
  - Refresh Token: manual trigger → accountService.refreshToken()
  - View Status: expand card showing full AccountStatusReport

  Real-time:
  - Subscribe to Supabase realtime on social_accounts table
  - Update status badge live when token refreshes or expires

`components/publisher/PostComposer.tsx`:
  Step 1 — Setup:
  - Platform selector (only connected + active accounts)
  - Campaign linker (optional, from campaignService)
  - Tone selector: professional / casual / inspirational / educational

  Step 2 — Generate:
  - Input fields vary by platform:
    LinkedIn: topic, key message, CTA, target audience
    Facebook/Instagram: topic, tone, hashtag count
  - "Generate with AI" button → approvalService.createDraft()
  - Show generated content in editable textarea (user can edit before saving)
  - Character counter with platform limit indicator
    (LinkedIn: 3000, Facebook: 63,206, Instagram: 2200)
  - Hashtag display (chips, removable)
  - Media upload (drag-drop, validate against PLATFORMS[platform].mediaConstraints)

  Step 3 — Save & Submit:
  - "Save Draft" → save without submitting
  - "Submit for Review" → approvalService.submitForReview()
  - Show confirmation with estimated review time

`components/publisher/ApprovalQueue.tsx`:
  Display:
  - Tabbed view: "Pending Review" | "Approved" | "Rejected" | "All"
  - Post cards showing: platform badge, content preview (truncated 150 chars),
    submitted by, submitted at, time in review countdown
  - Visual urgency: highlight posts in review > 24h (yellow), > 48h (red)

  Actions:
  - Approve: confirm dialog → approvalService.approvePost()
  - Reject: rejection reason modal (required) → approvalService.rejectPost()
  - Schedule (after approve): datetime picker + account selector
    → approvalService.schedulePost()
  - View full post: expand modal with complete content + media preview

  Role enforcement:
  - Only show Approve/Reject buttons if current user has 'reviewer' or 'manager' role
  - Show "Awaiting Review" badge for marketers viewing their own posts

`components/publisher/PublishCalendar.tsx`:
  Display:
  - Monthly calendar grid view
  - Each scheduled post: platform-colored dot with hover card
  - Hover card: platform icon, content preview, account, status badge

  Interactions:
  - Click date: show list of posts for that date
  - Click post: open detail modal
  - Drag post to reschedule (update scheduled_for via approvalService)
  - Filter by platform (toggle buttons per platform)

  Legend: color coding by platform + status (scheduled vs. published vs. failed)

`components/publisher/PublishJobMonitor.tsx`:
  Display:
  - Real-time list of publish jobs (Supabase realtime subscription)
  - Per job: platform icon, post preview, status badge with animation,
    retry count, last error (expandable), n8n execution link
  - Status badge animations:
    pending → pulsing gray
    in_progress → spinning blue
    published → solid green
    failed → solid red with retry count
    dead → solid black with alert icon

  Actions:
  - Manual retry: publisherService.retryJob() (only for failed, retry_count < max)
  - View error detail: expand last_error + error_code explanation
  - Filter: by status, platform, date range

`components/analytics/PostAnalyticsDashboard.tsx`:
  Section 1 — KPI Cards:
  - Total Published Posts
  - Average Engagement Rate
  - Total Reach
  - Best Performing Platform

  Section 2 — Channel Breakdown:
  - Bar chart: engagement rate per platform (real data from analyticsService)
  - Table: posts per platform, avg reach, avg engagement

  Section 3 — Post Performance Table:
  - Paginated table of all published posts
  - Columns: platform, content preview, published date,
    reach, likes, comments, shares, engagement rate
  - Sortable by any metric
  - Click row: expand full analytics history (all fetched snapshots)

  Section 4 — Campaign Attribution:
  - Campaign filter dropdown
  - Show analytics for all posts linked to selected campaign
  - Display: total reach, total engagement, estimated ROI contribution

  Filters: date range picker (affects all sections)
  Refresh: manual "Refresh Analytics" button → triggers analytics-fetch

===================================================================
PHASE 8 — PUBLIC API (index.ts)
===================================================================

Export ONLY these items from `social/index.ts`:

From accountService:
  listAccounts, connectAccount, handleOAuthCallback,
  disconnectAccount, refreshToken, getAccountStatus

From approvalService:
  createDraft, submitForReview, approvePost, rejectPost,
  schedulePost, listPosts, getPost

From publisherService:
  listPublishJobs, getPublishJob, retryJob

From analyticsService:
  getPostAnalytics, getLatestAnalytics,
  getSummaryByPlatform, getCampaignPostAnalytics,
  triggerAnalyticsFetch

Types to export:
  SocialAccount, AiPost, PublishJob, PostAnalytics,
  ApprovalEvent, RateLimitWindow, AnalyticsSummary,
  ChannelBreakdown, Platform, PostStatus, JobStatus

DO NOT export:
  rateLimitService (internal)
  emitters (internal)
  listeners (internal)
  Vault-related functions (internal)
  Token retrieval functions (internal)
  Any raw token data

===================================================================
PHASE 9 — QUALITY & SECURITY AUDIT
===================================================================

Perform a complete audit. For each item, confirm it is implemented
or fix it if it is not.

Security Checklist:
- [ ] No OAuth token appears in any log, response, or frontend code
- [ ] Supabase Vault used for ALL token storage (access + refresh)
- [ ] Gemini API key exists only in Edge Function environment
- [ ] N8N_WEBHOOK_URL and N8N secret exist only in Supabase secrets
- [ ] publish_jobs table has no client-side RLS read access
- [ ] All Edge Functions validate the caller (service_role or valid JWT)
- [ ] OAuth state token validated on callback (CSRF protection)

Reliability Checklist:
- [ ] Every publish job has an idempotency_key
- [ ] Every error is classified before retry decision
- [ ] Dead letter path implemented (status = 'dead' + admin alert)
- [ ] Token refresh triggered automatically before expiry (pg_cron job 3)
- [ ] Approval escalation runs automatically (pg_cron job 2)

Data Integrity Checklist:
- [ ] All 5 tables have RLS enabled
- [ ] All foreign keys have ON DELETE behavior defined
- [ ] All enum types match between SQL and TypeScript
- [ ] Zod schemas match database column constraints
- [ ] updated_at trigger exists on all mutable tables

Performance Checklist:
- [ ] All list queries paginated (limit 20)
- [ ] Indexes exist on all filtered/joined columns
- [ ] Analytics queries do not do full table scans
- [ ] Realtime subscriptions unsubscribe on component unmount

UX Checklist — confirm every component has:
- [ ] Loading skeleton (not spinner) on initial load
- [ ] Error state with human-readable message + retry button
- [ ] Empty state with actionable CTA
- [ ] Success toast on every mutation
- [ ] Confirmation dialog on every destructive action
- [ ] Role-based UI (hide actions user cannot perform)

===================================================================
START
===================================================================

Begin with Phase 0.
List every file you will create in Phase 0, then write them one by one.
Write complete files. No placeholders.
State "✅ Phase 0 complete — ready for Phase 1" when done.
```