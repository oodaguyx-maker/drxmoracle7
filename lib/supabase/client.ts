import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase environment variables not configured")
    return createBrowserClient("https://placeholder.supabase.co", "placeholder-key")
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Helper function to set auth token on the client
export async function setSupabaseAuthToken() {
  if (!supabaseClient || typeof window === "undefined") return

  try {
    const { auth } = await import("./firebase")
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken()
      supabaseClient.auth.setAuth(token)
      console.log("[v0] Supabase auth token set")
    }
  } catch (error) {
    console.error("[v0] Failed to set Supabase auth token:", error)
  }
}
