import { useMemo } from 'react';
import { StudyGoal } from '@/hooks/useStudyGoals';
import { Task } from '@/components/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, CheckCircle2, Clock, Target, TrendingUp, Zap, BookOpen, Timer, Award } from 'lucide-react';
import { format, isThisWeek, isThisMonth, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface AnalyticsDashboardProps {
  tasks: Task[];
  studyGoals: StudyGoal[];
}

export const AnalyticsDashboard = ({ tasks, studyGoals }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    // Task Analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = tasks.filter(t => !t.completed).length;
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < now).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Weekly task completion
    const weeklyCompleted = tasks.filter(t => 
      t.completed && t.completedAt && isThisWeek(t.completedAt, { weekStartsOn: 0 })
    ).length;
    
    // Monthly task completion
    const monthlyCompleted = tasks.filter(t => 
      t.completed && t.completedAt && isThisMonth(t.completedAt)
    ).length;
    
    // Study Goals Analytics
    const totalGoals = studyGoals.length;
    const activeGoals = studyGoals.filter(g => g.frequency !== 'once' || 
      (g.frequency === 'once' && !g.completed_dates.length)).length;
    
    // Study streak calculation
    const today = format(now, 'yyyy-MM-dd');
    const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');
    
    let currentStreak = 0;
    let streakDate = now;
    
    while (true) {
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
    
    // Weekly study goal completions
    const weeklyGoalCompletions = studyGoals.reduce((count, goal) => {
      return count + goal.completed_dates.filter(date => {
        const completionDate = new Date(date);
        return completionDate >= weekStart && completionDate <= weekEnd;
      }).length;
    }, 0);
    
    // Priority distribution
    const priorityCounts = {
      high: tasks.filter(t => !t.completed && t.priority === 'high').length,
      medium: tasks.filter(t => !t.completed && t.priority === 'medium').length,
      low: tasks.filter(t => !t.completed && t.priority === 'low').length,
    };
    
    // Subject distribution
    const subjectCounts: Record<string, number> = {};
    tasks.forEach(task => {
      if (!task.completed && task.subject) {
        subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
      }
    });
    
    const topSubject = Object.entries(subjectCounts).sort(([,a], [,b]) => b - a)[0];
    
    // Productivity score (weighted metric)
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.4) + 
      (Math.min(currentStreak * 5, 30)) + 
      (Math.max(0, 40 - (overdueTasks * 10)))
    ));
    
    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        active: activeTasks,
        overdue: overdueTasks,
        completionRate,
        weeklyCompleted,
        monthlyCompleted,
      },
      goals: {
        total: totalGoals,
        active: activeGoals,
        currentStreak,
        weeklyCompletions: weeklyGoalCompletions,
      },
      priorities: priorityCounts,
      subjects: { counts: subjectCounts, top: topSubject },
      productivityScore,
    };
  }, [tasks, studyGoals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
      </div>
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Completion Rate</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{analytics.tasks.completionRate}%</p>
              <Progress value={analytics.tasks.completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {analytics.tasks.completed} of {analytics.tasks.total} tasks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">Study Streak</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{analytics.goals.currentStreak}</p>
              <p className="text-xs text-muted-foreground">days in a row</p>
              {analytics.goals.currentStreak >= 7 && (
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
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium text-warning">Active Tasks</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{analytics.tasks.active}</p>
              <p className="text-xs text-muted-foreground">pending completion</p>
              {analytics.tasks.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {analytics.tasks.overdue} overdue
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-ai-primary/5 to-ai-primary/10 border-ai-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-ai-primary" />
              <span className="text-sm font-medium text-ai-primary">Productivity</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{analytics.productivityScore}</p>
              <Progress value={analytics.productivityScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {analytics.productivityScore >= 80 ? 'Excellent!' : 
                 analytics.productivityScore >= 60 ? 'Good progress' : 
                 'Room for improvement'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tasks Completed</span>
              <span className="font-semibold">{analytics.tasks.weeklyCompleted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Study Sessions</span>
              <span className="font-semibold">{analytics.goals.weeklyCompletions}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  {analytics.tasks.weeklyCompleted + analytics.goals.weeklyCompletions >= 10 
                    ? "Productive week!" 
                    : "Keep going!"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Task Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <span className="text-sm">High Priority</span>
                </div>
                <span className="font-semibold text-error">{analytics.priorities.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-sm">Medium Priority</span>
                </div>
                <span className="font-semibold text-warning">{analytics.priorities.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm">Low Priority</span>
                </div>
                <span className="font-semibold text-success">{analytics.priorities.low}</span>
              </div>
            </div>
            {analytics.priorities.high > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-error">⚠️ Focus on high priority tasks first</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Goals Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Study Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Goals</span>
              <span className="font-semibold">{analytics.goals.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Goals</span>
              <span className="font-semibold">{analytics.goals.active}</span>
            </div>
            {analytics.subjects.top && (
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Top Subject</span>
                  <Badge variant="outline" className="text-xs">
                    {analytics.subjects.top[0]} ({analytics.subjects.top[1]})
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-ai-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="font-medium">Monthly Progress:</span>
                <span>{analytics.tasks.monthlyCompleted} tasks completed this month</span>
              </p>
              {analytics.goals.currentStreak > 0 && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Consistency:</span>
                  <span>You've studied {analytics.goals.currentStreak} days straight! 🎉</span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="font-medium">Focus Areas:</span>
                <span>
                  {analytics.priorities.high > 0 
                    ? `${analytics.priorities.high} high-priority tasks need attention`
                    : "No urgent tasks - great job staying on top of things!"}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Recommendation:</span>
                <span>
                  {analytics.tasks.completionRate < 50 
                    ? "Break large tasks into smaller ones"
                    : analytics.goals.currentStreak === 0
                    ? "Start a study goal to build consistency"
                    : "Keep up the excellent work!"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};