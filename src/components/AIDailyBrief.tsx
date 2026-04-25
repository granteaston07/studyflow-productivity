import { useMemo } from "react";
import { Brain, Flame, Zap, ChevronRight } from "lucide-react";
import { Task } from "./TaskCard";
import { isToday, isTomorrow, isPast } from "date-fns";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useXP } from "@/hooks/useXP";

interface AIDailyBriefProps {
  tasks: Task[];
  userName?: string;
}

const HOUR_LABELS: Record<number, string> = {
  0: "night", 1: "night", 2: "night", 3: "night",
  4: "early morning", 5: "early morning", 6: "morning",
  7: "morning", 8: "morning", 9: "morning", 10: "morning", 11: "morning",
  12: "afternoon", 13: "afternoon", 14: "afternoon", 15: "afternoon",
  16: "afternoon", 17: "evening", 18: "evening", 19: "evening",
  20: "evening", 21: "night", 22: "night", 23: "night",
};

const SUBJECT_PEAK: Record<string, string> = {
  math: "morning", physics: "morning", chemistry: "morning",
  biology: "afternoon", history: "afternoon", english: "afternoon",
  literature: "afternoon", science: "morning",
};

function getSubjectPeak(subject: string): string {
  const key = subject.toLowerCase();
  for (const [k, v] of Object.entries(SUBJECT_PEAK)) {
    if (key.includes(k)) return v;
  }
  return "any time";
}

export function AIDailyBrief({ tasks, userName }: AIDailyBriefProps) {
  const { streak } = useStudyStreak();
  const { levelName } = useXP();

  const brief = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = HOUR_LABELS[hour] || "day";
    const active = tasks.filter(t => !t.completed);
    const overdue = active.filter(t => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate));
    const dueToday = active.filter(t => t.dueDate && isToday(t.dueDate));
    const dueTomorrow = active.filter(t => t.dueDate && isTomorrow(t.dueDate));
    const completed = tasks.filter(t => t.completed);
    const streakCount = streak?.current_streak || 0;

    const subjectCounts = new Map<string, number>();
    active.forEach(t => {
      if (t.subject) subjectCounts.set(t.subject, (subjectCounts.get(t.subject) || 0) + 1);
    });
    const topSubject = Array.from(subjectCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    let summary = "";
    if (active.length === 0) {
      summary = "All tasks complete. You're ahead of the game.";
    } else if (overdue.length > 0) {
      summary = `${overdue.length} overdue task${overdue.length !== 1 ? "s" : ""} — tackle those before anything else.`;
    } else if (dueToday.length > 0) {
      summary = `${dueToday.length} due today${dueToday.filter(t => t.priority === "high").length > 0 ? ` · ${dueToday.filter(t => t.priority === "high").length} high priority` : ""}.`;
    } else {
      summary = `${active.length} task${active.length !== 1 ? "s" : ""} in your queue${dueTomorrow.length > 0 ? ` · ${dueTomorrow.length} due tomorrow` : ""}.`;
    }

    let tip = "";
    if (overdue.length > 0) {
      tip = "Start with the most overdue task. Clearing it frees up mental space for everything else.";
    } else if (dueToday.length > 0 && hour < 12) {
      tip = `It's ${timeOfDay} — your focus is sharpest now. Hit the due-today tasks before anything else.`;
    } else if (dueToday.length > 0) {
      tip = "You still have time today. Block 45 minutes right now and make a dent.";
    } else if (topSubject) {
      const peak = getSubjectPeak(topSubject[0]);
      tip = `Most of your work is ${topSubject[0]}. Best studied in the ${peak === "any time" ? "morning or afternoon" : peak}.`;
    } else if (streakCount >= 3) {
      tip = `${streakCount}-day streak active. Even 20 focused minutes today keeps it alive.`;
    } else if (active.length > 0) {
      tip = "Pick one task and work on it for 25 minutes. Momentum beats motivation every time.";
    } else {
      tip = "Use this time to get ahead — add next week's tasks now and start the day ready.";
    }

    return {
      summary,
      tip,
      overdue: overdue.length,
      dueToday: dueToday.length,
      streakCount,
      completed: completed.length,
      active: active.length,
    };
  }, [tasks, streak]);

  if (tasks.length === 0 && !brief.streakCount) return null;

  return (
    <div className="bg-gradient-to-br from-ai-primary/8 via-primary/5 to-ai-secondary/6 border border-ai-primary/20 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-4 w-4 text-ai-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-ai-secondary rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-ai-primary uppercase tracking-wider">AI Daily Brief</span>
        </div>
        <div className="flex items-center gap-2">
          {brief.streakCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-warning">
              <Flame className="h-3.5 w-3.5 streak-fire" />
              {brief.streakCount}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            {levelName}
          </div>
        </div>
      </div>

      {/* Summary */}
      {brief.summary && (
        <p className="text-sm font-medium text-foreground">{brief.summary}</p>
      )}

      {/* AI tip */}
      {brief.tip && (
        <div className="flex items-start gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-ai-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-ai-primary font-semibold">Tip: </span>
            {brief.tip}
          </p>
        </div>
      )}

      {/* Quick stats */}
      <div className="flex items-center gap-3 pt-1 border-t border-ai-primary/10 text-xs text-muted-foreground">
        {brief.overdue > 0 && <span className="text-error font-medium">{brief.overdue} overdue</span>}
        {brief.dueToday > 0 && <span className="text-warning font-medium">{brief.dueToday} due today</span>}
        {brief.completed > 0 && <span className="text-success font-medium">{brief.completed} done</span>}
        {brief.active > 0 && <span>{brief.active} active</span>}
      </div>
    </div>
  );
}
