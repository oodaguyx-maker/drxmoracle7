import { createClient as createBrowserClient, setSupabaseAuthToken } from "@/lib/supabase/client"
import type { Lorebook, LoreEntry, ProposedLoreCard } from "@/lib/storage"
import { auth } from "./firebase"

function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers and Node 16+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

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

// ===== LOREBOOK FUNCTIONS =====

export async function getLorebooksFromSupabase(serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from("lorebooks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching lorebooks:", error)
    return []
  }

  return (
    data?.map((lb) => ({
      id: lb.id,
      name: lb.name,
      description: lb.description || "",
      entries: [], // Will be populated separately
      worldMapUrl: lb.world_map_url,
      worldMapData: lb.world_map_data,
      createdAt: new Date(lb.created_at).getTime(),
      updatedAt: new Date(lb.updated_at).getTime(),
    })) || []
  )
}

export async function saveLorebookToSupabase(lorebook: any, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) throw new Error("User not authenticated")

  const lorebookData = {
    user_id: userId,
    name: lorebook.name,
    description: lorebook.description,
    world_map_url: lorebook.worldMapUrl,
    world_map_data: lorebook.worldMapData,
    updated_at: new Date().toISOString(),
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lorebook.id)

  if (isUUID) {
    // Try to find existing lorebook with this UUID
    const { data: existing } = await supabase.from("lorebooks").select("id").eq("id", lorebook.id).single()

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from("lorebooks")
        .update(lorebookData)
        .eq("id", lorebook.id)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  // Insert new record (let Supabase generate UUID or use provided UUID)
  const insertData = isUUID ? { id: lorebook.id, ...lorebookData } : lorebookData
  const { data, error } = await supabase.from("lorebooks").insert(insertData).select().single()

  if (error) throw error
  return data
}

export async function deleteLorebookFromSupabase(lorebookId: string, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) throw new Error("User not authenticated")

  const { error } = await supabase.from("lorebooks").delete().eq("id", lorebookId).eq("user_id", userId)

  if (error) throw error
}

// ===== LORE ENTRY FUNCTIONS =====

export async function getLoreEntriesFromSupabase(lorebookId?: string, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) return []

  let query = supabase.from("lore_entries").select("*").eq("user_id", userId)

  if (lorebookId) {
    query = query.eq("lorebook_id", lorebookId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching lore entries:", error)
    return []
  }

  return (
    data?.map((entry) => ({
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
    })) || []
  )
}

export async function saveLoreEntryToSupabase(entry: any, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) throw new Error("User not authenticated")

  const entryData = {
    user_id: userId,
    lorebook_id: entry.lorebookId || null,
    name: entry.name,
    content: entry.content,
    keys: entry.keys,
    importance: entry.importance || "medium",
    category: entry.category,
    subcategory: entry.subcategory,
    entry_type: entry.entryType,
    tags: entry.tags || [],
    related_entries: entry.relatedEntries || [],
    generated_from_roleplay: entry.generatedFromRoleplay || false,
    source_node_id: entry.sourceNodeId,
    source_character_id: entry.sourceCharacterId,
    map_position: entry.mapPosition,
    updated_at: new Date().toISOString(),
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.id)

  if (isUUID) {
    // Try to find existing entry with this UUID
    const { data: existing } = await supabase.from("lore_entries").select("id").eq("id", entry.id).single()

    if (existing) {
      // Update
      const { data, error } = await supabase.from("lore_entries").update(entryData).eq("id", entry.id).select().single()

      if (error) throw error
      return data
    }
  }

  // Insert new record (let Supabase generate UUID or use provided UUID)
  const insertData = isUUID ? { id: entry.id, ...entryData } : entryData
  const { data, error } = await supabase.from("lore_entries").insert(insertData).select().single()

  if (error) throw error
  return data
}

export async function deleteLoreEntryFromSupabase(entryId: string, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) throw new Error("User not authenticated")

  const { error } = await supabase.from("lore_entries").delete().eq("id", entryId).eq("user_id", userId)

  if (error) throw error
}

// ===== PROPOSED LORE CARD FUNCTIONS =====

export async function getProposedLoreCardsFromSupabase(conversationId?: string, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) return []

  let query = supabase.from("proposed_lore_cards").select("*").eq("user_id", userId).eq("status", "pending")

  if (conversationId) {
    query = query.eq("conversation_id", conversationId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching proposed lore cards:", error)
    return []
  }

  return (
    data?.map((card) => ({
      id: card.id,
      name: card.name,
      content: card.content,
      keys: card.keys || [],
      importance: card.importance as "low" | "medium" | "high" | "critical",
      category: card.category,
      subcategory: card.subcategory,
      entryType: card.entry_type,
      tags: card.tags || [],
      conversationId: card.conversation_id,
      timestamp: new Date(card.created_at).getTime(),
    })) || []
  )
}

export async function saveProposedLoreCardToSupabase(card: ProposedLoreCard, serverMode = false) {
  const supabase = createBrowserClient()
  await setSupabaseAuthToken()

  const userId = await getFirebaseUserId()
  if (!userId) throw new Error("User not authenticated")

  const cardData = {
    user_id: userId,
    conversation_id: card.conversationId,
    name: card.name,
    content: card.content,
    keys: card.keys,
    importance: card.importance,
    category: card.category,
    subcategory: card.subcategory,
    entry_type: card.entryType,
    tags: card.tags || [],
    status: "pending",
  }

  console.log("[v0] Saving proposed lore card to Supabase:", { userId, cardId: card.id, cardData })

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(card.id)

  if (isUUID) {
    // Try to find existing card with this UUID
    const { data: existing, error: selectError } = await supabase.from("proposed_lore_cards").select("id").eq("id", card.id).single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("[v0] Error checking existing card:", selectError)
      throw selectError
    }

    if (existing) {
      // Update
      console.log("[v0] Updating existing card")
      const { data, error } = await supabase
        .from("proposed_lore_cards")
        .update(cardData)
        .eq("id", card.id)
        .select()
        .single()

      if (error) {
        console.error("[v0] Error updating card:", error)
        throw error
      }
      console.log("[v0] Card updated successfully")
      return data
    }
  }

  // Insert new record (let Supabase generate UUID or use provided UUID)
  console.log("[v0] Inserting new card")
  const insertData = isUUID ? { id: card.id, ...cardData } : cardData
  const { data, error } = await supabase.from("proposed_lore_cards").insert(insertData).select().single()

  if (error) {
    console.error("[v0] Error inserting card:", error)
    throw error
  }
  console.log("[v0] Card inserted successfully")
  return data
}

export async function acceptProposedLoreCardInSupabase(cardId: string, lorebookId?: string, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) throw new Error("User not authenticated")

  // Get the proposed card
  const { data: card, error: fetchError } = await supabase
    .from("proposed_lore_cards")
    .select("*")
    .eq("id", cardId)
    .eq("user_id", userId)
    .single()

  if (fetchError || !card) throw new Error("Card not found")

  // Create lore entry from card
  const { data: newEntry, error: insertError } = await supabase
    .from("lore_entries")
    .insert({
      user_id: userId,
      lorebook_id: lorebookId || null,
      name: card.name,
      content: card.content,
      keys: card.keys,
      importance: card.importance,
      category: card.category,
      subcategory: card.subcategory,
      entry_type: card.entry_type,
      tags: card.tags,
      generated_from_roleplay: false,
    })
    .select()
    .single()

  if (insertError) throw insertError

  // Mark card as approved and delete
  await supabase.from("proposed_lore_cards").delete().eq("id", cardId).eq("user_id", userId)

  return newEntry
}

export async function deleteProposedLoreCardFromSupabase(cardId: string, serverMode = false) {
  const supabase = createBrowserClient()

  const userId = await getFirebaseUserId()
  if (!userId) throw new Error("User not authenticated")

  const { error } = await supabase.from("proposed_lore_cards").delete().eq("id", cardId).eq("user_id", userId)

  if (error) throw error
}

// ===== UTILITY FUNCTION FOR LORE INJECTION =====

export async function getRelevantLoreFromSupabase(
  text: string,
  characterId?: string,
  personaId?: string,
  lorebookIds?: string[],
  serverMode = false,
): Promise<LoreEntry[]> {
  if (!lorebookIds || lorebookIds.length === 0) return []

  const supabase = createBrowserClient()

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
