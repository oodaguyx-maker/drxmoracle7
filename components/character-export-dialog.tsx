"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Download, Share2, FileText, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Character, ChatNode } from "@/lib/storage"
import { generateCharacterHTML, generateLogsHTML, downloadHTML } from "@/lib/export-utils"

interface CharacterExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: Character
  nodes: ChatNode[]
  galleryItems?: Array<{ url: string; type: "image" | "video" }>
}

export function CharacterExportDialog({
  open,
  onOpenChange,
  character,
  nodes,
  galleryItems = [],
}: CharacterExportDialogProps) {
  const [includeGallery, setIncludeGallery] = useState(true)
  const [includeLogs, setIncludeLogs] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const handleExportCharacter = async () => {
    setIsExporting(true)
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const gallery = includeGallery ? galleryItems : []
      const html = generateCharacterHTML(character, gallery, baseUrl)

      const filename = `${character.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_profile.html`
      downloadHTML(html, filename)

      toast.success("Character profile exported successfully!")
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast.error("Failed to export character profile")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportLogs = async () => {
    setIsExporting(true)
    try {
      const html = generateLogsHTML(character, nodes)
      const filename = `${character.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_logs.html`
      downloadHTML(html, filename)

      toast.success("Chat logs exported successfully!")
    } catch (error) {
      console.error("[v0] Export logs error:", error)
      toast.error("Failed to export chat logs")
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerateShareLink = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const url = `${baseUrl}/shared/character/${character.id}`
    setShareUrl(url)
    navigator.clipboard.writeText(url)
    toast.success("Share link copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5 text-primary" />
            Export Character
          </DialogTitle>
          <DialogDescription>Export {character.name}'s profile, gallery, and chat history</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Character Profile Export */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Character Profile</h4>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="size-5 text-accent" />
                <div>
                  <p className="font-medium text-sm">Include Gallery</p>
                  <p className="text-xs text-muted-foreground">{galleryItems.length} items available</p>
                </div>
              </div>
              <Switch
                checked={includeGallery}
                onCheckedChange={setIncludeGallery}
                disabled={galleryItems.length === 0}
              />
            </div>

            <Button onClick={handleExportCharacter} disabled={isExporting} className="w-full gap-2">
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Export Character Profile (HTML)
            </Button>
          </div>

          {/* Chat Logs Export */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Chat History</h4>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <FileText className="size-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Conversation Nodes</p>
                <p className="text-xs text-muted-foreground">
                  {nodes.length} nodes with {nodes.reduce((sum, n) => sum + n.messages.length, 0)} total messages
                </p>
              </div>
            </div>

            <Button
              onClick={handleExportLogs}
              disabled={isExporting || nodes.length === 0}
              variant="outline"
              className="w-full gap-2 bg-transparent"
            >
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
              Export Chat Logs (HTML)
            </Button>
          </div>

          {/* Share Link */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Share Link</h4>

            {shareUrl ? (
              <div className="space-y-2">
                <Input value={shareUrl} readOnly className="font-mono text-xs" />
                <p className="text-xs text-muted-foreground">
                  Link copied! Share this URL to let others view this character.
                </p>
              </div>
            ) : (
              <Button onClick={handleGenerateShareLink} variant="outline" className="w-full gap-2 bg-transparent">
                <Share2 className="size-4" />
                Generate Shareable Link
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
