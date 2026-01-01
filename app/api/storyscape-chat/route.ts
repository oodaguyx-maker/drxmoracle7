import { streamText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { messages, model, apiKey, narrativeContext, chapterId } = await req.json()

    if (!apiKey) {
      return new Response("API key required", { status: 401 })
    }

    const openrouter = createOpenRouter({ apiKey })

    // Enhance system message with narrative context
    const systemMessage = {
      role: "system",
      content: `${narrativeContext}

Instructions for Narrative AI Director:
- Stay true to the story's genre and tone
- Create engaging, dynamic NPCs that feel alive
- React naturally to player choices and advance the plot
- Describe scenes vividly but concisely
- Keep the chapter's goal in mind but allow for creative detours
- When a chapter's main objective is achieved, naturally conclude and signal readiness to move on
- Balance action, dialogue, and description
- Make the player's choices matter and have consequences`,
    }

    const result = await streamText({
      model: openrouter(model),
      messages: [systemMessage, ...messages],
      temperature: 0.8,
      maxTokens: 800,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] StoryScape chat error:", error)
    return new Response("Error generating response", { status: 500 })
  }
}
