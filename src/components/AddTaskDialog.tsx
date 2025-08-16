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
import { useCustomSubjects } from "@/hooks/useCustomSubjects";

interface AddTaskDialogProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => void;
}

export function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    subject: '',
    priority: 'medium' as Task['priority'],
    dueDate: undefined as Date | undefined
  });
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const { allSubjects, addCustomSubject } = useCustomSubjects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskData.title.trim()) return;

      onAddTask({
        title: taskData.title.trim(),
        subject: taskData.subject || 'General',
        description: undefined,
        dueDate: taskData.dueDate,
        completed: false,
        priority: taskData.priority,
        status: (() => {
          if (!taskData.dueDate) return 'pending';
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const d = new Date(taskData.dueDate.getFullYear(), taskData.dueDate.getMonth(), taskData.dueDate.getDate());
          return d < today ? 'overdue' : 'pending';
        })(),
        completedAt: undefined
      });
    
    // Reset form and close dialog
    setTaskData({
      title: '',
      subject: '',
      priority: 'medium',
      dueDate: undefined
    });
    setOpen(false);
  };

  const handleAddCustomSubject = async () => {
    if (customSubjectInput.trim()) {
      const success = await addCustomSubject(customSubjectInput.trim());
      if (success) {
        setTaskData({ ...taskData, subject: customSubjectInput.trim() });
        setCustomSubjectInput('');
        setShowCustomInput(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-ai-primary text-primary-foreground hover:from-primary/90 hover:to-ai-primary/90 shadow-lg flex items-center gap-2">
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
              <div className="space-y-2">
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
                    <SelectValue placeholder="Select" />
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
                        Add Custom
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {showCustomInput && (
                  <div className="space-y-2">
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
          <Button type="submit" className="bg-gradient-to-r from-primary to-ai-primary text-primary-foreground hover:from-primary/90 hover:to-ai-primary/90 shadow-lg w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}