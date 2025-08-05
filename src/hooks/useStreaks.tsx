import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface StudyStreak {
  id: string;
  user_id: string;
  streak_type: 'daily_study' | 'task_completion' | 'focus_sessions';
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export const useStreaks = () => {
  const [streaks, setStreaks] = useState<StudyStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStreaks = async () => {
    if (!user) {
      setStreaks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setStreaks((data || []) as StudyStreak[]);
    } catch (error) {
      console.error('Error fetching streaks:', error);
      toast({
        title: "Error",
        description: "Failed to load study streaks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async (streakType: 'daily_study' | 'task_completion' | 'focus_sessions' = 'daily_study') => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_study_streak', {
        p_user_id: user.id,
        p_streak_type: streakType
      });

      if (error) throw error;

      // Refresh streaks to get updated data
      await fetchStreaks();
    } catch (error) {
      console.error('Error updating streak:', error);
      toast({
        title: "Error",
        description: "Failed to update study streak",
        variant: "destructive",
      });
    }
  };

  const getStreak = (streakType: 'daily_study' | 'task_completion' | 'focus_sessions') => {
    return streaks.find(streak => streak.streak_type === streakType);
  };

  const getCurrentStreak = (streakType: 'daily_study' | 'task_completion' | 'focus_sessions') => {
    const streak = getStreak(streakType);
    return streak?.current_streak || 0;
  };

  const getLongestStreak = (streakType: 'daily_study' | 'task_completion' | 'focus_sessions') => {
    const streak = getStreak(streakType);
    return streak?.longest_streak || 0;
  };

  useEffect(() => {
    fetchStreaks();
  }, [user]);

  return {
    streaks,
    loading,
    updateStreak,
    getStreak,
    getCurrentStreak,
    getLongestStreak,
    refreshStreaks: fetchStreaks,
  };
};