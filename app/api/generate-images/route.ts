import { NextResponse } from "next/server"

const POLLINATIONS_API = "https://image.pollinations.ai/prompt/"
const PERCHANCE_API = "https://perchance.org/api/generate"

// Helper to generate a single image using Pollinations
async function generateWithPollinations(prompt: string, seed: number): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt)
  return `${POLLINATIONS_API}${encodedPrompt}?width=768&height=768&seed=${seed}&model=flux&nologo=true`
}

// Helper to generate using Perchance
async function generateWithPerchance(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${PERCHANCE_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generator: "ai-text-to-image-generator",
        prompt: prompt,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Perchance API error:", response.statusText)
      return null
    }

    const data = await response.json()
    return data.imageUrl || null
  } catch (error) {
    console.error("[v0] Perchance generation failed:", error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, count = 4, service = "pollinations" } = body

    console.log("[v0] Generating images with prompt:", prompt)

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const images: string[] = []

    if (service === "pollinations") {
      // Generate 4 unique images using Pollinations AI with different seeds
      for (let i = 0; i < count; i++) {
        const seed = Math.floor(Math.random() * 1000000)
        const encodedPrompt = encodeURIComponent(prompt)

        // Generate Pollinations URL
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&enhance=true`

        // Create proxied URL to avoid CORS issues
        const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(pollinationsUrl)}`

        images.push(proxiedUrl)
        console.log("[v0] Generated proxied URL for seed:", seed)
      }
    } else if (service === "perchance") {
      // Use alternative service - Pollinations is more reliable
      for (let i = 0; i < count; i++) {
        const imageUrl = await generateWithPerchance(prompt)
        if (imageUrl) {
          images.push(imageUrl)
          console.log("[v0] Generated Perchance URL:", imageUrl)
        } else {
          console.error("[v0] Failed to generate image with Perchance")
        }
      }
    }

    console.log("[v0] Generated", images.length, "image URLs")
    return NextResponse.json({ images })
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
  }
}
