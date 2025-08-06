-- Create task feedback table to store user completion feedback
CREATE TABLE public.task_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID,
  subject TEXT,
  task_keywords TEXT[],
  time_taken_minutes INTEGER NOT NULL,
  difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  completion_technique TEXT,
  helpful_factors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user behavior patterns table for AI learning
CREATE TABLE public.user_behavior_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT,
  avg_time_per_task NUMERIC,
  avg_difficulty_rating NUMERIC,
  preferred_techniques TEXT[],
  optimal_study_times INTEGER[],
  success_patterns JSONB,
  last_analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject)
);

-- Create suggestion interactions table
CREATE TABLE public.suggestion_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion_technique TEXT NOT NULL,
  task_id UUID,
  was_used BOOLEAN DEFAULT false,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_feedback
CREATE POLICY "Users can view their own task feedback" 
ON public.task_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task feedback" 
ON public.task_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task feedback" 
ON public.task_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_behavior_patterns
CREATE POLICY "Users can view their own behavior patterns" 
ON public.user_behavior_patterns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own behavior patterns" 
ON public.user_behavior_patterns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior patterns" 
ON public.user_behavior_patterns 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for suggestion_interactions
CREATE POLICY "Users can view their own suggestion interactions" 
ON public.suggestion_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suggestion interactions" 
ON public.suggestion_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestion interactions" 
ON public.suggestion_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update behavior patterns
CREATE OR REPLACE FUNCTION public.update_user_behavior_patterns(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update or insert behavior patterns based on task feedback
  INSERT INTO public.user_behavior_patterns (
    user_id, 
    subject, 
    avg_time_per_task, 
    avg_difficulty_rating,
    last_analyzed_at
  )
  SELECT 
    p_user_id,
    subject,
    AVG(time_taken_minutes)::NUMERIC,
    AVG(difficulty_rating)::NUMERIC,
    now()
  FROM public.task_feedback
  WHERE user_id = p_user_id AND subject IS NOT NULL
  GROUP BY subject
  ON CONFLICT (user_id, subject) 
  DO UPDATE SET
    avg_time_per_task = EXCLUDED.avg_time_per_task,
    avg_difficulty_rating = EXCLUDED.avg_difficulty_rating,
    last_analyzed_at = EXCLUDED.last_analyzed_at,
    updated_at = now();
END;
$function$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_task_feedback_updated_at
BEFORE UPDATE ON public.task_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_behavior_patterns_updated_at
BEFORE UPDATE ON public.user_behavior_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();