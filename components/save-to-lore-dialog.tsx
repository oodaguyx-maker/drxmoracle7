"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLoreFromRoleplay, getLorebooks, type Lorebook } from "@/lib/storage"
import { BookOpen, Sparkles, Check } from "lucide-react"
import { toast } from "sonner"

interface SaveToLoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeId: string
  characterId?: string
  suggestedContent?: string
  suggestedName?: string
  suggestedKeys?: string[]
}

export function SaveToLoreDialog({
  open,
  onOpenChange,
  nodeId,
  characterId,
  suggestedContent,
  suggestedName,
  suggestedKeys,
}: SaveToLoreDialogProps) {
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    keys: "",
    category: "Lore" as const,
    importance: "medium" as "low" | "medium" | "high" | "critical",
    lorebookId: "defaultLorebookId", // Updated default value
  })

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

  useEffect(() => {
    if (open) {
      const books = getLorebooks()
      setLorebooks(books)

      // Set suggested values
      setFormData({
        name: suggestedName || "",
        content: suggestedContent || "",
        keys: suggestedKeys?.join(", ") || "",
        category: "Lore",
        importance: "medium",
        lorebookId: books.length > 0 ? books[0].id : "defaultLorebookId", // Updated default value
      })
    }
  }, [open, suggestedContent, suggestedName, suggestedKeys])

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Please fill in name and content")
      return
    }

    createLoreFromRoleplay({
      name: formData.name,
      content: formData.content,
      keys: formData.keys
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      category: formData.category || undefined,
      importance: formData.importance,
      nodeId,
      characterId,
      lorebookId: formData.lorebookId || undefined,
    })

    toast.success("Lore entry created from roleplay!")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-primary/20 bg-gradient-to-br from-card via-card/50 to-primary/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-primary" />
            Save to Lore
          </DialogTitle>
          <DialogDescription>
            Create a lore entry from this roleplay conversation. This will be marked as generated from roleplay.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <BookOpen className="size-4" />
              This entry will be linked to the current conversation
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter a name for this lore entry"
              className="border-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className="border-primary/20">
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
              <Label htmlFor="importance">Importance</Label>
              <Select
                value={formData.importance}
                onValueChange={(value: any) => setFormData({ ...formData, importance: value })}
              >
                <SelectTrigger id="importance" className="border-primary/20">
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

          <div className="space-y-2">
            <Label htmlFor="lorebook">Add to Lorebook (Optional)</Label>
            <Select
              value={formData.lorebookId}
              onValueChange={(value) => setFormData({ ...formData, lorebookId: value })}
            >
              <SelectTrigger id="lorebook" className="border-primary/20">
                <SelectValue placeholder="No lorebook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defaultLorebookId">No lorebook</SelectItem> {/* Updated value */}
                {lorebooks.map((lb) => (
                  <SelectItem key={lb.id} value={lb.id}>
                    {lb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="The lore content from the roleplay..."
              rows={8}
              className="border-primary/20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keys">Keywords</Label>
            <Input
              id="keys"
              value={formData.keys}
              onChange={(e) => setFormData({ ...formData, keys: e.target.value })}
              placeholder="Comma-separated keywords"
              className="border-primary/20"
            />
            <p className="text-xs text-muted-foreground">Keywords that will trigger this lore in future roleplays</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Check className="size-4" />
              Save to Lore
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
