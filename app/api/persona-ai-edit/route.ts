import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { personaData, instruction } = body

    if (!instruction) {
      return NextResponse.json({ error: "Instruction is required" }, { status: 400 })
    }

    const apiKey = "AIzaSyCMZWsOTCruhefcllRiGBgji5aZQEo41Ho"

    const prompt = `You are helping edit a user persona for roleplay. Current persona data:
Name: ${personaData.name || "Not set"}
Description: ${personaData.description || "Not set"}
Appearance: ${personaData.appearance || "Not set"}
Personality: ${personaData.personality || "Not set"}
Background: ${personaData.background || "Not set"}

User instruction: ${instruction}

Please provide an updated version of the ENTIRE persona based on the instruction. Return ONLY a valid JSON object with these exact fields: name, description, appearance, personality, background. Be detailed and creative. If a field wasn't mentioned in the instruction, keep it the same or improve it slightly.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error("No response from AI")
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON")
    }

    const updatedPersona = JSON.parse(jsonMatch[0])

    return NextResponse.json({ updatedPersona })
  } catch (error) {
    console.error("[v0] Persona AI edit error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to edit persona" },
      { status: 500 },
    )
  }
}
