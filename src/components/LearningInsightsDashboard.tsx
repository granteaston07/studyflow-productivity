import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Clock, Target, TrendingUp, BookOpen, Star } from 'lucide-react';
import { useLearningInsights } from '@/hooks/useLearningInsights';

export function LearningInsightsDashboard() {
  const { insights, behaviorPatterns, loading } = useLearningInsights();

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
          <Brain className="h-5 w-5 text-primary" />
          Your Learning Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered analysis of your study patterns and performance
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject Performance */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Subject Performance
          </h4>
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
                  <Badge 
                    className={`text-xs ${getDifficultyColor(insight.avgDifficulty)}`}
                  >
                    {getDifficultyLabel(insight.avgDifficulty)}
                  </Badge>
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
        </div>

        {/* Overall Patterns */}
        {behaviorPatterns.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Learning Patterns
            </h4>
            <div className="grid gap-4">
              {behaviorPatterns.slice(0, 3).map((pattern) => (
                <div key={pattern.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{pattern.subject}</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      You typically spend <span className="font-medium text-foreground">
                        {formatTime(pattern.avg_time_per_task)}
                      </span> on {pattern.subject} tasks
                    </p>
                    {pattern.avg_difficulty_rating <= 4 && (
                      <p className="text-green-600">
                        ✓ You find {pattern.subject} relatively easy!
                      </p>
                    )}
                    {pattern.avg_difficulty_rating > 7 && (
                      <p className="text-orange-600">
                        ⚡ {pattern.subject} is challenging - consider breaking tasks into smaller parts
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">💡 AI Recommendations</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {insights.some(i => i.avgTimePerTask > 120) && (
              <p>• Consider using the Pomodoro technique for longer tasks</p>
            )}
            {insights.some(i => i.avgDifficulty > 7) && (
              <p>• Break challenging tasks into smaller, manageable steps</p>
            )}
            {insights.length >= 3 && (
              <p>• Your study patterns are becoming more consistent! Keep it up.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}