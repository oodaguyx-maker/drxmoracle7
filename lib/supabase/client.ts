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
    // Create a dummy client that won't work but won't crash
    return createBrowserClient("https://placeholder.supabase.co", "placeholder-key")
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // Set up auth state change listener to automatically set tokens
  if (typeof window !== "undefined") {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        console.log("[v0] Supabase auth state changed, token available")
      } else if (event === "SIGNED_OUT") {
        console.log("[v0] Supabase user signed out")
      }
    })
  }

  return supabaseClient
}

// Helper function to set auth token on the client
export async function setSupabaseAuthToken() {
  if (!supabaseClient || typeof window === "undefined") return

  try {
    // Check if Firebase SDK is loaded and available
    if (typeof window !== "undefined" && (window.firebase || (window as any).firebase)) {
      const { auth } = await import("./firebase").catch(() => ({ auth: null }))
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken()
        supabaseClient.auth.setAuth(token)
        console.log("[v0] Supabase auth token set successfully")
      } else {
        console.log("[v0] No Firebase user authenticated, using anonymous access")
      }
    } else {
      console.log("[v0] Firebase SDK not loaded, using anonymous Supabase access")
    }
  } catch (error) {
    console.error("[v0] Failed to set Supabase auth token:", error)
    console.log("[v0] Continuing with anonymous Supabase access")
  }
}
