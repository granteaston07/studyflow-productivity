import { Flame, Trophy, Calendar, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStreaks } from '@/hooks/useStreaks';

export function StudyStreaks() {
  const { streaks, loading, getCurrentStreak, getLongestStreak } = useStreaks();

  const getStreakData = () => {
    return [
      {
        type: 'daily_study' as const,
        label: 'Study Days',
        description: 'Consecutive days with study activity',
        icon: Calendar,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
      },
      {
        type: 'task_completion' as const,
        label: 'Task Completion',
        description: 'Days with completed tasks',
        icon: Zap,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
      },
      {
        type: 'focus_sessions' as const,
        label: 'Focus Sessions',
        description: 'Days with completed focus sessions',
        icon: Trophy,
        color: 'text-success',
        bgColor: 'bg-success/10',
      },
    ];
  };

  const getStreakLevel = (streakCount: number) => {
    if (streakCount >= 30) return { label: 'Legendary', color: 'text-purple-500' };
    if (streakCount >= 21) return { label: 'Master', color: 'text-orange-500' };
    if (streakCount >= 14) return { label: 'Expert', color: 'text-blue-500' };
    if (streakCount >= 7) return { label: 'Advanced', color: 'text-green-500' };
    if (streakCount >= 3) return { label: 'Beginner', color: 'text-yellow-500' };
    return { label: 'Starter', color: 'text-gray-500' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Study Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const streakData = getStreakData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Study Streaks
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          {streakData.map((streak) => {
            const currentStreak = getCurrentStreak(streak.type);
            const longestStreak = getLongestStreak(streak.type);
            const streakLevel = getStreakLevel(currentStreak);
            const IconComponent = streak.icon;

            return (
              <div key={streak.type} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${streak.bgColor}`}>
                      <IconComponent className={`h-4 w-4 ${streak.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{streak.label}</h4>
                      <p className="text-xs text-muted-foreground">{streak.description}</p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className={`${streakLevel.color} border-current`}>
                    {streakLevel.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-2xl font-bold">{currentStreak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-2xl font-bold">{longestStreak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                </div>

                {currentStreak > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-muted-foreground">Keep it up!</span>
                      {currentStreak >= 3 && (
                        <span className="text-primary font-medium">
                          🔥 {currentStreak} days strong!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {streaks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="mb-1">No streaks yet</p>
            <p className="text-sm">Start studying to build your first streak!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}