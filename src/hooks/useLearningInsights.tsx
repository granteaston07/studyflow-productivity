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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Process insights with more sophisticated analysis
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
          const allDifficulties = grouped[subject].map(f => f.difficulty_rating);
          const allTimes = grouped[subject].map(f => f.time_taken_minutes);
          
          // Calculate weighted averages and trends
          const recentWeight = 0.7; // Give more weight to recent tasks
          const olderWeight = 0.3;
          
          const recentTasks = allDifficulties.slice(0, Math.min(5, totalTasks));
          const olderTasks = allDifficulties.slice(5);
          
          const recentAvgDifficulty = recentTasks.reduce((a, b) => a + b, 0) / recentTasks.length;
          const olderAvgDifficulty = olderTasks.length > 0 ? olderTasks.reduce((a, b) => a + b, 0) / olderTasks.length : recentAvgDifficulty;
          
          // Calculate difficulty trend
          let difficultyTrend: 'improving' | 'stable' | 'challenging' = 'stable';
          if (recentTasks.length >= 3 && olderTasks.length >= 2) {
            const improvement = olderAvgDifficulty - recentAvgDifficulty;
            if (improvement > 1.5) difficultyTrend = 'improving';
            else if (improvement < -1.5) difficultyTrend = 'challenging';
          }
          
          // Weighted difficulty calculation
          const weightedDifficulty = totalTasks <= 5 
            ? recentAvgDifficulty
            : (recentAvgDifficulty * recentWeight + olderAvgDifficulty * olderWeight);
          
          // Apply curve adjustment based on sample size
          let adjustedDifficulty = weightedDifficulty;
          if (totalTasks >= 10) {
            // For larger samples, apply statistical normalization
            const variance = allDifficulties.reduce((acc, val) => acc + Math.pow(val - weightedDifficulty, 2), 0) / totalTasks;
            const standardDev = Math.sqrt(variance);
            
            // Adjust based on consistency - more consistent = more reliable rating
            if (standardDev < 1.5) {
              // High consistency - trust the rating more
              adjustedDifficulty = weightedDifficulty;
            } else if (standardDev > 3) {
              // High variance - moderate the extremes
              adjustedDifficulty = weightedDifficulty * 0.85 + 5 * 0.15;
            }
          }
          
          // Apply subject-relative adjustment
          const globalAvgDifficulty = feedback.reduce((sum, f) => sum + f.difficulty_rating, 0) / feedback.length;
          const subjectComplexityFactor = Math.max(0.7, Math.min(1.3, adjustedDifficulty / globalAvgDifficulty));
          
          subjectInsights.set(subject, {
            ...existing,
            avgTimePerTask: allTimes.reduce((a, b) => a + b, 0) / allTimes.length,
            avgDifficulty: Math.max(1, Math.min(10, adjustedDifficulty * subjectComplexityFactor)),
            totalTasks,
            difficultyTrend,
            estimatedTimeForNewTask: Math.round(allTimes.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, allTimes.length))
          });
        } else {
          // Initial difficulty with confidence adjustment
          let initialDifficulty = item.difficulty_rating;
          
          // For single data points, add slight uncertainty
          if (item.difficulty_rating === 5) {
            initialDifficulty = 5.2; // Slight bias away from exact middle
          }
          
          subjectInsights.set(subject, {
            subject,
            avgTimePerTask: item.time_taken_minutes,
            avgDifficulty: initialDifficulty,
            totalTasks: 1,
            estimatedTimeForNewTask: item.time_taken_minutes
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