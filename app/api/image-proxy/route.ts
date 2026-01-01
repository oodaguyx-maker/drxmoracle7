import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("[v0] Proxying image:", imageUrl)

    // Fetch the image from the external source
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    if (!response.ok) {
      console.error("[v0] Image fetch failed:", response.statusText)
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    // Get the image as array buffer
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    console.log("[v0] Image fetched successfully, size:", imageBuffer.byteLength)

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("[v0] Image proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 })
  }
}
