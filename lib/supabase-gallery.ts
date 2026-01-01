import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { auth } from "./firebase"

export interface GalleryItem {
  id: string
  character_id: string
  embed_code: string
  media_type: "embed" | "video" | "image"
  created_at: string
  updated_at: string
  user_id: string
}

async function getFirebaseUserId(): Promise<string | null> {
  if (typeof window === "undefined") {
    console.log("[v0] Not in browser environment")
    return null
  }

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

// Client-side functions for gallery management
export async function addGalleryItem(
  characterId: string,
  embedCode: string,
  mediaType: "embed" | "video" | "image",
): Promise<GalleryItem | null> {
  try {
    const supabase = createBrowserClient()
    const userId = await getFirebaseUserId()

    if (!userId) {
      console.warn("[v0] No user ID available for gallery item - attempting anonymous insert")
      // Try anonymous insert (may fail due to RLS policies)
      const { data, error } = await supabase
        .from("character_gallery")
        .insert({
          character_id: characterId,
          embed_code: embedCode,
          media_type: mediaType,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error adding gallery item anonymously:", error)
        return null
      }

      return data
    }

    const { data, error } = await supabase
      .from("character_gallery")
      .insert({
        character_id: characterId,
        embed_code: embedCode,
        media_type: mediaType,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding gallery item:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Exception in addGalleryItem:", error)
    return null
  }
}

export async function getGalleryItems(characterId: string): Promise<GalleryItem[]> {
  try {
    const supabase = createBrowserClient()
    const userId = await getFirebaseUserId()

    if (!userId) {
      console.warn("[v0] No user ID available for fetching gallery items - using anonymous access")
      // Try to fetch without user filter for anonymous access
      const { data, error } = await supabase
        .from("character_gallery")
        .select("*")
        .eq("character_id", characterId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching gallery items anonymously:", error)
        return []
      }

      return data || []
    }

    const { data, error } = await supabase
      .from("character_gallery")
      .select("*")
      .eq("character_id", characterId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching gallery items:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Exception in getGalleryItems:", error)
    return []
  }
}

export async function deleteGalleryItem(itemId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient()
    const userId = await getFirebaseUserId()

    if (!userId) {
      console.warn("[v0] No user ID available for deleting gallery item")
      return false
    }

    const { error } = await supabase.from("character_gallery").delete().eq("id", itemId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error deleting gallery item:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Exception in deleteGalleryItem:", error)
    return false
  }
}

export async function bulkAddGalleryItems(
  characterId: string,
  items: Array<{ embedCode: string; mediaType: "embed" | "video" | "image" }>,
): Promise<GalleryItem[]> {
  try {
    const supabase = createBrowserClient()
    const userId = await getFirebaseUserId()

    if (!userId) {
      console.warn("[v0] No user ID available for bulk adding gallery items")
      return []
    }

    const insertData = items.map((item) => ({
      character_id: characterId,
      embed_code: item.embedCode,
      media_type: item.mediaType,
      user_id: userId,
    }))

    const { data, error } = await supabase.from("character_gallery").insert(insertData).select()

    if (error) {
      console.error("[v0] Error bulk adding gallery items:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Exception in bulkAddGalleryItems:", error)
    return []
  }
}
