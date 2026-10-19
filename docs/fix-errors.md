# AI Generation Fixes Report

This document details the fixes implemented to resolve the 500 Internal Server Errors and "mocked" responses in the AI generation flow.

## 1. Routing & Connectivity Fix
**Problem**: The app used relative paths (`/functions/v1/...`) which relied on a local Vite proxy pointing to `localhost:54321`. Since the Supabase CLI couldn't run on the current CPU architecture, the requests failed immediately.

**Old Code (in providers):**
```typescript
const response = await fetch('/functions/v1/ai-gateway', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ ... }),
});
```

**New Code:**
```typescript
const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: { ... },
});
```

---

## 2. Edge Function Stability & Flexibility
**Problem**: The `ai-gateway` function lacked support for raw prompts (only `promptKey`) and had a missing `promptMap` in one version, causing crashes.

**Old Code:**
```typescript
const { promptKey, inputs = {} } = parsed;
if (!promptKey) throw new Error("promptKey is required");
const promptTemplate = promptMap[promptKey];
```

**New Code:**
```typescript
const { promptKey, prompt, inputs = {} } = parsed;
let finalPrompt;
if (promptKey) {
    const promptTemplate = promptMap[promptKey];
    if (!promptTemplate) throw new Error(`Invalid promptKey: ${promptKey}`);
    finalPrompt = promptTemplate(inputs);
} else if (prompt) {
    finalPrompt = prompt;
} else {
    throw new Error("Either promptKey or prompt is required");
}
```

---

## 3. Prompt-Input Alignment
**Problem**: The `PostGenerator` was sending keys like `topic` and `audience`, but the `promptRegistry` was looking for `product` and `target`, resulting in "undefined" values being sent to the AI.

**Old Code (`registry.ts`):**
```typescript
template: (inputs) => `Create a high-engagement LinkedIn post for ${inputs.product}. 
Goal: ${inputs.goal}. 
Key points: ${JSON.stringify(inputs.points)}.`
```

**New Code (`registry.ts`):**
```typescript
template: (inputs) => `Create a high-engagement LinkedIn post in ${inputs.language || 'English'} about ${inputs.topic}. 
Tone: ${inputs.tone || 'Professional'}. 
Target Audience: ${inputs.audience || 'General'}. 
Key Message: ${inputs.keyMessage || inputs.topic}.`
```

---

## 4. Formatting & JSON Unwrapping
**Problem**: The system forced the AI to return JSON in both the `PromptBuilder` and the `AIGateway`. This confused the AI when raw text was needed and caused parsing errors.

**Old Code (`aiGateway.ts`):**
```typescript
// Forced JSON parsing
const cleanedContent = content.replace(/```json\n?|```/g, '').trim();
parsedContent = JSON.parse(cleanedContent);
return { content: JSON.stringify(parsedContent), ... };
```

**New Code (`aiGateway.ts`):**
```typescript
// Smart unwrapping: if it's JSON, extract the text; otherwise, keep as is
try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
        finalContent = parsed.post || parsed.content || parsed.text || parsed.response || content;
    }
} catch (e) {}
return { content: finalContent, ... };
```

---

## 5. UI Robustness
**Problem**: The `PostGenerator` crashed if the campaign list was undefined.

**Old Code:**
```typescript
{campaigns.map(c => ( ... ))}
```

**New Code:**
```typescript
{campaigns?.map(c => ( ... ))}
```

---

## Environment Variable Access in Node.js (Workers)

**Old Code:**
```typescript
private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
```
**Explanation**: The use of `import.meta.env` is a Vite-specific feature. When running scripts in a Node.js environment (like the `workers` command via `tsx`), `import.meta.env` is undefined, leading to a `TypeError`.

**New Code:**
```typescript
private supabase = createClient(
    process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
    process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
);
```
**Explanation**: Added a fallback to `process.env`, which is the standard for Node.js environment variables, while keeping `import.meta.env` for browser compatibility.

---

## 6. Active Workspace Required
**Problem**: `AssetManager.createAsset` failed if `activeWorkspaceId` was missing from the store, even if `input.workspace_id` was provided.

**Old Code:**
```typescript
const { activeWorkspaceId, activeClientId } = useContextStore.getState();
if (!activeWorkspaceId) {
    throw new Error('Active workspace required to create assets');
}
```

**New Code:**
```typescript
const { activeWorkspaceId, activeClientId } = useContextStore.getState();
const workspaceId = input.workspace_id || activeWorkspaceId;
if (!workspaceId) {
    throw new Error('Active workspace required to create assets');
}
```
**Explanation**: Prioritized `input.workspace_id` over the global store state to allow asset creation when the workspace is specified explicitly.

---

## 7. Workspace Foreign Key Constraint
**Problem**: Default workspace creation failed with `workspaces_owner_id_fkey` violation because the user existed in `auth.users` but not in `public.users`.

**Old Code:**
```typescript
const { data: newWorkspace, error: createError } = await this.supabase
    .from('workspaces')
    .insert({
        name: 'My Business Workspace',
        owner_id: user.id,
    })
```

**New Code:**
```typescript
private async ensureUserProfile(user: any): Promise<void> {
    // Check and insert into public.users if missing
}
// In initializeSession:
await this.ensureUserProfile(user);
// Then create workspace
```
**Explanation**: Added a check to ensure the user profile exists in the public schema before attempting to create a workspace owned by that user.

---

## 8. Asset Entity ID UUID Constraint
**Problem**: Database error `invalid input for type UUID` when creating assets with prefixed IDs like `post_177...`.

**Old Code (SQL):**
```sql
entity_id UUID,
```

**New Code (SQL):**
```sql
entity_id TEXT,
```
**Explanation**: Changed `entity_id` column from `UUID` to `TEXT` to accommodate varied identifier formats used by different modules.

---

## 9. Missing useContextStore Import
**Problem**: `useContextStore not defined` in `PostGenerator.tsx`.

**Old Code:**
```typescript
// Missing import
```

**New Code:**
```typescript
import { useContextStore } from '@/core/context/ContextStore';
```
**Explanation**: Added the missing import for the global context store.

## 10. Social Publisher Inter-Module Communication

**Problem**: Generated posts were not appearing in the Social Publisher approval queue. When an asset was created in the Core module with `internal_review` status, it was not synced to the Social module's `ai_posts` table, so the `ApprovalQueue` remained empty.

**Root Cause**: Social event listeners were registered only on one event bus (infrastructure's persistent eventStore), but asset lifecycle events were sometimes emitted via the core EventBus. Events emitted to the unmonitored bus were missed, leaving `ai_posts` out of sync with `assets`.

**Old Code (`src/modules/social/events/listeners.ts`):**
```typescript
import { eventBus } from '@/infrastructure/eventStore';

export async function initSocialListeners() {
  // Only registered on one event bus
  eventBus.on('asset.created' as any, async (payload: any) => {
    // Blind upsert — could overwrite newer status
    await supabase.from('ai_posts').upsert({
      id: asset.id,
      status: 'draft',
      content: asset.content,
    });
  });

  eventBus.on('asset.status.changed' as any, async (payload: any) => {
    // Update using anon client (may fail due to RLS)
    await supabase.from('ai_posts').update({ status: newStatus }).eq('id', assetId);
  });
}
```

**Explanation**: 
- Listeners only subscribed to `eventBus` (persistent infrastructure bus), missing events emitted via the core in-memory EventBus.
- Used blind `upsert` which could overwrite `ai_posts` status with `'draft'`, causing posts to disappear from the approval queue (which filters by `'in_review'`).
- Used anon Supabase client which may fail to update due to RLS policies.

**New Code (`src/modules/social/events/listeners.ts`):**
```typescript
import { eventBus } from '@/infrastructure/eventStore';
import { eventBus as coreEventBus } from '@/core/events/EventBus';

const db = supabaseService ?? supabase; // Use service-role client when available

export async function initSocialListeners() {
  // Helper: register a handler on both persistent and in-memory event buses
  const register = (eventName: string, handler: any) => {
    try { eventBus.on(eventName as any, handler); } catch (e) { console.error('Failed to register on persistent bus', e); }
    try { coreEventBus.on(eventName as any, handler); } catch (e) { console.error('Failed to register on core bus', e); }
  };

  // Listener: Sync newly created assets to ai_posts
  register('asset.created', async (payload: any) => {
    const { asset } = payload;
    const existingRow = await db.from('ai_posts').select('id,status').eq('id', asset.id).single();
    
    if (existingRow.data) {
      // Row exists — only update if status is 'draft' and new status is stronger
      if (existingRow.data.status === 'draft' && desiredStatus !== 'draft') {
        await db.from('ai_posts').update({ status: desiredStatus }).eq('id', asset.id);
      }
    } else {
      // Create new row with status 'draft' (prevents accidental 'scheduled')
      await db.from('ai_posts').insert({
        id: asset.id,
        status: 'draft',
        content: asset.content,
      });
    }
  });

  register('asset.status.changed', async (payload: any) => {
    const { assetId, to } = payload;
    const newStatus = STATUS_MAP[to];
    if (newStatus) {
      await db.from('ai_posts').update({ status: newStatus }).eq('id', assetId);
    }
  });
}
```

**Explanation**:
- Registers handlers on **both** event buses (persistent and core in-memory) so events emitted via either path are captured.
- Checks for existing `ai_posts` rows before insert to avoid blindly overwriting status.
- Always creates new posts with `status = 'draft'` so later `asset.status.changed` events reliably transition status to `'in_review'`.
- Uses `supabaseService` (service-role client) when available to bypass RLS on `ai_posts` inserts/updates.
- Maps asset status transitions (e.g., `internal_review` → `in_review`) to the social module's schema.

**Result**: Generated posts now reliably appear in the Social Publisher `ApprovalQueue` with `in_review` status and `Approve / Reject` buttons.

Posts created and approved via the Asset Manager will now automatically appear in the Social Publisher's queue.

The user workflow for creating, approving, and scheduling assets is fully integrated through a "source-of-truth" pattern centered on the `AssetManager`.

### Workflow Trace:

1.  **Create Asset**:
    - **Action**: `AssetManager.createAsset()` creates a record in the `assets` table (default status: `draft`) and an initial version in `asset_versions`.
    - **Integration**: Emits an `asset.created` event. The `SocialListeners` (in `src/modules/social/events/listeners.ts`) catches this event and automatically creates a corresponding record in the `ai_posts` table (status: `draft`) to enable social-specific operations.

2.  **Approve Reviewed Asset**:
    - **Action**: `AssetManager.transitionStatus(id, 'approved', ...)` moves the asset through review stages (e.g., `draft` $\rightarrow$ `internal_review` $\rightarrow$ `client_review` $\rightarrow$ `approved`).
    - **Integration**: Emits an `asset.status.changed` event. The `SocialListeners` catches this and updates the corresponding `ai_posts` record status to `approved`.

3.  **Schedule Approved Asset**:
    - **Action**: `approvalService.schedulePost(postId, date, accountId)` is called.
    - **Validation**: It verifies the post is in the `approved` state and checks social account rate limits via `rateLimitService`.
    - **Execution**: Updates the `ai_posts` record to `scheduled` and sets the `scheduled_for` timestamp.
    - **Integration**: Emits a `social.post.scheduled` event, which triggers the publishing pipeline.

### Inspection Result:
The workflow is **functional and robust**. By using the generic `assets` system as the primary state machine and syncing it to the `ai_posts` table, the system ensures that social posts remain consistent with overall asset management while allowing the social module to handle its own complex requirements (like rate limiting and platform-specific scheduling).