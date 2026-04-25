import { useState, useCallback } from "react";
import { isToday } from "date-fns";
import { Task } from "@/hooks/useTasks";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notifyDueToday = useCallback((tasks: Task[]) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const todayKey = new Date().toISOString().split("T")[0];
    const storageKey = `studyflow_notified_${todayKey}`;
    const notified: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const dueToday = tasks.filter(
      t => !t.completed && t.dueDate && isToday(t.dueDate) && !notified.includes(t.id)
    );

    dueToday.forEach(task => {
      new Notification(`Due today: ${task.title}`, {
        body: task.subject ? `${task.subject} · StudyFlow` : "StudyFlow",
        icon: "/favicon.png",
        tag: task.id,
      });
      notified.push(task.id);
    });

    if (dueToday.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(notified));
    }
  }, []);

  return { permission, requestPermission, notifyDueToday };
}
