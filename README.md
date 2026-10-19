<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b1a1f64a-01c4-4ae7-ac0a-986618b3d5a2

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Architecture

- **Event-Driven Modules:** Inter-module communication uses an `EventBus` singleton (`src/core/kernel/EventBus.ts`) – no directdatabase access across module boundaries.
- **Shared Events:** All event payloads are typed and centralized in `src/shared/events.ts`.
- **ERP/CRM Modules:** Core modules (`crm`, `sales`, `inventory`, `project`, `hrm`) publish/subscribe to typed events, e.g.:
  - `crm.contact.created` → creates onboarding project
  - `sales.order.confirmed` → creates delivery project & informs inventory
  - `sales.order.cancelled` → cancels linked projects
  - `project.created` → broadcast for downstream consumers
- **Database:** Supabase with RPC functions for all CRUD operations; modules use service-role fallback when RPCs are missing.
- **State Management:** Zustand for UI state; modules lazy-loaded via React.
- **Tech Stack:** React 19, Vite, Tailwind CSS 4, shadcn/ui components.

For detailed inter-module communication and dependency graph, see `guidelines.md`.
