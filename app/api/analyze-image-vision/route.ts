import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { imageUrl, apiKey } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY

    if (!openRouterKey) {
      return NextResponse.json({ error: "OpenRouter API key required" }, { status: 400 })
    }

    console.log("[v0] Analyzing image with vision model...")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://blackoracle.app",
      },
      body: JSON.stringify({
        model: "sao10k/l3.3-euryale-70b:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image in detail and provide: 1) Main tags describing what you see (comma-separated), 2) Art style, 3) Character descriptions if any, 4) Objects and setting details, 5) Any NSFW elements present. Be detailed and specific with searchable booru-style tags.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Vision API error:", errorData)
      throw new Error(errorData.error?.message || "Vision API request failed")
    }

    const data = await response.json()
    const analysis = data.choices[0]?.message?.content || ""

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("[v0] Vision analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze image" },
      { status: 500 },
    )
  }
}
