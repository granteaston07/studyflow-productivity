import { useState, useEffect } from "react";

export interface StudyLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

const DEFAULT_LINKS: StudyLink[] = [
  { id: "1", name: "Classroom", url: "https://classroom.google.com", icon: "LayoutGrid" },
  { id: "2", name: "Quizlet",   url: "https://quizlet.com",          icon: "BookOpen" },
  { id: "3", name: "Claude",    url: "https://claude.ai",             icon: "Brain" },
  { id: "4", name: "Notion",    url: "https://notion.so",             icon: "FileText" },
  { id: "5", name: "Drive",     url: "https://drive.google.com",      icon: "Cloud" },
  { id: "6", name: "ChatGPT",   url: "https://chat.openai.com",       icon: "Bot" },
];

const STORAGE_KEY = "studyflow_custom_links";

export function useCustomLinks() {
  const [links, setLinks] = useState<StudyLink[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_LINKS;
    } catch {
      return DEFAULT_LINKS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  const updateLink = (id: string, updates: Partial<StudyLink>) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const addLink = () => {
    const newLink: StudyLink = {
      id: Date.now().toString(),
      name: "New Link",
      url: "https://",
      icon: "Globe",
    };
    setLinks(prev => [...prev, newLink]);
    return newLink.id;
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const resetToDefault = () => {
    setLinks(DEFAULT_LINKS);
  };

  return { links, updateLink, addLink, deleteLink, resetToDefault };
}
