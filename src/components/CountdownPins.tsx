import { useMemo } from 'react';
import { Pin, CalendarClock } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format, differenceInCalendarDays } from 'date-fns';

interface CountdownPinsProps {
  tasks: Task[];
}

export function CountdownPins({ tasks }: CountdownPinsProps) {
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const pins = useMemo(() => {
    const upcoming = tasks
      .filter(t => !t.completed && t.dueDate)
      .map(t => {
        const due = new Date(t.dueDate!.getFullYear(), t.dueDate!.getMonth(), t.dueDate!.getDate());
        const days = differenceInCalendarDays(due, today);
        return { ...t, daysLeft: days };
      })
      .filter(t => t.daysLeft >= 0 && t.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
    return upcoming;
  }, [tasks, today]);

  if (pins.length === 0) return null;

  function countdownLabel(days: number) {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  }

  function urgencyStyle(days: number, priority: Task['priority']) {
    if (days === 0) return 'bg-error/10 border-error/25 text-error';
    if (days === 1 || priority === 'high') return 'bg-warning/10 border-warning/25 text-warning';
    return 'bg-primary/8 border-primary/20 text-primary';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Pin className="h-3 w-3 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Countdown</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5 no-scrollbar">
        {pins.map(task => (
          <div
            key={task.id}
            className={`flex-shrink-0 flex flex-col justify-between p-3 rounded-2xl border min-w-[110px] max-w-[140px] ${urgencyStyle(task.daysLeft, task.priority)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <CalendarClock className="h-3.5 w-3.5 opacity-70" />
              <span className="text-[10px] font-semibold opacity-70">
                {task.dueDate ? format(task.dueDate, 'MMM d') : ''}
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-2">
              {task.title}
            </p>
            <div className="flex items-end justify-between gap-1">
              <span className="text-xl font-black leading-none">
                {task.daysLeft === 0 ? '!' : task.daysLeft}
              </span>
              <span className="text-[10px] font-medium opacity-80 mb-0.5">
                {task.daysLeft === 0 ? 'Due today' : task.daysLeft === 1 ? 'day left' : 'days left'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
