import { useState, useEffect } from "react";
import { Brain, Sparkles, Clock, AlertTriangle, TrendingUp, ChevronDown, Settings } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "./TaskCard";
import { useLearningInsights } from "@/hooks/useLearningInsights";

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
  const { getTimeEstimateForTask, getDifficultyEstimate } = useLearningInsights();
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);
  
  // Enhanced AI-powered task analysis with sophisticated algorithms
  const analyzeTaskPriority = (task: Task): AIRecommendation => {
    let score = 0;
    const reasons: string[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Advanced due date analysis with exponential urgency curve and varied messaging
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const daysUntilDue = hoursUntilDue / 24;
      
      const overdueMessages = [
        "🚨 Critical overdue task needs immediate attention",
        "⚠️ Deadline passed - priority escalation required",
        "🔴 Task requires urgent completion",
        "⏰ Time-sensitive task overdue"
      ];
      
      const todayMessages = [
        "🔥 Due today - schedule immediately",
        "⭐ Today's deadline approaching fast",
        "🎯 Critical task due before midnight",
        "⚡ Deadline today - high focus needed"
      ];
      
      const tomorrowMessages = [
        "⏰ Due tomorrow - plan completion today",
        "📍 Next-day deadline - start preparation",
        "🌅 Tomorrow's task - begin early",
        "⏳ 24-hour deadline window"
      ];
      
      if (hoursUntilDue < 0) {
        const hoursOverdue = Math.abs(hoursUntilDue);
        score += 100 + Math.min(hoursOverdue * 2, 50);
        const messageIndex = Math.floor(Math.random() * overdueMessages.length);
        reasons.push(overdueMessages[messageIndex]);
      } else if (hoursUntilDue < 6) {
        score += 95;
        reasons.push("🚨 Critical: Less than 6 hours remaining");
      } else if (hoursUntilDue < 24) {
        score += 85;
        const messageIndex = Math.floor(Math.random() * todayMessages.length);
        reasons.push(todayMessages[messageIndex]);
      } else if (daysUntilDue < 2) {
        score += 70;
        const messageIndex = Math.floor(Math.random() * tomorrowMessages.length);
        reasons.push(tomorrowMessages[messageIndex]);
      } else if (daysUntilDue < 7) {
        score += Math.max(50 - (daysUntilDue - 2) * 8, 20);
        const weekdayMessages = [
          `📅 Due in ${Math.ceil(daysUntilDue)} days - good planning window`,
          `🗓️ ${Math.ceil(daysUntilDue)}-day deadline - moderate urgency`,
          `📋 Week-ahead task - plan strategically`,
          `⏳ ${Math.ceil(daysUntilDue)} days to completion - track progress`
        ];
        const messageIndex = Math.floor(Math.random() * weekdayMessages.length);
        reasons.push(weekdayMessages[messageIndex]);
      }
    }
    
    // Enhanced priority analysis with varied messaging
    const allIncompleteTasks = incompleteTasks.length;
    const priorityMultiplier = allIncompleteTasks > 10 ? 1.2 : allIncompleteTasks > 5 ? 1.1 : 1.0;
    
    const priorityMessages = {
      high: [
        "🎯 High-impact task requiring focused attention",
        "⭐ Top priority - allocate prime time",
        "🚀 Critical importance - complete first",
        "💎 High-value task - maximize effort"
      ],
      medium: [
        "📊 Balanced priority - steady progress needed",
        "⚖️ Medium importance - schedule appropriately",
        "🎪 Moderate priority - consistent effort",
        "📈 Standard priority task"
      ],
      low: [
        "📝 Low priority - complete when time allows",
        "🌱 Background task - fill spare time",
        "💭 Lower urgency - flexible timing",
        "🔄 Routine task - steady completion"
      ]
    };
    
    switch (task.priority) {
      case "high":
        score += 45 * priorityMultiplier;
        const highIndex = Math.floor(Math.random() * priorityMessages.high.length);
        reasons.push(priorityMessages.high[highIndex]);
        break;
      case "medium":
        score += 25 * priorityMultiplier;
        const medIndex = Math.floor(Math.random() * priorityMessages.medium.length);
        reasons.push(priorityMessages.medium[medIndex]);
        break;
      case "low":
        score += 10 * priorityMultiplier;
        const lowIndex = Math.floor(Math.random() * priorityMessages.low.length);
        reasons.push(priorityMessages.low[lowIndex]);
        break;
    }
    
    // Intelligent subject complexity with varied timing predictions
    const getSubjectComplexity = (subject: string) => {
      const complexityMap: Record<string, { 
        score: number; 
        durations: string[]; 
        timePreference: "morning" | "afternoon" | "evening" | "any";
        insights: string[];
      }> = {
        "Math": { 
          score: 25, 
          durations: ["60-90 min", "75-120 min", "90-150 min", "45-75 min"], 
          timePreference: "morning",
          insights: [
            "🧮 Mathematical reasoning peaks in morning hours",
            "🔢 Complex calculations require fresh mental energy",
            "📐 Logical thinking optimized before noon"
          ]
        },
        "Physics": { 
          score: 25, 
          durations: ["70-100 min", "80-130 min", "90-140 min", "60-90 min"], 
          timePreference: "morning",
          insights: [
            "⚛️ Physics concepts need peak concentration",
            "🔬 Scientific reasoning thrives in morning clarity",
            "⚡ Problem-solving optimal with fresh mind"
          ]
        },
        "Computer Science": { 
          score: 22, 
          durations: ["45-90 min", "60-120 min", "75-150 min", "30-60 min"], 
          timePreference: "any",
          insights: [
            "💻 Coding can be productive at any hour",
            "🖥️ Programming benefits from uninterrupted blocks",
            "⌨️ Technical work suits your natural rhythm"
          ]
        },
        "Literature": { 
          score: 15, 
          durations: ["30-60 min", "45-75 min", "60-90 min", "25-45 min"], 
          timePreference: "afternoon",
          insights: [
            "📚 Reading comprehension peaks after lunch",
            "✍️ Creative analysis thrives in afternoon calm",
            "📖 Literary insight flows in relaxed hours"
          ]
        },
        "Art": { 
          score: 8, 
          durations: ["45-120 min", "60-150 min", "30-90 min", "75-180 min"], 
          timePreference: "afternoon",
          insights: [
            "🎨 Creative work flourishes in natural light",
            "🖌️ Artistic expression peaks in relaxed state",
            "🌈 Visual creativity optimized in afternoon"
          ]
        },
        "History": { 
          score: 12, 
          durations: ["30-60 min", "40-70 min", "50-80 min", "35-65 min"], 
          timePreference: "afternoon",
          insights: [
            "🏛️ Historical analysis benefits from reflection time",
            "📜 Context understanding grows throughout day",
            "⏳ Timeline comprehension peaks in afternoon"
          ]
        }
      };
      
      const defaultInfo = { 
        score: 10, 
        durations: ["25-45 min", "30-60 min", "35-50 min", "20-40 min"], 
        timePreference: "any" as const,
        insights: [
          "📋 General task suitable for any time",
          "⏰ Flexible timing allows for optimal scheduling",
          "🔄 Adaptable to your daily rhythm"
        ]
      };
      
      return complexityMap[subject] || defaultInfo;
    };
    
    const subjectInfo = getSubjectComplexity(task.subject || "");
    score += subjectInfo.score;
    
    // Varied duration estimation based on multiple factors
    const durationIndex = Math.floor(Math.random() * subjectInfo.durations.length);
    let estimatedDuration = subjectInfo.durations[durationIndex];
    
    // Personalized adjustments from learning insights
    const subj = task.subject || undefined;
    const userDiff = getDifficultyEstimate(subj);
    if (userDiff !== null) {
      score += (userDiff - 5) * 4; // center around neutral 5/10
      if (task.subject) {
        reasons.push(`Personalized: you rate ${task.subject} ~${userDiff}/10`);
      } else {
        reasons.push("Personalized difficulty insights applied");
      }
    }
    const userTime = getTimeEstimateForTask(subj);
    if (userTime !== null) {
      estimatedDuration = `~${Math.round(userTime)} min`;
      if (userTime > 60) {
        score += Math.min((userTime - 60) / 6, 10);
        reasons.push("History suggests longer sessions needed for this subject");
      } else {
        reasons.push("Based on your past pace for this subject");
      }
    }
    
    // Adjust duration based on task complexity indicators
    if (task.description && task.description.length > 100) {
      const extendedDurations = subjectInfo.durations.map(d => {
        const [min, max] = d.split("-").map(x => parseInt(x));
        return `${min + 15}-${max + 30} min`;
      });
      estimatedDuration = extendedDurations[durationIndex];
      reasons.push("📝 Detailed task - extended time allocated");
    }
    
    // Optimal timing analysis with varied insights
    const timingInsights = {
      morning: [
        "🌅 Morning clarity perfect for analytical work",
        "☕ Peak mental energy in early hours",
        "🧠 Cognitive performance highest before noon",
        "⏰ Fresh mind ideal for complex thinking"
      ],
      afternoon: [
        "☀️ Afternoon focus window for creative tasks",
        "🎯 Post-lunch concentration for detailed work",
        "📈 Steady energy levels in afternoon hours",
        "🔄 Balanced mental state for comprehensive work"
      ],
      evening: [
        "🌙 Evening creativity for expressive tasks",
        "✨ Relaxed state perfect for artistic work",
        "🎭 Creative insight flows in evening calm",
        "💫 Reflective hours suit interpretive tasks"
      ]
    };
    
    if (subjectInfo.timePreference === "morning" && currentHour >= 6 && currentHour < 12) {
      score += 8;
      const insightIndex = Math.floor(Math.random() * timingInsights.morning.length);
      reasons.push(timingInsights.morning[insightIndex]);
    } else if (subjectInfo.timePreference === "afternoon" && currentHour >= 12 && currentHour < 18) {
      score += 8;
      const insightIndex = Math.floor(Math.random() * timingInsights.afternoon.length);
      reasons.push(timingInsights.afternoon[insightIndex]);
    } else if (subjectInfo.timePreference === "evening" && currentHour >= 18 && currentHour < 22) {
      score += 8;
      const insightIndex = Math.floor(Math.random() * timingInsights.evening.length);
      reasons.push(timingInsights.evening[insightIndex]);
    }
    
    // Add subject-specific insights
    if (subjectInfo.insights && Math.random() > 0.7) {
      const insightIndex = Math.floor(Math.random() * subjectInfo.insights.length);
      reasons.push(subjectInfo.insights[insightIndex]);
    }
    
    // Enhanced momentum and context analysis
    const momentumMessages = [
      "🚀 Continue current momentum - avoid task switching",
      "⚡ In-progress task - maintain flow state",
      "🎯 Active task - complete while engaged",
      "🔥 Riding productivity wave - keep going"
    ];
    
    if (task.status === "in-progress") {
      score += 30;
      const momentumIndex = Math.floor(Math.random() * momentumMessages.length);
      reasons.push(momentumIndex < momentumMessages.length ? momentumMessages[momentumIndex] : momentumMessages[0]);
    }
    
    // Weekend vs weekday insights
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend && task.priority === "low") {
      score += 5;
      reasons.push("🏖️ Perfect weekend task - relaxed completion");
    } else if (!isWeekend && task.priority === "high") {
      score += 3;
      reasons.push("📅 Weekday focus - prime time for important work");
    }
    
    // Smart batching insights
    const tasksWithSameSubject = incompleteTasks.filter(t => t.subject === task.subject).length;
    if (tasksWithSameSubject > 1 && task.subject) {
      score += 5;
      const batchMessages = [
        `📚 Batch ${tasksWithSameSubject - 1} ${task.subject} tasks together`,
        `🎯 Group subject work - ${tasksWithSameSubject} tasks total`,
        `📋 Subject clustering - ${tasksWithSameSubject - 1} related tasks`,
        `🔗 Efficient batching with ${tasksWithSameSubject - 1} similar tasks`
      ];
      const batchIndex = Math.floor(Math.random() * batchMessages.length);
      reasons.push(batchMessages[batchIndex]);
    }
    
    // Task aging with varied insights
    if (task.createdAt) {
      const taskAge = (now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (taskAge > 7) {
        score += Math.min(taskAge * 2, 15);
        const ageMessages = [
          "⏳ Long-pending task needs attention",
          "🕰️ Aged task - time to complete",
          "📅 Task maturity suggests priority",
          "⌛ Extended timeline - completion due"
        ];
        const ageIndex = Math.floor(Math.random() * ageMessages.length);
        reasons.push(ageMessages[ageIndex]);
      }
    }
    
    // Advanced conflict detection
    const conflictingTasks = incompleteTasks.filter(t => {
      if (!t.dueDate || !task.dueDate) return false;
      const taskDue = new Date(task.dueDate);
      const otherDue = new Date(t.dueDate);
      const timeDiff = Math.abs(taskDue.getTime() - otherDue.getTime()) / (1000 * 60 * 60);
      return timeDiff < 24 && t.id !== task.id;
    });
    
    if (conflictingTasks.length > 0) {
      score += 12;
      const conflictMessages = [
        `⚡ ${conflictingTasks.length} concurrent deadlines - strategic planning needed`,
        `🎯 Multiple tasks due same day - prioritize carefully`,
        `⏰ Deadline cluster detected - time management critical`,
        `📊 ${conflictingTasks.length} competing priorities - balance required`
      ];
      const conflictIndex = Math.floor(Math.random() * conflictMessages.length);
      reasons.push(conflictMessages[conflictIndex]);
    }
    
    // Energy matching with time-sensitive insights
    const isHighEnergyTime = (currentHour >= 9 && currentHour < 12) || (currentHour >= 14 && currentHour < 17);
    const taskRequiresHighEnergy = subjectInfo.score > 18;
    
    if (taskRequiresHighEnergy && isHighEnergyTime) {
      score += 10;
      const energyMessages = [
        "⚡ Peak energy aligns with high-demand task",
        "🔋 Optimal energy-task matching detected",
        "💪 High-energy window perfect for complex work",
        "🎯 Prime cognitive hours for demanding task"
      ];
      const energyIndex = Math.floor(Math.random() * energyMessages.length);
      reasons.push(energyMessages[energyIndex]);
    } else if (taskRequiresHighEnergy && !isHighEnergyTime) {
      score -= 5;
      reasons.push("🔋 Consider scheduling during peak energy hours");
    }
    
    // Determine urgency level with more nuanced thresholds
    let urgencyLevel: "low" | "medium" | "high" | "critical" = "low";
    if (score >= 100) urgencyLevel = "critical";
    else if (score >= 75) urgencyLevel = "high";
    else if (score >= 45) urgencyLevel = "medium";
    
    return {
      task,
      score: Math.round(score),
      reasons: reasons.slice(0, 4), // Top 4 most relevant insights
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
      {/* AI Recommendations Display */}
      {isExpanded && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl max-h-[80vh] overflow-auto shadow-lg">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  <span className="bg-gradient-to-r from-ai-primary to-ai-secondary bg-clip-text text-transparent">AI</span>
                  {" "}Task Intelligence
                </h3>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                ×
              </Button>
            </div>
            
            <CardContent className="p-4">

              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No incomplete tasks to analyze</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    AI has analyzed {incompleteTasks.length} tasks and ranked them by priority, urgency, and optimal timing.
                  </p>
                  
                  {recommendations.map((rec, index) => (
                    <div key={rec.task.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                            <Badge variant="outline" className={`text-xs ${getUrgencyColor(rec.urgencyLevel)}`}>
                              {getUrgencyIcon(rec.urgencyLevel)}
                              <span className="ml-1 capitalize">{rec.urgencyLevel}</span>
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Score: {rec.score}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium text-foreground mb-1">
                            {rec.task.title}
                          </h4>
                          
                          {rec.task.subject && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {rec.task.subject} • Est. {rec.estimatedDuration}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">AI Insights:</p>
                        {rec.reasons.map((reason, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-border pt-4 mt-6">
                    <p className="text-xs text-muted-foreground text-center">
                      Recommendations update automatically based on due dates, priority, subject complexity, and optimal timing.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
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