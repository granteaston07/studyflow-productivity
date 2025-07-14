import { useState } from "react";
import { Plus, Calendar, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Task } from "./TaskCard";

interface AddTaskDialogProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

export function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    subject: '',
    priority: 'medium' as Task['priority'],
    dueDate: undefined as Date | undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskData.title.trim()) return;

    const newTask: Omit<Task, 'id'> = {
      title: taskData.title.trim(),
      subject: taskData.subject || undefined,
      dueDate: taskData.dueDate,
      completed: false,
      priority: taskData.priority,
      status: taskData.dueDate && taskData.dueDate < new Date() ? 'overdue' : 'pending'
    };

    onAddTask(newTask);
    
    // Reset form and close dialog
    setTaskData({
      title: '',
      subject: '',
      priority: 'medium',
      dueDate: undefined
    });
    setOpen(false);
  };

  const subjects = [
    'Math',
    'Science',
    'English',
    'Spanish',
    'History',
    'Personal'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Task
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              id="task-title"
              placeholder="Complete math homework, study for quiz..."
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              required
            />
          </div>

          {/* Subject and Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={taskData.subject}
                onValueChange={(value) => setTaskData({ ...taskData, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {subject}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
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
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-error"></div>
                      High
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}