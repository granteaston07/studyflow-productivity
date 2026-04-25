import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Plus, Repeat, SkipForward, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLearningInsights } from "@/hooks/useLearningInsights";

interface TimerSession {
  type: 'work' | 'break';
  duration: number;
  label: string;
}

interface FocusTimerProps {
  timerActive: boolean;
  timeRemaining: number;
  timerPaused: boolean;
  onStartTimer: (duration?: number) => void;
  onUpdateDuration: (duration: number) => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  selectedSession?: TimerSession;
  onSessionChange?: (session: TimerSession) => void;
  selectedTask?: any;
}

const SESSIONS: TimerSession[] = [
  { type: 'work',  duration: 25, label: 'Focus' },
  { type: 'work',  duration: 45, label: 'Deep Work' },
  { type: 'work',  duration: 15, label: 'Quick' },
  { type: 'break', duration: 5,  label: 'Short Break' },
  { type: 'break', duration: 15, label: 'Long Break' },
];

const CIRCUMFERENCE = 2 * Math.PI * 54;

const POMODORO_FOCUS = 20;
const POMODORO_BREAK = 5;

export function FocusTimer({
  timerActive, timeRemaining, timerPaused,
  onStartTimer, onUpdateDuration, onPauseTimer, onResetTimer,
  selectedSession: parentSelectedSession, onSessionChange, selectedTask,
}: FocusTimerProps) {
  const [selectedSession, setSelectedSession] = useState<TimerSession>(parentSelectedSession || SESSIONS[0]);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customType, setCustomType] = useState<'work' | 'break'>('work');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getTimeEstimateForTask } = useLearningInsights();
  const smartDuration = selectedTask ? (getTimeEstimateForTask(selectedTask.subject) || 25) : 25;

  // Auto-pomodoro state
  const [autoPomodoro, setAutoPomodoro] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'focus' | 'break'>('focus');
  const [pomodoroRound, setPomodoroRound] = useState(1);
  const prevActiveRef = useRef(timerActive);
  const switchingRef = useRef(false); // prevent double-firing

  useEffect(() => {
    if (parentSelectedSession) setSelectedSession(parentSelectedSession);
  }, [parentSelectedSession]);

  useEffect(() => {
    if (!timerActive || timerPaused) {
      onUpdateDuration(selectedSession.duration * 60);
      onSessionChange?.(selectedSession);
    }
  }, [selectedSession]);

  // Auto-pomodoro: detect timer completion and switch phases
  useEffect(() => {
    const justCompleted = prevActiveRef.current && !timerActive && timeRemaining === 0;
    if (justCompleted && autoPomodoro && !switchingRef.current) {
      switchingRef.current = true;
      const nextPhase: 'focus' | 'break' = pomodoroPhase === 'focus' ? 'break' : 'focus';
      const nextDuration = (nextPhase === 'focus' ? POMODORO_FOCUS : POMODORO_BREAK) * 60;
      const nextRound = nextPhase === 'focus' ? pomodoroRound + 1 : pomodoroRound;

      setPomodoroPhase(nextPhase);
      if (nextPhase === 'focus') setPomodoroRound(nextRound);

      // Brief pause before auto-starting next phase
      setTimeout(() => {
        onUpdateDuration(nextDuration);
        onStartTimer(nextDuration);
        switchingRef.current = false;
      }, 800);
    }
    prevActiveRef.current = timerActive;
  }, [timerActive]);

  const startAutoPomodoro = () => {
    setAutoPomodoro(true);
    setPomodoroPhase('focus');
    setPomodoroRound(1);
    switchingRef.current = false;
    const duration = POMODORO_FOCUS * 60;
    const s: TimerSession = { type: 'work', duration: POMODORO_FOCUS, label: 'Auto Pomodoro' };
    setSelectedSession(s);
    onUpdateDuration(duration);
    onStartTimer(duration);
  };

  const stopAutoPomodoro = () => {
    setAutoPomodoro(false);
    setPomodoroPhase('focus');
    setPomodoroRound(1);
    switchingRef.current = false;
    onResetTimer();
    const s = SESSIONS[0];
    setSelectedSession(s);
    onUpdateDuration(s.duration * 60);
    onSessionChange?.(s);
  };

  const skipPhase = () => {
    if (!autoPomodoro) return;
    const nextPhase: 'focus' | 'break' = pomodoroPhase === 'focus' ? 'break' : 'focus';
    const nextDuration = (nextPhase === 'focus' ? POMODORO_FOCUS : POMODORO_BREAK) * 60;
    const nextRound = nextPhase === 'focus' ? pomodoroRound + 1 : pomodoroRound;
    setPomodoroPhase(nextPhase);
    if (nextPhase === 'focus') setPomodoroRound(nextRound);
    onUpdateDuration(nextDuration);
    onStartTimer(nextDuration);
  };

  const toggleTimer = () => {
    if (!timerActive) onStartTimer(selectedSession.duration * 60);
    else onPauseTimer();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCustomTimer = () => {
    const s: TimerSession = {
      type: customType,
      duration: customMinutes,
      label: `Custom ${customType === 'work' ? 'Focus' : 'Break'}`,
    };
    setAutoPomodoro(false);
    setSelectedSession(s);
    setDialogOpen(false);
  };

  const isWork = autoPomodoro ? pomodoroPhase === 'focus' : selectedSession.type === 'work';
  const displayDuration = autoPomodoro
    ? (pomodoroPhase === 'focus' ? POMODORO_FOCUS : POMODORO_BREAK) * 60
    : selectedSession.duration * 60;
  const elapsed = displayDuration - timeRemaining;
  const progress = Math.max(0, Math.min(1, elapsed / Math.max(displayDuration, 1)));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="space-y-5">

      {/* Auto Pomodoro toggle */}
      {autoPomodoro ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-ai-primary/10 border border-ai-primary/25">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-ai-primary" />
            <div>
              <p className="text-sm font-semibold text-ai-primary">
                Auto Pomodoro · Round {pomodoroRound}
              </p>
              <p className="text-xs text-muted-foreground">
                {pomodoroPhase === 'focus' ? `${POMODORO_FOCUS}m focus` : `${POMODORO_BREAK}m break`} · auto-cycles forever
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={skipPhase}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-border/60">
              <SkipForward className="h-3 w-3" />
              Skip
            </button>
            <button onClick={stopAutoPomodoro}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-error hover:bg-error/10 transition-all border border-error/25">
              Stop
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <Plus className="h-3 w-3" /> Custom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Custom Timer</DialogTitle>
                  <DialogDescription>Set a custom duration and session type.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={customType} onValueChange={(v) => setCustomType(v as 'work' | 'break')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Focus Session</SelectItem>
                        <SelectItem value="break">Break Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" min="1" max="180" value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)} />
                  </div>
                  <Button onClick={handleCustomTimer} className="w-full">Set Timer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Auto Pomodoro option */}
            <button
              onClick={startAutoPomodoro}
              disabled={timerActive && !timerPaused}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all duration-150 border-ai-primary/40 text-ai-primary hover:bg-ai-primary/10 active:bg-ai-primary/20 disabled:opacity-40 min-h-[36px]">
              <Repeat className="h-3 w-3" />
              Auto Pomodoro
              <span className="opacity-70">{POMODORO_FOCUS}/{POMODORO_BREAK}m</span>
            </button>

            {selectedTask && (
              <button
                onClick={() => {
                  if (!timerActive || timerPaused) {
                    const s: TimerSession = { type: 'work', duration: smartDuration, label: 'AI Suggested' };
                    setAutoPomodoro(false);
                    setSelectedSession(s);
                    onUpdateDuration(s.duration * 60);
                  }
                }}
                disabled={timerActive && !timerPaused}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-colors duration-150 min-h-[36px] ${
                  selectedSession.label === 'AI Suggested'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground disabled:opacity-40'
                }`}>
                <Star className="h-3 w-3" />
                Suggested
                <span className="opacity-70">{smartDuration}m</span>
              </button>
            )}

            {SESSIONS.map((s, i) => {
              const Icon = s.type === 'work' ? Brain : Coffee;
              const active = !autoPomodoro && (
                selectedSession === s ||
                (selectedSession.label === s.label && selectedSession.duration === s.duration)
              );
              return (
                <button key={i}
                  onClick={() => {
                    if (!timerActive || timerPaused) {
                      setAutoPomodoro(false);
                      setSelectedSession(s);
                      onUpdateDuration(s.duration * 60);
                    }
                  }}
                  disabled={timerActive && !timerPaused}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all duration-150 min-h-[36px] ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                      : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground disabled:opacity-40'
                  }`}>
                  <Icon className="h-3 w-3" />
                  {s.label}
                  <span className="opacity-70">{s.duration}m</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Circular timer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle cx="64" cy="64" r="54" fill="none" strokeWidth="8"
              stroke={
                autoPomodoro
                  ? pomodoroPhase === 'focus' ? 'hsl(var(--ai-primary))' : 'hsl(var(--success))'
                  : isWork ? 'hsl(var(--primary))' : 'hsl(var(--success))'
              }
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-foreground tabular-nums tracking-tight">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {Math.round(progress * 100)}%
            </div>
          </div>
        </div>

        <Badge variant="secondary"
          className={cn(
            "border px-3 py-1",
            autoPomodoro
              ? pomodoroPhase === 'focus'
                ? 'bg-ai-primary/10 text-ai-primary border-ai-primary/20'
                : 'bg-success/10 text-success border-success/20'
              : isWork
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-success/10 text-success border-success/20'
          )}>
          {autoPomodoro ? (
            <><Repeat className="h-3 w-3 mr-1.5" />
              {pomodoroPhase === 'focus' ? `Round ${pomodoroRound} · Focus` : `Round ${pomodoroRound} · Break`}
            </>
          ) : isWork ? (
            <><Brain className="h-3 w-3 mr-1.5" />{selectedSession.label}</>
          ) : (
            <><Coffee className="h-3 w-3 mr-1.5" />{selectedSession.label}</>
          )}
        </Badge>

        {selectedTask && (
          <p className="text-xs text-muted-foreground text-center max-w-[200px] truncate">
            Working on: <span className="text-foreground font-medium">{selectedTask.title}</span>
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {autoPomodoro ? (
            <Button onClick={onPauseTimer} size="lg"
              className="h-12 px-8 font-semibold gap-2 shadow-md bg-ai-primary hover:bg-ai-primary/90 shadow-ai-primary/20 text-white">
              {timerPaused ? <><Play className="h-4 w-4" /> Resume</> : <><Pause className="h-4 w-4" /> Pause</>}
            </Button>
          ) : (
            <Button onClick={toggleTimer} size="lg"
              className={`h-12 px-8 font-semibold gap-2 shadow-md ${
                isWork ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-success hover:bg-success/90 shadow-success/20'
              } text-primary-foreground`}>
              {!timerActive || timerPaused ? <><Play className="h-4 w-4" /> Start</> : <><Pause className="h-4 w-4" /> Pause</>}
            </Button>
          )}
          <Button onClick={autoPomodoro ? stopAutoPomodoro : onResetTimer}
            variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/60">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {autoPomodoro
            ? pomodoroPhase === 'focus'
              ? 'Stay locked in. Break coming in a bit.'
              : 'Step away. Stretch. Come back fresh.'
            : isWork
              ? 'Stay focused. Minimise distractions.'
              : 'Take a real break. Step away.'}
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
