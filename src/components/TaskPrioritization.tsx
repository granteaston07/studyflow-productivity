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
    const complexSubjects = ['Math', 'Science'];
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
    <Card className="bg-gradient-to-br from-ai-primary/5 via-primary/5 to-ai-secondary/5 border-ai-primary/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-full p-0 h-auto hover:bg-ai-primary/10 rounded-lg transition-all duration-200 relative"
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
              {recommendations.length} insights
            </Badge>
          </div>
          <ChevronDown className={`h-4 w-4 text-ai-primary transition-transform duration-300 absolute right-2 ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-ai-primary/10 to-ai-secondary/10 border border-ai-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-ai-primary" />
              <span className="text-sm font-medium text-foreground">AI Analysis Complete</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on deadlines, complexity, and your work patterns, here are the optimal tasks to focus on:
            </p>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={rec.task.id} className="group flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-card/80 to-card/60 border border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-200 hover:shadow-md">
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