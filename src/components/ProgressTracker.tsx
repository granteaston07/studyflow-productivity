import { TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ProgressCircle } from "@/components/ProgressCircle";
import { Task } from "./TaskCard";

interface ProgressTrackerProps {
  tasks: Task[];
}

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length;
  
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const stats = [
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success-light'
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning-light'
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-error',
      bgColor: 'bg-error-light'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progress Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress Circle */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="text-center group cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(completionPercentage)}%
                  </span>
                  <span className="text-xs text-muted-foreground">Complete</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-6">
            <div className="flex flex-col items-center space-y-4">
              <ProgressCircle
                percentage={completionPercentage}
                size={180}
                strokeWidth={14}
                label="Overall Progress"
                color="hsl(var(--primary))"
                animationDelay={200}
              />
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-foreground">Task Overview</h4>
                <p className="text-sm text-muted-foreground">
                  Your productivity analytics
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-success">{completedTasks}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-warning">{inProgressTasks}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-error">{overdueTasks}</p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Task Completion</span>
            <span className="text-primary font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-2`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Overview */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">This Week</h4>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tasks completed</span>
            <span className="font-medium text-success">{completedTasks}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-muted-foreground">Productivity score</span>
            <span className="font-medium text-primary">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}