import { Check, Clock, AlertTriangle, Calendar, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  subject?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdateDueDate: (id: string, dueDate: Date | undefined) => void;
}

export function TaskCard({ task, onToggle, onUpdateDueDate }: TaskCardProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-light text-success border-success/20';
      case 'in-progress':
        return 'bg-warning-light text-warning border-warning/20';
      case 'overdue':
        return 'bg-error-light text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDueDate = (date?: Date) => {
    if (!date) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (taskDate.getTime() === today.getTime()) {
      return 'Due today';
    } else if (taskDate.getTime() === today.getTime() + 86400000) {
      return 'Due tomorrow';
    } else if (taskDate < today) {
      return 'Overdue';
    } else {
      return `Due ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })}`;
    }
  };

  return (
    <Card className="p-4 transition-all duration-200 hover:shadow-lg border border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1"
        />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "font-medium text-foreground leading-tight",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium px-2 py-1 shrink-0",
                  getStatusColor(task.status)
                )}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(task.status)}
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                </span>
              </Badge>
              
              {/* Edit Due Date Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 space-y-3">
                    <div className="text-sm font-medium">Edit Due Date</div>
                    <CalendarComponent
                      mode="single"
                      selected={task.dueDate}
                      onSelect={(date) => onUpdateDueDate(task.id, date)}
                      initialFocus
                      className="rounded-md border-0"
                    />
                    {task.dueDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateDueDate(task.id, undefined)}
                        className="w-full text-xs"
                      >
                        Remove Due Date
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {task.subject && (
              <span className="bg-primary-light text-primary px-2 py-1 rounded-md text-xs font-medium">
                {task.subject}
              </span>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={cn(
                  "text-xs",
                  task.status === 'overdue' && "text-error font-medium"
                )}>
                  {formatDueDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}