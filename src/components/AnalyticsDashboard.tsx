import { useMemo } from 'react';
import { StudyGoal } from '@/hooks/useStudyGoals';
import { Task } from '@/components/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle2, Zap, Clock, TrendingUp } from 'lucide-react';
import { useStudyStreak } from '@/hooks/useStudyStreak';

interface AnalyticsDashboardProps {
  tasks: Task[];
  studyGoals: StudyGoal[];
}

export const AnalyticsDashboard = ({ tasks, studyGoals }: AnalyticsDashboardProps) => {
  const { streak } = useStudyStreak();
  const analytics = useMemo(() => {
    const now = new Date();
    
    // Task Analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = tasks.filter(t => !t.completed).length;
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < now).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Get current streak from database
    const currentStreak = streak?.current_streak || 0;
    
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
  }, [tasks, studyGoals, streak]);

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
    </div>
  );
};