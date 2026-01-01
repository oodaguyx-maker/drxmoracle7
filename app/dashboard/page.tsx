"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCharacters, getNodes, getSettings } from "@/lib/storage"
import { getUserStats, getAchievementProgress } from "@/lib/achievements"
import { useRouter } from "next/navigation"
import { AI_MODELS } from "@/lib/ai-providers"
import Image from "next/image"
import { Trophy } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    characters: 0,
    conversations: 0,
    activeModel: "Grok 4",
  })
  const [achievementStats, setAchievementStats] = useState({ total: 0, unlocked: 0, percentage: 0 })
  const [userStats, setUserStats] = useState<ReturnType<typeof getUserStats> | null>(null)

  useEffect(() => {
    const characters = getCharacters()
    const nodes = getNodes()
    const settings = getSettings()
    const model = AI_MODELS.find((m) => m.id === settings.defaultModel)

    setStats({
      characters: characters.length,
      conversations: nodes.length,
      activeModel: model?.name || "Grok 4",
    })

    const progress = getAchievementProgress()
    const user = getUserStats()
    setAchievementStats(progress)
    setUserStats(user)

    const shouldShowPWA = sessionStorage.getItem("pwa_show_after_login")
    if (shouldShowPWA === "true") {
      console.log("[v0] Dashboard loaded after login - PWA prompt will show")
    }
  }, [])

  return (
    <div className="min-h-screen space-y-6 p-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-1 backdrop-blur-sm overflow-hidden animate-float border border-accent/20">
          <Image
            src="https://files.catbox.moe/4z7bjg.jpg"
            alt="Dreamweaver Oracle Engine"
            width={64}
            height={64}
            className="object-cover rounded-xl"
          />
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Dreamweaver: Oracle Engine
          </h1>
          <p className="text-muted-foreground">Welcome to your mystical roleplay realm</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Characters</CardTitle>
            <svg className="size-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.characters}</div>
            <p className="text-xs text-muted-foreground">Total characters created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <svg className="size-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversations}</div>
            <p className="text-xs text-muted-foreground">Active conversation nodes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/oodaboard")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="size-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{achievementStats.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {achievementStats.unlocked} / {achievementStats.total} unlocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Model</CardTitle>
            <svg className="size-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold">{stats.activeModel}</div>
            <p className="text-xs text-muted-foreground">Current AI model</p>
          </CardContent>
        </Card>
      </div>

      {userStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <span className="text-2xl text-primary">🔥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Longest: {userStats.longestStreak} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <span className="text-2xl text-accent">💬</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.messagesSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{userStats.totalWords.toLocaleString()} words written</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <span className="text-2xl text-primary">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.sessionsCompleted}</div>
              <p className="text-xs text-muted-foreground">{userStats.scenesCompleted} scenes</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your roleplay engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => router.push("/characters")} className="w-full justify-start" variant="outline">
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Character
            </Button>
            <Button onClick={() => router.push("/characters")} className="w-full justify-start" variant="outline">
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import Character
            </Button>
            <Button onClick={() => router.push("/loreworld")} className="w-full justify-start" variant="outline">
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Manage Lore
            </Button>
            <Button onClick={() => router.push("/oodaboard")} className="w-full justify-start" variant="outline">
              <Trophy className="mr-2 size-4" />
              View Achievements
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Learn how to use the roleplay engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Create or import a character from ChubAI or SillyTavern format</p>
            <p>2. Select the character and create a new conversation node</p>
            <p>3. Start chatting with your AI-powered character</p>
            <p>4. Use LoreWorld to add context and backstory</p>
            <p>5. Track your progress and unlock achievements in OodaBoard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
