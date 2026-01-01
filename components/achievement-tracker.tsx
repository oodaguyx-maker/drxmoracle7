"use client"

import { useEffect } from "react"
import { trackAction, updateStreak, type Achievement } from "@/lib/achievements"
import { useToast } from "@/hooks/use-toast"

export function AchievementTracker() {
  const { toast } = useToast()

  useEffect(() => {
    updateStreak()

    const handleAchievementUnlocked = (event: CustomEvent<Achievement>) => {
      const achievement = event.detail

      toast({
        title: "🏆 Achievement Unlocked!",
        description: (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{achievement.badge}</span>
              <div>
                <div className="font-bold">{achievement.name}</div>
                <div className="text-sm text-muted-foreground">{achievement.description}</div>
              </div>
            </div>
            <div className="text-sm font-bold">
              <span className="text-yellow-500">+{achievement.oodaScore} OodaScore</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Tier: <span className="font-semibold capitalize">{achievement.tier}</span>
            </div>
          </div>
        ),
        duration: 10000,
      })
    }

    window.addEventListener("achievement-unlocked", handleAchievementUnlocked as EventListener)

    return () => {
      window.removeEventListener("achievement-unlocked", handleAchievementUnlocked as EventListener)
    }
  }, [toast])

  return null
}

export function useAchievementTracking() {
  return {
    trackMessage: () => trackAction("messagesSent"),
    trackCharacterCreated: () => trackAction("charactersCreated"),
    trackSessionCompleted: () => trackAction("sessionsCompleted"),
    trackWorldExplored: () => trackAction("worldsExplored"),
    trackLorebookCreated: () => trackAction("loreBooksCreated"),
    trackLoreCardCreated: () => trackAction("loreCardsCreated"),
    trackSceneCompleted: () => trackAction("scenesCompleted"),
    trackRelationshipFormed: () => trackAction("relationshipsFormed"),
    trackImpregnation: () => trackAction("impregnationCount"),
    trackRomanticScene: () => trackAction("romanticScenes"),
    trackActionScene: () => trackAction("actionScenes"),
    trackSciFiScene: () => trackAction("sciFiScenes"),
    trackFantasyScene: () => trackAction("fantasyScenes"),
    trackModernScene: () => trackAction("modernScenes"),
    trackMedievalScene: () => trackAction("medievalScenes"),
    trackPostApocalypticScene: () => trackAction("postApocalypticScenes"),
    trackMultiCharacterSession: () => trackAction("multiCharacterSessions"),
    trackImageGenerated: () => trackAction("aiGeneratedImages"),
    trackWords: (count: number) => trackAction("totalWords", count),
    trackPlayTime: (minutes: number) => trackAction("totalPlayTime", minutes),
    trackNodeCreated: () => trackAction("nodesCreated"),
    trackRoughSexScene: () => trackAction("roughSexScenes"),
    trackLovemakingScene: () => trackAction("lovemakingScenes"),
    trackOutercourseScene: () => trackAction("outercourseScenes"),
    trackDryHumpingScene: () => trackAction("dryHumpingScenes"),
    trackPregnancyScene: () => trackAction("pregnancyScenes"),
    trackOracleViewer: () => trackAction("oracleViewerOpened"),
    trackGalleryView: () => trackAction("galleriesViewed"),
  }
}
