"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  getLorebook,
  getLoreEntry,
  saveLoreEntry,
  deleteLoreEntry,
  addEntryToLorebook,
  removeEntryFromLorebook,
  generateId,
  type LoreEntry,
  type Lorebook,
} from "@/lib/storage"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  BookOpen,
  MapPin,
  User,
  Scroll,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Bot,
  LayoutDashboard,
  X,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

const CATEGORY_OPTIONS = [
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
  "Technology",
  "Religion",
  "Culture",
  "Economy",
  "Language",
  "Prophecy",
  "Artifact",
  "Ritual",
  "Organization",
  "Other",
]

const ENTRY_TYPE_OPTIONS = [
  { value: "place", label: "Place", icon: MapPin },
  { value: "person", label: "Person", icon: User },
  { value: "object", label: "Object", icon: Scroll },
  { value: "concept", label: "Concept", icon: Lightbulb },
  { value: "history", label: "History", icon: BookOpen },
  { value: "current", label: "Current Event", icon: Sparkles },
  { value: "legend", label: "Legend", icon: BookOpen },
  { value: "fact", label: "Fact", icon: BookOpen },
  { value: "rumor", label: "Rumor", icon: BookOpen },
  { value: "secret", label: "Secret", icon: BookOpen },
  { value: "common_knowledge", label: "Common Knowledge", icon: BookOpen },
]

const IMPORTANCE_OPTIONS = [
  { value: "low", label: "Low", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { value: "medium", label: "Medium", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "high", label: "High", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { value: "critical", label: "Critical", color: "bg-red-500/20 text-red-300 border-red-500/30" },
]

export default function LorebookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const lorebookId = params.lorebookId as string

  const [lorebook, setLorebook] = useState<Lorebook | null>(null)
  const [entries, setEntries] = useState<LoreEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LoreEntry | null>(null)

  const [viewingEntry, setViewingEntry] = useState<LoreEntry | null>(null)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    content: "",
    keys: "",
    importance: "medium" as "low" | "medium" | "high" | "critical",
    category: "",
    subcategory: "",
    entryType: "",
    tags: "",
  })

  useEffect(() => {
    loadData()
  }, [lorebookId])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 50) {
        setHeaderVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const loadData = () => {
    const lb = getLorebook(lorebookId)
    if (!lb) {
      toast.error("Lorebook not found")
      router.push("/loreworld")
      return
    }

    setLorebook(lb)

    // Load entries
    const entryList: LoreEntry[] = []
    for (const entryId of lb.entries || []) {
      const entry = getLoreEntry(entryId)
      if (entry) entryList.push(entry)
    }
    setEntries(entryList)
  }

  const handleCreateEntry = () => {
    setEditingEntry(null)
    setFormData({
      name: "",
      content: "",
      keys: "",
      importance: "medium",
      category: "",
      subcategory: "",
      entryType: "",
      tags: "",
    })
    setShowEntryDialog(true)
  }

  const handleEditEntry = (entry: LoreEntry) => {
    setEditingEntry(entry)
    setFormData({
      name: entry.name,
      content: entry.content,
      keys: Array.isArray(entry.keys) ? entry.keys.join(", ") : "",
      importance: entry.importance || "medium",
      category: entry.category || "",
      subcategory: entry.subcategory || "",
      entryType: entry.entryType || "",
      tags: entry.tags?.join(", ") || "",
    })
    setShowEntryDialog(true)
  }

  const handleSaveEntry = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Please fill in name and content")
      return
    }

    const entry: LoreEntry = {
      id: editingEntry?.id || generateId(),
      name: formData.name,
      content: formData.content,
      keys: formData.keys
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      lorebookId: lorebookId,
      importance: formData.importance,
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      entryType: formData.entryType || undefined,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: editingEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    saveLoreEntry(entry)

    if (!editingEntry) {
      addEntryToLorebook(lorebookId, entry.id)
    }

    toast.success(editingEntry ? "Entry updated" : "Entry created")
    loadData()
    setShowEntryDialog(false)
  }

  const handleDeleteEntry = (entryId: string, entryName: string) => {
    if (confirm(`Delete entry "${entryName}"?`)) {
      deleteLoreEntry(entryId)
      removeEntryFromLorebook(lorebookId, entryId)
      toast.success("Entry deleted")
      loadData()
    }
  }

  const handleViewEntry = (entry: LoreEntry) => {
    setViewingEntry(entry)
  }

  const handleEditFromView = () => {
    if (viewingEntry) {
      handleEditEntry(viewingEntry)
      setViewingEntry(null)
    }
  }

  const handleDeleteFromView = () => {
    if (viewingEntry) {
      handleDeleteEntry(viewingEntry.id, viewingEntry.name)
      setViewingEntry(null)
    }
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.keys?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getImportanceColor = (importance?: string) => {
    const opt = IMPORTANCE_OPTIONS.find((o) => o.value === importance)
    return opt?.color || IMPORTANCE_OPTIONS[1].color
  }

  if (!lorebook) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background">
      {/* Header with auto-hide */}
      <div
        className={`sticky top-0 z-40 border-b border-border/40 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl transition-all duration-300 ${
          headerVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="h-4 w-px bg-border/50" />
            <Button variant="ghost" size="sm" onClick={() => router.push("/loreworld")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {lorebook.name}
              </h1>
              <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                {lorebook.description || "No description"}
              </p>
              <Badge variant="secondary" className="mt-3">
                {entries.length} entries
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/loreworld/lorey-ai?lorebookId=${lorebookId}`)}
                variant="outline"
                className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Bot className="h-5 w-5" />
                <MessageSquare className="h-4 w-4" />
                LoreyAI Chat
              </Button>
              <Button onClick={handleCreateEntry} className="gap-2">
                <Plus className="h-5 w-5" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - sticky below header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Entries */}
      <div className="container mx-auto px-4 pb-16 pt-6">
        {filteredEntries.length === 0 ? (
          <Card className="gloss-card p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">
              {searchQuery || selectedCategory !== "all" ? "No entries found" : "No entries yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Start building your world by creating lore entries or use LoreyAI for assistance"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <div className="flex gap-3 justify-center">
                <Button onClick={handleCreateEntry} className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Entry
                </Button>
                <Button
                  onClick={() => router.push(`/loreworld/lorey-ai?lorebookId=${lorebookId}`)}
                  variant="outline"
                  className="gap-2 border-purple-500/30 text-purple-400"
                >
                  <Bot className="h-5 w-5" />
                  Ask LoreyAI
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEntries.map((entry) => {
              const EntryIcon = ENTRY_TYPE_OPTIONS.find((t) => t.value === entry.entryType)?.icon || BookOpen
              return (
                <Card
                  key={entry.id}
                  className="gloss-card cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all"
                  onClick={() => handleViewEntry(entry)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <EntryIcon className="h-5 w-5 text-purple-500 shrink-0" />
                        <CardTitle className="break-words">{entry.name}</CardTitle>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditEntry(entry)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteEntry(entry.id, entry.name)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.category && <Badge variant="outline">{entry.category}</Badge>}
                      {entry.importance && (
                        <Badge className={getImportanceColor(entry.importance)}>{entry.importance}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3 whitespace-pre-wrap break-words">
                      {entry.content}
                    </p>
                    {entry.keys && entry.keys.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.keys.slice(0, 5).map((key, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {key}
                          </Badge>
                        ))}
                        {entry.keys.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.keys.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {viewingEntry && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-sm border-b border-border/40 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {(() => {
                      const EntryIcon =
                        ENTRY_TYPE_OPTIONS.find((t) => t.value === viewingEntry.entryType)?.icon || BookOpen
                      return (
                        <div className="rounded-xl bg-primary/10 p-3 ring-2 ring-primary/20 shrink-0">
                          <EntryIcon className="h-6 w-6 text-primary" />
                        </div>
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-3xl font-bold leading-tight break-words">{viewingEntry.name}</h2>
                      {viewingEntry.category && (
                        <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1">
                          {viewingEntry.category}
                          {viewingEntry.subcategory && (
                            <>
                              <ChevronRight className="h-3 w-3" />
                              <span>{viewingEntry.subcategory}</span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={getImportanceColor(viewingEntry.importance)}>
                      {viewingEntry.importance || "medium"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingEntry(null)}
                      className="hover:bg-destructive/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Content */}
                  <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-muted/30 to-primary/5 p-5 shadow-inner">
                    <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{viewingEntry.content}</p>
                  </div>

                  {/* Keywords */}
                  {Array.isArray(viewingEntry.keys) && viewingEntry.keys.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                          <Sparkles className="h-4 w-4" />
                          Trigger Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {viewingEntry.keys.map((key, idx) => (
                            <Badge key={idx} variant="outline" className="bg-accent/10 border-accent/30 py-1 px-3">
                              {key}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 italic leading-relaxed">
                          💡 Use these keywords in roleplay to trigger this lore in character responses
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {viewingEntry.tags && viewingEntry.tags.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {viewingEntry.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {viewingEntry.generatedFromRoleplay && (
                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-accent">
                        <Sparkles className="h-4 w-4" />
                        <span>Generated during roleplay</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Modal Footer - Actions */}
              <div className="border-t border-border/40 bg-muted/30 p-4 flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  Created {new Date(viewingEntry.createdAt).toLocaleDateString()} at{" "}
                  {new Date(viewingEntry.createdAt).toLocaleTimeString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleEditFromView} className="gap-2 bg-transparent">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteFromView}
                    className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button onClick={() => setViewingEntry(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Create New Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., The Crystal Spire"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entryType">Entry Type</Label>
                <Select value={formData.entryType} onValueChange={(v) => setFormData({ ...formData, entryType: v })}>
                  <SelectTrigger id="entryType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="importance">Importance</Label>
                <Select
                  value={formData.importance}
                  onValueChange={(v: any) => setFormData({ ...formData, importance: v })}
                >
                  <SelectTrigger id="importance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPORTANCE_OPTIONS.map((imp) => (
                      <SelectItem key={imp.value} value={imp.value}>
                        {imp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g., Ancient Ruins"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Detailed description of this lore entry... (Press Enter for new paragraphs)"
                rows={8}
                className="resize-y min-h-[200px] whitespace-pre-wrap font-sans leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Write naturally with paragraphs - text will wrap and format automatically
              </p>
            </div>

            <div>
              <Label htmlFor="keys">Keywords (comma-separated)</Label>
              <Input
                id="keys"
                value={formData.keys}
                onChange={(e) => setFormData({ ...formData, keys: e.target.value })}
                placeholder="e.g., spire, crystal, tower, magic"
              />
              <p className="text-xs text-muted-foreground mt-1">
                These trigger this lore in conversations when mentioned
              </p>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., ancient, powerful, mysterious"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowEntryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEntry}>{editingEntry ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
