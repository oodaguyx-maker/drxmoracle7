import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, apiKey } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Search prompt is required" }, { status: 400 })
    }

    const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY

    if (!openRouterKey) {
      return NextResponse.json({ error: "OpenRouter API key required" }, { status: 400 })
    }

    console.log("[v0] AI Search with prompt:", prompt)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://blackoracle.app",
      },
      body: JSON.stringify({
        model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", // Venice Uncensored - Free tier
        messages: [
          {
            role: "system",
            content:
              "You are an expert at converting natural language search queries into booru-style tags for Rule34 and similar image boards. You understand all tags including NSFW and sexual content. Return ONLY a comma-separated list of relevant tags, nothing else. Use underscores instead of spaces. Be specific and detailed.",
          },
          {
            role: "user",
            content: `Convert this search query into booru tags: "${prompt}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] AI Search API error:", errorData)
      throw new Error(errorData.error?.message || "AI Search API request failed")
    }

    const data = await response.json()
    const tagsText = data.choices[0]?.message?.content || ""

    // Parse the tags from the response
    const tags = tagsText
      .split(",")
      .map((tag: string) => tag.trim().toLowerCase().replace(/\s+/g, "_"))
      .filter((tag: string) => tag.length > 0 && tag.length < 50)
      .slice(0, 10) // Limit to 10 tags

    console.log("[v0] AI generated tags:", tags)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("[v0] AI Search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process AI search" },
      { status: 500 },
    )
  }
}
