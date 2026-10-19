Your edge function has a few common Supabase/Deno issues that can prevent it from running both in the editor and locally.

The biggest problem is this import:

```ts
import { PROMPTS } from "../src/modules/marketing/constants/prompts.ts";
```

In Supabase Edge Functions, you cannot import arbitrary files from your frontend/project source tree unless those files are inside the function directory itself or explicitly bundled for Deno deployment.

Also, `gemini-pro` is deprecated/changed in newer Gemini APIs.

Here is a corrected and production-safe version.

```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/*
  IMPORTANT:
  In Supabase Edge Functions, keep prompts inside the function
  or import from a local file INSIDE the functions folder.
*/

const PROMPTS = {
  POST: {
    INSTAGRAM: (inputs: any) =>
      `Write an Instagram post about ${inputs.topic}`,
  },

  EMAIL: {
    SALES: (inputs: any) =>
      `Write a sales email for ${inputs.product}`,
  },

  CTA_SUGGESTIONS: "Generate 5 CTA suggestions",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    const { promptKey, inputs } = body;

    let promptTemplate: any;

    const promptParts = promptKey.split(".");

    if (promptParts[0] === "POST") {
      promptTemplate =
        PROMPTS.POST[
          promptParts[1] as keyof typeof PROMPTS.POST
        ];
    } else if (promptParts[0] === "EMAIL") {
      promptTemplate =
        PROMPTS.EMAIL[
          promptParts[1] as keyof typeof PROMPTS.EMAIL
        ];
    } else if (promptKey === "CTA_SUGGESTIONS") {
      promptTemplate = PROMPTS.CTA_SUGGESTIONS;
    }

    if (!promptTemplate) {
      return new Response(
        JSON.stringify({
          error: "Prompt key not found",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const finalPrompt =
      typeof promptTemplate === "function"
        ? promptTemplate(inputs)
        : promptTemplate;

    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: finalPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiResponse.json();

    console.log("Gemini response:", data);

    if (!data.candidates) {
      return new Response(
        JSON.stringify({
          error: data,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const contentText =
      data.candidates[0].content.parts[0].text;

    return new Response(contentText, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
```

Main issues in your original code:

1. Invalid import path for Supabase Edge Functions

This usually breaks deployment:

```ts
import { PROMPTS } from "../src/modules/marketing/constants/prompts.ts";
```

Move `prompts.ts` into:

```bash
supabase/functions/your-function/prompts.ts
```

Then import like:

```ts
import { PROMPTS } from "./prompts.ts";
```

---

2. Old Gemini model

Replace:

```ts
gemini-pro
```

with:

```ts
gemini-1.5-flash
```

or:

```ts
gemini-1.5-pro
```

---

3. Missing null checks

This line can crash:

```ts
data.candidates[0].content.parts[0].text
```

if Gemini returns an error.

---

4. Supabase Edge Functions require Deno-compatible imports

No Node.js imports.
No npm packages unless using:

```ts
npm:
```

syntax supported by Deno.

---

5. Environment variable setup

In Supabase:

Project Settings → Edge Functions → Secrets

Add:

```bash
GEMINI_API_KEY=your_key
```

---

Correct local structure:

```bash
supabase/
└── functions/
    └── ai-marketing/
        ├── index.ts
        └── prompts.ts
```

---

Deploy command:

```bash
supabase functions deploy ai-marketing
```

Invoke:

```bash
supabase functions invoke ai-marketing \
  --body '{"promptKey":"CTA_SUGGESTIONS","inputs":{}}'
```

---

If the CLI installation failed on Ubuntu, it is often because of:

* old Node version
* broken npm global permissions
* missing `libssl`
* using snap Node instead of nvm Node

Recommended installation on Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

npm install -g supabase
```

Then verify:

```bash
supabase --version
```

