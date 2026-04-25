import { useState, useCallback } from "react";
import { isToday, isTomorrow, format } from "date-fns";
import { Task } from "@/hooks/useTasks";

export interface NotificationSettings {
  dueTodayEnabled: boolean;
  dueTomorrowEnabled: boolean;
  overdueEnabled: boolean;
  streakEnabled: boolean;
  streakReminderTime: string; // "HH:MM"
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dueTodayEnabled: true,
  dueTomorrowEnabled: true,
  overdueEnabled: true,
  streakEnabled: true,
  streakReminderTime: "20:00",
};

const SETTINGS_KEY = "studyflow_notif_settings";
const ICON = "/lovable-uploads/7ebcf151-96f2-47f3-aa6f-e7400c8e6f3b.png";

function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function todayFlag(key: string) {
  return `studyflow_notif_${key}_${format(new Date(), "yyyy-MM-dd")}`;
}

function alreadyFired(key: string) {
  return !!localStorage.getItem(todayFlag(key));
}

function markFired(key: string) {
  localStorage.setItem(todayFlag(key), "1");
}

function fire(title: string, body: string, tag: string) {
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: ICON, tag, silent: false });
  } catch {
    // Some browsers block notifications in certain contexts
  }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );

  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const updateSettings = useCallback((patch: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Called whenever tasks load or change — fires any notifications that are due
  const scheduleNotifications = useCallback((tasks: Task[], streakCount: number) => {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const activeTasks = tasks.filter(t => !t.completed);

    // ── 1. Overdue tasks ───────────────────────────────────────────
    if (settings.overdueEnabled && !alreadyFired("overdue")) {
      const overdue = activeTasks.filter(t => t.status === "overdue");
      if (overdue.length > 0) {
        const names = overdue.slice(0, 2).map(t => t.title).join(", ");
        const extra = overdue.length > 2 ? ` +${overdue.length - 2} more` : "";
        fire(
          `${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`,
          `${names}${extra}`,
          "overdue"
        );
        markFired("overdue");
      }
    }

    // ── 2. Due today ───────────────────────────────────────────────
    if (settings.dueTodayEnabled && !alreadyFired("due-today")) {
      const dueToday = activeTasks.filter(t => t.dueDate && isToday(t.dueDate));
      if (dueToday.length > 0) {
        const names = dueToday.slice(0, 2).map(t => t.title).join(", ");
        const extra = dueToday.length > 2 ? ` +${dueToday.length - 2} more` : "";
        fire(
          `${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`,
          `${names}${extra}`,
          "due-today"
        );
        markFired("due-today");
      }
    }

    // ── 3. Due tomorrow (fire after 6pm if not yet sent) ───────────
    if (settings.dueTomorrowEnabled && !alreadyFired("due-tomorrow") && currentMinutes >= 18 * 60) {
      const dueTomorrow = activeTasks.filter(t => t.dueDate && isTomorrow(t.dueDate));
      if (dueTomorrow.length > 0) {
        const names = dueTomorrow.slice(0, 2).map(t => t.title).join(", ");
        const extra = dueTomorrow.length > 2 ? ` +${dueTomorrow.length - 2} more` : "";
        fire(
          `${dueTomorrow.length} task${dueTomorrow.length > 1 ? "s" : ""} due tomorrow`,
          `${names}${extra}`,
          "due-tomorrow"
        );
        markFired("due-tomorrow");
      }
    }

    // ── 4. Streak reminder (fire after user-set time) ──────────────
    if (settings.streakEnabled && !alreadyFired("streak")) {
      const [rh, rm] = settings.streakReminderTime.split(":").map(Number);
      const reminderMinutes = rh * 60 + rm;
      if (currentMinutes >= reminderMinutes) {
        fire(
          streakCount > 0
            ? `Keep your ${streakCount}-day streak going! 🔥`
            : "Start your study streak today 🔥",
          "Open StudyFlow and complete a task.",
          "streak"
        );
        markFired("streak");
      }
    }
  }, [settings]);

  return { permission, requestPermission, settings, updateSettings, scheduleNotifications };
}
