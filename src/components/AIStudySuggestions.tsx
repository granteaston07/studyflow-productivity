import { Brain, BookOpen, Clock, Target, Lightbulb, TrendingUp, Focus, Zap, Calendar, AlertCircle, BarChart3, Users, Headphones, PenTool, Repeat, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "./TaskCard";
import { differenceInDays, isToday, isTomorrow, isPast } from "date-fns";
import { useLearningInsights } from "@/hooks/useLearningInsights";

interface AIStudySuggestionsProps {
  tasks: Task[];
}

interface StudySuggestion {
  technique: string;
  description: string;
  timeEstimate: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  subjects: string[];
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  category: 'time-management' | 'learning-technique' | 'motivation' | 'efficiency' | 'revision';
  applicableScenarios: string[];
}

export function AIStudySuggestions({ tasks }: AIStudySuggestionsProps) {
  const { getTimeEstimateForTask, getDifficultyEstimate, recordSuggestionInteraction, behaviorPatterns } = useLearningInsights();

  const generateSuggestions = (): StudySuggestion[] => {
    const activeTasks = tasks.filter(task => !task.completed);
    const allSuggestions: StudySuggestion[] = [
      // Time Management Techniques
      {
        technique: "Pomodoro Technique",
        description: "Work in focused 25-minute intervals with 5-minute breaks to maintain concentration",
        timeEstimate: "25 min cycles",
        difficulty: 'easy',
        subjects: ['All'],
        icon: <Clock className="h-4 w-4" />,
        priority: 'high',
        category: 'time-management',
        applicableScenarios: ['high workload', 'focus issues', 'general productivity']
      },
      {
        technique: "Time Blocking",
        description: "Allocate specific time slots for different subjects to create structured study sessions",
        timeEstimate: "2-4 hours",
        difficulty: 'medium',
        subjects: ['All'],
        icon: <Calendar className="h-4 w-4" />,
        priority: 'high',
        category: 'time-management',
        applicableScenarios: ['multiple subjects', 'deadline pressure', 'organization needed']
      },
      {
        technique: "Ultradian Rhythms",
        description: "Study during your natural 90-120 minute focus cycles for peak performance",
        timeEstimate: "90-120 min",
        difficulty: 'advanced',
        subjects: ['All'],
        icon: <TrendingUp className="h-4 w-4" />,
        priority: 'medium',
        category: 'time-management',
        applicableScenarios: ['long study sessions', 'advanced learners', 'energy optimization']
      },

      // Learning Techniques
      {
        technique: "Active Recall",
        description: "Test yourself without looking at notes to strengthen memory pathways",
        timeEstimate: "20-30 min",
        difficulty: 'medium',
        subjects: ['All'],
        icon: <Brain className="h-4 w-4" />,
        priority: 'high',
        category: 'learning-technique',
        applicableScenarios: ['memorization needed', 'exam preparation', 'concept reinforcement']
      },
      {
        technique: "Spaced Repetition",
        description: "Review material at increasing intervals to combat forgetting curve",
        timeEstimate: "15-25 min",
        difficulty: 'medium',
        subjects: ['Math', 'Science', 'Languages'],
        icon: <Repeat className="h-4 w-4" />,
        priority: 'high',
        category: 'revision',
        applicableScenarios: ['long-term retention', 'vocabulary', 'formulas']
      },
      {
        technique: "Feynman Method",
        description: "Explain concepts in simple terms as if teaching someone else",
        timeEstimate: "20-40 min",
        difficulty: 'advanced',
        subjects: ['Science', 'Math', 'Philosophy'],
        icon: <Lightbulb className="h-4 w-4" />,
        priority: 'high',
        category: 'learning-technique',
        applicableScenarios: ['complex concepts', 'deep understanding needed', 'teaching preparation']
      },
      {
        technique: "Mind Mapping",
        description: "Create visual connections between concepts to enhance understanding",
        timeEstimate: "15-30 min",
        difficulty: 'easy',
        subjects: ['All'],
        icon: <BarChart3 className="h-4 w-4" />,
        priority: 'medium',
        category: 'learning-technique',
        applicableScenarios: ['visual learners', 'complex topics', 'relationship mapping']
      },
      {
        technique: "Cornell Note-Taking",
        description: "Systematic note format with cues, notes, and summary sections",
        timeEstimate: "During lectures",
        difficulty: 'easy',
        subjects: ['All'],
        icon: <PenTool className="h-4 w-4" />,
        priority: 'medium',
        category: 'learning-technique',
        applicableScenarios: ['lecture notes', 'structured learning', 'review preparation']
      },
      {
        technique: "Interleaving",
        description: "Mix different topics or problem types within study sessions",
        timeEstimate: "45-60 min",
        difficulty: 'advanced',
        subjects: ['Math', 'Science'],
        icon: <Focus className="h-4 w-4" />,
        priority: 'medium',
        category: 'learning-technique',
        applicableScenarios: ['problem-solving skills', 'discrimination training', 'transfer learning']
      },

      // Subject-Specific Techniques
      {
        technique: "SQ3R Method",
        description: "Survey, Question, Read, Recite, Review for effective reading comprehension",
        timeEstimate: "30-45 min",
        difficulty: 'medium',
        subjects: ['English', 'History', 'Literature'],
        icon: <BookOpen className="h-4 w-4" />,
        priority: 'medium',
        category: 'learning-technique',
        applicableScenarios: ['reading comprehension', 'textbook study', 'research']
      },
      {
        technique: "Worked Examples",
        description: "Study solved problems before attempting similar ones independently",
        timeEstimate: "25-35 min",
        difficulty: 'easy',
        subjects: ['Math', 'Physics', 'Chemistry'],
        icon: <Target className="h-4 w-4" />,
        priority: 'high',
        category: 'learning-technique',
        applicableScenarios: ['problem-solving', 'new concepts', 'skill building']
      },
      {
        technique: "Elaborative Interrogation",
        description: "Ask 'why' and 'how' questions to deepen understanding",
        timeEstimate: "15-25 min",
        difficulty: 'medium',
        subjects: ['Science', 'History', 'Literature'],
        icon: <AlertCircle className="h-4 w-4" />,
        priority: 'medium',
        category: 'learning-technique',
        applicableScenarios: ['critical thinking', 'analysis', 'deeper understanding']
      },

      // Motivation and Focus
      {
        technique: "Goal Setting (SMART)",
        description: "Set Specific, Measurable, Achievable, Relevant, Time-bound study goals",
        timeEstimate: "10-15 min",
        difficulty: 'easy',
        subjects: ['All'],
        icon: <CheckCircle2 className="h-4 w-4" />,
        priority: 'high',
        category: 'motivation',
        applicableScenarios: ['motivation issues', 'planning', 'progress tracking']
      },
      {
        technique: "Study Groups",
        description: "Collaborate with peers to discuss concepts and solve problems",
        timeEstimate: "60-90 min",
        difficulty: 'medium',
        subjects: ['All'],
        icon: <Users className="h-4 w-4" />,
        priority: 'medium',
        category: 'learning-technique',
        applicableScenarios: ['social learning', 'different perspectives', 'accountability']
      },
      {
        technique: "Binaural Beats",
        description: "Use specific audio frequencies to enhance focus and concentration",
        timeEstimate: "Duration of study",
        difficulty: 'easy',
        subjects: ['All'],
        icon: <Headphones className="h-4 w-4" />,
        priority: 'low',
        category: 'efficiency',
        applicableScenarios: ['focus enhancement', 'ambient noise', 'relaxation']
      },
      {
        technique: "Energy Management",
        description: "Schedule demanding tasks during your peak energy hours",
        timeEstimate: "All day",
        difficulty: 'medium',
        subjects: ['All'],
        icon: <Zap className="h-4 w-4" />,
        priority: 'high',
        category: 'efficiency',
        applicableScenarios: ['fatigue issues', 'optimization', 'performance peaks']
      }
    ];

    // AI-powered selection logic
    const selectedSuggestions: StudySuggestion[] = [];
    
    // Analyze task context
    const hasHighPriorityTasks = activeTasks.some(t => t.priority === 'high');
    const hasOverdueTasks = activeTasks.some(t => t.status === 'overdue');
    const hasTasksDueToday = activeTasks.some(t => t.dueDate && isToday(t.dueDate));
    const hasTasksDueTomorrow = activeTasks.some(t => t.dueDate && isTomorrow(t.dueDate));
    const taskCount = activeTasks.length;
    const subjects = [...new Set(activeTasks.map(t => t.subject).filter(Boolean))];
    
    // Subject analysis
    const mathTasks = activeTasks.filter(t => t.subject?.toLowerCase().includes('math'));
    const scienceTasks = activeTasks.filter(t => t.subject?.toLowerCase().includes('science') || 
                                           t.subject?.toLowerCase().includes('physics') || 
                                           t.subject?.toLowerCase().includes('chemistry') || 
                                           t.subject?.toLowerCase().includes('biology'));
    const languageTasks = activeTasks.filter(t => t.subject?.toLowerCase().includes('english') || 
                                             t.subject?.toLowerCase().includes('spanish') || 
                                             t.subject?.toLowerCase().includes('language') ||
                                             t.subject?.toLowerCase().includes('literature'));
    const historyTasks = activeTasks.filter(t => t.subject?.toLowerCase().includes('history'));

    // Priority-based suggestions
    if (hasOverdueTasks || hasTasksDueToday) {
      selectedSuggestions.push(...allSuggestions.filter(s => 
        s.category === 'time-management' && s.priority === 'high'
      ).slice(0, 2));
    }

    if (hasHighPriorityTasks && taskCount > 3) {
      selectedSuggestions.push(...allSuggestions.filter(s => 
        s.technique === 'Time Blocking' || s.technique === 'Energy Management'
      ));
    }

    // Subject-specific suggestions
    if (mathTasks.length > 0) {
      selectedSuggestions.push(...allSuggestions.filter(s => 
        s.subjects.includes('Math') || s.technique === 'Worked Examples'
      ).slice(0, 1));
    }

    if (scienceTasks.length > 0) {
      selectedSuggestions.push(...allSuggestions.filter(s => 
        s.subjects.includes('Science') || s.technique === 'Feynman Method'
      ).slice(0, 1));
    }

    if (languageTasks.length > 0) {
      selectedSuggestions.push(...allSuggestions.filter(s => 
        s.subjects.includes('English') || s.technique === 'SQ3R Method'
      ).slice(0, 1));
    }

    // Learning technique suggestions based on workload
    if (taskCount > 5) {
      selectedSuggestions.push(...allSuggestions.filter(s => 
        s.category === 'efficiency' && !selectedSuggestions.some(sel => sel.technique === s.technique)
      ).slice(0, 1));
    }

    // Always include active recall for memory-intensive tasks
    if (!selectedSuggestions.some(s => s.technique === 'Active Recall')) {
      selectedSuggestions.push(allSuggestions.find(s => s.technique === 'Active Recall')!);
    }

    // Default suggestions if we have less than 3
    if (selectedSuggestions.length < 3) {
      const defaults = allSuggestions.filter(s => 
        s.priority === 'high' && !selectedSuggestions.some(sel => sel.technique === s.technique)
      );
      selectedSuggestions.push(...defaults.slice(0, 3 - selectedSuggestions.length));
    }

    // Remove duplicates and limit to 4 suggestions
    const uniqueSuggestions = selectedSuggestions.filter((s, index, self) => 
      index === self.findIndex(t => t.technique === s.technique)
    ).slice(0, 4);

    return uniqueSuggestions.length > 0 ? uniqueSuggestions : allSuggestions.slice(0, 4);
  };

  const suggestions = generateSuggestions();

  const getDifficultyColor = (difficulty: StudySuggestion['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/20 text-success border-success/30';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'advanced':
        return 'bg-error/20 text-error border-error/30';
    }
  };

  const getCategoryColor = (category: StudySuggestion['category']) => {
    switch (category) {
      case 'time-management':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'learning-technique':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'motivation':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'efficiency':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'revision':
        return 'bg-pink-500/10 text-pink-600 border-pink-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const urgentTasks = activeTasks.filter(t => 
    t.dueDate && (isToday(t.dueDate) || isPast(t.dueDate))
  ).length;

  return (
    <Card className="bg-gradient-to-br from-ai-primary/5 via-primary/5 to-ai-secondary/5 border-ai-primary/20 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="relative">
            <Brain className="h-5 w-5 text-ai-primary" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-ai-secondary rounded-full animate-pulse" />
          </div>
          <span className="ai-gradient-text">AI Study Suggestions</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {urgentTasks > 0 
            ? `${urgentTasks} urgent task${urgentTasks > 1 ? 's' : ''} detected - prioritized suggestions`
            : `${activeTasks.length} active task${activeTasks.length !== 1 ? 's' : ''} analyzed for optimal study techniques`
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="group p-4 rounded-lg bg-card/50 border border-border/50 hover:border-ai-primary/30 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-ai-primary/10 text-ai-primary group-hover:bg-ai-primary/20 transition-colors">
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground text-sm">
                    {suggestion.technique}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(suggestion.category)}`}
                    >
                      {suggestion.category.replace('-', ' ')}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}
                    >
                      {suggestion.difficulty}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {suggestion.description}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{suggestion.timeEstimate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Subjects:</span>
                    <span className="text-ai-primary font-medium">
                      {suggestion.subjects.join(', ')}
                    </span>
                  </div>
                </div>
                {suggestion.applicableScenarios.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {suggestion.applicableScenarios.slice(0, 3).map((scenario, idx) => (
                      <span 
                        key={idx}
                        className="inline-block px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded border"
                      >
                        {scenario}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-ai-primary/10 to-ai-secondary/10 border border-ai-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4 text-ai-primary" />
            <span className="ai-gradient-text-subtle font-medium">Pro Tip:</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {urgentTasks > 0 
              ? "Focus on time management techniques first, then apply learning methods for maximum efficiency."
              : "Adapt techniques based on your energy levels. Start with easier methods and gradually incorporate advanced ones as you build momentum."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}