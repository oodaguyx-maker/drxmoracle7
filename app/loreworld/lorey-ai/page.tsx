"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getLorebooks,
  getLorebook,
  getSettings,
  generateId,
  saveProposedLoreCard,
  getProposedLoreCards,
  deleteProposedLoreCard,
  saveLoreEntry,
  addEntryToLorebook,
  getLoreyConversations,
  saveLoreyConversation,
  getLoreEntries,
  type Lorebook,
  type ProposedLoreCard,
  type LoreyConversation,
} from "@/lib/storage"
import { saveProposedLoreCardToSupabase, deleteProposedLoreCardFromSupabase } from "@/lib/supabase-lore"
import { ArrowLeft, Send, Sparkles, Bot, User, Check, X, Loader2, BookOpen, Edit3, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

const LOREY_MODEL = "groq/llama-3.3-70b-versatile"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

function LoreyAIContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const preselectedLorebookId = searchParams.get("lorebookId")

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(generateId())
  const [currentConversation, setCurrentConversation] = useState<LoreyConversation | null>(null)
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [selectedLorebookId, setSelectedLorebookId] = useState<string>(preselectedLorebookId || "")
  const [proposedCards, setProposedCards] = useState<ProposedLoreCard[]>([])
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadConversationForLorebook = (lorebookId: string) => {
    const conversations = getLoreyConversations()
    const existingConversation = conversations.find(c => c.lorebookId === lorebookId)

    if (existingConversation) {
      setCurrentConversation(existingConversation)
      setMessages(existingConversation.messages)
    } else {
      const lorebook = getLorebook(lorebookId)
      if (lorebook) {
        const welcomeMessage: Message = {
          role: "assistant",
          content: `Hi! I'm LoreyAI, ready to help you build "${lorebook.name}". You can ask me to:\n\n• Create new lore entries\n• Expand existing concepts\n• Organize and categorize lore\n• Generate ideas and connections\n• Edit or refine entries\n\nWhat would you like to work on?`,
          timestamp: Date.now(),
        }
        const newConversation: LoreyConversation = {
          id: conversationId,
          lorebookId,
          messages: [welcomeMessage],
          generatedEntries: [],
          createdAt: Date.now(),
        }
        setCurrentConversation(newConversation)
        setMessages([welcomeMessage])
      }
    }
  }

  useEffect(() => {
    const books = getLorebooks()
    setLorebooks(books)

    if (preselectedLorebookId && books.find((b) => b.id === preselectedLorebookId)) {
      setSelectedLorebookId(preselectedLorebookId)
      loadConversationForLorebook(preselectedLorebookId)
    }

    loadProposedCards()
  }, [preselectedLorebookId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const loadProposedCards = () => {
    const cards = getProposedLoreCards().filter((c) => c.conversationId === conversationId)
    setProposedCards(cards)
  }

  const handleLorebookChange = (lorebookId: string) => {
    setSelectedLorebookId(lorebookId)
    if (lorebookId) {
      loadConversationForLorebook(lorebookId)
    } else {
      setMessages([])
      setCurrentConversation(null)
    }
  }

  const handleNewConversation = () => {
    if (!selectedLorebookId) return

    const newConvId = generateId()
    setConversationId(newConvId)

    const lorebook = getLorebook(selectedLorebookId)
    if (lorebook) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Hi! I'm LoreyAI, ready to help you build "${lorebook.name}". You can ask me to:\n\n• Create new lore entries\n• Expand existing concepts\n• Organize and categorize lore\n• Generate ideas and connections\n• Edit or refine entries\n\nWhat would you like to work on?`,
        timestamp: Date.now(),
      }
      const newConversation: LoreyConversation = {
        id: newConvId,
        lorebookId: selectedLorebookId,
        messages: [welcomeMessage],
        generatedEntries: [],
        createdAt: Date.now(),
      }
      setCurrentConversation(newConversation)
      setMessages([welcomeMessage])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (!selectedLorebookId) {
      toast.error("Please select a lorebook first")
      return
    }

    const settings = getSettings()
    if (!settings.apiKeys.openRouter) {
      toast.error("Please set your OpenRouter API key in Settings")
      router.push("/settings")
      return
    }

    const userMsg: Message = { role: "user", content: input, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    const selectedLorebook = getLorebook(selectedLorebookId)
    const lorebookContext = selectedLorebook
      ? `\n\nYou are currently working on the lorebook "${selectedLorebook.name}": ${selectedLorebook.description || "No description"}\nIt currently has ${selectedLorebook.entries?.length || 0} entries.`
      : ""

    // Get existing lore entries for context
    const existingLore = selectedLorebookId ? getLoreEntries().filter(entry =>
      selectedLorebook?.entries?.includes(entry.id)
    ) : []

    const loreMemory = existingLore.length > 0
      ? `\n\nEXISTING LORE ENTRIES (for reference and continuity):\n${existingLore.slice(0, 5).map(entry =>
          `- ${entry.name}: ${entry.content.substring(0, 100)}...`
        ).join('\n')}`
      : ""

    const systemPrompt = "You are LoreyAI, an expert world-building assistant. Help users develop rich lore through natural conversation." + lorebookContext + loreMemory + `

When creating lore entries, use this format:
[LORE_CARD]
NAME: [Entry name]
CATEGORY: [Category]
CONTENT: [Description]
[/LORE_CARD]`

    try {
      const response = await fetch("/api/lorey-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          apiKey: settings.apiKeys.openRouter,
          systemPrompt,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.slice(6))
                if (json.content) {
                  fullContent += json.content
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    if (newMessages[newMessages.length - 1]?.role === "assistant") {
                      newMessages[newMessages.length - 1].content = fullContent
                    } else {
                      newMessages.push({ role: "assistant", content: fullContent, timestamp: Date.now() })
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const cardRegex = /\[LORE_CARD\]([\s\S]*?)\[\/LORE_CARD\]/g
      const matches = [...fullContent.matchAll(cardRegex)]

      for (const match of matches) {
        const cardText = match[1]
        const card = parseLoreCardText(cardText)
        if (card) {
          const proposedCard: ProposedLoreCard = {
            ...card,
            id: generateId(),
            conversationId,
            timestamp: Date.now(),
          }
          saveProposedLoreCard(proposedCard)
          try {
            if (user) {
              await saveProposedLoreCardToSupabase(proposedCard)
            } else {
              console.warn("[v0] Skipping Supabase save: User not authenticated")
            }
          } catch (err) {
            console.error("Failed to save to Supabase:", err)
          }
        }
      }

      loadProposedCards()

      // Save conversation with updated messages
      if (currentConversation) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...messages, userMsg, { role: "assistant", content: fullContent, timestamp: Date.now() }],
        }
        saveLoreyConversation(updatedConversation)
        setCurrentConversation(updatedConversation)
      }
    } catch (error) {
      console.error("Chat error:", error)
      toast.error("Failed to get response")
    } finally {
      setIsLoading(false)
    }
  }

  const parseLoreCardText = (text: string): Omit<ProposedLoreCard, "id" | "conversationId" | "timestamp"> | null => {
    try {
      const lines = text.split("\n").map((l) => l.trim())
      const data: any = {}

      for (const line of lines) {
        if (line.includes(":")) {
          const [key, ...valueParts] = line.split(":")
          const value = valueParts.join(":").trim()
          const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_")
          data[normalizedKey] = value
        }
      }

      if (!data.name || !data.content) return null

      return {
        name: data.name,
        content: data.content,
        keys: data.keys?.split(",").map((k: string) => k.trim()) || [],
        importance: (data.importance as any) || "medium",
        category: data.category,
        subcategory: data.subcategory,
        entryType: data.entry_type,
        tags: data.tags?.split(",").map((t: string) => t.trim()) || [],
      }
    } catch {
      return null
    }
  }

  const handleAcceptCard = (card: ProposedLoreCard) => {
    if (!selectedLorebookId) {
      toast.error("Please select a lorebook first")
      return
    }

    try {
      const newEntryId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : generateId()

      const entry = {
        id: newEntryId,
        name: card.name,
        content: card.content,
        keys: card.keys,
        importance: card.importance,
        category: card.category,
        subcategory: card.subcategory,
        entryType: card.entryType,
        tags: card.tags,
        lorebookId: selectedLorebookId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      saveLoreEntry(entry)
      addEntryToLorebook(selectedLorebookId, entry.id)

      if (user) {
        saveProposedLoreCardToSupabase(entry).catch((err) => {
          console.error("Failed to sync to Supabase:", err)
          toast.error("Saved locally but sync failed")
        })
      }

      deleteProposedLoreCard(card.id)

      if (user) {
        deleteProposedLoreCardFromSupabase(card.id).catch((err) => {
          console.error("Failed to delete card from Supabase:", err)
        })
      }

      toast.success(`Added "${card.name}" to lorebook!`)
      loadProposedCards()
    } catch (error) {
      console.error("Failed to accept card:", error)
      toast.error("Failed to accept card")
    }
  }

  const handleRejectCard = (card: ProposedLoreCard) => {
    deleteProposedLoreCard(card.id)

    if (user) {
      deleteProposedLoreCardFromSupabase(card.id).catch((err) => {
        console.error("Failed to delete card from Supabase:", err)
      })
    }

    toast.success("Lore card rejected")
    loadProposedCards()
  }

  const handleEditCard = (card: ProposedLoreCard) => {
    setInput(`Please revise this lore entry:\n\nName: ${card.name}\nContent: ${card.content}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-purple-500/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-sm px-4 py-4">
        <div className="container mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border/50" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(selectedLorebookId ? `/loreworld/${selectedLorebookId}` : "/loreworld")}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              LoreWorld
            </Button>
            <Sparkles className="h-8 w-8 text-purple-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                LoreyAI
              </h1>
              <p className="text-sm text-muted-foreground">Your World-Building Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedLorebookId} onValueChange={handleLorebookChange}>
              <SelectTrigger className="w-[250px]">
                <BookOpen className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select Lorebook" />
              </SelectTrigger>
              <SelectContent>
                {lorebooks.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLorebookId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                className="gap-2"
                title="Start New Conversation"
              >
                <RotateCcw className="h-4 w-4" />
                New Chat
              </Button>
            )}
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Online
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col min-h-[600px] lg:min-h-[calc(100vh-200px)]">
          <Card className="flex-1 flex flex-col gloss-card">
            <ScrollArea className="flex-1 p-4 h-[500px] lg:h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                    <h3 className="text-xl font-semibold mb-2">Welcome to LoreyAI!</h3>
                    <p className="text-muted-foreground mb-4">
                      I'm here to help you build amazing worlds. Select a lorebook above and tell me your ideas!
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1 max-w-md mx-auto text-left">
                      <p className="font-semibold text-foreground mb-2">Try asking me to:</p>
                      <p>• "Create a lore entry about an ancient temple"</p>
                      <p>• "Generate 3 factions for my world"</p>
                      <p>• "Expand on the magic system"</p>
                      <p>• "Add details about the capital city"</p>
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && <Bot className="h-8 w-8 text-purple-500 shrink-0" />}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content.replace(/\[LORE_CARD\][\s\S]*?\[\/LORE_CARD\]/g, "")}
                      </p>
                    </div>
                    {msg.role === "user" && <User className="h-8 w-8 text-foreground shrink-0" />}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <Bot className="h-8 w-8 text-purple-500 shrink-0" />
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/40">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Describe your world, ask for ideas, or request lore entries... (Shift+Enter for new line)"
                  rows={3}
                  className="resize-none whitespace-pre-wrap"
                  disabled={!selectedLorebookId}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || !selectedLorebookId}
                  size="icon"
                  className="shrink-0 h-auto"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              {!selectedLorebookId && (
                <p className="text-xs text-destructive mt-2">Please select a lorebook to start chatting</p>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col min-h-[600px] lg:min-h-[calc(100vh-200px)]">
          <Card className="flex-1 flex flex-col gloss-card">
            <div className="p-4 border-b border-border/40 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Proposed Lore Cards
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Review and accept AI suggestions</p>
                </div>
                <Badge variant="secondary">{proposedCards.length}</Badge>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4 h-[500px] lg:h-[calc(100vh-300px)]">
              {proposedCards.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No proposals yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask LoreyAI to create lore entries</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposedCards.map((card) => (
                    <Card key={card.id} className="gloss-flat border-purple-500/20">
                      <div className="p-3 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm leading-tight break-words flex-1">{card.name}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                            className="shrink-0 h-6 w-6 p-0"
                          >
                            {expandedCard === card.id ? "−" : "+"}
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {card.category && (
                            <Badge variant="outline" className="text-xs bg-accent/5">
                              {card.category}
                            </Badge>
                          )}
                          {card.importance && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                card.importance === "critical"
                                  ? "bg-red-500/20 text-red-300"
                                  : card.importance === "high"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : card.importance === "medium"
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "bg-slate-500/20 text-slate-300"
                              }`}
                            >
                              {card.importance}
                            </Badge>
                          )}
                        </div>

                        {expandedCard === card.id ? (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                              {card.content}
                            </p>
                            {card.keys && card.keys.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground mr-1">Keywords:</span>
                                {card.keys.map((key, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {key}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap break-words leading-relaxed">
                            {card.content}
                          </p>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptCard(card)}
                            className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCard(card)}
                            className="border border-border/50 hover:bg-accent"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectCard(card)}
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoreyAIPage() {
  return (
    <Suspense fallback={null}>
      <LoreyAIContent />
    </Suspense>
  )
}
