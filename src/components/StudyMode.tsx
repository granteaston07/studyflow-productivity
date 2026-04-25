import { useState, useEffect } from "react";
import { X, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/TaskCard";
import { AmbientSounds } from "@/components/AmbientSounds";

interface StudyModeProps {
  tasks: Task[];
  timerActive: boolean;
  timeRemaining: number;
  timerPaused: boolean;
  onExit: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  selectedTaskTitle?: string;
}

const MESSAGES = [
  "Stay locked in. You've got this.",
  "Every minute counts. Keep going.",
  "Focus beats talent when talent doesn't focus.",
  "Your future self is watching. Don't let them down.",
  "Progress over perfection.",
  "One task at a time. That's all it takes.",
  "The work you do now is the version of you later.",
  "Hard work now. Results later.",
  "You're building something real right now.",
  "Keep the momentum going.",
];

const CIRCUMFERENCE = 2 * Math.PI * 54;

export const StudyMode = ({
  tasks, timerActive, timeRemaining, timerPaused,
  onExit, onPauseTimer, onResetTimer, selectedTaskTitle
}: StudyModeProps) => {
  const [msgIdx, setMsgIdx] = useState(Math.floor(Math.random() * MESSAGES.length));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionDuration] = useState(timeRemaining);
  const [showSounds, setShowSounds] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(Math.floor(Math.random() * MESSAGES.length)), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatClock = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = sessionDuration > 0 ? Math.max(0, Math.min(1, (sessionDuration - timeRemaining) / sessionDuration)) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const completedCount = tasks.filter(t => t.completed).length;
  const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/3 to-ai-primary/3 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-6 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Study Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSounds(!showSounds)}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-all">
            🎵 Sounds
          </button>
          <Button variant="ghost" size="sm" onClick={onExit}
            className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs">
            <X className="h-3.5 w-3.5" /> Exit
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8 relative">
        <div className="max-w-lg w-full text-center space-y-8">

          {/* Clock */}
          <div>
            <div className="text-6xl md:text-8xl font-black text-foreground tabular-nums tracking-tight">
              {formatClock(currentTime)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Message */}
          <p className="text-lg md:text-xl font-medium text-muted-foreground leading-relaxed animate-fade-in" key={msgIdx}>
            {MESSAGES[msgIdx]}
          </p>

          {/* Focused task */}
          {selectedTaskTitle && (
            <div className="animate-scale-in">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Working on</p>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{selectedTaskTitle}</h2>
            </div>
          )}

          {/* Timer ring (when active) */}
          {timerActive && (
            <div className="flex flex-col items-center gap-4 animate-scale-in">
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 128 128" className="-rotate-90">
                  <circle cx="64" cy="64" r="54" fill="none" strokeWidth="6" className="stroke-muted" />
                  <circle cx="64" cy="64" r="54" fill="none" strokeWidth="6"
                    stroke="hsl(var(--primary))"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-black text-foreground tabular-nums">{formatTimer(timeRemaining)}</div>
                  <div className="text-xs text-muted-foreground">remaining</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onPauseTimer} variant="outline" size="sm" className="gap-1.5 h-9">
                  {timerPaused ? <><Play className="h-3.5 w-3.5" /> Resume</> : <><Pause className="h-3.5 w-3.5" /> Pause</>}
                </Button>
                <Button onClick={onResetTimer} variant="ghost" size="sm" className="h-9">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="text-center">
            <div className="text-4xl font-black text-primary">{completionPct}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} of {tasks.length} tasks done
            </p>
          </div>

        </div>
      </main>

      {/* Ambient sounds panel */}
      {showSounds && (
        <div className="fixed bottom-0 inset-x-0 bg-card/90 backdrop-blur-xl border-t border-border/50 p-4 z-50 animate-slide-up">
          <div className="max-w-lg mx-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ambient Sounds</p>
            <AmbientSounds />
          </div>
        </div>
      )}
    </div>
  );
};
