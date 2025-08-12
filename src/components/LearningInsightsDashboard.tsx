import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, Target, BookOpen, Trash2, ChevronDown } from 'lucide-react';
import { useLearningInsights } from '@/hooks/useLearningInsights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
export function LearningInsightsDashboard() {
  const { insights, behaviorPatterns, loading, refreshInsights, feedbackBySubject } = useLearningInsights();

  const handleDeleteTaskFeedback = async (subject: string, taskId?: string, feedbackId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('task_feedback')
        .delete()
        .eq('user_id', user.id);

      if (feedbackId) {
        query = query.eq('id', feedbackId);
      } else if (taskId) {
        query = query.eq('task_id', taskId);
      } else {
        query = query.eq('subject', subject);
      }

      const { error } = await query;
      if (error) throw error;

      // Update behavior patterns after deleting feedback
      await supabase.rpc('update_user_behavior_patterns', { p_user_id: user.id });

      // Refresh insights after deletion
      await refreshInsights();
      
      toast({
        title: "Data deleted",
        description: feedbackId
          ? "This feedback entry was removed."
          : taskId
            ? "All feedback for this task was removed."
            : `All feedback for ${subject} has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
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
            <Lightbulb className="h-5 w-5 text-primary" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                    className={`text-xs pointer-events-none ${getDifficultyColor(insight.avgDifficulty)}`}
                  >
                    {getDifficultyLabel(insight.avgDifficulty)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTaskFeedback(insight.subject)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    title={`Delete all ${insight.subject} data`}
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

              {/* Recent feedback entries for precise deletion (now collapsible) */}
              {feedbackBySubject?.[insight.subject]?.length ? (
                <div className="mt-3">
                  <Collapsible>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">Recent feedback</div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          title="Toggle recent feedback"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-2 space-y-2">
                      <ul className="space-y-1">
                        {feedbackBySubject[insight.subject]
                          .slice()
                          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .slice(0, 5)
                          .map((fb: any) => (
                            <li key={fb.id} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2">
                                <span>Difficulty {fb.difficulty_rating}/10</span>
                                <span className="text-muted-foreground">• {formatTime(fb.time_taken_minutes)}</span>
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTaskFeedback(insight.subject, fb.task_id || undefined, fb.id)}
                                className="h-7 px-2 hover:bg-destructive/10 hover:text-destructive"
                                title="Delete this entry"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}