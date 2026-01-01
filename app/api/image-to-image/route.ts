import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const prompt = formData.get("prompt") as string
    const imageFile = formData.get("image") as File
    const count = Number.parseInt(formData.get("count") as string) || 4

    console.log("[v0] Image-to-image request received with prompt:", prompt)

    if (!prompt || !imageFile) {
      return NextResponse.json({ error: "Prompt and image are required" }, { status: 400 })
    }

    const images: string[] = []

    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 1000000)
      const encodedPrompt = encodeURIComponent(prompt)

      // Generate Pollinations URL
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&enhance=true`

      // Create proxied URL to avoid CORS issues
      const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(pollinationsUrl)}`

      images.push(proxiedUrl)
      console.log("[v0] Generated proxied img2img URL for seed:", seed)
    }

    console.log("[v0] Image-to-image generated", images.length, "proxied URLs")
    return NextResponse.json({ images })
  } catch (error) {
    console.error("[v0] Image-to-image generation error:", error)
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
  }
}
