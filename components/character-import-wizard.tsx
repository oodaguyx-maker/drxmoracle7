"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import JSZip from "jszip"
import { Upload, ImageIcon, X, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { Character } from "@/lib/storage"

interface CharacterImportWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (character: Character) => void
}

interface ExtractedData {
  json?: any
  avatar?: string
  galleryImages: string[]
  galleryVideos: string[]
}

export function CharacterImportWizard({ open, onOpenChange, onImportComplete }: CharacterImportWizardProps) {
  const [step, setStep] = useState<"upload" | "review">("upload")
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [personality, setPersonality] = useState("")
  const [scenario, setScenario] = useState("")
  const [firstMessage, setFirstMessage] = useState("")
  const [messageExamples, setMessageExamples] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const resetWizard = () => {
    setStep("upload")
    setIsProcessing(false)
    setExtractedData(null)
    setName("")
    setDescription("")
    setPersonality("")
    setScenario("")
    setFirstMessage("")
    setMessageExamples("")
    setTags([])
    setNewTag("")
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast.error("Please upload a ZIP file")
      return
    }

    setIsProcessing(true)

    try {
      const zip = new JSZip()
      const contents = await zip.loadAsync(file)

      const extracted: ExtractedData = {
        galleryImages: [],
        galleryVideos: [],
      }

      const filePromises: Promise<void>[] = []

      contents.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return // Skip directories

        const filename = relativePath.toLowerCase()
        const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename)
        const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(filename)
        const isJson = /\.json$/i.test(filename)
        const isAvatar = /avatar\.(jpg|jpeg|png|gif|webp)$/i.test(filename)

        if (isAvatar) {
          filePromises.push(
            zipEntry.async("base64").then((base64) => {
              const ext = filename.split(".").pop()
              extracted.avatar = `data:image/${ext};base64,${base64}`
            }),
          )
        } else if (isJson) {
          filePromises.push(
            zipEntry.async("string").then((content) => {
              try {
                extracted.json = JSON.parse(content)
              } catch (e) {
                console.error("[v0] Failed to parse JSON:", e)
              }
            }),
          )
        } else if (isImage) {
          filePromises.push(
            zipEntry.async("base64").then((base64) => {
              const ext = filename.split(".").pop()
              extracted.galleryImages.push(`data:image/${ext};base64,${base64}`)
            }),
          )
        } else if (isVideo) {
          filePromises.push(
            zipEntry.async("base64").then((base64) => {
              const ext = filename.split(".").pop()
              extracted.galleryVideos.push(`data:video/${ext};base64,${base64}`)
            }),
          )
        }
      })

      await Promise.all(filePromises)

      if (!extracted.json) {
        toast.error("No JSON file found in ZIP. Please include a character JSON file.")
        setIsProcessing(false)
        return
      }

      const json = extracted.json
      setName(json.name || json.data?.name || "Imported Character")
      setDescription(json.description || json.data?.description || "")
      setPersonality(json.personality || json.data?.personality || "")
      setScenario(json.scenario || json.data?.scenario || "")
      setFirstMessage(json.first_mes || json.data?.first_mes || "Hello!")
      setMessageExamples(json.mes_example || json.data?.mes_example || "")
      setTags(json.tags || json.data?.tags || [])

      setExtractedData(extracted)
      setStep("review")
      toast.success(`Extracted ${extracted.galleryImages.length + extracted.galleryVideos.length} media files`)
    } catch (error) {
      console.error("[v0] ZIP extraction error:", error)
      toast.error("Failed to extract ZIP file. Please check the file format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    if (!extractedData) return

    const character: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      personality,
      scenario,
      first_mes: firstMessage,
      mes_example: messageExamples,
      avatar: extractedData.avatar,
      gallery: [...extractedData.galleryImages, ...extractedData.galleryVideos],
      tags,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Preserve original JSON structure if present
      spec: extractedData.json?.spec,
      spec_version: extractedData.json?.spec_version,
      data: extractedData.json?.data,
    }

    onImportComplete(character)
    toast.success(`Character "${name}" imported successfully!`)
    resetWizard()
    onOpenChange(false)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetWizard()
        onOpenChange(open)
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Import Character from ZIP
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload a ZIP file containing character JSON, avatar, and gallery media"
              : "Review and edit character details before importing"}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Upload className="size-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload Character ZIP</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    The ZIP should contain:
                    <br />• <strong>avatar.jpg/png</strong> - Character avatar
                    <br />• <strong>character.json</strong> - Character data
                    <br />• Other images/videos - Added to gallery
                  </p>
                  <Input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    disabled={isProcessing}
                    className="max-w-xs"
                  />
                  {isProcessing && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Processing ZIP file...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/30">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Supported Formats:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>ChubAI character JSON format</li>
                      <li>SillyTavern character JSON format</li>
                      <li>Custom JSON with standard character fields</li>
                      <li>Images: JPG, PNG, GIF, WebP, BMP</li>
                      <li>Videos: MP4, WebM, MOV, AVI, MKV</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "review" && extractedData && (
          <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="flex items-start gap-4">
                  <Avatar className="size-24 ring-2 ring-border">
                    <AvatarImage src={extractedData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Character name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Character description..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first-message">First Message</Label>
                  <Textarea
                    id="first-message"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder="Character's opening greeting..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="default" className="pl-3 pr-1 py-1 gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="size-5 p-0 hover:bg-destructive/20 rounded-full"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality</Label>
                  <Textarea
                    id="personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="Character personality traits..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario">Scenario</Label>
                  <Textarea
                    id="scenario"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Roleplay scenario and setting..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examples">Message Examples</Label>
                  <Textarea
                    id="examples"
                    value={messageExamples}
                    onChange={(e) => setMessageExamples(e.target.value)}
                    placeholder="Example dialogue..."
                    rows={6}
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Avatar</Label>
                    {extractedData.avatar ? (
                      <Badge variant="default" className="gap-1">
                        <Check className="size-3" />
                        Found
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Found</Badge>
                    )}
                  </div>
                  {extractedData.avatar && (
                    <img
                      src={extractedData.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Gallery Images</Label>
                    <Badge variant="secondary">{extractedData.galleryImages.length} images</Badge>
                  </div>
                  {extractedData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {extractedData.galleryImages.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Gallery Videos</Label>
                    <Badge variant="secondary">{extractedData.galleryVideos.length} videos</Badge>
                  </div>
                  {extractedData.galleryVideos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {extractedData.galleryVideos.map((video, idx) => (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border bg-black">
                          <video src={video} className="w-full h-full object-cover" controls />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {extractedData.galleryImages.length === 0 && extractedData.galleryVideos.length === 0 && (
                  <Card className="bg-muted/30">
                    <CardContent className="pt-6 pb-6 text-center">
                      <ImageIcon className="size-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No gallery media found in ZIP</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (step === "review") {
                setStep("upload")
              } else {
                resetWizard()
                onOpenChange(false)
              }
            }}
          >
            {step === "review" ? "Back" : "Cancel"}
          </Button>

          {step === "review" && (
            <Button onClick={handleImport} disabled={!name.trim()} className="gap-2">
              <Check className="size-4" />
              Import Character
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
