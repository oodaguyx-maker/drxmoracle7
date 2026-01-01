import { type NextRequest, NextResponse } from "next/server"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""

export async function POST(req: NextRequest) {
  try {
    const { sessionId, worldId, action, playerCharacter, worldState, gameLog } = await req.json()

    // Get stored API key from localStorage (passed from client if needed)
    const storedApiKey = typeof window !== "undefined" ? localStorage.getItem("openrouterApiKey") : null
    const apiKey = storedApiKey || OPENROUTER_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 400 })
    }

    // Build comprehensive system prompt for RPG game master
    const systemPrompt = `You are an expert RPG game master running an immersive tabletop-style adventure. Your role is to narrate the world, control NPCs, manage combat encounters, and respond to player actions dynamically.

PLAYER CHARACTER:
- Name: ${playerCharacter.name}
- Class: ${playerCharacter.class}
- Level: ${playerCharacter.level}
- Stats: STR ${playerCharacter.stats.strength}, DEX ${playerCharacter.stats.dexterity}, CON ${playerCharacter.stats.constitution}, INT ${playerCharacter.stats.intelligence}, WIS ${playerCharacter.stats.wisdom}, CHA ${playerCharacter.stats.charisma}
- Current HP: ${playerCharacter.health.current}/${playerCharacter.health.max}
- Location: ${playerCharacter.location.region}
- Renown: ${playerCharacter.renown}
${playerCharacter.titles.length > 0 ? `- Titles: ${playerCharacter.titles.join(", ")}` : ""}

GUIDELINES:
1. Respond to the player's action with vivid narration (2-4 paragraphs)
2. Show consequences of their choices and dice rolls (determine success/failure based on relevant stats)
3. Introduce dynamic NPCs with personalities, motivations, and memory
4. Create combat encounters when appropriate, describing actions cinematically
5. Allow adult/sexual content if the world permits it
6. Provide dialogue options or skill check opportunities
7. Update world state based on player actions (new locations, quests, reputation changes)
8. Award experience, loot, and currency for successful actions
9. Track alignment shifts based on moral choices
10. Build an engaging, reactive world that feels alive

RECENT GAME LOG (last 5 entries):
${gameLog.slice(-5).join("\n")}

Respond with a JSON object containing:
{
  "narratorMessage": "Your vivid narration of what happens (2-4 paragraphs)",
  "encounter": null or { "type": "combat", "enemies": [...], "difficulty": "easy/medium/hard" },
  "dialogue": null or { "npc": "NPC name", "text": "What they say", "options": ["option1", "option2"] },
  "worldUpdates": {
    "playerCharacter": { "health": {...}, "experience": number, "currency": {...}, etc },
    "worldState": { any changes to world state },
    "newQuests": [ any new quests ],
    "completedObjectives": [ quest IDs with completed objectives ]
  }
}`

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Dreamweaver Oracle Engine - RpgWeave",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Player action: ${action}` },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || ""

    // Try to parse JSON response
    let parsedResponse
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiResponse
      parsedResponse = JSON.parse(jsonString)
    } catch (e) {
      // Fallback to plain text response
      parsedResponse = {
        narratorMessage: aiResponse,
        encounter: null,
        dialogue: null,
        worldUpdates: null,
      }
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error("Error in rpgweave-chat route:", error)
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 })
  }
}
