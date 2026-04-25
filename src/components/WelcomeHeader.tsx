import { useState } from "react";
import { Task } from "./TaskCard";
import { isToday, isPast } from "date-fns";

interface WelcomeHeaderProps {
  tasks: Task[];
  userName?: string;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 4) return "night";
  if (h < 6) return "early";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

type Msg = [string, string];

function buildPool(tasks: Task[], userName?: string): Msg[] {
  const n = userName ? `, ${userName}` : "";
  const active = tasks.filter(t => !t.completed);
  const dueToday = active.filter(t => t.dueDate && isToday(t.dueDate)).length;
  const overdue = active.filter(t => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate)).length;
  const tod = getTimeOfDay();

  if (overdue > 0) {
    return [
      [`Let's catch up${n}.`, `${overdue} overdue task${overdue !== 1 ? "s" : ""} — clear those first.`],
      [`Time to tackle it${n}.`, `${overdue} task${overdue !== 1 ? "s" : ""} past deadline. One at a time.`],
      [`No stress${n}.`, `You've got ${overdue} overdue. Start with the oldest one.`],
    ];
  }

  if (dueToday > 0) {
    return [
      [`Welcome back${n}. Let's be productive.`, `${dueToday} task${dueToday !== 1 ? "s" : ""} due today.`],
      [`Good to see you${n}.`, `${dueToday === 1 ? "One task" : `${dueToday} tasks`} due today. Let's get moving.`],
      [`You've got this${n}.`, `Start now, thank yourself later. ${dueToday} due today.`],
      [`Let's make today count${n}.`, `${dueToday} thing${dueToday !== 1 ? "s" : ""} on the board for today.`],
      [`Hey${n}. Let's do this.`, `${dueToday} task${dueToday !== 1 ? "s" : ""} due today — don't let them slip.`],
    ];
  }

  if (active.length === 0) {
    return [
      [`All caught up${n}. Nice work.`, `Get ahead — add what's coming up next.`],
      [`Clean slate${n}.`, `Everything's done. Add tomorrow's work now.`],
      [`You're on top of it${n}.`, `Task list is clear. A great time to get ahead.`],
    ];
  }

  const byTime: Record<string, Msg[]> = {
    morning: [
      [`Good morning${n}. Let's get moving.`, `Your most productive hours are right now — use them.`],
      [`Morning${n}. Let's be productive.`, `Tackle your hardest task first while your brain is fresh.`],
      [`Rise and grind${n}.`, `Morning focus hits different. Make it count.`],
      [`Welcome back${n}.`, `First task of the day sets the tone. Choose well.`],
    ],
    early: [
      [`Early bird${n}.`, `This quiet time is your edge. Most people are still asleep.`],
      [`Up early${n}. Smart move.`, `Deep work before the world wakes up.`],
    ],
    afternoon: [
      [`Good afternoon${n}. Keep going.`, `Pick one thing and start — momentum beats motivation.`],
      [`Welcome back${n}. Let's be productive.`, `Afternoon grind. You've got tasks to knock out.`],
      [`Hey${n}. Let's do this.`, `Don't let the afternoon slip. One task at a time.`],
      [`Still time${n}.`, `The day isn't over. Lock in for one more session.`],
    ],
    evening: [
      [`Good evening${n}.`, `Finish strong — clear at least one task tonight.`],
      [`Evening grind${n}.`, `One focused session now makes tomorrow easier.`],
      [`Hey${n}, evening.`, `Don't let the day end without making progress.`],
      [`Almost done${n}.`, `One last push before you call it a day.`],
    ],
    night: [
      [`Still at it${n}.`, `Late session respect. Keep it focused.`],
      [`Night mode${n}.`, `Make it count — one task, full focus.`],
      [`Burning the midnight oil${n}.`, `You're putting in the work. That's how it's done.`],
    ],
  };

  return byTime[tod] ?? byTime["afternoon"];
}

export function WelcomeHeader({ tasks, userName }: WelcomeHeaderProps) {
  const active = tasks.filter(t => !t.completed);
  const overdue = active.filter(t => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate)).length;

  const pool = buildPool(tasks, userName);
  const [idx] = useState(() => Math.floor(Math.random() * 100));
  const [headline, subtitle] = pool[idx % pool.length];

  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold text-foreground">{headline}</h1>
      <p className={`text-sm mt-0.5 ${overdue > 0 ? "text-error" : "text-muted-foreground"}`}>
        {subtitle}
      </p>
    </div>
  );
}
