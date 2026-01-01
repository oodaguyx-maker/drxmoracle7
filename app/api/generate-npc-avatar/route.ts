import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { tags } = await req.json()

    if (!tags || tags.length === 0) {
      return NextResponse.json({ error: "No tags provided" }, { status: 400 })
    }

    // Select a random tag from the favorites
    const randomTag = tags[Math.floor(Math.random() * tags.length)]

    // Search realbooru with the random tag
    const booru = "realbooru"
    const limit = 20
    const pid = Math.floor(Math.random() * 100) // Random page for variety

    const url = `https://${booru}.com/index.php?page=dapi&s=post&q=index&limit=${limit}&pid=${pid}&tags=${encodeURIComponent(randomTag)}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Booru API error: ${response.statusText}`)
    }

    const text = await response.text()

    // Parse XML manually
    const postMatches = text.matchAll(
      /<post[^>]*file_url="([^"]*)"[^>]*score="([^"]*)"[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*>/g,
    )

    const posts = Array.from(postMatches).map((match) => ({
      file_url: match[1],
      score: Number.parseInt(match[2]) || 0,
      width: Number.parseInt(match[3]) || 0,
      height: Number.parseInt(match[4]) || 0,
    }))

    if (posts.length === 0) {
      return NextResponse.json({ error: "No images found" }, { status: 404 })
    }

    // Select a random post
    const randomPost = posts[Math.floor(Math.random() * posts.length)]

    return NextResponse.json({ avatarUrl: randomPost.file_url })
  } catch (error) {
    console.error("[v0] NPC avatar generation error:", error)
    return NextResponse.json({ error: "Failed to generate NPC avatar" }, { status: 500 })
  }
}
