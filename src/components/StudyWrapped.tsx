import { useState, useEffect } from 'react';
import { X, TrendingUp, Flame, CheckSquare, Zap, Trophy, Star } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

const WRAPPED_KEY = 'propel_wrapped_seen';

interface StudyWrappedProps {
  tasks: Task[];
  streakCount: number;
  level: number;
  levelName: string;
  xp: number;
  onClose: () => void;
}

interface WrappedStats {
  tasksCompleted: number;
  tasksAdded: number;
  highPriorityDone: number;
  subjectBreakdown: { subject: string; count: number }[];
  longestStreak: number;
  currentStreak: number;
}

function computeWeeklyStats(tasks: Task[], streakCount: number): WrappedStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const completedThisWeek = tasks.filter(t =>
    t.completed && t.completedAt && t.completedAt >= weekAgo
  );
  const addedThisWeek = tasks.filter(t => t.createdAt && t.createdAt >= weekAgo);

  const subjectMap: Record<string, number> = {};
  completedThisWeek.forEach(t => {
    const subj = t.subject || 'Other';
    subjectMap[subj] = (subjectMap[subj] || 0) + 1;
  });
  const subjectBreakdown = Object.entries(subjectMap)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    tasksCompleted: completedThisWeek.length,
    tasksAdded: addedThisWeek.length,
    highPriorityDone: completedThisWeek.filter(t => t.priority === 'high').length,
    subjectBreakdown,
    longestStreak: streakCount,
    currentStreak: streakCount,
  };
}

function getMotivationalMessage(stats: WrappedStats): string {
  if (stats.tasksCompleted === 0) return "Every week is a fresh start. You've got this! 💪";
  if (stats.tasksCompleted >= 20) return "You were absolutely crushing it this week! 🔥";
  if (stats.tasksCompleted >= 10) return "Solid week — you're building real momentum! ⚡";
  if (stats.highPriorityDone >= 3) return "You tackled the hard stuff first. That's elite. 🏆";
  if (stats.currentStreak >= 7) return "A whole week of showing up. That's consistency! 🔥";
  return "Great work this week — keep the habit going! ✨";
}

export function shouldShowWrapped(): boolean {
  const now = new Date();
  // Sunday = 0, show between 7pm-11:59pm
  if (now.getDay() !== 0) return false;
  const hours = now.getHours();
  if (hours < 19 || hours >= 24) return false;

  // Only show once per week
  const lastSeen = localStorage.getItem(WRAPPED_KEY);
  if (lastSeen) {
    const lastDate = new Date(lastSeen);
    const daysSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 6) return false;
  }
  return true;
}

export function markWrappedSeen() {
  localStorage.setItem(WRAPPED_KEY, new Date().toISOString());
}

export function StudyWrapped({ tasks, streakCount, level, levelName, xp, onClose }: StudyWrappedProps) {
  const [page, setPage] = useState(0);
  const stats = computeWeeklyStats(tasks, streakCount);
  const message = getMotivationalMessage(stats);

  const now = new Date();
  const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const pages = [
    // Page 0: Hero
    <div key="hero" className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-transparent border border-primary/30 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center">
          <span className="text-sm">✨</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Weekly Wrapped</p>
        <h2 className="text-2xl font-black text-foreground mb-1">{weekLabel}</h2>
        <p className="text-sm text-muted-foreground">Your week in review</p>
      </div>
    </div>,

    // Page 1: Tasks
    <div key="tasks" className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-success/15 border border-success/25 flex items-center justify-center">
        <CheckSquare className="h-9 w-9 text-success" />
      </div>
      <div>
        <p className="text-6xl font-black text-foreground mb-1">{stats.tasksCompleted}</p>
        <p className="text-sm font-semibold text-muted-foreground">tasks completed</p>
        {stats.highPriorityDone > 0 && (
          <p className="text-xs text-muted-foreground mt-2">Including <span className="text-error font-semibold">{stats.highPriorityDone} high-priority</span> tasks 🎯</p>
        )}
      </div>
      {stats.tasksAdded > 0 && (
        <div className="px-4 py-2 rounded-2xl bg-muted/40 border border-border/50">
          <p className="text-xs text-muted-foreground">You added <span className="font-semibold text-foreground">{stats.tasksAdded}</span> new tasks</p>
        </div>
      )}
    </div>,

    // Page 2: Streak & XP
    <div key="streak" className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-warning/10 border border-warning/25 flex-1">
          <Flame className="h-7 w-7 text-warning" />
          <p className="text-3xl font-black text-foreground">{stats.currentStreak}</p>
          <p className="text-xs text-muted-foreground">day streak</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-primary/10 border border-primary/25 flex-1">
          <Zap className="h-7 w-7 text-primary" />
          <p className="text-3xl font-black text-foreground">{xp}</p>
          <p className="text-xs text-muted-foreground">total XP</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/40 border border-border/50">
        <Star className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-sm font-medium text-foreground">{levelName} · Level {level}</p>
      </div>
    </div>,

    // Page 3: Subjects
    ...(stats.subjectBreakdown.length > 0 ? [
      <div key="subjects" className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
        <TrendingUp className="h-10 w-10 text-ai-primary" />
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Top subjects</p>
          <p className="text-sm text-muted-foreground">Where you spent your energy</p>
        </div>
        <div className="w-full space-y-2">
          {stats.subjectBreakdown.map((s, i) => (
            <div key={s.subject} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
              <span className="flex-1 text-sm font-semibold text-foreground text-left">{s.subject}</span>
              <span className="text-xs font-bold text-primary">{s.count} done</span>
            </div>
          ))}
        </div>
      </div>,
    ] : []),

    // Final: Motivational
    <div key="final" className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      <div className="text-5xl">🎉</div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">This week's verdict</p>
        <p className="text-xl font-black text-foreground leading-snug">{message}</p>
      </div>
      <p className="text-sm text-muted-foreground">See you next Sunday for your next Wrapped.</p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold active:opacity-80"
      >
        Start this week strong →
      </button>
    </div>,
  ];

  const totalPages = pages.length;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-background rounded-t-3xl sm:rounded-3xl border border-border/50 overflow-hidden flex flex-col"
        style={{ height: 'min(540px, 80dvh)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === page ? 'w-6 bg-primary' : i < page ? 'w-4 bg-primary/40' : 'w-4 bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 flex flex-col min-h-0" onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}>
          {pages[page]}
        </div>

        {/* Nav dots */}
        {page < totalPages - 1 && (
          <div className="flex-shrink-0 px-5 pb-5 pt-2">
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full py-2.5 rounded-2xl border border-border/60 text-xs font-semibold text-muted-foreground active:bg-muted/60"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
