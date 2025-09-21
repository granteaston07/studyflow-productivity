import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CalendarCheck, Clock, Brain, Target, Zap } from "lucide-react";
import { Task } from "@/hooks/useTasks";
import { useLearningInsights } from "@/hooks/useLearningInsights";
import { format, addHours, startOfDay, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ScheduledTask {
  task: Task;
  scheduledTime: Date;
  estimatedDuration: number; // in minutes
  priority: number; // calculated priority score
  reasonForTiming: string;
  difficultyLevel: 'easy' | 'moderate' | 'hard' | 'challenging';
}

interface SmartTaskSchedulerProps {
  tasks: Task[];
}

export const SmartTaskScheduler = ({ tasks }: SmartTaskSchedulerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { insights, getTimeEstimateForTask, getDifficultyEstimate } = useLearningInsights();
  const { toast } = useToast();

  // Get only incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);

  const getDifficultyLevel = (subject?: string): 'easy' | 'moderate' | 'hard' | 'challenging' => {
    const difficulty = getDifficultyEstimate(subject);
    if (!difficulty) return 'moderate';
    
    if (difficulty <= 2) return 'easy';
    if (difficulty <= 3) return 'moderate';
    if (difficulty <= 4) return 'hard';
    return 'challenging';
  };

  const calculateTaskPriority = (task: Task): number => {
    let score = 0;
    
    // Due date urgency (higher score = more urgent)
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 0) score += 100; // Overdue
      else if (daysUntilDue <= 1) score += 80; // Due today/tomorrow
      else if (daysUntilDue <= 3) score += 60; // Due within 3 days
      else if (daysUntilDue <= 7) score += 40; // Due within a week
      else score += 20; // Due later
    } else {
      score += 10; // No due date = lower priority
    }
    
    // Task priority weight
    switch (task.priority) {
      case 'high': score += 30; break;
      case 'medium': score += 20; break;
      case 'low': score += 10; break;
    }
    
    // Subject difficulty (harder subjects get slight priority boost for early completion)
    const difficulty = getDifficultyEstimate(task.subject);
    if (difficulty) {
      score += difficulty * 5;
    }
    
    return score;
  };

  const generateOptimalSchedule = () => {
    setIsGenerating(true);
    
    try {
      const now = new Date();
      const startTime = new Date();
      
      // Start scheduling from next available hour
      startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
      
      // Calculate priorities and sort tasks
      const tasksWithPriority = incompleteTasks.map(task => ({
        task,
        priority: calculateTaskPriority(task),
        estimatedDuration: getTimeEstimateForTask(task.subject) || 45, // Default 45 minutes
        difficultyLevel: getDifficultyLevel(task.subject)
      })).sort((a, b) => b.priority - a.priority);

      const scheduled: ScheduledTask[] = [];
      let currentTime = new Date(startTime);
      
      // Define optimal time windows
      const morningStart = 9; // 9 AM
      const morningEnd = 12; // 12 PM
      const afternoonStart = 14; // 2 PM
      const afternoonEnd = 17; // 5 PM
      const eveningStart = 19; // 7 PM
      const eveningEnd = 22; // 10 PM

      tasksWithPriority.forEach((taskData, index) => {
        const { task, estimatedDuration, difficultyLevel } = taskData;
        
        // Skip to next available time slot if needed
        if (currentTime.getHours() < morningStart) {
          currentTime.setHours(morningStart, 0, 0, 0);
        } else if (currentTime.getHours() >= morningEnd && currentTime.getHours() < afternoonStart) {
          currentTime.setHours(afternoonStart, 0, 0, 0);
        } else if (currentTime.getHours() >= afternoonEnd && currentTime.getHours() < eveningStart) {
          currentTime.setHours(eveningStart, 0, 0, 0);
        } else if (currentTime.getHours() >= eveningEnd) {
          // Move to next day
          currentTime.setDate(currentTime.getDate() + 1);
          currentTime.setHours(morningStart, 0, 0, 0);
        }

        // Determine reasoning for timing
        let reasonForTiming = "";
        const hour = currentTime.getHours();
        
        if (hour >= morningStart && hour < morningEnd) {
          if (difficultyLevel === 'challenging' || difficultyLevel === 'hard') {
            reasonForTiming = "Morning slot for challenging task - peak mental energy";
          } else {
            reasonForTiming = "Morning productivity window";
          }
        } else if (hour >= afternoonStart && hour < afternoonEnd) {
          reasonForTiming = "Afternoon focus period";
        } else {
          reasonForTiming = "Evening study session";
        }

        // Add urgency reasoning
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 0) {
            reasonForTiming = "⚠️ OVERDUE - Complete immediately";
          } else if (daysUntilDue <= 1) {
            reasonForTiming = "🔥 Due soon - High priority";
          }
        }

        scheduled.push({
          task,
          scheduledTime: new Date(currentTime),
          estimatedDuration,
          priority: taskData.priority,
          reasonForTiming,
          difficultyLevel
        });

        // Move to next time slot
        currentTime = addHours(currentTime, Math.ceil(estimatedDuration / 60));
      });

      setScheduledTasks(scheduled);
      
      toast({
        title: "Schedule Generated! 🎯",
        description: `Optimized schedule created for ${scheduled.length} tasks`,
      });
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return "bg-error";
    if (priority >= 60) return "bg-warning";
    if (priority >= 40) return "bg-primary";
    return "bg-secondary";
  };

  const getDifficultyColor = (level: 'easy' | 'moderate' | 'hard' | 'challenging') => {
    switch (level) {
      case 'easy': return "text-success";
      case 'moderate': return "text-primary";
      case 'hard': return "text-warning";
      case 'challenging': return "text-error";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full mt-4" 
          variant="default"
          disabled={incompleteTasks.length === 0}
        >
          <Brain className="h-4 w-4 mr-2" />
          Generate Smart Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            AI Task Scheduler
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {incompleteTasks.length} tasks ready for scheduling
            </div>
            <Button 
              onClick={generateOptimalSchedule}
              disabled={isGenerating || incompleteTasks.length === 0}
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Schedule
                </>
              )}
            </Button>
          </div>

          {scheduledTasks.length > 0 && (
            <ScrollArea className="h-[500px] w-full">
              <div className="space-y-3">
                {scheduledTasks.map((scheduledTask, index) => (
                  <Card key={scheduledTask.task.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            getPriorityColor(scheduledTask.priority)
                          )} />
                          <h4 className="font-medium">{scheduledTask.task.title}</h4>
                          <Badge variant="outline" className={getDifficultyColor(scheduledTask.difficultyLevel)}>
                            {scheduledTask.difficultyLevel}
                          </Badge>
                        </div>
                        
                        {scheduledTask.task.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {scheduledTask.task.subject}
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(scheduledTask.scheduledTime, 'MMM d, h:mm a')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {scheduledTask.estimatedDuration} min
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground italic">
                          💡 {scheduledTask.reasonForTiming}
                        </div>
                        
                        {scheduledTask.task.dueDate && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Due: </span>
                            <span className={cn(
                              "font-medium",
                              isBefore(new Date(scheduledTask.task.dueDate), new Date()) 
                                ? "text-error" 
                                : "text-foreground"
                            )}>
                              {format(new Date(scheduledTask.task.dueDate), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          #{index + 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Priority: {scheduledTask.priority}
                        </div>
                      </div>
                    </div>
                    
                    {index < scheduledTasks.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {scheduledTasks.length === 0 && !isGenerating && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Generate Schedule" to create an optimized task schedule</p>
              <p className="text-xs mt-2">
                The AI will analyze due dates, difficulty, and your learning patterns
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};