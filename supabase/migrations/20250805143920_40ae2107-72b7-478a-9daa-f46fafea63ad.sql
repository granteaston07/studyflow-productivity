-- Add repeat functionality to tasks table
ALTER TABLE public.tasks 
ADD COLUMN repeat_type text CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN repeat_interval integer DEFAULT 1,
ADD COLUMN repeat_end_date timestamp with time zone,
ADD COLUMN repeat_count integer,
ADD COLUMN parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Set default values for existing tasks
UPDATE public.tasks SET repeat_type = 'none' WHERE repeat_type IS NULL;