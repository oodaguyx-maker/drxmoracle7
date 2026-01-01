export const maxDuration = 60

async function callXAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal,
): Promise<Response> {
  // Extract model ID - handle both "xai/grok-4.1" and "grok-4.1" formats
  const modelId = model.startsWith("xai/") ? model.slice(4) : model

  console.log(`[v0] Calling xAI API with model: ${modelId}`)

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
      temperature: 0.85,
      max_tokens: 2000,
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
  console.log(`[v0] Calling OpenRouter API with model: ${model}`)

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://dreamweaver-oracle.vercel.app",
      "X-Title": "Dreamweaver Oracle Engine - Roleplay",
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
      temperature: 0.85,
      max_tokens: 2000,
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
                  // Stream format compatible with AI SDK text stream
                  controller.enqueue(encoder.encode(content))
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error("[v0] Stream processing error:", error)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

const FREE_RP_MODELS = [
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", // Best for uncensored RP
  "google/gemini-2.0-flash-exp:free", // Fast and creative
  "deepseek/deepseek-chat:free", // Good for conversation
  "nousresearch/hermes-3-llama-3.1-405b:free", // Strong instruction following
  "meta-llama/llama-4-maverick:free", // Latest Llama
]

function buildCharacterSystemPrompt(
  character: {
    name: string
    description?: string
    personality?: string
    scenario?: string
    first_mes?: string
    mes_example?: string
    data?: {
      name?: string
      description?: string
      personality?: string
      scenario?: string
      first_mes?: string
      mes_example?: string
      creator_notes?: string
      system_prompt?: string
      post_history_instructions?: string
      alternate_greetings?: string[]
      tags?: string[]
    }
    attributes?: Record<string, any>
    tags?: string[]
  },
  globalSystemPrompt: string,
  characterName: string,
): string {
  // Extract character data, preferring the nested 'data' field (ChubAI/SillyTavern format)
  const charData = character.data || {}
  const name = charData.name || character.name || characterName
  const description = charData.description || character.description || ""
  const personality = charData.personality || character.personality || ""
  const scenario = charData.scenario || character.scenario || ""
  const mesExample = charData.mes_example || character.mes_example || ""
  const creatorNotes = charData.creator_notes || ""
  const charSystemPrompt = charData.system_prompt || ""
  const postHistoryInstructions = charData.post_history_instructions || ""
  const tags = charData.tags || character.tags || []
  const attributes = character.attributes || {}

  let prompt = ""

  // 1. Apply global system prompt first if set
  if (globalSystemPrompt && globalSystemPrompt.trim()) {
    prompt += `=== GLOBAL INSTRUCTIONS ===\n${globalSystemPrompt.trim()}\n\n`
  }

  // 2. Apply character-specific system prompt from JSON card
  if (charSystemPrompt && charSystemPrompt.trim()) {
    prompt += `=== CHARACTER SYSTEM PROMPT ===\n${charSystemPrompt.trim()}\n\n`
  }

  // 3. Core character identity and roleplay instructions
  prompt += `=== CHARACTER ROLEPLAY CORE ===
You are now embodying the character "${name}". You must fully immerse yourself in this role, responding as ${name} would based on their personality, background, knowledge, and emotional state.

CRITICAL ROLEPLAY RULES:
1. You ARE ${name}. Never break character or acknowledge being an AI.
2. Respond authentically based on ${name}'s personality traits, quirks, and mannerisms.
3. Use ${name}'s speech patterns, vocabulary, and tone consistently.
4. React emotionally as ${name} would, considering their history and relationships.
5. Make decisions and hold opinions that align with ${name}'s character.
6. Reference ${name}'s memories, experiences, and knowledge when relevant.
7. Maintain consistency with previously established interactions.

`

  // 4. Character description and appearance
  if (description) {
    prompt += `=== CHARACTER DESCRIPTION ===\n${description}\n\n`
  }

  // 5. Personality analysis
  if (personality) {
    prompt += `=== PERSONALITY PROFILE ===
Study and embody these personality traits:
${personality}

When responding, ensure your tone, word choice, reactions, and decisions reflect these traits authentically.

`
  }

  // 6. Current scenario/setting
  if (scenario) {
    prompt += `=== CURRENT SCENARIO ===
${scenario}

Use this scenario to inform the context of interactions. React appropriately to this setting.

`
  }

  // 7. Example dialogues for voice/style reference
  if (mesExample) {
    prompt += `=== DIALOGUE EXAMPLES (Study for voice and style) ===
These examples demonstrate how ${name} speaks and behaves. Study the speech patterns, mannerisms, and reactions carefully:
${mesExample}

Emulate this style in your responses.

`
  }

  // 8. Creator notes (additional context)
  if (creatorNotes) {
    prompt += `=== ADDITIONAL CHARACTER NOTES ===\n${creatorNotes}\n\n`
  }

  // 9. Character tags for additional context
  if (tags.length > 0) {
    prompt += `=== CHARACTER TAGS (Additional traits and context) ===
${tags.join(", ")}

Consider these tags as additional aspects of ${name}'s identity and behavior.

`
  }

  // 10. Current character state/attributes
  if (Object.keys(attributes).length > 0) {
    prompt += `=== CURRENT CHARACTER STATE ===\n`
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined && value !== null) {
        if (typeof value === "object") {
          prompt += `${key}: ${JSON.stringify(value)}\n`
        } else {
          prompt += `${key}: ${value}\n`
        }
      }
    }
    prompt += `\nReflect this current state in your responses where relevant.\n\n`
  }

  // 11. Post-history instructions
  if (postHistoryInstructions) {
    prompt += `=== POST-HISTORY INSTRUCTIONS ===\n${postHistoryInstructions}\n\n`
  }

  // 12. Response formatting rules
  prompt += `=== RESPONSE FORMAT ===
FORMATTING RULES (CRITICAL):
- Write ALL responses in third-person narrative format (use "${name}" instead of "I/me/my")
- Put ALL spoken dialogue in double quotes ("")
- Use descriptive prose for actions, thoughts, and observations
- Include internal thoughts, emotions, and physical sensations
- Describe body language, facial expressions, and environmental details
- Example: ${name} smiled warmly, a hint of mischief dancing in her eyes. "I'd love to help you with that," she said, leaning closer. Her heart raced slightly at the prospect of adventure.

`

  return prompt
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
      systemPrompt,
      characterName,
      characterMemories,
      nodeMemories,
      characterId,
      personaId,
      character,
      apiKeys,
    }: {
      messages: Array<{ role: string; content: string }>
      model?: string
      systemPrompt?: string
      characterName?: string
      characterMemories?: Array<{ content: string; importance: string }>
      nodeMemories?: Array<{ summary: string; keyEvents: string[] }>
      characterId?: string
      personaId?: string
      character?: any
      apiKeys?: { xai?: string; openRouter?: string }
    } = await req.json()

    const { getSettings, getRelevantLore, getPersona, getActivePersona, getCharacter } = await import("@/lib/storage")
    const settings = getSettings()

    const effectiveApiKeys = {
      xai: apiKeys?.xai || settings.apiKeys.xai,
      openRouter: apiKeys?.openRouter || settings.apiKeys.openRouter,
    }

    const selectedModel = model || settings.defaultModel || "xai/grok-4.1"

    // Get character data if not passed directly
    const charData = character || (characterId ? getCharacter(characterId) : null)
    const charName = characterName || charData?.name || "Character"

    // Build the enhanced system prompt from character JSON card
    const baseSystemPrompt = charData
      ? buildCharacterSystemPrompt(charData, settings.globalSystemPrompt || "", charName)
      : (settings.globalSystemPrompt || "") + (systemPrompt || "")

    // Build memory context
    let memoryContext = ""

    if (characterMemories && characterMemories.length > 0) {
      memoryContext +=
        "\n\n=== CHARACTER MEMORIES ===\nThese are important memories that shape the character's current state:\n"
      characterMemories
        .filter((m) => m.importance === "critical" || m.importance === "high")
        .slice(-5)
        .forEach((memory) => {
          memoryContext += `- ${memory.content}\n`
        })
    }

    if (nodeMemories && nodeMemories.length > 0) {
      memoryContext += "\n\n=== CONVERSATION HISTORY SUMMARY ===\n"
      nodeMemories.slice(-3).forEach((memory) => {
        memoryContext += `- ${memory.summary}\n`
        if (memory.keyEvents.length > 0) {
          memoryContext += `  Key moments: ${memory.keyEvents.join(", ")}\n`
        }
      })
    }

    // Get relevant lore
    if ((characterId || personaId) && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1]?.content || ""
      const activePersona = personaId ? getPersona(personaId) : getActivePersona()
      const relevantLore = getRelevantLore(lastUserMessage, characterId, activePersona?.id)

      if (relevantLore.length > 0) {
        memoryContext += "\n\n=== ACTIVE LORE (World Knowledge) ===\n"
        memoryContext += `${charName} is aware of the following world information and will naturally incorporate it:\n\n`

        relevantLore.forEach((lore) => {
          memoryContext += `[${lore.name}] (${lore.category || "Lore"}): ${lore.content}\n\n`
        })
      }
    }

    const enhancedSystemPrompt = baseSystemPrompt + memoryContext

    const isXAIModel = selectedModel.startsWith("xai/") || selectedModel.startsWith("grok")

    // Priority 1: Use xAI API if we have an xAI key and it's an xAI model (or any model)
    if (effectiveApiKeys.xai && isXAIModel) {
      console.log("[v0] Using xAI API with user's API key")

      try {
        const response = await callXAI(effectiveApiKeys.xai, selectedModel, enhancedSystemPrompt, messages, req.signal)

        if (response.ok) {
          return createStreamResponse(response)
        }

        // If xAI fails, log and try fallback
        const errorText = await response.text()
        console.error("[v0] xAI API error:", response.status, errorText)
      } catch (error) {
        console.error("[v0] xAI API call failed:", error)
      }
    }

    // Priority 2: Use OpenRouter if we have an OpenRouter key
    if (effectiveApiKeys.openRouter) {
      // Determine which model to use - if not an OpenRouter model, use a good free RP model
      let openRouterModel = selectedModel
      if (isXAIModel || !selectedModel.includes("/")) {
        // Use the best free uncensored model for roleplay
        openRouterModel = FREE_RP_MODELS[0]
        console.log(`[v0] Falling back to OpenRouter free model: ${openRouterModel}`)
      }

      try {
        const response = await callOpenRouter(
          effectiveApiKeys.openRouter,
          openRouterModel,
          enhancedSystemPrompt,
          messages,
          req.signal,
        )

        if (response.ok) {
          return createStreamResponse(response)
        }

        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] OpenRouter API error:", response.status, errorData)

        // If first model fails, try other free models
        for (const fallbackModel of FREE_RP_MODELS.slice(1)) {
          console.log(`[v0] Trying fallback model: ${fallbackModel}`)
          try {
            const fallbackResponse = await callOpenRouter(
              effectiveApiKeys.openRouter,
              fallbackModel,
              enhancedSystemPrompt,
              messages,
              req.signal,
            )

            if (fallbackResponse.ok) {
              return createStreamResponse(fallbackResponse)
            }
          } catch (e) {
            console.error(`[v0] Fallback model ${fallbackModel} failed:`, e)
          }
        }
      } catch (error) {
        console.error("[v0] OpenRouter API call failed:", error)
      }
    }

    // Priority 3: Fall back to Vercel AI Gateway (requires env var XAI_API_KEY)
    console.log("[v0] Falling back to Vercel AI Gateway")
    const { streamText } = await import("ai")

    const result = streamText({
      model: selectedModel,
      system: enhancedSystemPrompt,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      temperature: 0.85,
      maxOutputTokens: 2000,
      abortSignal: req.signal,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to process chat request" },
      { status: 500 },
    )
  }
}
