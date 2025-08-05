-- Remove theme_preference column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS theme_preference;