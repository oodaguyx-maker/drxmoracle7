import type { ChatMessage, CharacterAttributes } from "./storage"

export interface AttributeUpdate {
  field: keyof CharacterAttributes
  value: any
  confidence: "low" | "medium" | "high"
  context: string
}

/**
 * Analyzes conversation messages to detect character attribute changes
 * This runs client-side and uses pattern matching
 */
export function detectAttributeUpdates(messages: ChatMessage[], characterName: string): AttributeUpdate[] {
  const updates: AttributeUpdate[] = []

  // Combine recent messages for context (last 10 messages)
  const recentMessages = messages.slice(-10)
  const conversationText = recentMessages
    .map((m) => m.content)
    .join(" ")
    .toLowerCase()

  // Pregnancy detection
  if (
    conversationText.includes("pregnant") ||
    conversationText.includes("expecting a baby") ||
    conversationText.includes("carrying a child")
  ) {
    updates.push({
      field: "pregnant",
      value: true,
      confidence: "high",
      context: "Pregnancy mentioned in conversation",
    })
  }

  // Marriage detection
  const marriagePatterns = [
    /married to (you|me)/i,
    /became (my|your) wife/i,
    /became (my|your) husband/i,
    /our wedding/i,
    /just married/i,
  ]
  for (const pattern of marriagePatterns) {
    if (pattern.test(conversationText)) {
      updates.push({
        field: "marriedTo",
        value: "user",
        confidence: "high",
        context: "Marriage mentioned in conversation",
      })
      updates.push({
        field: "marriageDate",
        value: Date.now(),
        confidence: "high",
        context: "Marriage date set to current time",
      })
      break
    }
  }

  // Tattoo detection
  const tattooMatch = conversationText.match(/got a tattoo|new tattoo|tattooed|ink on (my|her|his) (\w+)/i)
  if (tattooMatch) {
    updates.push({
      field: "tattoos",
      value: {
        description: "Tattoo mentioned in conversation",
        location: tattooMatch[2] || "unknown",
        dateAdded: Date.now(),
      },
      confidence: "medium",
      context: `Tattoo detected: ${tattooMatch[0]}`,
    })
  }

  // Children detection
  const childrenPatterns = [
    /our (son|daughter|child|baby)/i,
    /gave birth to/i,
    /had a (son|daughter|baby)/i,
    /became a (mother|father)/i,
  ]
  for (const pattern of childrenPatterns) {
    const match = pattern.exec(conversationText)
    if (match) {
      updates.push({
        field: "children",
        value: {
          name: "Child",
          age: 0,
          father: "user",
        },
        confidence: "medium",
        context: `Child mentioned: ${match[0]}`,
      })
      break
    }
  }

  // Hair changes detection
  const hairColorMatch = conversationText.match(/dyed (my|her|his) hair (\w+)|hair is now (\w+)/i)
  if (hairColorMatch) {
    updates.push({
      field: "hairColor",
      value: hairColorMatch[2] || hairColorMatch[3],
      confidence: "medium",
      context: `Hair color change detected`,
    })
  }

  return updates
}

/**
 * Formats attribute value for display
 */
export function formatAttributeValue(field: keyof CharacterAttributes, value: any): string {
  if (value === null || value === undefined) return "Not set"

  switch (field) {
    case "pregnant":
      return value ? "Yes" : "No"
    case "marriedTo":
      return value === "user" ? "Married to You" : `Married to ${value}`
    case "children":
      if (Array.isArray(value) && value.length > 0) {
        return value.map((child) => `${child.name} (${child.age})`).join(", ")
      }
      return "None"
    case "tattoos":
      if (Array.isArray(value) && value.length > 0) {
        return `${value.length} tattoo(s)`
      }
      return "None"
    case "marriageDate":
      return new Date(value).toLocaleDateString()
    default:
      return String(value)
  }
}
