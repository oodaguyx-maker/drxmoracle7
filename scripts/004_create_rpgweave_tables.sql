-- RpgWeave Mode Tables
-- Comprehensive RPG system with stats, combat, inventory, dialogue trees, party, world exploration

-- Character Stats & Progression
CREATE TABLE IF NOT EXISTS rpgweave_characters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL, -- Warrior, Mage, Rogue, Cleric, etc.
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  
  -- Core Stats
  strength INTEGER DEFAULT 10,
  dexterity INTEGER DEFAULT 10,
  constitution INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  wisdom INTEGER DEFAULT 10,
  charisma INTEGER DEFAULT 10,
  
  -- Combat Stats
  health_current INTEGER DEFAULT 100,
  health_max INTEGER DEFAULT 100,
  mana_current INTEGER DEFAULT 50,
  mana_max INTEGER DEFAULT 50,
  stamina_current INTEGER DEFAULT 100,
  stamina_max INTEGER DEFAULT 100,
  
  -- Progression
  skill_points INTEGER DEFAULT 0,
  talent_points INTEGER DEFAULT 0,
  
  -- Currency
  gold INTEGER DEFAULT 100,
  silver INTEGER DEFAULT 50,
  
  -- Reputation & Status
  renown INTEGER DEFAULT 0,
  titles TEXT[], -- JSON array of earned titles
  faction_standings TEXT, -- JSON object of faction relationships
  
  -- Location
  current_location TEXT DEFAULT 'Starting Village',
  world_id TEXT,
  
  avatar TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Inventory System
CREATE TABLE IF NOT EXISTS rpgweave_inventory (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES rpgweave_characters(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT FALSE,
  slot TEXT, -- weapon, armor, accessory, etc.
  acquired_at BIGINT NOT NULL
);

-- Items Database
CREATE TABLE IF NOT EXISTS rpgweave_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- weapon, armor, consumable, quest, etc.
  rarity TEXT DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  description TEXT,
  stats_bonus TEXT, -- JSON object of stat bonuses
  effects TEXT, -- JSON array of special effects
  value INTEGER DEFAULT 0, -- Gold value
  icon TEXT,
  created_at BIGINT NOT NULL
);

-- Skills & Abilities
CREATE TABLE IF NOT EXISTS rpgweave_skills (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES rpgweave_characters(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT TRUE
);

-- Party System
CREATE TABLE IF NOT EXISTS rpgweave_party_members (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES rpgweave_characters(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL, -- NPC or companion ID
  member_type TEXT DEFAULT 'npc', -- npc, companion, summon
  name TEXT NOT NULL,
  class TEXT,
  level INTEGER DEFAULT 1,
  
  -- Stats
  health_current INTEGER DEFAULT 100,
  health_max INTEGER DEFAULT 100,
  stats TEXT, -- JSON object of stats
  
  -- Relationship
  loyalty INTEGER DEFAULT 50, -- 0-100
  affection INTEGER DEFAULT 0, -- -100 to 100
  trust INTEGER DEFAULT 50, -- 0-100
  
  -- Combat
  combat_ai TEXT DEFAULT 'balanced', -- aggressive, balanced, defensive, support
  equipment TEXT, -- JSON array of equipped items
  
  joined_at BIGINT NOT NULL
);

-- World Exploration
CREATE TABLE IF NOT EXISTS rpgweave_worlds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  genre TEXT NOT NULL, -- fantasy, sci-fi, modern, post-apocalypse, etc.
  description TEXT,
  starting_location TEXT,
  map_data TEXT, -- JSON object for world map
  lore TEXT, -- Background lore
  factions TEXT, -- JSON array of factions
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Dynamic NPCs
CREATE TABLE IF NOT EXISTS rpgweave_npcs (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES rpgweave_worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT, -- merchant, quest_giver, companion, enemy, ruler, etc.
  description TEXT,
  personality TEXT,
  appearance TEXT,
  location TEXT,
  
  -- Stats (for combat NPCs)
  level INTEGER DEFAULT 1,
  stats TEXT, -- JSON object
  
  -- Relationship
  relationship INTEGER DEFAULT 0, -- -100 to 100
  faction TEXT,
  
  -- AI Memory
  memory TEXT, -- JSON array of interactions
  dialogue_tree TEXT, -- JSON object of dialogue options
  
  -- Quests
  quests_available TEXT, -- JSON array of quest IDs
  
  avatar TEXT,
  gallery TEXT[], -- Media from OodaEye34
  created_at BIGINT NOT NULL,
  last_interaction BIGINT
);

-- Dialogue System
CREATE TABLE IF NOT EXISTS rpgweave_dialogues (
  id TEXT PRIMARY KEY,
  npc_id TEXT NOT NULL REFERENCES rpgweave_npcs(id) ON DELETE CASCADE,
  dialogue_tree TEXT NOT NULL, -- JSON object of conversation tree
  skill_checks TEXT, -- JSON array of skill check requirements
  outcomes TEXT, -- JSON object of dialogue outcomes
  created_at BIGINT NOT NULL
);

-- Quests
CREATE TABLE IF NOT EXISTS rpgweave_quests (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES rpgweave_worlds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quest_giver TEXT, -- NPC ID
  objectives TEXT, -- JSON array of objectives
  rewards TEXT, -- JSON object of rewards (gold, items, exp, etc.)
  status TEXT DEFAULT 'available', -- available, active, completed, failed
  difficulty TEXT DEFAULT 'normal', -- easy, normal, hard, epic
  created_at BIGINT NOT NULL,
  completed_at BIGINT
);

-- Game Sessions
CREATE TABLE IF NOT EXISTS rpgweave_sessions (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES rpgweave_characters(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL REFERENCES rpgweave_worlds(id) ON DELETE CASCADE,
  
  -- Session State
  current_chapter TEXT,
  current_objective TEXT,
  party_members TEXT, -- JSON array of active party member IDs
  
  -- Progression
  story_progress INTEGER DEFAULT 0, -- 0-100%
  key_decisions TEXT, -- JSON array of major choices
  
  -- Combat State
  in_combat BOOLEAN DEFAULT FALSE,
  combat_state TEXT, -- JSON object for active combat
  
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Session Messages
CREATE TABLE IF NOT EXISTS rpgweave_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES rpgweave_sessions(id) ON DELETE CASCADE,
  speaker_id TEXT NOT NULL, -- character, npc, or 'narrator'
  speaker_type TEXT NOT NULL, -- player, npc, narrator, combat_system
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'dialogue', -- dialogue, action, combat, system, narration
  metadata TEXT, -- JSON object for additional data (damage, skill check results, etc.)
  timestamp BIGINT NOT NULL
);

-- Combat Encounters
CREATE TABLE IF NOT EXISTS rpgweave_combat (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES rpgweave_sessions(id) ON DELETE CASCADE,
  enemies TEXT NOT NULL, -- JSON array of enemy data
  turn_order TEXT, -- JSON array of initiative order
  current_turn TEXT, -- Character/NPC ID
  round_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- active, victory, defeat
  loot TEXT, -- JSON object of rewards
  started_at BIGINT NOT NULL,
  ended_at BIGINT
);

-- Checkpoints (Save Points)
CREATE TABLE IF NOT EXISTS rpgweave_checkpoints (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES rpgweave_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  character_state TEXT NOT NULL, -- JSON snapshot of character
  world_state TEXT NOT NULL, -- JSON snapshot of world state
  party_state TEXT, -- JSON snapshot of party
  inventory_state TEXT, -- JSON snapshot of inventory
  quest_state TEXT, -- JSON snapshot of active quests
  created_at BIGINT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE rpgweave_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpgweave_worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpgweave_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (temporarily disabled for Firebase auth)
CREATE POLICY "Users can manage their own RPG characters" ON rpgweave_characters FOR ALL USING (true);
CREATE POLICY "Users can manage their own RPG worlds" ON rpgweave_worlds FOR ALL USING (true);
CREATE POLICY "Users can manage their own RPG sessions" ON rpgweave_sessions FOR ALL USING (true);
