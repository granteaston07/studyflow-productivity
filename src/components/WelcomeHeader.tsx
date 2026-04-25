import { Task } from "./TaskCard";
import { isToday, isPast } from "date-fns";

interface WelcomeHeaderProps {
  tasks: Task[];
  userName?: string;
}

const GREETINGS: Record<string, string> = {
  "early morning": "Rise and grind",
  "morning": "Good morning",
  "afternoon": "Good afternoon",
  "evening": "Good evening",
  "night": "Still going",
  "late night": "Burning the midnight oil",
};

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 4) return "late night";
  if (h < 6) return "early morning";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

export function WelcomeHeader({ tasks, userName }: WelcomeHeaderProps) {
  const timeOfDay = getTimeOfDay();
  const greeting = GREETINGS[timeOfDay] || "Hey";

  const active = tasks.filter(t => !t.completed);
  const dueToday = active.filter(t => t.dueDate && isToday(t.dueDate));
  const overdue = active.filter(t => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate));

  let subtitle = "";
  if (active.length === 0) {
    subtitle = "You're all caught up.";
  } else if (overdue.length > 0) {
    subtitle = `${overdue.length} overdue task${overdue.length !== 1 ? "s" : ""} need attention.`;
  } else if (dueToday.length > 0) {
    subtitle = `${dueToday.length} task${dueToday.length !== 1 ? "s" : ""} due today.`;
  } else {
    subtitle = `${active.length} task${active.length !== 1 ? "s" : ""} in your queue.`;
  }

  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold text-foreground">
        {greeting}{userName ? `, ${userName}` : ""}.
      </h1>
      <p className={`text-sm mt-0.5 ${overdue.length > 0 ? "text-error" : "text-muted-foreground"}`}>
        {subtitle}
      </p>
    </div>
  );
}
