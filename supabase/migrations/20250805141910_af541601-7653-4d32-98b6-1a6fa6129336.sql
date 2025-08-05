-- Create study_goals table
CREATE TABLE public.study_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'hours', -- 'hours', 'sessions', 'tasks'
  target_period TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  current_progress INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for study_goals
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_goals
CREATE POLICY "Users can view their own study goals" 
ON public.study_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study goals" 
ON public.study_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study goals" 
ON public.study_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study goals" 
ON public.study_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create study_streaks table
CREATE TABLE public.study_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL DEFAULT 'daily_study', -- 'daily_study', 'task_completion', 'focus_sessions'
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enable RLS for study_streaks
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_streaks
CREATE POLICY "Users can view their own study streaks" 
ON public.study_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study streaks" 
ON public.study_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study streaks" 
ON public.study_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_study_goals_updated_at
BEFORE UPDATE ON public.study_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_streaks_updated_at
BEFORE UPDATE ON public.study_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update study streaks
CREATE OR REPLACE FUNCTION public.update_study_streak(
  p_user_id UUID,
  p_streak_type TEXT DEFAULT 'daily_study'
)
RETURNS VOID AS $$
DECLARE
  current_date_local DATE := CURRENT_DATE;
  last_activity DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_activity_date, current_streak, longest_streak
  INTO last_activity, current_streak_val, longest_streak_val
  FROM public.study_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.study_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 1, 1, current_date_local);
    RETURN;
  END IF;
  
  -- If last activity was today, don't update
  IF last_activity = current_date_local THEN
    RETURN;
  END IF;
  
  -- If last activity was yesterday, increment streak
  IF last_activity = current_date_local - INTERVAL '1 day' THEN
    current_streak_val := current_streak_val + 1;
  -- If last activity was more than 1 day ago, reset streak
  ELSE
    current_streak_val := 1;
  END IF;
  
  -- Update longest streak if needed
  IF current_streak_val > longest_streak_val THEN
    longest_streak_val := current_streak_val;
  END IF;
  
  -- Update the record
  UPDATE public.study_streaks
  SET current_streak = current_streak_val,
      longest_streak = longest_streak_val,
      last_activity_date = current_date_local,
      updated_at = now()
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update goal progress
CREATE OR REPLACE FUNCTION public.update_goal_progress(
  p_user_id UUID,
  p_goal_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.study_goals
  SET current_progress = current_progress + p_increment,
      completed = CASE 
        WHEN current_progress + p_increment >= target_value THEN true 
        ELSE completed 
      END,
      updated_at = now()
  WHERE user_id = p_user_id 
    AND target_type = p_goal_type 
    AND completed = false
    AND (end_date IS NULL OR end_date >= now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;