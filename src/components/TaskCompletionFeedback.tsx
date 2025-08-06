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
  const [timeTaken, setTimeTaken] = useState([30]); // Default 30 minutes
  const [difficulty, setDifficulty] = useState([5]); // Default difficulty 5
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const timeLabels = [
    "5 min", "15 min", "30 min", "1 hour", "1.5 hours", 
    "2 hours", "3 hours", "4 hours", "6 hours", "8+ hours"
  ];

  const getTimeInMinutes = (sliderValue: number) => {
    const timeValues = [5, 15, 30, 60, 90, 120, 180, 240, 360, 480];
    return timeValues[sliderValue];
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const timeInMinutes = getTimeInMinutes(timeTaken[0]);
      
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
          difficulty_rating: difficulty[0],
        });

      if (error) throw error;

      // Update user behavior patterns
      await supabase.rpc('update_user_behavior_patterns', {
        p_user_id: user.id
      });

      toast({
        title: "Feedback saved!",
        description: "Task completed! Thanks for helping improve your AI suggestions.",
      });

      onClose();
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Error saving feedback",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
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
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Time taken</span>
              </div>
              <div className="px-4">
                <Slider
                  value={timeTaken}
                  onValueChange={setTimeTaken}
                  max={9}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>5 min</span>
                  <span className="font-medium text-foreground">
                    {timeLabels[timeTaken[0]]}
                  </span>
                  <span>8+ hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Difficulty level</span>
              </div>
              <div className="px-4">
                <Slider
                  value={difficulty}
                  onValueChange={setDifficulty}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 (Easy)</span>
                  <span className="font-medium text-foreground">
                    {difficulty[0]}/10
                  </span>
                  <span>10 (Very Hard)</span>
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