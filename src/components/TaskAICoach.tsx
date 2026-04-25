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

function detectTypeFromSubject(subject: string): string {
  const s = subject.toLowerCase();
  if (/\bhistory\b|social studies|civics|geography|humanities|govt|government/i.test(s)) return "history";
  if (/\bmath\b|mathematics|calculus|algebra|geometry|statistics|arithmetic|trig/i.test(s)) return "math";
  if (/biology|chemistry|physics|\bscience\b|environmental|earth science/i.test(s)) return "science";
  if (/\benglish\b|literature|\bwriting\b|composition|language arts/i.test(s)) return "writing";
  if (/comp.?sci|computer|coding|programming|software/i.test(s)) return "coding";
  if (/spanish|french|german|japanese|mandarin|latin|\blanguage\b|linguistics/i.test(s)) return "language";
  if (/psychology|sociology|economics|political science/i.test(s)) return "history";
  if (/art\b|design|music theory/i.test(s)) return "presentation";
  return "general";
}

function detectType(title: string, subject: string): string {
  const t = (title + " " + subject).toLowerCase();
  // Title-content signals take priority (a "lab report" in any subject → lab)
  if (/lab|experiment|practical|dissect|hypothesis/i.test(t)) return "lab";
  if (/essay|write|draft|paper|report|paragraph|composition/i.test(t)) return "writing";
  if (/present|slide|speech|talk|pitch/i.test(t)) return "presentation";
  if (/research|bibliograph|cite|annotated/i.test(t)) return "research";
  if (/exam|test\b|quiz|revision|revise|flashcard/i.test(t)) return "revision";
  if (/read|chapter|textbook|pages?|article|novel\b/i.test(t)) return "reading";
  if (/code|program|debug|implement|function|class|algorithm|app\b|build/i.test(t)) return "coding";
  if (/vocab|translat|grammar/i.test(t)) return "language";
  if (/calc|equation|worksheet|algebra|geometry|trig|derivative|integral|factor/i.test(t)) return "math";
  if (/timeline|source|cause|effect|war|revolution|event/i.test(t)) return "history";
  if (/reaction|cell|atom|force|energy|molecule/i.test(t)) return "science";
  // Subject is the tiebreaker when the title is generic ("Assignment 3", "Chapter 5", etc.)
  return detectTypeFromSubject(subject);
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
  const subject = task.subject || "";
  const type = detectType(task.title, subject);
  const urgency = getUrgency(task);
  const urgent = urgency === "overdue" || urgency === "today" || urgency === "tomorrow";
  const subjectLabel = subject && subject !== "General" ? ` (${subject})` : "";

  const urgencyPrefix =
    urgency === "overdue"  ? "Overdue — " :
    urgency === "today"    ? "Due today — " :
    urgency === "tomorrow" ? "Due tomorrow — " : "";

  switch (type) {
    case "writing":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — writing` : "Writing task"),
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
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — problem solving` : "Maths / calculation"),
        approach: `Before working through "${task.title}", find 2 worked examples from your ${subject || "maths"} notes and copy each step in full. Then cover and redo from scratch.`,
        steps: [
          `Find 2 worked examples from your ${subject || "maths"} notes or textbook. Copy every step.`,
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
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — reading` : "Reading / comprehension"),
        approach: `Before reading "${task.title}", spend 2 minutes skimming headings, bold terms, and the last paragraph. This gives your brain a map to attach detail to.`,
        steps: [
          "Skim first: headings, first sentence of each paragraph. 2 minutes max.",
          `Write 2–3 questions you expect the ${subject || "text"} to answer.`,
          "Read actively — when you find an answer, underline it and jot a note.",
        ],
        avoid: "Don't read passively. If you finish a page and can't say what it was about, go back.",
        technique: "Survey → Question → Read (SQ3R)",
        techniqueWhy: "Passive reading has near-zero retention. Active reading — hunting for answers — retains 3× more.",
        timer: 30,
      };

    case "coding":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — programming` : "Programming / coding"),
        approach: `For "${task.title}", define what done looks like in plain English before writing a line. Then pseudocode. Then code the smallest thing that works and runs.`,
        steps: [
          "Write what the function/feature should do in plain English.",
          "Pseudocode: map the logic in steps, no syntax.",
          "Code one piece, run it, fix it. Expand only after it works.",
        ],
        avoid: "Don't start with the hardest part. Don't write more than you can immediately test.",
        technique: "Define → pseudocode → smallest working version",
        techniqueWhy: "Coding blocks come from scope creep. Tiny, testable steps eliminate the wall.",
        timer: 45,
      };

    case "revision":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — revision` : "Revision / exam prep"),
        approach: `For "${task.title}" — close your ${subject || "notes"} and write down everything you remember. Then check. Re-reading feels productive but isn't.`,
        steps: [
          `Close all ${subject || "course"} notes. Write everything you remember on this topic.`,
          "Check what you missed or got wrong. Focus only on those gaps.",
          "Test yourself again in 10 minutes without looking at anything.",
        ],
        avoid: "Don't re-read your notes and call it studying. That's not revision, it's reading.",
        technique: "Active recall — not passive review",
        techniqueWhy: "Re-reading creates an illusion of knowing. Retrieval practice builds real memory.",
        timer: 25,
      };

    case "language":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — vocabulary` : "Language / vocabulary"),
        approach: `For "${task.title}", short bursts beat marathon sessions. Read through the vocabulary once out loud — then cover and test every item.`,
        steps: [
          "Read each word and definition out loud once.",
          "Cover the definition. Test yourself on every item — mark what you miss.",
          "Review only the missed ones. Repeat until you get them all clean.",
        ],
        avoid: "Don't read the list top to bottom repeatedly. That's familiarity, not learning.",
        technique: "Spaced retrieval — test, don't read",
        techniqueWhy: "Languages require retrieval practice. Passive reading creates recognition, not recall.",
        timer: 20,
      };

    case "science":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — concept` : "Science concept"),
        approach: `For "${task.title}" in ${subject || "science"}, use the Feynman method: read once, close the book, and explain the concept out loud as if teaching someone from scratch.`,
        steps: [
          `Read the ${subject || "science"} concept once. Then close the book.`,
          "Explain it out loud in simple language. Note every point where you hesitate.",
          "Go back and re-read only the parts where you got stuck.",
        ],
        avoid: "Don't re-read the same section 3 times. Find the specific gap and fix that gap.",
        technique: "Feynman method — teach to understand",
        techniqueWhy: "If you can't explain it simply, you don't understand it. Teaching exposes gaps instantly.",
        timer: 35,
      };

    case "history":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — analysis` : "History / social studies"),
        approach: `For "${task.title}" in ${subject || "history"}, build a cause-effect chain or timeline from memory first — then fill in evidence and detail around that structure.`,
        steps: [
          `Write the key ${subject || "history"} events or arguments from memory first (5 min).`,
          "For each: one cause, one effect, one piece of evidence. No more.",
          "Use that structure as your framework — layer in detail and quotations.",
        ],
        avoid: "Don't memorise isolated facts. Dates and names without context won't stick.",
        technique: "Cause-effect mapping before detail",
        techniqueWhy: `${subject || "History"} makes sense as a narrative. Structural mapping locks in the story before you add detail.`,
        timer: 30,
      };

    case "lab":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — lab / practical` : "Lab / practical"),
        approach: `For "${task.title}", read the full ${subject || "science"} method before starting. Know exactly what you're measuring, why, and what your results table looks like.`,
        steps: [
          "Read the entire procedure. Note every safety step and what data to record.",
          "Draw your results table before touching any equipment.",
          "Record everything during — including unexpected results. They're marked.",
        ],
        avoid: "Don't start without reading the method fully. One skipped step can invalidate the whole thing.",
        technique: "Prepare → record → analyse",
        techniqueWhy: "Most lab marks are lost in the write-up. Recording properly during the experiment makes analysis effortless.",
        timer: 60,
      };

    case "presentation":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — presentation` : "Presentation / speech"),
        approach: `For "${task.title}", don't memorise a script. Know 3–5 key ideas and practise talking through them naturally. Record yourself once and watch it back.`,
        steps: [
          "Write 3–5 bullet points — concepts, not full sentences.",
          "Record a practice run on your phone. Watch it back once.",
          "Practise your opening line until it comes out naturally. First 20 seconds matter most.",
        ],
        avoid: "Don't memorise word-for-word. Scripted delivery falls apart the moment you lose your place.",
        technique: "Key points + verbal rehearsal",
        techniqueWhy: "Knowing the ideas — not the words — means you can recover from any interruption naturally.",
        timer: 30,
      };

    case "research":
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — research` : "Research task"),
        approach: `For "${task.title}", write your central research question at the top of the doc before opening a single source. Every source must answer that question — if it doesn't, skip it.`,
        steps: [
          "Write your central question or argument before searching anything.",
          `Find 3 credible ${subject || "subject"} sources. For each: one key claim + page or URL.`,
          "Summarise each source in one sentence in your own words.",
        ],
        avoid: "Don't open sources and hope a thesis appears. That wastes hours. Question first, evidence second.",
        technique: "Question-first research",
        techniqueWhy: "Starting with sources and working backwards is the most common research time-waster.",
        timer: 45,
      };

    default:
      return {
        headline: urgencyPrefix + (subject && subject !== "General" ? `${subject} — let's plan this` : "Let's break this down"),
        approach: `Before starting "${task.title}"${subjectLabel}, spend 5 minutes getting clear: what does the finished result actually look like? Write it down.`,
        steps: [
          "Write what done looks like — specific, not vague.",
          "Break it into 3 smaller actions you can do right now.",
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
