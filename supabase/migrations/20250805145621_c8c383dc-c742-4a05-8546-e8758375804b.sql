-- First, create a table for study goals if it doesn't exist
CREATE TABLE IF NOT EXISTS public.study_calendar_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  frequency text NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly_same_day', 'monthly_same_date')),
  target_value integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'minutes',
  color text NOT NULL,
  week_day integer, -- 0-6 for weekly_same_day (Sunday = 0)
  month_date integer, -- 1-31 for monthly_same_date
  repeat_interval integer DEFAULT 1, -- every X days/weeks/months
  repeat_end_date timestamp with time zone, -- when to stop repeating
  repeat_count integer, -- how many times to repeat (alternative to end date)
  completed_dates jsonb DEFAULT '[]'::jsonb, -- array of completed dates
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_calendar_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own study calendar goals" 
ON public.study_calendar_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study calendar goals" 
ON public.study_calendar_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study calendar goals" 
ON public.study_calendar_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study calendar goals" 
ON public.study_calendar_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_study_calendar_goals_updated_at
BEFORE UPDATE ON public.study_calendar_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();