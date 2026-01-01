import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, n = 1, response_format = "url", image_data } = body

    // Check if API key is configured
    const apiKey = process.env.XAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "XAI_API_KEY is not configured. Please add it to your environment variables.",
        },
        { status: 500 },
      )
    }

    // Build the request payload
    const requestPayload: any = {
      model: "grok-2-image",
      prompt: image_data ? `Based on the reference image, ${prompt}` : prompt,
      n: Math.min(Math.max(1, n), 10), // Clamp between 1-10
      response_format,
    }

    console.log("[v0] Calling Grok API with", n, "images")

    // Call the Grok API
    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] Grok API error:", errorData)
      return NextResponse.json(
        {
          error: errorData.error?.message || `Grok API error: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Successfully generated", data.data?.length || 0, "images")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in grok-images route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate images",
      },
      { status: 500 },
    )
  }
}
