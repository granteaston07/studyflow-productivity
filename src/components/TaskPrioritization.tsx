import { useMemo } from "react";
import { Brain, ArrowRight, Clock, Flame, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from "./TaskCard";
import { useLearningInsights } from "@/hooks/useLearningInsights";
import { isToday, isTomorrow, isPast, differenceInDays } from "date-fns";

interface TaskPrioritizationProps {
  tasks: Task[];
  onSelectTask?: (id: string) => void;
  selectedTaskId?: string | null;
}

interface RankedTask {
  task: Task;
  score: number;
  badge: string;
  badgeStyle: string;
  reason: string;
  timeEst: string;
}

function rankTask(task: Task, getTimeEstimate: (subject?: string) => number | null): RankedTask {
  let score = 0;
  let badge = "";
  let badgeStyle = "";
  let reason = "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (task.dueDate) {
    const due = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
    const days = differenceInDays(due, today);

    if (days < 0) {
      score += 120 + Math.abs(days) * 5;
      badge = "Overdue";
      badgeStyle = "bg-error/15 text-error border-error/25";
      reason = `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} past deadline`;
    } else if (days === 0) {
      score += 90;
      badge = "Due today";
      badgeStyle = "bg-warning/15 text-warning border-warning/25";
      reason = "Deadline is today";
    } else if (days === 1) {
      score += 70;
      badge = "Due tomorrow";
      badgeStyle = "bg-primary/15 text-primary border-primary/25";
      reason = "Due tomorrow — start now";
    } else if (days <= 7) {
      score += Math.max(40 - days * 6, 10);
      reason = `Due in ${days} days`;
    }
  }

  switch (task.priority) {
    case "high":   score += 40; break;
    case "medium": score += 20; break;
    case "low":    score += 5; break;
  }

  if (task.status === "in-progress") score += 15;

  const est = getTimeEstimate(task.subject);
  const timeEst = est ? `~${est} min` : task.priority === "high" ? "60–90 min" : task.priority === "medium" ? "30–60 min" : "15–30 min";

  if (!badge) {
    if (task.priority === "high") { badge = "High priority"; badgeStyle = "bg-error/10 text-error border-error/20"; reason = reason || "High priority task"; }
    else if (task.priority === "medium") { badge = ""; badgeStyle = ""; reason = reason || "Medium priority"; }
    else { badge = ""; badgeStyle = ""; reason = reason || "Queued task"; }
  }

  return { task, score, badge, badgeStyle, reason, timeEst };
}

export function TaskPrioritization({ tasks, onSelectTask, selectedTaskId }: TaskPrioritizationProps) {
  const { getTimeEstimateForTask } = useLearningInsights();

  const ranked = useMemo(() => {
    const active = tasks.filter(t => !t.completed);
    return active
      .map(t => rankTask(t, getTimeEstimateForTask))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [tasks, getTimeEstimateForTask]);

  if (ranked.length === 0) return null;

  const [top, ...rest] = ranked;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Brain className="h-4 w-4 text-ai-primary" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-ai-secondary rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI · What to do next</span>
      </div>

      {/* Top pick — hero card */}
      <button
        onClick={() => onSelectTask?.(top.task.id)}
        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 ${
          selectedTaskId === top.task.id
            ? "border-ai-primary bg-ai-primary/8"
            : "border-ai-primary/30 bg-gradient-to-br from-ai-primary/5 to-ai-secondary/5 hover:border-ai-primary/50 hover:bg-ai-primary/8"
        }`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-ai-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-ai-primary uppercase tracking-wider">Do this first</span>
          </div>
          {top.badge && (
            <Badge variant="outline" className={`text-xs border flex-shrink-0 ${top.badgeStyle}`}>
              {top.badge}
            </Badge>
          )}
        </div>
        <p className="text-base font-bold text-foreground leading-snug mb-1">{top.task.title}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {top.task.subject && <span>{top.task.subject}</span>}
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{top.timeEst}</span>
          {top.reason && <span className="text-ai-primary/80">{top.reason}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-ai-primary font-medium">
          {selectedTaskId === top.task.id ? "Selected for Focus timer" : "Tap to focus on this"}
          <ArrowRight className="h-3 w-3" />
        </div>
      </button>

      {/* Secondary picks */}
      {rest.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Up next</p>
          {rest.map((r, i) => (
            <button
              key={r.task.id}
              onClick={() => onSelectTask?.(r.task.id)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${
                selectedTaskId === r.task.id
                  ? "border-primary/40 bg-primary/8"
                  : "border-border/50 hover:border-border hover:bg-muted/40"
              }`}>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                {i + 2}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.task.title}</p>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {r.badge && (
                  <Badge variant="outline" className={`text-xs border ${r.badgeStyle}`}>{r.badge}</Badge>
                )}
                {!r.badge && r.task.priority === "high" && (
                  <Flame className="h-3.5 w-3.5 text-error" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
