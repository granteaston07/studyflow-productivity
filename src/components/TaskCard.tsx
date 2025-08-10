import { Check, Clock, AlertTriangle, Calendar, Edit, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { useState, useEffect } from "react";
import { TaskCompletionFeedback } from "./TaskCompletionFeedback";

export type { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, showFeedback?: boolean) => Promise<{ task: Task | null; shouldShowFeedback: boolean }>;
  onUpdateDueDate: (id: string, dueDate: Date | undefined) => void;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onUpdatePriority?: (id: string, priority: Task['priority']) => void;
  onDelete: (id: string) => void;
  isGuest?: boolean;
}

export function TaskCard({ task, onToggle, onUpdateDueDate, onUpdateStatus, onDelete, onUpdateTitle, isGuest = false }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTask, setFeedbackTask] = useState<Task | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);

  useEffect(() => {
    setTitleInput(task.title);
  }, [task.title]);

  const handleTitleSave = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== task.title) {
      if (onUpdateTitle) onUpdateTitle(task.id, trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleToggle = async () => {
    if (!task.completed) {
      // For authenticated users, show feedback popup before completing the task
      if (!isGuest) {
        setFeedbackTask(task);
        setShowFeedback(true);
        return; // Don't complete the task yet, let the popup handle it
      }
      
      // For guest users, complete normally
      setIsCompleting(true);
      setTimeout(async () => {
        await onToggle(task.id, false);
        setIsCompleting(false);
      }, 800);
    } else {
      // Uncompleting a task
      await onToggle(task.id);
    }
  };

  const handleFeedbackClose = async () => {
    setShowFeedback(false);
    setFeedbackTask(null);
    
    // Now complete the task after feedback popup closes
    setIsCompleting(true);
    setTimeout(async () => {
      await onToggle(task.id, false);
      setIsCompleting(false);
    }, 800);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(task.id);
    }, 500);
  };
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

  const getStatusIcon = (status: Task['status'], dueDate?: Date) => {
    // Don't show overdue icon for tasks due today
    if (status === 'overdue' && dueDate && formatDueDate(dueDate, false) === 'Due today') {
      return <Clock className="h-4 w-4" />;
    }
    
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

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-error';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  const formatDueDate = (date?: Date, isCompleted?: boolean) => {
    if (!date) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (taskDate.getTime() === today.getTime()) {
      return 'Due today';
    } else if (taskDate.getTime() === today.getTime() + 86400000) {
      return 'Due tomorrow';
    } else if (taskDate < today) {
      if (isCompleted) {
        return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      return 'Overdue';
    } else {
      return `Due ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })}`;
    }
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const displayStatus: Task['status'] = (() => {
    if (task.completed) return 'completed';
    if (task.status === 'overdue' && task.dueDate) {
      const d = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
      if (d.getTime() === today.getTime()) return 'pending';
    }
    return task.status;
  })();

  return (
    <>
    <Card className={cn(
      "p-4 transition-all duration-200 hover:shadow-lg border border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm animate-fade-in hover:scale-[1.02]",
      isCompleting && "animate-task-complete",
      isDeleting && "animate-task-poof"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          className={cn(
            "mt-1 w-6 h-6 data-[state=checked]:bg-success data-[state=checked]:border-success transition-all duration-300",
            isCompleting && "animate-checkbox-check"
          )}
        />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0",
                getPriorityColor(task.priority)
              )} />
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    className="h-7"
                  />
                  <Button variant="ghost" size="sm" className="h-6 px-2" onClick={handleTitleSave}>Save</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-medium text-foreground leading-tight",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </h3>
                  {!task.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => setIsEditingTitle(true)}
                      aria-label="Edit task title"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium px-2 py-1 shrink-0 cursor-pointer transition-opacity",
                  getStatusColor(displayStatus),
                  (displayStatus === 'pending' || displayStatus === 'in-progress') && "hover:opacity-80"
                )}
                onClick={() => {
                  if (displayStatus === 'pending') {
                    onUpdateStatus(task.id, 'in-progress');
                  } else if (displayStatus === 'in-progress') {
                    onUpdateStatus(task.id, 'pending');
                  }
                }}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(displayStatus, task.dueDate)}
                  {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1).replace('-', ' ')}
                </span>
              </Badge>
              {!task.completed && (
                <>
                  {/* Edit Task Title Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                    onClick={() => setIsEditingTitle(true)}
                    aria-label="Edit task title"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

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
                </>
              )}
              {/* Delete Task Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-error"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
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
                  displayStatus === 'overdue' && "text-error font-medium",
                  formatDueDate(task.dueDate, false) === 'Due today' && !task.completed && "text-warning font-medium"
                )}>
                  {formatDueDate(task.dueDate, task.completed)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>

    {feedbackTask && (
      <TaskCompletionFeedback
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        task={feedbackTask}
      />
    )}
    </>
  );
}