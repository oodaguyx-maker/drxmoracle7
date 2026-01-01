"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  type Achievement,
  type UserStats,
  getUserStats,
  getAchievements,
  getAchievementProgress,
} from "@/lib/achievements"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Target, Sparkles, Users, Zap, Crown } from "lucide-react"

export default function OodaBoard() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [progress, setProgress] = useState({ total: 0, unlocked: 0, percentage: 0 })
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const loadedStats = getUserStats()
    const loadedAchievements = getAchievements()
    const loadedProgress = getAchievementProgress()

    setStats(loadedStats)
    setAchievements(loadedAchievements)
    setProgress(loadedProgress)
  }, [])

  const filteredAchievements =
    selectedCategory === "all" ? achievements : achievements.filter((a) => a.category === selectedCategory)

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "common":
        return "bg-gray-500"
      case "uncommon":
        return "bg-green-500"
      case "rare":
        return "bg-blue-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case "common":
        return "shadow-[0_0_20px_rgba(156,163,175,0.5)]"
      case "uncommon":
        return "shadow-[0_0_20px_rgba(34,197,94,0.5)]"
      case "rare":
        return "shadow-[0_0_20px_rgba(59,130,246,0.5)]"
      case "legendary":
        return "shadow-[0_0_20px_rgba(234,179,8,0.5)]"
      default:
        return ""
    }
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading achievements...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="gloss-interactive">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 text-platinum">
                <Trophy className="w-10 h-10 text-yellow-500" />
                OodaBoard
              </h1>
              <p className="text-muted-foreground mt-1">Track your achievements, stats, and unlock rewards</p>
            </div>
          </div>

          <Card className="gloss-card border-primary/30">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">{progress.percentage}%</div>
                <div className="text-sm text-muted-foreground">
                  {progress.unlocked} / {progress.total} Unlocked
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="gloss-card border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messagesSent.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="gloss-card border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Characters Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.charactersCreated}</div>
            </CardContent>
          </Card>

          <Card className="gloss-card border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">🔥 {stats.currentStreak} days</div>
            </CardContent>
          </Card>

          <Card className="gloss-card border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sessionsCompleted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Tabs defaultValue="achievements" className="mb-8">
          <TabsList className="gloss-card mb-6">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
            <TabsTrigger value="perks">Active Perks</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="gloss-interactive"
              >
                All
              </Button>
              <Button
                variant={selectedCategory === "exploration" ? "default" : "outline"}
                onClick={() => setSelectedCategory("exploration")}
                className="gloss-interactive"
              >
                <Target className="w-4 h-4 mr-2" />
                Exploration
              </Button>
              <Button
                variant={selectedCategory === "creativity" ? "default" : "outline"}
                onClick={() => setSelectedCategory("creativity")}
                className="gloss-interactive"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Creativity
              </Button>
              <Button
                variant={selectedCategory === "consistency" ? "default" : "outline"}
                onClick={() => setSelectedCategory("consistency")}
                className="gloss-interactive"
              >
                <Zap className="w-4 h-4 mr-2" />
                Consistency
              </Button>
              <Button
                variant={selectedCategory === "social" ? "default" : "outline"}
                onClick={() => setSelectedCategory("social")}
                className="gloss-interactive"
              >
                <Users className="w-4 h-4 mr-2" />
                Social
              </Button>
              <Button
                variant={selectedCategory === "mastery" ? "default" : "outline"}
                onClick={() => setSelectedCategory("mastery")}
                className="gloss-interactive"
              >
                <Crown className="w-4 h-4 mr-2" />
                Mastery
              </Button>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`gloss-card border-primary/20 transition-all ${
                    achievement.unlocked ? getTierGlow(achievement.tier) : "opacity-70"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{achievement.badge}</div>
                      <Badge className={getTierColor(achievement.tier)}>{achievement.tier.toUpperCase()}</Badge>
                    </div>
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!achievement.unlocked && (
                      <>
                        <Progress value={achievement.progress} className="mb-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round(achievement.progress)}% Complete
                        </div>
                      </>
                    )}

                    {achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-green-500">✓ Unlocked!</div>
                        <div className="text-sm">
                          <span className="font-medium">Title:</span>{" "}
                          <span className="text-yellow-500">{achievement.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Perk:</span> {achievement.perk.description}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="gloss-card border-primary/20">
                <CardHeader>
                  <CardTitle>Roleplay Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatRow label="Total Messages" value={stats.messagesSent.toLocaleString()} />
                  <StatRow label="Total Words" value={stats.totalWords.toLocaleString()} />
                  <StatRow label="Sessions Completed" value={stats.sessionsCompleted} />
                  <StatRow label="Scenes Completed" value={stats.scenesCompleted} />
                  <StatRow
                    label="Play Time"
                    value={`${Math.floor(stats.totalPlayTime / 60)}h ${stats.totalPlayTime % 60}m`}
                  />
                </CardContent>
              </Card>

              <Card className="gloss-card border-primary/20">
                <CardHeader>
                  <CardTitle>Creation Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatRow label="Characters Created" value={stats.charactersCreated} />
                  <StatRow label="Lorebooks Created" value={stats.loreBooksCreated} />
                  <StatRow label="Lore Cards Written" value={stats.loreCardsCreated} />
                  <StatRow label="AI Images Generated" value={stats.aiGeneratedImages} />
                  <StatRow label="Worlds Explored" value={stats.worldsExplored} />
                </CardContent>
              </Card>

              <Card className="gloss-card border-primary/20">
                <CardHeader>
                  <CardTitle>Scene Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatRow label="Romantic Scenes" value={stats.romanticScenes} />
                  <StatRow label="Action Scenes" value={stats.actionScenes} />
                  <StatRow label="Sci-Fi Scenes" value={stats.sciFiScenes} />
                  <StatRow label="Fantasy Scenes" value={stats.fantasyScenes} />
                  <StatRow label="Modern Scenes" value={stats.modernScenes} />
                </CardContent>
              </Card>

              <Card className="gloss-card border-primary/20">
                <CardHeader>
                  <CardTitle>Social Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatRow label="Relationships Formed" value={stats.relationshipsFormed} />
                  <StatRow label="Multi-Character Sessions" value={stats.multiCharacterSessions} />
                  <StatRow label="Days Active" value={stats.daysActive} />
                  <StatRow label="Longest Streak" value={`${stats.longestStreak} days`} />
                  <StatRow label="Current Streak" value={`${stats.currentStreak} days 🔥`} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="perks">
            <Card className="gloss-card border-primary/20">
              <CardHeader>
                <CardTitle>Active Perks & Benefits</CardTitle>
                <CardDescription>Your unlocked achievements grant you these permanent benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements
                    .filter((a) => a.unlocked)
                    .map((achievement) => (
                      <div key={achievement.id} className="flex items-start gap-4 p-4 rounded-lg bg-card/50">
                        <div className="text-3xl">{achievement.badge}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{achievement.name}</div>
                          <div className="text-sm text-yellow-500 mb-1">Title: {achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.perk.description}</div>
                        </div>
                        <Badge className={getTierColor(achievement.tier)}>{achievement.tier}</Badge>
                      </div>
                    ))}

                  {achievements.filter((a) => a.unlocked).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No perks unlocked yet. Complete achievements to earn powerful benefits!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
