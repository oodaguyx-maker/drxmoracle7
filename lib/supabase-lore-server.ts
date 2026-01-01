import { createClient as createServerClient } from "@/lib/supabase/server"
import type { LoreEntry } from "@/lib/storage"
import { auth } from "./firebase"

async function getFirebaseUserId(): Promise<string | null> {
  if (!auth) {
    console.error("[v0] Firebase not configured")
    return null
  }

  const user = auth.currentUser
  if (!user) {
    console.error("[v0] No Firebase user authenticated")
    return null
  }

  return user.uid
}

// Server-side version of getRelevantLore for API routes
export async function getRelevantLoreFromSupabase(
  text: string,
  characterId?: string,
  personaId?: string,
  lorebookIds?: string[],
): Promise<LoreEntry[]> {
  if (!lorebookIds || lorebookIds.length === 0) return []

  const supabase = await createServerClient()

  const userId = await getFirebaseUserId()
  if (!userId) return []

  // Get all entries from specified lorebooks
  const { data, error } = await supabase
    .from("lore_entries")
    .select("*")
    .eq("user_id", userId)
    .in("lorebook_id", lorebookIds)

  if (error) {
    console.error("[v0] Error fetching lore for injection:", error)
    return []
  }

  if (!data) return []

  // Filter entries whose keys are triggered in the text
  const lowerText = text.toLowerCase()
  const triggered = data.filter((entry) => {
    return entry.keys?.some((key: string) => lowerText.includes(key.toLowerCase()))
  })

  // Sort by importance
  const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 }
  triggered.sort((a, b) => {
    const aScore = importanceOrder[a.importance as keyof typeof importanceOrder] || 2
    const bScore = importanceOrder[b.importance as keyof typeof importanceOrder] || 2
    return bScore - aScore
  })

  // Return top 10 most relevant, convert to LoreEntry format
  return triggered.slice(0, 10).map((entry) => ({
    id: entry.id,
    name: entry.name,
    content: entry.content,
    keys: entry.keys || [],
    lorebookId: entry.lorebook_id,
    importance: entry.importance as "low" | "medium" | "high" | "critical",
    category: entry.category,
    subcategory: entry.subcategory,
    entryType: entry.entry_type,
    tags: entry.tags || [],
    relatedEntries: entry.related_entries || [],
    generatedFromRoleplay: entry.generated_from_roleplay || false,
    sourceNodeId: entry.source_node_id,
    sourceCharacterId: entry.source_character_id,
    mapPosition: entry.map_position,
    createdAt: new Date(entry.created_at).getTime(),
    updatedAt: new Date(entry.updated_at).getTime(),
  }))
}
