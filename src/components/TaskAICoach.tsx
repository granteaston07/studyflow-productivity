import { Brain, Clock, Lightbulb, ChevronRight, Timer } from "lucide-react";
import { Task } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { isToday, isTomorrow, isPast, differenceInDays } from "date-fns";

interface TaskAICoachProps {
  task: Task;
}

interface CoachAdvice {
  headline: string;
  approach: string;
  steps: string[];
  technique: string;
  techniqueWhy: string;
  timer: number;
  timerLabel: string;
}

// ─── Detect what kind of task this is ────────────────────────────
function detectType(title: string, subject: string) {
  const t = (title + " " + subject).toLowerCase();
  if (/essay|write|draft|paper|report|paragraph|writing|response/i.test(t)) return "writing";
  if (/math|calc|algebra|geometry|equation|problem|worksheet|trig|derivative|integral|factor/i.test(t)) return "math";
  if (/read|chapter|textbook|pages?|article|novel|book/i.test(t)) return "reading";
  if (/code|program|debug|implement|function|class|algorithm|project|app|build/i.test(t)) return "coding";
  if (/study|revise|review|revision|exam|test|quiz|flashcard/i.test(t)) return "revision";
  if (/lab|experiment|practical|dissect|data|results|hypothesis/i.test(t)) return "lab";
  if (/vocab|grammar|translat|spanish|french|german|japanese|language/i.test(t)) return "language";
  if (/history|timeline|source|analyze|event|cause|effect|war|revolution/i.test(t)) return "history";
  if (/science|biology|chemistry|physics|reaction|cell|atom|force|energy/i.test(t)) return "science";
  if (/present|slide|speech|talk|pitch/i.test(t)) return "presentation";
  if (/research|find|source|bibliograph|cite|notes/i.test(t)) return "research";
  if (/listen|podcast|lecture|watch/i.test(t)) return "passive";
  return "general";
}

function getUrgency(task: Task): "overdue" | "today" | "tomorrow" | "soon" | "none" {
  if (!task.dueDate) return "none";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
  const days = differenceInDays(due, today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 7) return "soon";
  return "none";
}

function buildAdvice(task: Task): CoachAdvice {
  const type = detectType(task.title, task.subject || "");
  const urgency = getUrgency(task);
  const isHigh = task.priority === "high";
  const title = task.title;

  const urgencyPrefix =
    urgency === "overdue" ? "This is overdue — " :
    urgency === "today"   ? "Due today — " :
    urgency === "tomorrow" ? "Due tomorrow — " : "";

  switch (type) {
    case "writing":
      return {
        headline: urgencyPrefix + "Writing task detected",
        approach: `Start with a 10-minute brain dump — write everything you know about "${title}" without editing. Then structure it.`,
        steps: [
          "Set a 10-min timer. Write non-stop — no editing, no deleting.",
          "Outline: hook → context → 3 main points → conclusion.",
          "Write the body first. Introduction last (you'll know what to introduce).",
        ],
        technique: "Free-write first, structure second",
        techniqueWhy: "Editing while writing kills momentum. Get it all out, then shape it.",
        timer: urgency === "today" || urgency === "overdue" ? 45 : 30,
        timerLabel: "45 min writing block",
      };

    case "math":
      return {
        headline: urgencyPrefix + "Math / calculation work",
        approach: `For "${title}", work 2 example problems fully before doing your own. Write every step — no skipping.`,
        steps: [
          "Find 2 worked examples (textbook or notes) and copy the steps.",
          "Cover the solution, try the problem yourself. Check step-by-step.",
          "Do your assigned problems — if stuck, re-read the example, not the answer.",
        ],
        technique: "Worked examples → independent practice",
        techniqueWhy: "Pattern recognition builds faster when you study solved problems before attempting your own.",
        timer: 45,
        timerLabel: "45 min focus block",
      };

    case "reading":
      return {
        headline: urgencyPrefix + "Reading / comprehension task",
        approach: `Before reading "${title}": skim all headings and bolded terms (takes 2 min). This primes your brain to absorb faster.`,
        steps: [
          "Skim: read only headings, subheadings, and the first sentence of each paragraph.",
          "Write 2–3 questions you expect the reading to answer.",
          "Read actively — when you find the answer, underline and note it.",
        ],
        technique: "SQ3R (Survey → Question → Read → Recite → Review)",
        techniqueWhy: "Active reading retains 40% more than passive. You should be writing while you read.",
        timer: 30,
        timerLabel: "30 min reading block",
      };

    case "coding":
      return {
        headline: urgencyPrefix + "Programming / coding project",
        approach: `For "${title}", define what done looks like before writing a single line. Build the smallest thing that works, then improve it.`,
        steps: [
          "Write out in plain English what the function/feature should do.",
          "Pseudocode first — no syntax, just logic steps.",
          "Code one small piece. Run it. Fix it. Then expand.",
        ],
        technique: "Pseudocode → smallest working version → iterate",
        techniqueWhy: "Most coding blocks happen from trying to build everything at once. Tiny steps kill procrastination.",
        timer: 45,
        timerLabel: "45 min deep work",
      };

    case "revision":
      return {
        headline: urgencyPrefix + "Revision / exam prep",
        approach: `For "${title}", don't re-read notes. Test yourself instead — look away and recall everything you know.`,
        steps: [
          "Close your notes. Write down everything you remember about the topic.",
          "Check what you missed. Focus only on those gaps.",
          "Quiz yourself again in 10 minutes without looking.",
        ],
        technique: "Active recall — not re-reading",
        techniqueWhy: "Re-reading creates an illusion of knowing. Testing yourself shows what you actually know.",
        timer: 25,
        timerLabel: "25 min recall sprint",
      };

    case "language":
      return {
        headline: urgencyPrefix + "Language / vocabulary work",
        approach: `For "${title}", use spaced repetition — don't cram everything at once. Short sessions beat marathon sessions.`,
        steps: [
          "Go through new vocab once, speaking each word out loud.",
          "Cover definitions. Test yourself on every word — mark what you missed.",
          "Review only the missed ones. Repeat until you get them all.",
        ],
        technique: "Spaced repetition + active recall",
        techniqueWhy: "Languages are stored in procedural memory — they need repeated retrieval, not passive review.",
        timer: 20,
        timerLabel: "20 min vocab sprint",
      };

    case "science":
      return {
        headline: urgencyPrefix + "Science concept or assignment",
        approach: `For "${title}", use the Feynman method: explain the concept in your own words as if teaching a 12-year-old.`,
        steps: [
          "Read the concept once. Close the textbook.",
          "Explain it out loud in simple language. Note where you get stuck.",
          "Go back and re-read only the parts where you got stuck. Repeat.",
        ],
        technique: "Feynman method — teach to understand",
        techniqueWhy: "If you can't explain it simply, you don't understand it yet. This exposes every gap fast.",
        timer: 35,
        timerLabel: "35 min focused study",
      };

    case "history":
      return {
        headline: urgencyPrefix + "History or social studies work",
        approach: `For "${title}", build a simple timeline or cause-effect map before writing or studying details.`,
        steps: [
          "Write out the key events in chronological order (5 min, from memory first).",
          "For each event: write one cause and one effect.",
          "Use this as your framework — fill in details around the structure.",
        ],
        technique: "Timeline + cause-effect mapping",
        techniqueWhy: "History makes sense as a story. Mapping events spatially makes arguments easier to write and recall.",
        timer: 30,
        timerLabel: "30 min study block",
      };

    case "lab":
      return {
        headline: urgencyPrefix + "Lab or practical work",
        approach: `For "${title}", read the method fully before starting. Know what you're measuring and why, before touching anything.`,
        steps: [
          "Read the entire procedure. Note any safety steps and what data to record.",
          "Prepare your results table before you start the experiment.",
          "During: record everything, even unexpected results — they matter.",
        ],
        technique: "Preparation → systematic recording",
        techniqueWhy: "Most lab marks are lost in the write-up. Recording properly during the experiment makes it effortless after.",
        timer: 60,
        timerLabel: "60 min lab block",
      };

    case "presentation":
      return {
        headline: urgencyPrefix + "Presentation or speech prep",
        approach: `For "${title}", don't memorise a script — know 3–5 key points and practice talking through them naturally.`,
        steps: [
          "Write down 3–5 bullet points, not full sentences.",
          "Record yourself presenting once — watch it back to spot unclear sections.",
          "Practice the opening line until it's smooth. First 15 seconds matter most.",
        ],
        technique: "Key points + verbal rehearsal (not memorisation)",
        techniqueWhy: "Scripted presentations fall apart when you lose your place. Knowing the ideas lets you recover easily.",
        timer: 30,
        timerLabel: "30 min prep session",
      };

    case "research":
      return {
        headline: urgencyPrefix + "Research task",
        approach: `For "${title}", start with your thesis or central question. Every source you find should answer that question — if it doesn't, skip it.`,
        steps: [
          "Write your research question at the top of your doc before opening any tabs.",
          "Find 3 credible sources. For each: note the key claim and page number.",
          "Summarise each source in one sentence in your own words.",
        ],
        technique: "Question-first research",
        techniqueWhy: "Starting with sources and hoping to find a thesis is backwards. Know the question first, find the evidence second.",
        timer: 45,
        timerLabel: "45 min research block",
      };

    default:
      return {
        headline: urgencyPrefix + "Let's break this down",
        approach: `For "${title}", spend the first 5 minutes planning — what exactly does done look like for this task?`,
        steps: [
          "Write down what the finished result should look like (1 min).",
          "Break it into 3 smaller steps you can actually do.",
          "Start with the easiest step to build momentum.",
        ],
        technique: "Define done → break it down → start small",
        techniqueWhy: "Most procrastination comes from vagueness. Once you know exactly what to do, starting is easy.",
        timer: 25,
        timerLabel: "25 min focus block",
      };
  }
}

export function TaskAICoach({ task }: TaskAICoachProps) {
  const advice = buildAdvice(task);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Brain className="h-4 w-4 text-ai-primary" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-ai-secondary rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-semibold text-ai-primary uppercase tracking-wider">AI Study Coach</span>
      </div>

      {/* Task being analysed */}
      <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
        <p className="text-xs text-muted-foreground mb-0.5">Analysing</p>
        <p className="text-sm font-semibold text-foreground truncate">{task.title}</p>
        {task.subject && <p className="text-xs text-muted-foreground mt-0.5">{task.subject}</p>}
      </div>

      {/* Approach */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{advice.headline}</p>
        <p className="text-sm text-foreground leading-relaxed">{advice.approach}</p>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your plan</p>
        {advice.steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      {/* Technique */}
      <div className="p-3.5 rounded-xl bg-ai-primary/8 border border-ai-primary/15 space-y-1.5">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-ai-primary" />
          <span className="text-xs font-semibold text-ai-primary">Best technique</span>
        </div>
        <p className="text-sm font-semibold text-foreground">{advice.technique}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <ChevronRight className="h-3 w-3 inline mr-0.5 text-ai-primary" />
          {advice.techniqueWhy}
        </p>
      </div>

      {/* Timer suggestion */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Timer className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Suggested: {advice.timer} minutes</p>
          <p className="text-xs text-muted-foreground">{advice.timerLabel}</p>
        </div>
        <Badge variant="outline" className="ml-auto border-primary/25 text-primary bg-primary/8 text-xs">
          {advice.timer}m
        </Badge>
      </div>
    </div>
  );
}
