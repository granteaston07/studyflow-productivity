import { ExternalLink } from "lucide-react";

const LINKS = [
  { name: "Google Classroom", url: "https://classroom.google.com", emoji: "🎓", color: "hover:border-green-500/30 hover:bg-green-500/5" },
  { name: "Quizlet",          url: "https://quizlet.com",          emoji: "📇", color: "hover:border-blue-500/30 hover:bg-blue-500/5" },
  { name: "Khan Academy",     url: "https://khanacademy.org",      emoji: "🦔", color: "hover:border-teal-500/30 hover:bg-teal-500/5" },
  { name: "Notion",           url: "https://notion.so",            emoji: "📓", color: "hover:border-gray-500/30 hover:bg-gray-500/5" },
  { name: "Google Drive",     url: "https://drive.google.com",     emoji: "📁", color: "hover:border-yellow-500/30 hover:bg-yellow-500/5" },
  { name: "ChatGPT",          url: "https://chat.openai.com",      emoji: "🤖", color: "hover:border-emerald-500/30 hover:bg-emerald-500/5" },
];

export function StudyLinks() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {LINKS.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/50 bg-muted/20 transition-all duration-150 group ${link.color}`}
        >
          <span className="text-xl leading-none">{link.emoji}</span>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors line-clamp-1">
            {link.name}
          </span>
        </a>
      ))}
    </div>
  );
}
