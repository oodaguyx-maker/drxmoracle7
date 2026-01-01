"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Flame, Download, Upload, Wand2, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function GrokImgOvenPage() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [stylePreset, setStylePreset] = useState("photorealistic")
  const [generatedImages, setGeneratedImages] = useState<Array<{ url?: string }>>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [numOutputs, setNumOutputs] = useState(4)
  const [activeTab, setActiveTab] = useState("text2img")

  const [selectedModel, setSelectedModel] = useState("nsfw-flux-dev")

  // Model-specific parameters
  const [guidance, setGuidance] = useState(3.5)
  const [steps, setSteps] = useState(28)
  const [seed, setSeed] = useState(-1)
  const [promptStrength, setPromptStrength] = useState(0.8)
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [outputQuality, setOutputQuality] = useState(90)

  const [enhanceQuality, setEnhanceQuality] = useState(true)
  const [enhanceBody, setEnhanceBody] = useState(true)

  // Image-to-image state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)

  const negativePromptPresets = {
    quality:
      "ugly, deformed, disfigured, bad anatomy, bad proportions, extra limbs, missing limbs, poorly drawn hands, poorly drawn face, mutated, blurry, low quality, low resolution, worst quality, jpeg artifacts, watermark, signature, username, text, error, cropped",
    bodyQuality:
      "thin, skinny, flat chest, small breasts, flat hips, bony, malnourished, anorexic, emaciated, gaunt, skeletal, underweight, petite, small body",
    faceQuality:
      "ugly face, bad face, asymmetric face, distorted features, weird eyes, crossed eyes, dead eyes, bad teeth, no pupils, malformed face, disfigured face, deformed face",
    technical:
      "low res, pixelated, grainy, noisy, compression artifacts, oversaturated, desaturated, washed out, overexposed, underexposed, bad lighting, amateur",
  }

  const stylePresets = {
    photorealistic: {
      positive:
        "photorealistic, ultra realistic, RAW photo, 8k uhd, professional photography, DSLR, studio lighting, sharp focus, physically-based rendering, extreme detail",
      negative: "",
    },
    anime: {
      positive:
        "anime style, beautiful anime girl, detailed anime art, vibrant colors, anime illustration, cel shaded, manga style, anime aesthetic",
      negative: "3d, realistic, photo, photography, cgi",
    },
  }

  const toggleNegativeTag = (category: keyof typeof negativePromptPresets) => {
    const tags = negativePromptPresets[category]
    if (negativePrompt.includes(tags)) {
      setNegativePrompt(negativePrompt.replace(tags, "").replace(/,\s*,/g, ",").trim())
    } else {
      setNegativePrompt(negativePrompt ? `${negativePrompt}, ${tags}` : tags)
    }
  }

  const applyAllQualityTags = () => {
    const allTags = Object.values(negativePromptPresets).join(", ")
    setNegativePrompt(allTags)
  }

  const handleTextToImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setLoading(true)
    setGeneratedImages([])

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("negative_prompt", negativePrompt)
      formData.append("style_preset", stylePreset)
      formData.append("model", selectedModel)
      formData.append("guidance", guidance.toString())
      formData.append("steps", steps.toString())
      formData.append("seed", seed.toString())
      formData.append("num_outputs", numOutputs.toString())
      formData.append("aspect_ratio", aspectRatio)
      formData.append("output_quality", outputQuality.toString())
      formData.append("enhance_quality", enhanceQuality.toString())
      formData.append("enhance_body", enhanceBody.toString())

      const response = await fetch("/api/grok-imgoven", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate images")
      }

      const result = await response.json()

      if (!result.data || result.data.length === 0) {
        throw new Error("No valid image URLs returned from API")
      }

      setGeneratedImages(result.data)
      toast.success(`Generated ${result.data.length} image${result.data.length > 1 ? "s" : ""}!`)
    } catch (error) {
      console.error("[v0] Image generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate images")
    } finally {
      setLoading(false)
    }
  }

  const handleImageToImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }
    if (!uploadedImage) {
      toast.error("Please upload an image first")
      return
    }

    setLoading(true)
    setGeneratedImages([])

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("negative_prompt", negativePrompt)
      formData.append("style_preset", stylePreset)
      formData.append("model", selectedModel)
      formData.append("guidance", guidance.toString())
      formData.append("steps", steps.toString())
      formData.append("seed", seed.toString())
      formData.append("prompt_strength", promptStrength.toString())
      formData.append("num_outputs", numOutputs.toString())
      formData.append("output_quality", outputQuality.toString())
      formData.append("enhance_quality", enhanceQuality.toString())
      formData.append("enhance_body", enhanceBody.toString())
      formData.append("image", uploadedImage)

      const response = await fetch("/api/grok-imgoven", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to transform image")
      }

      const result = await response.json()

      if (!result.data || result.data.length === 0) {
        throw new Error("No valid image URLs returned from API")
      }

      setGeneratedImages(result.data)
      toast.success(`Created ${result.data.length} variation${result.data.length > 1 ? "s" : ""}!`)
    } catch (error) {
      console.error("[v0] Image transformation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to transform image")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `grok-imgoven-${Date.now()}-${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success("Image downloaded!")
    } catch (error) {
      toast.error("Failed to download image")
    }
  }

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="size-4 ml-1 text-muted-foreground cursor-help inline-block" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          🔥 GrokImgOven
        </h1>
        <p className="text-muted-foreground text-lg">
          Unrestricted NSFW Image Generation - No Content Filters, No Limits
        </p>
        <Badge variant="destructive" className="mt-2">
          NSFW / 18+ Only
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="text2img" className="gap-2">
            <Wand2 className="size-4" />
            Text to Image
          </TabsTrigger>
          <TabsTrigger value="img2img" className="gap-2">
            <Upload className="size-4" />
            Image to Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text2img" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
            {/* Left: Input Controls */}
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="size-5 text-orange-500" />
                  Generate from Text
                </CardTitle>
                <CardDescription>
                  Create any image you want with powerful AI models - completely unrestricted and uncensored.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    AI Model
                    <InfoTooltip content="Top 4 NSFW-permissive models: NSFW Flux-dev (270K+ runs), Flux-dev (10M+ runs), Flux Unchained (community favorite), XRsfw77 (extreme NSFW specialist)." />
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nsfw-flux-dev">🔥 NSFW Flux-dev (Uncensored, 270K+ runs)</SelectItem>
                      <SelectItem value="flux-dev">🎨 Flux-dev (Official, 10M+ runs)</SelectItem>
                      <SelectItem value="flux-unchained">⛓️ Flux Unchained (NSFW-tuned)</SelectItem>
                      <SelectItem value="xrsfw77">💥 XRsfw77 (Extreme NSFW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Style Preset
                    <InfoTooltip content="Choose between photorealistic supermodel quality or anime/hentai style. Each preset adds specific enhancements to your prompt." />
                  </Label>
                  <Select value={stylePreset} onValueChange={setStylePreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photorealistic">📸 Photorealistic (Supermodel Quality)</SelectItem>
                      <SelectItem value="anime">🎨 Anime / Hentai Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Your Prompt</Label>
                  <Textarea
                    placeholder="A voluptuous woman with curvy hips, large breasts, soft belly, long wavy hair, seductive expression, nude in luxurious bedroom, highly detailed skin texture, realistic lighting, cinematic composition..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="resize-none text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be extremely detailed! Include anatomy, pose, style, mood, lighting, and composition for best
                    results.
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center">
                      Negative Prompt (Avoid These)
                      <InfoTooltip content="Specify what you DON'T want in the image. Use preset tags below or write custom negative prompts to avoid unwanted elements like bad anatomy, low quality, or thin bodies." />
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyAllQualityTags}
                      className="text-xs bg-transparent"
                    >
                      Apply All Tags
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.quality) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("quality")}
                      className="text-xs"
                    >
                      🚫 Quality Issues
                    </Button>
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.bodyQuality) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("bodyQuality")}
                      className="text-xs"
                    >
                      💪 Thin/Skinny Bodies
                    </Button>
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.faceQuality) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("faceQuality")}
                      className="text-xs"
                    >
                      👤 Face Issues
                    </Button>
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.technical) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("technical")}
                      className="text-xs"
                    >
                      🔧 Technical Problems
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Click tags above or type custom negative prompts here..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={4}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Negative prompts help ensure voluptuous, beautiful supermodel-quality results by filtering out
                    unwanted attributes.
                  </p>
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enhance-quality" className="font-semibold cursor-pointer">
                        Quality Enhancement
                      </Label>
                      <InfoTooltip content="Automatically adds quality boosters like 'masterpiece, 8k uhd, photorealistic' and removes bad anatomy, distortions, and artifacts." />
                    </div>
                    <Switch id="enhance-quality" checked={enhanceQuality} onCheckedChange={setEnhanceQuality} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enhance-body" className="font-semibold cursor-pointer">
                        Voluptuous Body Enhancement
                      </Label>
                      <InfoTooltip content="Emphasizes curvy, voluptuous figures with full breasts, wide hips, thick thighs, and soft skin for sexier results." />
                    </div>
                    <Switch id="enhance-body" checked={enhanceBody} onCheckedChange={setEnhanceBody} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Guidance Scale: {guidance}
                    <InfoTooltip content="Controls how closely the AI follows your prompt. Higher values = stricter adherence. Range: 0-10. Recommended: 2-4 for natural results, 7-10 for exact matching." />
                  </Label>
                  <Slider
                    value={[guidance]}
                    onValueChange={(val) => setGuidance(val[0])}
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Inference Steps: {steps}
                    <InfoTooltip content="Number of denoising steps. More steps = higher quality but slower generation. Range: 1-50. Recommended: 28-50 for quality, 4-8 for speed." />
                  </Label>
                  <Slider
                    value={[steps]}
                    onValueChange={(val) => setSteps(val[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Aspect Ratio
                    <InfoTooltip content="Image dimensions. Square for profiles, Portrait for full body shots, Landscape for scenes, Ultrawide for cinematic views." />
                  </Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">⬜ Square (1:1) - 1024x1024</SelectItem>
                      <SelectItem value="16:9">🖼️ Landscape (16:9) - 1344x768</SelectItem>
                      <SelectItem value="9:16">📱 Portrait (9:16) - 768x1344</SelectItem>
                      <SelectItem value="4:3">📺 Standard (4:3) - 1152x896</SelectItem>
                      <SelectItem value="3:4">🖼️ Vertical (3:4) - 896x1152</SelectItem>
                      <SelectItem value="21:9">🎬 Ultrawide (21:9) - 1536x640</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Seed (for reproducibility)
                    <InfoTooltip content="Random seed for generation. Leave at -1 for random results each time. Set a specific number to reproduce the exact same image with the same settings." />
                  </Label>
                  <Input
                    type="number"
                    value={seed === -1 ? "" : seed}
                    onChange={(e) => setSeed(Number.parseInt(e.target.value) || -1)}
                    placeholder="Random (-1)"
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Number of Images (1-4)
                    <InfoTooltip content="Generate multiple variations at once. Each image will have slight differences based on the same prompt." />
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant={numOutputs === num ? "default" : "outline"}
                        onClick={() => setNumOutputs(num)}
                        className="flex-1"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleTextToImage}
                  disabled={loading || !prompt.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Flame className="size-4" />
                      Generate {numOutputs} Image{numOutputs > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right: Results */}
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle>Generated Images</CardTitle>
                <CardDescription>
                  {generatedImages.length > 0
                    ? `${generatedImages.length} image${generatedImages.length > 1 ? "s" : ""} generated`
                    : "Your images will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Generated ${idx + 1}`}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            console.error("[v0] Image failed to load:", img.url)
                            e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => img.url && downloadImage(img.url, idx)}
                            className="gap-2"
                          >
                            <Download className="size-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <Flame className="size-12 mx-auto mb-2 opacity-20" />
                      <p>No images generated yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="img2img" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
            {/* Left: Input Controls */}
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="size-5 text-orange-500" />
                  Image to Image
                </CardTitle>
                <CardDescription>
                  Transform an existing image with AI guidance - perfect for variations and edits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    AI Model
                    <InfoTooltip content="Top 4 NSFW-permissive models: NSFW Flux-dev (270K+ runs), Flux-dev (10M+ runs), Flux Unchained (community favorite), XRsfw77 (extreme NSFW specialist)." />
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nsfw-flux-dev">🔥 NSFW Flux-dev (Uncensored, 270K+ runs)</SelectItem>
                      <SelectItem value="flux-dev">🎨 Flux-dev (Official, 10M+ runs)</SelectItem>
                      <SelectItem value="flux-unchained">⛓️ Flux Unchained (NSFW-tuned)</SelectItem>
                      <SelectItem value="xrsfw77">💥 XRsfw77 (Extreme NSFW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Style Preset
                    <InfoTooltip content="Choose between photorealistic supermodel quality or anime/hentai style." />
                  </Label>
                  <Select value={stylePreset} onValueChange={setStylePreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photorealistic">📸 Photorealistic (Supermodel Quality)</SelectItem>
                      <SelectItem value="anime">🎨 Anime / Hentai Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Upload Image
                    <InfoTooltip content="Upload a reference image to transform. Works with photos, drawings, or any image you want to modify." />
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-500/50 transition-colors">
                    {uploadPreview ? (
                      <div className="relative">
                        <img
                          src={uploadPreview || "/placeholder.svg"}
                          alt="Upload preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setUploadedImage(null)
                            setUploadPreview(null)
                          }}
                          className="mt-2"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="size-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center">
                      Negative Prompt (Avoid These)
                      <InfoTooltip content="Specify what you DON'T want in the transformed image." />
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyAllQualityTags}
                      className="text-xs bg-transparent"
                    >
                      Apply All Tags
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.quality) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("quality")}
                      className="text-xs"
                    >
                      🚫 Quality Issues
                    </Button>
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.bodyQuality) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("bodyQuality")}
                      className="text-xs"
                    >
                      💪 Thin/Skinny Bodies
                    </Button>
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.faceQuality) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("faceQuality")}
                      className="text-xs"
                    >
                      👤 Face Issues
                    </Button>
                    <Button
                      variant={negativePrompt.includes(negativePromptPresets.technical) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNegativeTag("technical")}
                      className="text-xs"
                    >
                      🔧 Technical Problems
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Click tags above or type custom negative prompts here..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={4}
                    className="resize-none text-sm"
                  />
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enhance-quality-img2img" className="font-semibold cursor-pointer">
                        Quality Enhancement
                      </Label>
                      <InfoTooltip content="Automatically adds quality boosters and removes bad anatomy, distortions, and artifacts." />
                    </div>
                    <Switch id="enhance-quality-img2img" checked={enhanceQuality} onCheckedChange={setEnhanceQuality} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enhance-body-img2img" className="font-semibold cursor-pointer">
                        Voluptuous Body Enhancement
                      </Label>
                      <InfoTooltip content="Emphasizes curvy, voluptuous figures with full features for sexier results." />
                    </div>
                    <Switch id="enhance-body-img2img" checked={enhanceBody} onCheckedChange={setEnhanceBody} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Prompt Strength: {promptStrength}
                    <InfoTooltip content="Controls how much the AI transforms the original image. 0 = keep original, 1 = completely new image. Range: 0-1. Recommended: 0.6-0.8 for balanced transformation." />
                  </Label>
                  <Slider
                    value={[promptStrength]}
                    onValueChange={(val) => setPromptStrength(val[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Guidance Scale: {guidance}
                    <InfoTooltip content="Controls how closely the AI follows your prompt. Higher values = stricter adherence. Range: 0-10. Recommended: 2-4 for natural results." />
                  </Label>
                  <Slider
                    value={[guidance]}
                    onValueChange={(val) => setGuidance(val[0])}
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    Number of Variations (1-4)
                    <InfoTooltip content="Generate multiple versions of the transformation with slight differences." />
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant={numOutputs === num ? "default" : "outline"}
                        onClick={() => setNumOutputs(num)}
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
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Transforming...
                    </>
                  ) : (
                    <>
                      <Flame className="size-4" />
                      Transform Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right: Results */}
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle>Transformed Images</CardTitle>
                <CardDescription>
                  {generatedImages.length > 0
                    ? `${generatedImages.length} variation${generatedImages.length > 1 ? "s" : ""} generated`
                    : "Your transformed images will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Transformed ${idx + 1}`}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            console.error("[v0] Image failed to load:", img.url)
                            e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => img.url && downloadImage(img.url, idx)}
                            className="gap-2"
                          >
                            <Download className="size-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <Upload className="size-12 mx-auto mb-2 opacity-20" />
                      <p>No images transformed yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
