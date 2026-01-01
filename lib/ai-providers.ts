export type AIProvider = "xai" | "openrouter" | "groq" | "gemini"

export interface AIProviderConfig {
  name: string
  baseUrl: string
  requiresKey: boolean
  priority: number
  description: string
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  xai: {
    name: "xAI (Grok)",
    baseUrl: "https://api.x.ai/v1",
    requiresKey: true,
    priority: 1,
    description: "Primary - xAI's Grok models (4.1 Fast & all Grok variants)",
  },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    requiresKey: true,
    priority: 2,
    description: "Secondary - Free models for uncensored roleplay",
  },
  groq: {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    requiresKey: true,
    priority: 3,
    description: "LoreyAI - Llama 3.3 70B for uncensored lore curation with creative narrative depth",
  },
  gemini: {
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    requiresKey: true,
    priority: 4,
    description: "Loreworld only - Google's Gemini models",
  },
}

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  requiresApiKey: boolean
  description?: string
  context_length?: number
  isFree?: boolean
  isUncensored?: boolean
}

export const AI_MODELS: AIModel[] = [
  // xAI Grok models (PRIMARY) - Use user's xAI API Key
  {
    id: "xai/grok-4.1",
    name: "Grok 4.1 ⭐ (Primary RP)",
    provider: "xai",
    requiresApiKey: true,
    description: "xAI's Grok 4.1 - Best for immersive roleplay and character embodiment",
    context_length: 131072,
  },
  {
    id: "xai/grok-4.1-mini",
    name: "Grok 4.1 Mini (Fast)",
    provider: "xai",
    requiresApiKey: true,
    description: "Faster Grok 4.1 variant for quick responses",
    context_length: 131072,
  },
  {
    id: "grok-4-0709",
    name: "Grok 4",
    provider: "xai",
    requiresApiKey: true,
    description: "xAI's most advanced model - multimodal reasoning across text, image, and video",
    context_length: 131072,
  },
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "xai",
    requiresApiKey: true,
    description: "xAI's flagship Grok model - strong wit and reasoning",
    context_length: 131072,
  },
  {
    id: "grok-2-1212",
    name: "Grok 2 (Dec 2024)",
    provider: "xai",
    requiresApiKey: true,
    description: "xAI's production Grok model with improved capabilities",
    context_length: 131072,
  },
  {
    id: "grok-2-vision-1212",
    name: "Grok 2 Vision",
    provider: "xai",
    requiresApiKey: true,
    description: "xAI's multimodal Grok with vision capabilities",
    context_length: 8192,
  },

  // OpenRouter FREE models (SECONDARY) - Best for uncensored roleplay
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Venice Dolphin 24B ⭐ (Free, Uncensored)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Best free uncensored model - minimal filtering, great for mature roleplay",
    isFree: true,
    isUncensored: true,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Fast, versatile for any content - Free tier",
    isFree: true,
  },
  {
    id: "deepseek/deepseek-chat:free",
    name: "DeepSeek Chat (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Excellent for conversation and roleplay - Free tier",
    isFree: true,
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 Llama 405B (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Powerful instruction following - Free tier",
    isFree: true,
  },
  {
    id: "meta-llama/llama-4-maverick:free",
    name: "Llama 4 Maverick (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Meta's latest Llama 4 variant - Free tier",
    isFree: true,
  },
  {
    id: "meta-llama/llama-4-scout:free",
    name: "Llama 4 Scout (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Fast exploration model - Free tier",
    isFree: true,
  },
  {
    id: "xiaomi/mimo-v2-flash:free",
    name: "Xiaomi MiMo V2 Flash (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Fast and efficient - Free tier",
    isFree: true,
  },
  {
    id: "mistralai/devstral-2-2512:free",
    name: "Mistral Devstral 2 (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Optimized for code and development - Free tier",
    isFree: true,
  },
  {
    id: "tng/deepseek-r1t2-chimera:free",
    name: "DeepSeek R1T2 Chimera (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Strong reasoning capabilities - Free tier",
    isFree: true,
  },
  {
    id: "openai/gpt-oss-120b:free",
    name: "GPT OSS 120B (Free)",
    provider: "openrouter",
    requiresApiKey: true,
    description: "Fast, great for lore - Free tier",
    isFree: true,
  },

  // Groq (TERTIARY) - For Lorey AI
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B Versatile (LoreyAI)",
    provider: "groq",
    requiresApiKey: true,
    description: "Ultra-fast inference optimized for creative narrative and lore curation with minimal filtering",
    isUncensored: true,
    context_length: 131072,
  },
]

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === id)
}

export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return AI_MODELS.filter((m) => m.provider === provider)
}

export function getAvailableModels(apiKeys: Partial<Record<AIProvider, string>>): AIModel[] {
  return AI_MODELS.filter((model) => {
    // Show all models, but mark which ones have keys configured
    return true
  })
}

export function getRecommendedModels(apiKeys: { xai?: string; openRouter?: string; groq?: string }): AIModel[] {
  const recommended: AIModel[] = []

  // If user has xAI key, prioritize Grok models
  if (apiKeys.xai) {
    recommended.push(...AI_MODELS.filter((m) => m.provider === "xai"))
  }

  // If user has OpenRouter key, add free uncensored models
  if (apiKeys.openRouter) {
    recommended.push(...AI_MODELS.filter((m) => m.provider === "openrouter" && m.isFree))
  }

  return recommended
}

export function getPrimaryModel(): AIModel {
  return AI_MODELS[0] // Grok 4.1
}

export function getProviderForModel(modelId: string): AIProvider {
  if (modelId.startsWith("xai/") || modelId.startsWith("grok")) {
    return "xai"
  }
  if (modelId.includes(":free") || modelId.includes("/")) {
    return "openrouter"
  }
  if (modelId.includes("llama") && modelId.includes("versatile")) {
    return "groq"
  }
  return "xai" // Default to xAI
}
