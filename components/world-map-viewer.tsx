"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Map, X, Download } from "lucide-react"
import Image from "next/image"

interface WorldMapViewerProps {
  mapUrl: string
  lorebookName: string
  onClose: () => void
}

export function WorldMapViewer({ mapUrl, lorebookName, onClose }: WorldMapViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(mapUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${lorebookName.toLowerCase().replace(/\s+/g, "-")}-world-map.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download map:", error)
    }
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
          onClick={() => setIsFullscreen(false)}
        >
          <X className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 text-white hover:bg-white/10"
          onClick={handleDownload}
        >
          <Download className="h-6 w-6" />
        </Button>
        <div className="relative w-[95vw] h-[95vh]">
          <Image
            src={mapUrl || "/placeholder.svg"}
            alt={`${lorebookName} World Map`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            {lorebookName} - World Map
          </DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={mapUrl || "/placeholder.svg"}
            alt={`${lorebookName} World Map`}
            fill
            className="object-contain cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setIsFullscreen(true)}
            unoptimized
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Map
          </Button>
          <Button onClick={() => setIsFullscreen(true)}>
            <Map className="h-4 w-4 mr-2" />
            View Fullscreen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
