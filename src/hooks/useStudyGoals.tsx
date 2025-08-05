import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type StudyCalendarGoalRow = Database['public']['Tables']['study_calendar_goals']['Row'];
type StudyCalendarGoalInsert = Database['public']['Tables']['study_calendar_goals']['Insert'];
type StudyCalendarGoalUpdate = Database['public']['Tables']['study_calendar_goals']['Update'];

export interface StudyGoal extends StudyCalendarGoalRow {
  completed_dates: string[]; // Parse JSON to string array
}

export const useStudyGoals = () => {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('study_calendar_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const goalsWithParsedDates = data?.map(goal => ({
        ...goal,
        completed_dates: Array.isArray(goal.completed_dates) ? goal.completed_dates as string[] : []
      })) || [];
      
      setGoals(goalsWithParsedDates);
    } catch (error) {
      console.error('Error fetching study goals:', error);
      toast({
        title: "Error",
        description: "Failed to load study goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goalData: Omit<StudyGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_dates'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_calendar_goals')
        .insert([{
          ...goalData,
          user_id: user.id,
          completed_dates: []
        }])
        .select()
        .single();

      if (error) throw error;
      
      const goalWithParsedDates = {
        ...data,
        completed_dates: Array.isArray(data.completed_dates) ? data.completed_dates as string[] : []
      };
      setGoals(prev => [goalWithParsedDates, ...prev]);
      toast({
        title: "Success",
        description: "Study goal added successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding study goal:', error);
      toast({
        title: "Error",
        description: "Failed to add study goal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<StudyGoal>) => {
    try {
      const { data, error } = await supabase
        .from('study_calendar_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedGoalWithParsedDates = {
        ...data,
        completed_dates: Array.isArray(data.completed_dates) ? data.completed_dates as string[] : []
      };
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoalWithParsedDates : goal));
      toast({
        title: "Success",
        description: "Study goal updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating study goal:', error);
      toast({
        title: "Error",
        description: "Failed to update study goal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('study_calendar_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast({
        title: "Success",
        description: "Study goal deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting study goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete study goal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleGoalCompletion = async (id: string, date: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const isCompleted = goal.completed_dates.includes(date);
    const newCompletedDates = isCompleted 
      ? goal.completed_dates.filter(d => d !== date)
      : [...goal.completed_dates, date];

    await updateGoal(id, { completed_dates: newCompletedDates });
  };

  const clearAllGoals = async () => {
    try {
      const { error } = await supabase
        .from('study_calendar_goals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      
      setGoals([]);
      toast({
        title: "Success",
        description: "All study goals cleared successfully",
      });
    } catch (error) {
      console.error('Error clearing study goals:', error);
      toast({
        title: "Error",
        description: "Failed to clear study goals",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalCompletion,
    clearAllGoals,
    fetchGoals
  };
};