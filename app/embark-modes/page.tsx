"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"
import { Users, Plus, Sparkles, Sword, Lock } from "lucide-react"
import {
  getCharacters,
  getMultiCharSessions,
  saveMultiCharSession,
  initializeRelationships,
  generateId,
  saveCharacter,
  type Character,
  type MultiCharSession,
} from "@/lib/storage"
import { createTestPartyOracleSession } from "@/lib/test-data"

const EMBARK_MODES = [
  {
    id: "multi",
    name: "PartyOracle",
    description: "Multi-character group roleplay with dynamic relationships and turn-based AI",
    icon: Users,
    available: true,
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    id: "heartfire",
    name: "HeartFire World",
    description: "Open-world roleplay with dynamic NPCs, narrator AI, and emergent storytelling",
    icon: Sparkles,
    available: true,
    gradient: "from-amber-500/20 to-rose-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "storyscape",
    name: "StoryScape",
    description: "Guided narrative adventures with chapters, checkpoints, and dynamic endings shaped by your choices",
    icon: BookOpen,
    available: true,
    gradient: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400",
  },
  {
    id: "rpgweave",
    name: "RpgWeave",
    description: "Full RPG experience with stats, combat, inventory, quests, and dynamic world exploration",
    icon: Sword,
    available: true,
    gradient: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-400",
  },
  {
    id: "arena",
    name: "Arena Mode",
    description: "Competitive character battles and strategic encounters",
    icon: Sword,
    available: false,
    gradient: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-400",
  },
  {
    id: "dreamscape",
    name: "Dreamscape",
    description: "Surreal narrative experiences with shifting realities",
    icon: Sparkles,
    available: false,
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
  },
]

export default function EmbarkModesPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [sessions, setSessions] = useState<MultiCharSession[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [sessionName, setSessionName] = useState("")
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [includeUser, setIncludeUser] = useState(true)

  useEffect(() => {
    setCharacters(getCharacters())
    setSessions(getMultiCharSessions())
  }, [])

  const handleModeClick = (modeId: string) => {
    if (modeId === "heartfire") {
      router.push("/embark-modes/heartfire")
    } else if (modeId === "multi") {
      setSelectedMode(modeId)
    } else if (modeId === "storyscape") {
      router.push("/embark-modes/storyscape")
    } else if (modeId === "rpgweave") {
      router.push("/embark-modes/rpgweave")
    } else {
      // Other modes not yet implemented
      alert("This mode is coming soon!")
    }
  }

  const handleCreateSession = () => {
    if (!sessionName.trim() || selectedCharacters.length === 0) {
      alert("Please provide a session name and select at least one character")
      return
    }

    if (selectedCharacters.length > 5) {
      alert("Maximum 5 characters allowed per session")
      return
    }

    const newSession: MultiCharSession = {
      id: generateId(),
      name: sessionName,
      title: sessionName,
      characterIds: selectedCharacters,
      includesUser: includeUser,
      messages: [],
      relationships: [],
      relationshipMap: {},
      nodes: [
        {
          id: generateId(),
          title: "Chapter 1",
          sessionId: generateId(),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      currentNodeId: generateId(),
      modelId: "openai/gpt-4o-mini:free",
      narratorEnabled: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    newSession.currentNodeId = newSession.nodes[0].id

    saveMultiCharSession(newSession)
    initializeRelationships(newSession.id, selectedCharacters)

    router.push(`/embark-modes/${newSession.id}`)
  }

  const toggleCharacter = (charId: string) => {
    setSelectedCharacters((prev) => (prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]))
  }

  const createTestSession = () => {
    const { characters: testChars, session: testSession } = createTestPartyOracleSession()

    // Save test characters
    testChars.forEach((char) => saveCharacter(char))

    // Save test session
    saveMultiCharSession(testSession)

    // Refresh lists
    setCharacters(getCharacters())
    setSessions(getMultiCharSessions())

    // Navigate to the test session
    router.push(`/embark-modes/${testSession.id}`)
  }

  if (!selectedMode) {
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

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Embark Modes</h1>
          <p className="text-muted-foreground">Choose your adventure format</p>
        </div>

        {/* Mode Selection Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EMBARK_MODES.map((mode) => {
            const Icon = mode.icon
            return (
              <Card
                key={mode.id}
                className={`group relative overflow-hidden transition-all ${
                  mode.available
                    ? "cursor-pointer hover:border-primary/50 hover:shadow-lg"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => mode.available && handleModeClick(mode.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-50`} />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl bg-background/80 p-3 backdrop-blur-sm ${mode.iconColor}`}>
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{mode.name}</CardTitle>
                        {!mode.available && (
                          <Badge variant="secondary" className="mt-1 gap-1">
                            <Lock className="size-3" />
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-4 text-base">{mode.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  {mode.available && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <span>Launch Mode</span>
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button onClick={() => setSelectedMode(null)} variant="ghost" size="sm" className="gap-1">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modes
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PartyOracle</h1>
          <p className="text-muted-foreground">Multi-character roleplay adventures</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createTestSession} variant="outline" className="gap-2 bg-transparent">
            <Sparkles className="size-4" />
            Create Test Session
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="size-4" />
            New Session
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Active Sessions</h2>
        {sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 size-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No active multi-character sessions.
                <br />
                Create one to start a group adventure!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="group cursor-pointer transition-all hover:border-primary/50"
                onClick={() => router.push(`/embark-modes/${session.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    {session.name}
                  </CardTitle>
                  <CardDescription>
                    {session.characterIds.length} character{session.characterIds.length !== 1 ? "s" : ""}
                    {session.includesUser ? " + You" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {session.characterIds.slice(0, 3).map((charId) => {
                      const char = characters.find((c) => c.id === charId)
                      return char ? (
                        <span key={charId} className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                          {char.name}
                        </span>
                      ) : null
                    })}
                    {session.characterIds.length > 3 && (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">
                        +{session.characterIds.length - 3} more
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {session.messages.length} message{session.messages.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Multi-Character Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-name">Session Name</Label>
              <Input
                id="session-name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., The Grand Adventure"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="include-user" checked={includeUser} onCheckedChange={(c) => setIncludeUser(c as boolean)} />
              <Label htmlFor="include-user">Include yourself in the session</Label>
            </div>

            <div>
              <Label>Select Characters (Max 5)</Label>
              <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      selectedCharacters.includes(char.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleCharacter(char.id)}
                  >
                    <Checkbox checked={selectedCharacters.includes(char.id)} />
                    <img
                      src={char.avatar || "/character-placeholder.jpg"}
                      alt={char.name}
                      className="size-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{char.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{char.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>Create Session</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
