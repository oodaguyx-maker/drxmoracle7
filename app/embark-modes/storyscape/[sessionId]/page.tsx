"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Send, BookOpen, MapPin, RotateCcw, Save, Eye } from "lucide-react"
import { toast } from "sonner"
import {
  getStoryScapeSession,
  updateStoryScapeSession,
  getStoryScript,
  createStoryCheckpoint,
  loadStoryCheckpoint,
  completeChapter,
  type StoryScapeSession,
  type StoryScript,
} from "@/lib/storyscape-storage"
import { StyledText } from "@/lib/onomatopoeia-styler"

export default function StoryScapeSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<StoryScapeSession | null>(null)
  const [script, setScript] = useState<StoryScript | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckpoints, setShowCheckpoints] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      const loadedSession = await getStoryScapeSession(sessionId)
      if (!loadedSession) {
        router.push("/embark-modes/storyscape")
        return
      }
      setSession(loadedSession)

      const loadedScript = await getStoryScript(loadedSession.scriptId)
      if (!loadedScript) {
        router.push("/embark-modes/storyscape")
        return
      }
      setScript(loadedScript)
    }
    loadData()
  }, [sessionId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [session?.messages])

  const getCurrentChapter = () => {
    if (!script || !session) return null
    return script.chapters.find((c) => c.id === session.currentChapterId)
  }

  const saveCheckpoint = async () => {
    if (!session) return
    const name = prompt("Name this checkpoint:")
    if (!name?.trim()) return

    const checkpoint = await createStoryCheckpoint(sessionId, name.trim())
    toast.success("Checkpoint saved", { description: name.trim() })

    // Reload session to get updated checkpoints
    const updated = await getStoryScapeSession(sessionId)
    if (updated) setSession(updated)
  }

  const loadCheckpoint = async (checkpointId: string) => {
    const restored = await loadStoryCheckpoint(sessionId, checkpointId)
    if (restored) {
      setSession(restored)
      toast.success("Checkpoint restored")
      setShowCheckpoints(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !session || !script) return

    const chapter = getCurrentChapter()
    if (!chapter) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: message.trim(),
      timestamp: Date.now(),
      speaker: "You",
    }

    const updatedMessages = [...session.messages, userMessage]
    const tempSession = { ...session, messages: updatedMessages }
    setSession(tempSession)
    setMessage("")
    setIsLoading(true)

    try {
      const apiKey = localStorage.getItem("openrouter_api_key") || ""

      // Build narrative context
      const narrativeContext = `Story: ${script.title}
Genre: ${script.genre}
Current Chapter: ${chapter.order}. ${chapter.title}
Chapter Goal: ${chapter.goal}

Main Characters:
${script.mainCharacters.map((c) => `- ${c.name}: ${c.description}`).join("\n")}

Chapter Summary: ${chapter.content}

You are the Narrative AI Director. Guide the story based on the user's actions while staying true to the chapter's goal and the overall narrative arc. Create dynamic NPCs as needed. Respond in character and advance the story naturally.`

      const response = await fetch("/api/storyscape-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          model: session.modelId || "openai/gpt-4o",
          apiKey,
          narrativeContext,
          chapterId: chapter.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader")

      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "",
        timestamp: Date.now() + 1,
        speaker: "Narrator",
      }

      tempSession.messages.push(assistantMessage)
      setSession({ ...tempSession })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const content = JSON.parse(line.slice(2))
            assistantContent += content
            assistantMessage.content = assistantContent
            setSession({ ...tempSession })
          }
        }
      }

      // Check for chapter completion keywords
      const completionKeywords = ["chapter complete", "end of chapter", "chapter concluded"]
      if (completionKeywords.some((k) => assistantContent.toLowerCase().includes(k))) {
        const shouldComplete = confirm("This chapter seems complete. Mark it as finished and move to the next chapter?")
        if (shouldComplete) {
          await handleCompleteChapter()
        }
      }

      await updateStoryScapeSession(sessionId, tempSession)
    } catch (error) {
      console.error("[v0] StoryScape send error:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteChapter = async () => {
    if (!session || !script) return

    const chapter = getCurrentChapter()
    if (!chapter) return

    const summary = prompt("Enter a brief summary of what happened in this chapter:")
    if (!summary?.trim()) return

    const nextChapter = script.chapters.find((c) => c.order === chapter.order + 1)

    if (!nextChapter) {
      // Story complete
      toast.success("Story Complete!", { description: "You've reached the end of this tale." })
      const saveAsLore = confirm("Save this completed story as lore?")
      if (saveAsLore) {
        // TODO: Implement save as lore
        toast.success("Story saved to lore")
      }
      return
    }

    const updated = await completeChapter(sessionId, chapter.id, summary.trim(), nextChapter.id)
    if (updated) {
      setSession(updated)
      toast.success("Chapter completed", { description: `Now starting: ${nextChapter.title}` })
    }
  }

  const chapter = getCurrentChapter()
  const chapterProgress = script ? ((chapter?.order || 0) / script.chapters.length) * 100 : 0

  if (!session || !script || !chapter) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.push("/embark-modes/storyscape")} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="font-bold text-xl mb-1">{script.title}</h2>
          <Badge variant="outline" className="mb-3">
            {script.genre}
          </Badge>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {chapter.order} / {script.chapters.length}
              </span>
            </div>
            <Progress value={chapterProgress} className="h-2" />
          </div>
        </div>

        {/* Current Chapter Info */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Chapter {chapter.order}</h3>
          </div>
          <h4 className="font-medium mb-2">{chapter.title}</h4>
          <p className="text-sm text-muted-foreground">{chapter.goal}</p>
        </div>

        {/* Characters */}
        <div className="flex-1 overflow-hidden">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm">Characters</h3>
          </div>
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {script.mainCharacters.map((char) => (
                <Card key={char.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{char.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{char.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{char.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="p-3 border-t space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={saveCheckpoint}>
            <Save className="h-4 w-4 mr-2" />
            Save Checkpoint
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-transparent"
            onClick={() => setShowCheckpoints(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Load Checkpoint
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-transparent"
            onClick={() => setShowSummary(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Chapter Summaries
          </Button>
          <Button
            variant="default"
            size="sm"
            className="w-full justify-start bg-primary"
            onClick={handleCompleteChapter}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Complete Chapter
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <h1 className="text-2xl font-bold">{chapter.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chapter {chapter.order} of {script.chapters.length}
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Chapter opening */}
            {session.messages.filter((m) => m.chapterId === chapter.id).length === 0 && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <p className="text-sm italic">{chapter.content}</p>
              </Card>
            )}

            {session.messages
              .filter((m) => !m.chapterId || m.chapterId === chapter.id)
              .map((msg) => (
                <Card key={msg.id} className={`p-4 ${msg.role === "user" ? "ml-auto max-w-[80%] bg-primary/10" : ""}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{msg.speaker[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{msg.speaker}</p>
                      <StyledText text={msg.content} />
                    </div>
                  </div>
                </Card>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-muted/30">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you do next?..."
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Checkpoints Dialog */}
      <Dialog open={showCheckpoints} onOpenChange={setShowCheckpoints}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Checkpoint</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {session.checkpoints.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No checkpoints saved yet</p>
              ) : (
                session.checkpoints.map((cp) => (
                  <Card
                    key={cp.id}
                    className="p-4 cursor-pointer hover:border-primary"
                    onClick={() => loadCheckpoint(cp.id)}
                  >
                    <p className="font-medium">{cp.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(cp.timestamp).toLocaleString()}</p>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Chapter Summaries Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chapter Summaries</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-4">
              {script.chapters.map((ch) => {
                const summary = session.chapterSummaries[ch.id]
                const isComplete = !!summary
                const isCurrent = ch.id === session.currentChapterId

                return (
                  <Card key={ch.id} className={`p-4 ${isCurrent ? "border-primary" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          Chapter {ch.order}: {ch.title}
                        </h4>
                        {isCurrent && <Badge className="mt-1">Current</Badge>}
                      </div>
                      {isComplete && <Badge variant="outline">Complete</Badge>}
                    </div>
                    {summary ? (
                      <p className="text-sm text-muted-foreground">{summary}</p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">Not yet completed</p>
                    )}
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
