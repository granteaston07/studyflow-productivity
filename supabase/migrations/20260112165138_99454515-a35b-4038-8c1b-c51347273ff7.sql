-- Create a table for user widget preferences
CREATE TABLE public.widget_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  show_ai_prioritization BOOLEAN NOT NULL DEFAULT true,
  show_progress_tracker BOOLEAN NOT NULL DEFAULT true,
  show_study_links BOOLEAN NOT NULL DEFAULT true,
  show_quick_notes BOOLEAN NOT NULL DEFAULT true,
  show_focus_timer BOOLEAN NOT NULL DEFAULT true,
  show_analytics_dashboard BOOLEAN NOT NULL DEFAULT true,
  show_learning_insights BOOLEAN NOT NULL DEFAULT true,
  show_study_calendar BOOLEAN NOT NULL DEFAULT true,
  show_floating_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.widget_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own widget preferences" 
ON public.widget_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own widget preferences" 
ON public.widget_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget preferences" 
ON public.widget_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_widget_preferences_updated_at
BEFORE UPDATE ON public.widget_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();