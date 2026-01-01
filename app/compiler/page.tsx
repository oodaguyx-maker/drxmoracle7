"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { saveCharacter, generateId, type Character, type CharCreateProfile } from "@/lib/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CharacterData {
  name: string
  description: string
  personality: string
  scenario: string
  first_mes: string
  mes_example: string
  tags?: string[]
  attributes?: Record<string, any>
}

export default function CompilerPage() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [userPrompt, setUserPrompt] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [characterData, setCharacterData] = useState<CharacterData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [importedProfile, setImportedProfile] = useState<CharCreateProfile | null>(null)

  useEffect(() => {
    const importedData = localStorage.getItem("compiler-import-profile")
    if (importedData) {
      try {
        const profile: CharCreateProfile = JSON.parse(importedData)
        setImportedProfile(profile)

        // Load images from profile
        const imageUrls = profile.images.map((img) => img.url)
        setImages(imageUrls)

        // Set user prompt with profile info
        if (profile.description) {
          setUserPrompt(profile.description)
        }

        // Clear the import data
        localStorage.removeItem("compiler-import-profile")
      } catch (e) {
        console.error("Failed to load imported profile:", e)
      }
    }
  }, [])

  const handleImageUpload = (index: number, file: File | null) => {
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setImages((prev) => {
        const newImages = [...prev]
        newImages[index] = base64
        return newImages
      })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = ""
    }
  }

  const analyzeCharacter = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setCharacterData(null)

    try {
      const response = await fetch("/api/analyze-character-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images,
          userPrompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze character")
      }

      setCharacterData(data.character)
    } catch (err) {
      console.error("[v0] Analysis error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze character")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveToCharacters = () => {
    if (!characterData) return

    console.log("[v0] Saving character to storage...")

    const newCharacter: Character = {
      id: generateId(),
      name: characterData.name,
      description: characterData.description,
      personality: characterData.personality,
      scenario: characterData.scenario,
      first_mes: characterData.first_mes,
      mes_example: characterData.mes_example,
      gallery: images,
      avatar: images[0],
      attributes: characterData.attributes as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveCharacter(newCharacter)
    console.log("[v0] Character saved successfully:", newCharacter.id)

    toast.success(`Character "${characterData.name}" saved successfully!`, {
      description: "Redirecting to characters page...",
      duration: 2000,
    })

    setTimeout(() => {
      router.push("/characters")
    }, 500)
  }

  const exportJSON = () => {
    if (!characterData) return

    const exportData = {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        ...characterData,
        creator: "BlackOracle Compiler",
        character_version: "1.0",
        gallery: images,
        avatar: images[0],
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${characterData.name.replace(/\s+/g, "_")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const editField = (field: keyof CharacterData, value: string) => {
    if (!characterData) return
    setCharacterData({ ...characterData, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" size="sm" className="gap-1">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Character Compiler</h1>
        <p className="text-muted-foreground">Upload images and let AI create detailed character profiles</p>
      </div>

      {importedProfile && (
        <Alert className="border-pink-500/50 bg-pink-500/10">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Imported profile <strong>{importedProfile.name}</strong> with {importedProfile.images.length} image
            {importedProfile.images.length !== 1 ? "s" : ""} from CreateBooru Mode
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Upload</CardTitle>
              <CardDescription>Upload up to 4 images for AI to analyze (at least 1 required)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="space-y-2">
                    <Label>Image {index + 1}</Label>
                    {images[index] ? (
                      <div className="relative aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={images[index] || "/placeholder.svg"}
                          alt={`Upload ${index + 1}`}
                          className="size-full object-cover"
                        />
                        <Button
                          onClick={() => removeImage(index)}
                          variant="destructive"
                          size="sm"
                          className="absolute right-2 top-2"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed">
                        <Input
                          ref={(el) => {
                            fileInputRefs.current[index] = el
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`image-${index}`}
                        />
                        <Label
                          htmlFor={`image-${index}`}
                          className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center"
                        >
                          <svg
                            className="size-8 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm text-muted-foreground">Click to upload</span>
                        </Label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Character Context</CardTitle>
              <CardDescription>Provide additional details about the character (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="E.g., This is a vampire princess from the 18th century who loves seduction and control. She has a sadistic streak and enjoys..."
                rows={6}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <Button onClick={analyzeCharacter} disabled={isAnalyzing || images.length === 0} className="w-full" size="lg">
            {isAnalyzing ? (
              <>
                <svg className="mr-2 size-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing Character...
              </>
            ) : (
              <>
                <svg className="mr-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Character
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {characterData ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Generated Character</CardTitle>
                      <CardDescription>Edit any fields before saving or exporting</CardDescription>
                    </div>
                    {characterData.tags && (
                      <div className="flex flex-wrap gap-1">
                        {characterData.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={characterData.name}
                      onChange={(e) => editField("name", e.target.value)}
                      className="font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={characterData.description}
                      onChange={(e) => editField("description", e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Personality</Label>
                    <Textarea
                      value={characterData.personality}
                      onChange={(e) => editField("personality", e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scenario</Label>
                    <Textarea
                      value={characterData.scenario}
                      onChange={(e) => editField("scenario", e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>First Message</Label>
                    <Textarea
                      value={characterData.first_mes}
                      onChange={(e) => editField("first_mes", e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Example Dialogue</Label>
                    <Textarea
                      value={characterData.mes_example}
                      onChange={(e) => editField("mes_example", e.target.value)}
                      rows={5}
                      className="resize-none font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={saveToCharacters} className="flex-1" size="lg">
                  <svg className="mr-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save to Characters
                </Button>
                <Button onClick={exportJSON} variant="outline" className="flex-1 bg-transparent" size="lg">
                  <svg className="mr-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export JSON
                </Button>
              </div>
            </>
          ) : (
            <Card className="min-h-[600px]">
              <CardContent className="flex h-full min-h-[600px] flex-col items-center justify-center text-center">
                <svg
                  className="mb-4 size-16 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-semibold">No Character Generated Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Upload images and click Generate Character to create an AI-powered character profile
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
