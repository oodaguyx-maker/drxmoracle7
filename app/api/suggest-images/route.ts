import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userLikes, searchHistory, apiKey } = await request.json()

    const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY

    if (!openRouterKey) {
      return NextResponse.json({ error: "OpenRouter API key required" }, { status: 400 })
    }

    console.log("[v0] Generating suggestions based on user preferences...")

    // Analyze user preferences with AI
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://blackoracle.app",
      },
      body: JSON.stringify({
        model: "sao10k/l3.3-euryale-70b:free", // Uncensored model for NSFW
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing user preferences for image searches on booru sites. Based on their liked images and search history, suggest new search tag combinations they might enjoy. You understand all tags including NSFW content. Return ONLY a JSON array of 5 tag combination strings, nothing else.",
          },
          {
            role: "user",
            content: `Based on these user preferences:\nLiked tags: ${userLikes.join(", ")}\nRecent searches: ${searchHistory.join(", ")}\n\nSuggest 5 new tag combinations they might enjoy (each as a space-separated string).`,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Suggestions API error:", errorData)
      throw new Error(errorData.error?.message || "Suggestions API request failed")
    }

    const data = await response.json()
    const suggestionsText = data.choices[0]?.message?.content || "[]"

    // Try to parse as JSON, fallback to text parsing
    let suggestions: string[] = []
    try {
      suggestions = JSON.parse(suggestionsText)
    } catch {
      // Fallback: parse as lines
      suggestions = suggestionsText
        .split("\n")
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 5)
    }

    console.log("[v0] Generated suggestions:", suggestions)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Suggestions error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 },
    )
  }
}
