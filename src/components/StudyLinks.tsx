import { ExternalLink, BookOpen, Video, Users, FileText, Calculator, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudyResource {
  name: string;
  description: string;
  url: string;
  icon: React.ElementType;
  category: 'classroom' | 'study' | 'tools' | 'community';
  color: string;
}

const STUDY_RESOURCES: StudyResource[] = [
  {
    name: 'Google Classroom',
    description: 'Access assignments and class materials',
    url: 'https://classroom.google.com',
    icon: BookOpen,
    category: 'classroom',
    color: 'text-blue-400 bg-blue-400/20'
  },
  {
    name: 'Quizlet',
    description: 'Study with flashcards and practice tests',
    url: 'https://quizlet.com',
    icon: FileText,
    category: 'study',
    color: 'text-purple-400 bg-purple-400/20'
  },
  {
    name: 'Khan Academy',
    description: 'Free courses and practice exercises',
    url: 'https://khanacademy.org',
    icon: Video,
    category: 'study',
    color: 'text-green-400 bg-green-400/20'
  },
  {
    name: 'Wolfram Alpha',
    description: 'Computational knowledge engine',
    url: 'https://wolframalpha.com',
    icon: Calculator,
    category: 'tools',
    color: 'text-orange-400 bg-orange-400/20'
  },
  {
    name: 'Discord Study Groups',
    description: 'Join study communities and get help',
    url: 'https://discord.com',
    icon: Users,
    category: 'community',
    color: 'text-indigo-400 bg-indigo-400/20'
  },
  {
    name: 'Wikipedia',
    description: 'Research and reference materials',
    url: 'https://wikipedia.org',
    icon: Globe,
    category: 'study',
    color: 'text-slate-400 bg-slate-400/20'
  }
];

export function StudyLinks() {
  const categories = {
    classroom: 'Classroom',
    study: 'Study Resources',
    tools: 'Tools & Calculators',
    community: 'Study Communities'
  };

  const groupedResources = STUDY_RESOURCES.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, StudyResource[]>);

  const handleResourceClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          Quick Study Links
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Access your favorite study resources and tools
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedResources).map(([category, resources]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                {categories[category as keyof typeof categories]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <Button
                      key={resource.name}
                      variant="outline"
                      className="h-auto p-4 justify-start hover:bg-muted/50 transition-colors"
                      onClick={() => handleResourceClick(resource.url)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-2 rounded-lg ${resource.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm text-foreground">
                            {resource.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {resource.description}
                          </div>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Access Favorites */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Quick Access</h3>
          <div className="flex flex-wrap gap-2">
            {STUDY_RESOURCES.slice(0, 3).map((resource) => {
              const Icon = resource.icon;
              return (
                <Button
                  key={resource.name}
                  size="sm"
                  variant="secondary"
                  className="flex items-center gap-2 text-xs"
                  onClick={() => handleResourceClick(resource.url)}
                >
                  <Icon className="h-3 w-3" />
                  {resource.name}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}