export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { lorebookId, entries, apiKey } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "OpenRouter API key required" }, { status: 400 })
    }

    if (!entries || entries.length < 3) {
      return Response.json({ error: "Need at least 3 location entries to generate a map" }, { status: 400 })
    }

    // Use AI to analyze the lore and create a geographically coherent map prompt
    const analysisPrompt = `You are a fantasy cartographer AI. Analyze these locations from a lorebook and create a detailed, geographically coherent world map description.

LOCATIONS:
${entries.map((e: any, i: number) => `${i + 1}. ${e.name} (${e.category}): ${e.content}`).join("\n\n")}

Based on the lore descriptions, determine:
1. The geographical relationship between these locations (which are near each other, which are far)
2. The terrain types mentioned or implied (mountains, forests, deserts, oceans, etc.)
3. The climate zones and biomes
4. The relative sizes and importance of each location

Then create a vivid, detailed prompt for generating a fantasy world map that:
- Shows all locations in geographically accurate positions based on their lore
- Uses vibrant, beautiful fantasy art style with rich colors
- Includes terrain features like mountains, rivers, forests, deserts
- Has clear labels for each location
- Looks like a professional fantasy atlas map
- Is top-down/bird's-eye view

Respond ONLY with the image generation prompt, nothing else.`

    console.log("[v0] Analyzing lore for map generation...")

    const analysisResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://v0.dev",
        "X-Title": "BlackOracle Engine - World Map",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!analysisResponse.ok) {
      throw new Error("Failed to analyze lore")
    }

    const analysisData = await analysisResponse.json()
    const mapPrompt = analysisData.choices[0].message.content

    console.log("[v0] Generated map prompt:", mapPrompt.slice(0, 200) + "...")

    const seed = Math.floor(Math.random() * 1000000)
    const encodedPrompt = encodeURIComponent(mapPrompt)

    // Generate high-resolution map with Pollinations (landscape orientation for world maps)
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1536&height=1024&seed=${seed}&model=flux&nologo=true&enhance=true`

    console.log("[v0] Map generated successfully with Pollinations")

    // Return the direct URL - Pollinations doesn't require proxying for generation
    return Response.json({
      success: true,
      mapUrl: pollinationsUrl,
      prompt: mapPrompt,
      width: 1536,
      height: 1024,
    })
  } catch (error) {
    console.error("[v0] World map generation error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate world map" },
      { status: 500 },
    )
  }
}
