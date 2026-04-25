import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Plus } from "lucide-react";
import { SmartFocusTimer } from "@/components/SmartFocusTimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  { type: 'work', duration: 25, label: 'Focus' },
  { type: 'work', duration: 45, label: 'Deep Work' },
  { type: 'work', duration: 15, label: 'Quick' },
  { type: 'break', duration: 5, label: 'Short Break' },
  { type: 'break', duration: 15, label: 'Long Break' },
];

const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

export function FocusTimer({
  timerActive, timeRemaining, timerPaused,
  onStartTimer, onUpdateDuration, onPauseTimer, onResetTimer,
  selectedSession: parentSelectedSession, onSessionChange, selectedTask
}: FocusTimerProps) {
  const [selectedSession, setSelectedSession] = useState<TimerSession>(parentSelectedSession || SESSIONS[0]);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customType, setCustomType] = useState<'work' | 'break'>('work');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (parentSelectedSession) setSelectedSession(parentSelectedSession);
  }, [parentSelectedSession]);

  useEffect(() => {
    if (!timerActive || timerPaused) {
      onUpdateDuration(selectedSession.duration * 60);
      onSessionChange?.(selectedSession);
    }
  }, [selectedSession]);

  const toggleTimer = () => {
    if (!timerActive) onStartTimer(selectedSession.duration * 60);
    else onPauseTimer();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const total = selectedSession.duration * 60;
  const elapsed = total - timeRemaining;
  const progress = Math.max(0, Math.min(1, elapsed / total));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const isWork = selectedSession.type === 'work';

  const handleCustomTimer = () => {
    const s: TimerSession = {
      type: customType,
      duration: customMinutes,
      label: `Custom ${customType === 'work' ? 'Focus' : 'Break'}`
    };
    setSelectedSession(s);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Session picker */}
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
          <SmartFocusTimer
            selectedTask={selectedTask}
            onSelectSession={(s) => { setSelectedSession(s); onUpdateDuration(s.duration * 60); }}
            selectedSession={selectedSession}
            timerActive={timerActive}
            timerPaused={timerPaused}
          />
          {SESSIONS.map((s, i) => {
            const Icon = s.type === 'work' ? Brain : Coffee;
            const active = selectedSession === s || (selectedSession.label === s.label && selectedSession.duration === s.duration);
            return (
              <button key={i}
                onClick={() => {
                  if (!timerActive || timerPaused) {
                    setSelectedSession(s);
                    onUpdateDuration(s.duration * 60);
                  }
                }}
                disabled={timerActive && !timerPaused}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 ${
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

      {/* Circular timer */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle cx="64" cy="64" r="54" fill="none" strokeWidth="8"
              stroke={isWork ? 'hsl(var(--primary))' : 'hsl(var(--success))'}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
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
          className={`${isWork ? 'bg-primary/10 text-primary border-primary/20' : 'bg-success/10 text-success border-success/20'} border px-3 py-1`}>
          {isWork ? <Brain className="h-3 w-3 mr-1.5" /> : <Coffee className="h-3 w-3 mr-1.5" />}
          {selectedSession.label}
        </Badge>

        {selectedTask && (
          <p className="text-xs text-muted-foreground text-center max-w-[180px] truncate">
            Working on: <span className="text-foreground font-medium">{selectedTask.title}</span>
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button onClick={toggleTimer} size="lg"
            className={`h-12 px-8 font-semibold gap-2 shadow-md ${
              isWork ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-success hover:bg-success/90 shadow-success/20'
            } text-primary-foreground`}>
            {!timerActive || timerPaused ? <><Play className="h-4 w-4" /> Start</> : <><Pause className="h-4 w-4" /> Pause</>}
          </Button>
          <Button onClick={onResetTimer} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/60">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {isWork ? 'Stay focused. Minimize distractions.' : 'Take a real break. Step away.'}
        </p>
      </div>
    </div>
  );
}
