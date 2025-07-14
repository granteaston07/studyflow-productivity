import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimerSession {
  type: 'work' | 'break';
  duration: number; // in minutes
  label: string;
}

const AI_SUGGESTED_SESSIONS: TimerSession[] = [
  { type: 'work', duration: 25, label: 'Pomodoro Focus' },
  { type: 'work', duration: 45, label: 'Deep Work' },
  { type: 'work', duration: 15, label: 'Quick Task' },
  { type: 'break', duration: 5, label: 'Short Break' },
  { type: 'break', duration: 15, label: 'Long Break' },
];

export function FocusTimer() {
  const [selectedSession, setSelectedSession] = useState<TimerSession>(AI_SUGGESTED_SESSIONS[0]);
  const [timeLeft, setTimeLeft] = useState(selectedSession.duration * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customType, setCustomType] = useState<'work' | 'break'>('work');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setTimeLeft(selectedSession.duration * 60);
    setIsActive(false);
    setIsPaused(false);
  }, [selectedSession]);

  // Expose timer state to parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).timerState = {
        isActive: isActive && !isPaused,
        timeLeft
      };
    }
  }, [isActive, isPaused, timeLeft]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Timer completed - could trigger notification here
    } else if (isPaused) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(selectedSession.duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = selectedSession.duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
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
            <p className="text-sm font-medium text-foreground">AI Suggested Sessions</p>
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
          <div className="flex flex-wrap gap-2">
            {AI_SUGGESTED_SESSIONS.map((session, index) => {
              const Icon = getSessionIcon(session.type);
              return (
                <Button
                  key={index}
                  variant={selectedSession === session ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSession(session)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {session.label}
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getSessionColor(session.type)}`}
                  >
                    {session.duration}m
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <Badge 
              variant="secondary" 
              className={`${getSessionColor(selectedSession.type)} px-3 py-1`}
            >
              {selectedSession.label}
            </Badge>
            <div className="text-6xl font-bold text-primary tabular-nums">
              {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getProgress()} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round(getProgress())}% complete
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="flex items-center gap-2 px-8"
          >
            {!isActive || isPaused ? (
              <>
                <Play className="h-5 w-5" />
                Start
              </>
            ) : (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Session Info */}
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">
            {selectedSession.type === 'work' ? 'Focus Session' : 'Break Time'}
          </p>
          <p className="text-xs text-muted-foreground">
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