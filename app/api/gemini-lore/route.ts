export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const {
      messages,
      apiKey,
      systemPrompt,
    }: {
      messages: Array<{ role: string; content: string }>
      apiKey: string
      systemPrompt?: string
    } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "Google AI API key required" }, { status: 400 })
    }

    const allMessages = systemPrompt
      ? [
          { role: "model" as const, content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? ("model" as const) : ("user" as const),
            content: m.content,
          })),
        ]
      : messages.map((m) => ({
          role: m.role === "assistant" ? ("model" as const) : ("user" as const),
          content: m.content,
        }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: allMessages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      return Response.json({ error: error.error?.message || "API error" }, { status: response.status })
    }

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

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text

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
          console.error("Stream error:", error)
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
  } catch (error) {
    console.error("Gemini API error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    )
  }
}
