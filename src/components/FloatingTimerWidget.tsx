import { Timer } from "lucide-react";
import { Task } from "./TaskCard";
import { isToday } from "date-fns";

interface FloatingTimerWidgetProps {
  timeRemaining: number;
  sessionDuration: number;
  timerPaused: boolean;
  selectedTask?: Task;
  tasks: Task[];
  onGoToFocus: () => void;
}

const RING_R = 14;
const RING_CIRC = 2 * Math.PI * RING_R;

export function FloatingTimerWidget({
  timeRemaining, sessionDuration, timerPaused,
  selectedTask, tasks, onGoToFocus,
}: FloatingTimerWidgetProps) {
  const progress = sessionDuration > 0
    ? Math.max(0, Math.min(1, (sessionDuration - timeRemaining) / sessionDuration))
    : 0;
  const dashOffset = RING_CIRC * (1 - progress);

  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  const timeLabel = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  const completedToday = tasks.filter(t => t.completed && t.completedAt && isToday(t.completedAt)).length;
  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <button
      onClick={onGoToFocus}
      className="fixed bottom-20 right-3 md:bottom-6 md:right-4 z-40 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-card border border-border/60 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-200 group"
      title="Go to Focus timer"
    >
      {/* Mini ring */}
      <div className="relative flex-shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
          <circle cx="18" cy="18" r={RING_R} fill="none" strokeWidth="2.5" className="stroke-muted" />
          <circle
            cx="18" cy="18" r={RING_R}
            fill="none" strokeWidth="2.5"
            stroke={timerPaused ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'}
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Timer className="h-3 w-3 text-primary" />
        </div>
      </div>

      {/* Text */}
      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-foreground tabular-nums">{timeLabel}</span>
          {timerPaused && (
            <span className="text-xs text-muted-foreground">paused</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {selectedTask
            ? <span className="truncate max-w-[120px] block">{selectedTask.title}</span>
            : <span>{completedToday > 0 ? `${completedToday} done today` : `${activeCount} tasks left`}</span>
          }
        </div>
      </div>
    </button>
  );
}
