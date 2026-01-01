import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tags = searchParams.get("tags") || ""
  const source = searchParams.get("source") || "rule34"

  console.log("[v0] Tag correction request:", { tags, source })

  try {
    const tagArray = tags.split(/\s+/).filter((t) => t.length > 0)
    const correctedTags: string[] = []

    for (const tag of tagArray) {
      const autocompleteUrl =
        source === "realbooru"
          ? `https://realbooru.com/autocomplete.php?q=${encodeURIComponent(tag)}`
          : `https://api.rule34.xxx/autocomplete.php?q=${encodeURIComponent(tag)}`

      try {
        const response = await fetch(autocompleteUrl, {
          headers: {
            "User-Agent": "BlackOracle/1.0",
          },
        })

        if (response.ok) {
          const suggestions = await response.json()
          if (Array.isArray(suggestions) && suggestions.length > 0) {
            // Use the first suggestion as the corrected tag
            const corrected = suggestions[0].value || suggestions[0].label || suggestions[0]
            correctedTags.push(corrected)
            console.log(`[v0] Corrected "${tag}" to "${corrected}"`)
          } else {
            // No suggestions, keep original but try with underscores
            const withUnderscore = tag.replace(/[\s-]+/g, "_")
            correctedTags.push(withUnderscore)
            console.log(`[v0] No suggestions for "${tag}", using "${withUnderscore}"`)
          }
        } else {
          correctedTags.push(tag)
        }
      } catch (error) {
        console.error(`[v0] Error correcting tag "${tag}":`, error)
        correctedTags.push(tag)
      }
    }

    const correctedTagString = correctedTags.join(" ")
    console.log("[v0] Corrected tags:", correctedTagString)

    return NextResponse.json({
      original: tags,
      corrected: correctedTagString,
      tags: correctedTags,
    })
  } catch (error) {
    console.error("[v0] Tag correction error:", error)
    return NextResponse.json({ error: "Failed to correct tags" }, { status: 500 })
  }
}
