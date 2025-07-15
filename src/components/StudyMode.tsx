import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Task } from "@/components/TaskCard";

interface StudyModeProps {
  tasks: Task[];
  timerActive: boolean;
  timeRemaining: number;
  timerPaused: boolean;
  onExit: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
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
  "Your dedication is your superpower 💫",
  "Consistency is the key to mastery 🔑",
  "Small daily improvements lead to massive results 🌊",
  "Your hard work is an investment in your future 💎",
  "Knowledge grows when shared, keep learning 🌳",
  "Challenges are opportunities in disguise 🎭",
  "You're stronger than you think you are 💪",
  "Every moment of struggle is building character 🏔️",
  "Success is the sum of small efforts repeated 🔄",
  "Your potential is unlimited, keep pushing 🚀",
  "Today's effort is tomorrow's strength 💪",
  "Focus on the process, not just the outcome 🎯",
  "You're writing your success story right now ✍️",
  "Persistence beats resistance every time 🏃‍♂️",
  "Your mind is your most powerful tool 🧠",
  "Every study session makes you smarter 📖",
  "You're investing in the best version of yourself 💫",
  "Knowledge is power, and you're gaining it 🔋",
  "Your effort today shapes your tomorrow 🌅",
  "Stay focused, stay determined, stay amazing 🔥",
  "You're capable of more than you realize 🌟",
  "Learning never stops, and neither do you 🔄",
  "Your dedication inspires others around you 👥",
  "Every challenge overcome makes you stronger 💪",
  "You're building habits that will last a lifetime 🏗️"
];

export const StudyMode = ({ tasks, timerActive, timeRemaining, timerPaused, onExit, onPauseTimer, onResetTimer }: StudyModeProps) => {
  const [currentMessage, setCurrentMessage] = useState(Math.floor(Math.random() * encouragingMessages.length));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Rotate messages every 1 minute - pick random message
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(Math.floor(Math.random() * encouragingMessages.length));
    }, 60000);

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
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-6">
        <div className="max-w-4xl w-full text-center space-y-8">
          
          {/* Current Time - Large Display */}
          <div className="space-y-1">
            <div className="text-7xl md:text-8xl font-bold text-foreground tracking-tight">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground">
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
            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
              {encouragingMessages[currentMessage]}
            </p>
          </div>

          {/* Timer Display (if active) */}
          {timerActive && (
            <div className="space-y-3">
              <div className="text-primary text-xs font-medium uppercase tracking-wide">
                Focus Session Active
              </div>
              <div className="relative">
                {/* Glow background */}
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl animate-pulse-glow"></div>
                <div className="relative text-5xl md:text-6xl font-bold text-primary px-8 py-4 rounded-lg bg-primary/5 border border-primary/20 shadow-[0_0_40px_rgba(var(--primary)/0.3)] animate-pulse-glow">
                  {formatTimerTime(timeRemaining)}
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={onPauseTimer}
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                >
                  {timerPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={onResetTimer}
                  variant="outline"
                  size="sm"
                  className="hover:bg-error/10 hover:text-error hover:border-error/30"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Simple Progress Percentage */}
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold text-primary">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </div>
          </div>

          {/* Minimal task summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{tasks.length}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-success">{tasks.filter(t => t.completed).length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-warning">{tasks.filter(t => t.status === 'in-progress').length}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-error">{tasks.filter(t => t.status === 'overdue').length}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};