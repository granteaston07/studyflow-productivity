import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const studyLinks = [
  {
    name: "Google Classroom",
    url: "https://classroom.google.com",
    icon: "🎓",
    description: "Classes & assignments"
  },
  {
    name: "Quizlet",
    url: "https://quizlet.com",
    icon: "📚",
    description: "Study flashcards"
  },
  {
    name: "Google Drive",
    url: "https://drive.google.com",
    icon: "📁",
    description: "Files & documents"
  },
  {
    name: "Kahoot",
    url: "https://kahoot.com",
    icon: "🎮",
    description: "Fun quizzes"
  }
];

export function StudyLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          Quick Study Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {studyLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors group"
            >
              <span className="text-lg">{link.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">{link.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{link.description}</p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}