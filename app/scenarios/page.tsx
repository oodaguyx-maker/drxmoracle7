"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  getScenarioTemplates,
  saveScenarioTemplate,
  deleteScenarioTemplate,
  generateId,
  getCharacters,
  type ScenarioTemplate,
  type Character,
} from "@/lib/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ScenariosPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ScenarioTemplate | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    situation: "",
    mood: "",
    timeOfDay: "",
    weather: "",
    tags: "",
  })

  useEffect(() => {
    setTemplates(getScenarioTemplates())
    setCharacters(getCharacters())
  }, [])

  const handleCreate = () => {
    setEditingTemplate(null)
    setSelectedCharacterIds([])
    setFormData({
      name: "",
      description: "",
      location: "",
      situation: "",
      mood: "",
      timeOfDay: "",
      weather: "",
      tags: "",
    })
    setShowDialog(true)
  }

  const handleEdit = (template: ScenarioTemplate) => {
    setEditingTemplate(template)
    setSelectedCharacterIds(template.characterIds || [])
    setFormData({
      name: template.name,
      description: template.description,
      location: template.location,
      situation: template.situation,
      mood: template.mood || "",
      timeOfDay: template.timeOfDay || "",
      weather: template.weather || "",
      tags: template.tags?.join(", ") || "",
    })
    setShowDialog(true)
  }

  const handleSave = () => {
    const template: ScenarioTemplate = {
      id: editingTemplate?.id || generateId(),
      name: formData.name,
      description: formData.description,
      location: formData.location,
      situation: formData.situation,
      mood: formData.mood || undefined,
      timeOfDay: formData.timeOfDay || undefined,
      weather: formData.weather || undefined,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      characterIds: selectedCharacterIds.length > 0 ? selectedCharacterIds : undefined,
      createdAt: editingTemplate?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    saveScenarioTemplate(template)
    setTemplates(getScenarioTemplates())
    setShowDialog(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this scenario template?")) {
      deleteScenarioTemplate(id)
      setTemplates(getScenarioTemplates())
    }
  }

  const toggleCharacterSelection = (characterId: string) => {
    setSelectedCharacterIds((prev) =>
      prev.includes(characterId) ? prev.filter((id) => id !== characterId) : [...prev, characterId],
    )
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
          <h1 className="text-3xl font-bold">Scenario Templates</h1>
          <p className="text-muted-foreground">Create reusable scenario templates for your roleplay sessions</p>
        </div>
        <Button onClick={handleCreate}>
          <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <svg
              className="mb-4 size-16 text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mb-2 text-lg font-semibold">No scenario templates yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create templates to quickly set up roleplay scenarios with locations, situations, and atmosphere
            </p>
            <Button onClick={handleCreate}>Create First Template</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="group">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{template.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 opacity-0 group-hover:opacity-100"
                    onClick={() => handleEdit(template)}
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </Button>
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Location:</span> {template.location}
                  </div>
                  {template.timeOfDay && (
                    <div>
                      <span className="font-medium text-muted-foreground">Time:</span> {template.timeOfDay}
                    </div>
                  )}
                  {template.weather && (
                    <div>
                      <span className="font-medium text-muted-foreground">Weather:</span> {template.weather}
                    </div>
                  )}
                </div>

                {template.characterIds && template.characterIds.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Curated for:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.characterIds.slice(0, 3).map((charId) => {
                        const char = characters.find((c) => c.id === charId)
                        return char ? (
                          <Badge key={charId} variant="outline" className="text-xs gap-1">
                            <Avatar className="size-4">
                              <AvatarImage src={char.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-[8px]">{char.name[0]}</AvatarFallback>
                            </Avatar>
                            {char.name}
                          </Badge>
                        ) : null
                      })}
                      {template.characterIds.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.characterIds.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => handleDelete(template.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit" : "Create"} Scenario Template</DialogTitle>
            <DialogDescription>Define a reusable scenario template for roleplay sessions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Medieval Tavern Night"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of this scenario"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., The Prancing Pony Inn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeOfDay">Time of Day</Label>
                <Input
                  id="timeOfDay"
                  value={formData.timeOfDay}
                  onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                  placeholder="e.g., Late evening"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weather">Weather/Atmosphere</Label>
                <Input
                  id="weather"
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                  placeholder="e.g., Rainy, foggy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Input
                  id="mood"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  placeholder="e.g., Mysterious, cozy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situation">Situation/Context</Label>
              <Textarea
                id="situation"
                value={formData.situation}
                onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                placeholder="Describe the current situation, events, or circumstances..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Curate for Specific Characters (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select characters this scenario is designed for. Leave empty to make it available for all characters.
              </p>
              {characters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No characters created yet</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                  {characters.map((character) => (
                    <div key={character.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`char-${character.id}`}
                        checked={selectedCharacterIds.includes(character.id)}
                        onCheckedChange={() => toggleCharacterSelection(character.id)}
                      />
                      <label htmlFor={`char-${character.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                        <Avatar className="size-6">
                          <AvatarImage src={character.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{character.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{character.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., fantasy, medieval, social"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.location || !formData.situation}>
              {editingTemplate ? "Update" : "Create"} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
