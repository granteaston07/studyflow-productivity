import { Brain, Clock, Play } from "lucide-react";
import { Task } from "./TaskCard";
import { isToday, isPast, differenceInDays } from "date-fns";

interface AISessionPlannerProps {
  tasks: Task[];
  onSelectTask?: (id: string) => void;
  selectedTaskId?: string | null;
}

interface SessionBlock {
  task: Task;
  minutes: number;
  howToStart: string;
}

function detectTypeFromSubject(subject: string): string {
  const s = subject.toLowerCase();
  if (/\bhistory\b|social studies|civics|geography|humanities|govt|government/i.test(s)) return "history";
  if (/\bmath\b|mathematics|calculus|algebra|geometry|statistics|arithmetic|trig/i.test(s)) return "math";
  if (/biology|chemistry|physics|\bscience\b|environmental|earth science/i.test(s)) return "science";
  if (/\benglish\b|literature|\bwriting\b|composition|language arts/i.test(s)) return "writing";
  if (/comp.?sci|computer|coding|programming|software/i.test(s)) return "coding";
  if (/spanish|french|german|japanese|mandarin|latin|\blanguage\b|linguistics/i.test(s)) return "language";
  if (/psychology|sociology|economics|political science/i.test(s)) return "history";
  return "general";
}

function detectType(title: string, subject?: string): string {
  const t = (title + " " + (subject || "")).toLowerCase();
  if (/lab|experiment|practical|dissect|hypothesis/i.test(t)) return "lab";
  if (/essay|write|draft|paper|report|paragraph|composition/i.test(t)) return "writing";
  if (/present|slide|speech|talk|pitch/i.test(t)) return "presentation";
  if (/research|bibliograph|cite|annotated/i.test(t)) return "research";
  if (/exam|test\b|quiz|revision|revise|flashcard/i.test(t)) return "revision";
  if (/read|chapter|textbook|pages?|article|novel\b/i.test(t)) return "reading";
  if (/code|program|debug|implement|function|class|algorithm|app\b|build/i.test(t)) return "coding";
  if (/vocab|translat|grammar/i.test(t)) return "language";
  if (/calc|equation|worksheet|algebra|geometry|trig|derivative|integral|factor/i.test(t)) return "math";
  if (/timeline|source|cause|effect|war|revolution|event/i.test(t)) return "history";
  if (/reaction|cell|atom|force|energy|molecule/i.test(t)) return "science";
  return detectTypeFromSubject(subject || "");
}

function getTypeInfo(type: string, subject?: string): { minutes: number; howToStart: string } {
  const s = subject && subject !== "General" ? subject : null;
  const map: Record<string, { minutes: number; howToStart: string }> = {
    writing:      { minutes: 45, howToStart: `Brain dump for 10 min — write without editing.${s ? ` Frame it around your ${s} argument.` : ""}` },
    math:         { minutes: 45, howToStart: `Work through 2 examples from your ${s || "maths"} notes before attempting any problems.` },
    reading:      { minutes: 30, howToStart: `Skim headings first, then read ${s ? `this ${s} text` : "it"} with a pen in hand.` },
    coding:       { minutes: 45, howToStart: "Write what the function/feature should do in plain English first." },
    revision:     { minutes: 25, howToStart: `Close your ${s || "course"} notes and write down everything you can recall.` },
    lab:          { minutes: 60, howToStart: `Read the full ${s || "lab"} procedure before touching any equipment.` },
    language:     { minutes: 20, howToStart: `Cover the ${s || "vocab"} definitions and test yourself — don't just read.` },
    history:      { minutes: 30, howToStart: `Write a ${s || "history"} timeline or cause-effect chain from memory first.` },
    science:      { minutes: 35, howToStart: `Explain this ${s || "science"} concept out loud before opening your notes.` },
    presentation: { minutes: 30, howToStart: `Write 3 key ${s || "topic"} points. Practise saying them out loud once.` },
    research:     { minutes: 45, howToStart: `Write your ${s || "research"} question at the top before searching anything.` },
    general:      { minutes: 30, howToStart: `Write what "${s ? `this ${s} task` : "done"}" looks like before starting.` },
  };
  return map[type] ?? map.general;
}

function scoreTask(task: Task): number {
  let score = 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (task.dueDate) {
    const due = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
    const days = differenceInDays(due, today);
    if (days < 0) score += 120 + Math.abs(days) * 5;
    else if (days === 0) score += 90;
    else if (days === 1) score += 70;
    else if (days <= 7) score += Math.max(40 - days * 6, 10);
  }
  if (task.priority === "high") score += 40;
  else if (task.priority === "medium") score += 20;
  else score += 5;
  if (task.status === "in-progress") score += 15;
  return score;
}

function buildSession(tasks: Task[]): SessionBlock[] {
  const active = tasks.filter(t => !t.completed);
  const sorted = [...active].sort((a, b) => scoreTask(b) - scoreTask(a)).slice(0, 3);
  return sorted.map(task => {
    const type = detectType(task.title, task.subject);
    const info = getTypeInfo(type, task.subject);
    const base = info.minutes;
    const minutes = task.priority === "high" ? Math.min(base + 15, 90) : base;
    return { task, minutes, howToStart: info.howToStart };
  });
}

export function AISessionPlanner({ tasks, onSelectTask, selectedTaskId }: AISessionPlannerProps) {
  const active = tasks.filter(t => !t.completed);
  if (active.length === 0) return null;

  const blocks = buildSession(tasks);
  const totalMinutes = blocks.reduce((sum, b) => sum + b.minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const totalLabel = totalHours > 0
    ? `${totalHours}h${totalMins > 0 ? ` ${totalMins}m` : ""}`
    : `${totalMinutes}m`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-4 w-4 text-ai-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-ai-secondary rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Study Session
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>~{totalLabel} total</span>
        </div>
      </div>

      {/* Session blocks */}
      <div className="space-y-2">
        {blocks.map((block, i) => {
          const isSelected = selectedTaskId === block.task.id;
          return (
            <button
              key={block.task.id}
              onClick={() => onSelectTask?.(block.task.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 ${
                isSelected
                  ? "border-ai-primary/40 bg-ai-primary/8"
                  : "border-border/50 bg-card hover:border-ai-primary/25 hover:bg-ai-primary/3"
              }`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  i === 0 ? "bg-ai-primary/15 text-ai-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{block.task.title}</p>
                    <span className="text-xs font-bold text-muted-foreground flex-shrink-0">{block.minutes}m</span>
                  </div>
                  {block.task.subject && (
                    <p className="text-xs text-muted-foreground mb-1">{block.task.subject}</p>
                  )}
                  <p className="text-xs text-ai-primary/80 leading-relaxed">
                    → {block.howToStart}
                  </p>
                </div>
              </div>
              {isSelected && (
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-ai-primary/15 text-xs text-ai-primary font-medium">
                  <Play className="h-3 w-3" />
                  Selected — start the timer above
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center pt-1">
        Take a 5-min break between each block. Tap a task to load it in the timer.
      </p>
    </div>
  );
}
