-- StoryScape Mode Database Schema

-- Story Scripts (created in editor)
CREATE TABLE IF NOT EXISTS storyscape_stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL, -- fantasy, modern, sci-fi, post-apocalypse, horror, etc.
  estimated_duration TEXT, -- short, medium, long
  difficulty TEXT, -- easy, medium, hard
  main_characters JSONB, -- [{id, name, description, role, avatar}]
  world_setting TEXT,
  initial_situation TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Story Chapters
CREATE TABLE IF NOT EXISTS storyscape_chapters (
  id TEXT PRIMARY KEY,
  story_id TEXT REFERENCES storyscape_stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT[],
  estimated_duration INTEGER, -- minutes
  initial_narrative TEXT NOT NULL,
  npcs JSONB, -- [{id, name, description, role}]
  locations TEXT[],
  key_choices JSONB, -- [{id, text, consequences}]
  completion_criteria TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, chapter_number)
);

-- Active StoryScape Sessions (user playthroughs)
CREATE TABLE IF NOT EXISTS storyscape_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  story_id TEXT REFERENCES storyscape_stories(id) ON DELETE CASCADE,
  session_name TEXT,
  current_chapter_number INTEGER DEFAULT 1,
  chapter_summaries JSONB, -- [{chapterNumber, summary, choices}]
  character_states JSONB, -- Dynamic character tracking
  world_state JSONB, -- Dynamic world variables
  decisions_made JSONB[], -- [{chapterId, decision, timestamp, impact}]
  ending_achieved TEXT, -- null until story complete
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  playtime_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chapter Checkpoints
CREATE TABLE IF NOT EXISTS storyscape_checkpoints (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES storyscape_sessions(id) ON DELETE CASCADE,
  chapter_id TEXT REFERENCES storyscape_chapters(id) ON DELETE CASCADE,
  checkpoint_name TEXT,
  messages JSONB, -- Full message history up to this point
  character_states JSONB,
  world_state JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE storyscape_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyscape_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyscape_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyscape_checkpoints ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies disabled for Firebase auth compatibility
-- Users authenticated via Firebase, data secured by user_id column
