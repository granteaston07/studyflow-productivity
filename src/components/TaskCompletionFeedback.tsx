import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Clock, Target, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TaskCompletionFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    subject?: string;
    description?: string;
  };
}

export function TaskCompletionFeedback({ isOpen, onClose, task }: TaskCompletionFeedbackProps) {
  const [timeTaken, setTimeTaken] = useState([60]); // Default to 60 minutes (1 hour)
  const [difficulty, setDifficulty] = useState([50]); // Default difficulty 5 (out of 100)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('TaskCompletionFeedback rendered:', { isOpen, user: !!user, task: task?.title });

  const getTimeLabel = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const getDifficultyLabel = (value: number) => {
    const difficulty = Math.round(value / 10);
    if (difficulty <= 2) return "Very Easy";
    if (difficulty <= 4) return "Easy";
    if (difficulty <= 6) return "Medium";
    if (difficulty <= 8) return "Hard";
    return "Very Hard";
  };

  const handleSubmit = async () => {
    console.log('HandleSubmit called:', { user: !!user, timeTaken, difficulty });
    
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "You must be signed in to save feedback.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a guest task (starts with "guest-")
    if (task.id.startsWith('guest-')) {
      toast({
        title: "Guest Mode",
        description: "Sign in to save feedback and improve AI suggestions.",
        variant: "destructive",
      });
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    console.log('Starting submission...');
    
    try {
      const timeInMinutes = timeTaken[0];
      const difficultyRating = Math.round(difficulty[0] / 10); // Convert to 1-10 scale
      console.log('Time in minutes:', timeInMinutes, 'Difficulty:', difficultyRating);
      
      // Extract keywords from task title and description
      const keywords = [
        ...task.title.toLowerCase().split(' '),
        ...(task.description?.toLowerCase().split(' ') || [])
      ].filter(word => word.length > 3);
      
      const { error } = await supabase
        .from('task_feedback')
        .insert({
          user_id: user.id,
          task_id: task.id,
          subject: task.subject,
          task_keywords: keywords,
          time_taken_minutes: timeInMinutes,
          difficulty_rating: difficultyRating,
        });

      console.log('Database insert successful');

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      await supabase.rpc('update_user_behavior_patterns', {
        p_user_id: user.id
      });

      console.log('Behavior patterns updated');

      toast({
        title: "Feedback saved!",
        description: "Task completed! Thanks for helping improve your AI suggestions.",
      });

      onClose();
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Error saving feedback",
        description: `Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      console.log('Submission completed');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Task Completed!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Help improve your AI suggestions by sharing how this task went:
          </div>

          <Card className="p-4 bg-muted/50">
            <div className="font-medium text-sm">{task.title}</div>
            {task.subject && (
              <div className="text-xs text-muted-foreground mt-1">
                Subject: {task.subject}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Time taken</span>
              </div>
              <div className="px-4">
                <Slider
                  value={timeTaken}
                  onValueChange={setTimeTaken}
                  max={480}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>5 min</span>
                  <span className="font-medium text-foreground text-sm">
                    {getTimeLabel(timeTaken[0])}
                  </span>
                  <span>8 hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">Difficulty level</span>
              </div>
              <div className="px-4">
                <Slider
                  value={difficulty}
                  onValueChange={setDifficulty}
                  max={100}
                  min={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Easy</span>
                  <span className="font-medium text-foreground text-sm">
                    {getDifficultyLabel(difficulty[0])} ({Math.round(difficulty[0] / 10)}/10)
                  </span>
                  <span>Very Hard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}