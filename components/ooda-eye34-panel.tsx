"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Rule34Post {
  id: number
  preview_url: string
  file_url: string
  sample_url: string
  tags: string
  score: number
  rating: string
  width: number
  height: number
}

interface OodaEye34PanelProps {
  onClose: () => void
}

const API_KEY =
  "18ab896eca4b9e7ceba619badf43ae6fbed1cfffbe257f28e0b1106983cd6e52ae433b0ddf0a7503e39533737d95fad057d0e07e58dd1ced2a3b91937a031c43"
const USER_ID = "5693872"

const DOWNLOADS_STORAGE_KEY = "oodaeye34_downloads"

interface DownloadedImage {
  id: number
  url: string
  previewUrl: string
  tags: string
  downloadedAt: number
}

function getDownloadedImages(): DownloadedImage[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(DOWNLOADS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveDownloadedImage(image: DownloadedImage) {
  const existing = getDownloadedImages()
  if (existing.some((img) => img.id === image.id)) return
  const updated = [image, ...existing].slice(0, 100) // Keep last 100
  localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(updated))
}

export function OodaEye34Panel({ onClose }: OodaEye34PanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<Rule34Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Rule34Post | null>(null)
  const [page, setPage] = useState(0)
  const [downloadedImages, setDownloadedImages] = useState<DownloadedImage[]>(() => getDownloadedImages())
  const [activeTab, setActiveTab] = useState("search")
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  const searchImages = useCallback(async (query: string, pageNum = 0) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const tags = query.trim().replace(/\s+/g, "+")
      const url = `/api/rule34?tags=${encodeURIComponent(tags)}&pid=${pageNum}&api_key=${API_KEY}&user_id=${USER_ID}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch images")
      }

      const data = await response.json()

      if (pageNum === 0) {
        setPosts(data.posts || [])
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])])
      }

      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search images")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPosts([])
    setPage(0)
    searchImages(searchQuery, 0)
  }

  const loadMore = () => {
    console.log("[v0] Loading more images, current page:", page, "next page:", page + 1)
    searchImages(searchQuery, page + 1)
  }

  const downloadImage = async (post: Rule34Post) => {
    try {
      const response = await fetch(post.file_url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `rule34_${post.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)

      // Save to download history
      const downloadedImage: DownloadedImage = {
        id: post.id,
        url: post.file_url,
        previewUrl: post.preview_url || post.sample_url,
        tags: post.tags,
        downloadedAt: Date.now(),
      }
      saveDownloadedImage(downloadedImage)
      setDownloadedImages(getDownloadedImages())
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(url)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error("Copy error:", err)
    }
  }

  const clearHistory = () => {
    localStorage.removeItem(DOWNLOADS_STORAGE_KEY)
    setDownloadedImages([])
  }

  return (
    <div className="w-96 border-l border-border bg-card/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20">
            <svg className="size-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">OodaEye34</h3>
            <p className="text-[10px] text-muted-foreground">Browse & Download Images</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-3" style={{ width: "calc(100% - 2rem)" }}>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="history">
            History
            {downloadedImages.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                {downloadedImages.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="flex-1 flex flex-col m-0 p-4 pt-3">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button type="submit" size="sm" disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mb-3">
            Use tags separated by spaces. Example: <code className="px-1 py-0.5 bg-muted rounded">female solo</code>
          </p>

          {error && (
            <div className="p-3 mb-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Results Grid */}
          <ScrollArea className="flex-1">
            {posts.length === 0 && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="size-12 text-muted-foreground/30 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Search for images to get started</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer border-2 border-transparent hover:border-pink-500/50 transition-all"
                  onClick={() => setSelectedPost(post)}
                >
                  <img
                    src={post.preview_url || post.sample_url}
                    alt={`Post ${post.id}`}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/abstract-colorful-swirls.png"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] px-1">
                        {post.score}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {posts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isLoading}
                className="w-full mt-3 bg-transparent"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 flex flex-col m-0 p-4 pt-3">
          {downloadedImages.length > 0 && (
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-muted-foreground">Recently downloaded images</p>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs h-7 text-muted-foreground">
                Clear
              </Button>
            </div>
          )}
          <ScrollArea className="flex-1">
            {downloadedImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="size-12 text-muted-foreground/30 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">No downloads yet</p>
                <p className="text-xs text-muted-foreground mt-1">Downloaded images will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {downloadedImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer border-2 border-transparent hover:border-pink-500/50 transition-all"
                    onClick={() =>
                      setSelectedPost({
                        id: img.id,
                        file_url: img.url,
                        preview_url: img.previewUrl,
                        sample_url: img.previewUrl,
                        tags: img.tags,
                        score: 0,
                        rating: "",
                        width: 0,
                        height: 0,
                      })
                    }
                  >
                    <img
                      src={img.previewUrl || "/placeholder.svg"}
                      alt={`Downloaded ${img.id}`}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/abstract-colorful-swirls.png"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                      <span className="text-white text-xs">Click to view</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Image Preview Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-card rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedPost.sample_url || selectedPost.file_url}
                alt={`Post ${selectedPost.id}`}
                className="max-h-[70vh] w-auto mx-auto object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/abstract-colorful-swirls.png"
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPost(null)}
                className="absolute top-2 right-2 size-8 p-0 bg-black/50 hover:bg-black/70 text-white"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <div className="p-4 border-t border-border space-y-3">
              {selectedPost.tags && (
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {selectedPost.tags
                    .split(" ")
                    .slice(0, 15)
                    .map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5">
                        {tag}
                      </Badge>
                    ))}
                  {selectedPost.tags.split(" ").length > 15 && (
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      +{selectedPost.tags.split(" ").length - 15} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => downloadImage(selectedPost)} className="flex-1 gap-2">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Image
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyImageUrl(selectedPost.file_url)}
                  className="flex-1 gap-2"
                >
                  {copySuccess === selectedPost.file_url ? (
                    <>
                      <svg className="size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy URL
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Download or copy URL to manually add to character gallery
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
