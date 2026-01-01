"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getPersonas,
  savePersona,
  deletePersona,
  getActivePersona,
  setActivePersona,
  getLorebooks,
  type Persona,
  type Lorebook,
} from "@/lib/storage"
import { cn } from "@/lib/utils"
import { BookOpen } from "lucide-react"

export default function PersonasPage() {
  const router = useRouter()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [activePersona, setActivePersonaState] = useState<Persona | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [aiInstruction, setAiInstruction] = useState("")
  const [isAiEditing, setIsAiEditing] = useState(false)
  const [availableLorebooks, setAvailableLorebooks] = useState<Lorebook[]>([])
  const [attachedLorebooks, setAttachedLorebooks] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    appearance: "",
    personality: "",
    background: "",
    avatar: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setPersonas(getPersonas())
    setActivePersonaState(getActivePersona())
    setAvailableLorebooks(getLorebooks())
  }

  const toggleLorebook = (lorebookId: string) => {
    setAttachedLorebooks((prev) => {
      const updated = prev.includes(lorebookId) ? prev.filter((id) => id !== lorebookId) : [...prev, lorebookId]
      return updated
    })
  }

  const handleCreate = () => {
    const newPersona: Persona = {
      id: `persona-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      appearance: formData.appearance,
      personality: formData.personality,
      background: formData.background,
      avatar: formData.avatar,
      attachedLorebooks: [...attachedLorebooks], // Include lorebooks
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    savePersona(newPersona)
    loadData()
    setIsCreateOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!editingPersona) return

    const updated: Persona = {
      ...editingPersona,
      name: formData.name,
      description: formData.description,
      appearance: formData.appearance,
      personality: formData.personality,
      background: formData.background,
      avatar: formData.avatar,
      attachedLorebooks: [...attachedLorebooks], // Include lorebooks
    }

    savePersona(updated)
    loadData()
    setIsEditOpen(false)
    setEditingPersona(null)
    resetForm()
  }

  const handleAiEdit = async () => {
    if (!aiInstruction.trim() || !editingPersona) return

    setIsAiEditing(true)
    try {
      const response = await fetch("/api/persona-ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaData: formData,
          instruction: aiInstruction,
        }),
      })

      if (!response.ok) throw new Error("AI edit failed")

      const data = await response.json()
      setFormData({
        ...formData,
        ...data.updatedPersona,
      })
      setAiInstruction("")
    } catch (error) {
      console.error("[v0] AI edit error:", error)
      alert("Failed to use AI edit. Please try again.")
    } finally {
      setIsAiEditing(false)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this persona?")) {
      deletePersona(id)
      if (activePersona?.id === id) {
        setActivePersona(null)
      }
      loadData()
    }
  }

  const handleSetActive = (persona: Persona) => {
    setActivePersona(persona.id)
    setActivePersonaState(persona)
  }

  const openEditDialog = (persona: Persona) => {
    setEditingPersona(persona)
    setFormData({
      name: persona.name,
      description: persona.description,
      appearance: persona.appearance,
      personality: persona.personality,
      background: persona.background,
      avatar: persona.avatar || "",
    })
    setAttachedLorebooks(persona.attachedLorebooks || [])
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      appearance: "",
      personality: "",
      background: "",
      avatar: "",
    })
    setAttachedLorebooks([])
  }

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold tracking-tight">Your Personas</h1>
          <p className="text-muted-foreground">Create and manage your roleplay identities</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
              <DialogDescription>Define your roleplay identity with detailed characteristics</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-avatar">Avatar URL (optional)</Label>
                <Input
                  id="create-avatar"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">Name *</Label>
                <Input
                  id="create-name"
                  placeholder="Your persona name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  placeholder="A brief overview of who you are..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-appearance">Appearance</Label>
                <Textarea
                  id="create-appearance"
                  placeholder="Physical description, clothing, distinctive features..."
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-personality">Personality</Label>
                <Textarea
                  id="create-personality"
                  placeholder="Traits, mannerisms, how you interact..."
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-background">Background</Label>
                <Textarea
                  id="create-background"
                  placeholder="Your history, experiences, context..."
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  Attached Lorebooks
                </Label>
                <p className="text-xs text-muted-foreground">
                  Select lorebooks to make their lore available when using this persona
                </p>
                {availableLorebooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No lorebooks available. Create some in LoreWorld first.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-lg border p-4">
                    {availableLorebooks.map((book) => (
                      <div key={book.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`create-lorebook-${book.id}`}
                          checked={attachedLorebooks.includes(book.id)}
                          onCheckedChange={() => toggleLorebook(book.id)}
                        />
                        <label htmlFor={`create-lorebook-${book.id}`} className="flex-1 cursor-pointer text-sm">
                          <span className="font-medium">{book.name}</span>
                          {book.description && <span className="text-muted-foreground"> - {book.description}</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name.trim()}>
                Create Persona
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activePersona && (
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 ring-2 ring-primary">
                  <AvatarImage src={activePersona.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {activePersona.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{activePersona.name}</CardTitle>
                    <Badge className="bg-primary">Active</Badge>
                    {activePersona.attachedLorebooks && activePersona.attachedLorebooks.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <BookOpen className="size-3" />
                        {activePersona.attachedLorebooks.length}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Currently in use for roleplay</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setActivePersona(null)}>
                Deactivate
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card
            key={persona.id}
            className={cn("transition-all hover:shadow-lg", activePersona?.id === persona.id && "ring-2 ring-primary")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={persona.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10">
                      {persona.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{persona.name}</CardTitle>
                    <div className="mt-1 flex gap-1">
                      {activePersona?.id === persona.id && <Badge variant="outline">Active</Badge>}
                      {persona.attachedLorebooks && persona.attachedLorebooks.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <BookOpen className="size-3" />
                          {persona.attachedLorebooks.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {persona.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{persona.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {activePersona?.id !== persona.id && (
                  <Button size="sm" variant="default" onClick={() => handleSetActive(persona)}>
                    Set Active
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => openEditDialog(persona)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(persona.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {personas.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <svg className="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Personas Yet</h3>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Create your first persona to customize how you appear in roleplay conversations
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>Create Your First Persona</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Persona</DialogTitle>
            <DialogDescription>Update your persona details or use AI to quickly enhance it</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Label>AI Quick Edit</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 'Make me more confident' or 'Add a mysterious background'"
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleAiEdit()
                  }
                }}
              />
              <Button onClick={handleAiEdit} disabled={isAiEditing || !aiInstruction.trim()}>
                {isAiEditing ? (
                  <>
                    <svg className="mr-2 size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Editing...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    AI Edit
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Describe how you want to change this persona and AI will update all fields accordingly
            </p>
          </div>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Avatar URL</Label>
              <Input
                id="edit-avatar"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Your persona name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="A brief overview of who you are..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-appearance">Appearance</Label>
              <Textarea
                id="edit-appearance"
                placeholder="Physical description, clothing, distinctive features..."
                value={formData.appearance}
                onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-personality">Personality</Label>
              <Textarea
                id="edit-personality"
                placeholder="Traits, mannerisms, how you interact..."
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-background">Background</Label>
              <Textarea
                id="edit-background"
                placeholder="Your history, experiences, context..."
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="size-4" />
                Attached Lorebooks
              </Label>
              <p className="text-xs text-muted-foreground">
                Select lorebooks to make their lore available when using this persona
              </p>
              {availableLorebooks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No lorebooks available. Create some in LoreWorld first.</p>
              ) : (
                <div className="space-y-2 rounded-lg border p-4">
                  {availableLorebooks.map((book) => (
                    <div key={book.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-lorebook-${book.id}`}
                        checked={attachedLorebooks.includes(book.id)}
                        onCheckedChange={() => toggleLorebook(book.id)}
                      />
                      <label htmlFor={`edit-lorebook-${book.id}`} className="flex-1 cursor-pointer text-sm">
                        <span className="font-medium">{book.name}</span>
                        {book.description && <span className="text-muted-foreground"> - {book.description}</span>}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false)
                setEditingPersona(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
