import { TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task } from "./TaskCard";
import { useState, useEffect } from "react";

interface ProgressTrackerProps {
  tasks: Task[];
}

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const [gradientIndex, setGradientIndex] = useState(0);
  
  const gradientVariations = [
    // Heavy purple start
    { stops: [
      { offset: "0%", color: "#8b5cf6" },
      { offset: "40%", color: "#a855f7" },
      { offset: "80%", color: "#6366f1" },
      { offset: "100%", color: "#3b82f6" }
    ]},
    // Purple in middle
    { stops: [
      { offset: "0%", color: "#3b82f6" },
      { offset: "30%", color: "#6366f1" },
      { offset: "70%", color: "#8b5cf6" },
      { offset: "100%", color: "#a855f7" }
    ]},
    // Purple at end
    { stops: [
      { offset: "0%", color: "#3b82f6" },
      { offset: "50%", color: "#6366f1" },
      { offset: "100%", color: "#8b5cf6" }
    ]},
    // Deep purple dominant
    { stops: [
      { offset: "0%", color: "#7c3aed" },
      { offset: "25%", color: "#8b5cf6" },
      { offset: "60%", color: "#a855f7" },
      { offset: "100%", color: "#6366f1" }
    ]},
    // Balanced mix
    { stops: [
      { offset: "0%", color: "#6366f1" },
      { offset: "35%", color: "#8b5cf6" },
      { offset: "65%", color: "#a855f7" },
      { offset: "100%", color: "#3b82f6" }
    ]}
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((prev) => (prev + 1) % gradientVariations.length);
    }, 3 * 60 * 1000); // Change every 3 minutes

    return () => clearInterval(interval);
  }, [gradientVariations.length]);

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
        <div className="text-center">
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
              {/* Dynamic progress circle gradient */}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {gradientVariations[gradientIndex].stops.map((stop, index) => (
                    <stop 
                      key={index} 
                      offset={stop.offset} 
                      stopColor={stop.color}
                      className="transition-all duration-2000 ease-in-out"
                    />
                  ))}
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-sm"
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
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                  <Icon className={`h-6 w-6 ${stat.color} drop-shadow-sm`} />
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