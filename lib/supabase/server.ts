import { createServerClient } from "@supabase/ssr"
import { config } from "dotenv"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

// Force-load env files for server actions in dev/runtime.
config({ path: join(process.cwd(), ".env.local") })
config({ path: join(process.cwd(), ".env") })

type EnvMap = Record<string, string>

function parseDotEnvFile() {
  try {
    const envFilePath = join(process.cwd(), ".env.local")
    const content = readFileSync(envFilePath, "utf8")
    const lines = content.split("\n")
    const parsed: EnvMap = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue

      const separatorIndex = trimmed.indexOf("=")
      if (separatorIndex <= 0) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      const rawValue = trimmed.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^['"]|['"]$/g, "")

      parsed[key] = value
    }

    return parsed
  } catch {
    return {}
  }
}

function getSupabaseEnv() {
  const env = process.env
  const fileEnv = parseDotEnvFile()
  const get = (name: string) => env[name]?.trim() || fileEnv[name]?.trim()

  const supabaseUrl =
    get("NEXT_PUBLIC_SUPABASE_URL") || get("SUPABASE_URL")
  const supabasePublishableKey =
    get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    get("SUPABASE_ANON_KEY") ||
    get("SUPABASE_PUBLISHABLE_KEY")

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    )
  }

  return { supabaseUrl, supabasePublishableKey }
}

export async function createClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv()

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component. Ignore if middleware handles refresh.
        }
      },
    },
  })
}
