"use client"

import { Input } from "@/components/ui/input"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Download, ImageIcon, Wand2, ArrowLeft, Sparkles } from "lucide-react"

export default function ImageGenPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [model, setModel] = useState<"pollinations" | "sd35" | "sd35-turbo">("pollinations")
  const [resolution, setResolution] = useState("1024x1024")
  const [inferenceSteps, setInferenceSteps] = useState(28)
  const [negativePrompt, setNegativePrompt] = useState("")
  const [guidanceScale, setGuidanceScale] = useState(7.0)
  const [nsfwAllowed, setNsfwAllowed] = useState(true)
  const [service, setService] = useState("pollinations")
  const [activeTab, setActiveTab] = useState("text2img")
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([])

  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedSystemPrompt = localStorage.getItem("imageGenSystemPrompt")
    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt)
    }
  }, [])

  const handleSystemPromptChange = (value: string) => {
    setSystemPrompt(value)
    localStorage.setItem("imageGenSystemPrompt", value)
  }

  const handleTextToImage = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setGeneratedImages([])
    setImagesLoaded([false, false, false, false])
    console.log("[v0] Starting text-to-image generation with model:", model)

    try {
      const finalPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

      if (model === "sd35" || model === "sd35-turbo") {
        const response = await fetch("/api/generate-sd35", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: finalPrompt,
            count: 4,
            nsfw_allowed: nsfwAllowed,
            resolution: resolution,
            num_inference_steps: inferenceSteps,
            negative_prompt: negativePrompt,
            guidance_scale: guidanceScale,
            model: model === "sd35-turbo" ? "turbo" : "standard",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.code === "RATE_LIMIT") {
            alert(errorData.error)
          } else {
            throw new Error(errorData.error || "Failed to generate images")
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setGeneratedImages(data.images)
        if (data.warnings) {
          console.warn("[v0]", data.warnings)
        }
        console.log("[v0] Generated", data.images.length, "images with SD3.5")
      } else {
        const images = await Promise.all(
          Array(4)
            .fill(0)
            .map(async (_, i) => {
              const seed = Date.now() + i
              const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&enhance=true&nologo=true`
              return url
            }),
        )

        setGeneratedImages(images)
        console.log("[v0] Generated 4 images with Pollinations")
      }
    } catch (error) {
      console.error("[v0] Image generation error:", error)
      alert("Failed to generate images. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImageToImage = async () => {
    if (!prompt.trim() || !uploadedImage) return

    setLoading(true)
    setGeneratedImages([])
    setImagesLoaded([])
    console.log("[v0] Starting image-to-image generation")

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("image", uploadedImage)
      formData.append("count", "4")

      const response = await fetch("/api/image-to-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] API error:", errorData)
        throw new Error(errorData.error || "Failed to generate images")
      }

      const data = await response.json()
      console.log("[v0] Received images:", data.images)
      setGeneratedImages(data.images)
      setImagesLoaded(new Array(data.images.length).fill(false))
    } catch (error) {
      console.error("[v0] Image-to-image error:", error)
      alert("Failed to generate images. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `generated-image-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("[v0] Download error:", error)
      alert("Failed to download image")
    }
  }

  const handleImageLoad = (index: number) => {
    console.log("[v0] Image loaded successfully:", index)
    setImagesLoaded((prev) => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }

  const suggestedPrompts = [
    "beautiful anime girl with long flowing hair, detailed eyes, fantasy setting, vibrant colors",
    "cyberpunk character in neon city, high detail, dramatic lighting",
    "fantasy warrior woman, armor, sunset background, epic pose",
    "gothic vampire queen, elegant dress, dark castle, moonlight",
    "mermaid underwater, glowing bioluminescence, fantasy art",
    "elven princess in enchanted forest, magical atmosphere",
  ]

  return (
    <div className="container mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Sparkles className="size-8 text-primary animate-pulse" />
          <div className="absolute inset-0 size-8 bg-primary/20 rounded-full blur-xl animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in slide-in-from-left duration-700">
            Image Generation
          </h1>
          <p className="text-muted-foreground animate-in slide-in-from-left duration-700 delay-100">
            Create stunning AI-generated artwork
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text2img" className="gap-2">
            <Wand2 className="size-4" />
            Text to Image
          </TabsTrigger>
          <TabsTrigger value="img2img" className="gap-2">
            <ImageIcon className="size-4" />
            Image to Image
          </TabsTrigger>
          <TabsTrigger value="perchance" className="gap-2">
            <Sparkles className="size-4" />
            Perchance Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text2img" className="space-y-4">
          <Card className="border-primary/20 animate-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle>Generate from Text</CardTitle>
              <CardDescription>Describe what you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI Model</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={model === "pollinations" ? "default" : "outline"}
                    onClick={() => setModel("pollinations")}
                    className="justify-start"
                  >
                    <Sparkles className="mr-2 size-4" />
                    Flux (Fast)
                  </Button>
                  <Button
                    variant={model === "sd35-turbo" ? "default" : "outline"}
                    onClick={() => setModel("sd35-turbo")}
                    className="justify-start"
                  >
                    <Wand2 className="mr-2 size-4" />
                    SD3.5 Turbo
                  </Button>
                  <Button
                    variant={model === "sd35" ? "default" : "outline"}
                    onClick={() => setModel("sd35")}
                    className="justify-start"
                  >
                    <Sparkles className="mr-2 size-4" />
                    SD3.5 Large
                  </Button>
                </div>
              </div>

              {(model === "sd35" || model === "sd35-turbo") && (
                <Card className="border-accent/20 bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Advanced Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Resolution</Label>
                        <select
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="512x512">512x512</option>
                          <option value="768x768">768x768</option>
                          <option value="1024x1024">1024x1024 (Default)</option>
                          <option value="1024x768">1024x768 (Landscape)</option>
                          <option value="768x1024">768x1024 (Portrait)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Inference Steps: {inferenceSteps}</Label>
                        <input
                          type="range"
                          min="20"
                          max="50"
                          value={inferenceSteps}
                          onChange={(e) => setInferenceSteps(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Guidance Scale: {guidanceScale.toFixed(1)}</Label>
                      <input
                        type="range"
                        min="3"
                        max="15"
                        step="0.5"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Negative Prompt (Optional)</Label>
                      <Textarea
                        placeholder="Elements to avoid (e.g., blurry, low quality, distorted)"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        rows={2}
                        className="resize-none text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="nsfw"
                        checked={nsfwAllowed}
                        onChange={(e) => setNsfwAllowed(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="nsfw" className="text-xs cursor-pointer">
                        Allow NSFW content (uncensored)
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>System Prompt (Optional)</Label>
                <Textarea
                  placeholder="Add guidance for the AI generator (e.g., art style, quality tags, specific requirements)..."
                  value={systemPrompt}
                  onChange={(e) => handleSystemPromptChange(e.target.value)}
                  rows={2}
                  className="resize-none text-sm transition-all focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3" />
                  This will be prepended to your prompt to guide the generation. Saved automatically.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Your Prompt</Label>
                <Textarea
                  placeholder="A mystical forest with glowing mushrooms under moonlight..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <Button
                onClick={handleTextToImage}
                disabled={loading || !prompt.trim()}
                className="w-full gap-2 group transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4 group-hover:rotate-12 transition-transform" />
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="img2img" className="space-y-4">
          <Card className="border-primary/20 animate-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle>Generate from Image</CardTitle>
              <CardDescription>Upload an image and describe how you want to transform it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Source Image</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {uploadedImage ? uploadedImage.name : "Upload Image"}
                  </Button>
                </div>
                {uploadPreview && (
                  <div className="relative mt-2 aspect-square w-full overflow-hidden rounded-lg border border-border">
                    <img
                      src={uploadPreview || "/placeholder.svg"}
                      alt="Upload preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Transformation Prompt</Label>
                <Textarea
                  placeholder="Describe how you want to transform the image..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <Button
                onClick={handleImageToImage}
                disabled={loading || !prompt.trim() || !uploadedImage}
                className="w-full gap-2 group transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <ImageIcon className="size-4 group-hover:rotate-12 transition-transform" />
                    Transform Image (4x)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perchance" className="space-y-4">
          <Card className="border-primary/20 animate-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Perchance Image Generator
              </CardTitle>
              <CardDescription>
                Interactive AI image generator with advanced controls - Generate directly in the embedded interface
                below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border overflow-hidden bg-background">
                <iframe
                  src="https://perchance.org/wlt0w9qgzh"
                  className="w-full h-[800px] border-0"
                  title="Perchance Image Generator"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                  loading="lazy"
                />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Sparkles className="size-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">How to use this generator:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Enter your prompt in the text field within the generator</li>
                    <li>Adjust any settings or parameters as needed</li>
                    <li>Click generate to create your images</li>
                    <li>Right-click generated images to save them to your device</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {generatedImages.length > 0 && (
        <Card className="border-primary/20 animate-in slide-in-from-bottom duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Generated Results
            </CardTitle>
            <CardDescription>Click an image to view full size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 animate-in fade-in zoom-in duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedImage(image)}
                >
                  {!imagesLoaded[index] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Generated ${index + 1}`}
                    className="size-full object-cover transition-all group-hover:scale-105"
                    onLoad={() => {
                      const newLoaded = [...imagesLoaded]
                      newLoaded[index] = true
                      setImagesLoaded(newLoaded)
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1 bg-background/80 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        const a = document.createElement("a")
                        a.href = image
                        a.download = `generated-${Date.now()}-${index}.png`
                        a.click()
                      }}
                    >
                      <Download className="size-3" />
                      Save
                    </Button>
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-background/80 backdrop-blur-sm"
                  >
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] animate-in zoom-in duration-500">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 gap-2"
              onClick={(e) => {
                e.stopPropagation()
                const a = document.createElement("a")
                a.href = selectedImage
                a.download = `generated-${Date.now()}.png`
                a.click()
              }}
            >
              <Download className="size-4" />
              Download
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-accent/20 animate-in slide-in-from-left duration-700 delay-200">
          <CardHeader>
            <CardTitle className="text-base">Tips for Better Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Be specific about style, mood, and details</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use descriptive adjectives (vivid, detailed, atmospheric)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Mention lighting and color schemes for better atmosphere</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use System Prompt to define art style or quality requirements that apply to all generations</span>
            </p>
            {(model === "sd35" || model === "sd35-turbo") && (
              <p className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>SD3.5: Higher steps (40-50) = better quality but slower. Turbo is faster.</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 animate-in slide-in-from-right duration-700 delay-300">
          <CardHeader>
            <CardTitle className="text-base">Generation Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {model === "pollinations" && (
              <>
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Powered by Flux via Pollinations AI</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Fast generation with high quality results</span>
                </p>
              </>
            )}
            {(model === "sd35" || model === "sd35-turbo") && (
              <>
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Powered by Stable Diffusion 3.5 via Hugging Face</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Cloud-based generation (no local GPU required)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>{model === "sd35-turbo" ? "Turbo: Faster generation" : "Large: Highest quality"}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Free tier may have rate limits</span>
                </p>
              </>
            )}
            <p className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>Each generation creates 4 unique variations</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
