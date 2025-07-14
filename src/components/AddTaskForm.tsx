import { useState, useEffect } from "react";
import { Plus, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Task } from "./TaskCard";

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [taskData, setTaskData] = useState({
    title: '',
    subject: '',
    priority: 'medium' as Task['priority'],
    dueDate: undefined as Date | undefined
  });
  
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');

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
    
    // Reset form
    setTaskData({
      title: '',
      subject: '',
      priority: 'medium',
      dueDate: undefined
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('customSubjects');
    if (saved) {
      setCustomSubjects(JSON.parse(saved));
    }
  }, []);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-subject">Subject</Label>
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
              <Label htmlFor="task-priority">Priority</Label>
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
      </CardContent>
    </Card>
  );
}