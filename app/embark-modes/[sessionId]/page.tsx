"use client"

import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"

import { useParams } from "next/navigation"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Send,
  Settings,
  Edit2,
  MoreVertical,
  Sparkles,
  GitBranch,
  BookOpen,
  Users,
  ArrowLeft,
  ArrowRight,
  Zap,
  Plus,
  Network,
  MessageSquare,
  Trash2,
} from "lucide-react"
import {
  getMultiCharSession,
  saveMultiCharSession,
  getCharacters,
  getUserPersona,
  generateId,
  deleteMultiCharSession,
  getSettings,
  type MultiCharSession,
  type Character,
  type Message,
  type MultiCharNode,
  type AppSettings,
  getLorebooks,
} from "@/lib/storage"
import { buildMultiCharacterSystemPrompt } from "@/lib/prompts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ModelSelectorDialog } from "@/components/model-selector-dialog"
import { OracleViewer } from "@/components/oracle-viewer"
import { StyledText } from "@/lib/onomatopoeia-styler"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function PartyOracleSessionPage() {
  const router = useRouter()
  const { sessionId } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [session, setSession] = useState<MultiCharSession | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentNode, setCurrentNode] = useState<MultiCharNode | null>(null)
  const [displayMessages, setDisplayMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  // UI States
  const [showCharacterPanel, setShowCharacterPanel] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showNodeHub, setShowNodeHub] = useState(false)
  const [showLorebookManager, setShowLorebookManager] = useState(false)
  const [showRelationshipManager, setShowRelationshipManager] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showFocusDialog, setShowFocusDialog] = useState(false)
  const [showScenarioDialog, setShowScenarioDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showOracleViewer, setShowOracleViewer] = useState(false)
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "image" | "video" | "embed" } | null>(null)

  // Node & Focus states
  const [newNodeTitle, setNewNodeTitle] = useState("")
  const [focusCharacters, setFocusCharacters] = useState<string[]>([])
  const [inFocusMode, setInFocusMode] = useState(false)
  const [scenarioText, setScenarioText] = useState("")
  const [narratorEnabled, setNarratorEnabled] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load session data
  useEffect(() => {
    const loadedSession = getMultiCharSession(sessionId)
    if (!loadedSession) {
      toast({ title: "Error", description: "Session not found", variant: "destructive" })
      router.push("/embark-modes")
      return
    }

    setSession(loadedSession)
    setCurrentNode(loadedSession.nodes.find((n) => n.id === loadedSession.activeNodeId) || loadedSession.nodes[0])
    setScenarioText(loadedSession.scenario || "")
    setNarratorEnabled(loadedSession.narratorEnabled || false)

    const charIds = loadedSession.characterIds || []
    const loadedChars = charIds.map((id) => getCharacters().find((c) => c.id === id)).filter(Boolean) as Character[]
    setCharacters(loadedChars)

    const appSettings = getSettings()
    setSettings(appSettings)
  }, [sessionId, router, toast])

  // Update messages when node changes
  useEffect(() => {
    if (currentNode) {
      setDisplayMessages(currentNode.messages || [])
    }
  }, [currentNode])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayMessages])

  const saveSessionState = (updatedSession: MultiCharSession) => {
    setSession(updatedSession)
    saveMultiCharSession(updatedSession)
  }

  const handleUserMessage = async () => {
    if (!inputValue.trim() || isSending || !session || !currentNode || !settings) return

    // Ensure displayMessages is initialized
    const currentMessages = displayMessages || []

    const userMessage: Message = {
      id: generateId(),
      characterId: "user",
      characterName: getUserPersona()?.name || "You",
      characterAvatar: getUserPersona()?.avatar || "/placeholder.svg",
      content: inputValue.trim(),
      role: "user",
      timestamp: Date.now(),
    }

    const updatedMessages = [...currentMessages, userMessage]
    setDisplayMessages(updatedMessages)
    setInputValue("")
    setIsSending(true)

    try {
      await sendMessage(updatedMessages)
    } catch (error: any) {
      console.error("[v0] Send message error:", error)
      toast({ title: "Error", description: error.message || "Failed to send message", variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  const sendMessage = async (messages: Message[]) => {
    if (!session || !settings || !currentNode || !messages || !Array.isArray(messages)) return

    if (!settings.apiKeys?.xai && !settings.apiKeys?.openRouter) {
      throw new Error("No API keys configured. Please add an API key in settings.")
    }

    const validCharacters = characters && Array.isArray(characters) ? characters : []

    const systemPrompt = buildMultiCharacterSystemPrompt(
      validCharacters,
      session.relationshipMap || {},
      session.scenario,
    )

    const response = await fetch("/api/multi-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content, characterId: m.characterId })),
        characters: validCharacters.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          personality: c.personality,
        })),
        systemPrompt,
        modelId: session.modelId || "xai/grok-4",
        apiKeys: {
          xai: settings.apiKeys.xai,
          openRouter: settings.apiKeys.openRouter,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to get AI response")
    }

    const data = await response.json()

    const aiMessage: Message = {
      id: generateId(),
      characterId: data.characterId || validCharacters[0]?.id || "ai",
      characterName: data.characterName || validCharacters[0]?.name || "AI",
      characterAvatar: validCharacters.find((c) => c.id === data.characterId)?.avatar || "/placeholder.svg",
      content: data.content,
      role: "assistant",
      timestamp: Date.now(),
    }

    const finalMessages = [...messages, aiMessage]
    setDisplayMessages(finalMessages)

    // Save to node
    const updatedNode = { ...currentNode, messages: finalMessages, updatedAt: Date.now() }
    const updatedNodes = session.nodes.map((n) => (n.id === currentNode.id ? updatedNode : n))
    saveSessionState({ ...session, nodes: updatedNodes, updatedAt: Date.now() })
  }

  const interjectMessage = () => {
    setIsSending(false)
    toast.info("AI response interrupted")
  }

  const createNewNode = () => {
    if (!session || !newNodeTitle.trim()) return

    const newNode: MultiCharNode = {
      id: generateId(),
      title: newNodeTitle.trim(),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const updatedSession = {
      ...session,
      nodes: [...session.nodes, newNode],
      activeNodeId: newNode.id,
      updatedAt: Date.now(),
    }

    saveSessionState(updatedSession)
    setCurrentNode(newNode)
    setNewNodeTitle("")
    setShowNodeHub(false)
    toast.success("New node created")
  }

  const switchNode = (nodeId: string) => {
    if (!session) return

    const node = session.nodes.find((n) => n.id === nodeId)
    if (!node) return

    setCurrentNode(node)
    const updatedSession = { ...session, activeNodeId: nodeId, updatedAt: Date.now() }
    saveSessionState(updatedSession)
    setShowNodeHub(false)
    toast.success(`Switched to: ${node.title}`)
  }

  const deleteNode = (nodeId: string) => {
    if (!session || session.nodes.length <= 1) {
      toast.error("Cannot delete the last node")
      return
    }

    if (!confirm("Delete this node and all its messages?")) return

    const updatedNodes = session.nodes.filter((n) => n.id !== nodeId)
    const newActiveNodeId = updatedNodes[0]?.id || ""

    saveSessionState({
      ...session,
      nodes: updatedNodes,
      activeNodeId: newActiveNodeId,
      updatedAt: Date.now(),
    })

    setCurrentNode(updatedNodes[0])
    toast.success("Node deleted")
  }

  const openCharacterPanel = (char: Character) => {
    setSelectedCharacter(char)
    setShowCharacterPanel(true)
  }

  const openCharacterGallery = (char: Character, index: number) => {
    const item = char.gallery?.[index]
    if (item) {
      setViewerMedia({ url: item.url, type: "image" })
      setShowOracleViewer(true)
    }
  }

  const startFocusMode = () => {
    if (focusCharacters.length === 0) return
    setInFocusMode(true)
    setShowFocusDialog(false)
    toast.success(`Focus Mode: ${focusCharacters.length} character(s)`)
  }

  const updateScenario = () => {
    if (!session) return
    saveSessionState({ ...session, scenario: scenarioText, updatedAt: Date.now() })
    setShowScenarioDialog(false)
    toast.success("Scenario updated")
  }

  const updateModel = (modelId: string) => {
    if (!session) return
    saveSessionState({ ...session, modelId, updatedAt: Date.now() })
    toast.success("Model updated")
  }

  const toggleNarrator = () => {
    if (!session) return
    const newValue = !narratorEnabled
    setNarratorEnabled(newValue)
    saveSessionState({ ...session, narratorEnabled: newValue, updatedAt: Date.now() })
    toast.success(newValue ? "Narrator enabled" : "Narrator disabled")
  }

  const getRelationship = (charAId: string, charBId: string): string => {
    if (!session?.relationshipMap) return "Undefined"
    return (
      session.relationshipMap[`${charAId}_${charBId}`] ||
      session.relationshipMap[`${charBId}_${charAId}`] ||
      "Undefined"
    )
  }

  if (!session || !currentNode) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/embark-modes")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold truncate">{session?.title || session?.name || "PartyOracle Session"}</h1>
              <Badge variant="secondary" className="shrink-0 text-xs">
                <GitBranch className="mr-1 h-3 w-3" />
                {currentNode.title}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {characters.length} characters • {displayMessages.length} messages
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {characters.slice(0, 4).map((char) => (
              <Button
                key={char.id}
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary transition-all"
                onClick={() => openCharacterPanel(char)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={char.avatarUrl || char.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{char.name[0]}</AvatarFallback>
                </Avatar>
              </Button>
            ))}
            {characters.length > 4 && (
              <Badge variant="outline" className="h-9 w-9 rounded-full flex items-center justify-center">
                +{characters.length - 4}
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowNodeHub(true)}>
                <Network className="mr-2 h-4 w-4" />
                Node Hub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLorebookManager(true)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Lorebooks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRelationshipManager(true)}>
                <Users className="mr-2 h-4 w-4" />
                Relationships
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowScenarioDialog(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Scenario
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowModelSelector(true)}>
                <Settings className="mr-2 h-4 w-4" />
                AI Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("Delete this session?")) {
                    deleteMultiCharSession(sessionId)
                    router.push("/embark-modes")
                  }
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Begin Your Adventure</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {inFocusMode
                  ? "Focus Mode active - intimate scene with selected characters"
                  : "Start the multi-character roleplay by sending your first message"}
              </p>
            </div>
          ) : (
            displayMessages.map((msg) => {
              const isUser = msg.role === "user"
              const char = characters.find((c) => c.id === msg.characterId)

              return (
                <div key={msg.id} className={cn("group flex gap-4", isUser && "flex-row-reverse")}>
                  <button onClick={() => char && openCharacterPanel(char)} className="shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-background hover:ring-primary transition-all">
                      <AvatarImage src={msg.characterAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{msg.characterName[0]}</AvatarFallback>
                    </Avatar>
                  </button>

                  <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
                    <div className={cn("mb-1.5 flex items-center gap-2 flex-wrap", isUser && "flex-row-reverse")}>
                      <span className="font-semibold text-sm">{msg.characterName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {!isUser && (
                        <Badge variant="secondary" className="text-xs h-5">
                          AI
                        </Badge>
                      )}
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 prose prose-sm dark:prose-invert max-w-none",
                        isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm",
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        <StyledText text={msg.content} />
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 shrink-0 h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(msg.content)}>
                        Copy Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })
          )}
          {isSending && (
            <div className="flex items-center gap-4 opacity-60">
              <Avatar className="h-10 w-10 bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="mb-2 h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-16 w-full max-w-md animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isSending && (
        <div className="absolute bottom-28 right-6 z-10">
          <Button variant="destructive" size="sm" onClick={interjectMessage} className="shadow-lg">
            <Zap className="mr-2 h-4 w-4" />
            Interject
          </Button>
        </div>
      )}

      <div className="border-t bg-background/95 backdrop-blur p-4">
        <div className="mx-auto flex max-w-4xl gap-3 items-end">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isSending ? "AI is responding..." : "Type your message... (Shift+Enter for new line)"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleUserMessage()
              }
            }}
            disabled={isSending}
            className="flex-1 min-h-[56px] max-h-[200px] resize-none rounded-xl"
            rows={2}
          />
          <Button
            onClick={handleUserMessage}
            disabled={isSending || !inputValue.trim()}
            size="icon"
            className="h-14 w-14 rounded-xl shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={showNodeHub} onOpenChange={setShowNodeHub}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Network className="h-6 w-6 text-primary" />
              Node Hub
            </DialogTitle>
            <DialogDescription>Switch between conversation branches or create new ones</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(85vh-200px)] pr-4">
            <div className="grid gap-3">
              {session.nodes.map((node) => (
                <Card
                  key={node.id}
                  className={cn(
                    "p-4 cursor-pointer hover:border-primary transition-all",
                    node.id === currentNode.id && "border-primary bg-primary/5 ring-2 ring-primary/20",
                  )}
                  onClick={() => switchNode(node.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{node.title}</h4>
                        {node.id === currentNode.id && (
                          <Badge variant="default" className="shrink-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {node.messages.length} messages • Updated {new Date(node.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {node.id !== currentNode.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNode(node.id)
                        }}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={newNodeTitle}
              onChange={(e) => setNewNodeTitle(e.target.value)}
              placeholder="New node title..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && newNodeTitle.trim()) {
                  createNewNode()
                }
              }}
              className="flex-1"
            />
            <Button onClick={createNewNode} disabled={!newNodeTitle.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Character Panel Dialog */}
      {selectedCharacter && (
        <Dialog open={showCharacterPanel} onOpenChange={setShowCharacterPanel}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedCharacter.avatarUrl || selectedCharacter.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedCharacter.name[0]}</AvatarFallback>
                </Avatar>
                {selectedCharacter.name}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCharacter.description || "No description available"}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Personality</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCharacter.personality || "No personality defined"}
                  </p>
                </div>
                {selectedCharacter.scenario && (
                  <div>
                    <h4 className="mb-2 font-semibold">Scenario</h4>
                    <p className="text-sm text-muted-foreground">{selectedCharacter.scenario}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="gallery">
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCharacter.gallery && selectedCharacter.gallery.length > 0 ? (
                      selectedCharacter.gallery.map((item, idx) => (
                        <Card
                          key={idx}
                          className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => openCharacterGallery(selectedCharacter, idx)}
                        >
                          <CardContent className="p-0">
                            <img
                              src={item.url || "/placeholder.svg"}
                              alt={`Gallery ${idx + 1}`}
                              className="h-48 w-full object-cover"
                            />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 py-12 text-center text-muted-foreground">No gallery items</div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Messages in Session</h4>
                  <p className="text-2xl font-bold">
                    {displayMessages.filter((m) => m.characterId === selectedCharacter.id).length}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Relationships</h4>
                  <div className="space-y-2">
                    {characters
                      .filter((c) => c.id !== selectedCharacter.id)
                      .map((c) => {
                        const rel = getRelationship(selectedCharacter.id, c.id)
                        return (
                          <div key={c.id} className="flex items-center justify-between">
                            <span className="text-sm">{c.name}</span>
                            <span className="text-sm text-muted-foreground">{rel || "Undefined"}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Relationship Manager Dialog */}
      <Dialog open={showRelationshipManager} onOpenChange={setShowRelationshipManager}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Character Relationships</DialogTitle>
            <DialogDescription>Define how characters relate to each other in this session</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {characters.map((charA, idxA) =>
              characters.slice(idxA + 1).map((charB) => {
                const relationshipKey = `${charA.id}_${charB.id}`
                const currentRelation = session?.relationshipMap?.[relationshipKey] || ""

                return (
                  <Card key={relationshipKey}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage src={charA.avatarUrl || charA.avatar} />
                          <AvatarFallback>{charA.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{charA.name}</span>
                        <ArrowRight className="h-4 w-4" />
                        <Avatar>
                          <AvatarImage src={charB.avatarUrl || charB.avatar} />
                          <AvatarFallback>{charB.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{charB.name}</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship Type</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Sister",
                            "Brother",
                            "Mother",
                            "Father",
                            "Daughter",
                            "Son",
                            "Wife",
                            "Husband",
                            "Partner",
                            "Friend",
                            "Best Friend",
                            "Rival",
                            "Enemy",
                            "Stranger",
                            "Colleague",
                            "Mentor",
                            "Student",
                            "Lover",
                            "Ex-Lover",
                          ].map((type) => (
                            <Badge
                              key={type}
                              variant={
                                currentRelation.toLowerCase().includes(type.toLowerCase()) ? "default" : "outline"
                              }
                              className="cursor-pointer"
                              onClick={() => {
                                if (!session) return
                                const updatedMap = {
                                  ...session.relationshipMap,
                                  [relationshipKey]: type,
                                }
                                const updatedSession = {
                                  ...session,
                                  relationshipMap: updatedMap,
                                  updatedAt: Date.now(),
                                }
                                saveSessionState(updatedSession)
                              }}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Or enter custom relationship..."
                          value={currentRelation}
                          onChange={(e) => {
                            if (!session) return
                            const updatedMap = {
                              ...session.relationshipMap,
                              [relationshipKey]: e.target.value,
                            }
                            const updatedSession = {
                              ...session,
                              relationshipMap: updatedMap,
                              updatedAt: Date.now(),
                            }
                            setSession(updatedSession)
                          }}
                          onBlur={() => session && saveMultiCharSession(session)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              }),
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lorebook Manager Dialog */}
      <Dialog open={showLorebookManager} onOpenChange={setShowLorebookManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Lorebooks</DialogTitle>
            <DialogDescription>Select lorebooks to provide context for this roleplay session</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {getLorebooks().map((lorebook) => {
                const isAttached = session?.attachedLorebookIds?.includes(lorebook.id)
                return (
                  <Card
                    key={lorebook.id}
                    className={cn("cursor-pointer transition-all", isAttached && "border-primary")}
                    onClick={() => {
                      if (!session) return
                      const currentIds = session.attachedLorebookIds || []
                      const updatedIds = isAttached
                        ? currentIds.filter((id) => id !== lorebook.id)
                        : [...currentIds, lorebook.id]
                      const updatedSession = {
                        ...session,
                        attachedLorebookIds: updatedIds,
                        updatedAt: Date.now(),
                      }
                      saveSessionState(updatedSession)
                      toast.success(isAttached ? "Lorebook removed" : "Lorebook attached")
                    }}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Input
                        type="checkbox"
                        checked={isAttached}
                        onChange={(e) => {
                          if (!session) return
                          const currentIds = session.attachedLorebookIds || []
                          const updatedIds = e.target.checked
                            ? [...currentIds, lorebook.id]
                            : currentIds.filter((id) => id !== lorebook.id)
                          const updatedSession = {
                            ...session,
                            attachedLorebookIds: updatedIds,
                            updatedAt: Date.now(),
                          }
                          saveSessionState(updatedSession)
                          toast.success(e.target.checked ? "Lorebook attached" : "Lorebook removed")
                        }}
                        className="shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{lorebook.name}</h4>
                        <p className="text-sm text-muted-foreground">{lorebook.description}</p>
                      </div>
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Scenario Dialog */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              Edit Scenario
            </DialogTitle>
            <DialogDescription>Set the context and mood for your roleplay</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scenario">Scenario Description</Label>
              <Textarea
                id="scenario"
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                placeholder="Describe the setting, situation, and mood..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScenarioDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateScenario}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Model Selector */}
      {showModelSelector && (
        <ModelSelectorDialog
          open={showModelSelector}
          onOpenChange={setShowModelSelector}
          currentModel={session.modelId || ""}
          onSelectModel={updateModel}
        />
      )}

      {/* OracleViewer */}
      {showOracleViewer && viewerMedia && (
        <OracleViewer media={viewerMedia} onClose={() => setShowOracleViewer(false)} />
      )}
    </div>
  )
}
