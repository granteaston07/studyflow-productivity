import { Brain, Sparkles, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  // AI-powered task analysis
  const analyzeTaskPriority = (task: Task): AIRecommendation => {
    let score = 0;
    const reasons: string[] = [];
    
    // Due date analysis
    if (task.dueDate) {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue < 0) {
        score += 100; // Overdue gets highest priority
        reasons.push("⚠️ Task is overdue");
      } else if (hoursUntilDue < 24) {
        score += 80;
        reasons.push("🔥 Due within 24 hours");
      } else if (hoursUntilDue < 72) {
        score += 60;
        reasons.push("⏰ Due within 3 days");
      }
    }
    
    // Priority level analysis
    switch (task.priority) {
      case 'high':
        score += 40;
        reasons.push("🎯 High priority task");
        break;
      case 'medium':
        score += 20;
        reasons.push("📊 Medium priority");
        break;
      case 'low':
        score += 10;
        break;
    }
    
    // Subject-based complexity estimation
    const complexSubjects = ['Mathematics', 'Science', 'Computer Science'];
    const mediumSubjects = ['English', 'History'];
    
    let estimatedDuration = "30-45 min";
    if (complexSubjects.includes(task.subject || '')) {
      score += 15;
      estimatedDuration = "60-90 min";
      reasons.push("🧮 Complex subject requiring focus");
    } else if (mediumSubjects.includes(task.subject || '')) {
      score += 10;
      estimatedDuration = "45-60 min";
      reasons.push("📚 Moderate complexity");
    } else {
      estimatedDuration = "20-30 min";
    }
    
    // Status analysis
    if (task.status === 'in-progress') {
      score += 25;
      reasons.push("🚀 Continue momentum on started task");
    }
    
    // Determine urgency level
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score >= 90) urgencyLevel = 'critical';
    else if (score >= 70) urgencyLevel = 'high';
    else if (score >= 40) urgencyLevel = 'medium';
    
    return {
      task,
      score,
      reasons: reasons.slice(0, 3), // Limit to top 3 reasons
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

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-ai-primary" />
            AI Task Prioritization
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="h-12 w-12 text-ai-primary mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            All caught up! Add some tasks to get AI-powered recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-ai-primary" />
          AI Task Prioritization
          <Badge variant="secondary" className="bg-ai-primary/20 text-ai-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Smart recommendations based on deadlines, complexity, and your schedule
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div 
            key={rec.task.id} 
            className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-ai-primary/20 text-ai-primary px-2 py-1 rounded text-xs font-bold">
                  #{index + 1}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getUrgencyColor(rec.urgencyLevel)}`}
                >
                  {getUrgencyIcon(rec.urgencyLevel)}
                  {rec.urgencyLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-ai-primary">
                  Score: {rec.score}
                </div>
                <div className="text-xs text-muted-foreground">
                  Est. {rec.estimatedDuration}
                </div>
              </div>
            </div>
            
            <h4 className="font-medium text-foreground mb-2 leading-tight">
              {rec.task.title}
            </h4>
            
            <div className="space-y-2">
              {rec.reasons.map((reason, idx) => (
                <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                  <div className="w-1 h-1 bg-ai-primary rounded-full"></div>
                  {reason}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                {rec.task.subject && (
                  <Badge variant="outline" className="text-xs">
                    {rec.task.subject}
                  </Badge>
                )}
                {rec.task.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due {new Date(rec.task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Start Now
              </Button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-ai-primary/10 rounded-lg border border-ai-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-ai-primary" />
            <span className="text-sm font-medium text-ai-primary">AI Productivity Tip</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Start with your highest-scored task to maximize productivity. 
            The AI considers deadlines, complexity, and task momentum for optimal scheduling.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}