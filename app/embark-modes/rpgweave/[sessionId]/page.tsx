"use client"

import { useState, useEffect, useRef } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"
import {
  Sword,
  Heart,
  Sparkles,
  Zap,
  Backpack,
  Users,
  ScrollText,
  Trophy,
  Send,
  Save,
  RotateCcw,
  X,
  Check,
} from "lucide-react"
import {
  getRpgWeaveSession,
  updateRpgWeaveSession,
  getRpgWeaveWorld,
  updateRpgWeaveWorld,
  getRpgWeaveCheckpoints,
  loadRpgWeaveCheckpoint,
  type RpgWeaveSession,
  type RpgWeaveWorld,
} from "@/lib/rpgweave-storage"
import { toast } from "sonner"
import { StyledText } from "@/lib/onomatopoeia-styler"
import { SaveLoreDialog } from "@/components/save-lore-dialog"
import { LoreDexViewer } from "@/components/loredex-viewer"
import { getCharacter } from "@/lib/storage"

export default function RpgWeaveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [session, setSession] = useState<RpgWeaveSession | null>(null)
  const [world, setWorld] = useState<RpgWeaveWorld | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [input, setInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [showSaveLoreDialog, setShowSaveLoreDialog] = useState(false)
  const [selectedLoreContent, setSelectedLoreContent] = useState("")
  const [showLoreDex, setShowLoreDex] = useState(false)
  const [characterLorebooks, setCharacterLorebooks] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState("game") // Declare selectedTab variable

  useEffect(() => {
    loadSession()
  }, [resolvedParams.sessionId])

  useEffect(() => {
    if (world?.playerCharacterId) {
      const character = getCharacter(world.playerCharacterId)
      if (character?.attachedLorebooks) {
        setCharacterLorebooks(character.attachedLorebooks)
      }
    }
  }, [world])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadSession = () => {
    const loadedSession = getRpgWeaveSession(resolvedParams.sessionId)
    if (!loadedSession) {
      toast.error("Session not found")
      router.push("/embark-modes/rpgweave")
      return
    }

    const loadedWorld = getRpgWeaveWorld(loadedSession.worldId)
    if (!loadedWorld) {
      toast.error("World not found")
      router.push("/embark-modes/rpgweave")
      return
    }

    setSession(loadedSession)
    setWorld(loadedWorld)
    setLoading(false)
  }

  const handleSendAction = async () => {
    if (!input.trim() || !session || !world) return

    setProcessing(true)
    const userAction = input.trim()
    setInput("")

    try {
      // Add user action to log
      const updatedLog = [...session.gameLog, `[YOU] ${userAction}`]

      // Call AI API
      const response = await fetch("/api/rpgweave-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          worldId: world.id,
          action: userAction,
          playerCharacter: world.playerCharacter,
          worldState: world.worldState,
          gameLog: updatedLog,
        }),
      })

      if (!response.ok) throw new Error("Failed to process action")

      const data = await response.json()

      // Update session with AI response
      const updatedSession: RpgWeaveSession = {
        ...session,
        turnNumber: session.turnNumber + 1,
        narratorMessage: data.narratorMessage,
        gameLog: [...updatedLog, `[NARRATOR] ${data.narratorMessage}`],
        activeEncounter: data.encounter || null,
        activeDialogue: data.dialogue || null,
      }

      updateRpgWeaveSession(updatedSession)

      // Update world state if changed
      if (data.worldUpdates) {
        const updatedWorld = { ...world, ...data.worldUpdates }
        updateRpgWeaveWorld(updatedWorld)
        setWorld(updatedWorld)
      }

      setSession(updatedSession)
    } catch (error) {
      console.error("[v0] Error processing action:", error)
      toast.error("Failed to process action")
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveToLore = (text: string) => {
    setSelectedLoreContent(text)
    setShowSaveLoreDialog(true)
  }

  const handleLoadCheckpoint = (checkpointId: string) => {
    const loadedCheckpoint = loadRpgWeaveCheckpoint(checkpointId)
    if (loadedCheckpoint) {
      setSession(loadedCheckpoint.session)
      setWorld(loadedCheckpoint.world)
    }
  }

  if (loading || !session || !world) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p>Loading session...</p>
        </div>
      </div>
    )
  }

  const pc = world.playerCharacter
  const hpPercent = (pc.health.current / pc.health.max) * 100
  const manaPercent = (pc.mana.current / pc.mana.max) * 100
  const xpPercent = (pc.experience / pc.experienceToNextLevel) * 100

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-card via-card/50 to-primary/5 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{world?.name}</h1>
            <p className="text-sm text-muted-foreground">
              {pc.name} • Level {pc.level} {pc.class} • Turn {session.turnNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {characterLorebooks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoreDex(true)}
                className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30"
                title="View attached lore"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">LoreDex</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveToLore("")}
              className="gap-2"
              title="Save a moment to lore"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Save to Lore</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/embark-modes/rpgweave")}>
              Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Sidebar - Character Stats */}
        <div className="w-80 space-y-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Character</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Health */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    Health
                  </span>
                  <span>
                    {pc.health.current}/{pc.health.max}
                  </span>
                </div>
                <Progress value={hpPercent} className="h-2 bg-red-950">
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${hpPercent}%` }} />
                </Progress>
              </div>

              {/* Mana */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Mana
                  </span>
                  <span>
                    {pc.mana.current}/{pc.mana.max}
                  </span>
                </div>
                <Progress value={manaPercent} className="h-2 bg-blue-950">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${manaPercent}%` }} />
                </Progress>
              </div>

              {/* Stamina */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Stamina
                  </span>
                  <span>
                    {pc.stamina.current}/{pc.stamina.max}
                  </span>
                </div>
                <Progress value={(pc.stamina.current / pc.stamina.max) * 100} className="h-2 bg-yellow-950">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{ width: `${(pc.stamina.current / pc.stamina.max) * 100}%` }}
                  />
                </Progress>
              </div>

              {/* Experience */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>Experience</span>
                  <span>
                    {pc.experience}/{pc.experienceToNextLevel}
                  </span>
                </div>
                <Progress value={xpPercent} className="h-2 bg-purple-950">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${xpPercent}%` }} />
                </Progress>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">STR</span>
                  <span className="font-medium">{pc.stats.strength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DEX</span>
                  <span className="font-medium">{pc.stats.dexterity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CON</span>
                  <span className="font-medium">{pc.stats.constitution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">INT</span>
                  <span className="font-medium">{pc.stats.intelligence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WIS</span>
                  <span className="font-medium">{pc.stats.wisdom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CHA</span>
                  <span className="font-medium">{pc.stats.charisma}</span>
                </div>
              </div>

              <Separator />

              {/* Currency */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gold</span>
                <span className="font-medium text-yellow-500">{pc.currency.gold}</span>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{pc.location.region}</span>
              </div>

              {/* Renown */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Trophy className="h-3 w-3" />
                  Renown
                </span>
                <span className="font-medium">{pc.renown}</span>
              </div>

              {/* Titles */}
              {pc.titles.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Titles</span>
                  <div className="flex flex-wrap gap-1">
                    {pc.titles.map((title, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Party & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  Party Members
                </span>
                <span>{world.partyMembers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Backpack className="h-3 w-3" />
                  Inventory Items
                </span>
                <span>{pc.inventory.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ScrollText className="h-3 w-3" />
                  Active Quests
                </span>
                <span>{world.activeQuests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex flex-1 flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="game">
                <Sword className="mr-2 h-4 w-4" />
                Game
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <Backpack className="mr-2 h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="party">
                <Users className="mr-2 h-4 w-4" />
                Party
              </TabsTrigger>
              <TabsTrigger value="quests">
                <ScrollText className="mr-2 h-4 w-4" />
                Quests
              </TabsTrigger>
              <TabsTrigger value="checkpoints">
                <Save className="mr-2 h-4 w-4" />
                Checkpoints
              </TabsTrigger>
            </TabsList>

            {/* Game Tab */}
            <TabsContent value="game" className="flex flex-1 flex-col overflow-hidden">
              <Card className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {session?.gameLog.map((log, idx) => {
                      const isNarrator = log.startsWith("[NARRATOR]")
                      const isPlayer = log.startsWith("[YOU]")
                      const isSystem = log.startsWith("[GAME")
                      const messageText = log.replace("[NARRATOR] ", "").replace("[YOU] ", "")

                      return (
                        <div
                          key={idx}
                          className={`group relative ${isPlayer ? "text-right" : ""}`}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            handleSaveToLore(messageText)
                          }}
                        >
                          {isNarrator && (
                            <div
                              className="rounded-lg bg-purple-500/10 p-3 text-purple-200 hover:bg-purple-500/20 cursor-pointer transition-colors"
                              onClick={() => handleSaveToLore(messageText)}
                            >
                              <StyledText text={messageText} />
                              <div className="absolute -right-8 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-xs"
                                  onClick={() => handleSaveToLore(messageText)}
                                  title="Save this moment to lore"
                                >
                                  <Sparkles className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {isPlayer && (
                            <div className="inline-block rounded-lg bg-pink-600 p-3 text-white">
                              <StyledText text={log.replace("[YOU] ", "")} />
                            </div>
                          )}
                          {isSystem && (
                            <div className="rounded-lg border border-dashed p-2 text-center text-sm text-muted-foreground">
                              {log}
                            </div>
                          )}
                          {!isNarrator && !isPlayer && !isSystem && (
                            <div className="rounded-lg bg-muted p-3">
                              <StyledText text={log} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendAction()}
                      placeholder="What do you do? (e.g., 'I explore the tavern' or 'I attack the goblin')"
                      disabled={processing}
                    />
                    <Button onClick={handleSendAction} disabled={processing || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Describe your action, dialogue, or decision. The AI will respond dynamically.
                  </p>
                </div>
              </Card>
            </TabsContent>

            {/* Other tabs - simplified for length */}
            <TabsContent value="inventory" className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Inventory & Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  {pc.inventory.length === 0 ? (
                    <p className="text-center text-muted-foreground">Your inventory is empty</p>
                  ) : (
                    <div className="grid gap-2">
                      {pc.inventory.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                          <Badge>{item.quantity}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="party" className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Party Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {world.partyMembers.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      You're traveling alone. Recruit companions on your journey!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {world.partyMembers.map((member) => (
                        <div key={member.id} className="rounded-lg border p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                            <Badge variant={member.status === "active" ? "default" : "secondary"}>
                              {member.status}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Health</span>
                              <span>
                                {member.health.current}/{member.health.max}
                              </span>
                            </div>
                            <Progress value={(member.health.current / member.health.max) * 100} className="h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quests" className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Quests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {world.activeQuests.length === 0 && world.completedQuests.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        No quests yet. Explore the world to find adventures!
                      </p>
                    ) : (
                      <>
                        {world.activeQuests.length > 0 && (
                          <div>
                            <h3 className="mb-2 font-semibold">Active Quests</h3>
                            <div className="space-y-2">
                              {world.activeQuests.map((quest) => (
                                <div key={quest.id} className="rounded-lg border border-pink-500/50 p-3">
                                  <div className="font-medium">{quest.title}</div>
                                  <div className="text-sm text-muted-foreground">{quest.description}</div>
                                  {quest.objectives.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {quest.objectives.map((obj, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                          {obj.completed ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <X className="h-3 w-3 text-muted-foreground" />
                                          )}
                                          <span className={obj.completed ? "line-through" : ""}>{obj.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {world.completedQuests.length > 0 && (
                          <div>
                            <h3 className="mb-2 font-semibold text-muted-foreground">Completed</h3>
                            <div className="space-y-2">
                              {world.completedQuests.map((quest) => (
                                <div key={quest.id} className="rounded-lg border p-3 opacity-60">
                                  <div className="font-medium">{quest.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checkpoints" className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Checkpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getRpgWeaveCheckpoints(world.id).map((checkpoint) => (
                      <div key={checkpoint.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <div className="font-medium">{checkpoint.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(checkpoint.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleLoadCheckpoint(checkpoint.id)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Load
                        </Button>
                      </div>
                    ))}
                    {getRpgWeaveCheckpoints(world.id).length === 0 && (
                      <p className="text-center text-muted-foreground">No checkpoints saved yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Save to Lore Dialog */}
      <SaveLoreDialog
        open={showSaveLoreDialog}
        onOpenChange={setShowSaveLoreDialog}
        defaultContent={selectedLoreContent}
        characterId={world?.playerCharacterId}
        sourceNodeId={session?.id}
      />

      {/* LoreDex Viewer */}
      {showLoreDex && characterLorebooks.length > 0 && (
        <LoreDexViewer lorebookIds={characterLorebooks} onClose={() => setShowLoreDex(false)} />
      )}
    </div>
  )
}
