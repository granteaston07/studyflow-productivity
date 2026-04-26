import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const LEVEL_NAMES = [
  'Rookie', 'Student', 'Scholar I', 'Scholar II', 'Scholar III',
  'Scholar IV', 'Expert', 'Master', 'Legend', 'Genius'
];

const XP_PER_LEVEL = 500;
const XP_PER_TASK = 50;
const XP_HIGH_PRIORITY_BONUS = 25;

export function useXP() {
  const { user } = useAuth();
  const [xp, setXP] = useState(0);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error) setXP(data?.xp ?? 0);
      })
      .catch(() => {});
  }, [user?.id]);

  const level = Math.floor(xp / XP_PER_LEVEL);
  const levelName = LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)];
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL;
  const progress = (xpInLevel / xpToNext) * 100;

  const addXP = useCallback(async (amount: number) => {
    if (!user) return;

    // Optimistic update so the UI responds immediately
    setXP(prev => prev + amount);

    const { data, error } = await supabase.rpc('add_xp', { p_amount: amount });
    if (!error && data !== null) {
      // Reconcile with server value
      setXP(data as number);
    }
  }, [user?.id]);

  const awardTask = useCallback((priority: 'low' | 'medium' | 'high') => {
    const bonus = priority === 'high' ? XP_HIGH_PRIORITY_BONUS : 0;
    const total = XP_PER_TASK + bonus;
    addXP(total);
    return total;
  }, [addXP]);

  return { xp, level, levelName, xpInLevel, xpToNext, progress, addXP, awardTask };
}
