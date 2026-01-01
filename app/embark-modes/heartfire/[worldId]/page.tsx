"use client"

import type React from "react"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import OracleViewer from "@/components/oracle-viewer"
import {
  getHeartFireWorld,
  saveHeartFireWorld,
  getPersona,
  getSettings,
  generateId,
  type HeartFireWorld,
  type HeartFireMessage,
  type Persona,
} from "@/lib/storage"
import { Info, ImageIcon, Eye, Sparkles, MapPin, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { StyledText } from "@/lib/onomatopoeia-styler"

export default function HeartFireWorldPage({ params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = use(params)
  const router = useRouter()

  const [world, setWorld] = useState<HeartFireWorld | null>(null)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [messages, setMessages] = useState<HeartFireMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null)
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "image" | "video" } | null>(null)
  const [showOodaEye, setShowOodaEye] = useState(false)
  const [npcForGallery, setNpcForGallery] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadedWorld = getHeartFireWorld(worldId)
    if (!loadedWorld) {
      router.push("/embark-modes/heartfire")
      return
    }

    setWorld(loadedWorld)
    setMessages(loadedWorld.messages)

    const loadedPersona = getPersona(loadedWorld.personaId)
    setPersona(loadedPersona || null)

    // Initialize world with narrator intro if no messages
    if (loadedWorld.messages.length === 0) {
      const introMessage: HeartFireMessage = {
        id: generateId(),
        speakerId: "narrator",
        speakerType: "narrator",
        content: `Welcome to ${loadedWorld.name}. ${loadedWorld.startingScenario}\n\nWhat do you do?`,
        location: loadedWorld.currentLocation,
        timestamp: Date.now(),
        turnType: "narrative",
      }
      loadedWorld.messages.push(introMessage)
      saveHeartFireWorld(loadedWorld)
      setMessages([introMessage])
    }
  }, [worldId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !world) return

    const settings = getSettings()
    if (!settings.apiKeys.openRouter) {
      alert("Please add your OpenRouter API key in Settings")
      return
    }

    const userMessage: HeartFireMessage = {
      id: generateId(),
      speakerId: "user",
      speakerType: "user",
      content: input.trim(),
      location: world.currentLocation,
      timestamp: Date.now(),
      turnType: "action",
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Build context for AI narrator
      const context = buildWorldContext(updatedMessages)

      const response = await fetch("/api/heartfire-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.speakerType === "user" ? "user" : "assistant",
            content: m.content,
          })),
          model: settings.defaultModel,
          apiKey: settings.apiKeys.openRouter,
          world: world,
          persona: persona,
          context: context,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let narratorContent = ""

      const narratorMessage: HeartFireMessage = {
        id: generateId(),
        speakerId: "narrator",
        speakerType: "narrator",
        content: "",
        location: world.currentLocation,
        timestamp: Date.now(),
        turnType: "narrative",
      }

      setMessages([...updatedMessages, narratorMessage])

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const jsonStr = line.substring(2)
            const parsed = JSON.parse(jsonStr)
            if (parsed) {
              narratorContent += parsed
              setMessages([...updatedMessages, { ...narratorMessage, content: narratorContent }])
            }
          }
        }
      }

      const finalMessages = [...updatedMessages, { ...narratorMessage, content: narratorContent }]

      const updatedWorld: HeartFireWorld = {
        ...world,
        messages: finalMessages,
        updatedAt: Date.now(),
      }

      saveHeartFireWorld(updatedWorld)
      setWorld(updatedWorld)
      setMessages(finalMessages)
    } catch (error) {
      console.error("[v0] HeartFire error:", error)
      alert("Failed to send message")
      setMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  const buildWorldContext = (msgs: HeartFireMessage[]): string => {
    if (!world || !persona) return ""

    let context = `You are the NARRATOR for an open-world roleplay experience called HeartFire World.\n\n`
    context += `PLAYER CHARACTER:\n`
    context += `Name: ${persona.name}\n`
    context += `Description: ${persona.description}\n`
    context += `Personality: ${persona.personality}\n`
    context += `Background: ${persona.background}\n\n`

    context += `WORLD STATE:\n`
    context += `Location: ${world.currentLocation}\n`
    context += `Time: ${world.timeOfDay}\n`
    context += `Weather: ${world.weather}\n`
    context += `Current Situation: ${world.currentSituation}\n\n`

    if (world.npcs.length > 0) {
      context += `ACTIVE NPCs IN AREA:\n`
      world.npcs.slice(-5).forEach((npc) => {
        context += `- ${npc.name}: ${npc.description} (${npc.role})\n`
      })
      context += `\n`
    }

    context += `INSTRUCTIONS:\n`
    context += `1. Narrate the world's response to the player's action\n`
    context += `2. Create dynamic NPCs when appropriate (merchants, travelers, guards, etc.)\n`
    context += `3. When introducing a new NPC, use format: [NPC:Name|Role|Brief Description|Personality]\n`
    context += `4. Describe sensory details, environment, and atmosphere\n`
    context += `5. Give the player clear options to respond or act\n`
    context += `6. Maintain continuity with previous events\n`
    context += `7. Be immersive, descriptive, and engaging\n`
    context += `8. Allow player agency - the world reacts to their choices\n\n`

    return context
  }

  const openMediaViewer = (url: string, type: "image" | "video") => {
    setViewerMedia({ url, type })
  }

  if (!world || !persona) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-background via-background to-amber-500/5">
      {/* Header with World State */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push("/embark-modes/heartfire")} variant="ghost" size="sm">
              <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{world.name}</h1>
              <p className="text-xs text-muted-foreground">Playing as {persona.name}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push("/ooda-eyexr")} variant="outline" size="sm" className="gap-2">
              <Eye className="size-4" />
              OodaEyeXR
            </Button>
          </div>
        </div>

        {/* World State Bar */}
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
            <Sparkles className="size-3" />
            {world.weather}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Users className="size-3" />
            {world.npcs.length} NPCs
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => {
            const isUser = message.speakerType === "user"
            const isNarrator = message.speakerType === "narrator"
            const npc = !isUser && !isNarrator ? world.npcs.find((n) => n.id === message.speakerId) : null

            return (
              <div key={message.id} className={cn("flex gap-3", isUser && "justify-end")}>
                {!isUser && (
                  <Avatar className="size-10 ring-2 ring-amber-500/20">
                    {isNarrator ? (
                      <div className="flex items-center justify-center bg-gradient-to-br from-amber-500 to-rose-500 text-white">
                        <Sparkles className="size-5" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src={npc?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{npc?.name[0] || "?"}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3",
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : isNarrator
                        ? "bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20"
                        : "bg-card border border-border",
                  )}
                >
                  {!isUser && (
                    <p className="text-xs font-semibold mb-1 text-amber-500">
                      {isNarrator ? "Narrator" : npc?.name}
                      {npc && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 ml-2 text-xs"
                          onClick={() => setSelectedNPC(npc.id)}
                        >
                          <Info className="size-3" />
                        </Button>
                      )}
                    </p>
                  )}
                  <StyledText text={message.content} />
                  <p className="text-xs opacity-60 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>

                {isUser && (
                  <Avatar className="size-10 ring-2 ring-primary/20">
                    <AvatarImage src={persona.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{persona.name[0]}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="size-10 rounded-full bg-amber-500/20 animate-pulse" />
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 px-4 py-3">
                <div className="flex gap-2">
                  <div className="size-2 bg-amber-500 rounded-full animate-bounce" />
                  <div className="size-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="size-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="What do you do?..."
              className="resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="lg">
              Act
            </Button>
          </form>
        </div>
      </div>

      {/* NPC Info Modal */}
      {selectedNPC && (
        <Dialog open={!!selectedNPC} onOpenChange={() => setSelectedNPC(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>NPC Information</DialogTitle>
            </DialogHeader>
            {(() => {
              const npc = world.npcs.find((n) => n.id === selectedNPC)
              if (!npc) return null

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarImage src={npc.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{npc.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{npc.name}</h3>
                      <Badge>{npc.role}</Badge>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{npc.description}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Personality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{npc.personality}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Backstory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{npc.backstory}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Relationship</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Relationship:</span>
                        <Badge variant="outline" className="ml-2">
                          {npc.relationshipToPlayer}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trust:</span>
                        <Badge variant="outline" className="ml-2">
                          {npc.trustLevel}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Attraction:</span>
                        <Badge variant="outline" className="ml-2">
                          {npc.attractionLevel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {npc.gallery && npc.gallery.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Gallery</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          {npc.gallery.map((url, idx) => (
                            <img
                              key={idx}
                              src={url || "/placeholder.svg"}
                              alt=""
                              className="aspect-square rounded-lg object-cover cursor-pointer hover:ring-2 ring-amber-500"
                              onClick={() => openMediaViewer(url, "image")}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => {
                      setNpcForGallery(selectedNPC)
                      setShowOodaEye(true)
                      setSelectedNPC(null)
                    }}
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Add Gallery Images from OodaEyeXR
                  </Button>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* OracleViewer */}
      {viewerMedia && (
        <OracleViewer mediaUrl={viewerMedia.url} mediaType={viewerMedia.type} onClose={() => setViewerMedia(null)} />
      )}

      {/* OodaEye Integration Dialog */}
      {showOodaEye && (
        <Dialog open={showOodaEye} onOpenChange={setShowOodaEye}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>OodaEyeXR Integration</DialogTitle>
            </DialogHeader>
            <div className="text-center py-12">
              <Eye className="size-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Navigate to OodaEyeXR to search and save images for character galleries.
              </p>
              <Button className="mt-4" onClick={() => router.push("/ooda-eyexr")}>
                Open OodaEyeXR
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
