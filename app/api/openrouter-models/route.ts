import { NextResponse } from "next/server"

export const runtime = "edge"

interface OpenRouterModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
  description?: string
}

interface ModelOption {
  value: string
  label: string
  description: string
  isFree: boolean
  contextLength: number
}

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      console.log("[v0] No OpenRouter API key found, returning default models")
      return NextResponse.json({
        models: getDefaultModels(),
        cached: true,
      })
    }

    console.log("[v0] Fetching models from OpenRouter API")
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] OpenRouter API error:", response.status)
      return NextResponse.json({
        models: getDefaultModels(),
        cached: true,
      })
    }

    const data = await response.json()
    console.log("[v0] Fetched", data.data?.length, "models from OpenRouter")

    // Filter and format models
    const formattedModels: ModelOption[] = data.data
      .filter((model: OpenRouterModel) => {
        // Include free models and popular paid models
        const isFree = model.pricing.prompt === "0" && model.pricing.completion === "0"
        const isPopular =
          model.id.includes("gpt") ||
          model.id.includes("claude") ||
          model.id.includes("gemini") ||
          model.id.includes("llama") ||
          model.id.includes("mistral")

        return isFree || isPopular
      })
      .map((model: OpenRouterModel) => ({
        value: model.id,
        label: formatModelName(model.name || model.id),
        description: model.description || getModelDescription(model.id),
        isFree: model.pricing.prompt === "0" && model.pricing.completion === "0",
        contextLength: model.context_length,
      }))
      .sort((a: ModelOption, b: ModelOption) => {
        // Sort free models first, then by name
        if (a.isFree && !b.isFree) return -1
        if (!a.isFree && b.isFree) return 1
        return a.label.localeCompare(b.label)
      })

    console.log("[v0] Returning", formattedModels.length, "formatted models")

    return NextResponse.json({
      models: formattedModels.length > 0 ? formattedModels : getDefaultModels(),
      cached: false,
    })
  } catch (error) {
    console.error("[v0] Error fetching OpenRouter models:", error)
    return NextResponse.json({
      models: getDefaultModels(),
      cached: true,
    })
  }
}

function formatModelName(name: string): string {
  // Clean up model names for better display
  return name
    .replace(/:/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getModelDescription(id: string): string {
  if (id.includes("gpt-oss")) return "Fast, free, great for lore"
  if (id.includes("llama")) return "Strong reasoning capabilities"
  if (id.includes("gemini")) return "Quick responses and creativity"
  if (id.includes("mistral")) return "Compact and fast"
  if (id.includes("claude")) return "Best quality and nuanced responses"
  if (id.includes("gpt-5") || id.includes("gpt-4")) return "Most advanced reasoning"
  return "AI language model"
}

function getDefaultModels(): ModelOption[] {
  return [
    {
      value: "openai/gpt-oss-120b:free",
      label: "GPT OSS 120B (Free)",
      description: "Fast, free, great for lore",
      isFree: true,
      contextLength: 8192,
    },
    {
      value: "meta-llama/llama-4-70b-instruct:free",
      label: "Llama 4 70B (Free)",
      description: "Strong reasoning",
      isFree: true,
      contextLength: 8192,
    },
    {
      value: "google/gemini-2.0-flash-exp:free",
      label: "Gemini 2.0 Flash (Free)",
      description: "Quick responses",
      isFree: true,
      contextLength: 32768,
    },
    {
      value: "mistralai/mistral-7b-instruct:free",
      label: "Mistral 7B (Free)",
      description: "Compact and fast",
      isFree: true,
      contextLength: 8192,
    },
    {
      value: "anthropic/claude-sonnet-4.5",
      label: "Claude Sonnet 4.5",
      description: "Best quality",
      isFree: false,
      contextLength: 200000,
    },
    {
      value: "openai/gpt-5",
      label: "GPT-5",
      description: "Most advanced",
      isFree: false,
      contextLength: 128000,
    },
    {
      value: "google/gemini-2.5-pro",
      label: "Gemini 2.5 Pro",
      description: "Excellent for creativity",
      isFree: false,
      contextLength: 1000000,
    },
  ]
}
