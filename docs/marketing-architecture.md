# Marketing Tools — Architecture Patterns

## Pattern Legend

| Pattern | Description |
|---|---|
| **AI Prompt** | Calls `ai.generate()` with a registered prompt key |
| **Pure Calc** | Synchronous computation, no I/O |
| **DB CRUD** | Reads/writes Supabase tables |
| **Events Emit** | Emits events via `eventBus.emit()` |
| **Events Listen** | Subscribes via `eventBus.on()` |
| **Asset Save** | Persists result via `assets.createAsset()` |

## Tool Patterns

| Tool | AI Prompt | Pure Calc | DB CRUD | Events Emit | Events Listen | Asset Save |
|---|---|---|---|---|---|---|
| **LandingPageWriter** | `LANDING_PAGE.AIDA` / `LANDING_PAGE.PAS` | — | — | — | — | `assets.createAsset` |
| **CompetitorAnalyzer** | `COMPETITOR.GAP_ANALYSIS` / `COMPETITOR.COUNTER_ANGLE` | — | `competitors` table | — | — | `assets.createAsset` |
| **ConversionOptimizer** | `CONVERSION.OPTIMIZE` | — | — | — | — | `assets.createAsset` |
| **PersonaBuilder** | `PERSONA.ICP_BUILDER` | — | `personas` table | — | — | — |
| **LeadScoringWorkbench** | — | Rule evaluation, status determination | `scoring_rules`, `marketing_leads`, `scoring_history`, `touchpoints` | `ruleCreated`, `ruleUpdated`, `ruleDeleted`, `leadScored` | — | — |
| **ROICalculator** | — | Channel projections, ROAS, CPA, break-even, what-if scenarios | — | — | — | `assets.createAsset` |
| **SEOMetaGenerator** | `SEO.META_TAGS` | — | `seo_pages` | — | — | — |
| **ABTestDesigner** | `MARKETING.AB_TEST_VARIANTS` | Sample size (z-test), significance (erf approximation) | `ab_tests` | — | — | — |
| **UGCCollector** | `MARKETING.UGC_ANALYZE` | — | `ugc_items` | — | — | — |

## Event Infrastructure

| File | AI Prompt | Pure Calc | DB CRUD | Events Emit | Events Listen | Asset Save |
|---|---|---|---|---|---|---|
| **emitters.ts** | — | — | — | 8 event types | — | — |
| **listeners.ts** | `POST.LINKEDIN` | — | `marketing_leads` | — | 7 events | `assets.createAsset` |

## Key Design Decisions

- **Creative tools** (Landing Page, Competitor, Conversion, Persona, SEO, AB Test variants, UGC) use **AI prompts** from the registry
- **Analytical tools** (Lead Scoring rules, ROI, AB Test statistics) use **pure calculations** — no AI, deterministic results
- **Persistence** uses Supabase directly with RLS — each tool has its own dedicated table
- **Cross-module communication** uses the event bus: scoring events flow to listeners, `project.completed` triggers LinkedIn post generation
- **Asset saves** are used when the output should appear in the content library
