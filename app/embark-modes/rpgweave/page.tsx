"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sword, ScrollText, Plus, Play } from "lucide-react"
import { BackButton } from "@/components/back-button"
import {
  getRpgWeaveWorlds,
  createRpgWeaveWorld,
  createRpgWeaveSession,
  generateId,
  type RpgWeaveWorld,
} from "@/lib/rpgweave-storage"
import { toast } from "sonner"

const CHARACTER_CLASSES = [
  {
    id: "warrior",
    name: "Warrior",
    description: "Master of combat and physical prowess",
    bonuses: "+2 Strength, +1 Constitution",
  },
  { id: "rogue", name: "Rogue", description: "Skilled in stealth and deception", bonuses: "+2 Dexterity, +1 Charisma" },
  { id: "mage", name: "Mage", description: "Wielder of arcane power", bonuses: "+2 Intelligence, +1 Wisdom" },
  { id: "cleric", name: "Cleric", description: "Divine healer and protector", bonuses: "+2 Wisdom, +1 Constitution" },
  {
    id: "bard",
    name: "Bard",
    description: "Charismatic performer and jack-of-all-trades",
    bonuses: "+2 Charisma, +1 Dexterity",
  },
  { id: "ranger", name: "Ranger", description: "Expert hunter and survivalist", bonuses: "+2 Dexterity, +1 Wisdom" },
]

const GENRES = [
  { id: "fantasy", name: "High Fantasy", description: "Magic, dragons, and epic quests" },
  { id: "dark_fantasy", name: "Dark Fantasy", description: "Gritty, mature themes with horror elements" },
  { id: "sci_fi", name: "Sci-Fi", description: "Futuristic technology and space exploration" },
  { id: "cyberpunk", name: "Cyberpunk", description: "High-tech, low-life dystopian future" },
  { id: "post_apocalypse", name: "Post-Apocalypse", description: "Survival in a ruined world" },
  { id: "steampunk", name: "Steampunk", description: "Victorian era with steam-powered technology" },
]

export default function RpgWeavePage() {
  const router = useRouter()
  const [worlds, setWorlds] = useState<RpgWeaveWorld[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // New world form
  const [worldName, setWorldName] = useState("")
  const [genre, setGenre] = useState("fantasy")
  const [difficulty, setDifficulty] = useState("normal")
  const [allowAdultContent, setAllowAdultContent] = useState(true)

  // New character form
  const [characterName, setCharacterName] = useState("")
  const [characterClass, setCharacterClass] = useState("warrior")
  const [characterGender, setCharacterGender] = useState("male")
  const [characterBackground, setCharacterBackground] = useState("")

  useEffect(() => {
    loadWorlds()
  }, [])

  const loadWorlds = () => {
    const loadedWorlds = getRpgWeaveWorlds()
    setWorlds(loadedWorlds)
    setLoading(false)
  }

  const handleCreateWorld = async () => {
    if (!worldName.trim()) {
      toast.error("Please enter a world name")
      return
    }

    if (!characterName.trim()) {
      toast.error("Please enter a character name")
      return
    }

    setCreating(true)

    try {
      // Create the world
      const newWorld: RpgWeaveWorld = {
        id: generateId(),
        name: worldName,
        genre,
        difficulty: difficulty as "easy" | "normal" | "hard" | "nightmare",
        playerCharacter: {
          id: generateId(),
          name: characterName,
          class: characterClass,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          gender: characterGender as "male" | "female" | "other",
          background: characterBackground,
          stats: {
            strength: characterClass === "warrior" ? 12 : characterClass === "ranger" ? 10 : 8,
            dexterity:
              characterClass === "rogue" || characterClass === "ranger" ? 12 : characterClass === "bard" ? 11 : 8,
            constitution: characterClass === "warrior" || characterClass === "cleric" ? 11 : 10,
            intelligence: characterClass === "mage" ? 12 : 8,
            wisdom:
              characterClass === "cleric" || characterClass === "ranger" ? 12 : characterClass === "mage" ? 11 : 8,
            charisma: characterClass === "bard" ? 12 : characterClass === "rogue" ? 11 : 8,
          },
          health: { current: 100, max: 100 },
          mana: { current: 50, max: 50 },
          stamina: { current: 100, max: 100 },
          currency: { gold: 100, silver: 0, copper: 0 },
          inventory: [],
          equipment: {},
          skills: [],
          abilities: [],
          statusEffects: [],
          location: { region: "Starting Village", x: 0, y: 0, mapId: "start" },
          renown: 0,
          titles: [],
          alignment: { moral: 0, ethical: 0 },
        },
        partyMembers: [],
        discoveredLocations: [],
        completedQuests: [],
        activeQuests: [],
        worldState: {},
        allowAdultContent,
        createdAt: Date.now(),
        lastPlayedAt: Date.now(),
      }

      createRpgWeaveWorld(newWorld)

      // Create initial session
      const sessionId = createRpgWeaveSession(newWorld.id, {
        turnNumber: 1,
        narratorMessage: `Welcome to ${worldName}, ${characterName} the ${characterClass}! Your adventure begins in a quiet village on the edge of civilization. The world is vast and full of danger, glory, and untold riches. What will you do?`,
        gameLog: [`[GAME START] ${characterName} begins their journey in ${worldName}`],
        activeEncounter: null,
        activeDialogue: null,
        pendingActions: [],
      })

      toast.success("World created successfully!")
      router.push(`/embark-modes/rpgweave/${sessionId}`)
    } catch (error) {
      console.error("[v0] Error creating world:", error)
      toast.error("Failed to create world")
    } finally {
      setCreating(false)
    }
  }

  const handleContinueWorld = (worldId: string) => {
    const sessionId = createRpgWeaveSession(worldId, {
      turnNumber: 1,
      narratorMessage: "Resuming your adventure...",
      gameLog: [],
      activeEncounter: null,
      activeDialogue: null,
      pendingActions: [],
    })
    router.push(`/embark-modes/rpgweave/${sessionId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p>Loading worlds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <BackButton href="/embark-modes" />

      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Sword className="h-10 w-10 text-pink-500" />
          <h1 className="text-4xl font-bold">RpgWeave Mode</h1>
        </div>
        <p className="text-muted-foreground">
          Experience immersive RPG adventures with stats, combat, exploration, and dynamic storytelling
        </p>
      </div>

      <Tabs defaultValue={worlds.length > 0 ? "worlds" : "create"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="worlds">
            <Play className="mr-2 h-4 w-4" />
            My Worlds
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="worlds" className="space-y-4">
          {worlds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ScrollText className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No Worlds Yet</h3>
                <p className="mb-4 text-muted-foreground">Create your first RPG world to begin your adventure</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {worlds.map((world) => (
                <Card key={world.id} className="hover:border-pink-500/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{world.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {world.playerCharacter.name} • Level {world.playerCharacter.level}{" "}
                          {world.playerCharacter.class}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {world.genre.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">HP:</span>{" "}
                        <span className="font-medium">
                          {world.playerCharacter.health.current}/{world.playerCharacter.health.max}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gold:</span>{" "}
                        <span className="font-medium text-yellow-500">{world.playerCharacter.currency.gold}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Renown:</span>{" "}
                        <span className="font-medium">{world.playerCharacter.renown}</span>
                      </div>
                    </div>

                    {world.playerCharacter.titles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {world.playerCharacter.titles.map((title, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {title}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => handleContinueWorld(world.id)}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Continue Adventure
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create World</CardTitle>
              <CardDescription>Set up your RPG world and game parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="worldName">World Name</Label>
                <Input
                  id="worldName"
                  placeholder="e.g., Realm of Shadows"
                  value={worldName}
                  onChange={(e) => setWorldName(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger id="genre">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          <div>
                            <div className="font-medium">{g.name}</div>
                            <div className="text-xs text-muted-foreground">{g.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy - Forgiving combat</SelectItem>
                      <SelectItem value="normal">Normal - Balanced</SelectItem>
                      <SelectItem value="hard">Hard - Challenging</SelectItem>
                      <SelectItem value="nightmare">Nightmare - Brutal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="adultContent"
                  checked={allowAdultContent}
                  onChange={(e) => setAllowAdultContent(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="adultContent" className="cursor-pointer">
                  Allow adult/sexual content (18+)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Character</CardTitle>
              <CardDescription>Design your hero who will explore this world</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="charName">Character Name</Label>
                  <Input
                    id="charName"
                    placeholder="e.g., Aria Stormborn"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={characterGender} onValueChange={setCharacterGender}>
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other/Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CHARACTER_CLASSES.map((cls) => (
                    <Card
                      key={cls.id}
                      className={`cursor-pointer transition-all ${
                        characterClass === cls.id ? "border-pink-500 bg-pink-500/10" : "hover:border-pink-500/50"
                      }`}
                      onClick={() => setCharacterClass(cls.id)}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{cls.name}</CardTitle>
                        <CardDescription className="text-xs">{cls.description}</CardDescription>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {cls.bonuses}
                        </Badge>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background (Optional)</Label>
                <Input
                  id="background"
                  placeholder="e.g., Former soldier turned mercenary"
                  value={characterBackground}
                  onChange={(e) => setCharacterBackground(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleCreateWorld}
            disabled={creating || !worldName.trim() || !characterName.trim()}
            className="w-full bg-pink-600 hover:bg-pink-700"
            size="lg"
          >
            {creating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                Creating World...
              </>
            ) : (
              <>
                <Sword className="mr-2 h-4 w-4" />
                Begin Adventure
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
