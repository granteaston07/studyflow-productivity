import { BookOpen, LayoutGrid, Brain, FileText, Cloud, Bot } from "lucide-react";

const LINKS = [
  { name: "Classroom", url: "https://classroom.google.com", icon: LayoutGrid },
  { name: "Quizlet",   url: "https://quizlet.com",          icon: BookOpen },
  { name: "Claude",    url: "https://claude.ai",             icon: Brain },
  { name: "Notion",    url: "https://notion.so",             icon: FileText },
  { name: "Drive",     url: "https://drive.google.com",      icon: Cloud },
  { name: "ChatGPT",   url: "https://chat.openai.com",       icon: Bot },
];

export function StudyLinks() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {LINKS.map(({ name, url, icon: Icon }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all duration-150 group"
        >
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors">
            {name}
          </span>
        </a>
      ))}
    </div>
  );
}
