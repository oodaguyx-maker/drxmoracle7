"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveLoreEntry, getLorebooks, addEntryToLorebook, generateId, type LoreEntry } from "@/lib/storage"
import { BookOpen, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface SaveLoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultContent?: string
  characterId?: string
  sourceNodeId?: string
}

const categoryOptions = [
  "Location",
  "Kingdom",
  "Faction",
  "Race",
  "Item",
  "Magic",
  "Character",
  "Event",
  "Creature",
  "Lore",
  "Other",
]

export function SaveLoreDialog({
  open,
  onOpenChange,
  defaultContent = "",
  characterId,
  sourceNodeId,
}: SaveLoreDialogProps) {
  const [name, setName] = useState("")
  const [content, setContent] = useState(defaultContent)
  const [category, setCategory] = useState("Lore")
  const [importance, setImportance] = useState<"low" | "medium" | "high" | "critical">("medium")
  const [keys, setKeys] = useState("")
  const [selectedLorebook, setSelectedLorebook] = useState<string | null>(null)
  const [lorebooks, setLorebooks] = useState<typeof getLorebooks | null>(null)
  const [loading, setLoading] = useState(false)

  // Load lorebooks when dialog opens
  useState(() => {
    if (open) {
      const books = getLorebooks()
      setLorebooks(() => books)
      if (books && books.length > 0) {
        setSelectedLorebook(books[0].id)
      }
    }
  })

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast.error("Name and content are required")
      return
    }

    setLoading(true)

    try {
      const entry: LoreEntry = {
        id: generateId(),
        name: name.trim(),
        content: content.trim(),
        keys: keys
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        category: category as any,
        importance,
        generatedFromRoleplay: true,
        sourceCharacterId: characterId,
        sourceNodeId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      saveLoreEntry(entry)

      // Add to selected lorebook
      if (selectedLorebook) {
        addEntryToLorebook(selectedLorebook, entry.id)
        const lorebooksData = getLorebooks()
        const selectedBook = lorebooksData.find((lb) => lb.id === selectedLorebook)
        toast.success(`Added to lorebook: ${selectedBook?.name || "Lorebook"}`)
      } else {
        toast.success("Lore entry created successfully")
      }

      // Reset form
      setName("")
      setContent(defaultContent)
      setCategory("Lore")
      setImportance("medium")
      setKeys("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving lore:", error)
      toast.error("Failed to save lore entry")
    } finally {
      setLoading(false)
    }
  }

  const booksData = lorebooks || getLorebooks()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-primary/20 bg-gradient-to-br from-card via-card/50 to-primary/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-primary" />
            Save to Lore
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="lore-name">Name *</Label>
            <Input
              id="lore-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter the name of this lore entry"
              className="border-primary/20"
            />
          </div>

          {/* Category & Importance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lore-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="lore-category" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lore-importance">Importance</Label>
              <Select value={importance} onValueChange={(v: any) => setImportance(v)}>
                <SelectTrigger id="lore-importance" className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="lore-content">Content *</Label>
            <Textarea
              id="lore-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed description of what you want to save..."
              rows={6}
              className="border-primary/20 resize-none"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="lore-keys">Trigger Keywords</Label>
            <Input
              id="lore-keys"
              value={keys}
              onChange={(e) => setKeys(e.target.value)}
              placeholder="Comma-separated keywords (e.g., tavern, mysterious, hidden)"
              className="border-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              These keywords will trigger this lore entry when mentioned during roleplay
            </p>
          </div>

          {/* Lorebook Selection */}
          {booksData && booksData.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="lore-book">Add to Lorebook</Label>
              <Select value={selectedLorebook || undefined} onValueChange={setSelectedLorebook}>
                <SelectTrigger id="lore-book" className="border-primary/20">
                  <SelectValue placeholder="Select a lorebook..." />
                </SelectTrigger>
                <SelectContent>
                  {booksData.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4" />
                        {book.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Source Info */}
          {sourceNodeId && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-accent">
                <Sparkles className="size-3" />
                Captured from roleplay session
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={loading || !name.trim() || !content.trim()} className="flex-1">
              {loading ? "Saving..." : "Save to Lore"}
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
