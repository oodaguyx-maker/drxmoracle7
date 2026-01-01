"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Sparkles, Wand2, ImageIcon, ArrowLeft, Settings2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function GrokImagesPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ url?: string; b64_json?: string; revised_prompt?: string }>
  >([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [numImages, setNumImages] = useState(4)
  const [responseFormat, setResponseFormat] = useState<"url" | "b64_json">("url")
  const [activeTab, setActiveTab] = useState("text2img")

  // Image-to-image state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextToImage = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setGeneratedImages([])
    console.log("[v0] Starting Grok image generation with", numImages, "images")

    try {
      const response = await fetch("/api/grok-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          n: numImages,
          response_format: responseFormat,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API error:", errorData)
        throw new Error(errorData.error || `Failed to generate images: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Generated", data.data.length, "images successfully")
      setGeneratedImages(data.data)
    } catch (error) {
      console.error("[v0] Image generation error:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate images. Please check your XAI API key and try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleImageToImage = async () => {
    if (!prompt.trim() || !uploadedImage) return

    setLoading(true)
    setGeneratedImages([])
    console.log("[v0] Starting Grok image-to-image generation")

    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(uploadedImage)
      })

      const response = await fetch("/api/grok-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          n: numImages,
          response_format: responseFormat,
          image_data: base64Image,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API error:", errorData)
        throw new Error(errorData.error || `Failed to generate images: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Generated", data.data.length, "images successfully")
      setGeneratedImages(data.data)
    } catch (error) {
      console.error("[v0] Image-to-image error:", error)
      alert(error instanceof Error ? error.message : "Failed to generate images. Please try again.")
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

  const downloadImage = (imageData: { url?: string; b64_json?: string }, index: number) => {
    const link = document.createElement("a")
    if (imageData.url) {
      link.href = imageData.url
    } else if (imageData.b64_json) {
      link.href = imageData.b64_json
    }
    link.download = `grok-generated-${Date.now()}-${index}.jpg`
    link.click()
  }

  const getImageSrc = (imageData: { url?: string; b64_json?: string }) => {
    return imageData.url || imageData.b64_json || ""
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/extensions")} variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="size-4" />
            Back to Extensions
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Sparkles className="size-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                Grok
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Grok Images</h1>
              <p className="text-lg text-muted-foreground">Generate stunning images with xAI's Grok-2 Image model</p>
            </div>
          </div>

          <Badge variant="outline" className="gap-1 text-sm">
            <Settings2 className="size-3" />
            API Key Required
          </Badge>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Sparkles className="mt-0.5 size-5 flex-shrink-0 text-blue-500" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">API Configuration Required</p>
              <p className="text-muted-foreground">
                Add your XAI API key as <code className="rounded bg-muted px-1 py-0.5">XAI_API_KEY</code> in the{" "}
                <strong>Vars</strong> section of the in-chat sidebar. Get your key from{" "}
                <a
                  href="https://console.x.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  console.x.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text2img" className="gap-2">
              <Wand2 className="size-4" />
              Text to Image
            </TabsTrigger>
            <TabsTrigger value="img2img" className="gap-2">
              <ImageIcon className="size-4" />
              Image to Image
            </TabsTrigger>
          </TabsList>

          {/* Text to Image Tab */}
          <TabsContent value="text2img" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
              {/* Left: Input Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="size-5 text-blue-500" />
                    Generate from Text
                  </CardTitle>
                  <CardDescription>
                    Describe the image you want to create. Grok will enhance your prompt automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Your Prompt</Label>
                    <Textarea
                      placeholder="A futuristic city at sunset with flying cars and neon lights..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                      className="resize-none text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be descriptive! Include details about style, mood, lighting, and composition.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Number of Images</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <Button
                          key={num}
                          variant={numImages === num ? "default" : "outline"}
                          onClick={() => setNumImages(num)}
                          className="flex-1"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Response Format</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={responseFormat === "url" ? "default" : "outline"}
                        onClick={() => setResponseFormat("url")}
                        className="flex-1"
                      >
                        URL (Recommended)
                      </Button>
                      <Button
                        variant={responseFormat === "b64_json" ? "default" : "outline"}
                        onClick={() => setResponseFormat("b64_json")}
                        className="flex-1"
                      >
                        Base64
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleTextToImage}
                    disabled={loading || !prompt.trim()}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating with Grok...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Generate Images
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Right: Tips & Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pro Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Grok automatically enhances your prompts for better results</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Include style keywords like "photorealistic", "oil painting", or "anime"</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Specify lighting: "golden hour", "neon lighting", "dramatic shadows"</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Add composition details: "wide angle", "close-up", "bird's eye view"</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-cyan-500/20 bg-cyan-500/5">
                  <CardHeader>
                    <CardTitle className="text-base">Model Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-mono font-semibold">grok-2-image</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-mono">JPG</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Images:</span>
                      <span className="font-mono">10 per request</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Image to Image Tab */}
          <TabsContent value="img2img" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="size-5 text-blue-500" />
                  Generate from Reference Image
                </CardTitle>
                <CardDescription>
                  Upload an image and describe how you want to transform or reimagine it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Reference Image</Label>
                    <div className="space-y-3">
                      <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                        <ImageIcon className="mr-2 size-4" />
                        {uploadedImage ? uploadedImage.name : "Upload Reference Image"}
                      </Button>
                      {uploadPreview && (
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                          <img
                            src={uploadPreview || "/placeholder.svg"}
                            alt="Upload preview"
                            className="size-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Transformation Prompt</Label>
                    <Textarea
                      placeholder="Transform this into a cyberpunk style with neon colors..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Number of Variations</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant={numImages === num ? "default" : "outline"}
                        onClick={() => setNumImages(num)}
                        className="flex-1"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleImageToImage}
                  disabled={loading || !prompt.trim() || !uploadedImage}
                  className="w-full gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Transforming with Grok...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-4" />
                      Generate Variations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {generatedImages.length > 0 && (
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-blue-500" />
                Generated Images
              </CardTitle>
              <CardDescription>Click an image to view full size and see the enhanced prompt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${numImages === 1 ? "grid-cols-1 max-w-2xl mx-auto" : "md:grid-cols-2"}`}>
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-muted"
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={getImageSrc(image) || "/placeholder.svg"}
                      alt={`Generated ${index + 1}`}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(image, index)
                        }}
                      >
                        <Download className="size-3" />
                        Save
                      </Button>
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute left-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Screen Modal */}
        {selectedImage !== null && generatedImages[selectedImage] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative flex max-h-[90vh] w-full max-w-7xl gap-4" onClick={(e) => e.stopPropagation()}>
              {/* Image */}
              <div className="flex-1">
                <img
                  src={getImageSrc(generatedImages[selectedImage]) || "/placeholder.svg"}
                  alt="Full size"
                  className="max-h-[90vh] w-full rounded-lg object-contain"
                />
              </div>

              {/* Info Panel */}
              <Card className="w-96 bg-background/95 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base">Generation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Image #{selectedImage + 1}</Label>
                    <Button
                      onClick={() => downloadImage(generatedImages[selectedImage], selectedImage)}
                      className="w-full gap-2"
                      variant="default"
                    >
                      <Download className="size-4" />
                      Download Image
                    </Button>
                  </div>

                  {generatedImages[selectedImage].revised_prompt && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Enhanced Prompt</Label>
                      <ScrollArea className="h-40 rounded-md border p-3">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {generatedImages[selectedImage].revised_prompt}
                        </p>
                      </ScrollArea>
                      <p className="text-xs text-muted-foreground">
                        Grok automatically enhanced your prompt for better results
                      </p>
                    </div>
                  )}

                  <Button onClick={() => setSelectedImage(null)} variant="outline" className="w-full">
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
