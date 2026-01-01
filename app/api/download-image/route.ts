import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json()

    if (!url || !filename) {
      return NextResponse.json({ error: "Missing url or filename" }, { status: 400 })
    }

    console.log("[v0] Downloading image from:", url)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch image, status:", response.status)
      return NextResponse.json({ error: `Failed to fetch image: ${response.statusText}` }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    console.log("[v0] Image content type:", contentType)

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Instead, return the image directly to the client for download
    console.log("[v0] Image downloaded successfully, size:", buffer.length)

    // Return the actual image blob for download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] Error downloading image:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to save image"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
