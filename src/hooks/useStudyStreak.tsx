import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StudyStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_type: string;
  created_at: string;
  updated_at: string;
}

export const useStudyStreak = () => {
  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStreak = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', 'daily_study')
        .maybeSingle();

      if (error) throw error;
      
      setStreak(data);
    } catch (error) {
      console.error('Error fetching study streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      // Call the database function to update streak
      const { error } = await supabase.rpc('update_study_streak', {
        p_user_id: user.id,
        p_streak_type: 'daily_study'
      });

      if (error) throw error;

      // Refresh the streak data
      await fetchStreak();
      
      return true;
    } catch (error) {
      console.error('Error updating study streak:', error);
      return false;
    }
  };

  const recordStudyActivity = async () => {
    const success = await updateStreak();
    if (success && streak) {
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = streak.last_activity_date;
      if (lastActivity !== today) {
        toast.success(`${streak.current_streak + 1}-day streak! 🔥`);
      }
    }
    return success;
  };

  useEffect(() => {
    fetchStreak();
  }, [user?.id]);

  return {
    streak,
    loading,
    updateStreak,
    recordStudyActivity,
    refreshStreak: fetchStreak,
  };
};