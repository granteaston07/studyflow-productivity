import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, Clock, Flame, Zap, TrendingUp, Circle } from "lucide-react";
import { Task } from "./TaskCard";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useXP } from "@/hooks/useXP";

interface ProgressTrackerProps {
  tasks: Task[];
}

const CIRCUMFERENCE = 2 * Math.PI * 44;

const SUBJECT_PALETTES = [
  { bar: '#818cf8', bg: 'bg-indigo-500/10',   text: 'text-indigo-400',  border: 'border-indigo-500/20' },
  { bar: '#34d399', bg: 'bg-emerald-500/10',  text: 'text-emerald-400', border: 'border-emerald-500/20' },
  { bar: '#f59e0b', bg: 'bg-amber-500/10',    text: 'text-amber-400',   border: 'border-amber-500/20' },
  { bar: '#f472b6', bg: 'bg-pink-500/10',     text: 'text-pink-400',    border: 'border-pink-500/20' },
];

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const { streak } = useStudyStreak();
  const { level, levelName, xpInLevel, xpToNext, progress: xpProgress } = useXP();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const review = tasks.filter(t => t.status === 'review').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    const overdue = tasks.filter(t => t.status === 'overdue' && !t.completed).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    const subjectMap = new Map<string, { total: number; completed: number }>();
    tasks.forEach(t => {
      const s = t.subject || 'General';
      const cur = subjectMap.get(s) || { total: 0, completed: 0 };
      subjectMap.set(s, { total: cur.total + 1, completed: cur.completed + (t.completed ? 1 : 0) });
    });
    const subjects = Array.from(subjectMap.entries())
      .map(([name, d], i) => ({ name, ...d, rate: d.total > 0 ? (d.completed / d.total) * 100 : 0, palette: SUBJECT_PALETTES[i % SUBJECT_PALETTES.length] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const highActive  = tasks.filter(t => t.priority === 'high'   && !t.completed).length;
    const medActive   = tasks.filter(t => t.priority === 'medium' && !t.completed).length;
    const lowActive   = tasks.filter(t => t.priority === 'low'    && !t.completed).length;

    const streakBonus = Math.min((streak?.current_streak || 0) * 3, 20);
    const score = Math.min(100, Math.round(completionRate * 0.8 + streakBonus));

    return { total, completed, inProgress, review, blocked, overdue, completionRate, subjects, highActive, medActive, lowActive, score };
  }, [tasks, streak]);

  const dashOffset = CIRCUMFERENCE * (1 - stats.completionRate / 100);
  const streakCount = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  const ringColor =
    stats.completionRate >= 80 ? '#34d399' :
    stats.completionRate >= 50 ? '#818cf8' :
    stats.overdue > 0          ? '#f87171' : '#818cf8';

  return (
    <div className="space-y-5">

      {/* Hero: ring + completion rate */}
      <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-primary/8 via-muted/20 to-ai-secondary/6 border border-primary/15">
        <div className="relative flex-shrink-0">
          <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
            <circle cx="52" cy="52" r="44" fill="none" strokeWidth="7" className="stroke-muted" />
            <circle cx="52" cy="52" r="44" fill="none" strokeWidth="7"
              stroke={ringColor} strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-foreground">{Math.round(stats.completionRate)}%</span>
            <span className="text-xs text-muted-foreground leading-none mt-0.5">done</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <div>
                <div className="text-base font-bold text-foreground leading-none">{stats.completed}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Done</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-warning/10 border border-warning/20">
              <Clock className="h-4 w-4 text-warning flex-shrink-0" />
              <div>
                <div className="text-base font-bold text-foreground leading-none">{stats.inProgress}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Active</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-error/10 border border-error/20">
              <AlertTriangle className="h-4 w-4 text-error flex-shrink-0" />
              <div>
                <div className="text-base font-bold text-foreground leading-none">{stats.overdue}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Overdue</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <div className="text-base font-bold text-foreground leading-none">{stats.score}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      {(stats.review > 0 || stats.blocked > 0) && (
        <div className="flex gap-2">
          {stats.review > 0 && (
            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Circle className="h-3.5 w-3.5 text-blue-400" />
              <div>
                <div className="text-sm font-bold text-foreground">{stats.review}</div>
                <div className="text-xs text-muted-foreground">Review</div>
              </div>
            </div>
          )}
          {stats.blocked > 0 && (
            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20">
              <AlertTriangle className="h-3.5 w-3.5 text-error" />
              <div>
                <div className="text-sm font-bold text-foreground">{stats.blocked}</div>
                <div className="text-xs text-muted-foreground">Blocked</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subject breakdown */}
      {stats.subjects.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Subject</p>
          <div className="space-y-2.5">
            {stats.subjects.map(s => (
              <div key={s.name} className={`p-3 rounded-xl ${s.palette.bg} border ${s.palette.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${s.palette.text} truncate max-w-[140px]`}>{s.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{s.completed}/{s.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.rate}%`, backgroundColor: s.palette.bar }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority queue */}
      {(stats.highActive + stats.medActive + stats.lowActive) > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active by Priority</p>
          <div className="flex gap-2">
            {stats.highActive > 0 && (
              <div className="flex-1 bg-error/10 border border-error/25 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-error">{stats.highActive}</div>
                <div className="text-xs text-error/70 mt-0.5">High</div>
              </div>
            )}
            {stats.medActive > 0 && (
              <div className="flex-1 bg-warning/10 border border-warning/25 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-warning">{stats.medActive}</div>
                <div className="text-xs text-warning/70 mt-0.5">Medium</div>
              </div>
            )}
            {stats.lowActive > 0 && (
              <div className="flex-1 bg-success/10 border border-success/25 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-success">{stats.lowActive}</div>
                <div className="text-xs text-success/70 mt-0.5">Low</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Streak + XP */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/25 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Streak</span>
          </div>
          <div className="text-3xl font-black text-foreground leading-none">{streakCount}</div>
          <div className="text-xs text-muted-foreground mt-1">day{streakCount !== 1 ? 's' : ''} · best {longestStreak}</div>
        </div>
        <div className="bg-gradient-to-br from-primary/15 to-ai-primary/10 border border-primary/25 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">XP</span>
          </div>
          <div className="text-3xl font-black text-foreground leading-none">{level}</div>
          <div className="text-xs text-muted-foreground mt-1">{levelName} · {xpInLevel}/{xpToNext}</div>
          <div className="mt-2 h-1 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

    </div>
  );
}
