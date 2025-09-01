-- Add support for study goals with no target
ALTER TABLE public.study_calendar_goals 
ALTER COLUMN target_value DROP NOT NULL,
ALTER COLUMN target_value SET DEFAULT NULL;

-- Update existing goals to maintain compatibility
UPDATE public.study_calendar_goals 
SET target_value = NULL 
WHERE target_value = 0;