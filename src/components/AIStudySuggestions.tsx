import { Brain, Clock, ChevronRight, Repeat, Lightbulb, Target, BookOpen, Zap, Calendar, Focus, PenTool, BarChart3, CheckCircle2, Users, Headphones, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from "./TaskCard";
import { isToday, isTomorrow, isPast } from "date-fns";
import { useLearningInsights } from "@/hooks/useLearningInsights";

interface AIStudySuggestionsProps {
  tasks: Task[];
}

interface Suggestion {
  technique: string;
  description: string;
  timeEstimate: string;
  difficulty: "easy" | "medium" | "advanced";
  category: "time" | "technique" | "motivation" | "revision";
  icon: React.ReactNode;
  why?: string;
}

const ALL: Suggestion[] = [
  { technique: "Pomodoro", description: "25 min focus, 5 min break. Repeat.", timeEstimate: "25 min cycles", difficulty: "easy", category: "time", icon: <Clock className="h-4 w-4" />, why: "Great for when you have a lot on your plate and need structure." },
  { technique: "Time Blocking", description: "Give each subject its own dedicated slot in your day.", timeEstimate: "Plan 10 min", difficulty: "medium", category: "time", icon: <Calendar className="h-4 w-4" />, why: "Stops you from bouncing between tasks and losing flow." },
  { technique: "Active Recall", description: "Close your notes. Try to remember everything you just read.", timeEstimate: "20–30 min", difficulty: "medium", category: "technique", icon: <Brain className="h-4 w-4" />, why: "The single most effective memory technique backed by research." },
  { technique: "Spaced Repetition", description: "Review material at growing intervals to lock it in long-term.", timeEstimate: "15–25 min", difficulty: "medium", category: "revision", icon: <Repeat className="h-4 w-4" />, why: "Fights the forgetting curve before exams sneak up on you." },
  { technique: "Feynman Method", description: "Explain the concept out loud as if you're teaching a 5-year-old.", timeEstimate: "20–40 min", difficulty: "advanced", category: "technique", icon: <Lightbulb className="h-4 w-4" />, why: "Instantly exposes what you don't actually understand." },
  { technique: "Worked Examples", description: "Study 3 solved problems before trying one on your own.", timeEstimate: "25–35 min", difficulty: "easy", category: "technique", icon: <Target className="h-4 w-4" />, why: "Critical for Math and Physics — builds pattern recognition fast." },
  { technique: "Mind Mapping", description: "Draw connections between ideas visually on a single page.", timeEstimate: "15–30 min", difficulty: "easy", category: "technique", icon: <BarChart3 className="h-4 w-4" />, why: "Perfect for topics with lots of interconnected ideas." },
  { technique: "SQ3R Reading", description: "Survey → Question → Read → Recite → Review.", timeEstimate: "30–45 min", difficulty: "medium", category: "technique", icon: <BookOpen className="h-4 w-4" />, why: "Turns passive reading into active understanding." },
  { technique: "Cornell Notes", description: "Divide your page: cues left, notes right, summary at bottom.", timeEstimate: "During class", difficulty: "easy", category: "technique", icon: <PenTool className="h-4 w-4" />, why: "Makes reviewing 10x faster because your notes are already organized." },
  { technique: "Interleaving", description: "Switch between subjects every 30 min instead of blocking one.", timeEstimate: "45–60 min", difficulty: "advanced", category: "technique", icon: <Focus className="h-4 w-4" />, why: "Feels harder but leads to better long-term performance." },
  { technique: "Energy Management", description: "Do your hardest task first, while your brain is fresh.", timeEstimate: "All day", difficulty: "medium", category: "motivation", icon: <Zap className="h-4 w-4" />, why: "Willpower is highest in the morning. Don't waste it on easy tasks." },
  { technique: "Elaborative Interrogation", description: "For every fact you study, ask: why is this true?", timeEstimate: "15–25 min", difficulty: "medium", category: "technique", icon: <AlertCircle className="h-4 w-4" />, why: "Connects new information to what you already know, so it sticks." },
  { technique: "SMART Goals", description: "Set a specific, timed goal before each session starts.", timeEstimate: "5 min setup", difficulty: "easy", category: "motivation", icon: <CheckCircle2 className="h-4 w-4" />, why: "Vague study sessions waste time. Clarity leads to results." },
  { technique: "Ultradian Rhythms", description: "Study in 90-minute blocks aligned to your natural focus cycles.", timeEstimate: "90–120 min", difficulty: "advanced", category: "time", icon: <TrendingUp className="h-4 w-4" />, why: "Your brain has natural peaks. Work with them, not against them." },
  { technique: "Study Groups", description: "Quiz each other and explain concepts to a peer.", timeEstimate: "60–90 min", difficulty: "medium", category: "motivation", icon: <Users className="h-4 w-4" />, why: "Teaching something forces real understanding." },
  { technique: "Binaural Beats", description: "Play alpha or beta frequency audio while studying.", timeEstimate: "Full session", difficulty: "easy", category: "motivation", icon: <Headphones className="h-4 w-4" />, why: "Can improve focus and reduce mental fatigue for some people." },
];

function pickSuggestions(tasks: Task[]): Suggestion[] {
  const active = tasks.filter(t => !t.completed);
  const selected: Suggestion[] = [];
  const add = (name: string) => {
    const s = ALL.find(x => x.technique === name);
    if (s && !selected.find(x => x.technique === name)) selected.push(s);
  };

  const hasOverdue = active.some(t => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate));
  const hasDueToday = active.some(t => t.dueDate && isToday(t.dueDate));
  const hasDueTomorrow = active.some(t => t.dueDate && isTomorrow(t.dueDate));
  const hasMath = active.some(t => /math|calc|algebra|geometry/i.test(t.subject || ""));
  const hasScience = active.some(t => /science|physics|chem|bio/i.test(t.subject || ""));
  const hasLang = active.some(t => /english|lit|spanish|french|language/i.test(t.subject || ""));
  const hasHistory = active.some(t => /history|social|geo/i.test(t.subject || ""));
  const heavyLoad = active.length >= 5;

  if (hasOverdue || hasDueToday) { add("Pomodoro"); add("Energy Management"); }
  if (hasDueTomorrow) add("Time Blocking");
  if (heavyLoad) add("Time Blocking");
  if (hasMath || hasScience) add("Worked Examples");
  if (hasScience) add("Feynman Method");
  if (hasLang || hasHistory) add("SQ3R Reading");
  if (!selected.find(x => x.technique === "Active Recall")) add("Active Recall");
  if (selected.length < 3) add("Spaced Repetition");
  if (selected.length < 3) add("SMART Goals");

  // Fill to 3 with high-value defaults
  const defaults = ["Active Recall", "Pomodoro", "Spaced Repetition", "Energy Management", "Feynman Method"];
  for (const name of defaults) {
    if (selected.length >= 3) break;
    add(name);
  }

  return selected.slice(0, 3);
}

const DIFFICULTY_STYLE = {
  easy: "bg-success/15 text-success border-success/25",
  medium: "bg-warning/15 text-warning border-warning/25",
  advanced: "bg-error/15 text-error border-error/25",
};

const CATEGORY_STYLE = {
  time: "bg-blue-500/10 text-blue-500",
  technique: "bg-primary/10 text-primary",
  motivation: "bg-success/10 text-success",
  revision: "bg-ai-primary/10 text-ai-primary",
};

export function AIStudySuggestions({ tasks }: AIStudySuggestionsProps) {
  const { behaviorPatterns } = useLearningInsights();
  const suggestions = pickSuggestions(tasks);

  const active = tasks.filter(t => !t.completed);
  const urgentCount = active.filter(t => t.dueDate && (isToday(t.dueDate) || isPast(t.dueDate))).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-4 w-4 text-ai-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-ai-secondary rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Study Tips</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {urgentCount > 0 ? `${urgentCount} urgent` : `${active.length} tasks analyzed`}
        </span>
      </div>

      {/* Suggestion cards */}
      {suggestions.map((s, i) => (
        <div key={i}
          className="group flex gap-3 p-3.5 rounded-xl border border-border/50 bg-card hover:border-ai-primary/25 hover:bg-ai-primary/3 transition-all duration-150">
          <div className="w-8 h-8 rounded-lg bg-ai-primary/10 flex items-center justify-center text-ai-primary flex-shrink-0 group-hover:bg-ai-primary/20 transition-colors mt-0.5">
            {s.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{s.technique}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant="outline" className={`text-xs px-1.5 py-0 h-4 border ${DIFFICULTY_STYLE[s.difficulty]}`}>
                  {s.difficulty}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{s.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {s.timeEstimate}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLE[s.category]}`}>
                {s.category === "time" ? "time mgmt" : s.category}
              </span>
            </div>
            {s.why && (
              <p className="text-xs text-ai-primary/80 mt-2 flex items-start gap-1">
                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {s.why}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Pro tip */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-ai-primary/8 to-ai-secondary/8 border border-ai-primary/15">
        <p className="text-xs text-muted-foreground">
          <span className="text-ai-primary font-semibold">Pro tip: </span>
          {urgentCount > 0
            ? "You have urgent tasks — tackle time management first, then apply technique for maximum output."
            : "Combine Active Recall with Spaced Repetition for the highest retention gains before any exam."}
        </p>
      </div>
    </div>
  );
}
