import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Task } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
  onDayFilter: (date: Date | null) => void;
  activeDay: Date | null;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function CalendarView({ tasks, onDayFilter, activeDay }: CalendarViewProps) {
  const now = new Date();
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build grid: leading empty cells + days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map of date-key → task color indicators
  const taskDotMap = useMemo(() => {
    const map = new Map<string, { overdue: boolean; today: boolean; future: boolean }>();
    tasks.filter(t => !t.completed && t.dueDate).forEach(t => {
      const d = t.dueDate!;
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const existing = map.get(key) || { overdue: false, today: false, future: false };
      if (dDay < todayDay) existing.overdue = true;
      else if (isSameDay(dDay, todayDay)) existing.today = true;
      else existing.future = true;
      map.set(key, existing);
    });
    return map;
  }, [tasks, year, month, todayDay]);

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 active:bg-muted/80 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-foreground">{monthName}</span>
        <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 active:bg-muted/80 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const cellDate = new Date(year, month, day);
          const isToday = isSameDay(cellDate, todayDay);
          const isActive = activeDay ? isSameDay(cellDate, activeDay) : false;
          const dotKey = `${year}-${month}-${day}`;
          const dots = taskDotMap.get(dotKey);

          return (
            <button
              key={day}
              onClick={() => onDayFilter(isActive ? null : cellDate)}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 min-h-[44px] rounded-lg transition-colors duration-150 active:opacity-70",
                isActive ? "bg-primary text-primary-foreground" :
                isToday ? "bg-primary/15 text-primary font-semibold" :
                "text-foreground hover:bg-muted/50"
              )}
            >
              <span className="text-sm leading-none">{day}</span>
              {dots && (
                <div className="flex items-center gap-0.5 mt-1">
                  {dots.overdue && <div className="w-1.5 h-1.5 rounded-full bg-error/80" />}
                  {dots.today && <div className="w-1.5 h-1.5 rounded-full bg-warning/80" />}
                  {dots.future && <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-error/80 flex-shrink-0" />Overdue
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-warning/80 flex-shrink-0" />Today
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />Upcoming
        </div>
      </div>
    </div>
  );
}
