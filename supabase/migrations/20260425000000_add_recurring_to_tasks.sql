ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurring TEXT DEFAULT 'none'
  CHECK (recurring IN ('none', 'daily', 'weekly'));
