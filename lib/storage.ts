// Client-side storage for BlackOracle Engine
// Uses localStorage for persistence

export interface Character {
  id: string
  name: string
  description: string
  personality: string
  scenario: string
  first_mes: string
  mes_example: string
  avatar?: string
  gallery?: string[] // URLs or base64 encoded media (images/videos)
  memories?: CharacterMemory[]
  attributes?: CharacterAttributes // added character attributes tracking
  attachedLorebooks?: string[] // IDs of attached lorebooks
  availableScenarios?: string[] // IDs of scenario templates available for this character
  tags?: string[] // Auto-learned and manual tags: gender, kinks, personality, species, etc
  isFavorite?: boolean // Star/favorite toggle
  souls?: OracleSoul[] // Multiple character editions/variants
  activeSoulId?: string // Currently active soul ID
  createdAt: number
  updatedAt: number
  // ChubAI/SillyTavern format support
  spec?: string
  spec_version?: string
  data?: {
    name?: string
    description?: string
    personality?: string
    scenario?: string
    first_mes?: string
    mes_example?: string
    creator_notes?: string
    system_prompt?: string
    post_history_instructions?: string
    alternate_greetings?: string[]
    tags?: string[]
  }
}

export interface CharacterAttributes {
  pregnant?: boolean
  pregnancyWeeks?: number
  children?: Array<{ name: string; age: number; father?: string }>
  marriedTo?: string // "user" or character ID or NPC name
  marriageDate?: number
  tattoos?: Array<{ description: string; location: string; dateAdded: number }>
  piercings?: Array<{ type: string; location: string; dateAdded: number }>
  scars?: Array<{ description: string; location: string; story?: string }>
  hairColor?: string
  hairLength?: string
  physicalChanges?: Array<{ description: string; dateChanged: number }>
  relationshipStatus?: string
  occupation?: string
  location?: string
  customAttributes?: Record<string, any>
}

export interface CharacterMemory {
  id: string
  content: string
  context: string
  importance: "low" | "medium" | "high" | "critical"
  timestamp: number
  relatedNodeIds?: string[]
}

export interface ChatNode {
  id: string
  characterId: string
  soulId?: string // Optional: which OracleSoul this node is for
  name: string
  title?: string // User-editable title
  messages: Message[]
  nodeMemories?: NodeMemory[]
  scenarioId?: string // Added scenario template reference
  createdAt: number
  updatedAt: number
}

export interface NodeMemory {
  id: string
  summary: string
  keyEvents: string[]
  emotionalTone: string
  timestamp: number
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  characterId?: string
  characterName?: string
  characterAvatar?: string
}

export interface LoreEntry {
  id: string
  name: string
  content: string
  keys: string[]
  lorebookId?: string // Optional parent lorebook
  importance?: "low" | "medium" | "high" | "critical"
  category?:
    | "Location"
    | "Kingdom"
    | "Faction"
    | "Race"
    | "Item"
    | "Magic"
    | "Character"
    | "Event"
    | "Creature"
    | "Lore"
    | "Technology"
    | "Religion"
    | "Culture"
    | "Economy"
    | "Language"
    | "Prophecy"
    | "Artifact"
    | "Ritual"
    | "Organization"
    | "Other"
  subcategory?: string // Flexible subcategory for detailed organization
  entryType?:
    | "place"
    | "person"
    | "object"
    | "concept"
    | "history"
    | "current"
    | "legend"
    | "fact"
    | "rumor"
    | "secret"
    | "common_knowledge"
  tags?: string[] // Additional flexible tags for categorization
  relatedEntries?: string[] // IDs of related lore entries
  generatedFromRoleplay?: boolean
  sourceNodeId?: string
  sourceCharacterId?: string
  mapPosition?: { x: number; y: number } // Normalized 0-1 coordinates for world map
  createdAt: number
  updatedAt?: number
}

export interface Lorebook {
  id: string
  name: string
  description: string
  entries: string[] // IDs of lore entries
  worldMapUrl?: string // Generated world map image URL
  worldMapData?: {
    width: number
    height: number
    generatedAt: number
    prompt: string
  }
  createdAt: number
  updatedAt: number
}

export interface LoreyConversation {
  id: string
  lorebookId: string
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>
  generatedEntries: string[] // IDs of lore entries created from this conversation
  createdAt: number
}

export interface MultiCharSession {
  id: string
  name: string
  title?: string
  characterIds: string[] // 1-5 characters
  includesUser: boolean
  messages: Message[]
  relationships: CharacterRelationship[]
  relationshipMap?: Record<string, string> // Added for character relationship descriptions
  currentSpeaker?: string
  currentNodeId?: string // Added for node navigation
  location?: string
  situation?: string
  focusMode?: FocusSession
  nodes: MultiCharNode[]
  modelId?: string // Added for AI model selection
  narratorEnabled?: boolean // Added for optional narrator
  turnOrder?: string[] // Added for turn management
  attachedLorebookIds?: string[] // Lorebooks attached to this session
  createdAt: number
  updatedAt: number
}

export interface CharacterRelationship {
  id: string
  fromCharacterId: string
  toCharacterId: string
  affection: number // -100 to 100
  trust: number // 0 to 100
  attraction: number // 0 to 100
  rivalry: number // 0 to 100
  relationStatus: string // e.g., "brother", "wife", "friend", "enemy", "stranger", etc.
  notes: string[]
  lastInteraction: number
}

export interface MultiCharMessage {
  id: string
  speakerId: string // Character ID or "user"
  content: string
  timestamp: number
  turnReasoning?: string // Why this character spoke
}

export interface MultiCharNode {
  id: string
  title: string
  sessionId: string
  messages: MultiCharMessage[]
  scenarioId?: string // Added scenario template reference
  createdAt: number
  updatedAt: number
}

export interface FocusSession {
  id: string
  participantIds: string[] // Subset of session characters
  messages: MultiCharMessage[]
  startedAt: number
  endedAt?: number
  narrationSummary?: string // Generated summary to merge back
}

// Scenario Template Interfaces
export interface ScenarioTemplate {
  id: string
  name: string
  description: string
  location: string
  situation: string
  mood?: string
  timeOfDay?: string
  weather?: string
  tags?: string[]
  characterIds?: string[] // Characters this scenario is curated for
  createdAt: number
  updatedAt: number
}

// HeartFire World interfaces
export interface HeartFireWorld {
  id: string
  name: string
  personaId: string // User's selected persona
  startingScenario: string
  currentLocation: string
  currentSituation: string
  timeOfDay: string
  weather: string
  npcs: WorldNPC[] // Dynamically created NPCs
  encounters: WorldEncounter[]
  worldState: WorldState
  messages: Message[]
  nodes: HeartFireNode[] // Added nodes for HeartFire
  selectedCharacterIds?: string[] // Characters selected for this world
  favoriteTags?: string[] // Tags for OodaEye34 avatar generation
  createdAt: number
  updatedAt: number
}

export interface HeartFireNode {
  id: string
  title: string
  worldId: string
  messages: Message[]
  scenarioId?: string
  createdAt: number
  updatedAt: number
}

export interface HeartFireMessage {
  id: string
  speakerId: string // "user", "narrator", or NPC ID
  speakerType: "user" | "narrator" | "npc" | "companion" // Added companion type
  content: string
  location: string
  timestamp: number
  turnType: "action" | "narrative" | "dialogue"
  isNarration?: boolean // Explicit narration flag
}

export interface WorldNPC {
  id: string
  name: string
  description: string
  personality: string
  appearance: string
  role: string // "shopkeeper", "questgiver", "companion", etc.
  avatar?: string
  gallery?: string[] // Generated from OodaEye34
  relationshipToPlayer: number // -100 to 100
  trustLevel: number // 0 to 100
  attractionLevel: number // 0 to 100
  lastInteraction: number
  backstory: string
  currentGoals: string[]
  isRecurring: boolean // Will appear again
}

export interface WorldEncounter {
  id: string
  type: "social" | "action" | "discovery" | "intimate" | "combat" | "mystery"
  description: string
  participants: string[] // NPC IDs
  location: string
  timestamp: number
  resolved: boolean
  outcome?: string
}

export interface WorldState {
  playerReputation: number
  timeProgressed: number // in-game minutes
  weatherConditions: string[]
  activePlotlines: string[]
  discoveredLocations: string[]
  companionIds: string[] // NPCs traveling with player
  inventoryItems: string[]
  achievements: string[]
}

export interface Persona {
  id: string
  name: string
  description: string
  appearance: string
  personality: string
  background: string
  avatar?: string
  attachedLorebooks?: string[] // Added lorebooks to personas
  createdAt: number
  updatedAt: number
}

// OodaOnline types for P2P chat sessions
export interface OodaOnlineSession {
  id: string
  name: string
  hostUserId: string
  inviteCode: string
  isActive: boolean
  guestConnected: boolean
  messages: Message[]
  createdAt: number
  expiresAt?: number
  characterProfile?: OodaProfile
}

export interface OodaOnlineMessage {
  id: string
  senderId: string // "host" or "guest"
  senderName: string
  content: string
  timestamp: number
}

export interface OodaProfile {
  id: string
  name: string
  avatar?: string
  description?: string
  personality?: string
  kinks?: string[]
  images?: string[]
  flistUrl?: string
  importedFrom?: "flist" | "manual"
  createdAt: number
}

// Proposed Lore Card interface for AI-generated lore suggestions
export interface ProposedLoreCard {
  id: string
  name: string
  content: string
  keys: string[]
  importance: "low" | "medium" | "high" | "critical"
  category?: string
  subcategory?: string // Added subcategory
  entryType?: string // Added entry type
  tags?: string[] // Added tags
  conversationId: string
  timestamp: number
}

// CharCreate profile interface for OodaEye34
export interface CharCreateProfile {
  id: string
  name: string
  description?: string
  images: DownloadedImage[]
  createdAt: number
  updatedAt: number
}

export interface DownloadedImage {
  id: number
  url: string
  previewUrl: string
  tags: string
  downloadedAt: number
  source?: string
  selected?: boolean // For CharCreate selection
}

// OracleSoul interface for character variants
export interface OracleSoul {
  id: string
  name: string // e.g., "Medieval Queen", "Spaceship Captain", "Modern Housewife"
  description: string
  genre: string // e.g., "Medieval", "Sci-Fi", "Modern", "Fantasy"
  // Override character fields for this soul
  personality?: string
  scenario?: string
  first_mes?: string
  mes_example?: string
  avatar?: string
  gallery?: string[] // Soul-specific gallery
  tags?: string[]
  // Soul-specific lore and scenarios
  attachedLorebooks?: string[]
  availableScenarios?: string[]
  // JSON config data
  configData?: any // Full JSON config for this soul
  createdAt: number
  updatedAt: number
}

// Storage keys
const STORAGE_KEYS = {
  CHARACTERS: "rp_characters",
  NODES: "rp_nodes",
  LORE: "rp_lore",
  SETTINGS: "rp_settings",
  LOREBOOKS: "rp_lorebooks",
  LOREY_CONVERSATIONS: "rp_lorey_conversations",
  MULTI_CHAR_SESSIONS: "rp_multi_char_sessions",
  SCENARIO_TEMPLATES: "rp_scenario_templates", // Added scenario templates storage
  HEARTFIRE_WORLDS: "rp_heartfire_worlds",
  PERSONAS: "rp_personas",
  OODA_ONLINE_SESSIONS: "rp_ooda_online_sessions",
  OODA_PROFILES: "rp_ooda_profiles",
  PROPOSED_LORE_CARDS: "rp_proposed_lore_cards",
  ACTIVE_PERSONA_ID: "activePersonaId", // Updated active persona storage key
  CHARCREATE_PROFILES: "rp_charcreate_profiles",
  IMAGE_GEN_SYSTEM_PROMPT: "imageGenSystemPrompt", // Added for image generation system prompt
} as const

// Characters
export function getCharacters(): Character[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.CHARACTERS)
  return data ? JSON.parse(data) : []
}

export function saveCharacter(character: Character): boolean {
  try {
    const characters = getCharacters()
    const index = characters.findIndex((c) => c.id === character.id)

    if (index >= 0) {
      characters[index] = character
    } else {
      characters.push(character)
    }

    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters))
    return true
  } catch (error) {
    console.error("[v0] Failed to save character:", error)
    return false
  }
}

export function deleteCharacter(id: string): void {
  const characters = getCharacters().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters))

  // Also delete associated nodes
  const nodes = getNodes().filter((n) => n.characterId !== id)
  localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes))
}

export function getCharacter(id: string): Character | undefined {
  return getCharacters().find((c) => c.id === id)
}

export function updateCharacterAttributes(characterId: string, attributes: Partial<CharacterAttributes>): void {
  const character = getCharacter(characterId)
  if (!character) return

  character.attributes = {
    ...character.attributes,
    ...attributes,
  }
  character.updatedAt = Date.now()
  saveCharacter(character)
}

export function getCharacterAttributes(characterId: string): CharacterAttributes {
  const character = getCharacter(characterId)
  return character?.attributes || {}
}

// Chat Nodes
export function getNodes(characterId?: string): ChatNode[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.NODES)
  const nodes = data ? JSON.parse(data) : []
  return characterId ? nodes.filter((n: ChatNode) => n.characterId === characterId) : nodes
}

export function saveNode(node: ChatNode): void {
  if (typeof window === "undefined") {
    console.warn("[v0] Cannot save node on server side")
    return
  }

  try {
    const nodes = getNodes()
    const index = nodes.findIndex((n) => n.id === node.id)

    if (index >= 0) {
      nodes[index] = node
    } else {
      nodes.push(node)
    }

    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes))
    console.log("[v0] Node saved successfully:", node.id)
  } catch (error) {
    console.error("[v0] Failed to save node:", error)
  }
}

export function deleteNode(id: string): void {
  if (typeof window === "undefined") {
    console.warn("[v0] Cannot delete node on server side")
    return
  }

  try {
    const nodes = getNodes().filter((n) => n.id !== id)
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes))
    console.log("[v0] Node deleted successfully:", id)
  } catch (error) {
    console.error("[v0] Failed to delete node:", error)
  }
}

export function getNode(id: string): ChatNode | undefined {
  try {
    return getNodes().find((n) => n.id === id)
  } catch (error) {
    console.error("[v0] Failed to get node:", error)
    return undefined
  }
}

// Lore
export function getLoreEntries(lorebookId?: string): LoreEntry[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.LORE)
  const entries = data ? JSON.parse(data) : []
  return lorebookId ? entries.filter((e: LoreEntry) => e.lorebookId === lorebookId) : entries
}

export function saveLoreEntry(entry: LoreEntry): void {
  const entries = getLoreEntries()
  const index = entries.findIndex((e) => e.id === entry.id)

  entry.updatedAt = Date.now()

  if (index >= 0) {
    entries[index] = entry
  } else {
    entries.push(entry)
  }

  localStorage.setItem(STORAGE_KEYS.LORE, JSON.stringify(entries))
}

export function deleteLoreEntry(id: string): void {
  const entries = getLoreEntries().filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEYS.LORE, JSON.stringify(entries))
}

export function getLoreEntry(id: string): LoreEntry | undefined {
  return getLoreEntries().find((e) => e.id === id)
}

// Lorebook management functions
export function getLorebooks(): Lorebook[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.LOREBOOKS)
  return data ? JSON.parse(data) : []
}

export function saveLorebook(lorebook: Lorebook): void {
  const lorebooks = getLorebooks()
  const index = lorebooks.findIndex((l) => l.id === lorebook.id)

  lorebook.updatedAt = Date.now()

  if (index >= 0) {
    lorebooks[index] = lorebook
  } else {
    lorebooks.push(lorebook)
  }

  localStorage.setItem(STORAGE_KEYS.LOREBOOKS, JSON.stringify(lorebooks))
}

export function deleteLorebook(id: string): void {
  const lorebooks = getLorebooks().filter((l) => l.id !== id)
  localStorage.setItem(STORAGE_KEYS.LOREBOOKS, JSON.stringify(lorebooks))

  // Also remove from characters
  const characters = getCharacters()
  characters.forEach((char) => {
    if (char.attachedLorebooks?.includes(id)) {
      char.attachedLorebooks = char.attachedLorebooks.filter((lbId) => lbId !== id)
      saveCharacter(char)
    }
  })
}

export function getLorebook(id: string): Lorebook | undefined {
  return getLorebooks().find((l) => l.id === id)
}

export function addEntryToLorebook(lorebookId: string, entryId: string): void {
  const lorebook = getLorebook(lorebookId)
  if (!lorebook) return

  if (!lorebook.entries.includes(entryId)) {
    lorebook.entries.push(entryId)
    saveLorebook(lorebook)
  }
}

export function removeEntryFromLorebook(lorebookId: string, entryId: string): void {
  const lorebook = getLorebook(lorebookId)
  if (!lorebook) return

  lorebook.entries = lorebook.entries.filter((id) => id !== entryId)
  saveLorebook(lorebook)
}

// LoreyAI conversation management
export function getLoreyConversations(): LoreyConversation[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.LOREY_CONVERSATIONS)
  return data ? JSON.parse(data) : []
}

export function saveLoreyConversation(conversation: LoreyConversation): void {
  const conversations = getLoreyConversations()
  const index = conversations.findIndex((c) => c.id === conversation.id)

  if (index >= 0) {
    conversations[index] = conversation
  } else {
    conversations.push(conversation)
  }

  localStorage.setItem(STORAGE_KEYS.LOREY_CONVERSATIONS, JSON.stringify(conversations))
}

export function getLoreyConversation(id: string): LoreyConversation | undefined {
  return getLoreyConversations().find((c) => c.id === id)
}

export function getRelevantLore(text: string, characterId?: string, personaId?: string): LoreEntry[] {
  const allLore = getLoreEntries()
  const character = characterId ? getCharacter(characterId) : null
  const persona = personaId ? getPersona(personaId) : getActivePersona()

  // Collect lorebook IDs from character and persona
  const lorebookIds: string[] = []
  if (character?.attachedLorebooks) {
    lorebookIds.push(...character.attachedLorebooks)
  }
  if (persona?.attachedLorebooks) {
    lorebookIds.push(...persona.attachedLorebooks)
  }

  // Get lore from attached lorebooks
  let relevantLore = allLore
  if (lorebookIds.length > 0) {
    const attachedLoreIds = lorebookIds.flatMap((lbId) => getLorebook(lbId)?.entries || [])
    relevantLore = allLore.filter((entry) => attachedLoreIds.includes(entry.id))
  }

  // Filter by keywords in the text
  const lowerText = text.toLowerCase()
  const triggered = relevantLore.filter((entry) => {
    return entry.keys.some((key) => lowerText.includes(key.toLowerCase()))
  })

  // Sort by importance
  const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 }
  triggered.sort((a, b) => {
    const aScore = importanceOrder[a.importance || "medium"]
    const bScore = importanceOrder[b.importance || "medium"]
    return bScore - aScore
  })

  // Return top 10 most relevant
  return triggered.slice(0, 10)
}

// Settings
export interface AppSettings {
  apiKeys: {
    xai?: string // Added xAI API key (primary)
    openRouter?: string // Now secondary
    groq?: string // Added Groq API key (tertiary)
    gemini?: string // Added Gemini API key (Loreworld only)
  }
  defaultModel: string
  loreyModel?: string
  temperature: number
  maxTokens: number
  globalSystemPrompt?: string
  favoriteTags?: string[]
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    return {
      apiKeys: {},
      defaultModel: "xai/grok-4.1", // Updated default model to Grok 4.1 via Vercel AI Gateway
      loreyModel: "gemini-2.0-flash-exp",
      temperature: 0.7,
      maxTokens: 2000,
      globalSystemPrompt: "",
      favoriteTags: [],
    }
  }

  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return data
    ? JSON.parse(data)
    : {
        apiKeys: {},
        defaultModel: "xai/grok-4.1", // Updated default model to Grok 4.1 via Vercel AI Gateway
        loreyModel: "gemini-2.0-flash-exp",
        temperature: 0.7,
        maxTokens: 2000,
        globalSystemPrompt: "",
        favoriteTags: [],
      }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Utility to generate IDs
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Memory management functions for BlackOracle Engine
export function addCharacterMemory(characterId: string, memory: Omit<CharacterMemory, "id">): void {
  const character = getCharacter(characterId)
  if (!character) return

  const newMemory: CharacterMemory = {
    id: generateId(),
    ...memory,
  }

  character.memories = [...(character.memories || []), newMemory]
  saveCharacter(character)
}

export function getCharacterMemories(
  characterId: string,
  importance?: CharacterMemory["importance"],
): CharacterMemory[] {
  const character = getCharacter(characterId)
  if (!character?.memories) return []

  if (importance) {
    return character.memories.filter((m) => m.importance === importance)
  }

  return character.memories
}

export function addNodeMemory(nodeId: string, memory: Omit<NodeMemory, "id">): void {
  const node = getNode(nodeId)
  if (!node) return

  const newMemory: NodeMemory = {
    id: generateId(),
    ...memory,
  }

  node.nodeMemories = [...(node.nodeMemories || []), newMemory]
  saveNode(node)
}

export function getNodeMemories(nodeId: string): NodeMemory[] {
  const node = getNode(nodeId)
  return node?.nodeMemories || []
}

// Multi-Character Session Management
export function getMultiCharSessions(): MultiCharSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.MULTI_CHAR_SESSIONS)
  return data ? JSON.parse(data) : []
}

export function saveMultiCharSession(session: MultiCharSession): void {
  const sessions = getMultiCharSessions()
  const index = sessions.findIndex((s) => s.id === session.id)

  session.updatedAt = Date.now()

  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.push(session)
  }

  localStorage.setItem(STORAGE_KEYS.MULTI_CHAR_SESSIONS, JSON.stringify(sessions))
}

export function getMultiCharSession(id: string): MultiCharSession | undefined {
  return getMultiCharSessions().find((s) => s.id === id)
}

export function deleteMultiCharSession(id: string): void {
  const sessions = getMultiCharSessions().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEYS.MULTI_CHAR_SESSIONS, JSON.stringify(sessions))
}

export function updateMultiCharSession(id: string, updates: Partial<MultiCharSession>): void {
  const sessions = getMultiCharSessions()
  const index = sessions.findIndex((s) => s.id === id)

  if (index >= 0) {
    sessions[index] = { ...sessions[index], ...updates, updatedAt: Date.now() }
    localStorage.setItem(STORAGE_KEYS.MULTI_CHAR_SESSIONS, JSON.stringify(sessions))
  }
}

// Relationship Management
export function getRelationship(sessionId: string, fromId: string, toId: string): CharacterRelationship | undefined {
  const session = getMultiCharSession(sessionId)
  return session?.relationships.find((r) => r.fromCharacterId === fromId && r.toCharacterId === toId)
}

export function updateRelationship(sessionId: string, relationship: CharacterRelationship): void {
  const session = getMultiCharSession(sessionId)
  if (!session) return

  const index = session.relationships.findIndex(
    (r) => r.fromCharacterId === relationship.fromCharacterId && r.toCharacterId === relationship.toCharacterId,
  )

  if (index >= 0) {
    session.relationships[index] = relationship
  } else {
    session.relationships.push(relationship)
  }

  saveMultiCharSession(session)
}

export function initializeRelationships(sessionId: string, characterIds: string[]): void {
  const session = getMultiCharSession(sessionId)
  if (!session) return

  const allParticipants = [...characterIds]
  if (session.includesUser) {
    allParticipants.push("user")
  }

  // Create bidirectional relationships
  for (let i = 0; i < allParticipants.length; i++) {
    for (let j = i + 1; j < allParticipants.length; j++) {
      const rel1: CharacterRelationship = {
        id: generateId(),
        fromCharacterId: allParticipants[i],
        toCharacterId: allParticipants[j],
        affection: 0,
        trust: 50,
        attraction: 0,
        rivalry: 0,
        relationStatus: "stranger",
        notes: [],
        lastInteraction: Date.now(),
      }
      const rel2: CharacterRelationship = {
        id: generateId(),
        fromCharacterId: allParticipants[j],
        toCharacterId: allParticipants[i],
        affection: 0,
        trust: 50,
        attraction: 0,
        rivalry: 0,
        relationStatus: "stranger",
        notes: [],
        lastInteraction: Date.now(),
      }
      session.relationships.push(rel1, rel2)
    }
  }

  saveMultiCharSession(session)
}

// Scenario Template Management
export function getScenarioTemplates(): ScenarioTemplate[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.SCENARIO_TEMPLATES)
  return data ? JSON.parse(data) : []
}

export function saveScenarioTemplate(template: ScenarioTemplate): void {
  const templates = getScenarioTemplates()
  const index = templates.findIndex((t) => t.id === template.id)

  template.updatedAt = Date.now()

  if (index >= 0) {
    templates[index] = template
  } else {
    templates.push(template)
  }

  localStorage.setItem(STORAGE_KEYS.SCENARIO_TEMPLATES, JSON.stringify(templates))
}

export function deleteScenarioTemplate(id: string): void {
  const templates = getScenarioTemplates().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.SCENARIO_TEMPLATES, JSON.stringify(templates))
}

export function getScenarioTemplate(id: string): ScenarioTemplate | undefined {
  return getScenarioTemplates().find((t) => t.id === id)
}

export function getHeartFireWorlds(): HeartFireWorld[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.HEARTFIRE_WORLDS)
  return data ? JSON.parse(data) : []
}

export function saveHeartFireWorld(world: HeartFireWorld): void {
  const worlds = getHeartFireWorlds()
  const index = worlds.findIndex((w) => w.id === world.id)

  world.updatedAt = Date.now()

  if (index >= 0) {
    worlds[index] = world
  } else {
    worlds.push(world)
  }

  localStorage.setItem(STORAGE_KEYS.HEARTFIRE_WORLDS, JSON.stringify(worlds))
}

export function getHeartFireWorld(id: string): HeartFireWorld | undefined {
  return getHeartFireWorlds().find((w) => w.id === id)
}

export function deleteHeartFireWorld(id: string): void {
  const worlds = getHeartFireWorlds().filter((w) => w.id !== id)
  localStorage.setItem(STORAGE_KEYS.HEARTFIRE_WORLDS, JSON.stringify(worlds))
}

export function getPersonas(): Persona[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.PERSONAS)
  return data ? JSON.parse(data) : []
}

export function savePersona(persona: Persona): void {
  const personas = getPersonas()
  const index = personas.findIndex((p) => p.id === persona.id)

  persona.updatedAt = Date.now()

  if (index >= 0) {
    personas[index] = persona
  } else {
    personas.push(persona)
  }

  localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(personas))
}

export function getPersona(id: string): Persona | undefined {
  return getPersonas().find((p) => p.id === id)
}

export function deletePersona(id: string): void {
  const personas = getPersonas().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify(personas))
}

export function addNPCToWorld(worldId: string, npc: WorldNPC): void {
  const world = getHeartFireWorld(worldId)
  if (!world) return

  world.npcs.push(npc)
  saveHeartFireWorld(world)
}

export function updateNPC(worldId: string, npcId: string, updates: Partial<WorldNPC>): void {
  const world = getHeartFireWorld(worldId)
  if (!world) return

  const npcIndex = world.npcs.findIndex((n) => n.id === npcId)
  if (npcIndex >= 0) {
    world.npcs[npcIndex] = { ...world.npcs[npcIndex], ...updates }
    saveHeartFireWorld(world)
  }
}

// OodaOnline Session Management
export function getOodaOnlineSessions(): OodaOnlineSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.OODA_ONLINE_SESSIONS)
  return data ? JSON.parse(data) : []
}

export function saveOodaOnlineSession(session: OodaOnlineSession): void {
  const sessions = getOodaOnlineSessions()
  const index = sessions.findIndex((s) => s.id === session.id)

  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.push(session)
  }

  localStorage.setItem(STORAGE_KEYS.OODA_ONLINE_SESSIONS, JSON.stringify(sessions))
}

export function getOodaOnlineSession(id: string): OodaOnlineSession | undefined {
  return getOodaOnlineSessions().find((s) => s.id === id)
}

export function deleteOodaOnlineSession(id: string): void {
  const sessions = getOodaOnlineSessions().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEYS.OODA_ONLINE_SESSIONS, JSON.stringify(sessions))
}

// OodaProfile Management
export function getOodaProfiles(): OodaProfile[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.OODA_PROFILES)
  return data ? JSON.parse(data) : []
}

export function saveOodaProfile(profile: OodaProfile): void {
  const profiles = getOodaProfiles()
  const index = profiles.findIndex((p) => p.id === profile.id)

  if (index >= 0) {
    profiles[index] = profile
  } else {
    profiles.push(profile)
  }

  localStorage.setItem(STORAGE_KEYS.OODA_PROFILES, JSON.stringify(profiles))
}

export function getOodaProfile(id: string): OodaProfile | undefined {
  return getOodaProfiles().find((p) => p.id === id)
}

export function deleteOodaProfile(id: string): void {
  const profiles = getOodaProfiles().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.OODA_PROFILES, JSON.stringify(profiles))
}

// Proposed Lore Card Management
export function getProposedLoreCards(): ProposedLoreCard[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.PROPOSED_LORE_CARDS)
  return data ? JSON.parse(data) : []
}

export function saveProposedLoreCard(card: ProposedLoreCard): void {
  const cards = getProposedLoreCards()
  const index = cards.findIndex((c) => c.id === card.id)

  if (index >= 0) {
    cards[index] = card
  } else {
    cards.push(card)
  }

  localStorage.setItem(STORAGE_KEYS.PROPOSED_LORE_CARDS, JSON.stringify(cards))
}

export function deleteProposedLoreCard(id: string): void {
  const cards = getProposedLoreCards().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.PROPOSED_LORE_CARDS, JSON.stringify(cards))
}

export function acceptProposedLoreCard(cardId: string, lorebookId?: string): LoreEntry {
  const card = getProposedLoreCards().find((c) => c.id === cardId)
  if (!card) throw new Error("Card not found")

  const entry: LoreEntry = {
    id: generateId(),
    name: card.name,
    content: card.content,
    keys: card.keys,
    importance: card.importance,
    category: card.category as any,
    subcategory: card.subcategory,
    entryType: card.entryType as any,
    tags: card.tags,
    generatedFromRoleplay: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  saveLoreEntry(entry)

  if (lorebookId) {
    addEntryToLorebook(lorebookId, entry.id)
  }

  deleteProposedLoreCard(cardId)

  return entry
}

// Active Persona Management
export function getUserPersona(): Persona | null {
  return getActivePersona()
}

export function getActivePersona(): Persona | null {
  if (typeof window === "undefined") return null
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERSONA_ID)
  if (!activeId) return null
  return getPersona(activeId) || null
}

export function setActivePersona(personaId: string | null): void {
  if (personaId === null) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PERSONA_ID)
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA_ID, personaId)
  }
}

// CharCreate profile management functions
export function getCharCreateProfiles(): CharCreateProfile[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.CHARCREATE_PROFILES)
  return data ? JSON.parse(data) : []
}

export function saveCharCreateProfile(profile: CharCreateProfile): void {
  const profiles = getCharCreateProfiles()
  const index = profiles.findIndex((p) => p.id === profile.id)

  profile.updatedAt = Date.now()

  if (index >= 0) {
    profiles[index] = profile
  } else {
    profiles.push(profile)
  }

  localStorage.setItem(STORAGE_KEYS.CHARCREATE_PROFILES, JSON.stringify(profiles))
}

export function deleteCharCreateProfile(id: string): void {
  const profiles = getCharCreateProfiles().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.CHARCREATE_PROFILES, JSON.stringify(profiles))
}

export function getCharCreateProfile(id: string): CharCreateProfile | undefined {
  return getCharCreateProfiles().find((p) => p.id === id)
}

// World Map Generation Functions
export function canGenerateWorldMap(lorebookId: string): boolean {
  const lorebook = getLorebook(lorebookId)
  if (!lorebook) return false

  const entries = lorebook.entries.map((id) => getLoreEntry(id)).filter(Boolean) as LoreEntry[]

  // Count location-type entries (Location, Kingdom, Faction with geographical context)
  const locationEntries = entries.filter(
    (e) => e.category === "Location" || e.category === "Kingdom" || e.category === "Faction",
  )

  return locationEntries.length >= 3
}

export function saveWorldMap(lorebookId: string, mapUrl: string, mapData: any): void {
  const lorebook = getLorebook(lorebookId)
  if (!lorebook) return

  lorebook.worldMapUrl = mapUrl
  lorebook.worldMapData = mapData
  saveLorebook(lorebook)
}

// Image Generation System Prompt Management
export function getImageGenSystemPrompt(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEYS.IMAGE_GEN_SYSTEM_PROMPT)
}

export function setImageGenSystemPrompt(prompt: string): void {
  localStorage.setItem(STORAGE_KEYS.IMAGE_GEN_SYSTEM_PROMPT, prompt)
}

export function deleteImageGenSystemPrompt(): void {
  localStorage.removeItem(STORAGE_KEYS.IMAGE_GEN_SYSTEM_PROMPT)
}

export function createLoreFromRoleplay(params: {
  name: string
  content: string
  keys?: string[]
  category?: LoreEntry["category"]
  importance?: LoreEntry["importance"]
  nodeId: string
  characterId?: string
  lorebookId?: string
}): LoreEntry {
  const entry: LoreEntry = {
    id: generateId(),
    name: params.name,
    content: params.content,
    keys: params.keys || [params.name.toLowerCase()],
    importance: params.importance || "medium",
    category: params.category,
    generatedFromRoleplay: true,
    sourceNodeId: params.nodeId,
    sourceCharacterId: params.characterId,
    lorebookId: params.lorebookId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  saveLoreEntry(entry)

  // If lorebook is specified, add to it
  if (params.lorebookId) {
    addEntryToLorebook(params.lorebookId, entry.id)
  }

  return entry
}

export function suggestLoreFromConversation(messages: Message[]): {
  suggestedName: string
  suggestedContent: string
  suggestedKeys: string[]
} {
  // Take the last few messages as context
  const recentMessages = messages.slice(-5)
  const content = recentMessages.map((m) => `${m.role === "user" ? "User" : "Character"}: ${m.content}`).join("\n\n")

  // Extract potential keywords (this is a simple implementation)
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4)
  const uniqueWords = Array.from(new Set(words)).slice(0, 5)

  return {
    suggestedName: `Roleplay Lore - ${new Date().toLocaleDateString()}`,
    suggestedContent: content,
    suggestedKeys: uniqueWords,
  }
}

// OracleSoul management functions
export function addSoulToCharacter(
  characterId: string,
  soul: Omit<OracleSoul, "id" | "createdAt" | "updatedAt">,
): void {
  const character = getCharacter(characterId)
  if (!character) return

  const newSoul: OracleSoul = {
    id: generateId(),
    ...soul,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  character.souls = [...(character.souls || []), newSoul]

  // Set as active soul if it's the first one
  if (!character.activeSoulId && character.souls.length === 1) {
    character.activeSoulId = newSoul.id
  }

  character.updatedAt = Date.now()
  saveCharacter(character)
}

export function updateSoul(characterId: string, soulId: string, updates: Partial<OracleSoul>): void {
  const character = getCharacter(characterId)
  if (!character?.souls) return

  const soulIndex = character.souls.findIndex((s) => s.id === soulId)
  if (soulIndex === -1) return

  character.souls[soulIndex] = {
    ...character.souls[soulIndex],
    ...updates,
    updatedAt: Date.now(),
  }

  character.updatedAt = Date.now()
  saveCharacter(character)
}

export function deleteSoul(characterId: string, soulId: string): void {
  const character = getCharacter(characterId)
  if (!character?.souls) return

  character.souls = character.souls.filter((s) => s.id !== soulId)

  // If deleted soul was active, set another soul or default
  if (character.activeSoulId === soulId) {
    character.activeSoulId = character.souls.length > 0 ? character.souls[0].id : undefined
  }

  character.updatedAt = Date.now()
  saveCharacter(character)

  // Also delete nodes associated with this soul
  const nodes = getNodes(characterId).filter((n) => n.soulId === soulId)
  nodes.forEach((node) => deleteNode(node.id))
}

export function setActiveSoul(characterId: string, soulId: string | undefined): void {
  const character = getCharacter(characterId)
  if (!character) return

  character.activeSoulId = soulId
  character.updatedAt = Date.now()
  saveCharacter(character)
}

export function getActiveSoul(character: Character): OracleSoul | null {
  if (!character.souls || character.souls.length === 0) return null
  if (!character.activeSoulId) return null
  return character.souls.find((s) => s.id === character.activeSoulId) || null
}

export function getSoulById(character: Character, soulId: string): OracleSoul | undefined {
  return character.souls?.find((s) => s.id === soulId)
}

// Helper function to sync lore across all contexts
export function syncLoreEntryAcrossAll(entryId: string): void {
  const entry = getLoreEntry(entryId)
  if (!entry) return

  // Trigger a storage event to notify all open tabs/windows
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "lore-entries",
      newValue: JSON.stringify(getLoreEntries()),
      url: window.location.href,
      storageArea: localStorage,
    }),
  )
}

// Listener for cross-tab lore updates
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "lore-entries" || e.key === "lorebooks") {
      // Refresh lore data in current context
      window.dispatchEvent(new CustomEvent("lore-updated"))
    }
  })
}
