import { useState, useEffect } from 'react';
import { Timer, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from './TaskCard';

interface FloatingStatusProps {
  tasks: Task[];
  timerActive: boolean;
  timeRemaining: number;
}

export const FloatingStatus = ({ tasks, timerActive, timeRemaining }: FloatingStatusProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const timerSection = document.getElementById('focus-timer');
      const progressSection = document.getElementById('progress-tracker');
      
      if (timerSection && progressSection) {
        const timerRect = timerSection.getBoundingClientRect();
        const progressRect = progressSection.getBoundingClientRect();
        
        // Show floating window when both sections are out of view
        const bothOutOfView = timerRect.bottom < 0 || progressRect.top > window.innerHeight;
        setIsVisible(bothOutOfView);
      }
      
      setScrollPosition(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
        <CardContent className="p-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Timer className={`h-4 w-4 ${timerActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <div className="text-sm">
              <span className="text-muted-foreground">Timer: </span>
              <span className={timerActive ? 'text-primary font-medium' : 'text-muted-foreground'}>
                {timerActive ? formatTime(timeRemaining) : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="w-px h-6 bg-border" />
          
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-success" />
            <div className="text-sm">
              <span className="text-muted-foreground">Progress: </span>
              <span className="text-success font-medium">{completionPercentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};