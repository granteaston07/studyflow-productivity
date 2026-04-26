import { Calendar, Pencil, X, ChevronDown, Repeat } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { useState, useRef } from "react";
import { TaskCompletionFeedback } from "./TaskCompletionFeedback";
import { useCustomSubjects } from "@/hooks/useCustomSubjects";
import { useSubtasks } from "@/hooks/useSubtasks";
import { Button } from "@/components/ui/button";

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
  statusMode?: boolean;
}

function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'high':   return 'bg-error';
    case 'medium': return 'bg-warning';
    case 'low':    return 'bg-success';
    default:       return 'bg-muted-foreground/40';
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
  isGuest = false, selected = false, onSelect, isReorderMode = false, statusMode = false,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTask, setFeedbackTask] = useState<Task | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [titleInput, setTitleInput] = useState(task.title);
  const [subjectInput, setSubjectInput] = useState(task.subject || '');
  const [priorityInput, setPriorityInput] = useState<Task['priority']>(task.priority);
  const [dateInput, setDateInput] = useState<Date | undefined>(task.dueDate);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const { getDisplayName, allSubjects } = useCustomSubjects();
  const { subtasks, addSubtask, toggleSubtask, deleteSubtask, completedCount } = useSubtasks(task.id);

  const dueDateText = formatDueDate(task.dueDate, task.completed);
  const isOverdue = task.status === 'overdue' && !task.completed;

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

  const openEdit = () => {
    setTitleInput(task.title);
    setSubjectInput(task.subject || '');
    setPriorityInput(task.priority);
    setDateInput(task.dueDate);
    setEditOpen(true);
  };

  const saveEdit = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== task.title) onUpdateTitle?.(task.id, trimmed);
    const sub = subjectInput.trim();
    if (sub !== (task.subject || '')) onUpdateSubject?.(task.id, sub || 'General');
    if (priorityInput !== task.priority) onUpdatePriority?.(task.id, priorityInput);
    if (dateInput !== task.dueDate) onUpdateDueDate(task.id, dateInput);
    setEditOpen(false);
  };

  const handleDelete = () => {
    setEditOpen(false);
    setIsDeleting(true);
    setTimeout(() => onDelete(task.id), 400);
  };

  return (
    <>
      <div className={cn(
        "rounded-2xl bg-card/70 backdrop-blur-sm border border-border/40 overflow-hidden",
        isCompleting && "animate-task-complete",
        isDeleting && "animate-task-poof",
        isUndoing && "animate-task-undo",
      )}>
        {/* Main row */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 min-h-[52px]">
          {/* Checkbox */}
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggle}
            className={cn(
              "w-[18px] h-[18px] flex-shrink-0 rounded-full data-[state=checked]:bg-success data-[state=checked]:border-success transition-colors duration-150",
              isCompleting && "animate-checkbox-check"
            )}
          />

          {/* Priority dot */}
          <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5", getPriorityColor(task.priority))} />

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium leading-tight",
              task.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              {task.title}
            </p>
            {(task.subject || dueDateText || (task.recurring && task.recurring !== 'none')) && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight flex items-center gap-1.5 flex-wrap">
                {task.subject && (
                  <span className="text-primary/70 font-medium">{getDisplayName(task.subject)}</span>
                )}
                {task.subject && dueDateText && <span>·</span>}
                {dueDateText && (
                  <span className={cn(
                    isOverdue ? "text-error font-semibold" :
                    dueDateText === 'Due today' ? "text-warning font-semibold" : ""
                  )}>
                    {dueDateText}
                  </span>
                )}
                {task.recurring && task.recurring !== 'none' && (
                  <Repeat className="h-2.5 w-2.5 text-primary/60" />
                )}
              </p>
            )}
          </div>

          {/* Status mode: cycle pill instead of subtask/edit */}
          {statusMode && !task.completed ? (
            <button
              onClick={() => {
                const next = task.status === 'in-progress' ? 'pending' : 'in-progress';
                onUpdateStatus(task.id, next);
              }}
              className={cn(
                "flex-shrink-0 h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-all active:scale-95",
                task.status === 'in-progress'
                  ? 'bg-primary/10 text-primary border-primary/25'
                  : task.status === 'overdue'
                    ? 'bg-error/10 text-error border-error/25'
                    : 'bg-muted/50 text-muted-foreground border-border/40'
              )}
            >
              {task.status === 'in-progress' ? 'In Progress' : task.status === 'overdue' ? 'Overdue' : 'To Do'}
            </button>
          ) : (
            <>
              {/* Subtask toggle */}
              {!task.completed && !statusMode && (
                <button
                  onClick={() => setSubtasksOpen(v => !v)}
                  className={cn(
                    "flex items-center gap-0.5 px-1.5 py-1.5 rounded-lg flex-shrink-0 transition-all active:bg-muted/60",
                    subtasksOpen ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", subtasksOpen && "rotate-180")} />
                  {subtasks.length > 0 && (
                    <span className="text-[10px] font-semibold">{completedCount}/{subtasks.length}</span>
                  )}
                </button>
              )}

              {/* Edit button */}
              {!task.completed && !isReorderMode && !statusMode && (
                <button
                  onClick={openEdit}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground active:bg-muted/60 flex-shrink-0 transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Subtasks panel */}
        {subtasksOpen && !task.completed && (
          <div className="border-t border-border/30 bg-muted/20 px-3 py-2 space-y-1">
            {subtasks.map(st => (
              <div key={st.id} className="flex items-center gap-2 py-1">
                <Checkbox
                  checked={st.completed}
                  onCheckedChange={() => toggleSubtask(st.id)}
                  className="w-4 h-4 flex-shrink-0 rounded data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                <span className={cn("text-xs flex-1 leading-tight", st.completed ? "line-through text-muted-foreground" : "text-foreground")}>
                  {st.title}
                </span>
                <button onClick={() => deleteSubtask(st.id)} className="text-muted-foreground active:text-error transition-colors p-1 flex-shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <input
                ref={subtaskInputRef}
                value={newSubtaskInput}
                onChange={e => setNewSubtaskInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newSubtaskInput.trim()) {
                    addSubtask(newSubtaskInput.trim());
                    setNewSubtaskInput('');
                  }
                }}
                placeholder="Add subtask..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                style={{ fontSize: '16px' }}
              />
              {newSubtaskInput.trim() && (
                <button
                  onClick={() => { addSubtask(newSubtaskInput.trim()); setNewSubtaskInput(''); }}
                  className="text-primary text-xs font-semibold px-2 py-1"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl overflow-y-auto" style={{ maxHeight: '90vh' }}>
          <SheetHeader className="mb-5">
            <SheetTitle className="text-left text-lg font-bold">Edit Task</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-8">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</Label>
              <input
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                className="w-full bg-muted/40 rounded-xl px-4 py-3 border border-border/50 outline-none focus:border-primary/50 text-foreground font-medium"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</Label>
              <Select value={subjectInput} onValueChange={setSubjectInput}>
                <SelectTrigger className="rounded-xl border-border/50" style={{ fontSize: '16px' }}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.map(s => (
                    <SelectItem key={s} value={s}>{getDisplayName(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</Label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as Task['priority'][]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriorityInput(p)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-medium border capitalize transition-all",
                      priorityInput === p
                        ? p === 'high' ? 'bg-error/15 text-error border-error/30'
                          : p === 'medium' ? 'bg-warning/15 text-warning border-warning/30'
                          : 'bg-success/15 text-success border-success/30'
                        : 'bg-muted/30 text-muted-foreground border-border/40'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/40 border border-border/50 text-left" style={{ fontSize: '16px' }}>
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className={dateInput ? "text-foreground" : "text-muted-foreground"}>
                      {dateInput ? format(dateInput, 'MMM d, yyyy') : 'No due date'}
                    </span>
                    {dateInput && (
                      <button
                        onClick={e => { e.stopPropagation(); setDateInput(undefined); }}
                        className="ml-auto text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateInput}
                    onSelect={setDateInput}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Save */}
            <Button
              onClick={saveEdit}
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              Save Changes
            </Button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="w-full h-12 rounded-xl text-error border border-error/20 bg-error/5 text-sm font-semibold transition-all active:bg-error/10"
            >
              Delete Task
            </button>
          </div>
        </SheetContent>
      </Sheet>

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
