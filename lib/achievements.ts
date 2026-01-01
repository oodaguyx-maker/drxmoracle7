export interface Achievement {
  id: string
  name: string
  description: string
  category: "exploration" | "creativity" | "consistency" | "social" | "mastery" | "adult" | "setting"
  tier: "common" | "uncommon" | "rare" | "legendary"
  badge: string
  oodaScore: number // Points awarded for this achievement
  requirement: {
    type: string
    target: number
    current?: number
  }
  unlocked: boolean
  unlockedAt?: number
  progress: number
}

export interface UserStats {
  messagesSent: number
  charactersCreated: number
  sessionsCompleted: number
  worldsExplored: number
  loreBooksCreated: number
  loreCardsCreated: number
  daysActive: number
  lastActiveDate: string
  longestStreak: number
  currentStreak: number
  totalPlayTime: number
  scenesCompleted: number
  relationshipsFormed: number
  impregnationCount: number
  romanticScenes: number
  actionScenes: number
  sciFiScenes: number
  fantasyScenes: number
  modernScenes: number
  medievalScenes: number
  postApocalypticScenes: number
  multiCharacterSessions: number
  aiGeneratedImages: number
  favoriteCharacters: string[]
  totalWords: number
  nodesCreated: number
  roughSexScenes: number
  lovemakingScenes: number
  outercourseScenes: number
  dryHumpingScenes: number
  pregnancyScenes: number
  oracleViewerOpened: number
  galleriesViewed: number
  totalOodaScore: number
}

export const ACHIEVEMENTS: Achievement[] = [
  // COMMON TIER - Easy to unlock (1-5 actions)
  {
    id: "first_steps",
    name: "First Steps",
    description: "Send your first message in a roleplay session",
    category: "exploration",
    tier: "common",
    badge: "👣",
    oodaScore: 10,
    requirement: { type: "messagesSent", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "character_creator",
    name: "Character Creator",
    description: "Create your first character",
    category: "creativity",
    tier: "common",
    badge: "🎭",
    oodaScore: 25,
    requirement: { type: "charactersCreated", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "world_builder",
    name: "World Builder",
    description: "Create your first lorebook",
    category: "creativity",
    tier: "common",
    badge: "📚",
    oodaScore: 30,
    requirement: { type: "loreBooksCreated", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "daily_devotee",
    name: "Daily Devotee",
    description: "Play for 3 days in a row",
    category: "consistency",
    tier: "common",
    badge: "📅",
    oodaScore: 40,
    requirement: { type: "currentStreak", target: 3 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "conversationalist",
    name: "Conversationalist",
    description: "Send 50 messages",
    category: "exploration",
    tier: "common",
    badge: "💬",
    oodaScore: 50,
    requirement: { type: "messagesSent", target: 50 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "node_creator",
    name: "Node Creator",
    description: "Create your first chat node",
    category: "exploration",
    tier: "common",
    badge: "🔗",
    oodaScore: 20,
    requirement: { type: "nodesCreated", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "oracle_seeker",
    name: "Oracle Seeker",
    description: "Open the Oracle Viewer for the first time",
    category: "exploration",
    tier: "common",
    badge: "👁️",
    oodaScore: 15,
    requirement: { type: "oracleViewerOpened", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "gallery_explorer",
    name: "Gallery Explorer",
    description: "View your first character gallery",
    category: "exploration",
    tier: "common",
    badge: "🖼️",
    oodaScore: 15,
    requirement: { type: "galleriesViewed", target: 1 },
    unlocked: false,
    progress: 0,
  },

  // UNCOMMON TIER - Moderate investment (5-20 actions)
  {
    id: "story_weaver",
    name: "Story Weaver",
    description: "Complete 5 roleplay sessions",
    category: "exploration",
    tier: "uncommon",
    badge: "📖",
    oodaScore: 75,
    requirement: { type: "sessionsCompleted", target: 5 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "character_collector",
    name: "Character Collector",
    description: "Create 10 unique characters",
    category: "creativity",
    tier: "uncommon",
    badge: "🎨",
    oodaScore: 100,
    requirement: { type: "charactersCreated", target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "lore_master",
    name: "Lore Master",
    description: "Create 50 lore cards across all lorebooks",
    category: "creativity",
    tier: "uncommon",
    badge: "📜",
    oodaScore: 120,
    requirement: { type: "loreCardsCreated", target: 50 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day play streak",
    category: "consistency",
    tier: "uncommon",
    badge: "⚔️",
    oodaScore: 80,
    requirement: { type: "currentStreak", target: 7 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "chatterbox",
    name: "Chatterbox",
    description: "Send 500 messages",
    category: "exploration",
    tier: "uncommon",
    badge: "💭",
    oodaScore: 100,
    requirement: { type: "messagesSent", target: 500 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "romance_rookie",
    name: "Romance Rookie",
    description: "Complete 5 lovemaking scenes",
    category: "adult",
    tier: "uncommon",
    badge: "💕",
    oodaScore: 90,
    requirement: { type: "lovemakingScenes", target: 5 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "party_starter",
    name: "Party Starter",
    description: "Complete 5 multi-character sessions",
    category: "social",
    tier: "uncommon",
    badge: "🎉",
    oodaScore: 85,
    requirement: { type: "multiCharacterSessions", target: 5 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "visual_storyteller",
    name: "Visual Storyteller",
    description: "Generate 20 AI images",
    category: "creativity",
    tier: "uncommon",
    badge: "🖼️",
    oodaScore: 70,
    requirement: { type: "aiGeneratedImages", target: 20 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "node_network",
    name: "Node Network",
    description: "Create 10 chat nodes",
    category: "exploration",
    tier: "uncommon",
    badge: "🕸️",
    oodaScore: 80,
    requirement: { type: "nodesCreated", target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "passionate_lover",
    name: "Passionate Lover",
    description: "Complete 10 rough sex scenes",
    category: "adult",
    tier: "uncommon",
    badge: "🔥",
    oodaScore: 95,
    requirement: { type: "roughSexScenes", target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "tease_master",
    name: "Tease Master",
    description: "Complete 8 outercourse scenes",
    category: "adult",
    tier: "uncommon",
    badge: "😏",
    oodaScore: 85,
    requirement: { type: "outercourseScenes", target: 8 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "medieval_explorer",
    name: "Medieval Explorer",
    description: "Complete 10 medieval setting scenes",
    category: "setting",
    tier: "uncommon",
    badge: "🏰",
    oodaScore: 75,
    requirement: { type: "medievalScenes", target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "modern_life",
    name: "Modern Life",
    description: "Complete 10 modern setting scenes",
    category: "setting",
    tier: "uncommon",
    badge: "🏙️",
    oodaScore: 75,
    requirement: { type: "modernScenes", target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "sci_fi_voyager",
    name: "Sci-Fi Voyager",
    description: "Complete 10 sci-fi setting scenes",
    category: "setting",
    tier: "uncommon",
    badge: "🚀",
    oodaScore: 75,
    requirement: { type: "sciFiScenes", target: 10 },
    unlocked: false,
    progress: 0,
  },

  // RARE TIER - Significant investment (20+ actions)
  {
    id: "epic_narrator",
    name: "Epic Narrator",
    description: "Complete 25 roleplay sessions",
    category: "exploration",
    tier: "rare",
    badge: "🏆",
    oodaScore: 250,
    requirement: { type: "sessionsCompleted", target: 25 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "prolific_author",
    name: "Prolific Author",
    description: "Write 100,000 words across all sessions",
    category: "creativity",
    tier: "rare",
    badge: "✍️",
    oodaScore: 300,
    requirement: { type: "totalWords", target: 100000 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "month_marathoner",
    name: "Month Marathoner",
    description: "Maintain a 30-day play streak",
    category: "consistency",
    tier: "rare",
    badge: "🔥",
    oodaScore: 400,
    requirement: { type: "currentStreak", target: 30 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "harem_master",
    name: "Harem Master",
    description: "Form relationships with 10 different characters",
    category: "social",
    tier: "rare",
    badge: "👥",
    oodaScore: 280,
    requirement: { type: "relationshipsFormed", target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "romance_virtuoso",
    name: "Romance Virtuoso",
    description: "Complete 25 lovemaking scenes",
    category: "adult",
    tier: "rare",
    badge: "💖",
    oodaScore: 300,
    requirement: { type: "lovemakingScenes", target: 25 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "action_hero",
    name: "Action Hero",
    description: "Complete 25 action-packed scenes",
    category: "exploration",
    tier: "rare",
    badge: "⚡",
    oodaScore: 280,
    requirement: { type: "actionScenes", target: 25 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "progenitor",
    name: "Progenitor",
    description: "Complete 10 pregnancy storylines",
    category: "adult",
    tier: "rare",
    badge: "🤰",
    oodaScore: 320,
    requirement: { type: "pregnancyScenes", target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "node_master",
    name: "Node Master",
    description: "Create 50 chat nodes",
    category: "exploration",
    tier: "rare",
    badge: "🌐",
    oodaScore: 350,
    requirement: { type: "nodesCreated", target: 50 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "wild_beast",
    name: "Wild Beast",
    description: "Complete 30 rough sex scenes",
    category: "adult",
    tier: "rare",
    badge: "🐺",
    oodaScore: 340,
    requirement: { type: "roughSexScenes", target: 30 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "friction_fanatic",
    name: "Friction Fanatic",
    description: "Complete 20 dryhumping/grinding scenes",
    category: "adult",
    tier: "rare",
    badge: "💦",
    oodaScore: 290,
    requirement: { type: "dryHumpingScenes", target: 20 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "wasteland_wanderer",
    name: "Wasteland Wanderer",
    description: "Complete 15 post-apocalyptic scenes",
    category: "setting",
    tier: "rare",
    badge: "☢️",
    oodaScore: 260,
    requirement: { type: "postApocalypticScenes", target: 15 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "time_traveler",
    name: "Time Traveler",
    description: "Experience all setting types: Medieval, Modern, Sci-Fi, and Post-Apocalyptic",
    category: "setting",
    tier: "rare",
    badge: "⏰",
    oodaScore: 350,
    requirement: { type: "combined", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "oracle_devotee",
    name: "Oracle Devotee",
    description: "Open Oracle Viewer 50 times",
    category: "exploration",
    tier: "rare",
    badge: "🔮",
    oodaScore: 220,
    requirement: { type: "oracleViewerOpened", target: 50 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "gallery_curator",
    name: "Gallery Curator",
    description: "View 25 character galleries",
    category: "creativity",
    tier: "rare",
    badge: "🎨",
    oodaScore: 200,
    requirement: { type: "galleriesViewed", target: 25 },
    unlocked: false,
    progress: 0,
  },

  // LEGENDARY TIER - Master achievements
  {
    id: "ultimate_creator",
    name: "Ultimate Creator",
    description: "Create 50 characters, 10 lorebooks, and 200 lore cards",
    category: "mastery",
    tier: "legendary",
    badge: "👑",
    oodaScore: 1500,
    requirement: { type: "combined", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "immortal_legend",
    name: "Immortal Legend",
    description: "Play for 100 days and complete 100 sessions",
    category: "mastery",
    tier: "legendary",
    badge: "⭐",
    oodaScore: 2000,
    requirement: { type: "combined", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "word_god",
    name: "Word God",
    description: "Write 1,000,000 words",
    category: "mastery",
    tier: "legendary",
    badge: "📚",
    oodaScore: 1800,
    requirement: { type: "totalWords", target: 1000000 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "chat_master",
    name: "Chat Master",
    description: "Send 10,000 messages",
    category: "mastery",
    tier: "legendary",
    badge: "💬",
    oodaScore: 1200,
    requirement: { type: "messagesSent", target: 10000 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "node_architect",
    name: "Node Architect",
    description: "Create 100 chat nodes",
    category: "mastery",
    tier: "legendary",
    badge: "🏗️",
    oodaScore: 1000,
    requirement: { type: "nodesCreated", target: 100 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "passionate_deity",
    name: "Passionate Deity",
    description: "Complete 100 adult scenes (any type)",
    category: "mastery",
    tier: "legendary",
    badge: "🔞",
    oodaScore: 1600,
    requirement: { type: "combined", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "multiverse_explorer",
    name: "Multiverse Explorer",
    description: "Complete 50+ scenes in each setting type",
    category: "mastery",
    tier: "legendary",
    badge: "🌌",
    oodaScore: 1750,
    requirement: { type: "combined", target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: "impregnation_master",
    name: "Impregnation Master",
    description: "Trigger 25 impregnation events",
    category: "adult",
    tier: "legendary",
    badge: "👶",
    oodaScore: 900,
    requirement: { type: "impregnationCount", target: 25 },
    unlocked: false,
    progress: 0,
  },
]

export function getUserStats(): UserStats {
  if (typeof window === "undefined") return getDefaultStats()

  const stored = localStorage.getItem("user_stats")
  if (!stored) {
    const defaultStats = getDefaultStats()
    saveUserStats(defaultStats)
    return defaultStats
  }

  return JSON.parse(stored)
}

export function getDefaultStats(): UserStats {
  return {
    messagesSent: 0,
    charactersCreated: 0,
    sessionsCompleted: 0,
    worldsExplored: 0,
    loreBooksCreated: 0,
    loreCardsCreated: 0,
    daysActive: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
    longestStreak: 0,
    currentStreak: 0,
    totalPlayTime: 0,
    scenesCompleted: 0,
    relationshipsFormed: 0,
    impregnationCount: 0,
    romanticScenes: 0,
    actionScenes: 0,
    sciFiScenes: 0,
    fantasyScenes: 0,
    modernScenes: 0,
    medievalScenes: 0,
    postApocalypticScenes: 0,
    multiCharacterSessions: 0,
    aiGeneratedImages: 0,
    favoriteCharacters: [],
    totalWords: 0,
    nodesCreated: 0,
    roughSexScenes: 0,
    lovemakingScenes: 0,
    outercourseScenes: 0,
    dryHumpingScenes: 0,
    pregnancyScenes: 0,
    oracleViewerOpened: 0,
    galleriesViewed: 0,
    totalOodaScore: 0,
  }
}

export function saveUserStats(stats: UserStats) {
  if (typeof window === "undefined") return
  localStorage.setItem("user_stats", JSON.stringify(stats))
}

export function updateStreak() {
  const stats = getUserStats()
  const today = new Date().toISOString().split("T")[0]

  if (stats.lastActiveDate !== today) {
    const lastDate = new Date(stats.lastActiveDate)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      stats.currentStreak++
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak)
    } else if (diffDays > 1) {
      stats.currentStreak = 1
    }

    stats.lastActiveDate = today
    stats.daysActive++
    saveUserStats(stats)
  }
}

export function trackAction(action: keyof UserStats, increment = 1) {
  const stats = getUserStats()
  updateStreak()

  if (typeof stats[action] === "number") {
    ;(stats[action] as number) += increment
  }

  saveUserStats(stats)
  checkAchievements(stats)
}

export function getAchievements(): Achievement[] {
  if (typeof window === "undefined") return ACHIEVEMENTS

  const stored = localStorage.getItem("achievements")
  if (!stored) {
    localStorage.setItem("achievements", JSON.stringify(ACHIEVEMENTS))
    return ACHIEVEMENTS
  }

  return JSON.parse(stored)
}

export function saveAchievements(achievements: Achievement[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("achievements", JSON.stringify(achievements))
}

export function checkAchievements(stats: UserStats) {
  const achievements = getAchievements()
  let updated = false

  achievements.forEach((achievement) => {
    if (achievement.unlocked) return

    let progress = 0

    // Handle combined requirements for legendary achievements
    if (achievement.requirement.type === "combined") {
      if (achievement.id === "ultimate_creator") {
        const charProgress = stats.charactersCreated / 50
        const bookProgress = stats.loreBooksCreated / 10
        const cardProgress = stats.loreCardsCreated / 200
        progress = ((charProgress + bookProgress + cardProgress) / 3) * 100

        if (stats.charactersCreated >= 50 && stats.loreBooksCreated >= 10 && stats.loreCardsCreated >= 200) {
          achievement.unlocked = true
          achievement.unlockedAt = Date.now()
          showAchievementNotification(achievement)
          updated = true
        }
      } else if (achievement.id === "immortal_legend") {
        const dayProgress = stats.daysActive / 100
        const sessionProgress = stats.sessionsCompleted / 100
        progress = ((dayProgress + sessionProgress) / 2) * 100

        if (stats.daysActive >= 100 && stats.sessionsCompleted >= 100) {
          achievement.unlocked = true
          achievement.unlockedAt = Date.now()
          showAchievementNotification(achievement)
          updated = true
        }
      } else if (achievement.id === "time_traveler") {
        const hasAll =
          stats.medievalScenes >= 5 &&
          stats.modernScenes >= 5 &&
          stats.sciFiScenes >= 5 &&
          stats.postApocalypticScenes >= 5
        progress = hasAll ? 100 : 0

        if (hasAll) {
          achievement.unlocked = true
          achievement.unlockedAt = Date.now()
          showAchievementNotification(achievement)
          updated = true
        }
      } else if (achievement.id === "passionate_deity") {
        const totalAdult =
          stats.roughSexScenes + stats.lovemakingScenes + stats.outercourseScenes + stats.dryHumpingScenes
        progress = (totalAdult / 100) * 100

        if (totalAdult >= 100) {
          achievement.unlocked = true
          achievement.unlockedAt = Date.now()
          showAchievementNotification(achievement)
          updated = true
        }
      } else if (achievement.id === "multiverse_explorer") {
        const allAbove50 =
          stats.medievalScenes >= 50 &&
          stats.modernScenes >= 50 &&
          stats.sciFiScenes >= 50 &&
          stats.postApocalypticScenes >= 50
        progress = allAbove50 ? 100 : 0

        if (allAbove50) {
          achievement.unlocked = true
          achievement.unlockedAt = Date.now()
          showAchievementNotification(achievement)
          updated = true
        }
      }
    } else {
      const statValue = stats[achievement.requirement.type as keyof UserStats] as number
      progress = (statValue / achievement.requirement.target) * 100

      if (statValue >= achievement.requirement.target) {
        achievement.unlocked = true
        achievement.unlockedAt = Date.now()
        showAchievementNotification(achievement)
        updated = true
      }
    }

    achievement.progress = Math.min(100, progress)
  })

  if (updated) {
    saveAchievements(achievements)
    updateOodaScore()
  }
}

export function showAchievementNotification(achievement: Achievement) {
  // This will be called when an achievement is unlocked
  // You can integrate with your toast system
  if (typeof window !== "undefined") {
    const event = new CustomEvent("achievement-unlocked", { detail: achievement })
    window.dispatchEvent(event)
  }
}

export function getUnlockedPerks(): Achievement[] {
  return getAchievements().filter((a) => a.unlocked)
}

export function getActiveTitles(): string[] {
  return getAchievements()
    .filter((a) => a.unlocked)
    .map((a) => a.title)
}

export function getAchievementProgress(): { total: number; unlocked: number; percentage: number; oodaScore: number } {
  const achievements = getAchievements()
  const unlocked = achievements.filter((a) => a.unlocked).length
  const oodaScore = getOodaScore()
  return {
    total: achievements.length,
    unlocked,
    percentage: Math.round((unlocked / achievements.length) * 100),
    oodaScore,
  }
}

export function updateOodaScore() {
  const achievements = getAchievements()
  const totalScore = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.oodaScore, 0)

  const stats = getUserStats()
  stats.totalOodaScore = totalScore
  saveUserStats(stats)
}

export function getOodaScore(): number {
  const stats = getUserStats()
  return stats.totalOodaScore || 0
}
