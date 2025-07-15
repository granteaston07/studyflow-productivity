import { Brain, BookOpen, Clock, Target, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "./TaskCard";

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
}

export function AIStudySuggestions({ tasks }: AIStudySuggestionsProps) {
  // AI-powered study suggestions based on tasks
  const generateSuggestions = (): StudySuggestion[] => {
    const activeTasks = tasks.filter(task => !task.completed);
    const suggestions: StudySuggestion[] = [];

    // Analyze subjects and complexity
    const mathTasks = activeTasks.filter(t => t.subject?.toLowerCase().includes('math'));
    const scienceTasks = activeTasks.filter(t => t.subject?.toLowerCase().includes('science'));
    const languageTasks = activeTasks.filter(t => t.subject?.toLowerCase().includes('english') || t.subject?.toLowerCase().includes('spanish'));

    if (mathTasks.length > 0) {
      suggestions.push({
        technique: "Spaced Repetition",
        description: "Review math concepts in intervals to improve retention",
        timeEstimate: "15-20 min",
        difficulty: 'medium',
        subjects: ['Math'],
        icon: <Target className="h-4 w-4" />
      });
    }

    if (scienceTasks.length > 0) {
      suggestions.push({
        technique: "Feynman Method",
        description: "Explain science concepts in simple terms to test understanding",
        timeEstimate: "20-30 min",
        difficulty: 'advanced',
        subjects: ['Science'],
        icon: <Lightbulb className="h-4 w-4" />
      });
    }

    if (languageTasks.length > 0) {
      suggestions.push({
        technique: "Active Reading",
        description: "Engage with texts through note-taking and summarization",
        timeEstimate: "25-35 min",
        difficulty: 'easy',
        subjects: ['English', 'Spanish'],
        icon: <BookOpen className="h-4 w-4" />
      });
    }

    // Default suggestions if no specific subjects
    if (suggestions.length === 0) {
      suggestions.push(
        {
          technique: "Pomodoro Technique",
          description: "Work in focused 25-minute intervals with short breaks",
          timeEstimate: "25 min cycles",
          difficulty: 'easy',
          subjects: ['All'],
          icon: <Clock className="h-4 w-4" />
        },
        {
          technique: "Mind Mapping",
          description: "Create visual connections between concepts and ideas",
          timeEstimate: "15-25 min",
          difficulty: 'medium',
          subjects: ['All'],
          icon: <Brain className="h-4 w-4" />
        }
      );
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  const getDifficultyColor = (difficulty: StudySuggestion['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/20 text-success';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'advanced':
        return 'bg-error/20 text-error';
    }
  };

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
          Personalized techniques based on your current workload
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
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground text-sm">
                    {suggestion.technique}
                  </h4>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}
                  >
                    {suggestion.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {suggestion.description}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{suggestion.timeEstimate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">For:</span>
                    <span className="text-ai-primary font-medium">
                      {suggestion.subjects.join(', ')}
                    </span>
                  </div>
                </div>
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
            Combine multiple techniques for maximum effectiveness. Start with easier methods and gradually adopt advanced ones.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}