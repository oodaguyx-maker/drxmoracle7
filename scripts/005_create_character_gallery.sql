-- Create character gallery table for storing embeds in Supabase
-- This table stores gallery items (embed codes, URLs) for each character

CREATE TABLE IF NOT EXISTS public.character_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id TEXT NOT NULL,
  embed_code TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('embed', 'video', 'image')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.character_gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for character_gallery
CREATE POLICY "Users can view their own gallery items"
  ON public.character_gallery FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gallery items"
  ON public.character_gallery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gallery items"
  ON public.character_gallery FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gallery items"
  ON public.character_gallery FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster character lookups
CREATE INDEX IF NOT EXISTS idx_character_gallery_character_id 
  ON public.character_gallery(character_id);

CREATE INDEX IF NOT EXISTS idx_character_gallery_user_id 
  ON public.character_gallery(user_id);
