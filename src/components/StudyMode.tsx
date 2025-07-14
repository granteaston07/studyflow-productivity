import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProgressTracker } from "@/components/ProgressTracker";
import { Task } from "@/components/TaskCard";

interface StudyModeProps {
  tasks: Task[];
  timerActive: boolean;
  timeRemaining: number;
  onExit: () => void;
}

const encouragingMessages = [
  "You're doing amazing! Keep going! 🌟",
  "Every small step counts towards your goals 📚",
  "Focus brings clarity, clarity brings success ✨",
  "You've got this! Stay strong and focused 💪",
  "Learning is a journey, not a destination 🚀",
  "Your future self will thank you for this effort 🎯",
  "Great things never come from comfort zones 🔥",
  "Progress over perfection, always 📈",
  "You're building something incredible today 🏗️",
  "Stay curious, stay focused, stay brilliant 🧠",
  "Every expert was once a beginner 🌱",
  "Your dedication is your superpower 💫"
];

export const StudyMode = ({ tasks, timerActive, timeRemaining, onExit }: StudyModeProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Rotate messages every 10 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % encouragingMessages.length);
    }, 10000);

    return () => clearInterval(messageInterval);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimerTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with exit and theme toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">Study Mode Active</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExit}
              className="hover:bg-error/10 hover:text-error hover:border-error/30"
            >
              <X className="h-4 w-4 mr-2" />
              Exit Study Mode
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <div className="max-w-4xl w-full text-center space-y-12">
          
          {/* Current Time - Large Display */}
          <div className="space-y-2">
            <div className="text-8xl md:text-9xl font-bold text-foreground tracking-tight">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-muted-foreground">
              {currentTime.toLocaleDateString([], { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Encouraging Message */}
          <div className="animate-fade-in">
            <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
              {encouragingMessages[currentMessage]}
            </p>
          </div>

          {/* Timer Display (if active) */}
          {timerActive && (
            <div className="space-y-3">
              <div className="text-primary text-sm font-medium uppercase tracking-wide">
                Focus Session Active
              </div>
              <div className="text-6xl md:text-7xl font-bold text-primary">
                {formatTimerTime(timeRemaining)}
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
              <h3 className="text-xl font-semibold text-foreground mb-6">Today's Progress</h3>
              <ProgressTracker tasks={tasks} />
            </div>
          </div>

          {/* Minimal task summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-success">{tasks.filter(t => t.completed).length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-warning">{tasks.filter(t => t.status === 'in-progress').length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-error">{tasks.filter(t => t.status === 'overdue').length}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};