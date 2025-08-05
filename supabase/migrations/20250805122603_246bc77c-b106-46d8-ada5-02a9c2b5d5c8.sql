-- Add sort_order column to tasks table to persist manual task ordering
ALTER TABLE public.tasks ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX idx_tasks_sort_order ON public.tasks(sort_order);

-- Update existing tasks to have sort_order based on creation date (newest first)
UPDATE public.tasks 
SET sort_order = (
  SELECT row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) 
  FROM public.tasks t2 
  WHERE t2.id = public.tasks.id
);

-- Enable real-time updates for tasks table
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;