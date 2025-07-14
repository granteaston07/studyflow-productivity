import { useState, useEffect } from "react";
import { Brain, CheckSquare, Timer, Plus } from "lucide-react";
import { TaskCard, Task } from "@/components/TaskCard";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskPrioritization } from "@/components/TaskPrioritization";
import { ProgressTracker } from "@/components/ProgressTracker";
import { FocusTimer } from "@/components/FocusTimer";
import { StudyLinks } from "@/components/StudyLinks";
import { QuickNotes } from "@/components/QuickNotes";
import { FloatingStatus } from "@/components/FloatingStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TasklyLogo } from "@/components/TasklyLogo";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Update timer state from FocusTimer component
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).timerState) {
        const { isActive, timeLeft } = (window as any).timerState;
        setTimerActive(isActive);
        setTimeRemaining(timeLeft);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              completed: !task.completed,
              status: !task.completed ? 'completed' : 
                     task.dueDate && task.dueDate < new Date() ? 'overdue' : 'pending'
            }
          : task
      )
    );
  };

  const handleUpdateDueDate = (taskId: string, dueDate: Date | undefined) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              dueDate,
              status: dueDate && dueDate < new Date() ? 'overdue' : 'pending'
            }
          : task
      )
    );
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString()
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleUpdateStatus = (taskId: string, status: Task['status']) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const overdueTasks = tasks.filter(task => task.status === 'overdue');
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = task.dueDate;
    return taskDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2">
                <TasklyLogo size={40} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Taskly</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Student Productivity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {overdueTasks.length > 0 && (
                <Badge variant="destructive" className="bg-error text-error-foreground animate-pulse">
                  {overdueTasks.length} overdue
                </Badge>
              )}
              {todayTasks.length > 0 && (
                <Badge variant="secondary" className="bg-warning-light text-warning">
                  {todayTasks.length} due today
                </Badge>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-ai-primary bg-clip-text text-transparent">
              Welcome back! Let's stay productive.
            </h2>
            <p className="text-muted-foreground">
              You have {activeTasks.length} active tasks • AI recommendations ready
            </p>
          </div>

          {/* Tasks Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Your Tasks</h3>
              </div>
              <AddTaskDialog onAddTask={handleAddTask} />
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks yet. Add your first task to get started!</p>
                </div>
              ) : (
                [...tasks]
                  .sort((a, b) => {
                    // Sort completed tasks to bottom
                    if (a.completed && !b.completed) return 1;
                    if (!a.completed && b.completed) return -1;
                    return 0;
                  })
                  .map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                    onToggle={handleToggleTask}
                    onUpdateDueDate={handleUpdateDueDate}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteTask}
                    />
                  ))
              )}
            </div>
          </section>

          {/* AI Task Prioritization */}
          <section>
            <TaskPrioritization tasks={tasks} />
          </section>


          {/* Two Column Layout for Progress and Study Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress Tracker */}
            <div id="progress-tracker">
              <ProgressTracker tasks={tasks} />
            </div>
            
            {/* Study Links and Quick Notes Column */}
            <div className="space-y-8">
              <StudyLinks />
              <QuickNotes />
            </div>
          </div>

          {/* Focus Timer */}
          <section id="focus-timer">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Focus Session</h3>
            </div>
            <FocusTimer />
          </section>

          {/* Quick Stats Footer */}
          <footer className="pt-8 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">{tasks.length}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-success">{tasks.filter(t => t.completed).length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-warning">{tasks.filter(t => t.status === 'in-progress').length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-error">{overdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
            
            <div className="text-center mt-8 pt-6 border-t border-border">
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-foreground">Built for Students</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Made in 2025</span>
                  <span>•</span>
                  <span>Created by Grant Easton</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
      
      {/* Floating Status Window */}
      <FloatingStatus 
        tasks={tasks} 
        timerActive={timerActive} 
        timeRemaining={timeRemaining} 
      />
    </div>
  );
};

export default Index;
