import { useState } from "react";
import { Brain, Sparkles, Clock, AlertTriangle, TrendingUp, ChevronDown } from "lucide-react";
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

  return (
    <Card className="bg-card/50 border-ai-accent/20">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-0 h-auto hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-ai-primary" />
            <span className="font-medium">AI Recommendations</span>
            <Badge variant="secondary" className="text-xs bg-ai-primary/20 text-ai-primary">
              {recommendations.length}
            </Badge>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={rec.task.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    rec.urgencyLevel === 'critical' || rec.urgencyLevel === 'high' ? 'bg-error text-error-foreground' :
                    rec.urgencyLevel === 'medium' ? 'bg-warning text-warning-foreground' :
                    'bg-success text-success-foreground'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate text-sm">{rec.task.title}</h4>
                    {rec.task.subject && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {rec.task.subject}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{rec.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={`h-3 w-3 ${
                        rec.urgencyLevel === 'critical' || rec.urgencyLevel === 'high' ? 'text-error' :
                        rec.urgencyLevel === 'medium' ? 'text-warning' : 'text-success'
                      }`} />
                      <span className="capitalize">{rec.urgencyLevel}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{rec.reasons[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}