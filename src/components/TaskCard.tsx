import { Check, Clock, AlertTriangle, Calendar, Edit, Trash2, Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { useState, useEffect } from "react";

export type { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onUpdate, onDelete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    subject: task.subject,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate,
    repeatType: task.repeatType || 'none',
    repeatInterval: task.repeatInterval || 1,
    repeatEndDate: task.repeatEndDate,
    repeatCount: task.repeatCount
  });

  const handleToggle = () => {
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons, badges, or other interactive elements
    if ((e.target as HTMLElement).closest('button, [role="button"], .checkbox')) {
      return;
    }
    handleToggle();
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(task.id);
    }, 500);
  };

  const handleSaveEdit = () => {
    onUpdate(task.id, {
      title: editForm.title,
      subject: editForm.subject,
      description: editForm.description,
      priority: editForm.priority,
      dueDate: editForm.dueDate,
      repeatType: editForm.repeatType,
      repeatInterval: editForm.repeatInterval,
      repeatEndDate: editForm.repeatEndDate,
      repeatCount: editForm.repeatCount
    });
    setShowEditDialog(false);
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

  const getRepeatLabel = () => {
    if (!task.repeatType || task.repeatType === 'none') return null;
    const interval = task.repeatInterval || 1;
    const type = task.repeatType;
    
    if (interval === 1) {
      return `Every ${type}`;
    } else {
      return `Every ${interval} ${type}s`;
    }
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-200 hover:shadow-lg border border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm animate-fade-in hover:scale-[1.02] cursor-pointer",
      isCompleting && "animate-task-complete",
      isDeleting && "animate-task-poof"
    )}
    onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          className={cn(
            "mt-1 w-6 h-6 data-[state=checked]:bg-success data-[state=checked]:border-success transition-all duration-300 checkbox",
            isCompleting && "animate-checkbox-check"
          )}
          onClick={(e) => e.stopPropagation()}
        />
        
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
                    onUpdate(task.id, { status: 'in-progress' });
                  } else if (task.status === 'in-progress') {
                    onUpdate(task.id, { status: 'pending' });
                  }
                }}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(task.status)}
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                </span>
              </Badge>
              
              {/* Edit Task Button */}
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-subject">Subject</Label>
                      <Input
                        id="edit-subject"
                        value={editForm.subject}
                        onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-priority">Priority</Label>
                      <Select value={editForm.priority} onValueChange={(value: Task['priority']) => setEditForm(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {editForm.dueDate ? format(editForm.dueDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={editForm.dueDate}
                            onSelect={(date) => setEditForm(prev => ({ ...prev, dueDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-repeat">Repeat</Label>
                      <Select value={editForm.repeatType} onValueChange={(value: Task['repeatType']) => setEditForm(prev => ({ ...prev, repeatType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No repeat</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {editForm.repeatType && editForm.repeatType !== 'none' && (
                      <>
                        <div>
                          <Label htmlFor="edit-interval">Every</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="edit-interval"
                              type="number"
                              min="1"
                              value={editForm.repeatInterval}
                              onChange={(e) => setEditForm(prev => ({ ...prev, repeatInterval: parseInt(e.target.value) || 1 }))}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">
                              {editForm.repeatType}{editForm.repeatInterval !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>End Date (optional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {editForm.repeatEndDate ? format(editForm.repeatEndDate, "PPP") : <span>Never</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={editForm.repeatEndDate}
                                onSelect={(date) => setEditForm(prev => ({ ...prev, repeatEndDate: date }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-count">Or limit to occurrences</Label>
                          <Input
                            id="edit-count"
                            type="number"
                            min="1"
                            value={editForm.repeatCount || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, repeatCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            placeholder="Unlimited"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveEdit} className="flex-1">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
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
            {getRepeatLabel() && (
              <div className="flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                <span className="text-xs">
                  {getRepeatLabel()}
                </span>
              </div>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}