import { useState, useEffect } from "react";
import { Calendar, BookOpen, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function EditTaskDialog({ task, open, onClose, onUpdate }: EditTaskDialogProps) {
  const [taskData, setTaskData] = useState({
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
  
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('customSubjects');
    if (saved) {
      setCustomSubjects(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setTaskData({
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
  }, [task]);

  const defaultSubjects = [
    'Math',
    'Science', 
    'English',
    'Spanish',
    'History',
    'Personal'
  ];

  const allSubjects = [...defaultSubjects, ...customSubjects];

  const handleAddCustomSubject = () => {
    if (customSubjectInput.trim() && !allSubjects.includes(customSubjectInput.trim())) {
      const newCustomSubjects = [...customSubjects, customSubjectInput.trim()];
      setCustomSubjects(newCustomSubjects);
      localStorage.setItem('customSubjects', JSON.stringify(newCustomSubjects));
      setTaskData({ ...taskData, subject: customSubjectInput.trim() });
      setCustomSubjectInput('');
      setShowCustomInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskData.title.trim()) return;

    const updates: Partial<Task> = {
      title: taskData.title.trim(),
      subject: taskData.subject || 'General',
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      repeatType: taskData.repeatType,
      repeatInterval: taskData.repeatInterval,
      repeatEndDate: taskData.repeatEndDate,
      repeatCount: taskData.repeatCount
    };

    onUpdate(task.id, updates);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Task Title *</Label>
            <Input
              id="edit-task-title"
              placeholder="Complete math homework, study for quiz..."
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description</Label>
            <Textarea
              id="edit-task-description"
              placeholder="Add task details..."
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Subject and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-subject">Subject</Label>
              <Select
                value={taskData.subject}
                onValueChange={(value) => {
                  if (value === 'add-custom') {
                    setShowCustomInput(true);
                  } else {
                    setTaskData({ ...taskData, subject: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {subject}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="add-custom">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Custom Subject
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {showCustomInput && (
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="Enter custom subject"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomSubject}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomSubjectInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-priority">Priority</Label>
              <Select
                value={taskData.priority}
                onValueChange={(value: Task['priority']) => setTaskData({ ...taskData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      Low Priority
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      Medium Priority
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-error"></div>
                      High Priority
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {taskData.dueDate ? (
                    format(taskData.dueDate, "PPP")
                  ) : (
                    <span>Pick a due date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={taskData.dueDate}
                  onSelect={(date) => setTaskData({ ...taskData, dueDate: date })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {taskData.dueDate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTaskData({ ...taskData, dueDate: undefined })}
                className="text-xs"
              >
                Remove Due Date
              </Button>
            )}
          </div>

          {/* Repeat Options */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-medium">Repeat Options</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-repeat-type">Frequency</Label>
                <Select
                  value={taskData.repeatType}
                  onValueChange={(value: Task['repeatType']) => setTaskData({ ...taskData, repeatType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Only Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {taskData.repeatType !== 'none' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-repeat-interval">Every</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={taskData.repeatInterval}
                      onChange={(e) => setTaskData({ ...taskData, repeatInterval: parseInt(e.target.value) || 1 })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {taskData.repeatType === 'daily' ? 'day(s)' :
                       taskData.repeatType === 'weekly' ? 'week(s)' :
                       taskData.repeatType === 'monthly' ? 'month(s)' :
                       taskData.repeatType === 'yearly' ? 'year(s)' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {taskData.repeatType !== 'none' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {taskData.repeatEndDate ? (
                          format(taskData.repeatEndDate, "PPP")
                        ) : (
                          <span>Select end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={taskData.repeatEndDate}
                        onSelect={(date) => setTaskData({ ...taskData, repeatEndDate: date })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {taskData.repeatEndDate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTaskData({ ...taskData, repeatEndDate: undefined })}
                      className="text-xs"
                    >
                      Remove End Date
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-repeat-count">Max Occurrences (Optional)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={taskData.repeatCount || ''}
                    onChange={(e) => setTaskData({ ...taskData, repeatCount: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Update Task
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}