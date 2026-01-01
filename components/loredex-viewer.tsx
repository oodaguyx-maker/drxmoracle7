"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getLorebook, getLoreEntry, type LoreEntry, type Lorebook } from "@/lib/storage"
import {
  BookOpen,
  Search,
  X,
  Library,
  Map,
  Sparkles,
  FileText,
  Wand2,
  Scroll,
  User,
  ChevronRight,
  ArrowLeft,
  BookMarked,
} from "lucide-react"

interface LoreDexViewerProps {
  lorebookIds: string[]
  onClose: () => void
}

type ViewState = "categories" | "entries" | "reader"

export function LoreDexViewer({ lorebookIds, onClose }: LoreDexViewerProps) {
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [allEntries, setAllEntries] = useState<LoreEntry[]>([])
  const [viewState, setViewState] = useState<ViewState>("categories")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const categoryIcons: Record<string, any> = {
    Location: Map,
    Kingdom: Library,
    Faction: BookOpen,
    Race: FileText,
    Item: Sparkles,
    Magic: Wand2,
    Character: User,
    Event: BookOpen,
    Creature: FileText,
    Lore: Scroll,
    Other: FileText,
  }

  useEffect(() => {
    const books = lorebookIds.map((id) => getLorebook(id)).filter(Boolean) as Lorebook[]
    setLorebooks(books)

    const entries = books.flatMap(
      (book) => book.entries.map((entryId) => getLoreEntry(entryId)).filter(Boolean) as LoreEntry[],
    )
    setAllEntries(entries)
  }, [lorebookIds])

  const categorizedEntries = useMemo(() => {
    const grouped: Record<string, LoreEntry[]> = {}
    allEntries.forEach((entry) => {
      const cat = entry.category || "Other"
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(entry)
    })
    return grouped
  }, [allEntries])

  const categories = useMemo(() => Object.keys(categorizedEntries).sort(), [categorizedEntries])

  const filteredEntries = useMemo(() => {
    if (!selectedCategory) return []
    let entries = categorizedEntries[selectedCategory] || []

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      entries = entries.filter(
        (entry) =>
          entry.name.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.keys?.some((key) => key.toLowerCase().includes(query)),
      )
    }

    return entries
  }, [selectedCategory, categorizedEntries, searchQuery])

  const importanceColors = {
    low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    high: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    critical: "bg-red-500/20 text-red-300 border-red-500/30",
  }

  const handleBackToCategories = () => {
    setViewState("categories")
    setSelectedCategory(null)
    setSearchQuery("")
  }

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category)
    setViewState("entries")
  }

  const handleSelectEntry = (entry: LoreEntry) => {
    setSelectedEntry(entry)
    setViewState("reader")
  }

  const handleBackToEntries = () => {
    setViewState("entries")
    setSelectedEntry(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="h-full w-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {viewState === "categories" && (
          <>
            <div className="shrink-0 flex items-center justify-between border-b border-primary/20 bg-card/80 backdrop-blur-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <BookOpen className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">LoreDex</h2>
                  <p className="text-xs text-muted-foreground">
                    {allEntries.length} entries across {categories.length} categories
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="size-9 rounded-lg">
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-6xl mx-auto p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Browse by Category</h3>
                  <p className="text-sm text-muted-foreground">Select a category to explore lore entries</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category] || FileText
                    const count = categorizedEntries[category]?.length || 0

                    return (
                      <Card
                        key={category}
                        className="group cursor-pointer border-primary/20 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all"
                        onClick={() => handleSelectCategory(category)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                                <Icon className="size-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{category}</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {count} {count === 1 ? "entry" : "entries"}
                                </CardDescription>
                              </div>
                            </div>
                            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardHeader>
                      </Card>
                    )
                  })}
                </div>

                <div className="mt-8 rounded-xl border border-primary/20 bg-card/50 p-4">
                  <div className="flex items-start gap-3">
                    <Library className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Active Lorebooks</p>
                      <div className="flex flex-wrap gap-2">
                        {lorebooks.map((lb) => (
                          <Badge key={lb.id} variant="outline" className="bg-primary/5 border-primary/20">
                            {lb.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {viewState === "entries" && selectedCategory && (
          <>
            <div className="shrink-0 border-b border-primary/20 bg-card/80 backdrop-blur-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBackToCategories} className="size-9 rounded-lg">
                  <ArrowLeft className="size-5" />
                </Button>
                <div className="flex items-center gap-2 flex-1">
                  {(() => {
                    const Icon = categoryIcons[selectedCategory] || FileText
                    return <Icon className="size-5 text-primary" />
                  })()}
                  <h3 className="text-lg font-bold">{selectedCategory}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredEntries.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="size-9 rounded-lg">
                  <X className="size-5" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-primary/20 bg-background/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-4xl mx-auto p-6">
                {filteredEntries.length === 0 ? (
                  <div className="flex min-h-[400px] items-center justify-center text-center">
                    <div className="space-y-4">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-muted/50">
                        <Search className="size-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">No entries found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => {
                      const CategoryIcon = entry.category ? categoryIcons[entry.category] || FileText : FileText
                      return (
                        <Card
                          key={entry.id}
                          className="group cursor-pointer border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all"
                          onClick={() => handleSelectEntry(entry)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="rounded-lg bg-primary/10 p-2 shrink-0 ring-1 ring-primary/20">
                                  <CategoryIcon className="size-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base leading-tight break-words">{entry.name}</CardTitle>
                                  {entry.subcategory && (
                                    <CardDescription className="text-xs mt-1">{entry.subcategory}</CardDescription>
                                  )}
                                </div>
                              </div>
                              <Badge className={`shrink-0 text-xs ${importanceColors[entry.importance || "medium"]}`}>
                                {entry.importance || "medium"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="line-clamp-2 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                              {entry.content}
                            </p>
                            {Array.isArray(entry.keys) && entry.keys.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {entry.keys.slice(0, 4).map((key, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-accent/5 text-xs py-0 h-5">
                                    {key}
                                  </Badge>
                                ))}
                                {entry.keys.length > 4 && (
                                  <Badge variant="outline" className="bg-muted/30 text-xs py-0 h-5">
                                    +{entry.keys.length - 4}
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
            </div>
          </>
        )}

        {viewState === "reader" && selectedEntry && (
          <>
            <div className="shrink-0 border-b border-primary/20 bg-card/80 backdrop-blur-xl p-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBackToEntries} className="size-9 rounded-lg">
                  <ArrowLeft className="size-5" />
                </Button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <BookMarked className="size-5 text-primary shrink-0" />
                  <h3 className="text-lg font-bold truncate">{selectedEntry.name}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="size-9 rounded-lg">
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-3xl mx-auto p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 ring-2 ring-primary/20">
                      {selectedEntry.category ? (
                        (() => {
                          const Icon = categoryIcons[selectedEntry.category] || FileText
                          return <Icon className="size-7 text-primary" />
                        })()
                      ) : (
                        <FileText className="size-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold leading-tight break-words">{selectedEntry.name}</h1>
                      {selectedEntry.category && (
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                          {selectedEntry.category}
                          {selectedEntry.subcategory && (
                            <>
                              <ChevronRight className="size-3" />
                              <span>{selectedEntry.subcategory}</span>
                            </>
                          )}
                        </p>
                      )}
                      <Badge className={`mt-2 ${importanceColors[selectedEntry.importance || "medium"]}`}>
                        {selectedEntry.importance || "medium"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-muted/30 to-primary/5 p-6">
                    <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{selectedEntry.content}</p>
                  </div>

                  {Array.isArray(selectedEntry.keys) && selectedEntry.keys.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Sparkles className="size-4 text-primary" />
                          Trigger Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.keys.map((key, idx) => (
                            <Badge key={idx} variant="outline" className="bg-accent/10 border-accent/30 py-1 px-3">
                              {key}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="font-medium text-foreground">Tip:</span> Use these keywords in your
                            roleplay messages to naturally reference this lore and trigger relevant character responses.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="space-y-2">
                      <Separator />
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEntry.generatedFromRoleplay && selectedEntry.sourceNodeId && (
                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-accent">
                        <Sparkles className="size-4" />
                        <span>Generated during roleplay</span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="text-xs text-muted-foreground">
                    Created on {new Date(selectedEntry.createdAt).toLocaleDateString()} at{" "}
                    {new Date(selectedEntry.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
