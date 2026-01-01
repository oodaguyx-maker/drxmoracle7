"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Download, Link2, Video, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { BackButton } from "@/components/back-button"

interface VideoEntry {
  id: string
  url: string
  embedCode: string
  iframeCode: string
  embedUrl: string // Added embedUrl to store the actual embed URL for preview
  videoId: string
  platform: string
  downloadable: boolean
}

export default function VideoToolsPage() {
  const { user } = useAuth()
  const [videoUrl, setVideoUrl] = useState("")
  const [bulkUrls, setBulkUrls] = useState("")
  const [videos, setVideos] = useState<VideoEntry[]>([])

  const extractVideoInfo = (
    url: string,
  ): { videoId: string; platform: string; embedUrl: string; downloadable: boolean } | null => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
      const match = url.match(youtubeRegex)
      if (match) {
        return {
          videoId: match[1],
          platform: "YouTube",
          embedUrl: `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1`,
          downloadable: true,
        }
      }
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
      const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/
      const match = url.match(vimeoRegex)
      if (match) {
        return {
          videoId: match[1],
          platform: "Vimeo",
          embedUrl: `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`,
          downloadable: true,
        }
      }
    }

    // Dailymotion
    if (url.includes("dailymotion.com") || url.includes("dai.ly")) {
      const dmRegex = /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/
      const match = url.match(dmRegex)
      if (match) {
        return {
          videoId: match[1],
          platform: "Dailymotion",
          embedUrl: `https://www.dailymotion.com/embed/video/${match[1]}?autoplay=0`,
          downloadable: true,
        }
      }
    }

    // Twitch
    if (url.includes("twitch.tv")) {
      const twitchRegex = /twitch\.tv\/videos\/(\d+)/
      const match = url.match(twitchRegex)
      if (match) {
        return {
          videoId: match[1],
          platform: "Twitch",
          embedUrl: `https://player.twitch.tv/?video=${match[1]}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}&autoplay=false`,
          downloadable: false,
        }
      }
    }

    // RedGifs
    if (url.includes("redgifs.com")) {
      const redgifsRegex = /redgifs\.com\/watch\/([a-zA-Z0-9_-]+)/i
      const match = url.match(redgifsRegex)
      if (match) {
        return {
          videoId: match[1],
          platform: "RedGifs",
          embedUrl: `https://www.redgifs.com/ifr/${match[1]}?autoplay=0`,
          downloadable: true,
        }
      }
    }

    // XVideos - handle both /video12345 and /video12345/title formats
    if (url.includes("xvideos.com")) {
      const xvideosRegex = /xvideos\.com\/video\.?(\d+)/
      const match = url.match(xvideosRegex)
      if (match) {
        return {
          videoId: match[1],
          platform: "XVideos",
          embedUrl: `https://www.xvideos.com/embedframe/${match[1]}`,
          downloadable: true,
        }
      }
    }

    // xHamster - handle multiple URL formats
    if (url.includes("xhamster.com")) {
      // Try format: /videos/title-123456 or /videos/title-xhABC123
      let xhamsterRegex = /xhamster\.com\/videos\/[^/]+-([a-zA-Z0-9]+)/
      let match = url.match(xhamsterRegex)

      if (!match) {
        // Try format: /videos/xhABC123 (just ID)
        xhamsterRegex = /xhamster\.com\/videos\/([a-zA-Z0-9]+)/
        match = url.match(xhamsterRegex)
      }

      if (!match) {
        // Try format: /movies/123456/title
        xhamsterRegex = /xhamster\.com\/movies\/(\d+)/
        match = url.match(xhamsterRegex)
      }

      if (match) {
        return {
          videoId: match[1],
          platform: "xHamster",
          embedUrl: `https://xhamster.com/embed/${match[1]}`,
          downloadable: true,
        }
      }
    }

    return null
  }

  const generateEmbedCodes = (embedUrl: string, videoId: string, platform: string) => {
    // Clean iframe code optimized for OracleViewer compatibility
    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; loop"></iframe>`

    const embedCode = `${iframeCode}`

    return { embedCode, iframeCode }
  }

  const addVideoFromUrl = (url: string) => {
    const videoInfo = extractVideoInfo(url)
    if (!videoInfo) {
      console.log("[v0] Invalid video URL:", url)
      toast.error("Could not parse video URL. Please check the URL format.")
      return
    }

    console.log("[v0] Extracted video info:", videoInfo)
    const { embedCode, iframeCode } = generateEmbedCodes(videoInfo.embedUrl, videoInfo.videoId, videoInfo.platform)

    const newVideo: VideoEntry = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      embedCode,
      iframeCode,
      embedUrl: videoInfo.embedUrl, // Store embedUrl for preview
      videoId: videoInfo.videoId,
      platform: videoInfo.platform,
      downloadable: videoInfo.downloadable,
    }

    console.log("[v0] Created video entry:", newVideo)
    setVideos((prev) => [newVideo, ...prev])

    toast.success(`${videoInfo.platform} video successfully processed.`)
  }

  const handleAddVideo = () => {
    if (!videoUrl.trim()) {
      toast.error("Please enter a video URL.")
      return
    }

    addVideoFromUrl(videoUrl)
    setVideoUrl("")
  }

  const handleBulkAdd = () => {
    const urls = bulkUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url)

    if (urls.length === 0) {
      toast.error("Please enter at least one video URL.")
      return
    }

    urls.forEach(addVideoFromUrl)
    setBulkUrls("")

    toast.success(`Successfully processed ${urls.length} video(s).`)
  }

  const removeVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id))
    toast.success("Video removed.")
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard!`)
  }

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`${filename} has been downloaded.`)
  }

  const exportAllEmbeds = () => {
    if (videos.length === 0) {
      toast.error("No videos to export.")
      return
    }

    const allEmbeds = videos
      .map((video) => `=== ${video.platform} Video (${video.videoId}) ===\nURL: ${video.url}\n\n${video.embedCode}\n\n`)
      .join("\n")

    const blob = new Blob([allEmbeds], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `all-video-embeds-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${videos.length} video embed(s) to .txt file.`)
  }

  const downloadVideo = async (video: VideoEntry) => {
    toast({
      title: "Download Started",
      description: "Preparing your video download...",
    })

    try {
      const response = await fetch("/api/download-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: video.url,
          platform: video.platform,
          videoId: video.videoId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Download failed")
      }

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `${video.platform}-${video.videoId}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Download Complete",
        description: "Video has been downloaded successfully.",
      })
    } catch (error: any) {
      console.error("[v0] Download error:", error)
      toast({
        title: "Download Failed",
        description:
          error.message ||
          "Some videos cannot be downloaded due to platform restrictions. Try using the embed code instead.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <BackButton href="/" showHomeButton />
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-glow mb-2">OodaGrabber</h1>
            <p className="text-muted-foreground">
              Extract embed codes, generate iframes, and download videos from multiple platforms
            </p>
          </div>

          <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary mb-2">Supported Platforms:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">YouTube</Badge>
              <Badge variant="outline">Vimeo</Badge>
              <Badge variant="outline">Dailymotion</Badge>
              <Badge variant="outline">Twitch</Badge>
              <Badge variant="outline">RedGifs</Badge>
              <Badge variant="outline">XVideos</Badge>
              <Badge variant="outline">xHamster</Badge>
            </div>
          </div>

          <Tabs defaultValue="single" className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="single">Single Video</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Single Video</CardTitle>
                  <CardDescription>Paste a video URL to generate embed codes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="video-url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddVideo()}
                      />
                      <Button onClick={handleAddVideo}>
                        <Plus className="mr-2 size-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Import</CardTitle>
                  <CardDescription>Add multiple video URLs (one per line)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-urls">Video URLs</Label>
                    <Textarea
                      id="bulk-urls"
                      placeholder="https://www.youtube.com/watch?v=...&#10;https://vimeo.com/...&#10;https://www.redgifs.com/watch/..."
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button onClick={handleBulkAdd} className="w-full">
                    Process {bulkUrls.split("\n").filter((url) => url.trim()).length} URLs
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {videos.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Processed Videos ({videos.length})</h2>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href="/cakeviews">
                      <Video className="mr-2 size-4" />
                      View Gallery
                    </a>
                  </Button>
                  <Button onClick={exportAllEmbeds} variant="outline">
                    <Download className="mr-2 size-4" />
                    Export All
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>{video.platform}</Badge>
                            <span className="text-xs text-muted-foreground font-mono">ID: {video.videoId}</span>
                          </div>
                          <CardTitle className="text-sm break-all">{video.url}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeVideo(video.id)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Tabs defaultValue="iframe">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="iframe">iFrame</TabsTrigger>
                          <TabsTrigger value="embed">Full Embed</TabsTrigger>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>

                        <TabsContent value="iframe" className="space-y-4">
                          <div className="space-y-2">
                            <Label>iFrame Code</Label>
                            <div className="relative">
                              <Textarea
                                value={video.iframeCode}
                                readOnly
                                rows={3}
                                className="font-mono text-xs pr-20"
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(video.iframeCode, "iFrame code")}
                                  title="Copy to clipboard"
                                >
                                  <Link2 className="size-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => downloadAsFile(video.iframeCode, `iframe-${video.videoId}.txt`)}
                                  title="Download as .txt"
                                >
                                  <Download className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="embed" className="space-y-4">
                          <div className="space-y-2">
                            <Label>Full Embed Code</Label>
                            <div className="relative">
                              <Textarea value={video.embedCode} readOnly rows={4} className="font-mono text-xs pr-20" />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(video.embedCode, "Embed code")}
                                  title="Copy to clipboard"
                                >
                                  <Link2 className="size-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => downloadAsFile(video.embedCode, `embed-${video.videoId}.txt`)}
                                  title="Download as .txt"
                                >
                                  <Download className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="preview" className="space-y-4">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={video.embedUrl}
                              className="w-full h-full"
                              frameBorder="0"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              loading="lazy"
                              title={`${video.platform} video ${video.videoId}`}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="mt-4 flex gap-2">
                        {video.downloadable && (
                          <Button variant="outline" onClick={() => downloadVideo(video)} className="flex-1">
                            <Download className="mr-2 size-4" />
                            Download Video
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            <Link2 className="size-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {videos.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                <p>No videos processed yet. Add a video URL to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
