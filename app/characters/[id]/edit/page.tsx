"use client"

import type React from "react"
import { Plus, X, Code } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { getCharacter, saveCharacter, getLorebooks, getCharacters, type Character, type Lorebook } from "@/lib/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getGalleryItems, deleteGalleryItem, bulkAddGalleryItems, type GalleryItem } from "@/lib/supabase-gallery"

export default function EditCharacterPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.id as string

  const [character, setCharacter] = useState<Character | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [availableLorebooks, setAvailableLorebooks] = useState<Lorebook[]>([])
  const [attachedLorebooks, setAttachedLorebooks] = useState<string[]>([])
  const [embedInput, setEmbedInput] = useState("")
  const [isLoadingGallery, setIsLoadingGallery] = useState(false)

  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (characterId) {
        const char = getCharacter(characterId)
        if (!char) {
          router.push("/characters")
          return
        }
        setCharacter(char)
        setAvatarUrl(char.avatar || "")
        setAvatarPreview(char.avatar || null)
        setAttachedLorebooks(char.attachedLorebooks || [])
        setTags(char.tags || [])

        generateSuggestedTags()
      }

      setAvailableLorebooks(getLorebooks())

      if (characterId) {
        setIsLoadingGallery(true)
        const items = await getGalleryItems(characterId)
        setGalleryItems(items)
        setIsLoadingGallery(false)
      }
    }

    loadData()
  }, [characterId, router])

  const generateSuggestedTags = () => {
    const allChars = getCharacters()
    const tagSet = new Set<string>()

    allChars.forEach((char) => {
      char.tags?.forEach((tag) => tagSet.add(tag))
    })

    const commonTags = [
      "Female",
      "Male",
      "Non-binary",
      "Dominant",
      "Submissive",
      "Switch",
      "BDSM",
      "Vanilla",
      "Kinky",
      "Fantasy",
      "Modern",
      "Sci-fi",
      "Human",
      "Elf",
      "Demon",
      "Angel",
      "Furry",
      "Caring",
      "Tsundere",
      "Yandere",
      "Kuudere",
      "MILF",
      "Teen",
      "Mature",
      "Romance",
      "Adventure",
      "Comedy",
      "Dark",
    ]

    commonTags.forEach((tag) => tagSet.add(tag))

    setSuggestedTags(Array.from(tagSet).sort())
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setAvatarUrl(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertUrlToEmbed = (url: string): string => {
    const trimmedUrl = url.trim()

    if (trimmedUrl.includes("<iframe")) {
      return trimmedUrl
    }

    if (trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be")) {
      const videoId = trimmedUrl.match(
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
      )?.[1]
      if (videoId) {
        return `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
      }
    }

    if (trimmedUrl.includes("redgifs.com")) {
      const gifId = trimmedUrl.match(/redgifs\.com\/(?:watch\/)?([a-zA-Z0-9]+)/)?.[1]
      if (gifId) {
        return `<iframe src="https://www.redgifs.com/ifr/${gifId}" frameborder="0" scrolling="no" allowfullscreen></iframe>`
      }
    }

    if (trimmedUrl.includes("catbox.moe") || trimmedUrl.includes("files.catbox.moe")) {
      if (trimmedUrl.match(/\.(mp4|webm|mov)($|\?)/i)) {
        return `<iframe src="${trimmedUrl}" frameborder="0" allowfullscreen></iframe>`
      }
      return trimmedUrl
    }

    if (trimmedUrl.includes("imgur.com")) {
      const imgurId = trimmedUrl.match(/imgur\.com\/(?:gallery\/|a\/)?([a-zA-Z0-9]+)/)?.[1]
      if (imgurId) {
        return `<iframe src="https://imgur.com/${imgurId}/embed" frameborder="0" allowfullscreen></iframe>`
      }
    }

    if (trimmedUrl.match(/\.(mp4|webm|mov|gif|jpg|jpeg|png|webp)($|\?)/i)) {
      return trimmedUrl
    }

    return `<iframe src="${trimmedUrl}" frameborder="0" allowfullscreen></iframe>`
  }

  const detectMediaType = (embedCode: string): "embed" | "video" | "image" => {
    if (embedCode.includes("<iframe") || embedCode.includes("embed") || embedCode.includes("player")) {
      return "embed"
    }
    if (embedCode.match(/\.(mp4|webm|ogg|mov)($|\?)/i) || embedCode.includes("video")) {
      return "video"
    }
    return "image"
  }

  const handleAddEmbedCode = async () => {
    if (!embedInput.trim()) {
      toast.error("Please enter an embed code or URL")
      return
    }

    if (!characterId) {
      toast.error("Character ID not found")
      return
    }

    const inputs = embedInput.split("\n").filter((code) => code.trim())
    const convertedItems = inputs
      .map((input) => {
        const embedCode = convertUrlToEmbed(input.trim())
        const mediaType = detectMediaType(embedCode)
        return { embedCode, mediaType }
      })
      .filter((item) => item.embedCode)

    if (convertedItems.length === 0) {
      toast.error("No valid items to add")
      return
    }

    const newItems = await bulkAddGalleryItems(characterId, convertedItems)

    if (newItems.length > 0) {
      setGalleryItems((prev) => [...newItems, ...prev])
      toast.success(`Added ${newItems.length} item${newItems.length > 1 ? "s" : ""} to gallery`)
      setEmbedInput("")
    } else {
      toast.error("Failed to add items to gallery")
    }
  }

  const handleRemoveGalleryItem = async (itemId: string) => {
    const success = await deleteGalleryItem(itemId)

    if (success) {
      setGalleryItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success("Removed from gallery")
    } else {
      toast.error("Failed to remove item")
    }
  }

  const handleChange = (field: keyof Character, value: string) => {
    if (!character) return
    setCharacter({ ...character, [field]: value })
  }

  const toggleLorebook = (lorebookId: string) => {
    setAttachedLorebooks((prev) => {
      const updated = prev.includes(lorebookId) ? prev.filter((id) => id !== lorebookId) : [...prev, lorebookId]
      console.log("[v0] Lorebooks updated, total:", updated.length)
      return updated
    })
  }

  const getPreviewUrl = (embedCode: string): string | null => {
    if (embedCode.includes("<iframe")) {
      const srcMatch = embedCode.match(/src=["']([^"']+)["']/)
      return srcMatch ? srcMatch[1] : null
    }
    return embedCode
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
    }
  }

  const handleSave = async () => {
    if (!character) return
    setIsSaving(true)
    const success = await saveCharacter({
      ...character,
      avatar: avatarUrl,
      attachedLorebooks: attachedLorebooks,
      tags: tags,
    })
    setIsSaving(false)
    if (success) {
      toast.success("Character saved successfully")
      router.push(`/characters/${character.id}`)
    } else {
      toast.error("Failed to save character")
    }
  }

  if (!character) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push(`/characters/${character?.id}`)} variant="ghost" size="sm" className="gap-1">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Character
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Character</h1>
          <p className="text-muted-foreground">Customize your character's details</p>
        </div>
        <Button onClick={() => router.push(`/characters/${character.id}`)} variant="outline" disabled={isSaving}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Character Information</CardTitle>
          <CardDescription>Basic details about your character</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-20">
              <AvatarImage src={avatarPreview || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{character.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="avatar-file">Upload Avatar Image</Label>
                <Input id="avatar-file" type="file" accept="image/*" onChange={handleAvatarFileChange} />
                <p className="text-xs text-muted-foreground">Upload an image file (JPG, PNG, GIF, etc.)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar-url">Or paste Avatar URL</Label>
                <Input
                  id="avatar-url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarFile ? "" : avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value)
                    setAvatarPreview(e.target.value)
                    setAvatarFile(null)
                  }}
                  disabled={!!avatarFile}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={character.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Character name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={character.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="A brief description of the character's appearance, background, and key traits..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Textarea
              id="personality"
              value={character.personality}
              onChange={(e) => handleChange("personality", e.target.value)}
              placeholder="Character's personality traits, behavior patterns, speech style, likes, dislikes..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Be specific and detailed to help the AI understand how to roleplay this character
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Textarea
              id="scenario"
              value={character.scenario}
              onChange={(e) => handleChange("scenario", e.target.value)}
              placeholder="The setting, situation, and context for the roleplay. Where are you? What's happening?..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_mes">First Message</Label>
            <Textarea
              id="first_mes"
              value={character.first_mes}
              onChange={(e) => handleChange("first_mes", e.target.value)}
              placeholder="The character's opening greeting or introduction..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mes_example">Message Examples</Label>
            <Textarea
              id="mes_example"
              value={character.mes_example}
              onChange={(e) => handleChange("mes_example", e.target.value)}
              placeholder="Example dialogue to guide the AI's responses. Format: {{user}}: example message\n{{char}}: example response"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Use {`{{user}}`} for yourself and {`{{char}}`} for the character name
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold">Character Tags</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Add tags like gender, kinks, personality, species for smart filtering
                </p>
              </div>
              <Badge variant="secondary">{tags.length} tags</Badge>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="pl-3 pr-1 py-1 gap-1 hover:bg-primary/80 transition-colors"
                  >
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-5 p-0 hover:bg-destructive/20 rounded-full"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="size-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="new-tag" className="text-sm font-medium">
                      Add New Tag
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="new-tag"
                        placeholder="e.g., Female, BDSM, Elf, Dominant..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button onClick={handleAddTag} className="gap-2">
                        <Plus className="size-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {suggestedTags.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Add (click to add)</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !tags.includes(tag))
                    .slice(0, 20)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleAddSuggestedTag(tag)}
                      >
                        <Plus className="size-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Character Gallery</Label>
                  <Badge variant="secondary">{galleryItems.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="border-pink-500/30 bg-pink-500/5">
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center gap-3">
                      <Code className="size-5 text-pink-500" />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Add Media via URL or Embed</Label>
                        <p className="text-xs text-muted-foreground">
                          Paste any URL or iframe embed code - auto-converts and saves to Supabase
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={
                          'Paste URLs or embed codes:\n\nhttps://files.catbox.moe/abc123.mp4\nhttps://youtube.com/watch?v=...\nhttps://redgifs.com/watch/...\n<iframe src="..." ...></iframe>\n\nOne per line for bulk import!'
                        }
                        value={embedInput}
                        onChange={(e) => setEmbedInput(e.target.value)}
                        rows={4}
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        onClick={handleAddEmbedCode}
                        className="bg-pink-600 hover:bg-pink-700"
                        disabled={isLoadingGallery}
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports: Catbox, YouTube, RedGifs, Imgur, or any iframe embed. Stored securely in Supabase with
                      RLS protection.
                    </p>
                  </CardContent>
                </Card>

                {isLoadingGallery ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading gallery...</p>
                    </div>
                  </div>
                ) : galleryItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 rounded-lg border p-3">
                    {galleryItems.map((item) => {
                      const previewUrl = getPreviewUrl(item.embed_code)

                      return (
                        <div key={item.id} className="group relative aspect-video overflow-hidden rounded-lg bg-muted">
                          {item.media_type === "embed" ? (
                            previewUrl ? (
                              <iframe
                                src={previewUrl}
                                className="size-full pointer-events-none"
                                frameBorder="0"
                                title={`Embed ${item.id}`}
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                                <Code className="size-8 text-pink-500" />
                              </div>
                            )
                          ) : item.media_type === "video" ? (
                            <video src={item.embed_code} className="size-full object-cover" muted />
                          ) : (
                            <img
                              src={item.embed_code || "/placeholder.svg"}
                              alt={`Gallery ${item.id}`}
                              className="size-full object-cover"
                            />
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-1 top-1 size-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveGalleryItem(item.id)}
                          >
                            <X className="size-4" />
                          </Button>
                          <Badge className="absolute bottom-1 left-1 text-xs capitalize" variant="secondary">
                            {item.media_type}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Code className="mx-auto size-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No gallery items yet</p>
                    <p className="text-xs text-muted-foreground">Add URLs or embeds above to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Label>Attached Lorebooks</Label>
            <p className="text-xs text-muted-foreground">
              Select lorebooks to make their lore available during roleplay with this character
            </p>
            {availableLorebooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lorebooks available. Create some in LoreWorld first.</p>
            ) : (
              <div className="space-y-2 rounded-lg border p-4">
                {availableLorebooks.map((book) => (
                  <div key={book.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`lorebook-${book.id}`}
                      checked={attachedLorebooks.includes(book.id)}
                      onCheckedChange={() => toggleLorebook(book.id)}
                    />
                    <label htmlFor={`lorebook-${book.id}`} className="flex-1 cursor-pointer text-sm">
                      <span className="font-medium">{book.name}</span>
                      <span className="text-muted-foreground"> - {book.description}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 -mx-6">
        <Button onClick={() => router.push(`/characters/${character.id}`)} variant="outline" disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
          {isSaving ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
