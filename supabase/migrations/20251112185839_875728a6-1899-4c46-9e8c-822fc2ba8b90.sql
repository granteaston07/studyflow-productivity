-- Create a table for subject display name mappings
CREATE TABLE public.subject_display_names (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  actual_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, actual_name)
);

-- Enable Row Level Security
ALTER TABLE public.subject_display_names ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own subject display names" 
ON public.subject_display_names 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subject display names" 
ON public.subject_display_names 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subject display names" 
ON public.subject_display_names 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subject display names" 
ON public.subject_display_names 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_subject_display_names_updated_at
BEFORE UPDATE ON public.subject_display_names
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();