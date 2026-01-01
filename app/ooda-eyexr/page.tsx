"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Download, Search, Trash2, Eye, Film, Sparkles, Loader2, X, Infinity, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface ImageResult {
  id: string
  file_url: string
  preview_url: string
  sample_url: string
  tags: string
  score: number
  rating: string
  width: number
  height: number
  file_type: "image" | "gif" | "video"
}

interface SavedImage {
  id: string
  url: string
  source: string
  tags: string[]
  addedAt: number
}

const RULE34_API_KEY =
  "18ab896eca4b9e7ceba619badf43ae6fbed1cfffbe257f28e0b1106983cd6e52ae433b0ddf0a7503e39533737d95fad057d0e07e58dd1ced2a3b91937a031c43"
const RULE34_USER_ID = "5693872"

export default function OodaEyeXRPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [source, setSource] = useState<"rule34" | "realbooru">("rule34")
  const [tags, setTags] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [images, setImages] = useState<ImageResult[]>([])
  const [loading, setLoading] = useState(false)

  const [genieMode, setGenieMode] = useState(false)
  const [geniePrompt, setGeniePrompt] = useState("")
  const [genieSearching, setGenieSearching] = useState(false)
  const [genieProgress, setGenieProgress] = useState("")

  const [savedGallery, setSavedGallery] = useState<SavedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null)
  const [viewMode, setViewMode] = useState<"all" | "images" | "gifs" | "videos">("all")

  const [fetchingAll, setFetchingAll] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ooda-eyexr-gallery")
      if (saved) {
        const parsed = JSON.parse(saved)
        setSavedGallery(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Failed to load gallery:", error)
      setSavedGallery([])
    }
  }, [])

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/\s+/g, "_")
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag])
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const correctTags = async (tagString: string): Promise<string> => {
    try {
      const response = await fetch(`/api/tag-correction?tags=${encodeURIComponent(tagString)}&source=${source}`)
      if (!response.ok) return tagString

      const data = await response.json()
      return data.corrected || tagString
    } catch (error) {
      console.error("Tag correction error:", error)
      return tagString
    }
  }

  const searchImages = async () => {
    if (tags.length === 0) {
      toast({
        title: "No tags selected",
        description: "Please add at least one tag",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const tagString = tags.join(" ")
      const correctedTags = await correctTags(tagString)

      const apiEndpoint = source === "rule34" ? "/api/rule34" : "/api/realbooru"
      const limit = source === "rule34" ? 1000 : 100

      let url = `${apiEndpoint}?tags=${encodeURIComponent(correctedTags)}&pid=0&limit=${limit}`

      if (source === "rule34") {
        url += `&api_key=${RULE34_API_KEY}&user_id=${RULE34_USER_ID}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()

      if (data.apiOffline) {
        toast({
          title: `${source === "rule34" ? "Rule34" : "Realbooru"} API Offline`,
          description: data.error || "API is currently unavailable",
          variant: "destructive",
        })
        setImages([])
        return
      }

      if (data.posts && Array.isArray(data.posts)) {
        setImages(data.posts)
        toast({
          title: "Search complete",
          description: `Found ${data.posts.length} results`,
        })
      } else {
        setImages([])
        toast({
          title: "No results",
          description: "Try different tags",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllResults = async () => {
    if (tags.length === 0) {
      toast({
        title: "No tags selected",
        description: "Please add at least one tag",
        variant: "destructive",
      })
      return
    }

    setFetchingAll(true)
    let allPosts: ImageResult[] = []
    let page = 0
    let hasMore = true

    try {
      const tagString = tags.join(" ")
      const correctedTags = await correctTags(tagString)

      const apiEndpoint = source === "rule34" ? "/api/rule34" : "/api/realbooru"
      const limit = source === "rule34" ? 1000 : 100
      const maxPages = source === "rule34" ? 100 : 500

      while (hasMore && page < maxPages) {
        let url = `${apiEndpoint}?tags=${encodeURIComponent(correctedTags)}&pid=${page}&limit=${limit}`

        if (source === "rule34") {
          url += `&api_key=${RULE34_API_KEY}&user_id=${RULE34_USER_ID}`
        }

        const response = await fetch(url)
        if (!response.ok) break

        const data = await response.json()

        if (data.apiOffline) {
          toast({
            title: `${source === "rule34" ? "Rule34" : "Realbooru"} API Offline`,
            description: data.error || "API is currently unavailable",
            variant: "destructive",
          })
          break
        }

        if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
          allPosts = [...allPosts, ...data.posts]

          const uniquePosts = allPosts.filter((post, index, self) => index === self.findIndex((p) => p.id === post.id))
          allPosts = uniquePosts

          setImages(uniquePosts)
          setGenieProgress(`Fetched ${uniquePosts.length} results from ${page + 1} pages...`)

          page++
          if (data.posts.length < limit) {
            hasMore = false
          }

          await new Promise((resolve) => setTimeout(resolve, 300))
        } else {
          hasMore = false
        }
      }

      toast({
        title: "Fetch complete",
        description: `Found ${allPosts.length} total results across ${page} pages`,
      })
    } catch (error) {
      console.error("Fetch all error:", error)
      toast({
        title: "Fetch failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setFetchingAll(false)
      setGenieProgress("")
    }
  }

  const handleGenieSearch = async () => {
    if (!geniePrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please describe what you're looking for",
        variant: "destructive",
      })
      return
    }

    setGenieSearching(true)
    let allPosts: ImageResult[] = []

    try {
      setGenieProgress("Generating tag combinations...")

      const apiKey = localStorage.getItem("openrouter_api_key")
      const response = await fetch("/api/genie-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: geniePrompt,
          source,
          maxCombinations: 15,
          apiKey,
        }),
      })

      if (!response.ok) throw new Error("Tag generation failed")

      const data = await response.json()

      if (!data.combinations || !Array.isArray(data.combinations) || data.combinations.length === 0) {
        throw new Error("No tag combinations generated")
      }

      const tagCombinations: string[][] = data.combinations

      setGenieProgress(`Generated ${tagCombinations.length} tag combinations. Searching...`)

      const apiEndpoint = source === "rule34" ? "/api/rule34" : "/api/realbooru"
      const limit = source === "rule34" ? 1000 : 100
      const pagesPerCombo = 3

      for (let comboIndex = 0; comboIndex < tagCombinations.length; comboIndex++) {
        const currentCombo = tagCombinations[comboIndex]
        if (!Array.isArray(currentCombo) || currentCombo.length === 0) continue

        const tagString = currentCombo.join(" ")
        const correctedTags = await correctTags(tagString)

        setGenieProgress(`Searching combo ${comboIndex + 1}/${tagCombinations.length}: ${correctedTags}...`)

        for (let page = 0; page < pagesPerCombo; page++) {
          let url = `${apiEndpoint}?tags=${encodeURIComponent(correctedTags)}&pid=${page}&limit=${limit}`

          if (source === "rule34") {
            url += `&api_key=${RULE34_API_KEY}&user_id=${RULE34_USER_ID}`
          }

          try {
            const searchResponse = await fetch(url)
            if (!searchResponse.ok) continue

            const searchData = await searchResponse.json()

            if (searchData.apiOffline) continue

            if (searchData.posts && Array.isArray(searchData.posts) && searchData.posts.length > 0) {
              allPosts = [...allPosts, ...searchData.posts]

              const uniquePosts = allPosts.filter(
                (post, index, self) => index === self.findIndex((p) => p.id === post.id),
              )
              allPosts = uniquePosts

              setImages(uniquePosts)
              setGenieProgress(
                `Combo ${comboIndex + 1}/${tagCombinations.length} - Found ${uniquePosts.length} unique results...`,
              )

              await new Promise((resolve) => setTimeout(resolve, 200))
            }
          } catch (error) {
            console.error(`Error fetching combo ${comboIndex + 1} page ${page + 1}:`, error)
          }
        }
      }

      const uniquePosts = allPosts.filter((post, index, self) => index === self.findIndex((p) => p.id === post.id))

      setImages(uniquePosts)
      setGenieMode(false)
      setGeniePrompt("")

      toast({
        title: "Genie Search Complete",
        description: `Found ${uniquePosts.length} unique results from ${tagCombinations.length} tag combinations`,
      })
    } catch (error) {
      console.error("Genie search error:", error)
      toast({
        title: "Genie search failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setGenieSearching(false)
      setGenieProgress("")
    }
  }

  const saveToGallery = (image: ImageResult) => {
    const savedImage: SavedImage = {
      id: image.id,
      url: image.file_url,
      source: `${source}-${image.id}`,
      tags: image.tags.split(" ").slice(0, 20),
      addedAt: Date.now(),
    }

    if (!savedGallery.find((img) => img.id === savedImage.id)) {
      const updated = [...savedGallery, savedImage]
      setSavedGallery(updated)
      localStorage.setItem("ooda-eyexr-gallery", JSON.stringify(updated))

      toast({
        title: "Saved to gallery",
        description: "Image added to your gallery",
      })
    } else {
      toast({
        title: "Already in gallery",
      })
    }
  }

  const removeFromGallery = (imageId: string) => {
    const updated = savedGallery.filter((img) => img.id !== imageId)
    setSavedGallery(updated)
    localStorage.setItem("ooda-eyexr-gallery", JSON.stringify(updated))

    toast({
      title: "Removed from gallery",
    })
  }

  const filteredImages = images.filter((img) => {
    if (viewMode === "all") return true
    if (viewMode === "images") return img.file_type === "image"
    if (viewMode === "gifs") return img.file_type === "gif"
    if (viewMode === "videos") return img.file_type === "video"
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
          <h1 className="font-mono text-3xl font-bold text-foreground">OodaEyeXR</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">Advanced booru image search with AI-powered Genie mode</p>
            <Badge variant="secondary">Powered by {source === "rule34" ? "Rule34" : "Realbooru"} API</Badge>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={source === "rule34" ? "default" : "outline"}
                  onClick={() => {
                    setSource("rule34")
                    setImages([])
                    setTags([])
                  }}
                >
                  Rule34
                </Button>
                <Button
                  variant={source === "realbooru" ? "default" : "outline"}
                  onClick={() => {
                    setSource("realbooru")
                    setImages([])
                    setTags([])
                  }}
                >
                  Realbooru
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {source === "rule34" ? "1000 posts per page, up to 100 pages" : "100 posts per page, up to 500 pages"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-4">
                <Button
                  variant={genieMode ? "default" : "outline"}
                  onClick={() => setGenieMode(!genieMode)}
                  className="ml-auto"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Genie Mode
                </Button>
              </div>

              {genieMode ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Describe what you want (e.g., 'Big Ass Gay Male' or 'Busty MILF')"
                    value={geniePrompt}
                    onChange={(e) => setGeniePrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !genieSearching) {
                        handleGenieSearch()
                      }
                    }}
                  />
                  <Button
                    onClick={handleGenieSearch}
                    disabled={genieSearching || !geniePrompt.trim()}
                    className="w-full"
                  >
                    {genieSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {genieProgress || "Searching..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start Genie Search
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter tags (e.g., big_ass, huge_breasts)"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addTag(inputValue)
                        }
                      }}
                    />
                    <Button onClick={() => addTag(inputValue)} variant="secondary">
                      Add
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={searchImages} disabled={loading || tags.length === 0} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </>
                      )}
                    </Button>
                    <Button onClick={fetchAllResults} disabled={fetchingAll || tags.length === 0} variant="secondary">
                      {fetchingAll ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {genieProgress || "Fetching..."}
                        </>
                      ) : (
                        <>
                          <Infinity className="mr-2 h-4 w-4" />
                          Fetch All Results
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="results" className="w-full">
            <TabsList>
              <TabsTrigger value="results">Results ({filteredImages.length})</TabsTrigger>
              <TabsTrigger value="gallery">Gallery ({savedGallery.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              {images.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("all")}
                  >
                    All ({images.length})
                  </Button>
                  <Button
                    variant={viewMode === "images" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("images")}
                  >
                    Images ({images.filter((i) => i.file_type === "image").length})
                  </Button>
                  <Button
                    variant={viewMode === "gifs" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("gifs")}
                  >
                    GIFs ({images.filter((i) => i.file_type === "gif").length})
                  </Button>
                  <Button
                    variant={viewMode === "videos" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("videos")}
                  >
                    Videos ({images.filter((i) => i.file_type === "video").length})
                  </Button>
                </div>
              )}

              {filteredImages.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {images.length === 0
                      ? "No results yet. Search for tags or use Genie mode."
                      : "No results for this filter."}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {filteredImages.map((image) => (
                    <Card key={image.id} className="group relative overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-square">
                          {image.file_type === "video" ? (
                            <div className="flex h-full items-center justify-center bg-muted">
                              <Film className="h-12 w-12 text-muted-foreground" />
                            </div>
                          ) : (
                            <Image
                              src={image.preview_url || image.sample_url}
                              alt="Result"
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              unoptimized
                            />
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex h-full items-center justify-center gap-2">
                              <Button size="icon" variant="secondary" onClick={() => setSelectedImage(image)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="secondary" onClick={() => saveToGallery(image)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {image.file_type === "gif" && (
                            <Badge className="absolute left-2 top-2" variant="secondary">
                              GIF
                            </Badge>
                          )}
                          {image.file_type === "video" && (
                            <Badge className="absolute left-2 top-2" variant="secondary">
                              Video
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              {savedGallery.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No saved images yet. Save images from search results to view them here.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {savedGallery.map((image) => (
                    <Card key={image.id} className="group relative overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-square">
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt="Saved"
                            fill
                            className="object-cover"
                            unoptimized
                          />

                          <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex h-full items-center justify-center gap-2">
                              <Button size="icon" variant="destructive" onClick={() => removeFromGallery(image.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="secondary" onClick={() => window.open(image.url, "_blank")}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              {selectedImage.file_type === "video" ? (
                <video controls className="w-full rounded-lg" src={selectedImage.file_url} />
              ) : (
                <Image
                  src={selectedImage.sample_url || selectedImage.file_url}
                  alt="Preview"
                  width={selectedImage.width}
                  height={selectedImage.height}
                  className="w-full rounded-lg"
                  unoptimized
                />
              )}
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Rating:</strong> {selectedImage.rating}
                </p>
                <p>
                  <strong>Score:</strong> {selectedImage.score}
                </p>
                <p>
                  <strong>Dimensions:</strong> {selectedImage.width}x{selectedImage.height}
                </p>
                <div>
                  <strong>Tags:</strong>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedImage.tags
                      .split(" ")
                      .slice(0, 30)
                      .map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveToGallery(selectedImage)} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Save to Gallery
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(selectedImage.file_url, "_blank")}
                  className="flex-1"
                >
                  Open Full Size
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
