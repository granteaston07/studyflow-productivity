import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LearningInsight {
  subject: string;
  avgTimePerTask: number;
  avgDifficulty: number;
  totalTasks: number;
  estimatedTimeForNewTask?: number;
  difficultyTrend?: 'improving' | 'stable' | 'challenging';
}

interface BehaviorPattern {
  id: string;
  subject: string;
  avg_time_per_task: number;
  avg_difficulty_rating: number;
  preferred_techniques: string[];
  optimal_study_times: number[];
  success_patterns: any;
}

export function useLearningInsights() {
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackBySubject, setFeedbackBySubject] = useState<Record<string, any[]>>({});
  const { user } = useAuth();

  const fetchInsights = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch behavior patterns
      const { data: patterns, error: patternsError } = await supabase
        .from('user_behavior_patterns')
        .select('*')
        .eq('user_id', user.id);

      if (patternsError) throw patternsError;

      setBehaviorPatterns(patterns || []);

      // Fetch task feedback for detailed insights
      const { data: feedback, error: feedbackError } = await supabase
        .from('task_feedback')
        .select('*')
        .eq('user_id', user.id);

      if (feedbackError) throw feedbackError;

      // Process insights
      const subjectInsights = new Map<string, LearningInsight>();
      const grouped: Record<string, any[]> = {};

      feedback?.forEach((item) => {
        const subject = item.subject || 'General';
        const existing = subjectInsights.get(subject);

        // Group raw feedback by subject for detailed deletion
        if (!grouped[subject]) grouped[subject] = [];
        grouped[subject].push(item);

        if (existing) {
          const totalTasks = existing.totalTasks + 1;
          subjectInsights.set(subject, {
            ...existing,
            avgTimePerTask: (existing.avgTimePerTask * existing.totalTasks + item.time_taken_minutes) / totalTasks,
            avgDifficulty: (existing.avgDifficulty * existing.totalTasks + item.difficulty_rating) / totalTasks,
            totalTasks,
          });
        } else {
          subjectInsights.set(subject, {
            subject,
            avgTimePerTask: item.time_taken_minutes,
            avgDifficulty: item.difficulty_rating,
            totalTasks: 1,
          });
        }
      });

      setInsights(Array.from(subjectInsights.values()));
      setFeedbackBySubject(grouped);
    } catch (error) {
      console.error('Error fetching learning insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeEstimateForTask = (subject?: string, keywords?: string[]): number | null => {
    if (!subject) return null;

    const pattern = behaviorPatterns.find(p => p.subject === subject);
    if (pattern && pattern.avg_time_per_task) {
      return Math.round(pattern.avg_time_per_task);
    }

    const insight = insights.find(i => i.subject === subject);
    return insight ? Math.round(insight.avgTimePerTask) : null;
  };

  const getDifficultyEstimate = (subject?: string): number | null => {
    if (!subject) return null;

    const pattern = behaviorPatterns.find(p => p.subject === subject);
    if (pattern && pattern.avg_difficulty_rating) {
      return Math.round(pattern.avg_difficulty_rating);
    }

    const insight = insights.find(i => i.subject === subject);
    return insight ? Math.round(insight.avgDifficulty) : null;
  };

  const recordSuggestionInteraction = async (technique: string, taskId?: string, wasUsed: boolean = true) => {
    if (!user) return;

    try {
      await supabase
        .from('suggestion_interactions')
        .insert({
          user_id: user.id,
          suggestion_technique: technique,
          task_id: taskId,
          was_used: wasUsed,
        });
    } catch (error) {
      console.error('Error recording suggestion interaction:', error);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  return {
    insights,
    behaviorPatterns,
    loading,
    getTimeEstimateForTask,
    getDifficultyEstimate,
    recordSuggestionInteraction,
    refreshInsights: fetchInsights,
    feedbackBySubject,
  };
}