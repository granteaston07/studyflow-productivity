-- Add google_email and last_synced_at to google_classroom_connections
ALTER TABLE public.google_classroom_connections
  ADD COLUMN IF NOT EXISTS google_email TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_gc_connections_user_id
  ON public.google_classroom_connections(user_id);

-- Index to efficiently find GC-sourced tasks
CREATE INDEX IF NOT EXISTS idx_tasks_source_user
  ON public.tasks(user_id, source)
  WHERE source IS NOT NULL;
