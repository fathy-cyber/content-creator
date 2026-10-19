# 📋 Critical Review & Complete Architecture
## AI-Generated Post Publishing for Enterprise ERP

---

Avoid these Structural Problems :

- [ ] **Too generic** — reads like a tutorial blog, not an enterprise spec. No concrete implementation decisions are made. Every section says "use X or Y" without committing to anything for your specific stack (Supabase + React + TypeScript)
- [ ] **No error taxonomy** — social APIs fail in very different ways (expired token vs. rate limit vs. permission revoked vs. platform outage). Treating them all as "retry" is dangerously naive
- [ ] **No token lifecycle management** — OAuth tokens expire. The paper mentions refresh tokens exist but never explains how to rotate them automatically, which is the hardest part
- [ ] **No media handling pipeline** — mentions "Media Manager" as a box in a diagram but never explains image resizing per platform, video transcoding, file size limits, or CDN delivery
- [ ] **Queue architecture is wrong** — recommends Redis + Celery/BullMQ as if you're building a standalone backend. You already have Supabase. This conflicts with your stack and adds massive infrastructure overhead
- [ ] **Analytics is a placeholder** — "impressions, clicks, engagement, ROI" listed as bullet points with zero explanation of how you actually retrieve these (webhook vs. polling, API rate limits on analytics endpoints, data freshness)
- [ ] **No rate limit strategy** — LinkedIn allows ~100 posts/day per page. Meta has complex rate limiting tiers. X free tier allows 1,500 tweets/month. These limits define your entire scheduling architecture and are completely absent
- [ ] **Free plan constraints completely ignored** — the title mentions "free plan" but the paper never once addresses what's actually free vs. paid on each platform API
- [ ] **No idempotency** — if the scheduler crashes after sending to LinkedIn but before recording success, it will double-post. This is a critical bug in any publishing system
- [ ] **Approval workflow has no escalation** — what happens if a reviewer never approves? No timeout, no escalation path, no expiry on scheduled posts
- [ ] **Database schema is incomplete** — missing `media_urls`, `error_log`, `retry_count`, `platform_limits` tracking, token encryption fields

---

### The Central Question You Asked

## n8n vs. Supabase Edge Functions — Full Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DECISION MATRIX                                  │
├────────────────────┬──────────────────────┬────────────────────────┤
│ Criteria           │ n8n                  │ Supabase Edge Fn       │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Free tier          │ Self-hosted = free   │ 500K invocations/month │
│                    │ Cloud = $20+/month   │ free                   │
├────────────────────┼──────────────────────┼────────────────────────┤
│ OAuth token mgmt   │ ✅ Built-in          │ ❌ You build it        │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Visual workflow    │ ✅ No-code UI        │ ❌ Code only           │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Scheduling         │ ✅ Native cron       │ ⚠️ pg_cron only        │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Retry logic        │ ✅ Built-in          │ ❌ You build it        │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Dead letter queue  │ ✅ Built-in          │ ❌ You build it        │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Stack integration  │ ⚠️ External service  │ ✅ Native to Supabase  │
├────────────────────┼──────────────────────┼────────────────────────┤
│ DB access          │ ⚠️ Via API/plugin    │ ✅ Direct Postgres      │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Execution time     │ Unlimited            │ ⚠️ 150s wall clock     │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Cold start         │ None                 │ ~300ms                 │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Secret management  │ ✅ Built-in vault    │ ✅ Supabase secrets    │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Maintainability    │ ⚠️ Another system    │ ✅ Same codebase       │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Vendor lock-in     │ Low (self-hostable)  │ Medium                 │
├────────────────────┼──────────────────────┼────────────────────────┤
│ Team skill req.    │ Low (visual)         │ High (TypeScript/Deno) │
└────────────────────┴──────────────────────┴────────────────────────┘
```

### ✅ The Answer: **Hybrid Architecture**

```
┌─────────────────────────────────────────────────────────┐
│  Use Supabase Edge Functions FOR:                       │
│  - AI content generation (stateless, fast)              │
│  - Webhook receivers from social platforms              │
│  - Token refresh (triggered by DB event)                │
│  - Analytics ingestion                                  │
│                                                         │
│  Use n8n (self-hosted) FOR:                            │
│  - OAuth connection flows (built-in nodes)              │
│  - Scheduled publishing (visual cron)                   │
│  - Retry + dead letter queue (built-in)                 │
│  - Multi-step approval notifications                    │
│  - Cross-platform fan-out (post to 3 platforms at once) │
└─────────────────────────────────────────────────────────┘
```

> **Reasoning**: Edge Functions are stateless and have a 150-second limit.
> A publishing job that posts to 4 platforms, handles retries, refreshes tokens,
> and waits for rate limit windows can easily exceed that.
> n8n handles long-running, stateful, multi-step workflows natively.
> But n8n should NOT touch your AI generation — that stays in Edge Functions
> where it's close to your database and secrets.

---

## ✅ CORRECTED & COMPLETE ARCHITECTURE

### Real-World Free Tier Constraints (What the Paper Ignored)

```
┌──────────────┬────────────────────────────────────────────────────┐
│ Platform     │ Free Tier Reality                                  │
├──────────────┼────────────────────────────────────────────────────┤
│ LinkedIn     │ Marketing API requires PARTNER STATUS (not free)   │
│              │ → Use LinkedIn Pages API (free, limited)           │
│              │ → Personal OAuth posting: free but rate limited    │
├──────────────┼────────────────────────────────────────────────────┤
│ Facebook     │ Pages API free, but post reach is throttled        │
│              │ → No paid boosting via API on free tier            │
├──────────────┼────────────────────────────────────────────────────┤
│ Instagram    │ Requires Facebook Business account                 │
│              │ → Content Publishing API: free                     │
│              │ → Reels/Stories: separate endpoints                │
├──────────────┼────────────────────────────────────────────────────┤
│ X (Twitter)  │ Free tier: READ ONLY in 2024                       │
│              │ Basic ($100/month): 1,500 tweets/month write       │
│              │ → Effectively NOT free for posting                 │
├──────────────┼────────────────────────────────────────────────────┤
│ Gemini AI    │ Free tier: 15 RPM, 1M tokens/day (Gemini 1.5 Flash)│
│              │ → Sufficient for MVP                               │
├──────────────┼────────────────────────────────────────────────────┤
│ Supabase     │ Free: 500MB DB, 1GB storage, 500K Edge Fn calls    │
│              │ → pg_cron available on free tier                   │
├──────────────┼────────────────────────────────────────────────────┤
│ n8n          │ Self-hosted = completely free                      │
│              │ → Run on Railway/Render free tier (~$0)            │
└──────────────┴────────────────────────────────────────────────────┘
```

---

### Corrected & Complete Database Schema

```sql
-- ============================================================
-- SOCIAL ACCOUNTS (OAuth token store)
-- ============================================================
CREATE TABLE social_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  platform        TEXT NOT NULL CHECK (platform IN (
                    'linkedin','facebook','instagram','x','tiktok','youtube'
                  )),
  account_name    TEXT NOT NULL,
  account_id      TEXT NOT NULL,              -- platform's internal ID
  access_token    TEXT NOT NULL,              -- ENCRYPTED, never plain text
  refresh_token   TEXT,                       -- ENCRYPTED
  token_expires_at TIMESTAMPTZ,
  scopes          TEXT[],                     -- granted OAuth scopes
  status          TEXT DEFAULT 'active'
                    CHECK (status IN ('active','expired','revoked','error')),
  connected_by    UUID REFERENCES auth.users(id),
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, platform, account_id)
);

-- ============================================================
-- PLATFORM RATE LIMITS (track usage against limits)
-- ============================================================
CREATE TABLE platform_rate_limits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES social_accounts(id),
  window_start    TIMESTAMPTZ NOT NULL,
  window_end      TIMESTAMPTZ NOT NULL,
  posts_sent      INT DEFAULT 0,
  posts_limit     INT NOT NULL,              -- per platform per window
  api_calls_made  INT DEFAULT 0,
  api_calls_limit INT NOT NULL
);

-- ============================================================
-- AI GENERATED POSTS
-- ============================================================
CREATE TABLE ai_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id),
  campaign_id         UUID REFERENCES campaigns(id),
  platform            TEXT NOT NULL,
  prompt_key          TEXT NOT NULL,         -- maps to constants/prompts.ts
  prompt_inputs       JSONB NOT NULL,        -- inputs used for generation
  generated_content   TEXT NOT NULL,
  hashtags            TEXT[],
  media_urls          TEXT[],                -- links to Supabase Storage
  status              TEXT DEFAULT 'draft'
                        CHECK (status IN (
                          'draft','in_review','approved',
                          'rejected','scheduled','published','archived'
                        )),
  rejection_reason    TEXT,
  approved_by         UUID REFERENCES auth.users(id),
  approved_at         TIMESTAMPTZ,
  scheduled_for       TIMESTAMPTZ,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PUBLISH JOBS (the actual delivery record)
-- ============================================================
CREATE TABLE publish_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id),
  ai_post_id          UUID NOT NULL REFERENCES ai_posts(id),
  social_account_id   UUID NOT NULL REFERENCES social_accounts(id),
  platform            TEXT NOT NULL,
  status              TEXT DEFAULT 'pending'
                        CHECK (status IN (
                          'pending','in_progress','published',
                          'failed','retrying','dead'
                        )),
  idempotency_key     TEXT UNIQUE NOT NULL,  -- prevents double-posting
  external_post_id    TEXT,                  -- platform's returned post ID
  published_at        TIMESTAMPTZ,
  retry_count         INT DEFAULT 0,
  max_retries         INT DEFAULT 3,
  next_retry_at       TIMESTAMPTZ,
  last_error          TEXT,
  error_code          TEXT,                  -- 'rate_limit','auth','network','platform'
  n8n_execution_id    TEXT,                  -- track n8n workflow run
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPROVAL WORKFLOW (audit trail)
-- ============================================================
CREATE TABLE approval_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_post_id  UUID NOT NULL REFERENCES ai_posts(id),
  actor_id    UUID NOT NULL REFERENCES auth.users(id),
  action      TEXT NOT NULL
                CHECK (action IN (
                  'submitted','approved','rejected','escalated','expired'
                )),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- POST ANALYTICS (fetched from platform APIs)
-- ============================================================
CREATE TABLE post_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_job_id  UUID NOT NULL REFERENCES publish_jobs(id),
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  impressions     INT DEFAULT 0,
  reach           INT DEFAULT 0,
  likes           INT DEFAULT 0,
  comments        INT DEFAULT 0,
  shares          INT DEFAULT 0,
  clicks          INT DEFAULT 0,
  engagement_rate NUMERIC(5,2),              -- calculated: (interactions/reach)*100
  raw_data        JSONB                      -- full API response for future fields
);

-- RLS on all tables
ALTER TABLE social_accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies (org-scoped)
CREATE POLICY org_isolation ON social_accounts
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
-- (repeat pattern for all tables)
```

---

### Complete Corrected Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/TS)                          │
│  SocialMediaManager.tsx → ContentLibrary.tsx → ApprovalQueue.tsx   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ calls index.ts (public API)
┌────────────────────────────▼────────────────────────────────────────┐
│                     SUPABASE EDGE FUNCTIONS                         │
│                                                                     │
│  /marketing-ai          /token-refresh        /webhook-receiver     │
│  (Gemini generation)    (OAuth rotation)      (platform callbacks)  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ reads/writes
┌────────────────────────────▼────────────────────────────────────────┐
│                       SUPABASE POSTGRES                             │
│  ai_posts  publish_jobs  social_accounts  approval_events           │
│                                                                     │
│  pg_cron: every 1 min → scan approved+scheduled posts              │
│           → insert pending publish_jobs                             │
│           → notify n8n webhook                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │ webhook trigger
┌────────────────────────────▼────────────────────────────────────────┐
│                    n8n (self-hosted)                                 │
│                                                                     │
│  Workflow: "Publish Post"                                           │
│  1. Receive webhook (publish_job record)                            │
│  2. Check idempotency_key (skip if already processed)              │
│  3. Fetch encrypted token → decrypt                                 │
│  4. Check rate limit window → wait if needed                       │
│  5. Call platform API (LinkedIn/Meta/etc.)                          │
│  6. On success: update publish_jobs.status = 'published'            │
│                 store external_post_id                              │
│  7. On failure: classify error type                                 │
│     → 'rate_limit': reschedule with backoff                        │
│     → 'auth': trigger token refresh Edge Function                  │
│     → 'platform': retry up to max_retries                          │
│     → 'dead': set status = 'dead', alert admin                     │
│  8. Schedule analytics fetch (T+24h, T+72h)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │ analytics fetch (delayed)
┌────────────────────────────▼────────────────────────────────────────┐
│              PLATFORM ANALYTICS APIs                                │
│  LinkedIn Analytics API / Meta Insights / etc.                      │
│  → write to post_analytics table                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Complete Event Registry (Corrected)

```typescript
// What the paper had — incomplete
// What it should be:

export const SOCIAL_EVENTS = {
  // AI Generation
  'marketing.post.draft.created':    { payload: 'AiPost' },
  'marketing.post.generation.failed':{ payload: 'GenerationError' },

  // Approval Workflow
  'marketing.post.submitted':        { payload: 'AiPost' },
  'marketing.post.approved':         { payload: 'AiPost & { approver_id }' },
  'marketing.post.rejected':         { payload: 'AiPost & { reason }' },
  'marketing.post.approval.expired': { payload: 'AiPost' },  // ← paper missed this

  // Scheduling
  'marketing.post.scheduled':        { payload: 'AiPost & { scheduled_for }' },
  'marketing.post.unscheduled':      { payload: 'AiPost' },  // ← paper missed this

  // Publishing
  'marketing.post.publish.started':  { payload: 'PublishJob' },
  'marketing.post.published':        { payload: 'PublishJob & { external_post_id }' },
  'marketing.post.publish.failed':   { payload: 'PublishJob & { error }' },
  'marketing.post.publish.dead':     { payload: 'PublishJob' }, // ← paper missed this

  // Token Lifecycle  ← paper missed this entirely
  'social.token.refreshed':          { payload: 'SocialAccount' },
  'social.token.expired':            { payload: 'SocialAccount' },
  'social.token.revoked':            { payload: 'SocialAccount' },

  // Analytics  ← paper missed this
  'marketing.analytics.fetched':     { payload: 'PostAnalytics' },
  'marketing.analytics.anomaly':     { payload: 'PostAnalytics & { reason }' },
}
```

---

### Corrected Approval Workflow (With Escalation)

```
                    ┌─────────────┐
                    │    draft    │
                    └──────┬──────┘
                           │ marketer submits
                    ┌──────▼──────┐
                    │  in_review  │◄──────────────────┐
                    └──────┬──────┘                   │
              ┌────────────┼────────────┐             │
              │            │            │             │
         approved      rejected     [48h timeout]    escalated
              │            │            │             │
     ┌────────▼──┐  ┌──────▼──┐  ┌────▼──────┐      │
     │ scheduled │  │  draft  │  │ escalated │──────►┘
     └────────┬──┘  └─────────┘  └─────┬─────┘
              │                         │ [24h timeout]
              │                   ┌─────▼──────┐
              │                   │  archived  │ ← auto-archive expired
              │                   └────────────┘
     ┌────────▼──────┐
     │  in_progress  │ ← n8n picked it up
     └────────┬──────┘
    ┌─────────┴──────────┐
    │                    │
 published            failed
    │                    │
    ▼                    ▼
analytics           retry/dead
 polling            queue
```

---

### Token Encryption (What the Paper Ignored)

```typescript
// supabase/functions/token-vault/index.ts
// NEVER store plain OAuth tokens in the database

import { createClient } from '@supabase/supabase-js'

// Use Supabase Vault (built-in encryption at rest)
// https://supabase.com/docs/guides/database/vault

export async function storeToken(
  accountId: string,
  accessToken: string,
  refreshToken: string
) {
  // Supabase Vault encrypts with AES-256
  // tokens are never visible in plain text via SQL
  const { data } = await supabase.rpc('vault.create_secret', {
    secret: accessToken,
    name: `social_access_${accountId}`,
  })
  return data.id // store vault_secret_id in social_accounts, not the token
}

export async function retrieveToken(vaultSecretId: string) {
  const { data } = await supabase.rpc('vault.decrypted_secrets', {
    secret_id: vaultSecretId
  })
  return data.decrypted_secret
}
```

---

### Idempotency Implementation (What the Paper Ignored)

```typescript
// supabase/functions/publishing/create-publish-job.ts
// Prevents double-posting if scheduler runs twice

export async function createPublishJob(
  aiPostId: string,
  socialAccountId: string,
  scheduledFor: Date
): Promise<PublishJob> {

  // Idempotency key = deterministic, based on content + account + time window
  const idempotencyKey = `${aiPostId}:${socialAccountId}:${scheduledFor.toISOString()}`

  const { data, error } = await supabase
    .from('publish_jobs')
    .upsert(
      {
        ai_post_id: aiPostId,
        social_account_id: socialAccountId,
        idempotency_key: idempotencyKey,
        status: 'pending',
      },
      {
        onConflict: 'idempotency_key',  // ← if already exists, do nothing
        ignoreDuplicates: true,
      }
    )
    .select()
    .single()

  return data
}
```

---

### Revised MVP Roadmap (Realistic for Free Tier)

```
PHASE 1 — Foundation (Week 1-2)
  ✅ DB schema (all tables above)
  ✅ Supabase Vault for token storage
  ✅ AI generation Edge Function (Gemini free tier)
  ✅ Manual copy-to-clipboard publish (no API yet)

PHASE 2 — LinkedIn Only (Week 3-4)
  ✅ LinkedIn OAuth flow (Pages API, free)
  ✅ Basic post publishing via n8n workflow
  ✅ Idempotency key implementation
  ✅ Approval workflow (submit → approve → publish)

PHASE 3 — Meta (Week 5-6)
  ✅ Facebook Pages API
  ✅ Instagram Content Publishing API
  ✅ Media upload to Supabase Storage → pass URL to API
  ✅ Retry + error classification in n8n

PHASE 4 — Reliability (Week 7-8)
  ✅ Token refresh automation
  ✅ Rate limit tracking per account
  ✅ Dead letter queue + admin alerts
  ✅ Analytics polling (T+24h)

PHASE 5 — Skip X entirely on free tier
  ⚠️ X Basic API = $100/month minimum for write access
  → Add X only when client explicitly pays for it
```

---

### Corrected Permission Matrix

```
┌──────────────┬────────────┬───────────┬──────────┬──────────────┐
│ Action       │ Marketer   │ Reviewer  │ Manager  │ Admin        │
├──────────────┼────────────┼───────────┼──────────┼──────────────┤
│ Generate AI  │ ✅         │ ✅        │ ✅       │ ✅           │
│ Save draft   │ ✅         │ ✅        │ ✅       │ ✅           │
│ Submit review│ ✅         │ ❌        │ ✅       │ ✅           │
│ Approve post │ ❌         │ ✅        │ ✅       │ ✅           │
│ Reject post  │ ❌         │ ✅        │ ✅       │ ✅           │
│ Schedule post│ ❌         │ ❌        │ ✅       │ ✅           │
│ Connect OAuth│ ❌         │ ❌        │ ❌       │ ✅           │
│ View analytics│ ✅        │ ✅        │ ✅       │ ✅           │
│ Delete post  │ own only   │ ❌        │ ✅       │ ✅           │
│ Revoke token │ ❌         │ ❌        │ ❌       │ ✅           │
└──────────────┴────────────┴───────────┴──────────┴──────────────┘
```

---

## Summary: Key Corrections Made

| Paper Said | Reality |
|---|---|
| "Use Redis + Celery for queue" | You have Supabase — use pg_cron + n8n |
| "X API is a good first target" | X write access costs $100/month minimum |
| "LinkedIn Marketing API" | Requires partner status — use Pages API |
| "Store tokens with encryption" | Use Supabase Vault specifically |
| "Add retry system" | Must classify error TYPE before retrying |
| "Analytics: impressions, clicks" | Must specify polling strategy + timing |
| No mention of idempotency | Critical — double-posting is a fatal bug |
| No multi-tenancy | Every table needs org_id + RLS |
| No token expiry handling | OAuth tokens expire — must auto-refresh |
| No approval escalation | 48h timeout + escalation path required |