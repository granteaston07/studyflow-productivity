import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, Target, BookOpen, Trash2, ChevronDown, CalendarDays, Repeat } from 'lucide-react';
import { useLearningInsights } from '@/hooks/useLearningInsights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { StudyCalendar } from '@/components/StudyCalendar';
export function LearningInsightsDashboard() {
  const { insights, behaviorPatterns, loading, refreshInsights, feedbackBySubject } = useLearningInsights();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

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
      {/* Study Calendar Section */}
      <Button 
        variant="outline" 
        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
        className="w-full justify-between text-left p-6 h-auto border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-r from-primary/5 via-ai-primary/5 to-ai-secondary/5 hover:from-primary/10 hover:via-ai-primary/10 hover:to-ai-secondary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group animate-fade-in"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-ai-primary/20 group-hover:from-primary/30 group-hover:to-ai-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
            <CalendarDays className="h-6 w-6 text-primary group-hover:text-ai-primary transition-colors duration-300" />
          </div>
          <div>
            <div className="font-semibold text-lg ai-gradient-text">Study Calendar & Goals</div>
            <div className="text-sm text-muted-foreground">
              Plan and track your study schedule
            </div>
          </div>
        </div>
        <ChevronDown className={cn(
          "h-6 w-6 transition-all duration-300 text-primary group-hover:text-ai-primary", 
          isCalendarExpanded && "rotate-180 scale-110"
        )} />
      </Button>

      {isCalendarExpanded && (
        <div className="animate-slide-up">
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
            <CardContent className="p-6">
              <StudyCalendar />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Learning Insights Section */}
      <Button 
        variant="outline" 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-left p-6 h-auto border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-r from-primary/5 via-ai-primary/5 to-ai-secondary/5 hover:from-primary/10 hover:via-ai-primary/10 hover:to-ai-secondary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group animate-fade-in"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-ai-primary/20 group-hover:from-primary/30 group-hover:to-ai-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
            <Lightbulb className="h-6 w-6 text-primary group-hover:text-ai-primary transition-colors duration-300" />
          </div>
          <div>
            <div className="font-semibold text-lg ai-gradient-text">Learning Insights</div>
            <div className="text-sm text-muted-foreground">
              {insights.length > 0 ? `${insights.length} subjects analyzed • AI-powered analytics` : 'Complete tasks to see AI insights'}
            </div>
          </div>
        </div>
        <ChevronDown className={cn(
          "h-6 w-6 transition-all duration-300 text-primary group-hover:text-ai-primary", 
          isExpanded && "rotate-180 scale-110"
        )} />
      </Button>

      {isExpanded && (
        <div className="animate-slide-up">
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-ai-primary/10 to-ai-secondary/10 border-b border-primary/20">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="p-2 rounded-md bg-gradient-to-br from-primary/20 to-ai-primary/20">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <span className="ai-gradient-text">Subject Performance Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {insights.map((insight, index) => (
                <Card 
                  key={insight.subject} 
                  className="border border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 hover:shadow-md hover:shadow-primary/10 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-gradient-to-br from-primary/15 to-ai-primary/15">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-semibold text-base">{insight.subject}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              {insight.totalTasks} tasks
                            </Badge>
                            <Badge 
                              className={`text-xs ${getDifficultyColor(insight.avgDifficulty)} border-0`}
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
                        className="h-8 w-8 p-0 hover:bg-error/10 hover:text-error rounded-md transition-all duration-200 hover:scale-110"
                        title={`Delete all ${insight.subject} data`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                  </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="stats-card-primary">
                        <div className="flex items-center gap-2 text-xs text-primary/80 mb-1">
                          <Clock className="h-3 w-3" />
                          Average Time
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {formatTime(insight.avgTimePerTask)}
                        </div>
                      </div>
                      <div className="stats-card from-ai-primary/20 to-ai-primary/10 text-ai-primary border border-ai-primary/20">
                        <div className="flex items-center gap-2 text-xs text-ai-primary/80 mb-1">
                          <Target className="h-3 w-3" />
                          Difficulty
                        </div>
                        <div className="text-lg font-bold text-ai-primary">
                          {insight.avgDifficulty.toFixed(1)}/10
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar showing difficulty trend */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Difficulty Level</span>
                        <span className="font-medium text-primary">{((insight.avgDifficulty / 10) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={(insight.avgDifficulty / 10) * 100} 
                        className="h-1.5 bg-muted/50"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Easy</span>
                        <span>Moderate</span>
                        <span>Hard</span>
                      </div>
                    </div>

                    {/* Recent feedback entries for precise deletion (now collapsible) */}
                    {feedbackBySubject?.[insight.subject]?.length ? (
                      <div className="border-t border-primary/10 pt-3">
                        <Collapsible>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium text-muted-foreground">Recent Feedback</div>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                                title="Toggle recent feedback"
                              >
                                Details
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent className="space-y-1">
                            <div className="space-y-1">
                              {feedbackBySubject[insight.subject]
                                .slice()
                                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .slice(0, 6)
                                .map((fb: any) => (
                                  <div key={fb.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-accent/20 to-primary/5 rounded-md border border-border/10 hover:border-primary/20 transition-all duration-200">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="text-xs font-medium">Difficulty: {fb.difficulty_rating}/10</div>
                                        <div className="w-px h-3 bg-border/50"></div>
                                        <div className="text-xs text-muted-foreground">Time: {formatTime(fb.time_taken_minutes)}</div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteTaskFeedback(insight.subject, fb.task_id || undefined, fb.id)}
                                      className="h-6 w-6 p-0 hover:bg-error/10 hover:text-error transition-all duration-200 hover:scale-110"
                                      title="Delete this entry"
                                    >
                                      <Trash2 className="h-2 w-2" />
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
        </div>
      )}
    </div>
  );
}