"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCharacters, saveCharacter, deleteCharacter, generateId, type Character } from "@/lib/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Star, Search, Filter, X } from "lucide-react"
import { toast } from "sonner"
import { CharacterImportWizard } from "@/components/character-import-wizard"

export default function CharactersPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showZipImportDialog, setShowZipImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    loadCharacters()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [characters, searchQuery, selectedTags, showOnlyFavorites])

  const loadCharacters = () => {
    const chars = getCharacters()
    setCharacters(chars)

    const tagSet = new Set<string>()
    chars.forEach((char) => {
      char.tags?.forEach((tag) => tagSet.add(tag))
    })
    setAllTags(Array.from(tagSet).sort())
  }

  const applyFilters = () => {
    let filtered = [...characters]

    // Filter by search query (name, description, personality)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (char) =>
          char.name.toLowerCase().includes(query) ||
          char.description?.toLowerCase().includes(query) ||
          char.personality?.toLowerCase().includes(query) ||
          char.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Filter by selected tags (AND logic - must have all selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((char) => selectedTags.every((tag) => char.tags?.includes(tag)))
    }

    // Filter by favorites
    if (showOnlyFavorites) {
      filtered = filtered.filter((char) => char.isFavorite)
    }

    setFilteredCharacters(filtered)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setShowOnlyFavorites(false)
  }

  const toggleFavorite = (characterId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const char = characters.find((c) => c.id === characterId)
    if (!char) return

    const updated = { ...char, isFavorite: !char.isFavorite, updatedAt: Date.now() }
    saveCharacter(updated)
    loadCharacters()
    toast.success(updated.isFavorite ? "Added to favorites" : "Removed from favorites")
  }

  const handleCreateNew = () => {
    const newCharacter: Character = {
      id: generateId(),
      name: "New Character",
      description: "",
      personality: "",
      scenario: "",
      first_mes: "Hello! I'm a new character.",
      mes_example: "",
      tags: [],
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    saveCharacter(newCharacter)
    loadCharacters()
    router.push(`/characters/${newCharacter.id}/edit`)
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a JSON file to import")
      return
    }

    try {
      const text = await importFile.text()
      const parsed = JSON.parse(text)

      // Support ChubAI/SillyTavern format
      const character: Character = {
        id: generateId(),
        name: parsed.name || parsed.data?.name || "Imported Character",
        description: parsed.description || parsed.data?.description || "",
        personality: parsed.personality || parsed.data?.personality || "",
        scenario: parsed.scenario || parsed.data?.scenario || "",
        first_mes: parsed.first_mes || parsed.data?.first_mes || "Hello!",
        mes_example: parsed.mes_example || parsed.data?.mes_example || "",
        tags: parsed.data?.tags || [],
        isFavorite: false,
        spec: parsed.spec,
        spec_version: parsed.spec_version,
        data: parsed.data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      saveCharacter(character)
      loadCharacters()
      setShowImportDialog(false)
      setImportFile(null)
      toast.success("Character imported successfully")
      router.push(`/characters/${character.id}/edit`)
    } catch (error) {
      toast.error("Invalid JSON file. Please check your file format")
      console.error("[v0] Import error:", error)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this character?")) {
      deleteCharacter(id)
      loadCharacters()
      toast.success("Character deleted")
    }
  }

  const handleCharacterClick = (id: string) => {
    router.push(`/characters/${id}`)
  }

  const handleZipImportComplete = (character: Character) => {
    saveCharacter(character)
    loadCharacters()
    router.push(`/characters/${character.id}/edit`)
  }

  const activeFiltersCount = selectedTags.length + (showOnlyFavorites ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <div className="min-h-screen space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" size="sm" className="gap-1">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Characters</h1>
          <p className="text-muted-foreground">
            {filteredCharacters.length} of {characters.length} characters
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowZipImportDialog(true)} variant="outline" className="gap-2">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Import ZIP
          </Button>
          <Button onClick={() => setShowImportDialog(true)} variant="outline">
            <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Import JSON
          </Button>
          <Button onClick={handleCreateNew}>
            <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Character
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            <Button
              variant={showOnlyFavorites ? "default" : "outline"}
              size="icon"
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className="shrink-0"
            >
              <Star className={`size-4 ${showOnlyFavorites ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="size-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 size-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filter by Tags</Label>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {allTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tags available. Add tags to your characters to use filtering.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredCharacters.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center text-center">
            {characters.length === 0 ? (
              <>
                <svg
                  className="mb-4 size-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-semibold">No characters yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create a new character or import one from ChubAI/SillyTavern
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleCreateNew}>Create Character</Button>
                  <Button onClick={() => setShowImportDialog(true)} variant="outline">
                    Import JSON
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Search className="mb-4 size-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No characters found</h3>
                <p className="mb-4 text-sm text-muted-foreground">Try adjusting your search or filters</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <Card key={character.id} className="group cursor-pointer transition-colors hover:bg-muted/50 relative">
              <button
                onClick={(e) => toggleFavorite(character.id, e)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-all"
              >
                <Star
                  className={`size-4 transition-all ${
                    character.isFavorite
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground hover:text-yellow-500"
                  }`}
                />
              </button>

              <CardHeader className="pb-3" onClick={() => handleCharacterClick(character.id)}>
                <div className="flex items-start gap-3">
                  <Avatar className="size-12 ring-2 ring-border">
                    <AvatarImage src={character.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{character.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 pr-8">
                    <CardTitle className="text-base">{character.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {character.description || "No description"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleCharacterClick(character.id)} className="space-y-3">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {character.first_mes || "No greeting message"}
                </p>

                {character.tags && character.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {character.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {character.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{character.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="flex gap-2 border-t p-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/characters/${character.id}/edit`)
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(character.id)
                  }}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Character JSON</DialogTitle>
            <DialogDescription>Upload your ChubAI or SillyTavern character JSON file</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-file">Character JSON File</Label>
              <Input
                id="json-file"
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Select a .json file exported from ChubAI or SillyTavern</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowImportDialog(false)
                  setImportFile(null)
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importFile}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CharacterImportWizard
        open={showZipImportDialog}
        onOpenChange={setShowZipImportDialog}
        onImportComplete={handleZipImportComplete}
      />
    </div>
  )
}
