import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Plus } from "lucide-react";
import { SmartFocusTimer } from "@/components/SmartFocusTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimerSession {
  type: 'work' | 'break';
  duration: number; // in minutes
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

const AI_SUGGESTED_SESSIONS: TimerSession[] = [
  { type: 'work', duration: 25, label: 'Homework' },
  { type: 'work', duration: 45, label: 'Lock In' },
  { type: 'work', duration: 15, label: 'Quick Task' },
  { type: 'break', duration: 5, label: 'Short Break' },
  { type: 'break', duration: 15, label: 'Long Break' },
];

export function FocusTimer({ timerActive, timeRemaining, timerPaused, onStartTimer, onUpdateDuration, onPauseTimer, onResetTimer, selectedSession: parentSelectedSession, onSessionChange, selectedTask }: FocusTimerProps) {
  const [selectedSession, setSelectedSession] = useState<TimerSession>(parentSelectedSession || AI_SUGGESTED_SESSIONS[0]);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customType, setCustomType] = useState<'work' | 'break'>('work');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Update local state when parent session changes
  useEffect(() => {
    if (parentSelectedSession) {
      setSelectedSession(parentSelectedSession);
    }
  }, [parentSelectedSession]);

  // Update parent timer when session changes (only if timer is not active)
  useEffect(() => {
    if (!timerActive || timerPaused) {
      onUpdateDuration(selectedSession.duration * 60);
      onSessionChange?.(selectedSession);
    }
  }, [selectedSession, onUpdateDuration, onSessionChange, timerActive, timerPaused]);

  const toggleTimer = () => {
    if (!timerActive) {
      onStartTimer(selectedSession.duration * 60);
    } else {
      onPauseTimer();
    }
  };

  const resetTimer = () => {
    onResetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = selectedSession.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  const getSessionIcon = (type: 'work' | 'break') => {
    return type === 'work' ? Brain : Coffee;
  };

  const getSessionColor = (type: 'work' | 'break') => {
    return type === 'work' ? 'text-primary bg-primary-light' : 'text-success bg-success-light';
  };

  const handleCustomTimer = () => {
    const customSession: TimerSession = {
      type: customType,
      duration: customMinutes,
      label: `Custom ${customType === 'work' ? 'Focus' : 'Break'}`
    };
    setSelectedSession(customSession);
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Focus Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Suggested Sessions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium"><span className="ai-gradient-text-subtle">AI Suggested Sessions</span></p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Custom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Timer</DialogTitle>
                  <DialogDescription>
                    Set up a custom timer with your preferred duration and type.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timer-type">Timer Type</Label>
                    <Select value={customType} onValueChange={(value) => setCustomType(value as 'work' | 'break')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Focus Session</SelectItem>
                        <SelectItem value="break">Break Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timer-minutes">Duration (minutes)</Label>
                    <Input
                      id="timer-minutes"
                      type="number"
                      min="1"
                      max="180"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <Button onClick={handleCustomTimer} className="w-full">
                    Create Timer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <SmartFocusTimer
              selectedTask={selectedTask}
              onSelectSession={(session) => {
                setSelectedSession(session);
                onUpdateDuration(session.duration * 60);
              }}
              selectedSession={selectedSession}
              timerActive={timerActive}
              timerPaused={timerPaused}
            />
            
            {AI_SUGGESTED_SESSIONS.map((session, index) => {
              const Icon = getSessionIcon(session.type);
              return (
                <Button
                  key={index}
                  variant={selectedSession === session ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!timerActive || timerPaused) {
                      setSelectedSession(session);
                      onUpdateDuration(session.duration * 60);
                    }
                  }}
                  disabled={timerActive && !timerPaused}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3"
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{session.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getSessionColor(session.type)} px-1 sm:px-2`}
                  >
                    {session.duration}m
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Badge 
              variant="secondary" 
              className={`${getSessionColor(selectedSession.type)} px-2 sm:px-3 py-1 text-xs sm:text-sm`}
            >
              {selectedSession.label}
            </Badge>
            <div className="text-4xl sm:text-6xl font-bold text-primary tabular-nums">
              {formatTime(timeRemaining)}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1 sm:space-y-2">
            <Progress value={getProgress()} className="h-1.5 sm:h-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {Math.round(getProgress())}% complete
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 sm:gap-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 text-sm sm:text-base"
          >
            {!timerActive || timerPaused ? (
              <>
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                Start
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                Pause
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 text-sm sm:text-base"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            Reset
          </Button>
        </div>

        {/* Session Info */}
        <div className="p-3 sm:p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
            {selectedSession.type === 'work' ? 'Focus Session' : 'Break Time'}
          </p>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {selectedSession.type === 'work' 
              ? 'Stay focused and minimize distractions'
              : 'Take a break and recharge your mind'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}