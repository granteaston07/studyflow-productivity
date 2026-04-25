import { useMemo } from "react";
import { TrendingUp, CheckCircle, AlertTriangle, Clock, Flame, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Task } from "./TaskCard";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useXP } from "@/hooks/useXP";

interface ProgressTrackerProps {
  tasks: Task[];
}

const CIRCUMFERENCE = 2 * Math.PI * 40;

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const { streak } = useStudyStreak();
  const { level, levelName, xpInLevel, xpToNext, progress: xpProgress } = useXP();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const overdue = tasks.filter(t => t.status === "overdue" && !t.completed).length;
    const pending = tasks.filter(t => t.status === "pending" && !t.completed).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Subject breakdown
    const subjectMap = new Map<string, { total: number; completed: number }>();
    tasks.forEach(t => {
      const subj = t.subject || "General";
      const cur = subjectMap.get(subj) || { total: 0, completed: 0 };
      subjectMap.set(subj, {
        total: cur.total + 1,
        completed: cur.completed + (t.completed ? 1 : 0),
      });
    });
    const subjects = Array.from(subjectMap.entries())
      .map(([name, data]) => ({ name, ...data, rate: data.total > 0 ? (data.completed / data.total) * 100 : 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    // Priority breakdown
    const highTasks = tasks.filter(t => t.priority === "high" && !t.completed).length;
    const medTasks = tasks.filter(t => t.priority === "medium" && !t.completed).length;
    const lowTasks = tasks.filter(t => t.priority === "low" && !t.completed).length;

    // Productivity score: completion rate + streak bonus
    const streakBonus = Math.min((streak?.current_streak || 0) * 3, 20);
    const productivityScore = Math.min(100, Math.round(completionRate * 0.8 + streakBonus));

    return { total, completed, inProgress, overdue, pending, completionRate, subjects, highTasks, medTasks, lowTasks, productivityScore };
  }, [tasks, streak]);

  const dashOffset = CIRCUMFERENCE * (1 - stats.completionRate / 100);
  const streakCount = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  return (
    <div className="space-y-5">

      {/* Top row: circle + key numbers */}
      <div className="flex items-center gap-6">
        {/* Circle */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" strokeWidth="7" className="stroke-muted" />
            <circle cx="48" cy="48" r="40" fill="none" strokeWidth="7"
              stroke="hsl(var(--primary))" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-foreground">{Math.round(stats.completionRate)}%</span>
            <span className="text-xs text-muted-foreground">done</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
            <div>
              <div className="text-lg font-bold text-foreground leading-none">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning flex-shrink-0" />
            <div>
              <div className="text-lg font-bold text-foreground leading-none">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground">In progress</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-error flex-shrink-0" />
            <div>
              <div className="text-lg font-bold text-foreground leading-none">{stats.overdue}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <div className="text-lg font-bold text-foreground leading-none">{stats.productivityScore}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      {stats.subjects.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Subject</p>
          {stats.subjects.map(s => (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground truncate max-w-[140px]">{s.name}</span>
                <span className="text-muted-foreground ml-2 flex-shrink-0">{s.completed}/{s.total}</span>
              </div>
              <Progress value={s.rate} className="h-1.5" />
            </div>
          ))}
        </div>
      )}

      {/* Priority breakdown */}
      {(stats.highTasks + stats.medTasks + stats.lowTasks) > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority Queue</p>
          <div className="flex gap-2">
            {stats.highTasks > 0 && (
              <div className="flex-1 bg-error/10 border border-error/20 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-error">{stats.highTasks}</div>
                <div className="text-xs text-error/70">High</div>
              </div>
            )}
            {stats.medTasks > 0 && (
              <div className="flex-1 bg-warning/10 border border-warning/20 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-warning">{stats.medTasks}</div>
                <div className="text-xs text-warning/70">Med</div>
              </div>
            )}
            {stats.lowTasks > 0 && (
              <div className="flex-1 bg-success/10 border border-success/20 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-success">{stats.lowTasks}</div>
                <div className="text-xs text-success/70">Low</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Streak + XP row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-warning/8 border border-warning/20 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-semibold text-warning">Streak</span>
          </div>
          <div className="text-2xl font-black text-foreground">{streakCount}</div>
          <div className="text-xs text-muted-foreground">day{streakCount !== 1 ? "s" : ""} · best {longestStreak}</div>
        </div>
        <div className="bg-primary/8 border border-primary/20 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Level</span>
          </div>
          <div className="text-2xl font-black text-foreground">{level}</div>
          <div className="text-xs text-muted-foreground">{levelName} · {xpInLevel}/{xpToNext} XP</div>
        </div>
      </div>

    </div>
  );
}
