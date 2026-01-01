"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Minimize2, Maximize2, Volume2, VolumeX, Download, Play, Pause, RotateCcw, Grid3X3 } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface OracleViewerProps {
  mediaUrl: string
  mediaType: "image" | "video" | "embed"
  onClose: () => void
  gallery?: string[]
  onGalleryItemSelect?: (url: string, type: "image" | "video" | "embed") => void
}

export function OracleViewer({ mediaUrl, mediaType, onClose, gallery, onGalleryItemSelect }: OracleViewerProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 })
  const [size, setSize] = useState({ width: 400, height: 300 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [savedState, setSavedState] = useState({ position: { x: 100, y: 100 }, size: { width: 400, height: 300 } })
  const [showGalleryPanel, setShowGalleryPanel] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(mediaUrl)
  const [currentType, setCurrentType] = useState(mediaType)
  const viewerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPosition({ x: window.innerWidth - 420, y: 80 })
    }
  }, [])

  useEffect(() => {
    setCurrentUrl(mediaUrl)
    setCurrentType(mediaType)
  }, [mediaUrl, mediaType])

  const detectMediaType = (url: string): "image" | "video" | "embed" => {
    if (!url || typeof url !== "string") {
      console.error("[v0] Invalid URL for media type detection:", url)
      return "image"
    }

    // Handle embeds first
    if (
      url.includes("<iframe") ||
      url.includes("/embed/") ||
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes("redgifs.com") ||
      url.includes("twitch.tv")
    ) {
      return "embed"
    }

    // Check for video file extensions (including Catbox URLs)
    if (
      url.match(/\.(mp4|webm|ogg|mov|avi|mkv|m4v|3gp|flv|wmv)($|\?)/i) ||
      url.includes("video") ||
      url.match(/[?&]mimeType=video/i) ||
      url.match(/files\.catbox\.moe\/[^.]+\.(mp4|webm|mov)/i)
    ) {
      return "video"
    }

    // Default to image (includes Catbox image URLs)
    return "image"
  }

  const actualMediaType = detectMediaType(currentUrl)

  const getEmbedUrl = (): string => {
    if (!currentUrl || typeof currentUrl !== "string") {
      console.error("[v0] Invalid URL for embed:", currentUrl)
      return "/placeholder.svg"
    }

    if (currentUrl.includes("<iframe")) {
      const srcMatch = currentUrl.match(/src=["']([^"']+)["']/)
      return srcMatch ? srcMatch[1] : currentUrl
    }

    // Convert regular YouTube URLs to embed format
    if (currentUrl.includes("youtube.com/watch")) {
      const videoIdMatch = currentUrl.match(/[?&]v=([^&]+)/)
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&loop=1&playlist=${videoIdMatch[1]}`
      }
    }

    if (currentUrl.includes("youtu.be/")) {
      const videoId = currentUrl.split("youtu.be/")[1]?.split("?")[0]
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`
      }
    }

    // Convert RedGifs watch URLs to embed format
    if (currentUrl.includes("redgifs.com/watch/")) {
      const videoId = currentUrl.split("/watch/")[1]?.split("?")[0]
      if (videoId) {
        return `https://www.redgifs.com/ifr/${videoId}`
      }
    }

    return currentUrl
  }

  const embedUrl = actualMediaType === "embed" ? getEmbedUrl() : currentUrl

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100))
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 50))
        setPosition({ x: newX, y: newY })
      } else if (isResizing) {
        const newWidth = Math.max(280, Math.min(e.clientX - position.x, window.innerWidth - position.x))
        const newHeight = Math.max(200, Math.min(e.clientY - position.y, window.innerHeight - position.y))
        setSize({ width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = "none"
      document.body.style.cursor = isDragging ? "grabbing" : "se-resize"
    } else {
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }
  }, [isDragging, isResizing, dragOffset, position])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      video.currentTime = 0
      video.play()
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("durationchange", handleDurationChange)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("durationchange", handleDurationChange)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("drag-handle")) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return
    e.stopPropagation()
    setIsResizing(true)
  }

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition(savedState.position)
      setSize(savedState.size)
      setIsMaximized(false)
    } else {
      setSavedState({ position, size })
      setPosition({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight })
      setIsMaximized(true)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      videoRef.current.muted = newVolume === 0
    }
    setIsMuted(newVolume === 0)
  }

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const handleSelectGalleryItem = (url: string) => {
    const isVideo =
      url.match(/\.(mp4|webm|ogg|mov|avi|mkv|m4v|3gp|flv|wmv)($|\?)/i) ||
      url.includes("video") ||
      url.match(/[?&]mimeType=video/i) ||
      url.match(/files\.catbox\.moe\/[^.]+\.(mp4|webm|mov)/i)
    const isEmbed =
      url.includes("<iframe") ||
      url.includes("/embed/") ||
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes("redgifs.com") ||
      url.includes("twitch.tv")

    const mediaType: "image" | "video" | "embed" = isEmbed ? "embed" : isVideo ? "video" : "image"

    setCurrentUrl(url)
    setCurrentType(mediaType)
    if (onGalleryItemSelect) {
      onGalleryItemSelect(url, mediaType)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `oracle-media-${Date.now()}.${actualMediaType === "image" ? "png" : "mp4"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download media:", error)
    }
  }

  if (isMinimized) {
    return (
      <div
        className="fixed z-[100] w-64 rounded-lg border-2 border-primary/40 bg-card/95 backdrop-blur-md shadow-2xl"
        style={{ right: 16, bottom: 16 }}
      >
        <div
          className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/20 to-accent/20 cursor-grab rounded-lg"
          onMouseDown={handleHeaderMouseDown}
        >
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-accent" />
            <span className="text-xs font-medium text-foreground">OracleViewer</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6 p-0 hover:bg-primary/20"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0 hover:bg-destructive/20">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={viewerRef}
      className="fixed z-[100] rounded-xl border-2 border-primary/40 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Header - Draggable */}
      <div
        className="drag-handle flex items-center justify-between bg-gradient-to-r from-primary/20 via-accent/20 to-pink-500/10 px-3 py-2 cursor-grab active:cursor-grabbing border-b border-primary/20 shrink-0"
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2 drag-handle">
          <div className="size-2 animate-pulse rounded-full bg-accent" />
          <span className="text-xs font-semibold text-foreground drag-handle">OracleViewer</span>
        </div>
        <div className="flex gap-0.5">
          {gallery && gallery.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowGalleryPanel(!showGalleryPanel)}
              className={`h-6 w-6 p-0 ${showGalleryPanel ? "bg-primary/30" : "hover:bg-primary/20"}`}
              title="Gallery"
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
          )}
          {actualMediaType !== "embed" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="h-6 w-6 p-0 hover:bg-accent/20"
              title="Download"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0 hover:bg-primary/20"
            title="Minimize"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMaximize}
            className="h-6 w-6 p-0 hover:bg-primary/20"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Maximize2 className={`h-3 w-3 ${isMaximized ? "rotate-45" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-destructive/20"
            title="Close"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Gallery Panel */}
      {showGalleryPanel && gallery && gallery.length > 0 && (
        <div className="bg-black/50 border-b border-primary/20 p-2 shrink-0 max-h-24 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2">
            {gallery.map((item, idx) => {
              const isVideo =
                item.match(/\.(mp4|webm|ogg|mov|avi|mkv|m4v|3gp|flv|wmv)($|\?)/i) ||
                item.includes("video") ||
                item.match(/[?&]mimeType=video/i) ||
                item.match(/files\.catbox\.moe\/[^.]+\.(mp4|webm|mov)/i)
              const isEmbed =
                item.includes("<iframe") ||
                item.includes("/embed/") ||
                item.includes("youtube.com") ||
                item.includes("youtu.be") ||
                item.includes("vimeo.com") ||
                item.includes("redgifs.com") ||
                item.includes("twitch.tv")
              const isSelected = item === currentUrl

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectGalleryItem(item)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                    isSelected ? "border-primary ring-2 ring-accent" : "border-border hover:border-primary/60"
                  }`}
                  title={`Gallery item ${idx + 1}`}
                >
                  {isVideo || isEmbed ? (
                    <div className="w-full h-full bg-black/80 flex items-center justify-center">
                      <svg className="size-3 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={item || "/placeholder.svg"}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-black/60 flex items-center justify-center text-white/50 text-xs">IMG</div>`
                        }
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative bg-black/50">
        {actualMediaType === "image" && (
          <img
            src={currentUrl || "/placeholder.svg"}
            alt="Media"
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error("[v0] Image failed to load:", currentUrl)
              e.currentTarget.src = "/broken-image.png"
            }}
          />
        )}
        {actualMediaType === "video" && (
          <video
            ref={videoRef}
            src={currentUrl}
            controls
            loop
            autoPlay
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error("[v0] Video failed to load:", currentUrl)
            }}
          >
            Your browser does not support the video tag.
          </video>
        )}
        {actualMediaType === "embed" && (
          <iframe
            src={embedUrl}
            className="h-full w-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; loop; fullscreen"
            loading="eager"
            title="Embedded Media"
          />
        )}
      </div>

      {/* Video Controls - Only for video type */}
      {actualMediaType === "video" && (
        <div className="bg-black/90 px-3 py-2 space-y-1.5 shrink-0 border-t border-white/10">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full cursor-pointer"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlayPause}
                className="h-6 w-6 p-0 hover:bg-white/20 text-white"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRestart}
                className="h-6 w-6 p-0 hover:bg-white/20 text-white"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <span className="text-[10px] text-white/80 font-mono ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newMuted = !isMuted
                  setIsMuted(newMuted)
                  if (videoRef.current) videoRef.current.muted = newMuted
                }}
                className="h-6 w-6 p-0 hover:bg-white/20 text-white"
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-16 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resize Handle - Bottom right corner */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize group z-10"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3">
            <div className="absolute bottom-0 right-0 w-2 h-0.5 bg-white/40 group-hover:bg-white/70 transition-colors" />
            <div className="absolute bottom-0 right-0 w-0.5 h-2 bg-white/40 group-hover:bg-white/70 transition-colors" />
            <div className="absolute bottom-1 right-1 w-1.5 h-0.5 bg-white/30 group-hover:bg-white/60 transition-colors" />
            <div className="absolute bottom-1 right-1 w-0.5 h-1.5 bg-white/30 group-hover:bg-white/60 transition-colors" />
          </div>
        </div>
      )}
    </div>
  )
}

export default OracleViewer
