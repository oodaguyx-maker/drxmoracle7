"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getPersonas,
  getCharacters,
  getHeartFireWorlds,
  saveHeartFireWorld,
  generateId,
  type Persona,
  type Character,
  type HeartFireWorld,
} from "@/lib/storage"
import { Flame, Plus, MapPin, Clock, Cloud, Users } from "lucide-react"

export default function HeartFireModePage() {
  const router = useRouter()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [worlds, setWorlds] = useState<HeartFireWorld[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [worldName, setWorldName] = useState("")
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [startingScenario, setStartingScenario] = useState("")
  const [favoriteTags, setFavoriteTags] = useState<string>("")

  useEffect(() => {
    setPersonas(getPersonas())
    setCharacters(getCharacters())
    setWorlds(getHeartFireWorlds())
  }, [])

  const handleCreateWorld = () => {
    if (!worldName.trim() || !selectedPersona || !startingScenario.trim()) {
      alert("Please fill in all required fields")
      return
    }

    if (selectedCharacters.length > 3) {
      alert("Maximum 3 companion characters allowed")
      return
    }

    const newWorld: HeartFireWorld = {
      id: generateId(),
      name: worldName,
      personaId: selectedPersona,
      selectedCharacterIds: selectedCharacters,
      favoriteTags: favoriteTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      startingScenario: startingScenario,
      currentLocation: "Starting Area",
      currentSituation: startingScenario,
      timeOfDay: "Morning",
      weather: "Clear",
      npcs: [],
      encounters: [],
      nodes: [],
      worldState: {
        playerReputation: 0,
        timeProgressed: 0,
        weatherConditions: ["Clear"],
        activePlotlines: [],
        discoveredLocations: ["Starting Area"],
        companionIds: selectedCharacters,
        inventoryItems: [],
        achievements: [],
      },
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveHeartFireWorld(newWorld)
    router.push(`/embark-modes/heartfire/${newWorld.id}`)
  }

  const toggleCharacter = (charId: string) => {
    setSelectedCharacters((prev) => (prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push("/embark-modes")} variant="ghost" size="sm" className="gap-1">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modes
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 p-3">
              <Flame className="size-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">HeartFire World</h1>
              <p className="text-muted-foreground">Open-world adventures with emergent storytelling</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="size-4" />
          New World
        </Button>
      </div>

      {/* Active Worlds */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Active Worlds</h2>
        {worlds.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Flame className="mb-4 size-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No active HeartFire worlds.
                <br />
                Create one to begin your adventure!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {worlds.map((world) => {
              const persona = personas.find((p) => p.id === world.personaId)
              return (
                <Card
                  key={world.id}
                  className="group cursor-pointer transition-all hover:border-amber-500/50"
                  onClick={() => router.push(`/embark-modes/heartfire/${world.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="size-5 text-amber-400" />
                      {world.name}
                    </CardTitle>
                    <CardDescription>Playing as {persona?.name || "Unknown"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="size-3" />
                        {world.currentLocation}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="size-3" />
                        {world.timeOfDay}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Cloud className="size-3" />
                        {world.weather}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="size-3" />
                        {world.selectedCharacterIds.length} Companion
                        {world.selectedCharacterIds.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {world.npcs.length} NPC{world.npcs.length !== 1 ? "s" : ""} • {world.encounters.length}{" "}
                        Encounter{world.encounters.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {world.messages.length} message{world.messages.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create World Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create HeartFire World</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="world-name">World Name *</Label>
              <Input
                id="world-name"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="e.g., The Crimson Realms"
              />
            </div>

            <div>
              <Label>Select Your Persona *</Label>
              {personas.length === 0 ? (
                <Card className="border-dashed mt-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground mb-3">No personas created yet</p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/personas")}>
                      Create Persona
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-2 grid max-h-48 gap-2 overflow-y-auto">
                  {personas.map((persona) => (
                    <div
                      key={persona.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedPersona === persona.id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-border hover:border-amber-500/50"
                      }`}
                      onClick={() => setSelectedPersona(persona.id)}
                    >
                      <Avatar className="size-10">
                        <AvatarImage src={persona.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{persona.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{persona.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{persona.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Select Companion Characters (Up to 3)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                These characters will join you in the world from the start
              </p>
              {characters.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">No characters available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-all ${
                        selectedCharacters.includes(char.id)
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-border hover:border-amber-500/30"
                      } ${selectedCharacters.length >= 3 && !selectedCharacters.includes(char.id) ? "opacity-50" : ""}`}
                      onClick={() => {
                        if (selectedCharacters.length < 3 || selectedCharacters.includes(char.id)) {
                          toggleCharacter(char.id)
                        }
                      }}
                    >
                      <Checkbox checked={selectedCharacters.includes(char.id)} />
                      <Avatar className="size-8">
                        <AvatarImage src={char.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{char.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{char.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Selected: {selectedCharacters.length}/3</p>
            </div>

            <div>
              <Label htmlFor="favorite-tags">Favorite Tags for NPC Avatars (Optional)</Label>
              <Input
                id="favorite-tags"
                value={favoriteTags}
                onChange={(e) => setFavoriteTags(e.target.value)}
                placeholder="e.g., anime, fantasy, realistic, cyberpunk"
              />
              <p className="text-xs text-muted-foreground mt-1">
                These tags will be used to search OodaEye34 for random NPC avatars
              </p>
            </div>

            <div>
              <Label htmlFor="starting-scenario">Starting Scenario *</Label>
              <Textarea
                id="starting-scenario"
                value={startingScenario}
                onChange={(e) => setStartingScenario(e.target.value)}
                placeholder="Describe how your adventure begins... (e.g., 'You arrive at a bustling medieval marketplace as a traveling merchant...')"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorld}>Create World</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
