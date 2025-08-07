import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Target, BookOpen, Trash2 } from 'lucide-react';
import { useLearningInsights } from '@/hooks/useLearningInsights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function LearningInsightsDashboard() {
  const { insights, behaviorPatterns, loading, refreshInsights } = useLearningInsights();

  const handleDeleteSubjectData = async (subject: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete from task_feedback
      await supabase
        .from('task_feedback')
        .delete()
        .eq('user_id', user.id)
        .eq('subject', subject);

      // Delete from user_behavior_patterns
      await supabase
        .from('user_behavior_patterns')
        .delete()
        .eq('user_id', user.id)
        .eq('subject', subject);

      // Refresh insights after deletion
      await refreshInsights();
      
      toast({
        title: "Subject data deleted",
        description: `All learning data for ${subject} has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting subject data:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Complete some tasks to see your learning patterns!</p>
            <p className="text-sm mt-2">The AI will analyze your study habits and provide personalized insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Moderate';
    return 'Challenging';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Subject Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {insights.map((insight) => (
            <div key={insight.subject} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{insight.subject}</span>
                  <Badge variant="secondary" className="text-xs">
                    {insight.totalTasks} tasks
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`text-xs ${getDifficultyColor(insight.avgDifficulty)}`}
                  >
                    {getDifficultyLabel(insight.avgDifficulty)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubjectData(insight.subject)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Avg time:</span>
                  <span className="font-medium">{formatTime(insight.avgTimePerTask)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium">{insight.avgDifficulty.toFixed(1)}/10</span>
                </div>
              </div>
              
              {/* Progress bar showing difficulty trend */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Difficulty Level</span>
                  <span>{insight.avgDifficulty.toFixed(1)}/10</span>
                </div>
                <Progress 
                  value={(insight.avgDifficulty / 10) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}