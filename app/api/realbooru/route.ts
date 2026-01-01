import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tags = searchParams.get("tags") || ""
  const pid = searchParams.get("pid") || "0"
  const limit = searchParams.get("limit") || "100"

  console.log("[v0] Realbooru API request:", { tags, pid, limit })

  try {
    const cleanTags = tags
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0)
      .join(" ")

    const actualLimit = Math.min(Number.parseInt(limit), 100)

    const url = `https://realbooru.com/index.php?page=dapi&s=post&q=index&limit=${actualLimit}&tags=${encodeURIComponent(cleanTags)}&pid=${pid}`

    console.log("[v0] Fetching from Realbooru:", url)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "BlackOracle/1.0",
      },
    })

    console.log("[v0] Realbooru response status:", response.status)

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const text = await response.text()
    console.log("[v0] Realbooru response text length:", text.length)

    if (!text || text.trim().length === 0) {
      console.log("[v0] Empty response from Realbooru API")
      return NextResponse.json({ posts: [], error: "Empty response from Realbooru" })
    }

    if (text.trim().startsWith("<?xml")) {
      console.log("[v0] Parsing Realbooru XML response")

      // Check for API error in XML
      if (text.includes('reason="')) {
        const reasonMatch = text.match(/reason="([^"]+)"/)
        const errorMessage = reasonMatch ? reasonMatch[1] : "Realbooru API error"
        console.log("[v0] Realbooru API error:", errorMessage)

        return NextResponse.json({
          posts: [],
          error: errorMessage,
          apiOffline: true,
        })
      }

      // Parse XML posts
      const posts: any[] = []
      const postMatches = text.matchAll(/<post([^>]+)\/>/g)

      for (const match of postMatches) {
        const attrs = match[1]
        const post: any = {}

        // Extract attributes from XML
        const attrMatches = attrs.matchAll(/(\w+)="([^"]+)"/g)
        for (const attrMatch of attrMatches) {
          post[attrMatch[1]] = attrMatch[2]
        }

        if (post.id && post.file_url) {
          posts.push({
            id: post.id,
            preview_url: post.preview_url || post.sample_url || post.file_url,
            file_url: post.file_url,
            sample_url: post.sample_url || post.file_url,
            tags: post.tags || "",
            score: post.score ? Number.parseInt(post.score) : 0,
            rating: post.rating || "unknown",
            width: post.width ? Number.parseInt(post.width) : 0,
            height: post.height ? Number.parseInt(post.height) : 0,
            file_type: post.file_url?.includes(".gif")
              ? "gif"
              : post.file_url?.includes(".mp4") || post.file_url?.includes(".webm")
                ? "video"
                : "image",
          })
        }
      }

      console.log("[v0] Realbooru XML parsed:", posts.length, "posts")

      return NextResponse.json({ posts })
    }

    // Fallback: try JSON parsing (shouldn't happen with beta 0.2 API)
    try {
      const data = JSON.parse(text)
      const posts = Array.isArray(data) ? data : data.posts || data.post || []

      return NextResponse.json({
        posts: posts.map((post: any) => ({
          id: post.id,
          preview_url: post.preview_url,
          file_url: post.file_url,
          sample_url: post.sample_url || post.file_url,
          tags: post.tags,
          score: post.score ? Number.parseInt(post.score) : 0,
          rating: post.rating,
          width: post.width ? Number.parseInt(post.width) : 0,
          height: post.height ? Number.parseInt(post.height) : 0,
          file_type: post.file_url?.includes(".gif")
            ? "gif"
            : post.file_url?.includes(".mp4") || post.file_url?.includes(".webm")
              ? "video"
              : "image",
        })),
      })
    } catch (parseError) {
      console.error("[v0] Failed to parse response:", parseError)
      return NextResponse.json({
        posts: [],
        error: "Failed to parse Realbooru response",
      })
    }
  } catch (error) {
    console.error("[v0] Realbooru API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch from Realbooru API",
        posts: [],
      },
      { status: 500 },
    )
  }
}
