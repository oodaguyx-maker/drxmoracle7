import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const QUALITY_BOOSTER =
  "masterpiece, best quality, high resolution, highly detailed, sharp focus, professional photography, 8k uhd, photorealistic"

const NEGATIVE_PROMPT_AUTO =
  "ugly, deformed, disfigured, bad anatomy, bad proportions, extra limbs, missing limbs, poorly drawn hands, poorly drawn face, mutated, blurry, low quality, low resolution, worst quality, jpeg artifacts, watermark, signature, username, text"

const BODY_ENHANCEMENT =
  "voluptuous, curvy figure, full figure, thick thighs, wide hips, hourglass figure, soft skin, large breasts, thick backside, plump lips, sensual"

const STYLE_ENHANCEMENTS = {
  photorealistic:
    "photorealistic, ultra realistic, RAW photo, 8k uhd, professional photography, DSLR, studio lighting, sharp focus, physically-based rendering, extreme detail, beautiful face, perfect skin, OnlyFans quality, supermodel",
  anime:
    "anime style, beautiful anime girl, detailed anime art, vibrant colors, anime illustration, cel shaded, manga style, anime aesthetic, hentai quality",
}

const STYLE_NEGATIVE_PROMPTS = {
  photorealistic: "",
  anime: "3d, realistic, photo, photography, cgi, render",
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get("prompt") as string
    const negativePrompt = (formData.get("negative_prompt") as string) || ""
    const stylePreset = (formData.get("style_preset") as string) || "photorealistic"
    const model = (formData.get("model") as string) || "flux-dev"
    const guidance = Number.parseFloat(formData.get("guidance") as string) || 3.5
    const steps = Number.parseInt(formData.get("steps") as string) || 28
    const seed = Number.parseInt(formData.get("seed") as string) || -1
    const promptStrength = Number.parseFloat(formData.get("prompt_strength") as string) || 0.8
    const numOutputs = Number.parseInt(formData.get("num_outputs") as string) || 1
    const aspectRatio = (formData.get("aspect_ratio") as string) || "1:1"
    const outputQuality = Number.parseInt(formData.get("output_quality") as string) || 90
    const enhanceQuality = formData.get("enhance_quality") === "true"
    const enhanceBody = formData.get("enhance_body") === "true"
    const image = formData.get("image") // File or null for text2img

    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return NextResponse.json(
        {
          error:
            "REPLICATE_API_TOKEN is not configured. Please add it to your environment variables in the Vars section.",
          message: "Get your token from https://replicate.com/account/api-tokens",
        },
        { status: 500 },
      )
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          error: "Prompt is required and must be a string.",
        },
        { status: 400 },
      )
    }

    const replicate = new Replicate({
      auth: apiToken,
    })

    let enhancedPrompt = prompt

    // Add style-specific enhancements
    if (stylePreset in STYLE_ENHANCEMENTS) {
      enhancedPrompt = `${STYLE_ENHANCEMENTS[stylePreset as keyof typeof STYLE_ENHANCEMENTS]}, ${enhancedPrompt}`
    }

    if (enhanceQuality) {
      enhancedPrompt = `${QUALITY_BOOSTER}, ${enhancedPrompt}`
    }
    if (enhanceBody) {
      enhancedPrompt = `${BODY_ENHANCEMENT}, ${enhancedPrompt}`
    }

    let finalNegativePrompt = negativePrompt

    // Add style-specific negative prompts
    if (
      stylePreset in STYLE_NEGATIVE_PROMPTS &&
      STYLE_NEGATIVE_PROMPTS[stylePreset as keyof typeof STYLE_NEGATIVE_PROMPTS]
    ) {
      const styleNeg = STYLE_NEGATIVE_PROMPTS[stylePreset as keyof typeof STYLE_NEGATIVE_PROMPTS]
      finalNegativePrompt = finalNegativePrompt ? `${finalNegativePrompt}, ${styleNeg}` : styleNeg
    }

    // Always add automatic quality negative prompts if not already included
    if (enhanceQuality && !finalNegativePrompt.includes("bad anatomy")) {
      finalNegativePrompt = finalNegativePrompt
        ? `${finalNegativePrompt}, ${NEGATIVE_PROMPT_AUTO}`
        : NEGATIVE_PROMPT_AUTO
    }

    const modelConfigs: Record<string, { id: string; supportsNegative: boolean; defaultSteps: number }> = {
      "nsfw-flux-dev": {
        id: "aisha-ai-official/nsfw-flux-dev:8789ec8279c4b1614014feb714fef69fea839d446b76c36f9f20e92ae7f8a952",
        supportsNegative: false,
        defaultSteps: 8,
      },
      "flux-dev": {
        id: "black-forest-labs/flux-dev:8f7c7654720b993d31a43a32a347e71cd59058ec1a849ee3a43a36f70677a8a4",
        supportsNegative: false,
        defaultSteps: 28,
      },
      "flux-unchained": {
        id: "socalguitarist/flux-unchained",
        supportsNegative: false,
        defaultSteps: 28,
      },
      xrsfw77: {
        id: "oodaguyx-maker/xrsfw77:1c2ec6ae790b581282bbe63f9ca3436a91a1553b67d8239bd2fccf62094b6aba",
        supportsNegative: false,
        defaultSteps: 28,
      },
    }

    const selectedModel = modelConfigs[model] || modelConfigs["flux-dev"]

    // Build input based on selected model
    const input: any = {
      prompt: enhancedPrompt,
      disable_safety_checker: true, // NSFW enabled for all models
    }

    if (finalNegativePrompt) {
      console.log("[v0] GrokImgOven: Using negative prompt:", finalNegativePrompt)
      // Note: Flux models don't have explicit negative_prompt parameter
      // The negative concepts are embedded in the enhanced prompt through quality boosters
    }

    // All models use similar parameters
    input.guidance_scale = guidance
    input.num_inference_steps = steps || selectedModel.defaultSteps

    if (numOutputs > 1) {
      input.num_outputs = numOutputs
    }

    // Handle seed
    if (seed !== -1) {
      input.seed = seed
    }

    // Width/height based on aspect ratio
    const dimensions: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1344, height: 768 },
      "9:16": { width: 768, height: 1344 },
      "4:3": { width: 1152, height: 896 },
      "3:4": { width: 896, height: 1152 },
      "21:9": { width: 1536, height: 640 },
    }
    const dims = dimensions[aspectRatio] || dimensions["1:1"]
    input.width = dims.width
    input.height = dims.height

    // Handle img2img
    if (image && image instanceof File) {
      const arrayBuffer = await image.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString("base64")
      const mimeType = image.type || "image/png"
      input.image = `data:${mimeType};base64,${base64}`
      input.prompt_strength = promptStrength
    }

    // Output format settings
    input.output_format = "webp"
    input.output_quality = outputQuality

    console.log("[v0] GrokImgOven: Generating with model:", selectedModel.id)
    console.log("[v0] GrokImgOven: Enhanced prompt:", enhancedPrompt)
    console.log("[v0] GrokImgOven: Requesting", numOutputs, "image(s)")

    const output = await replicate.run(selectedModel.id as any, { input })

    // Extract image URLs from output
    const imageUrls: string[] = []

    if (Array.isArray(output)) {
      for (const item of output) {
        try {
          if (item && typeof item.url === "function") {
            imageUrls.push(item.url())
          } else if (item && typeof item.url === "string") {
            imageUrls.push(item.url)
          } else if (typeof item === "string") {
            imageUrls.push(item)
          }
        } catch (error) {
          console.error("[v0] Error extracting URL:", error)
        }
      }
    } else if (output && typeof output === "object") {
      try {
        if (typeof (output as any).url === "function") {
          imageUrls.push((output as any).url())
        } else if (typeof (output as any).url === "string") {
          imageUrls.push((output as any).url)
        }
      } catch (error) {
        console.error("[v0] Error extracting URL from single output:", error)
      }
    } else if (typeof output === "string") {
      imageUrls.push(output)
    }

    console.log("[v0] GrokImgOven: Extracted", imageUrls.length, "image URLs")

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to extract image URLs from model output",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      data: imageUrls.map((url) => ({ url })),
    })
  } catch (error) {
    console.error("[v0] Error in grok-imgoven route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate images",
      },
      { status: 500 },
    )
  }
}
