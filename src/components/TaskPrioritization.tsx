import { useState } from "react";
import { Brain, Sparkles, Clock, AlertTriangle, TrendingUp, ChevronDown, Settings } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "./TaskCard";

interface TaskPrioritizationProps {
  tasks: Task[];
}

interface AIRecommendation {
  task: Task;
  score: number;
  reasons: string[];
  estimatedDuration: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function TaskPrioritization({ tasks }: TaskPrioritizationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Enhanced AI-powered task analysis with sophisticated algorithms
  const analyzeTaskPriority = (task: Task): AIRecommendation => {
    let score = 0;
    const reasons: string[] = [];
    const now = new Date();
    
    // Advanced due date analysis with exponential urgency curve
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const daysUntilDue = hoursUntilDue / 24;
      
      if (hoursUntilDue < 0) {
        const hoursOverdue = Math.abs(hoursUntilDue);
        score += 100 + Math.min(hoursOverdue * 2, 50); // Escalating penalty for overdue
        reasons.push(`⚠️ Overdue by ${hoursOverdue < 24 ? Math.round(hoursOverdue) + 'h' : Math.round(hoursOverdue / 24) + 'd'}`);
      } else if (hoursUntilDue < 6) {
        score += 95;
        reasons.push("🚨 Due in next 6 hours");
      } else if (hoursUntilDue < 24) {
        score += 85;
        reasons.push("🔥 Due today");
      } else if (daysUntilDue < 2) {
        score += 70;
        reasons.push("⏰ Due tomorrow");
      } else if (daysUntilDue < 7) {
        score += Math.max(50 - (daysUntilDue - 2) * 8, 20); // Gradual decrease
        reasons.push(`📅 Due in ${Math.ceil(daysUntilDue)} days`);
      }
    }
    
    // Enhanced priority analysis with workload consideration
    const allIncompleteTasks = incompleteTasks.length;
    const priorityMultiplier = allIncompleteTasks > 10 ? 1.2 : allIncompleteTasks > 5 ? 1.1 : 1.0;
    
    switch (task.priority) {
      case 'high':
        score += 45 * priorityMultiplier;
        reasons.push("🎯 High priority task");
        break;
      case 'medium':
        score += 25 * priorityMultiplier;
        reasons.push("📊 Medium priority");
        break;
      case 'low':
        score += 10 * priorityMultiplier;
        break;
    }
    
    // Intelligent subject complexity and optimal timing analysis
    const getSubjectComplexity = (subject: string) => {
      const complexityMap: Record<string, { score: number; duration: string; timePreference: 'morning' | 'afternoon' | 'evening' | 'any' }> = {
        'Math': { score: 25, duration: "75-120 min", timePreference: 'morning' },
        'Physics': { score: 25, duration: "75-120 min", timePreference: 'morning' },
        'Chemistry': { score: 23, duration: "70-100 min", timePreference: 'morning' },
        'Science': { score: 20, duration: "60-90 min", timePreference: 'morning' },
        'Computer Science': { score: 22, duration: "60-120 min", timePreference: 'any' },
        'Programming': { score: 22, duration: "60-120 min", timePreference: 'any' },
        'Engineering': { score: 24, duration: "75-120 min", timePreference: 'morning' },
        'Philosophy': { score: 18, duration: "45-75 min", timePreference: 'afternoon' },
        'Literature': { score: 15, duration: "45-75 min", timePreference: 'afternoon' },
        'English': { score: 12, duration: "30-60 min", timePreference: 'afternoon' },
        'History': { score: 12, duration: "30-60 min", timePreference: 'afternoon' },
        'Art': { score: 8, duration: "30-90 min", timePreference: 'afternoon' },
        'Music': { score: 8, duration: "30-90 min", timePreference: 'evening' },
        'Language': { score: 10, duration: "30-45 min", timePreference: 'morning' },
        'Biology': { score: 16, duration: "45-75 min", timePreference: 'morning' },
        'Economics': { score: 14, duration: "45-75 min", timePreference: 'afternoon' },
        'Psychology': { score: 13, duration: "40-70 min", timePreference: 'afternoon' }
      };
      
      return complexityMap[subject] || { score: 10, duration: "30-45 min", timePreference: 'any' as const };
    };
    
    const subjectInfo = getSubjectComplexity(task.subject || '');
    score += subjectInfo.score;
    let estimatedDuration = subjectInfo.duration;
    
    // Optimal timing bonus (simple heuristic based on current time)
    const currentHour = now.getHours();
    if (subjectInfo.timePreference === 'morning' && currentHour >= 6 && currentHour < 12) {
      score += 8;
      reasons.push("🌅 Optimal morning timing for " + (task.subject || 'this subject'));
    } else if (subjectInfo.timePreference === 'afternoon' && currentHour >= 12 && currentHour < 18) {
      score += 8;
      reasons.push("☀️ Peak afternoon focus time");
    } else if (subjectInfo.timePreference === 'evening' && currentHour >= 18 && currentHour < 22) {
      score += 8;
      reasons.push("🌙 Creative evening hours");
    }
    
    // Task momentum and context switching analysis
    if (task.status === 'in-progress') {
      score += 30;
      reasons.push("🚀 Continue momentum - avoid context switching");
    }
    
    // Workload distribution intelligence
    const tasksWithSameSubject = incompleteTasks.filter(t => t.subject === task.subject).length;
    if (tasksWithSameSubject > 1 && task.subject) {
      score += 5;
      reasons.push(`📚 Batch with ${tasksWithSameSubject - 1} other ${task.subject} tasks`);
    }
    
    // Task age consideration (older tasks get slight priority boost)
    if (task.createdAt) {
      const taskAge = (now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (taskAge > 7) {
        score += Math.min(taskAge * 2, 15);
        reasons.push("⏳ Task has been pending for a while");
      }
    }
    
    // Smart deadline conflict detection
    const conflictingTasks = incompleteTasks.filter(t => {
      if (!t.dueDate || !task.dueDate) return false;
      const taskDue = new Date(task.dueDate);
      const otherDue = new Date(t.dueDate);
      const timeDiff = Math.abs(taskDue.getTime() - otherDue.getTime()) / (1000 * 60 * 60);
      return timeDiff < 24 && t.id !== task.id;
    });
    
    if (conflictingTasks.length > 0) {
      score += 12;
      reasons.push(`⚡ ${conflictingTasks.length} other task(s) due same day`);
    }
    
    // Energy requirement matching (heuristic based on task complexity and current time)
    const isHighEnergyTime = (currentHour >= 9 && currentHour < 12) || (currentHour >= 14 && currentHour < 17);
    const taskRequiresHighEnergy = subjectInfo.score > 18;
    
    if (taskRequiresHighEnergy && isHighEnergyTime) {
      score += 10;
      reasons.push("⚡ High-energy task during peak focus hours");
    } else if (taskRequiresHighEnergy && !isHighEnergyTime) {
      score -= 5; // Slight penalty for complex tasks during low-energy times
    }
    
    // Determine urgency level with more nuanced thresholds
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score >= 100) urgencyLevel = 'critical';
    else if (score >= 75) urgencyLevel = 'high';
    else if (score >= 45) urgencyLevel = 'medium';
    
    return {
      task,
      score: Math.round(score),
      reasons: reasons.slice(0, 3), // Top 3 most important reasons
      estimatedDuration,
      urgencyLevel
    };
  };

  // Get AI recommendations for incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  const recommendations = incompleteTasks
    .map(analyzeTaskPriority)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 recommendations

  const getUrgencyColor = (level: AIRecommendation['urgencyLevel']) => {
    switch (level) {
      case 'critical':
        return 'text-error bg-error-light border-error/50';
      case 'high':
        return 'text-warning bg-warning-light border-warning/50';
      case 'medium':
        return 'text-primary bg-primary-light border-primary/50';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getUrgencyIcon = (level: AIRecommendation['urgencyLevel']) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <Clock className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Blur overlay when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-4 text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Settings className="h-6 w-6 text-primary" />
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2"><span className="ai-gradient-text">AI Task Intelligence</span></h3>
            <p className="text-sm text-muted-foreground mb-4">
              This feature is still in development. We're working hard to bring you advanced AI-powered task prioritization and insights.
            </p>
            <Button 
              onClick={() => setIsExpanded(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      <Card className="bg-gradient-to-br from-ai-primary/5 via-primary/5 to-ai-secondary/5 border-ai-primary/30 backdrop-blur-sm">
        <CardHeader className="p-4 flex items-center justify-center">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-full p-0 h-auto hover:bg-ai-primary/10 rounded-lg transition-all duration-200 relative min-h-[60px]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-5 w-5 text-ai-primary" />
                <Sparkles className="h-3 w-3 text-ai-secondary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-foreground">AI Task Intelligence</span>
                <span className="text-xs text-muted-foreground">Smart prioritization powered by AI</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-ai-primary/20 to-ai-secondary/20 text-ai-primary border-ai-primary/30">
                {recommendations.length} {recommendations.length === 1 ? 'insight' : 'insights'}
              </Badge>
            </div>
            <ChevronDown className={`h-4 w-4 text-ai-primary transition-transform duration-300 absolute right-2 ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </CardHeader>
      </Card>
    </>
  );
}