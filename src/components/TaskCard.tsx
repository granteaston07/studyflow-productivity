import { Calendar, Trash2, Pencil, X, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { useState, useEffect } from "react";
import { TaskCompletionFeedback } from "./TaskCompletionFeedback";
import { useCustomSubjects } from "@/hooks/useCustomSubjects";

export type { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, showFeedback?: boolean) => Promise<{ task: Task | null; shouldShowFeedback: boolean }>;
  onUpdateDueDate: (id: string, dueDate: Date | undefined) => void;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onUpdatePriority?: (id: string, priority: Task['priority']) => void;
  onUpdateSubject?: (id: string, subject: string) => void;
  onDelete: (id: string) => void;
  isGuest?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  isReorderMode?: boolean;
}

// The 4 user-settable statuses in cycle order
const CYCLE: Task['status'][] = ['pending', 'in-progress', 'review', 'blocked'];

function getStatusStyle(status: Task['status']): string {
  switch (status) {
    case 'pending':     return 'bg-muted text-muted-foreground border-border';
    case 'in-progress': return 'bg-warning/15 text-warning border-warning/25';
    case 'review':      return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
    case 'blocked':     return 'bg-error/15 text-error border-error/25';
    case 'completed':   return 'bg-success/15 text-success border-success/25';
    case 'overdue':     return 'bg-error/15 text-error border-error/25';
    default:            return 'bg-muted text-muted-foreground border-border';
  }
}

function getStatusLabel(status: Task['status']): string {
  switch (status) {
    case 'pending':     return 'To Do';
    case 'in-progress': return 'In Progress';
    case 'review':      return 'Review';
    case 'blocked':     return 'Blocked';
    case 'completed':   return 'Done';
    case 'overdue':     return 'Overdue';
    default:            return status;
  }
}

function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'high':   return 'bg-error';
    case 'medium': return 'bg-warning';
    case 'low':    return 'bg-success';
    default:       return 'bg-muted';
  }
}

function formatDueDate(date?: Date, completed?: boolean): string | null {
  if (!date) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return 'Due today';
  if (d.getTime() === today.getTime() + 86400000) return 'Due tomorrow';
  if (d < today) return completed ? `Due ${format(date, 'MMM d')}` : 'Overdue';
  return `Due ${format(date, 'MMM d')}`;
}

export function TaskCard({
  task, onToggle, onUpdateDueDate, onUpdateStatus, onDelete,
  onUpdateTitle, onUpdatePriority, onUpdateSubject,
  isGuest = false, selected = false, onSelect, isReorderMode = false,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTask, setFeedbackTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);
  const [subjectInput, setSubjectInput] = useState(task.subject || '');
  const [priorityInput, setPriorityInput] = useState<Task['priority']>(task.priority);
  const [dateInput, setDateInput] = useState<Date | undefined>(task.dueDate);
  const { getDisplayName } = useCustomSubjects();

  useEffect(() => {
    setTitleInput(task.title);
    setSubjectInput(task.subject || '');
    setPriorityInput(task.priority);
    setDateInput(task.dueDate);
  }, [task]);

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitleInput(task.title);
    setSubjectInput(task.subject || '');
    setPriorityInput(task.priority);
    setDateInput(task.dueDate);
    setIsEditing(true);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== task.title) onUpdateTitle?.(task.id, trimmed);
    const sub = subjectInput.trim();
    if (sub !== (task.subject || '')) onUpdateSubject?.(task.id, sub || 'General');
    if (priorityInput !== task.priority) onUpdatePriority?.(task.id, priorityInput);
    if (dateInput !== task.dueDate) onUpdateDueDate(task.id, dateInput);
    setIsEditing(false);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  // Cycle through the 4 user statuses on badge click
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.completed) return;
    const idx = CYCLE.indexOf(displayStatus);
    if (idx === -1) return;
    onUpdateStatus(task.id, CYCLE[(idx + 1) % CYCLE.length]);
  };

  const handleToggle = async () => {
    if (!task.completed) {
      if (!isGuest) {
        setFeedbackTask(task);
        setShowFeedback(true);
        return;
      }
      setIsCompleting(true);
      setTimeout(async () => {
        await onToggle(task.id, false);
        setIsCompleting(false);
      }, 800);
    } else {
      setIsUndoing(true);
      setTimeout(async () => {
        await onToggle(task.id);
        setIsUndoing(false);
      }, 200);
    }
  };

  const handleFeedbackClose = async () => {
    setShowFeedback(false);
    setFeedbackTask(null);
    setIsCompleting(true);
    setTimeout(async () => {
      await onToggle(task.id, false);
      setIsCompleting(false);
    }, 800);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => onDelete(task.id), 500);
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

  const dueDateText = formatDueDate(task.dueDate, task.completed);

  return (
    <>
      <Card className={cn(
        "border border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in overflow-hidden",
        !isReorderMode && "transition-colors duration-150 hover:border-primary/20",
        selected && "border-primary/40 bg-primary/5",
        isCompleting && "animate-task-complete",
        isDeleting && "animate-task-poof",
        isUndoing && "animate-task-undo"
      )}>
        {/* Main row */}
        <div className="flex items-center gap-3 px-4 py-4">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggle}
            className={cn(
              "w-5 h-5 flex-shrink-0 data-[state=checked]:bg-success data-[state=checked]:border-success transition-colors duration-150",
              isCompleting && "animate-checkbox-check"
            )}
          />

          {/* Priority dot */}
          <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getPriorityColor(task.priority))} />

          {/* Title + meta */}
          <div
            className="flex-1 min-w-0 cursor-pointer py-0.5"
            onClick={() => { if (!task.completed && !isEditing) onSelect?.(task.id); }}
          >
            <p className={cn(
              "text-sm font-medium leading-snug",
              task.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              {task.title}
            </p>
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              {task.subject && (
                <span className="text-xs text-primary/80 font-medium">
                  {getDisplayName(task.subject)}
                </span>
              )}
              {dueDateText && (
                <span className={cn(
                  "text-xs flex items-center gap-1",
                  displayStatus === 'overdue' ? "text-error font-medium" :
                  dueDateText === 'Due today' ? "text-warning font-medium" : "text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3" />
                  {dueDateText}
                </span>
              )}
            </div>
          </div>

          {/* Status badge — click to cycle */}
          {!task.completed && (
            <Badge
              variant="outline"
              onClick={handleStatusClick}
              className={cn(
                "text-xs border flex-shrink-0 cursor-pointer select-none transition-all hover:opacity-80 active:scale-95",
                getStatusStyle(displayStatus)
              )}
              title="Click to change status"
            >
              {getStatusLabel(displayStatus)}
            </Badge>
          )}
          {task.completed && (
            <Badge variant="outline" className={cn("text-xs border flex-shrink-0", getStatusStyle('completed'))}>
              Done
            </Badge>
          )}

          {/* Edit + Delete */}
          {!isReorderMode && !task.completed && (
            <button
              onClick={openEdit}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all",
                isEditing ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {!isReorderMode && (
            <button
              onClick={handleDelete}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-all flex-shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Edit panel */}
        {isEditing && (
          <div
            className="border-t border-border/40 bg-muted/20 px-4 py-3 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Title</label>
              <Input
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(e as any); if (e.key === 'Escape') cancelEdit(e as any); }}
                className="h-8 text-sm"
                autoFocus
              />
            </div>

            {/* Subject + Priority */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Subject</label>
                <Input
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  placeholder="e.g. Maths"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Priority</label>
                <Select value={priorityInput} onValueChange={(v) => setPriorityInput(v as Task['priority'])}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-error" />High</div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning" />Medium</div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success" />Low</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Due date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="h-8 w-full px-3 text-sm rounded-md border border-input bg-background text-left flex items-center gap-2 hover:bg-muted/40 transition-all">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className={dateInput ? "text-foreground" : "text-muted-foreground"}>
                      {dateInput ? format(dateInput, 'MMM d, yyyy') : 'Pick a date'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateInput} onSelect={setDateInput} initialFocus />
                  {dateInput && (
                    <div className="p-2 border-t">
                      <Button variant="outline" size="sm" className="w-full text-xs"
                        onClick={() => setDateInput(undefined)}>
                        Remove date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" className="h-7 px-3 text-xs gap-1.5" onClick={saveEdit}>
                <Save className="h-3 w-3" /> Save
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs gap-1.5 text-muted-foreground" onClick={cancelEdit}>
                <X className="h-3 w-3" /> Cancel
              </Button>
            </div>
          </div>
        )}
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
