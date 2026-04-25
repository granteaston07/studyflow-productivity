-- Expand task status to support review and blocked states
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('pending', 'in-progress', 'review', 'blocked', 'completed', 'overdue'));
