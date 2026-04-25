import { Brain, Lightbulb, ChevronRight, Timer, AlertTriangle } from "lucide-react";
import { Task } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";

interface TaskAICoachProps {
  task: Task;
}

interface CoachAdvice {
  headline: string;
  approach: string;
  steps: string[];
  avoid: string;
  technique: string;
  techniqueWhy: string;
  timer: number;
}

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
  const urgent = urgency === "overdue" || urgency === "today" || urgency === "tomorrow";

  const urgencyPrefix =
    urgency === "overdue"  ? "Overdue — " :
    urgency === "today"    ? "Due today — " :
    urgency === "tomorrow" ? "Due tomorrow — " : "";

  switch (type) {
    case "writing":
      return {
        headline: urgencyPrefix + "Writing task",
        approach: `Set a 10-minute timer and write everything you know about "${task.title}" without stopping. No editing. No deleting. Just get it out. Structure comes after.`,
        steps: [
          "10-min brain dump: write non-stop, no corrections.",
          "Outline from your dump: hook → context → 3 points → conclusion.",
          "Write the body sections first. Write the intro last — you'll know what to introduce.",
        ],
        avoid: "Don't start with the intro. Don't edit while writing. Both kill momentum.",
        technique: "Free-write first, structure second",
        techniqueWhy: "Trying to write perfectly the first time is the #1 reason people get stuck. Volume first, quality second.",
        timer: urgent ? 45 : 45,
      };

    case "math":
      return {
        headline: urgencyPrefix + "Maths / calculation",
        approach: `Before doing your own problems for "${task.title}", find 2 worked examples and copy the full solution step by step. Then cover it and redo it from scratch.`,
        steps: [
          "Find 2 worked examples (textbook, notes, or online). Copy every step.",
          "Cover the solution. Attempt each problem yourself from scratch.",
          "If stuck, re-read the example step — not the answer.",
        ],
        avoid: "Don't skip steps when writing. Don't check the answer before trying fully.",
        technique: "Worked examples → independent practice",
        techniqueWhy: "Your brain learns maths through pattern recognition. Studying solved problems builds that pattern faster than trial and error.",
        timer: 45,
      };

    case "reading":
      return {
        headline: urgencyPrefix + "Reading / comprehension",
        approach: `Before reading "${task.title}", spend 2 minutes skimming: headings, subheadings, bold terms, and the last paragraph. This primes your brain to absorb.`,
        steps: [
          "Skim first: headings, first sentence of each paragraph. Takes 2 min.",
          "Write 2–3 questions you expect the text to answer.",
          "Read actively — when you find an answer, underline and note it in the margin.",
        ],
        avoid: "Don't read passively. If you finish a page and can't say what it was about, reread it.",
        technique: "Survey → Question → Read (SQ3R)",
        techniqueWhy: "Passive reading has near-zero retention. Active reading — where you're hunting for answers — retains 3x more.",
        timer: 30,
      };

    case "coding":
      return {
        headline: urgencyPrefix + "Programming / coding",
        approach: `For "${task.title}", define what done looks like before writing a single line. Then write pseudocode. Then code the smallest thing that works.`,
        steps: [
          "Write in plain English: what should this function/feature actually do?",
          "Pseudocode: map the logic in steps, no syntax.",
          "Code one piece, run it, fix it. Then expand. Never build everything at once.",
        ],
        avoid: "Don't start with the hardest part. Don't write more than you can test immediately.",
        technique: "Define → pseudocode → smallest working version",
        techniqueWhy: "Coding blocks almost always come from scope creep. Tiny, testable steps eliminate the wall.",
        timer: 45,
      };

    case "revision":
      return {
        headline: urgencyPrefix + "Revision / exam prep",
        approach: `For "${task.title}" — don't re-read your notes. Close them and recall everything you know. Then check. Re-reading feels productive but isn't.`,
        steps: [
          "Close all notes. Write down everything you remember on the topic.",
          "Check what you missed or got wrong. Focus only on those gaps.",
          "Test yourself again in 10 minutes without looking at anything.",
        ],
        avoid: "Don't re-read your notes and call it studying. That's not revision, it's reading.",
        technique: "Active recall — not passive review",
        techniqueWhy: "Re-reading creates an illusion of knowing. Retrieval practice — actually testing yourself — builds real memory.",
        timer: 25,
      };

    case "language":
      return {
        headline: urgencyPrefix + "Language / vocabulary",
        approach: `For "${task.title}", short bursts beat marathon sessions. Go through the vocab once out loud, then cover and test — don't just read.`,
        steps: [
          "Read each word and definition out loud once.",
          "Cover the definition. Test yourself on every item — mark what you miss.",
          "Review only the missed ones. Repeat until you get them all.",
        ],
        avoid: "Don't read the list top to bottom repeatedly. That's not learning — it's familiarity.",
        technique: "Spaced retrieval — test, don't read",
        techniqueWhy: "Languages require retrieval practice to stick. Passive reading creates recognition, not recall.",
        timer: 20,
      };

    case "science":
      return {
        headline: urgencyPrefix + "Science concept",
        approach: `For "${task.title}", use the Feynman method: read once, close the book, and explain the concept out loud as if teaching someone who knows nothing.`,
        steps: [
          "Read the concept or topic once. Then close the book.",
          "Explain it out loud in simple language. Note every point where you hesitate.",
          "Go back and reread only the parts where you got stuck.",
        ],
        avoid: "Don't re-read the same section 3 times. Identify the specific gap and fix that.",
        technique: "Feynman method — teach to understand",
        techniqueWhy: "If you can't explain it simply, you don't understand it. Teaching exposes every gap instantly.",
        timer: 35,
      };

    case "history":
      return {
        headline: urgencyPrefix + "History / social studies",
        approach: `For "${task.title}", build a simple timeline or cause-effect chain from memory first. Then fill in the detail around that structure.`,
        steps: [
          "Write the key events in chronological order from memory (5 min).",
          "For each event: one cause, one effect. No more.",
          "Use the timeline as your framework — add detail and evidence around it.",
        ],
        avoid: "Don't try to memorise isolated facts. Dates and names without context won't stick.",
        technique: "Timeline + cause-effect mapping",
        techniqueWhy: "History makes sense as a story. Spatial mapping locks in the narrative before you add detail.",
        timer: 30,
      };

    case "lab":
      return {
        headline: urgencyPrefix + "Lab / practical",
        approach: `For "${task.title}", read the full method before starting. Know exactly what you're measuring, why, and what your results table looks like — before you touch anything.`,
        steps: [
          "Read the entire procedure. Note every safety step and what data to record.",
          "Draw your results table before starting the experiment.",
          "Record everything during — including unexpected results. They're marked.",
        ],
        avoid: "Don't start without reading the method fully. One skipped step can invalidate the whole thing.",
        technique: "Prepare → record → analyse",
        techniqueWhy: "Most lab marks are lost in the write-up. Recording properly during the experiment makes analysis effortless.",
        timer: 60,
      };

    case "presentation":
      return {
        headline: urgencyPrefix + "Presentation / speech",
        approach: `For "${task.title}", don't memorise a script. Know 3–5 key points and practise talking through them naturally. Record yourself once.`,
        steps: [
          "Write 3–5 bullet points — not sentences, just concepts.",
          "Record a practice run on your phone. Watch it back once.",
          "Practise your opening line until it comes out smooth. First 20 seconds matter most.",
        ],
        avoid: "Don't memorise word-for-word. Scripted presentations fall apart the moment you lose your place.",
        technique: "Key points + verbal rehearsal",
        techniqueWhy: "Knowing the ideas — not the words — means you can recover from any disruption naturally.",
        timer: 30,
      };

    case "research":
      return {
        headline: urgencyPrefix + "Research task",
        approach: `For "${task.title}", write your research question at the top of the doc before opening a single tab. Every source must answer that question — if it doesn't, skip it.`,
        steps: [
          "Write your central question or thesis before searching anything.",
          "Find 3 credible sources. For each: one key claim + page/URL.",
          "Summarise each source in one sentence in your own words.",
        ],
        avoid: "Don't open sources and hope a thesis emerges. That wastes hours. Question first, evidence second.",
        technique: "Question-first research",
        techniqueWhy: "Starting with sources and working backwards is the most common research time-waster. Know what you're looking for.",
        timer: 45,
      };

    default:
      return {
        headline: urgencyPrefix + "Let's break this down",
        approach: `Before starting "${task.title}", spend 5 minutes getting clear: what does the finished result actually look like? Write it down.`,
        steps: [
          "Write what done looks like — specific, not vague.",
          "Break it into 3 smaller actions you can actually do right now.",
          "Start with the easiest one to build momentum.",
        ],
        avoid: "Don't start without knowing what done looks like. Vagueness is the #1 cause of procrastination.",
        technique: "Define done → break it down → start small",
        techniqueWhy: "Most procrastination is ambiguity in disguise. Clarity about the next action removes the block.",
        timer: 25,
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
        <span className="text-xs font-semibold text-ai-primary uppercase tracking-wider">AI Coach</span>
      </div>

      {/* Task being analysed */}
      <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
        <p className="text-xs text-muted-foreground mb-0.5">Coaching for</p>
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

      {/* What to avoid */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-error/5 border border-error/15">
        <AlertTriangle className="h-3.5 w-3.5 text-error mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-error font-semibold">Avoid: </span>
          {advice.avoid}
        </p>
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
          <p className="text-sm font-semibold text-foreground">Suggested block: {advice.timer} minutes</p>
          <p className="text-xs text-muted-foreground">Set the timer above and start.</p>
        </div>
        <Badge variant="outline" className="ml-auto border-primary/25 text-primary bg-primary/8 text-xs">
          {advice.timer}m
        </Badge>
      </div>
    </div>
  );
}
