import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tags = searchParams.get("tags") || ""
  const pid = searchParams.get("pid") || "0"
  const apiKey = searchParams.get("api_key") || ""
  const userId = searchParams.get("user_id") || ""
  const limit = searchParams.get("limit") || "1000"

  console.log("[v0] Rule34 API request:", { tags, pid, limit, apiKey: apiKey ? "***" : "none", userId })

  try {
    const cleanTags = tags.trim().replace(/\s+/g, " ")

    const finalApiKey = apiKey || process.env.RULE34_API_KEY || ""
    const finalUserId = userId || process.env.RULE34_USER_ID || ""

    const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${limit}&tags=${encodeURIComponent(cleanTags)}&pid=${pid}&api_key=${finalApiKey}&user_id=${finalUserId}`

    console.log("[v0] Fetching from Rule34:", url.replace(finalApiKey, "***"))

    const response = await fetch(url, {
      headers: {
        "User-Agent": "BlackOracle/1.0",
      },
    })

    console.log("[v0] Rule34 response status:", response.status)

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const text = await response.text()
    console.log("[v0] Rule34 response text length:", text.length)

    if (!text || text.trim().length === 0) {
      console.log("[v0] Empty response from Rule34 API - no more results")
      return NextResponse.json({ posts: [] })
    }

    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      console.log("[v0] Response text preview:", text.substring(0, 200))
      return NextResponse.json({ posts: [] })
    }

    console.log("[v0] Rule34 data received:", Array.isArray(data) ? `${data.length} posts` : typeof data)

    const posts = Array.isArray(data) ? data : data.posts || []

    return NextResponse.json({
      posts: posts.map((post: any) => ({
        id: post.id,
        preview_url: post.preview_url,
        file_url: post.file_url,
        sample_url: post.sample_url || post.file_url,
        tags: post.tags,
        score: post.score,
        rating: post.rating,
        width: post.width,
        height: post.height,
        file_type: post.file_url?.includes(".gif")
          ? "gif"
          : post.file_url?.includes(".mp4") || post.file_url?.includes(".webm")
            ? "video"
            : "image",
      })),
    })
  } catch (error) {
    console.error("[v0] Rule34 API error:", error)
    return NextResponse.json({ error: "Failed to fetch from Rule34 API" }, { status: 500 })
  }
}
