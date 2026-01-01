import { streamText } from "ai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { messages, model, apiKey, world, persona, context } = await req.json()

    if (!apiKey) {
      return new Response("API key required", { status: 401 })
    }

    const systemPrompt = `${context}

Remember to:
- Be immersive and descriptive
- Create memorable NPCs using the [NPC:Name|Role|Description|Personality] format when introducing new characters
- Respond to player actions realistically
- Maintain world consistency
- Give players clear choices
- Keep the narrative flowing
- Build tension and intrigue
- Allow consequences for actions`

    const result = await streamText({
      model: model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      apiKey: apiKey,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] HeartFire chat error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
