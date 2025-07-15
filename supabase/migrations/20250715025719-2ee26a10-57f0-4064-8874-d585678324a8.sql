-- Add source field to tasks table to track Google Classroom vs manual tasks
ALTER TABLE public.tasks 
ADD COLUMN source TEXT DEFAULT 'manual',
ADD COLUMN google_classroom_id TEXT,
ADD COLUMN google_course_id TEXT;

-- Add index for Google Classroom lookups
CREATE INDEX idx_tasks_google_classroom_id ON public.tasks(google_classroom_id) WHERE google_classroom_id IS NOT NULL;

-- Create table to store Google Classroom connection info
CREATE TABLE public.google_classroom_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on Google Classroom connections
ALTER TABLE public.google_classroom_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for Google Classroom connections
CREATE POLICY "Users can view their own connections" 
ON public.google_classroom_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connections" 
ON public.google_classroom_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" 
ON public.google_classroom_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" 
ON public.google_classroom_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_google_classroom_connections_updated_at
BEFORE UPDATE ON public.google_classroom_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();