import { Check, Clock, AlertTriangle, Calendar, Edit, Trash2, Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { useState } from "react";
import { EditTaskDialog } from "./EditTaskDialog";

export type { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onUpdate, onUpdateStatus, onDelete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (!task.completed) {
      setIsCompleting(true);
      setTimeout(() => {
        onToggle(task.id);
        setIsCompleting(false);
      }, 800);
    } else {
      onToggle(task.id);
    }
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

  const getRepeatText = (task: Task) => {
    if (!task.repeatType || task.repeatType === 'none') return null;
    
    const interval = task.repeatInterval || 1;
    const type = task.repeatType;
    
    if (interval === 1) {
      return `Repeats ${type}`;
    } else {
      return `Repeats every ${interval} ${type === 'daily' ? 'days' : 
                                      type === 'weekly' ? 'weeks' :
                                      type === 'monthly' ? 'months' : 'years'}`;
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
    <>
      <Card 
        className={cn(
          "p-4 transition-all duration-200 hover:shadow-lg border border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm animate-fade-in hover:scale-[1.02] cursor-pointer",
          isCompleting && "animate-task-complete",
          isDeleting && "animate-task-poof",
          task.completed && "opacity-60"
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  getPriorityColor(task.priority)
                )} />
                <h3 className={cn(
                  "font-medium text-foreground leading-tight",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                {getRepeatText(task) && (
                  <Repeat className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium px-2 py-1 shrink-0 cursor-pointer transition-opacity",
                    getStatusColor(task.status),
                    (task.status === 'pending' || task.status === 'in-progress') && "hover:opacity-80"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.status === 'pending') {
                      onUpdateStatus(task.id, 'in-progress');
                    } else if (task.status === 'in-progress') {
                      onUpdateStatus(task.id, 'pending');
                    }
                  }}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(task.status)}
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                  </span>
                </Badge>
                
                {/* Edit Task Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                
                {/* Delete Task Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
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
                    task.status === 'overdue' && "text-error font-medium"
                  )}>
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              )}
              {getRepeatText(task) && (
                <span className="text-xs text-muted-foreground">
                  {getRepeatText(task)}
                </span>
              )}
              {task.description && (
                <span className="text-xs text-muted-foreground truncate max-w-xs">
                  {task.description}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}