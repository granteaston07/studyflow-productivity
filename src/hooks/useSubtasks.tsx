import { useState, useCallback } from "react";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = "studyflow_subtasks";

function loadAll(): Record<string, Subtask[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, Subtask[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useSubtasks(taskId: string) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    return loadAll()[taskId] ?? [];
  });

  const persist = useCallback((taskId: string, updated: Subtask[]) => {
    const all = loadAll();
    if (updated.length === 0) {
      delete all[taskId];
    } else {
      all[taskId] = updated;
    }
    saveAll(all);
    setSubtasks(updated);
  }, []);

  const addSubtask = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    const all = loadAll();
    const current = all[taskId] ?? [];
    persist(taskId, [...current, newSubtask]);
  }, [taskId, persist]);

  const toggleSubtask = useCallback((subtaskId: string) => {
    const all = loadAll();
    const current = all[taskId] ?? [];
    const updated = current.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    persist(taskId, updated);
  }, [taskId, persist]);

  const deleteSubtask = useCallback((subtaskId: string) => {
    const all = loadAll();
    const current = all[taskId] ?? [];
    persist(taskId, current.filter(s => s.id !== subtaskId));
  }, [taskId, persist]);

  const completedCount = subtasks.filter(s => s.completed).length;

  return { subtasks, addSubtask, toggleSubtask, deleteSubtask, completedCount };
}
