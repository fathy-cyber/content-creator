# Architecture Decision: Monolithic vs. Modular Marketing

## My Recommendation: **Hybrid Approach (Structured Monolith)**

Neither extreme is ideal. Here's the full reasoning:

---

## ❌ Option 1 — Pure Monolith: Why It Fails at Scale

```
marketing/
├── manifest.ts          # becomes 500+ lines
├── marketingService.ts  # becomes 3000+ lines
└── migrations/
    └── 001_marketing.sql # becomes unmaintainable
```

### Problems:
- `marketingService.ts` becomes a **God File** — AI, leads, campaigns, analytics, WhatsApp all mixed
- One bug in email marketing **breaks** the entire marketing module
- Can't **enable/disable** features per client (some don't need WhatsApp)
- Team collaboration causes **constant merge conflicts**
- Testing becomes nearly impossible — you can't unit test a 3000-line file cleanly

---

## ❌ Option 2 — Full Sub-Module Addons: Why It's Overkill

```
marketing_post_generator/
├── manifest.ts
├── service.ts
└── migrations/

marketing_email/
├── manifest.ts
├── service.ts
└── migrations/

marketing_whatsapp/
├── manifest.ts
├── service.ts
└── migrations/
```

### Problems:
- `PostGenerator` **alone** doesn't justify a full addon — it has no DB tables, no independent lifecycle
- Creates **circular dependency hell** (analytics needs leads needs campaigns needs assets...)
- Massive overhead: 8 sub-modules × 3 files = 24+ manifest/service files for tightly coupled features
- Odoo itself doesn't split at this granularity — `sale` is one addon, not `sale_quotation` + `sale_order` + `sale_invoice`

---

## ✅ The Right Answer: Structured Monolith with Internal Domain Separation

### The Rule: **Split by Domain Boundary, Not by Feature**

```
marketing/                          ← ONE addon (manifest, registered in system)
├── manifest.ts                     ← Declares the addon, dependencies, version
├── index.ts                        ← Public API surface (what other modules import)
│
├── services/                       ← Split by DOMAIN, not by page
│   ├── campaignService.ts          ← Campaign CRUD, lifecycle, status
│   ├── leadService.ts              ← Lead ingestion, scoring, pipeline
│   ├── assetService.ts             ← Content library, save/load generated content
│   ├── analyticsService.ts         ← ROI, conversion rates, channel performance
│   ├── segmentationService.ts      ← Audience segments, filter evaluation
│   └── aiService.ts                ← ALL Gemini calls, prompt templates
│
├── events/
│   ├── emitters.ts                 ← All outgoing eventBus emissions
│   └── listeners.ts                ← All incoming event subscriptions
│
├── migrations/
│   ├── 001_campaigns.sql
│   ├── 002_leads.sql
│   ├── 003_assets.sql
│   ├── 004_segments.sql
│   ├── 005_funnels.sql
│   └── 006_analytics.sql
│
└── components/                     ← UI only, imports from services
    ├── content/
    │   ├── PostGenerator.tsx
    │   ├── AdCopyCreator.tsx
    │   └── ...
    ├── campaigns/
    ├── leads/
    ├── analytics/
    └── channels/
```

---

## When TO Create a Real Sub-Module Addon

Apply the **3-condition test** — all three must be true:

```
┌─────────────────────────────────────────────────────────┐
│  Create a sub-module addon ONLY IF:                     │
│                                                         │
│  1. ✅ Has its OWN database tables (independent schema) │
│  2. ✅ Can be DISABLED without breaking core marketing  │
│  3. ✅ Has a distinct INTEGRATION (external API/system) │
└─────────────────────────────────────────────────────────┘
```

### Applied to Your Marketing Features:

| Feature | Own DB Tables | Disableable | External Integration | → Addon? |
|---|---|---|---|---|
| PostGenerator | ❌ (uses assets table) | ❌ | ❌ (Gemini shared) | **No** |
| CampaignManager | ✅ | ❌ (core) | ❌ | **No — it IS core** |
| **WhatsApp** | ✅ | ✅ | ✅ (WhatsApp Business API) | **YES** |
| **Email Marketing** | ✅ | ✅ | ✅ (SendGrid/SMTP) | **YES** |
| **Social Media** | ✅ | ✅ | ✅ (Meta/LinkedIn API) | **Maybe** |
| LeadScoring | ❌ (uses leads table) | ❌ | ❌ | **No** |
| Analytics | ❌ (reads other tables) | ❌ | ❌ | **No** |
| FunnelBuilder | ✅ | ✅ | ❌ | **Borderline — keep inside** |

---

## Final Structure Recommendation

```
addons/
│
├── marketing/                      ← CORE addon (always installed)
│   ├── manifest.ts
│   ├── services/
│   │   ├── campaignService.ts
│   │   ├── leadService.ts
│   │   ├── assetService.ts
│   │   ├── analyticsService.ts
│   │   ├── segmentationService.ts
│   │   └── aiService.ts
│   ├── events/
│   │   ├── emitters.ts
│   │   └── listeners.ts
│   └── migrations/
│       ├── 001_campaigns.sql
│       ├── 002_leads.sql
│       └── 003_assets.sql
│
├── marketing_whatsapp/             ← OPTIONAL addon
│   ├── manifest.ts                 # depends: ['marketing']
│   ├── services/
│   │   └── whatsappService.ts      # WhatsApp Business API calls
│   └── migrations/
│       └── 001_whatsapp_templates.sql
│
└── marketing_email/                ← OPTIONAL addon
    ├── manifest.ts                 # depends: ['marketing']
    ├── services/
    │   └── emailService.ts         # SendGrid/SMTP integration
    └── migrations/
        └── 001_email_campaigns.sql
```

---

## The Key Insight

> **Split services by domain responsibility inside one addon.
> Create a new addon only when you have an external dependency or true optionality.**

This is exactly how Odoo itself works:
- `sale` = one addon (not split into 50)
- `sale_whatsapp` = separate addon (external integration)
- `sale_amazon` = separate addon (external platform)

Your `PostGenerator` is a **UI feature powered by a shared AI service** — it belongs inside `marketing/services/aiService.ts`, not its own addon.


# 📋 Marketing Module — TODO List (Structured Monolith Architecture)

---

## 🏗️ PHASE 0 — Structural Refactoring (Do This First)

### 0.1 — Scaffold the New Folder Structure

- [ ] Create `marketing/manifest.ts`
- [ ] Create `marketing/index.ts` (empty public API for now, fill as services are built)
- [ ] Create `marketing/services/` directory
- [ ] Create `marketing/events/` directory
- [ ] Create `marketing/migrations/` directory
- [ ] Create `marketing/components/content/` directory
- [ ] Create `marketing/components/campaigns/` directory
- [ ] Create `marketing/components/leads/` directory
- [ ] Create `marketing/components/analytics/` directory
- [ ] Create `marketing/components/channels/` directory

### 0.2 — `manifest.ts`

- [ ] Define addon metadata: `id`, `name`, `version`, `description`
- [ ] Define `dependencies: ['crm', 'automation']`
- [ ] Define `migrations` array (ordered list of migration files)
- [ ] Define `services` array (list of service files to initialize)
- [ ] Define `events.emits` (document outgoing events)
- [ ] Define `events.listens` (document incoming events)

```ts
// Target shape
export const manifest = {
  id: 'marketing',
  name: 'Marketing',
  version: '1.0.0',
  dependencies: ['crm', 'automation'],
  migrations: [
    '001_campaigns.sql',
    '002_leads.sql',
    '003_assets.sql',
    '004_segments.sql',
    '005_funnels.sql',
    '006_analytics.sql',
  ],
  events: {
    emits: [
      'marketing.lead.created',
      'marketing.lead.scored',
      'marketing.campaign.launched',
      'marketing.campaign.ended',
      'marketing.asset.published',
    ],
    listens: [
      'sales.order.confirmed',
      'crm.contact.converted',
      'crm.deal.lost',
      'project.completed',
    ],
  },
}
```

### 0.3 — Migrate Existing Code into New Structure

- [ ] Move existing campaign logic from `marketingService.ts` → `services/campaignService.ts`
- [ ] Move existing lead logic from `marketingService.ts` → `services/leadService.ts`
- [ ] Move existing attribution/touchpoint logic → `services/analyticsService.ts`
- [ ] Move existing event emissions from `marketingService.ts` → `events/emitters.ts`
- [ ] Delete (or empty) the old `marketingService.ts` after migration is confirmed
- [ ] Move all existing UI components into their correct `components/` subdirectory
- [ ] Fix all broken imports across the app after the move
- [ ] Confirm app builds with zero errors after restructure

---

## 🗄️ PHASE 1 — Migrations (Database Foundation)

> **Rule**: No service file is written until its migration is done and tested.

### `migrations/001_campaigns.sql`

- [ ] Table `campaigns`: `id`, `name`, `description`, `status` (enum: `draft/active/paused/completed`), `budget`, `start_date`, `end_date`, `channels` (jsonb), `created_by`, `created_at`, `updated_at`
- [ ] Add RLS: users can only see campaigns from their organization
- [ ] Add index on `status`, `created_by`
- [ ] Test migration: run up, verify schema, run down

### `migrations/002_leads.sql`

- [ ] Table `marketing_leads`: `id`, `email`, `name`, `phone`, `source`, `campaign_id` (FK), `score` (int), `status` (enum: `new/contacted/qualified/converted/lost`), `metadata` (jsonb), `created_at`, `updated_at`
- [ ] Add RLS policy
- [ ] Add index on `status`, `score`, `campaign_id`
- [ ] Test migration

### `migrations/003_assets.sql`

- [ ] Table `marketing_assets`: `id`, `campaign_id` (FK, nullable), `type` (enum: `post/ad_copy/product_description/sales_script/email/whatsapp_template`), `platform` (string), `title` (string), `content` (text), `tone` (string), `status` (enum: `draft/approved/published/archived`), `created_by` (FK), `created_at`, `updated_at`
- [ ] Add RLS policy
- [ ] Add index on `type`, `status`, `campaign_id`
- [ ] Test migration

### `migrations/004_segments.sql`

- [ ] Table `audience_segments`: `id`, `name`, `description`, `filters` (jsonb), `lead_count` (int, cached), `created_by`, `created_at`, `updated_at`
- [ ] Add RLS policy
- [ ] Test migration

### `migrations/005_funnels.sql`

- [ ] Table `funnels`: `id`, `name`, `campaign_id` (FK, nullable), `stages` (jsonb array), `created_by`, `created_at`, `updated_at`
  - [ ] Each stage shape: `{ id, name, description, conversion_target_pct, linked_asset_ids[] }`
- [ ] Table `ab_tests`: `id`, `campaign_id`, `name`, `variant_a` (jsonb), `variant_b` (jsonb), `metric`, `results` (jsonb), `winner` (enum: `a/b/none`), `created_at`
- [ ] Add RLS policies
- [ ] Test migration

### `migrations/006_analytics.sql`

- [ ] Table `touchpoints`: `id`, `lead_id` (FK), `campaign_id` (FK), `channel`, `source`, `medium`, `utm_campaign`, `page_url`, `event_type`, `created_at`
- [ ] Table `campaign_plans`: `id`, `campaign_id` (FK, unique), `timeline` (jsonb), `budget_allocation` (jsonb), `milestones` (jsonb array), `created_at`, `updated_at`
- [ ] Add RLS policies
- [ ] Add index on `touchpoints.campaign_id`, `touchpoints.lead_id`
- [ ] Test migration

---

## ⚙️ PHASE 2 — Services (Business Logic Layer)

> **Rule**: Services import from each other via `index.ts` only. No component imports a service directly except through the public API.

### `services/aiService.ts`

- [ ] Import and initialize `lib/gemini.ts` client
- [ ] Create `constants/prompts.ts` inside `marketing/` for all prompt templates:
  - [ ] `PROMPTS.POST.LINKEDIN(inputs)`
  - [ ] `PROMPTS.POST.INSTAGRAM(inputs)`
  - [ ] `PROMPTS.POST.TWITTER(inputs)`
  - [ ] `PROMPTS.POST.FACEBOOK(inputs)`
  - [ ] `PROMPTS.AD_COPY.GOOGLE(inputs)`
  - [ ] `PROMPTS.AD_COPY.META(inputs)`
  - [ ] `PROMPTS.PRODUCT_DESC.ECOMMERCE(inputs)`
  - [ ] `PROMPTS.PRODUCT_DESC.B2B(inputs)`
  - [ ] `PROMPTS.SALES_SCRIPT.COLD_CALL(inputs)`
  - [ ] `PROMPTS.SALES_SCRIPT.OBJECTION(inputs)`
  - [ ] `PROMPTS.SALES_SCRIPT.CLOSING(inputs)`
  - [ ] `PROMPTS.EMAIL.SUBJECT(inputs)`
  - [ ] `PROMPTS.EMAIL.BODY(inputs)`
  - [ ] `PROMPTS.CAMPAIGN_PLAN(inputs)`
  - [ ] `PROMPTS.CTA_SUGGESTIONS(inputs)`
- [ ] Implement `generatePost(platform, inputs)` → calls Gemini, returns typed result
- [ ] Implement `generateAdCopy(platform, inputs)` → calls Gemini
- [ ] Implement `generateProductDescription(variant, inputs)` → calls Gemini
- [ ] Implement `generateSalesScript(type, inputs)` → calls Gemini
- [ ] Implement `generateEmailSubjects(inputs)` → returns 5 variants
- [ ] Implement `generateEmailBody(inputs)` → calls Gemini
- [ ] Implement `generateCampaignPlan(inputs)` → calls Gemini
- [ ] Implement `suggestCTAs(currentCTA, context)` → returns 5 suggestions
- [ ] Add centralized error handler (rate limit, empty response, network error)
- [ ] Add retry logic (max 2 retries with backoff)
- [ ] Export all functions, export input/output types

### `services/campaignService.ts`

- [ ] Implement `createCampaign(data)` → insert into `campaigns`, return created record
- [ ] Implement `getCampaign(id)` → fetch single campaign with joined plan
- [ ] Implement `listCampaigns(filters?)` → paginated list with status filter
- [ ] Implement `updateCampaign(id, changes)` → partial update
- [ ] Implement `deleteCampaign(id)` → soft delete (set status to `archived`)
- [ ] Implement `launchCampaign(id)` → set status to `active`, validate required fields first
- [ ] Implement `pauseCampaign(id)` → set status to `paused`
- [ ] Implement `completeCampaign(id)` → set status to `completed`
- [ ] Implement `saveCampaignPlan(campaignId, plan)` → upsert into `campaign_plans`
- [ ] Implement `loadCampaignPlan(campaignId)` → fetch from `campaign_plans`
- [ ] Implement `saveFunnel(data)` → upsert into `funnels`
- [ ] Implement `loadFunnel(id)` → fetch single funnel
- [ ] Implement `listFunnels(campaignId?)` → list funnels optionally filtered by campaign
- [ ] After `launchCampaign`: call `emitters.campaignLaunched(campaign)`
- [ ] After `completeCampaign`: call `emitters.campaignEnded(campaign)`
- [ ] Export all functions and types

### `services/leadService.ts`

- [ ] Implement `createLead(data)` → insert into `marketing_leads`
- [ ] Implement `getLead(id)` → fetch single lead
- [ ] Implement `listLeads(filters?)` → paginated, filterable by status, score, campaign, source
- [ ] Implement `updateLead(id, changes)` → partial update
- [ ] Implement `scoreLead(id)` → recalculate score based on metadata, update DB
  - [ ] Define scoring rules (source weight, engagement weight, profile completeness)
  - [ ] If new score > 70 AND status was not `qualified`: set status to `qualified`, call `emitters.leadScored(lead)`
- [ ] Implement `convertLead(id)` → set status to `converted`, link to CRM contact
- [ ] Implement `trackTouchpoint(leadId, touchpointData)` → insert into `touchpoints`
- [ ] After `createLead`: call `emitters.leadCreated(lead)`
- [ ] Export all functions and types

### `services/assetService.ts`

- [ ] Implement `saveAsset(data)` → insert into `marketing_assets`
- [ ] Implement `getAsset(id)` → fetch single asset
- [ ] Implement `listAssets(filters?)` → paginated, filterable by type, status, campaign, platform
- [ ] Implement `updateAsset(id, changes)` → partial update
- [ ] Implement `deleteAsset(id)` → hard delete with confirmation guard
- [ ] Implement `publishAsset(id)` → set status to `published`, call `emitters.assetPublished(asset)`
- [ ] Implement `linkAssetToCampaign(assetId, campaignId)` → update `campaign_id`
- [ ] Implement `getAssetsByCampaign(campaignId)` → fetch all assets for a campaign
- [ ] Export all functions and types

### `services/analyticsService.ts`

- [ ] Implement `getCampaignROI(campaignId)`:
  - [ ] Query total spend from `campaigns.budget`
  - [ ] Query attributed revenue from `sales_orders` via `campaign_id`
  - [ ] Return `{ spend, revenue, roi_pct }`
- [ ] Implement `getConversionRate(campaignId)`:
  - [ ] Count leads by status for campaign
  - [ ] Return `{ total, qualified, converted, conversion_rate_pct }`
- [ ] Implement `getChannelPerformance(dateRange?)`:
  - [ ] Group `touchpoints` by `channel`
  - [ ] Join to leads to count qualified/converted per channel
  - [ ] Return array of `{ channel, leads, qualified, converted, conversion_rate }`
- [ ] Implement `getLeadVelocity(campaignId?)`:
  - [ ] Calculate avg days from `created_at` → `qualified` → `converted`
  - [ ] Return `{ avg_to_qualified_days, avg_to_converted_days }`
- [ ] Implement `getCostPerLead(campaignId)`:
  - [ ] `budget / total_leads`
- [ ] Implement `getTopPerformingAssets()`:
  - [ ] Join `marketing_assets` → `touchpoints` → lead conversions
  - [ ] Return ranked list of assets by conversion influence
- [ ] Implement `getDashboardSummary(dateRange)`:
  - [ ] Single call that returns all KPIs for the analytics page
- [ ] Export all functions and types

### `services/segmentationService.ts`

- [ ] Implement `createSegment(data)` → insert into `audience_segments`
- [ ] Implement `listSegments()` → fetch all segments with cached lead count
- [ ] Implement `evaluateSegment(segmentId)`:
  - [ ] Load segment filters
  - [ ] Dynamically query `marketing_leads` with those filters
  - [ ] Update `lead_count` cache on segment record
  - [ ] Return matching leads array
- [ ] Implement `updateSegment(id, changes)` → update filters, re-evaluate
- [ ] Implement `deleteSegment(id)`
- [ ] Implement `getLeadsInSegment(segmentId)` → returns paginated leads matching segment
- [ ] Support filter types inside `evaluateSegment`:
  - [ ] `score_min` / `score_max`
  - [ ] `source` (equals)
  - [ ] `status` (equals or in array)
  - [ ] `campaign_id`
  - [ ] `created_after` / `created_before`
- [ ] Export all functions and types

---

## 📡 PHASE 3 — Events

### `events/emitters.ts`

- [ ] Import `eventBus` from core
- [ ] Implement `leadCreated(lead)` → emit `marketing.lead.created` with full payload
- [ ] Implement `leadScored(lead)` → emit `marketing.lead.scored` with `{ lead_id, score, status }`
- [ ] Implement `campaignLaunched(campaign)` → emit `marketing.campaign.launched`
- [ ] Implement `campaignEnded(campaign)` → emit `marketing.campaign.ended` with final metrics
- [ ] Implement `assetPublished(asset)` → emit `marketing.asset.published`
- [ ] Add TypeScript payload types for every emitted event
- [ ] Export all emitter functions

### `events/listeners.ts`

- [ ] Create `initMarketingListeners()` function (called at app startup)
- [ ] Implement listener: **`sales.order.confirmed`**
  - [ ] Find the campaign linked to the order via touchpoints
  - [ ] Call `analyticsService.attributeSaleToCamera(orderId, campaignId)`
  - [ ] Trigger ROI recalculation
- [ ] Implement listener: **`crm.contact.converted`**
  - [ ] Find matching marketing lead by email
  - [ ] Call `leadService.convertLead(leadId)`
  - [ ] Record time-to-conversion
- [ ] Implement listener: **`crm.deal.lost`**
  - [ ] Find lead source via touchpoints
  - [ ] Flag channel in analytics as underperforming
- [ ] Implement listener: **`project.completed`**
  - [ ] Extract project name, client, outcome from event payload
  - [ ] Create a pre-filled draft asset (type: `post`, platform: `linkedin`) with project details via `aiService.generatePost()`
  - [ ] Save draft via `assetService.saveAsset()`
  - [ ] Notify marketing team (emit internal notification event)
- [ ] Implement **internal** listener: **`marketing.lead.scored`** (Lead-to-Contact Pipeline)
  - [ ] When score > 70: call CRM service to create Contact from lead data
  - [ ] Call CRM service to create Deal in first pipeline stage
  - [ ] Link deal to `campaign_id`
  - [ ] Emit `crm.contact.created` with `source: 'marketing'`
- [ ] Export `initMarketingListeners`

---

## 🖥️ PHASE 4 — Components (UI Wiring)

> **Rule**: Components contain zero business logic. They call service functions and render results.

### `components/content/PostGenerator.tsx`

- [ ] Remove all mock data and `setTimeout`
- [ ] Wire platform selector to prompt variant in `aiService.generatePost(platform, inputs)`
- [ ] Add loading state during AI generation
- [ ] Add error state with retry button
- [ ] Add **"Save as Draft"** button → calls `assetService.saveAsset()`
- [ ] Add **"Link to Campaign"** dropdown (loads from `campaignService.listCampaigns()`)
- [ ] Add **"Regenerate"** button (re-calls AI with same inputs)

### `components/content/AdCopyCreator.tsx`

- [ ] Remove all mock data and `setTimeout`
- [ ] Wire to `aiService.generateAdCopy(platform, inputs)`
- [ ] Add loading / error / retry states
- [ ] Add **"Save as Draft"** → `assetService.saveAsset()`
- [ ] Add **"Link to Campaign"** dropdown

### `components/content/ProductDescription.tsx`

- [ ] Remove all mock data and `setTimeout`
- [ ] Wire to `aiService.generateProductDescription(variant, inputs)`
- [ ] Add loading / error / retry states
- [ ] Add **"Save as Draft"** → `assetService.saveAsset()`

### `components/content/SalesScripts.tsx`

- [ ] Remove all mock data and `setTimeout`
- [ ] Wire to `aiService.generateSalesScript(type, inputs)`
- [ ] Add loading / error / retry states
- [ ] Add **"Save as Draft"** → `assetService.saveAsset()`

### `components/content/ContentLibrary.tsx` *(New Component)*

- [ ] Create this new component
- [ ] Load assets via `assetService.listAssets(filters)`
- [ ] Add filter bar: by type, platform, status, campaign
- [ ] Add pagination
- [ ] Show content preview card per asset
- [ ] Add inline status change (draft → approved → published)
- [ ] Add delete with confirmation dialog
- [ ] Add empty state with CTA ("Generate your first piece of content")

### `components/campaigns/CampaignManager.tsx`

- [ ] Wire list to `campaignService.listCampaigns()`
- [ ] Wire create form to `campaignService.createCampaign()`
- [ ] Wire status actions: Launch → `campaignService.launchCampaign()`, Pause, Complete
- [ ] Show asset count badge per campaign from `assetService.getAssetsByCampaign()`
- [ ] Add pagination

### `components/campaigns/CampaignPlanner.tsx`

- [ ] Wire load to `campaignService.loadCampaignPlan(campaignId)`
- [ ] Wire save to `campaignService.saveCampaignPlan(campaignId, plan)`
- [ ] Wire **"Generate with AI"** button to `aiService.generateCampaignPlan(inputs)`
- [ ] Make milestones addable/removable
- [ ] Add budget allocation inputs per channel
- [ ] Show live budget remaining calculator

### `components/campaigns/FunnelBuilder.tsx`

- [ ] Wire load to `campaignService.listFunnels()` and `campaignService.loadFunnel(id)`
- [ ] Wire save to `campaignService.saveFunnel(data)`
- [ ] Make stages drag-and-drop reorderable
- [ ] Allow linking an asset (from Content Library) to each stage
- [ ] Allow setting conversion target % per stage
- [ ] Show live funnel summary (leads through each stage based on real data)

### `components/leads/AudienceSegmentation.tsx`

- [ ] Wire to `segmentationService.listSegments()`
- [ ] Wire create to `segmentationService.createSegment()`
- [ ] Wire filter builder to `segmentationService.evaluateSegment()` (live preview count)
- [ ] Add **"Use in Campaign"** button per segment
- [ ] Show live lead count as filters change (debounced, 400ms)

### `components/leads/ConversionOptimizer.tsx`

- [ ] Build A/B Test Tracker sub-section:
  - [ ] Create test form (name, variant A, variant B, metric)
  - [ ] Save to `ab_tests` table via new function in `campaignService.ts`
  - [ ] Show winner calculation when results are entered
- [ ] Build CTA Suggester sub-section:
  - [ ] Input: current CTA text
  - [ ] Wire to `aiService.suggestCTAs(currentCTA, context)`
  - [ ] Display 5 suggestions with copy button
- [ ] Remove all static/mock UI

### `components/analytics/MarketingAnalytics.tsx`

- [ ] Replace all mock chart data with `analyticsService.getDashboardSummary(dateRange)`
- [ ] Add date range picker (wired to all queries)
- [ ] Add campaign filter dropdown
- [ ] Render ROI card per campaign (real data)
- [ ] Render Conversion Rate funnel chart (real data)
- [ ] Render Channel Performance bar chart (real data)
- [ ] Render Cost Per Lead card (real data)
- [ ] Render Top Performing Assets table (real data)
- [ ] Add loading skeletons
- [ ] Add empty state

### `components/channels/` *(Channels — Wired to Core Services)*

- [ ] **WhatsApp Templates**: Wire CRUD to a new `whatsappTemplates` table (add to `003_assets.sql` or separate migration), AI generation via `aiService`, character count validation
- [ ] **EmailMarketing**: Wire to `campaigns` + `audience_segments`, AI subject/body generation, schedule send field
- [ ] **SocialMediaManager**: Wire to `social_posts` (add table), content calendar view, link to Content Library assets

---

## 🔌 PHASE 5 — Public API (`index.ts`)

- [ ] Export from `campaignService`: `createCampaign`, `listCampaigns`, `getCampaign`
- [ ] Export from `leadService`: `createLead`, `scoreLead`, `listLeads`
- [ ] Export from `assetService`: `listAssets`, `getAssetsByCampaign`
- [ ] Export from `analyticsService`: `getCampaignROI`, `getChannelPerformance`
- [ ] Export from `segmentationService`: `listSegments`, `getLeadsInSegment`
- [ ] Export all TypeScript types: `Campaign`, `Lead`, `Asset`, `Segment`, `Funnel`, `Touchpoint`
- [ ] **Do NOT export** `aiService` (internal only — AI is an implementation detail)
- [ ] **Do NOT export** `emitters` or `listeners` (internal only)

---

## 🛡️ PHASE 6 — Quality & Security

### Validation

- [ ] Add Zod schema for `Campaign` (validate before `createCampaign` / `updateCampaign`)
- [ ] Add Zod schema for `Lead`
- [ ] Add Zod schema for `Asset`
- [ ] Add Zod schema for `Segment` filters
- [ ] Add Zod schema for AI prompt inputs (validate before calling Gemini)
- [ ] Show field-level validation errors in all forms

### Security

- [ ] Verify RLS is active on all 6 migration tables
- [ ] Proxy all Gemini calls through a Supabase Edge Function (never expose API key to client)
- [ ] Scope all Supabase queries to `auth.uid()` organization

### Performance

- [ ] Paginate `listAssets`, `listLeads`, `listCampaigns` (page size: 20)
- [ ] Debounce segment filter evaluation (400ms)
- [ ] Cache `getDashboardSummary` result for 5 minutes (invalidate on new lead/campaign event)
- [ ] Add indexes (confirmed in migration files above)

### UX Polish

- [ ] Success toast on every create/save/publish action
- [ ] Error toast on every failed action with human-readable message
- [ ] Confirmation dialog on every delete action
- [ ] Loading skeleton on every list and analytics view
- [ ] Empty state with actionable CTA on every list view

---

## 📐 Execution Order (Critical Path)

```
Phase 0 (Restructure)
    ↓
Phase 1 (Migrations — all 6 SQL files)
    ↓
Phase 2 (Services — in this order):
    aiService → leadService → campaignService → assetService → analyticsService → segmentationService
    ↓
Phase 3 (Events — emitters first, then listeners)
    ↓
Phase 4 (Components — wire one at a time, content first)
    ↓
Phase 5 (index.ts — lock the public API)
    ↓
Phase 6 (Quality pass — last)
```