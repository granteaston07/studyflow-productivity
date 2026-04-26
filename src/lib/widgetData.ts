import { registerPlugin } from '@capacitor/core';

interface WidgetDataPlugin {
  update(data: {
    taskCount: number;
    completedToday: number;
    streak: number;
    levelName: string;
    xp: number;
    xpToNext: number;
    nextTasks: Array<{ id: string; title: string; priority: string; subject?: string; dueDateLabel?: string }>;
    countdownTitle?: string;
    countdownDays?: number;
  }): Promise<void>;
}

const WidgetData = registerPlugin<WidgetDataPlugin>('WidgetData');

const isNative = !!(window as any).Capacitor?.isNativePlatform?.();

export async function syncWidgetData(data: Parameters<WidgetDataPlugin['update']>[0]) {
  if (!isNative) return;
  try {
    await WidgetData.update(data);
  } catch {
    // Non-fatal — widget data is best-effort
  }
}
