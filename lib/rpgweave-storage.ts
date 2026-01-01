// RpgWeave Mode Storage & Types
import { generateId as generateUniqueId } from "./storage"

export const generateId = generateUniqueId

export interface RpgCharacter {
  id: string
  userId: string
  name: string
  class: string
  level: number
  experience: number

  // Core Stats
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number

  // Combat Stats
  healthCurrent: number
  healthMax: number
  manaCurrent: number
  manaMax: number
  staminaCurrent: number
  staminaMax: number

  // Progression
  skillPoints: number
  talentPoints: number

  // Currency
  gold: number
  silver: number

  // Status
  renown: number
  titles: string[]
  factionStandings: Record<string, number>

  // Location
  currentLocation: string
  worldId: string

  avatar?: string
  createdAt: number
  updatedAt: number
}

export interface RpgItem {
  id: string
  name: string
  type: "weapon" | "armor" | "consumable" | "quest" | "material" | "accessory"
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  description: string
  statsBonus?: Record<string, number>
  effects?: string[]
  value: number
  icon?: string
}

export interface InventoryItem {
  id: string
  itemId: string
  quantity: number
  equipped: boolean
  slot?: string
}

export interface PartyMember {
  id: string
  memberId: string
  memberType: "npc" | "companion" | "summon"
  name: string
  class: string
  level: number
  healthCurrent: number
  healthMax: number
  stats: Record<string, number>
  loyalty: number
  affection: number
  trust: number
  combatAi: "aggressive" | "balanced" | "defensive" | "support"
  equipment: string[]
  joinedAt: number
}

export interface RpgWorld {
  id: string
  userId: string
  name: string
  genre: "fantasy" | "sci-fi" | "modern" | "post-apocalypse" | "cyberpunk" | "steampunk"
  description: string
  startingLocation: string
  mapData?: any
  lore: string
  factions: Array<{
    id: string
    name: string
    description: string
    standing: number
  }>
  createdAt: number
  updatedAt: number
}

export interface RpgNpc {
  id: string
  worldId: string
  name: string
  role: string
  description: string
  personality: string
  appearance: string
  location: string
  level: number
  stats?: Record<string, number>
  relationship: number
  faction?: string
  memory: Array<{
    event: string
    timestamp: number
  }>
  dialogueTree?: DialogueNode
  questsAvailable: string[]
  avatar?: string
  gallery?: string[]
  createdAt: number
  lastInteraction?: number
}

export interface DialogueNode {
  id: string
  text: string
  options: Array<{
    text: string
    nextNodeId?: string
    skillCheck?: {
      skill: string
      difficulty: number
    }
    outcome?: string
    relationshipChange?: number
  }>
}

export interface RpgQuest {
  id: string
  worldId: string
  title: string
  description: string
  questGiver: string
  objectives: Array<{
    id: string
    description: string
    completed: boolean
  }>
  rewards: {
    gold?: number
    experience?: number
    items?: string[]
    renown?: number
  }
  status: "available" | "active" | "completed" | "failed"
  difficulty: "easy" | "normal" | "hard" | "epic"
  createdAt: number
  completedAt?: number
}

export interface RpgSession {
  id: string
  characterId: string
  worldId: string
  currentChapter: string
  currentObjective: string
  partyMembers: string[]
  storyProgress: number
  keyDecisions: Array<{
    decision: string
    timestamp: number
    impact: string
  }>
  inCombat: boolean
  combatState?: CombatState
  messages: RpgMessage[]
  createdAt: number
  updatedAt: number
}

export interface RpgMessage {
  id: string
  speakerId: string
  speakerType: "player" | "npc" | "narrator" | "combat_system"
  content: string
  messageType: "dialogue" | "action" | "combat" | "system" | "narration"
  metadata?: any
  timestamp: number
}

export interface CombatState {
  id: string
  enemies: Array<{
    id: string
    name: string
    level: number
    healthCurrent: number
    healthMax: number
    stats: Record<string, number>
    abilities: string[]
  }>
  turnOrder: string[]
  currentTurn: string
  roundNumber: number
  status: "active" | "victory" | "defeat"
  loot?: {
    gold: number
    items: string[]
    experience: number
  }
}

export interface RpgCheckpoint {
  id: string
  sessionId: string
  name: string
  characterState: Partial<RpgCharacter>
  worldState: any
  partyState: PartyMember[]
  inventoryState: InventoryItem[]
  questState: RpgQuest[]
  createdAt: number
}

// LocalStorage keys
const STORAGE_KEYS = {
  RPG_CHARACTERS: "rpgweave_characters",
  RPG_WORLDS: "rpgweave_worlds",
  RPG_SESSIONS: "rpgweave_sessions",
  RPG_NPCS: "rpgweave_npcs",
  RPG_ITEMS: "rpgweave_items",
  RPG_INVENTORY: "rpgweave_inventory",
  RPG_PARTY: "rpgweave_party",
  RPG_QUESTS: "rpgweave_quests",
  RPG_CHECKPOINTS: "rpgweave_checkpoints",
}

// Character Management
export function getRpgCharacters(): RpgCharacter[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_CHARACTERS)
  return data ? JSON.parse(data) : []
}

export function saveRpgCharacter(character: RpgCharacter): void {
  const characters = getRpgCharacters()
  const index = characters.findIndex((c) => c.id === character.id)

  if (index >= 0) {
    characters[index] = character
  } else {
    characters.push(character)
  }

  localStorage.setItem(STORAGE_KEYS.RPG_CHARACTERS, JSON.stringify(characters))
}

export function getRpgCharacter(id: string): RpgCharacter | undefined {
  return getRpgCharacters().find((c) => c.id === id)
}

// World Management
export function getRpgWorlds(): RpgWorld[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_WORLDS)
  return data ? JSON.parse(data) : []
}

export function saveRpgWorld(world: RpgWorld): void {
  const worlds = getRpgWorlds()
  const index = worlds.findIndex((w) => w.id === world.id)

  if (index >= 0) {
    worlds[index] = world
  } else {
    worlds.push(world)
  }

  localStorage.setItem(STORAGE_KEYS.RPG_WORLDS, JSON.stringify(worlds))
}

export function getRpgWorld(id: string): RpgWorld | undefined {
  return getRpgWorlds().find((w) => w.id === id)
}

// World Management Functions
export function getRpgWeaveWorlds(): RpgWorld[] {
  return getRpgWorlds()
}

export function createRpgWeaveWorld(world: Omit<RpgWorld, "id" | "createdAt" | "updatedAt">): RpgWorld {
  const newWorld: RpgWorld = {
    ...world,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  saveRpgWorld(newWorld)
  return newWorld
}

export function getRpgWeaveWorld(id: string): RpgWorld | undefined {
  return getRpgWorld(id)
}

export function updateRpgWeaveWorld(id: string, updates: Partial<RpgWorld>): RpgWorld | undefined {
  const world = getRpgWorld(id)
  if (!world) return undefined

  const updatedWorld = { ...world, ...updates, updatedAt: Date.now() }
  saveRpgWorld(updatedWorld)
  return updatedWorld
}

// Session Management
export function getRpgSessions(): RpgSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_SESSIONS)
  return data ? JSON.parse(data) : []
}

export function saveRpgSession(session: RpgSession): void {
  const sessions = getRpgSessions()
  const index = sessions.findIndex((s) => s.id === session.id)

  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.push(session)
  }

  localStorage.setItem(STORAGE_KEYS.RPG_SESSIONS, JSON.stringify(sessions))
}

export function getRpgSession(id: string): RpgSession | undefined {
  return getRpgSessions().find((s) => s.id === id)
}

// Session Management Functions
export function createRpgWeaveSession(session: Omit<RpgSession, "id" | "createdAt" | "updatedAt">): RpgSession {
  const newSession: RpgSession = {
    ...session,
    id: generateId(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  saveRpgSession(newSession)
  return newSession
}

export function getRpgWeaveSession(id: string): RpgSession | undefined {
  return getRpgSession(id)
}

export function updateRpgWeaveSession(id: string, updates: Partial<RpgSession>): RpgSession | undefined {
  const session = getRpgSession(id)
  if (!session) return undefined

  const updatedSession = { ...session, ...updates, updatedAt: Date.now() }
  saveRpgSession(updatedSession)
  return updatedSession
}

// NPC Management
export function getRpgNpcs(worldId: string): RpgNpc[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_NPCS)
  const allNpcs = data ? JSON.parse(data) : []
  return allNpcs.filter((npc: RpgNpc) => npc.worldId === worldId)
}

export function saveRpgNpc(npc: RpgNpc): void {
  if (typeof window === "undefined") return
  const data = localStorage.getItem(STORAGE_KEYS.RPG_NPCS)
  const npcs = data ? JSON.parse(data) : []
  const index = npcs.findIndex((n: RpgNpc) => n.id === npc.id)

  if (index >= 0) {
    npcs[index] = npc
  } else {
    npcs.push(npc)
  }

  localStorage.setItem(STORAGE_KEYS.RPG_NPCS, JSON.stringify(npcs))
}

// Inventory Management
export function getInventory(characterId: string): InventoryItem[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_INVENTORY)
  const allInventory = data ? JSON.parse(data) : []
  return allInventory.filter((item: any) => item.characterId === characterId)
}

export function saveInventoryItem(characterId: string, item: InventoryItem): void {
  if (typeof window === "undefined") return
  const data = localStorage.getItem(STORAGE_KEYS.RPG_INVENTORY)
  const inventory = data ? JSON.parse(data) : []

  inventory.push({ ...item, characterId })
  localStorage.setItem(STORAGE_KEYS.RPG_INVENTORY, JSON.stringify(inventory))
}

// Party Management
export function getPartyMembers(characterId: string): PartyMember[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_PARTY)
  const allParty = data ? JSON.parse(data) : []
  return allParty.filter((member: any) => member.characterId === characterId)
}

export function savePartyMember(characterId: string, member: PartyMember): void {
  if (typeof window === "undefined") return
  const data = localStorage.getItem(STORAGE_KEYS.RPG_PARTY)
  const party = data ? JSON.parse(data) : []

  party.push({ ...member, characterId })
  localStorage.setItem(STORAGE_KEYS.RPG_PARTY, JSON.stringify(party))
}

// Quest Management
export function getQuests(worldId: string): RpgQuest[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_QUESTS)
  const allQuests = data ? JSON.parse(data) : []
  return allQuests.filter((quest: RpgQuest) => quest.worldId === worldId)
}

export function saveQuest(quest: RpgQuest): void {
  if (typeof window === "undefined") return
  const data = localStorage.getItem(STORAGE_KEYS.RPG_QUESTS)
  const quests = data ? JSON.parse(data) : []
  const index = quests.findIndex((q: RpgQuest) => q.id === quest.id)

  if (index >= 0) {
    quests[index] = quest
  } else {
    quests.push(quest)
  }

  localStorage.setItem(STORAGE_KEYS.RPG_QUESTS, JSON.stringify(quests))
}

// Checkpoint Management
export function getCheckpoints(sessionId: string): RpgCheckpoint[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.RPG_CHECKPOINTS)
  const allCheckpoints = data ? JSON.parse(data) : []
  return allCheckpoints.filter((cp: RpgCheckpoint) => cp.sessionId === sessionId)
}

export function saveCheckpoint(checkpoint: RpgCheckpoint): void {
  if (typeof window === "undefined") return
  const data = localStorage.getItem(STORAGE_KEYS.RPG_CHECKPOINTS)
  const checkpoints = data ? JSON.parse(data) : []

  checkpoints.push(checkpoint)
  localStorage.setItem(STORAGE_KEYS.RPG_CHECKPOINTS, JSON.stringify(checkpoints))
}

// Checkpoint Functions
export function createRpgWeaveCheckpoint(
  sessionId: string,
  name: string,
  state: Omit<RpgCheckpoint, "id" | "sessionId" | "name" | "createdAt">,
): RpgCheckpoint {
  const checkpoint: RpgCheckpoint = {
    id: generateId(),
    sessionId,
    name,
    ...state,
    createdAt: Date.now(),
  }
  saveCheckpoint(checkpoint)
  return checkpoint
}

export function getRpgWeaveCheckpoints(sessionId: string): RpgCheckpoint[] {
  return getCheckpoints(sessionId)
}

export function loadRpgWeaveCheckpoint(checkpointId: string, sessionId: string): boolean {
  const checkpoint = getCheckpoints(sessionId).find((cp) => cp.id === checkpointId)
  if (!checkpoint) return false

  const session = getRpgSession(sessionId)
  if (!session) return false

  // Restore session state from checkpoint
  const updatedSession: RpgSession = {
    ...session,
    messages: session.messages.slice(0, checkpoint.createdAt),
    updatedAt: Date.now(),
  }

  saveRpgSession(updatedSession)
  return true
}
