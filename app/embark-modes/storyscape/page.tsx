"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Plus, Play, Edit, Clock, Target, Sparkles } from "lucide-react"
import {
  getStories,
  getSessions,
  saveSession,
  generateId,
  type StoryScapeStory,
  type StoryScapeSession,
} from "@/lib/storyscape-storage"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const GENRE_COLORS = {
  fantasy: "from-purple-500/20 to-pink-500/20",
  modern: "from-blue-500/20 to-cyan-500/20",
  "sci-fi": "from-cyan-500/20 to-indigo-500/20",
  "post-apocalypse": "from-orange-500/20 to-red-500/20",
  horror: "from-red-500/20 to-gray-500/20",
  mystery: "from-indigo-500/20 to-purple-500/20",
  romance: "from-pink-500/20 to-rose-500/20",
  historical: "from-amber-500/20 to-orange-500/20",
}

export default function StoryScapePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stories, setStories] = useState<StoryScapeStory[]>([])
  const [sessions, setSessions] = useState<StoryScapeSession[]>([])
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false)
  const [selectedStoryId, setSelectedStoryId] = useState<string>("")
  const [sessionName, setSessionName] = useState("")

  useEffect(() => {
    setStories(getStories())
    setSessions(getSessions())
  }, [])

  const handleCreateSession = () => {
    if (!selectedStoryId || !sessionName.trim()) {
      toast.error("Please select a story and enter a session name")
      return
    }

    const story = stories.find((s) => s.id === selectedStoryId)
    if (!story) return

    const newSession: StoryScapeSession = {
      id: generateId(),
      userId: user?.uid || "guest",
      storyId: selectedStoryId,
      sessionName: sessionName.trim(),
      currentChapterNumber: 1,
      chapterSummaries: [],
      characterStates: story.mainCharacters.reduce(
        (acc, char) => {
          acc[char.id] = { ...char.initialState }
          return acc
        },
        {} as Record<string, any>,
      ),
      worldState: {},
      decisionsMade: [],
      messages: [],
      status: "in_progress",
      playtimeMinutes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveSession(newSession)
    toast.success("Session created! Starting your story...")
    router.push(`/embark-modes/storyscape/${newSession.id}`)
  }

  const continueSession = (sessionId: string) => {
    router.push(`/embark-modes/storyscape/${sessionId}`)
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
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3">
            <BookOpen className="size-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">StoryScape</h1>
            <p className="text-muted-foreground">Guided narrative adventures with dynamic paths</p>
          </div>
        </div>
        <Button onClick={() => router.push("/embark-modes/storyscape/editor")} className="gap-2">
          <Plus className="size-4" />
          Create Story
        </Button>
      </div>

      {sessions.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Continue Your Adventure</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions
              .filter((s) => s.status === "in_progress")
              .map((session) => {
                const story = stories.find((st) => st.id === session.storyId)
                if (!story) return null

                return (
                  <Card
                    key={session.id}
                    className="group cursor-pointer transition-all hover:border-primary/50"
                    onClick={() => continueSession(session.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{session.sessionName}</CardTitle>
                          <CardDescription>{story.title}</CardDescription>
                        </div>
                        <Badge variant="outline">{story.genre}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="size-4" />
                        Chapter {session.currentChapterNumber}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        {session.playtimeMinutes} minutes played
                      </div>
                      <Button className="w-full mt-3" size="sm">
                        <Play className="size-4 mr-2" />
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Stories</h2>
        {stories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="mb-4 size-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground mb-3">
                No stories created yet.
                <br />
                Create your first story in the Story Script Editor!
              </p>
              <Button onClick={() => router.push("/embark-modes/storyscape/editor")} className="gap-2">
                <Sparkles className="size-4" />
                Create Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Card
                key={story.id}
                className={`group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${GENRE_COLORS[story.genre]} opacity-50`} />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">{story.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/embark-modes/storyscape/editor?id=${story.id}`)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{story.genre}</Badge>
                    <Badge variant="outline">{story.difficulty}</Badge>
                    <Badge variant="outline">{story.estimatedDuration}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{story.mainCharacters.length} main characters</div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedStoryId(story.id)
                      setSessionName(`${story.title} - ${new Date().toLocaleDateString()}`)
                      setShowNewSessionDialog(true)
                    }}
                  >
                    <Play className="size-4 mr-2" />
                    Start New Journey
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New StoryScape Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-name">Session Name</Label>
              <Input
                id="session-name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="My Epic Adventure"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>
                <Play className="size-4 mr-2" />
                Begin Story
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
