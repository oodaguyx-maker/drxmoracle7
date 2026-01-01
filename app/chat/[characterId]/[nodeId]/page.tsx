"use client"

import type React from "react"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OracleViewer } from "@/components/oracle-viewer"
import { UnderTheHoodPanel } from "@/components/under-the-hood-panel"
import { LoreDexViewer } from "@/components/loredex-viewer"
import {
  getCharacter,
  getNode,
  getSettings,
  getCharacterMemories,
  getNodeMemories,
  updateCharacterAttributes,
  getActivePersona,
  getActiveSoul,
  deleteNode,
  type Character,
  type ChatNode,
  type ChatMessage,
  type OracleSoul,
  saveNode,
} from "@/lib/storage"
import { detectAttributeUpdates } from "@/lib/attribute-tracker"
import { cn } from "@/lib/utils"
import { StyledText } from "@/lib/onomatopoeia-styler"
import { analyzeConversationForTags, suggestTagsToAdd, type LearnedTag } from "@/lib/tag-learner"
import { toast } from "sonner"
import { X, Info, Settings, BookOpen, Network, ArrowLeft, Play, BatteryIcon as GalleryIcon, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getGalleryItems, type GalleryItem } from "@/lib/supabase-gallery"

function buildSystemPrompt(character: Character) {
  // Build system prompt using character details
  let systemPrompt = `You are ${character.name}, a character with the following description: ${character.description}. `
  systemPrompt += `Your personality is ${character.personality}. Your scenario is ${character.scenario}. `
  systemPrompt += `Your first message is "${character.first_mes}" and example messages are "${character.mes_example}". `
  systemPrompt += `Your data includes ${JSON.stringify(character.data)}. Your attributes are ${JSON.stringify(character.attributes)}. `
  systemPrompt += `You have the following tags: ${JSON.stringify(character.tags)}.`
  return systemPrompt
}

export default function ChatPage({ params }: Readonly<{ params: Promise<{ characterId: string; nodeId: string }> }>) {
  const { characterId, nodeId } = use(params)
  const router = useRouter()
  const [character, setCharacter] = useState<Character | null>(null)
  const [node, setNode] = useState<ChatNode | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")
  const [showUnderTheHood, setShowUnderTheHood] = useState(false)
  const [showOracleViewer, setShowOracleViewer] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activePersona = getActivePersona()
  const [isInitialized, setIsInitialized] = useState(false)

  const [suggestedTags, setSuggestedTags] = useState<LearnedTag[]>([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)

  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [showLoreDex, setShowLoreDex] = useState(false)
  const [showNodeHub, setShowNodeHub] = useState(false)
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "image" | "video" | "embed" } | null>(null)

  const [activeSoul, setActiveSoul] = useState<OracleSoul | null>(null)
  const [showGalleryModal, setShowGalleryModal] = useState(false)

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(false)

  useEffect(() => {
    if (isInitialized) return

    const char = getCharacter(characterId)
    const chatNode = getNode(nodeId)

    if (!char || !chatNode) {
      console.log("[v0] Character or node not found, redirecting to characters page")
      router.push("/characters")
      return
    }

    setCharacter(char)
    setNode(chatNode)
    setMessages(chatNode.messages || [])

    if (chatNode.soulId) {
      const soul = char.souls?.find((s) => s.id === chatNode.soulId)
      setActiveSoul(soul || null)
    } else {
      setActiveSoul(getActiveSoul(char))
    }

    const settings = getSettings()
    setSelectedModel(settings.defaultModel || "xai/grok-4.1")

    setIsInitialized(true)
  }, [characterId, nodeId, router, isInitialized])

  useEffect(() => {
    async function loadGallery() {
      if (!characterId) return
      setIsLoadingGallery(true)
      try {
        const items = await getGalleryItems(characterId)
        console.log("[v0] Loaded gallery items from Supabase:", items.length)
        setGalleryItems(items)
      } catch (error) {
        console.error("[v0] Error loading gallery:", error)
      } finally {
        setIsLoadingGallery(false)
      }
    }
    loadGallery()
  }, [characterId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (character && messages.length > 0) {
      const updates = detectAttributeUpdates(messages, character.name)

      if (updates.length > 0) {
        console.log("[v0] Detected attribute updates:", updates)

        const autoUpdates: any = {}
        updates.forEach((update) => {
          if (update.confidence === "high") {
            if (update.field === "tattoos" || update.field === "children") {
              const attrs = character.attributes || {}
              const existing = attrs[update.field as keyof typeof attrs] || []
              autoUpdates[update.field] = [...(existing as any[]), update.value]
            } else {
              autoUpdates[update.field] = update.value
            }
          }
        })

        if (Object.keys(autoUpdates).length > 0) {
          updateCharacterAttributes(characterId, autoUpdates)
          const updatedChar = getCharacter(characterId)
          if (updatedChar) {
            setCharacter(updatedChar)
          }
        }
      }
    }
  }, [messages, character, characterId])

  useEffect(() => {
    if (character && messages.length >= 10) {
      const learned = analyzeConversationForTags(messages, character.name)
      const suggestions = suggestTagsToAdd(learned, character.tags || [])

      if (suggestions.length > 0) {
        setSuggestedTags(suggestions)
        setShowTagSuggestions(true)
      }
    }
  }, [messages, character])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !character) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      const settings = getSettings()

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          systemPrompt: buildSystemPrompt(character),
          characterName: activeSoul?.name || character.name,
          characterMemories: getCharacterMemories(params.characterId),
          nodeMemories: getNodeMemories(params.nodeId),
          characterId: params.characterId,
          personaId: activePersona?.id,
          character: {
            name: character.name,
            description: character.description,
            personality: character.personality,
            scenario: character.scenario,
            first_mes: character.first_mes,
            mes_example: character.mes_example,
            data: character.data,
            attributes: character.attributes,
            tags: character.tags,
          },
          apiKeys: {
            xai: settings.apiKeys.xai,
            openRouter: settings.apiKeys.openRouter,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }

      setMessages([...updatedMessages, assistantMessage])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg.role === "assistant") {
            lastMsg.content = assistantContent
          }
          return updated
        })
      }

      if (node) {
        const finalMessages = [...updatedMessages, { ...assistantMessage, content: assistantContent }]
        const updatedNode = { ...node, messages: finalMessages, updatedAt: Date.now() }
        saveNode(updatedNode)
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      toast.error(error.message || "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getEmbedUrl = (item: GalleryItem): string => {
    if (item.embed_code.includes("<iframe")) {
      const srcMatch = item.embed_code.match(/src=["']([^"']+)["']/)
      return srcMatch ? srcMatch[1] : item.embed_code
    }
    return item.embed_code
  }

  const getPreviewUrl = (embedCode: string): string | null => {
    if (embedCode.includes("youtube.com") || embedCode.includes("youtu.be")) {
      const videoIdMatch = embedCode.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?"]+)/)
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`
      }
    }
    return null
  }

  const handleOpenGalleryItem = (item: GalleryItem) => {
    const url = getEmbedUrl(item)
    setViewerMedia({
      url: url,
      type: item.media_type,
    })
    setShowOracleViewer(true)
    setShowGalleryModal(false)
  }

  if (!character || !node) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const displayName = activeSoul?.name || character.name
  const displayAvatar = activeSoul?.avatar || character.avatar

  return (
    <div className="flex h-screen flex-col">
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/characters/${characterId}`)}>
              <ArrowLeft className="size-4" />
            </Button>
            <Avatar className="size-8">
              <AvatarImage src={displayAvatar || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              {activeSoul && <p className="text-xs text-muted-foreground">{activeSoul.genre}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGalleryModal(true)}
              className="flex items-center gap-1.5"
              title="Open Gallery"
            >
              <GalleryIcon className="size-4" />
              <span className="text-xs">Gallery{galleryItems.length > 0 && ` (${galleryItems.length})`}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowInfoPanel(!showInfoPanel)}>
              <Info className="size-4" />
            </Button>
            {character.attachedLorebooks && character.attachedLorebooks.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowLoreDex(!showLoreDex)} className="gap-2">
                <BookOpen className="size-4" />
                <span className="hidden md:inline">LoreDex</span>
                <Badge variant="secondary" className="ml-1">
                  {character.attachedLorebooks.length}
                </Badge>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowNodeHub(!showNodeHub)}>
              <Network className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowUnderTheHood(!showUnderTheHood)}>
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {message.role === "assistant" && (
                <Avatar className="size-8">
                  <AvatarImage src={displayAvatar || "/placeholder.svg"} alt={displayName} />
                  <AvatarFallback>{displayName.slice(0, 2)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "rounded-lg p-3 max-w-[80%]",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <StyledText text={message.content} />
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 resize-none rounded-lg border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={1}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? "..." : "Send"}
            </Button>
          </div>
        </div>
      </div>

      {showUnderTheHood && (
        <UnderTheHoodPanel
          isOpen={showUnderTheHood}
          onClose={() => setShowUnderTheHood(false)}
          characterId={characterId}
          nodeId={nodeId}
        />
      )}

      <Dialog open={showInfoPanel} onOpenChange={setShowInfoPanel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Character Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-muted-foreground">{displayName}</p>
            </div>
            {character.description && (
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-muted-foreground">{character.description}</p>
              </div>
            )}
            {character.personality && (
              <div>
                <p className="text-sm font-medium">Personality</p>
                <p className="text-muted-foreground">{character.personality}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showLoreDex && character.attachedLorebooks && character.attachedLorebooks.length > 0 && (
        <LoreDexViewer lorebookIds={character.attachedLorebooks} onClose={() => setShowLoreDex(false)} />
      )}

      <Dialog open={showNodeHub} onOpenChange={setShowNodeHub}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="size-5" />
              NODEHUB - Quick Jump
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(80vh-100px)]">
            <div className="space-y-2 p-4">
              {character.nodes && character.nodes.length > 0 ? (
                character.nodes.map((nodeItem) => (
                  <Card
                    key={nodeItem.id}
                    className={cn(
                      "p-4 cursor-pointer hover:border-primary transition-colors group",
                      nodeItem.id === nodeId && "border-primary bg-primary/5",
                    )}
                    onClick={() => {
                      router.push(`/chat/${characterId}/${nodeItem.id}`)
                      setShowNodeHub(false)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{nodeItem.title || nodeItem.name}</p>
                        {nodeItem.messages && (
                          <p className="text-xs text-muted-foreground mt-1">{nodeItem.messages.length} messages</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {nodeItem.id === nodeId && <Badge>Current</Badge>}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm("Are you sure you want to delete this conversation?")) {
                              deleteNode(nodeItem.id)
                              // Refresh the character data
                              const updatedChar = getCharacter(characterId)
                              setCharacter(updatedChar)
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Network className="size-12 mx-auto mb-3 opacity-50" />
                  <p>No other nodes available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {showOracleViewer && viewerMedia && (
        <OracleViewer
          mediaUrl={viewerMedia.url}
          mediaType={viewerMedia.type}
          gallery={galleryItems.map((item) => getEmbedUrl(item))}
          onGalleryItemSelect={(url) => {
            setViewerMedia({
              url: url,
              type: galleryItems.find((item) => getEmbedUrl(item) === url)?.media_type || "image",
            })
          }}
          onClose={() => {
            setShowOracleViewer(false)
            setViewerMedia(null)
          }}
        />
      )}

      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowGalleryModal(false)}>
          <div className="h-full overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto max-w-6xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {character.name}'s Gallery {activeSoul && <span className="text-lg">({activeSoul.name})</span>}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGalleryModal(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="size-5" />
                </Button>
              </div>

              {isLoadingGallery ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/60">
                  <div className="inline-block size-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  <p className="mt-4">Loading gallery...</p>
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/60">
                  <GalleryIcon className="size-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No media in gallery</p>
                  <p className="text-sm mt-2">
                    Add images, videos, or embeds via the character edit page to view them here.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => router.push(`/characters/${characterId}/edit`)}
                  >
                    Go to Edit Page
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {galleryItems.map((item) => {
                    const previewUrl = getPreviewUrl(item.embed_code)

                    return (
                      <div
                        key={item.id}
                        className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer hover:ring-2 ring-primary transition-all group"
                        onClick={() => handleOpenGalleryItem(item)}
                      >
                        {item.media_type === "embed" ? (
                          <div className="relative size-full bg-black flex items-center justify-center">
                            {previewUrl ? (
                              <img
                                src={previewUrl || "/placeholder.svg"}
                                alt="Video thumbnail"
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                <Play className="size-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="size-12 text-white" />
                            </div>
                            <Badge className="absolute bottom-2 left-2 text-xs capitalize" variant="secondary">
                              Embed
                            </Badge>
                          </div>
                        ) : item.media_type === "video" ? (
                          <div className="relative size-full">
                            <video src={item.embed_code} className="size-full object-cover" preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="size-12 text-white" />
                            </div>
                            <Badge className="absolute bottom-2 left-2 text-xs capitalize" variant="secondary">
                              Video
                            </Badge>
                          </div>
                        ) : (
                          <>
                            <img
                              src={item.embed_code || "/placeholder.svg"}
                              alt={`Gallery item`}
                              className="size-full object-cover"
                              loading="lazy"
                            />
                            <Badge className="absolute bottom-2 left-2 text-xs capitalize" variant="secondary">
                              Image
                            </Badge>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
