-- Add repeat functionality columns to tasks table
ALTER TABLE public.tasks
ADD COLUMN repeat_type text,
ADD COLUMN repeat_interval integer DEFAULT 1,
ADD COLUMN repeat_end_date timestamp with time zone,
ADD COLUMN repeat_count integer,
ADD COLUMN parent_task_id uuid;