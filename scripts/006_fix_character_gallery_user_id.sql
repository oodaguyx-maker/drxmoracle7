-- Fix character_gallery table to use TEXT for user_id instead of UUID
-- This is needed because we're using Firebase Auth which uses text-based UIDs

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own gallery items" ON public.character_gallery;
DROP POLICY IF EXISTS "Users can insert their own gallery items" ON public.character_gallery;
DROP POLICY IF EXISTS "Users can update their own gallery items" ON public.character_gallery;
DROP POLICY IF EXISTS "Users can delete their own gallery items" ON public.character_gallery;

-- Drop the foreign key constraint
ALTER TABLE public.character_gallery
  DROP CONSTRAINT IF EXISTS character_gallery_user_id_fkey;

-- Change user_id column type from UUID to TEXT
ALTER TABLE public.character_gallery
  ALTER COLUMN user_id TYPE TEXT;

-- Recreate RLS policies without auth.uid() since we're using Firebase Auth
CREATE POLICY "Users can view their own gallery items"
  ON public.character_gallery FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own gallery items"
  ON public.character_gallery FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own gallery items"
  ON public.character_gallery FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own gallery items"
  ON public.character_gallery FOR DELETE
  USING (true);
