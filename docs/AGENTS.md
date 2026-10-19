# AGENTS.md - Ayech AI

Digital agency operating system for hybrid agencies in Tunisia.

## 🛠 Developer Commands

- **Dev**: `npm run dev` (Vite, port 3000)
- **Build**: `npm run build`
- **Lint/Typecheck**: `npm run lint` (`tsc --noEmit`)
- **Clean**: `npm run clean`

## ⚙️ Setup & Environment

- **API Key**: `GEMINI_API_KEY` required in `.env.local`.
- **Dependencies**: Use `npm install`.

## 🏗 Architecture

- **Primary Source**: All active code is in `src/`.
- **Ignored Folders**: `apps/`, `packages/`, and `modules/` are currently empty/placeholders; ignore them in favor of `src/`.
- **Tech Stack**: React 19, Vite, Tailwind CSS 4, `@google/genai`, Supabase.
- **i18n**: Supports English, French, and Arabic (RTL).

## 🗺 Core Modules & Routes

- **Business Advisory** (`/business`): Idea Validator, Pricing, Profit Calc, Business Plan, Market Analysis.
- **Marketing & Sales** (`/marketing`): Post Generator, Ad Copy, Product Descriptions, WhatsApp Templates, Campaign Planner, Sales Scripts, Conversion Optimizer.
- **Customer Support** (`/support`): Reply Generator, Objection Handler, FAQ Builder, Conversation Simulator, Complaint Resolver.
- **Digital Strategy** (`/strategy`): Go Digital Guide, Website Auditor, Funnel Builder, Lead Gen Planner.
- **Automation Hub** (`/automation`): Workflow Builder, Template Library, Integrations, Dashboard.

## 🎨 Conventions

- **Styling**: Tailwind CSS 4.
- **Components**: shadcn/ui patterns.
- **Routing**: React Router (verify in `src/main.tsx` or `App.tsx`).

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **prod-ayech-ai-google** (2352 symbols, 4180 relationships, 86 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do
 
- **MUST run `npm run lint` after every task** to verify that changes didn't introduce TypeScript errors or linting regressions.
- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.

- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/prod-ayech-ai-google/context` | Codebase overview, check index freshness |
| `gitnexus://repo/prod-ayech-ai-google/clusters` | All functional areas |
| `gitnexus://repo/prod-ayech-ai-google/processes` | All execution flows |
| `gitnexus://repo/prod-ayech-ai-google/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
