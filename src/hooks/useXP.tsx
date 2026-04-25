import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const LEVEL_NAMES = [
  'Rookie', 'Student', 'Scholar I', 'Scholar II', 'Scholar III',
  'Scholar IV', 'Expert', 'Master', 'Legend', 'Genius'
];

const XP_PER_LEVEL = 500;
const XP_PER_TASK = 50;
const XP_HIGH_PRIORITY_BONUS = 25;

function storageKey(userId?: string) {
  return userId ? `studyflow-xp-${userId}` : 'studyflow-xp-guest';
}

export function useXP() {
  const { user } = useAuth();
  const key = storageKey(user?.id);

  const [xp, setXP] = useState(() => {
    const stored = localStorage.getItem(storageKey(user?.id));
    return stored ? parseInt(stored, 10) : 0;
  });

  // When the user changes (login/logout), reload XP for that user
  useEffect(() => {
    const stored = localStorage.getItem(key);
    setXP(stored ? parseInt(stored, 10) : 0);
  }, [key]);

  const level = Math.floor(xp / XP_PER_LEVEL);
  const levelName = LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)];
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL;
  const progress = (xpInLevel / xpToNext) * 100;

  const addXP = (amount: number) => {
    setXP(prev => {
      const next = prev + amount;
      localStorage.setItem(key, String(next));
      return next;
    });
  };

  const awardTask = (priority: 'low' | 'medium' | 'high') => {
    const bonus = priority === 'high' ? XP_HIGH_PRIORITY_BONUS : 0;
    addXP(XP_PER_TASK + bonus);
    return XP_PER_TASK + bonus;
  };

  return { xp, level, levelName, xpInLevel, xpToNext, progress, addXP, awardTask };
}
