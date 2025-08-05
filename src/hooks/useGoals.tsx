import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface StudyGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value: number;
  target_type: 'hours' | 'sessions' | 'tasks';
  target_period: 'daily' | 'weekly' | 'monthly';
  current_progress: number;
  start_date: string;
  end_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data || []) as StudyGoal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load study goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goalData: Omit<StudyGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_progress' | 'completed'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_goals')
        .insert([
          {
            ...goalData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data as StudyGoal, ...prev]);
      toast({
        title: "Goal Created",
        description: `New study goal "${goalData.title}" has been set!`,
      });

      return data;
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to create study goal",
        variant: "destructive",
      });
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<StudyGoal>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...(data as StudyGoal) } : goal
      ));

      return data as StudyGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update study goal",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast({
        title: "Goal Deleted",
        description: "Study goal has been removed",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete study goal",
        variant: "destructive",
      });
    }
  };

  const updateGoalProgress = async (goalType: string, increment: number = 1) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_goal_progress', {
        p_user_id: user.id,
        p_goal_type: goalType,
        p_increment: increment
      });

      if (error) throw error;

      // Refresh goals to get updated progress
      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    refreshGoals: fetchGoals,
  };
};