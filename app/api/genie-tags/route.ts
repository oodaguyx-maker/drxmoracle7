import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, source, maxCombinations = 15, apiKey } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 })
    }

    const finalApiKey = apiKey || process.env.OPENROUTER_API_KEY

    if (!finalApiKey) {
      return NextResponse.json({ error: "OpenRouter API key not found" }, { status: 500 })
    }

    // Generate tag combinations using AI
    const systemPrompt = `You are a tag generator for ${source === "rule34" ? "Rule34.xxx" : "Realbooru.com"}. 
Generate ${maxCombinations} different search tag combinations based on the user's request.

CRITICAL RULES:
1. Use ONLY real, common tags from ${source}
2. Tags should be 1-3 words each, separated by spaces
3. Each combination should have 2-4 tags maximum (too many tags return 0 results)
4. Use simple, popular tags like: big_ass, huge_breasts, thick_thighs, male, female, gay, solo, group
5. DO NOT make up complex tags or use underscores unless common (big_ass is OK, voluptuous_big_butt is NOT)
6. Return different variations - some broader, some more specific
7. Format: Return ONLY a JSON array of arrays, nothing else

Example for "busty blonde":
[["huge_breasts","blonde"],["big_breasts","blonde","solo"],["blonde","busty"],["huge_breasts","blonde","female"]]`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${finalApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://blackoracle.app",
        "X-Title": "BlackOracle OodaEyeXR",
      },
      body: JSON.stringify({
        model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${maxCombinations} tag combinations for: "${prompt}"` },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""

    // Parse JSON response
    let combinations: string[][] = []
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        combinations = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: parse line by line
        const lines = content
          .trim()
          .split("\n")
          .filter((line: string) => line.trim())
        combinations = lines.map((line: string) => {
          const tags = line
            .replace(/[[\]"]/g, "")
            .split(",")
            .map((tag: string) => tag.trim())
          return tags.filter((tag: string) => tag.length > 0)
        })
      }

      // Ensure we have valid combinations
      combinations = combinations.filter((combo) => Array.isArray(combo) && combo.length > 0 && combo.length <= 4)

      // If we have fewer than requested, create variations
      if (combinations.length < maxCombinations && combinations.length > 0) {
        const extras: string[][] = []
        const baseTags = [...new Set(combinations.flat())]

        for (let i = combinations.length; i < maxCombinations && baseTags.length >= 2; i++) {
          // Create new combinations by shuffling and selecting subsets
          const shuffled = [...baseTags].sort(() => Math.random() - 0.5)
          const size = Math.min(2 + Math.floor(Math.random() * 2), shuffled.length)
          extras.push(shuffled.slice(0, size))
        }

        combinations = [...combinations, ...extras]
      }

      console.log("[v0] Genie generated combinations:", combinations)

      return NextResponse.json({ combinations })
    } catch (parseError) {
      console.error("[v0] Failed to parse AI response:", parseError)
      console.log("[v0] AI response content:", content)

      // Fallback: create basic combinations from the prompt
      const words = prompt
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 2)
      const fallbackCombos: string[][] = []

      for (let i = 0; i < Math.min(maxCombinations, words.length); i++) {
        fallbackCombos.push([words[i], words[(i + 1) % words.length]].filter(Boolean))
      }

      return NextResponse.json({ combinations: fallbackCombos.length > 0 ? fallbackCombos : [[prompt]] })
    }
  } catch (error) {
    console.error("[v0] Genie tags API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate tags" },
      { status: 500 },
    )
  }
}
