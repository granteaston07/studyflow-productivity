import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, Clock, Flame, Zap } from "lucide-react";
import { Task } from "./TaskCard";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useXP } from "@/hooks/useXP";
import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  tasks: Task[];
}

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const { streak } = useStudyStreak();
  const { level, levelName, xpInLevel, xpToNext, progress: xpProgress } = useXP();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => t.status === 'overdue' && !t.completed).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    const subjectMap = new Map<string, { total: number; completed: number }>();
    tasks.forEach(t => {
      const s = t.subject || 'General';
      const cur = subjectMap.get(s) || { total: 0, completed: 0 };
      subjectMap.set(s, { total: cur.total + 1, completed: cur.completed + (t.completed ? 1 : 0) });
    });
    const subjects = Array.from(subjectMap.entries())
      .map(([name, d]) => ({ name, ...d, rate: d.total > 0 ? (d.completed / d.total) * 100 : 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { total, completed, inProgress, overdue, completionRate, subjects };
  }, [tasks]);

  const streakCount = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  return (
    <div className="space-y-6">

      {/* Completion overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Overall completion</span>
          <span className="text-sm font-bold text-foreground">{Math.round(stats.completionRate)}%</span>
        </div>
        <Progress value={stats.completionRate} className="h-2" />
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/50">
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            <div>
              <div className="text-base font-bold text-foreground leading-none">{stats.completed}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Done</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/50">
            <Clock className="h-4 w-4 text-warning flex-shrink-0" />
            <div>
              <div className="text-base font-bold text-foreground leading-none">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Active</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/50">
            <AlertTriangle className="h-4 w-4 text-error flex-shrink-0" />
            <div>
              <div className="text-base font-bold text-foreground leading-none">{stats.overdue}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      {stats.subjects.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Subject</p>
          <div className="space-y-3">
            {stats.subjects.map(s => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{s.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{s.completed}/{s.total}</span>
                </div>
                <Progress value={s.rate} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak + XP */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="h-4 w-4 text-warning" />
              <span className="text-xs font-semibold text-muted-foreground">Streak</span>
            </div>
            <div className="text-2xl font-bold text-foreground leading-none">{streakCount}</div>
            <div className="text-xs text-muted-foreground mt-1">day{streakCount !== 1 ? 's' : ''} · best {longestStreak}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">Level {level}</span>
            </div>
            <div className="text-sm font-semibold text-foreground leading-none">{levelName}</div>
            <div className="text-xs text-muted-foreground mt-1">{xpInLevel}/{xpToNext} XP</div>
            <Progress value={xpProgress} className="mt-2 h-1.5" />
          </div>
        </div>
      </div>

    </div>
  );
}
