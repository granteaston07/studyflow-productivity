import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLearningInsights } from "@/hooks/useLearningInsights";

interface TimerSession {
  type: 'work' | 'break';
  duration: number; // in minutes
  label: string;
}

interface SmartFocusTimerProps {
  selectedTask?: any;
  onSelectSession: (session: TimerSession) => void;
  selectedSession: TimerSession;
  timerActive: boolean;
  timerPaused: boolean;
}

export function SmartFocusTimer({ 
  selectedTask, 
  onSelectSession, 
  selectedSession, 
  timerActive, 
  timerPaused 
}: SmartFocusTimerProps) {
  const { getTimeEstimateForTask } = useLearningInsights();
  const [smartDuration, setSmartDuration] = useState<number>(25);

  useEffect(() => {
    if (selectedTask) {
      const estimate = getTimeEstimateForTask(selectedTask.subject);
      setSmartDuration(estimate || 25);
    }
  }, [selectedTask, getTimeEstimateForTask]);

  const handleSmartTimerClick = () => {
    if (!timerActive || timerPaused) {
      const aiSession: TimerSession = {
        type: 'work',
        duration: smartDuration,
        label: 'AI Suggested'
      };
      onSelectSession(aiSession);
    }
  };

  if (!selectedTask) return null;

  const isSelected = selectedSession.label === "AI Suggested";

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={handleSmartTimerClick}
      disabled={timerActive && !timerPaused}
      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20"
    >
      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
      <span className="truncate">AI Suggested</span>
      <Badge 
        variant="secondary" 
        className="text-xs text-primary bg-primary/10 px-1 sm:px-2"
      >
        {smartDuration}m
      </Badge>
    </Button>
  );
}