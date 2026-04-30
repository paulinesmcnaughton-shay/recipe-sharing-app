import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
    )
  }

  return { supabaseUrl, supabasePublishableKey }
}

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv()

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey)
}
