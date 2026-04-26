import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Repeat, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FocusTimerProps {
  timerActive: boolean;
  timeRemaining: number;
  timerPaused: boolean;
  onStartTimer: (duration?: number) => void;
  onUpdateDuration: (duration: number) => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  selectedSession?: any;
  onSessionChange?: (session: any) => void;
  selectedTask?: any;
}

const CIRCUMFERENCE = 2 * Math.PI * 54;
const POMODORO_FOCUS = 20;
const POMODORO_BREAK = 5;

export function FocusTimer({
  timerActive, timeRemaining, timerPaused,
  onStartTimer, onUpdateDuration, onPauseTimer, onResetTimer,
  selectedTask,
}: FocusTimerProps) {
  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [round, setRound] = useState(1);
  const [started, setStarted] = useState(false);
  const prevActiveRef = useRef(timerActive);
  const switchingRef = useRef(false);

  const displayDuration = (phase === 'focus' ? POMODORO_FOCUS : POMODORO_BREAK) * 60;
  const elapsed = displayDuration - timeRemaining;
  const progress = Math.max(0, Math.min(1, elapsed / Math.max(displayDuration, 1)));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Auto-cycle phases when timer completes
  useEffect(() => {
    const justCompleted = prevActiveRef.current && !timerActive && timeRemaining === 0 && started;
    if (justCompleted && !switchingRef.current) {
      switchingRef.current = true;
      const nextPhase: 'focus' | 'break' = phase === 'focus' ? 'break' : 'focus';
      const nextDuration = (nextPhase === 'focus' ? POMODORO_FOCUS : POMODORO_BREAK) * 60;
      const nextRound = nextPhase === 'focus' ? round + 1 : round;
      setPhase(nextPhase);
      if (nextPhase === 'focus') setRound(nextRound);
      setTimeout(() => {
        onUpdateDuration(nextDuration);
        onStartTimer(nextDuration);
        switchingRef.current = false;
      }, 800);
    }
    prevActiveRef.current = timerActive;
  }, [timerActive]);

  const handleStart = () => {
    setStarted(true);
    setPhase('focus');
    setRound(1);
    switchingRef.current = false;
    const duration = POMODORO_FOCUS * 60;
    onUpdateDuration(duration);
    onStartTimer(duration);
  };

  const handleReset = () => {
    setStarted(false);
    setPhase('focus');
    setRound(1);
    switchingRef.current = false;
    onResetTimer();
    onUpdateDuration(POMODORO_FOCUS * 60);
  };

  const handleSkip = () => {
    const nextPhase: 'focus' | 'break' = phase === 'focus' ? 'break' : 'focus';
    const nextDuration = (nextPhase === 'focus' ? POMODORO_FOCUS : POMODORO_BREAK) * 60;
    const nextRound = nextPhase === 'focus' ? round + 1 : round;
    setPhase(nextPhase);
    if (nextPhase === 'focus') setRound(nextRound);
    onUpdateDuration(nextDuration);
    onStartTimer(nextDuration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isFocus = phase === 'focus';

  return (
    <div className="space-y-5">
      {/* Phase indicator */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Auto Pomodoro · Round {round}
            </p>
            <p className="text-xs text-muted-foreground">
              {isFocus ? `${POMODORO_FOCUS}m focus` : `${POMODORO_BREAK}m break`} · auto-cycles
            </p>
          </div>
        </div>
        {(timerActive || timerPaused) && (
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground border border-border/50 active:bg-muted/60 transition-all"
          >
            <SkipForward className="h-3 w-3" />
            Skip
          </button>
        )}
      </div>

      {/* Circular timer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" strokeWidth="7" className="stroke-muted" />
            <circle cx="64" cy="64" r="54" fill="none" strokeWidth="7"
              stroke={isFocus ? 'hsl(var(--primary))' : 'hsl(var(--success))'}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div className="text-4xl font-black text-foreground tabular-nums tracking-tight">
              {formatTime(timeRemaining)}
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${isFocus ? 'text-primary' : 'text-success'}`}>
              {isFocus ? <Brain className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
              {isFocus ? 'Focus' : 'Break'}
            </div>
          </div>
        </div>

        {selectedTask && (
          <p className="text-xs text-muted-foreground text-center max-w-[200px] truncate">
            Working on: <span className="text-foreground font-medium">{selectedTask.title}</span>
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!started ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="h-14 px-10 font-bold text-base gap-2 shadow-lg bg-primary hover:bg-primary/90 shadow-primary/25 rounded-2xl"
            >
              <Play className="h-5 w-5" /> Start
            </Button>
          ) : (
            <Button
              onClick={onPauseTimer}
              size="lg"
              className={`h-14 px-10 font-bold text-base gap-2 shadow-lg rounded-2xl ${
                isFocus
                  ? 'bg-primary hover:bg-primary/90 shadow-primary/25'
                  : 'bg-success hover:bg-success/90 shadow-success/25'
              } text-primary-foreground`}
            >
              {timerPaused ? <><Play className="h-5 w-5" /> Resume</> : <><Pause className="h-5 w-5" /> Pause</>}
            </Button>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl border-border/50"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {!started
            ? 'Tap Start to begin your first 20-minute focus session'
            : isFocus
              ? 'Stay locked in. Break coming in a bit.'
              : 'Step away. Stretch. Come back fresh.'}
        </p>
      </div>
    </div>
  );
}
