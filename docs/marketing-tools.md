# Marketing Tools — Workflow Overview

## 1. Landing Page Copywriter (`/marketing/landing-page`)

**File:** `src/modules/marketing/components/tools/LandingPageWriter.tsx`

- User selects a framework: **AIDA**, **PAS**, or **Hero Section**
- Inputs product/offer, target persona, and framework-specific fields (USP, CTA, main problem)
- Calls `landingPageService` which routes to the registered prompt key (`LANDING_PAGE.AIDA` or `LANDING_PAGE.PAS`) via the AI gateway
- Returns structured JSON matching the framework (e.g., AIDA returns `attention → interest → desire → action` sections)
- Renders a live preview with per-section copy-to-clipboard
- Can **Save to Assets** via `landingPageService.saveLandingPage`

## 2. Competitor Ad Spy & Analyzer (`/marketing/competitor`)

**File:** `src/modules/marketing/components/tools/CompetitorAnalyzer.tsx`

- User pastes a **competitor's ad copy** plus their own product name/USP
- Calls `competitorService.analyzeCompetitorAd` → `COMPETITOR.GAP_ANALYSIS` prompt → returns structured analysis (messaging angles, emotional triggers, weaknesses, market gaps)
- Optionally **Generate Counter-Ad** → `COMPETITOR.COUNTER_ANGLE` prompt → returns hooks, strategic angles, and full counter-ad copy
- Results can be copied or **Saved to Library** as an asset

## 3. Conversion Optimizer (`/marketing/conversion`)

**File:** `src/modules/marketing/components/leads/ConversionOptimizer.tsx`

- User provides a **landing page URL**, **primary goal**, **target audience**, and known **friction points**
- Calls AI directly with `CONVERSION.OPTIMIZE` prompt → returns an ordered list of optimization steps
- Each step shows: current state → recommended change → impact level (High/Medium/Low) → reasoning
- Report can be **Saved as Asset** to the content library

## 4. ICP Builder / Persona Builder (`/marketing/persona`)

**File:** `src/modules/marketing/components/tools/PersonaBuilder.tsx`

- 3-step wizard: **Industry** → **Product/Service** → **Existing Customer Data** (optional)
- Calls `personaService.generatePersona` → `PERSONA.ICP_BUILDER` prompt → returns structured persona (name, age range, job title, pain points, goals, objections, channels, buying triggers)
- Persona rendered as a visual profile card
- Can **Save to Library** (persists to `personas` table via Supabase) or navigate to ad copy tool with persona context

## 5. Campaign Planner (`/marketing/campaign-planner`)

**File:** `src/modules/marketing/components/campaigns/CampaignPlanner.tsx`

- 3-step wizard: **Objective** → **Audience & Budget** → **Channel selection** (Facebook, Instagram, Email, WhatsApp, Google)
- Calls AI with `CAMPAIGN_PLAN` prompt → returns timeline, budget allocation, milestones
- Supports saving to a named campaign, selecting existing campaigns, or creating new ones
- Results visible as a plan summary with timeline steps; can launch directly

## 6. Email Marketing (`/marketing/email`)

**File:** `src/modules/marketing/components/channels/EmailMarketing.tsx`

- User provides **product name**, **goal** (Sales/Retention/Event), **audience**, and **key benefits**
- Fires two AI calls in parallel: `EMAIL.SUBJECT` (generates 5 subject lines) and `EMAIL.BODY` (generates full email body)
- Integrates with `marketing.listSegments` for audience segment selection
- Results: click to copy subject lines, preview body, **Save as Asset**

## 7. Lead Scoring Workbench (`/marketing/lead-scoring`)

**File:** `src/modules/marketing/components/leads/LeadScoringWorkbench.tsx`

- Left panel: **Rules list** grouped by active/inactive with inline edit, delete, toggle
- Right panel: **Test & Evaluate** — select a lead → preview scoring breakdown per rule → **Score & Save** to persist
- `scoringService.createRule` / `updateRule` / `deleteRule` — full CRUD with Zod validation
- `scoringService.evaluateLead()` — dry-run: computes score against active rules without persisting
- `scoringService.scoreLead()` — persists score, writes `scoring_history` audit trail, updates lead status (≥ 70 → "qualified")
- New DB tables: `scoring_rules` (configurable field/operator/value/points/priority) + `scoring_history` (audit log)

## 8. ROI Calculator (`/marketing/roi-calculator`)

**File:** `src/modules/marketing/components/tools/ROICalculator.tsx`

- Left panel: **Campaign Setup** — name, duration, fixed costs, and per-channel inputs (budget, CPC, CTR, CVR, AOV)
- Add/remove channels dynamically (defaults: Google Ads, Meta Ads)
- Calls `roiService.calculate()` — pure computation (no AI), returns projected impressions, clicks, leads, customers, revenue, ROAS, CPA, profit, margin, break-even point
- Channel breakdown table with individual ROAS/CPA per channel
- **What-If Scenarios** block: +25% budget, +50%, -25%, double CVR, half CPC — shows delta vs base
- Can **Save to Assets** via `roiService.saveAsAsset()`

## 9. SEO Meta Generator (`/marketing/seo`)

**File:** `src/modules/marketing/components/tools/SEOMetaGenerator.tsx`

- Left panel: **Page Details** — URL, page title, primary keyword, secondary keywords (tag-style add/remove), target audience, brand, tone selector, page content (paste for context)
- Calls `seoService.generate()` → AI with `SEO.META_TAGS` prompt → returns title tag, meta description, OG title/description/image, keywords, JSON-LD structured data, H1 tag, URL slug
- Results panel: per-section cards with copy-to-clipboard on hover
  - Title tag with character counter and 60-char recommendation
  - Meta description with 160-char recommendation
  - H1 tag, URL slug, Open Graph preview, keywords, structured data (syntax-highlighted `<pre>` block)
- Can **Save** to `seo_pages` table (migration `014_seo_pages.sql`) via `seoService.save()`

## 10. A/B Test Designer (`/marketing/ab-test`)

**File:** `src/modules/marketing/components/tools/ABTestDesigner.tsx`

- Two tabs: **Design Experiment** and **Sample Size Calculator**
- Design tab:
  - Inputs: test name, description, element (headline/CTA/image/body/offer/layout), goal, hypothesis, current version, traffic split, confidence level, target audience
  - Calls `abTestService.generateVariants()` → AI with `MARKETING.AB_TEST_VARIANTS` prompt → returns variants with name, description, changes list, expected impact, risk level
  - Control card + variant cards with risk badges, change list, expected impact
  - Recommended sample size + estimated duration displayed
  - Can **Save Experiment** to `ab_tests` table (migration `015_ab_tests.sql`) via `abTestService.create()`
  - **Saved Tests** modal loads existing experiments
- Calculator tab:
  - Inputs: current conversion rate, minimum detectable effect, confidence level, statistical power
  - Uses `abTestService.calculateSampleSize()` (Z-test formula) and `abTestService.calculateSignificance()` (erf-based)
  - Shows required sample size per variant + projected results + statistical significance percentage

## 11. UGC Curator (`/marketing/ugc`)

**File:** `src/modules/marketing/components/tools/UGCCollector.tsx`

- Two tabs: **Collect UGC** and **UGC Library**
- Collect tab:
  - Content type selector (review/testimonial/social_post/comment/mention/case_study/other)
  - Paste content text, optional author name, handle, source URL
  - Calls `ugcService.analyze()` → AI with `MARKETING.UGC_ANALYZE` prompt → returns sentiment, key themes, suggested tags, marketing use cases, quotable snippet, recommended format, approval score (/10)
  - Results panel: sentiment badge, approval score gauge, key themes tags, suggested tags, marketing use cases, quotable snippet blockquote, recommended format
  - Can **Save to Library** to `ugc_items` table (migration `016_ugc_items.sql`) with auto-approval if score ≥ 7
- Library tab:
  - Lists all saved UGC items with sentiment/type/status badges
  - **Approve** / **Reject** buttons to update item status
  - Shows content preview, key themes, author, approval score

---

## Event-Driven Communication

All in-module events are emitted via `src/modules/marketing/events/emitters.ts` and consumed by `src/modules/marketing/events/listeners.ts` via the shared `eventBus`.

### Emitted Events

| Event | When | Payload | Emitter |
|---|---|---|---|
| `marketing.lead.created` | New lead inserted | `{ lead }` | `leadService.createLead` |
| `marketing.lead.scored` | Lead score updated (status changed) | `{ lead, score, reason }` | `scoringService.scoreLead` |
| `marketing.campaign.launched` | Campaign activated | `{ campaign }` | `campaignService.launchCampaign` |
| `marketing.campaign.ended` | Campaign completed | `{ campaign, metrics }` | `campaignService.completeCampaign` |
| `marketing.asset.published` | Asset saved to library | `{ asset }` | Various save methods |
| `marketing.rule.created` | Scoring rule created | `{ rule }` | `scoringService.createRule` |
| `marketing.rule.updated` | Scoring rule modified | `{ rule }` | `scoringService.updateRule` |
| `marketing.rule.deleted` | Scoring rule removed | `{ ruleId, ruleName }` | `scoringService.deleteRule` |

### Listened Events

| Event | Reaction |
|---|---|
| `sales.order.confirmed` | Attribute sale to campaign via `analyticsService.attributeSaleToCamera` |
| `crm.contact.converted` | Mark matching lead as converted |
| `crm.deal.lost` | Log failure for channel-quality analysis |
| `project.completed` | Auto-generate LinkedIn case study post via AI, save as asset |
| `marketing.lead.scored` | If score ≥ 70 and lead just qualified, log for CRM promotion |
| `marketing.rule.created` | Log new rule creation (extensible: notify team, validate thresholds) |
| `marketing.rule.deleted` | Log rule removal (extensible: check impacted campaigns) |

### Flow Example: Lead Scoring Pipeline

```
User clicks "Score & Save" in LeadScoringWorkbench
  → scoringService.scoreLead(leadId)
    → evaluateLead() computes breakdown against active rules
    → Updates marketing_leads.score + status in DB
    → Writes scoring_history audit rows for each matched rule
    → If status changed: emitters.leadScored(lead, score, reason)
      → listener catches marketing.lead.scored
        → Logs qualification event (extensible: push to CRM, trigger automation)
```
