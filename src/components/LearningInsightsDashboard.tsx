import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, Target, BookOpen, Trash2, ChevronDown } from 'lucide-react';
import { useLearningInsights } from '@/hooks/useLearningInsights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
export function LearningInsightsDashboard() {
  const { insights, behaviorPatterns, loading, refreshInsights, feedbackBySubject } = useLearningInsights();
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="w-full space-y-4">
      <Button 
        variant="outline" 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-left p-4 h-auto border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-base">Learning Insights</div>
            <div className="text-sm text-muted-foreground">
              {insights.length > 0 ? `${insights.length} subjects analyzed` : 'Complete tasks to see insights'}
            </div>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", isExpanded && "rotate-180")} />
      </Button>

      {isExpanded && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Subject Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {insights.map((insight) => (
              <Card key={insight.subject} className="border-border/30 bg-card/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-lg">{insight.subject}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-sm">
                            {insight.totalTasks} tasks completed
                          </Badge>
                          <Badge 
                            className={`text-sm ${getDifficultyColor(insight.avgDifficulty)} border-0`}
                          >
                            {getDifficultyLabel(insight.avgDifficulty)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTaskFeedback(insight.subject)}
                      className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive rounded-md"
                      title={`Delete all ${insight.subject} data`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Average Time per Task
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatTime(insight.avgTimePerTask)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Average Difficulty
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {insight.avgDifficulty.toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar showing difficulty trend */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty Distribution</span>
                      <span className="font-medium">{((insight.avgDifficulty / 10) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={(insight.avgDifficulty / 10) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Easy</span>
                      <span>Moderate</span>
                      <span>Challenging</span>
                    </div>
                  </div>

                  {/* Recent feedback entries for precise deletion (now collapsible) */}
                  {feedbackBySubject?.[insight.subject]?.length ? (
                    <div className="border-t border-border/30 pt-4">
                      <Collapsible>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-muted-foreground">Recent Task Feedback</div>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-muted-foreground hover:text-foreground"
                              title="Toggle recent feedback"
                            >
                              Show Details
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-2">
                          <div className="space-y-2">
                            {feedbackBySubject[insight.subject]
                              .slice()
                              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                              .slice(0, 8)
                              .map((fb: any) => (
                                <div key={fb.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-md border border-border/20">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium">Difficulty: {fb.difficulty_rating}/10</div>
                                      <div className="w-px h-4 bg-border"></div>
                                      <div className="text-sm text-muted-foreground">Time: {formatTime(fb.time_taken_minutes)}</div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTaskFeedback(insight.subject, fb.task_id || undefined, fb.id)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    title="Delete this entry"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}