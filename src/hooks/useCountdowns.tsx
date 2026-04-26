import { useState, useCallback } from 'react';

export interface Countdown {
  id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  emoji: string;
  createdAt: string;
}

const STORAGE_KEY = 'propel_countdowns';

function load(): Countdown[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: Countdown[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCountdowns() {
  const [countdowns, setCountdowns] = useState<Countdown[]>(load);

  const addCountdown = useCallback((title: string, date: string, emoji: string) => {
    const item: Countdown = {
      id: `cd_${Date.now()}`,
      title,
      date,
      emoji,
      createdAt: new Date().toISOString(),
    };
    setCountdowns(prev => {
      const next = [...prev, item];
      save(next);
      return next;
    });
  }, []);

  const deleteCountdown = useCallback((id: string) => {
    setCountdowns(prev => {
      const next = prev.filter(c => c.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { countdowns, addCountdown, deleteCountdown };
}
