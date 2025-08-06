import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Clock, Target, CheckCircle, AlertTriangle, CheckCircle2, Zap, Timer, Brain } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/components/TaskCard';
import { StudyGoal } from '@/hooks/useStudyGoals';

interface AnalyticsDashboardProps {
  tasks: Task[];
  studyGoals: StudyGoal[];
}

export function AnalyticsDashboard({ tasks, studyGoals }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<any[]>([]);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!user) return;
      
      try {
        const { data: feedback } = await supabase
          .from('task_feedback')
          .select('*')
          .eq('user_id', user.id);
        
        const { data: patterns } = await supabase
          .from('user_behavior_patterns')
          .select('*')
          .eq('user_id', user.id);
        
        setFeedbackData(feedback || []);
        setBehaviorPatterns(patterns || []);
      } catch (error) {
        console.error('Error fetching feedback data:', error);
      }
    };

    fetchFeedbackData();
  }, [user]);

  const analytics = useMemo(() => {
    const now = new Date();
    
    // Task Analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = tasks.filter(t => !t.completed).length;
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < now).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Study streak calculation
    const today = format(now, 'yyyy-MM-dd');
    let currentStreak = 0;
    let streakDate = now;
    
    while (currentStreak < 30) { // Limit to prevent infinite loop
      const dateStr = format(streakDate, 'yyyy-MM-dd');
      const hasGoalCompleted = studyGoals.some(goal => 
        goal.completed_dates.includes(dateStr)
      );
      
      if (hasGoalCompleted) {
        currentStreak++;
        streakDate = subDays(streakDate, 1);
      } else {
        break;
      }
    }
    
    // Productivity score (simplified)
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.6) + 
      (Math.min(currentStreak * 8, 40))
    ));
    
    return {
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      completionRate,
      currentStreak,
      productivityScore,
    };
  }, [tasks, studyGoals]);

  // Time tracking analytics
  const timeAnalytics = useMemo(() => {
    if (feedbackData.length === 0) return null;

    const totalTimeSpent = feedbackData.reduce((sum, item) => sum + item.time_taken_minutes, 0);
    const avgTimePerTask = totalTimeSpent / feedbackData.length;
    const avgDifficulty = feedbackData.reduce((sum, item) => sum + item.difficulty_rating, 0) / feedbackData.length;
    
    // Group by subject
    const subjectStats = feedbackData.reduce((acc, item) => {
      const subject = item.subject || 'General';
      if (!acc[subject]) {
        acc[subject] = { timeSpent: 0, count: 0, totalDifficulty: 0 };
      }
      acc[subject].timeSpent += item.time_taken_minutes;
      acc[subject].count += 1;
      acc[subject].totalDifficulty += item.difficulty_rating;
      return acc;
    }, {});

    const subjectSummary = Object.entries(subjectStats).map(([subject, stats]: [string, any]) => ({
      subject,
      avgTime: stats.timeSpent / stats.count,
      avgDifficulty: stats.totalDifficulty / stats.count,
      totalTasks: stats.count,
      totalTime: stats.timeSpent
    }));

    return {
      totalTimeSpent,
      avgTimePerTask,
      avgDifficulty,
      totalFeedbackTasks: feedbackData.length,
      subjectSummary
    };
  }, [feedbackData]);

  // Learning progress analytics
  const learningAnalytics = useMemo(() => {
    if (feedbackData.length < 3) return null; // Need at least 3 data points

    // Sort by date to see trends
    const sortedFeedback = [...feedbackData].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Calculate difficulty improvement (lower is better)
    const firstHalf = sortedFeedback.slice(0, Math.floor(sortedFeedback.length / 2));
    const secondHalf = sortedFeedback.slice(Math.floor(sortedFeedback.length / 2));
    
    const firstHalfAvgDifficulty = firstHalf.reduce((sum, item) => sum + item.difficulty_rating, 0) / firstHalf.length;
    const secondHalfAvgDifficulty = secondHalf.reduce((sum, item) => sum + item.difficulty_rating, 0) / secondHalf.length;
    
    const difficultyImprovement = firstHalfAvgDifficulty - secondHalfAvgDifficulty;
    
    // Calculate time efficiency (faster completion for same difficulty)
    const firstHalfAvgTime = firstHalf.reduce((sum, item) => sum + item.time_taken_minutes, 0) / firstHalf.length;
    const secondHalfAvgTime = secondHalf.reduce((sum, item) => sum + item.time_taken_minutes, 0) / secondHalf.length;
    
    const timeImprovement = firstHalfAvgTime - secondHalfAvgTime;

    return {
      difficultyImprovement,
      timeImprovement,
      isImproving: difficultyImprovement > 0.5 || timeImprovement > 10,
      totalDataPoints: feedbackData.length
    };
  }, [feedbackData]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Your Analytics</h2>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Completion</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{analytics.completionRate}%</p>
              <Progress value={analytics.completionRate} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {analytics.completedTasks} of {analytics.totalTasks} tasks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Study Streak</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{analytics.currentStreak}</p>
              <p className="text-xs text-muted-foreground">days in a row</p>
              {analytics.currentStreak >= 7 && (
                <Badge variant="outline" className="text-xs border-success text-success">
                  🔥 On Fire!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">Active</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{analytics.activeTasks}</p>
              <p className="text-xs text-muted-foreground">tasks remaining</p>
              {analytics.overdueTasks > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {analytics.overdueTasks} overdue
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-ai-primary/5 to-ai-primary/10 border-ai-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-ai-primary" />
              <span className="text-sm font-medium text-ai-primary">Score</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{analytics.productivityScore}</p>
              <Progress value={analytics.productivityScore} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {analytics.productivityScore >= 80 ? 'Excellent!' : 
                 analytics.productivityScore >= 60 ? 'Good progress' : 
                 'Keep going!'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Tracking Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Time Tracking Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatTime(timeAnalytics.totalTimeSpent)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Study Time</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatTime(timeAnalytics.avgTimePerTask)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Time/Task</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Difficulty</span>
                    <span className="font-medium">{timeAnalytics.avgDifficulty.toFixed(1)}/10</span>
                  </div>
                  <Progress value={(timeAnalytics.avgDifficulty / 10) * 100} className="h-2" />
                </div>

                {timeAnalytics.subjectSummary.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Subject Breakdown</div>
                    {timeAnalytics.subjectSummary.slice(0, 3).map((subject, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span>{subject.subject}</span>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{formatTime(subject.avgTime)}</Badge>
                          <Badge variant="outline">{subject.avgDifficulty.toFixed(1)}/10</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete tasks with feedback to see time insights!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Progress Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learningAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className={`text-center p-3 rounded-lg ${
                    learningAnalytics.isImproving ? 'bg-green-50' : 'bg-yellow-50'
                  }`}>
                    <div className={`text-lg font-bold ${
                      learningAnalytics.isImproving ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {learningAnalytics.isImproving ? '📈 Improving!' : '📊 Steady Progress'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on {learningAnalytics.totalDataPoints} completed tasks
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Difficulty Trend</span>
                    <div className="flex items-center gap-1">
                      {learningAnalytics.difficultyImprovement > 0.5 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Getting Easier</span>
                        </>
                      ) : learningAnalytics.difficultyImprovement < -0.5 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                          <span className="text-xs text-red-600">More Challenging</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Stable</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Efficiency</span>
                    <div className="flex items-center gap-1">
                      {learningAnalytics.timeImprovement > 10 ? (
                        <>
                          <Clock className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Faster</span>
                        </>
                      ) : learningAnalytics.timeImprovement < -10 ? (
                        <>
                          <Clock className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-600">Taking Longer</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Consistent</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  💡 Your AI suggestions are becoming more personalized as you provide more feedback!
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete at least 3 tasks with feedback to see learning trends!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}