import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, Target, BookOpen, Trash2, ChevronDown, Repeat, Brain } from 'lucide-react';
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


  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2.5) return 'text-emerald-600 bg-emerald-100';
    if (difficulty <= 4) return 'text-green-600 bg-green-100';
    if (difficulty <= 5.5) return 'text-blue-600 bg-blue-100';
    if (difficulty <= 7) return 'text-yellow-600 bg-yellow-100';
    if (difficulty <= 8.5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2.5) return 'Very Easy';
    if (difficulty <= 4) return 'Easy';
    if (difficulty <= 5.5) return 'Moderate';
    if (difficulty <= 7) return 'Challenging';
    if (difficulty <= 8.5) return 'Hard';
    return 'Very Hard';
  };

  const getAdvancedInsights = (insight: any) => {
    const insights = [];
    
    // Time-based insights
    if (insight.avgTimePerTask > 90) {
      insights.push({
        type: 'time',
        icon: '⏰',
        title: 'Marathon Sessions',
        description: `Your ${insight.subject} tasks average ${formatTime(insight.avgTimePerTask)}. Consider the Pomodoro technique to maintain focus.`,
        priority: 'high'
      });
    } else if (insight.avgTimePerTask < 10) {
      insights.push({
        type: 'time',
        icon: '⚡',
        title: 'Speed Demon',
        description: `Lightning fast at ${formatTime(insight.avgTimePerTask)} per task! Perfect for quick review sessions.`,
        priority: 'medium'
      });
    } else if (insight.avgTimePerTask > 45 && insight.avgTimePerTask <= 90) {
      insights.push({
        type: 'time',
        icon: '🎯',
        title: 'Focused Sessions',
        description: `Great balance with ${formatTime(insight.avgTimePerTask)} sessions. This is your sweet spot for deep work.`,
        priority: 'low'
      });
    }

    // Difficulty-based insights with more granular analysis
    if (insight.avgDifficulty >= 8.5) {
      insights.push({
        type: 'difficulty',
        icon: '🔥',
        title: 'Master Challenge',
        description: `${insight.subject} pushes your limits! Break complex topics into smaller chunks and celebrate small wins.`,
        priority: 'high'
      });
    } else if (insight.avgDifficulty >= 7) {
      insights.push({
        type: 'difficulty',
        icon: '💪',
        title: 'Growth Zone',
        description: `${insight.subject} is challenging but manageable. You're building real expertise here!`,
        priority: 'medium'
      });
    } else if (insight.avgDifficulty <= 2.5) {
      insights.push({
        type: 'difficulty',
        icon: '🌟',
        title: 'Natural Talent',
        description: `${insight.subject} feels effortless to you! Use this confidence to tackle harder subjects.`,
        priority: 'medium'
      });
    } else if (insight.avgDifficulty >= 5.5 && insight.avgDifficulty < 7) {
      insights.push({
        type: 'difficulty',
        icon: '⚖️',
        title: 'Balanced Challenge',
        description: `Perfect difficulty level for sustained learning. You're in the optimal learning zone!`,
        priority: 'low'
      });
    }

    // Trend-based insights
    if (insight.difficultyTrend === 'improving') {
      insights.push({
        type: 'trend',
        icon: '📈',
        title: 'Getting Easier',
        description: `You're mastering ${insight.subject}! Tasks that once felt hard now seem manageable.`,
        priority: 'high'
      });
    } else if (insight.difficultyTrend === 'challenging') {
      insights.push({
        type: 'trend',
        icon: '📊',
        title: 'Increasing Complexity',
        description: `Recent ${insight.subject} tasks are getting harder. You're tackling more advanced concepts!`,
        priority: 'medium'
      });
    }

    // Volume-based insights
    if (insight.totalTasks >= 20) {
      insights.push({
        type: 'volume',
        icon: '🏆',
        title: 'Dedication Master',
        description: `${insight.totalTasks} tasks completed! Your consistency in ${insight.subject} is paying off.`,
        priority: 'high'
      });
    } else if (insight.totalTasks >= 10) {
      insights.push({
        type: 'volume',
        icon: '🔄',
        title: 'Building Momentum',
        description: `Strong habit forming with ${insight.totalTasks} tasks. Keep this rhythm going!`,
        priority: 'medium'
      });
    } else if (insight.totalTasks >= 5) {
      insights.push({
        type: 'volume',
        icon: '🌱',
        title: 'Good Start',
        description: `${insight.totalTasks} tasks show you're building familiarity with ${insight.subject}.`,
        priority: 'low'
      });
    }

    // Efficiency insights
    const efficiency = insight.totalTasks / Math.max(1, insight.avgTimePerTask / 60);
    if (efficiency > 2) {
      insights.push({
        type: 'efficiency',
        icon: '🚀',
        title: 'High Efficiency',
        description: `You complete ${insight.subject} tasks with impressive speed and consistency!`,
        priority: 'medium'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 3); // Show top 3 insights
  };

  return (
    <Card className={cn(
      "border-2 border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden transition-all duration-300 animate-fade-in",
      isExpanded && "shadow-xl shadow-primary/10"
    )}>
      <Button 
        variant="ghost" 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-left p-6 h-auto hover:bg-transparent group"
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

      {isExpanded && insights.length > 0 && (
        <div className="animate-accordion-down border-t border-primary/10">
          <CardContent className="space-y-4 p-6">
            {insights.map((insight, index) => (
              <Card 
                key={insight.subject} 
                className="border border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 hover:shadow-md hover:shadow-primary/10 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-4">
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
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-center gap-1 text-xs text-primary/80 mb-1">
                        <Clock className="h-3 w-3" />
                        Avg Time
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {formatTime(insight.avgTimePerTask)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-ai-primary/10 to-ai-primary/5 rounded-lg border border-ai-primary/20">
                      <div className="flex items-center justify-center gap-1 text-xs text-ai-primary/80 mb-1">
                        <Target className="h-3 w-3" />
                        Difficulty
                      </div>
                      <div className="text-sm font-bold text-ai-primary">
                        {insight.avgDifficulty.toFixed(1)}/10
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/20">
                      <div className="text-xs text-muted-foreground mb-1">
                        Progress
                      </div>
                      <div className="text-sm font-bold">
                        {((insight.avgDifficulty / 10) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Advanced AI Insights Section */}
                  <div className="border-t border-primary/10 pt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-ai-primary/15 to-ai-secondary/15">
                        <Brain className="h-3 w-3 text-ai-primary" />
                      </div>
                      <h4 className="text-sm font-medium ai-gradient-text">AI Analysis</h4>
                      {insight.difficultyTrend && (
                        <Badge variant="outline" className="text-xs ml-auto">
                          {insight.difficultyTrend === 'improving' ? '📈 Improving' : 
                           insight.difficultyTrend === 'challenging' ? '📊 Getting Harder' : 
                           '📊 Stable'}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {getAdvancedInsights(insight).map((aiInsight, idx) => (
                        <div 
                          key={idx}
                          className={`p-2.5 rounded-md border transition-all duration-200 hover:shadow-sm ${
                            aiInsight.priority === 'high' 
                              ? 'bg-gradient-to-r from-ai-primary/15 to-ai-secondary/15 border-ai-primary/30' :
                            aiInsight.priority === 'medium'
                              ? 'bg-gradient-to-r from-ai-primary/10 to-ai-secondary/10 border-ai-primary/20' :
                              'bg-gradient-to-r from-ai-primary/5 to-ai-secondary/5 border-ai-primary/10'
                          }`}
                        >
                          <span className="text-ai-primary font-medium">
                            {aiInsight.icon} {aiInsight.title}:
                          </span>{' '}
                          <span className="text-foreground/90">{aiInsight.description}</span>
                        </div>
                      ))}
                      
                      {/* Estimated time for next task */}
                      {insight.estimatedTimeForNewTask && (
                        <div className="p-2 bg-gradient-to-r from-muted/10 to-accent/5 rounded-md border border-border/20">
                          <span className="text-muted-foreground font-medium">⏱️ Next Task Estimate:</span> {formatTime(insight.estimatedTimeForNewTask)} based on recent patterns.
                        </div>
                      )}
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
        </div>
      )}

      {isExpanded && insights.length === 0 && (
        <div className="animate-accordion-down border-t border-primary/10">
          <CardContent className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Complete some tasks to see your learning patterns!</p>
            <p className="text-sm mt-2">The AI will analyze your study habits and provide personalized insights.</p>
          </CardContent>
        </div>
      )}
    </Card>
  );
}