export const maxDuration = 30

async function callXAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal,
): Promise<Response> {
  // Extract model ID - handle both "xai/grok-4.1" and "grok-4.1" formats
  const modelId = model.startsWith("xai/") ? model.slice(4) : model

  console.log(`[v0] Multi-chat calling xAI API with model: ${modelId}`)

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.8,
      max_tokens: 800, // Shorter for multi-char
      stream: true,
    }),
    signal,
  })

  return response
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal,
): Promise<Response> {
  console.log(`[v0] Multi-chat calling OpenRouter API with model: ${model}`)

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://v0.dev",
      "X-Title": "BlackOracle Engine - Party Mode",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.8,
      max_tokens: 800,
      stream: true,
    }),
    signal,
  })

  return response
}

function createStreamResponse(response: Response): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content

                if (content) {
                  controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`))
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error("[v0] Multi-chat stream error:", error)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

import { getRelevantLoreFromSupabase } from "@/lib/supabase-lore-server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("[v0] Multi-chat API received request with keys:", Object.keys(body))

    const {
      messages,
      model,
      apiKey,
      apiKeys,
      characterId,
      character,
      sessionContext,
      systemPrompt,
      lorebookIds,
      characters,
      nextSpeakerId,
    } = body

    const speakerCharacter =
      character || (characters && nextSpeakerId ? characters.find((c: any) => c.id === nextSpeakerId) : null)

    if (!speakerCharacter) {
      console.error("[v0] Multi-chat API error: No character data provided")
      return Response.json({ error: "Character data required" }, { status: 400 })
    }

    console.log("[v0] Multi-chat API processing for character:", speakerCharacter.name)

    const effectiveApiKeys = {
      xai: apiKeys?.xai || apiKey || process.env.XAI_API_KEY,
      openRouter: apiKeys?.openRouter || apiKey || process.env.OPENROUTER_API_KEY,
    }

    if (!effectiveApiKeys.xai && !effectiveApiKeys.openRouter) {
      return Response.json({ error: "API key required (xAI or OpenRouter)" }, { status: 400 })
    }

    let loreContext = ""
    if (lorebookIds && lorebookIds.length > 0) {
      const recentMessages = messages
        .slice(-5)
        .map((m: any) => m.content)
        .join(" ")
      const relevantLore = await getRelevantLoreFromSupabase(
        recentMessages,
        characterId || speakerCharacter.id,
        undefined,
        lorebookIds,
      )

      if (relevantLore.length > 0) {
        loreContext = relevantLore
          .map((entry) => `[${entry.name}] (${entry.importance})\n${entry.content}`)
          .join("\n\n")
      }
    }

    const finalSystemPrompt = systemPrompt || "You are participating in a multi-character roleplay session."

    const selectedModel = model || "xai/grok-4.1"
    const isXAIModel = selectedModel.startsWith("xai/") || selectedModel.startsWith("grok")

    if (effectiveApiKeys.xai && isXAIModel) {
      console.log("[v0] Multi-chat using xAI API")

      try {
        const response = await callXAI(effectiveApiKeys.xai, selectedModel, finalSystemPrompt, messages, req.signal)

        if (response.ok) {
          return createStreamResponse(response)
        }

        const errorText = await response.text()
        console.error("[v0] Multi-chat xAI API error:", response.status, errorText)
      } catch (error) {
        console.error("[v0] Multi-chat xAI API call failed:", error)
      }
    }

    if (effectiveApiKeys.openRouter) {
      console.log("[v0] Multi-chat using OpenRouter API")

      try {
        const openRouterModel = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"

        const response = await callOpenRouter(
          effectiveApiKeys.openRouter,
          openRouterModel,
          finalSystemPrompt,
          messages,
          req.signal,
        )

        if (response.ok) {
          return createStreamResponse(response)
        }

        const error = await response.json()
        return Response.json({ error: error.error?.message || "OpenRouter API error" }, { status: response.status })
      } catch (error) {
        console.error("[v0] Multi-chat OpenRouter API call failed:", error)
      }
    }

    return Response.json({ error: "No valid API configuration available" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Multi-chat API error:", error)
    return Response.json({ error: error instanceof Error ? error.message : "Failed to process" }, { status: 500 })
  }
}
