// StoryScape Storage Layer

import { generateId as generateUniqueId } from "./storage"

export const generateId = generateUniqueId

export interface StoryScapeStory {
  id: string
  userId: string
  title: string
  description: string
  genre: "fantasy" | "modern" | "sci-fi" | "post-apocalypse" | "horror" | "mystery" | "romance" | "historical"
  estimatedDuration: "short" | "medium" | "long" // 1-2h, 3-5h, 6+h
  difficulty: "easy" | "medium" | "hard"
  mainCharacters: StoryCharacter[]
  worldSetting: string
  initialSituation: string
  tags: string[]
  isPublished: boolean
  playCount: number
  createdAt: number
  updatedAt: number
}

export interface StoryCharacter {
  id: string
  name: string
  description: string
  personality: string
  role: "protagonist" | "ally" | "antagonist" | "mentor" | "neutral"
  avatar?: string
  initialState: Record<string, any> // health, mood, equipment, etc.
}

export interface StoryChapter {
  id: string
  storyId: string
  chapterNumber: number
  title: string
  description: string
  objectives: string[]
  estimatedDuration: number // minutes
  initialNarrative: string
  npcs: ChapterNPC[]
  locations: string[]
  keyChoices: KeyChoice[]
  completionCriteria: string
  createdAt: number
}

export interface ChapterNPC {
  id: string
  name: string
  description: string
  role: string
  avatar?: string
}

export interface KeyChoice {
  id: string
  text: string
  consequences: string
  impact: "minor" | "moderate" | "major"
}

export interface StoryScapeSession {
  id: string
  userId: string
  storyId: string
  sessionName: string
  currentChapterNumber: number
  chapterSummaries: ChapterSummary[]
  characterStates: Record<string, any>
  worldState: Record<string, any>
  decisionsMade: Decision[]
  messages: StoryMessage[]
  currentCheckpointId?: string
  endingAchieved?: string
  status: "in_progress" | "completed" | "abandoned"
  playtimeMinutes: number
  createdAt: number
  updatedAt: number
}

export interface ChapterSummary {
  chapterNumber: number
  chapterTitle: string
  summary: string
  keyChoices: string[]
  completedAt: number
}

export interface Decision {
  chapterId: string
  decision: string
  timestamp: number
  impact: string
}

export interface StoryMessage {
  id: string
  speakerId: string // "user", "narrator", or character ID
  speakerType: "user" | "narrator" | "character" | "npc"
  content: string
  timestamp: number
  messageType: "action" | "dialogue" | "narrative" | "choice"
  chapterNumber: number
}

export interface StoryCheckpoint {
  id: string
  sessionId: string
  chapterId: string
  checkpointName: string
  messages: StoryMessage[]
  characterStates: Record<string, any>
  worldState: Record<string, any>
  createdAt: number
}

const STORAGE_KEYS = {
  STORIES: "storyscape_stories",
  CHAPTERS: "storyscape_chapters",
  SESSIONS: "storyscape_sessions",
  CHECKPOINTS: "storyscape_checkpoints",
}

// Story Management
export function getStories(): StoryScapeStory[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.STORIES)
  return data ? JSON.parse(data) : []
}

export function saveStory(story: StoryScapeStory): void {
  const stories = getStories()
  const index = stories.findIndex((s) => s.id === story.id)

  story.updatedAt = Date.now()

  if (index >= 0) {
    stories[index] = story
  } else {
    stories.push(story)
  }

  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories))
}

export function getStory(id: string): StoryScapeStory | null {
  return getStories().find((s) => s.id === id) || null
}

export function deleteStory(id: string): void {
  const stories = getStories().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories))

  // Delete associated chapters
  const chapters = getChapters(id)
  chapters.forEach((c) => deleteChapter(c.id))
}

// Chapter Management
export function getChapters(storyId: string): StoryChapter[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(`${STORAGE_KEYS.CHAPTERS}_${storyId}`)
  return data ? JSON.parse(data) : []
}

export function saveChapter(chapter: StoryChapter): void {
  const chapters = getChapters(chapter.storyId)
  const index = chapters.findIndex((c) => c.id === chapter.id)

  if (index >= 0) {
    chapters[index] = chapter
  } else {
    chapters.push(chapter)
  }

  chapters.sort((a, b) => a.chapterNumber - b.chapterNumber)
  localStorage.setItem(`${STORAGE_KEYS.CHAPTERS}_${chapter.storyId}`, JSON.stringify(chapters))
}

export function getChapter(storyId: string, chapterNumber: number): StoryChapter | null {
  const chapters = getChapters(storyId)
  return chapters.find((c) => c.chapterNumber === chapterNumber) || null
}

export function deleteChapter(id: string): void {
  const allKeys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEYS.CHAPTERS))

  allKeys.forEach((key) => {
    const chapters = JSON.parse(localStorage.getItem(key) || "[]")
    const filtered = chapters.filter((c: StoryChapter) => c.id !== id)
    localStorage.setItem(key, JSON.stringify(filtered))
  })
}

// Session Management
export function getSessions(): StoryScapeSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS)
  return data ? JSON.parse(data) : []
}

export function saveSession(session: StoryScapeSession): void {
  const sessions = getSessions()
  const index = sessions.findIndex((s) => s.id === session.id)

  session.updatedAt = Date.now()

  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.push(session)
  }

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
}

export function getSession(id: string): StoryScapeSession | null {
  return getSessions().find((s) => s.id === id) || null
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))

  // Delete associated checkpoints
  const checkpoints = getCheckpoints(id)
  checkpoints.forEach((cp) => deleteCheckpoint(cp.id))
}

// Checkpoint Management
export function getCheckpoints(sessionId: string): StoryCheckpoint[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(`${STORAGE_KEYS.CHECKPOINTS}_${sessionId}`)
  return data ? JSON.parse(data) : []
}

export function saveCheckpoint(checkpoint: StoryCheckpoint): void {
  const checkpoints = getCheckpoints(checkpoint.sessionId)
  checkpoints.push(checkpoint)
  localStorage.setItem(`${STORAGE_KEYS.CHECKPOINTS}_${checkpoint.sessionId}`, JSON.stringify(checkpoints))
}

export function getCheckpoint(id: string): StoryCheckpoint | null {
  const allKeys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEYS.CHECKPOINTS))

  for (const key of allKeys) {
    const checkpoints = JSON.parse(localStorage.getItem(key) || "[]")
    const found = checkpoints.find((cp: StoryCheckpoint) => cp.id === id)
    if (found) return found
  }

  return null
}

export function deleteCheckpoint(id: string): void {
  const allKeys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEYS.CHECKPOINTS))

  allKeys.forEach((key) => {
    const checkpoints = JSON.parse(localStorage.getItem(key) || "[]")
    const filtered = checkpoints.filter((cp: StoryCheckpoint) => cp.id !== id)
    localStorage.setItem(key, JSON.stringify(filtered))
  })
}

export function restoreCheckpoint(checkpointId: string, sessionId: string): void {
  const checkpoint = getCheckpoint(checkpointId)
  const session = getSession(sessionId)

  if (!checkpoint || !session) return

  // Restore session state to checkpoint
  session.messages = checkpoint.messages
  session.characterStates = checkpoint.characterStates
  session.worldState = checkpoint.worldState
  session.currentCheckpointId = checkpointId

  saveSession(session)
}

// Additional Function Exports
export function getStoryScapeSession(id: string): StoryScapeSession | null {
  return getSession(id)
}

export function updateStoryScapeSession(id: string, updates: Partial<StoryScapeSession>): StoryScapeSession | null {
  const session = getSession(id)
  if (!session) return null

  const updatedSession = { ...session, ...updates, updatedAt: Date.now() }
  saveSession(updatedSession)
  return updatedSession
}

export function getStoryScript(id: string): StoryScapeStory | null {
  return getStory(id)
}

export function createStoryCheckpoint(
  sessionId: string,
  chapterId: string,
  checkpointName: string,
  state: Pick<StoryCheckpoint, "messages" | "characterStates" | "worldState">,
): StoryCheckpoint {
  const checkpoint: StoryCheckpoint = {
    id: generateId(),
    sessionId,
    chapterId,
    checkpointName,
    ...state,
    createdAt: Date.now(),
  }
  saveCheckpoint(checkpoint)
  return checkpoint
}

export function loadStoryCheckpoint(checkpointId: string, sessionId: string): boolean {
  restoreCheckpoint(checkpointId, sessionId)
  return true
}

export function completeChapter(
  sessionId: string,
  chapterNumber: number,
  chapterTitle: string,
  summary: string,
  keyChoices: string[],
): boolean {
  const session = getSession(sessionId)
  if (!session) return false

  const chapterSummary: ChapterSummary = {
    chapterNumber,
    chapterTitle,
    summary,
    keyChoices,
    completedAt: Date.now(),
  }

  session.chapterSummaries.push(chapterSummary)
  session.currentChapterNumber = chapterNumber + 1
  session.updatedAt = Date.now()

  saveSession(session)
  return true
}
