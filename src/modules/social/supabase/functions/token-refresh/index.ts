import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { social_account_id } = await req.json()

    if (!social_account_id) {
      return new Response(JSON.stringify({ error: "Missing social_account_id" }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // 1. Get the vault_access_id for the account
    const { data: account, error: accountErr } = await supabase
      .from("social_accounts")
      .select("vault_access_id, platform")
      .eq("id", social_account_id)
      .single()

    if (accountErr || !account) {
      return new Response(JSON.stringify({ error: "Account not found" }), { status: 404 })
    }

    // 2. Retrieve the secret from Vault
    // We use a RPC call because direct access to vault schema is restricted
    const { data: secret, error: secretErr } = await supabase.rpc("get_vault_secret", {
      secret_id: account.vault_access_id,
    })

    if (secretErr || !secret) {
      return new Response(JSON.stringify({ error: "Could not retrieve token from vault" }), { status: 500 })
    }

    // 3. For OAuth platforms, we might need to refresh the token here.
    // For now, we return the stored access_token. 
    // If it's expired, the n8n workflow will get a 401 and trigger a retry.

    return new Response(
      JSON.stringify({
        access_token: secret,
        platform: account.platform,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
