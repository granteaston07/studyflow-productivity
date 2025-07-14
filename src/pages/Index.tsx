import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { TaskPrioritization } from '@/components/TaskPrioritization';
import { ProgressTracker } from '@/components/ProgressTracker';
import { StudyLinks } from '@/components/StudyLinks';
import { QuickNotes } from '@/components/QuickNotes';
import { FocusTimer } from '@/components/FocusTimer';
import { FloatingStatus } from '@/components/FloatingStatus';
import { AIStudySuggestions } from '@/components/AIStudySuggestions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useTasks, Task } from '@/hooks/useTasks';
import { Clock, Calendar, Star, GraduationCap, AlertCircle, CheckCircle2, BookOpen, LogOut, User, Loader2 } from 'lucide-react';
import { format, isToday, isPast, startOfDay } from 'date-fns';
import tasklyLogo from '@/assets/taskly-logo.png';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking auth or loading tasks
  if (loading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Listen to timer updates
  useEffect(() => {
    const handleTimerUpdate = (event: CustomEvent) => {
      setTimerActive(event.detail.active);
      setTimeRemaining(event.detail.timeRemaining);
    };

    window.addEventListener('timerUpdate', handleTimerUpdate as EventListener);
    return () => window.removeEventListener('timerUpdate', handleTimerUpdate as EventListener);
  }, []);

  const handleToggleTask = (taskId: string) => {
    toggleTask(taskId);
  };

  const handleUpdateDueDate = (taskId: string, dueDate: Date | undefined) => {
    updateTask(taskId, { dueDate });
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addTask(newTaskData);
  };

  const handleUpdateStatus = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  // Filter tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const overdueTasks = tasks.filter(task => task.status === 'overdue' || (task.dueDate && isPast(startOfDay(task.dueDate)) && !task.completed));
  const todayTasks = tasks.filter(task => task.dueDate && isToday(task.dueDate) && !task.completed);

  // Sort tasks with completed at bottom
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={tasklyLogo} alt="Taskly" className="h-10 w-10 animate-float" />
              <div className="animate-slide-up">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:animate-pulse-glow transition-all duration-300">
                  Taskly
                </h1>
                <p className="text-sm text-muted-foreground animate-fade-in">AI-Powered Student Productivity</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground animate-slide-down">
              Welcome, {user?.user_metadata?.display_name || user?.email}
            </span>
            <div className="animate-bounce-in">
              <ThemeToggle />
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="hover:animate-wiggle">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between animate-slide-down">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">Your Tasks</h2>
                <div className="flex gap-2">
                  {overdueTasks.length > 0 && (
                    <Badge variant="destructive" className="gap-1 animate-bounce-in">
                      <AlertCircle className="h-3 w-3" />
                      {overdueTasks.length} overdue
                    </Badge>
                  )}
                  {todayTasks.length > 0 && (
                    <Badge variant="secondary" className="gap-1 animate-bounce-in">
                      <Clock className="h-3 w-3" />
                      {todayTasks.length} due today
                    </Badge>
                  )}
                </div>
              </div>
              <div className="animate-rotate-bounce">
                <AddTaskDialog onAddTask={handleAddTask} />
              </div>
            </div>

            <div className="space-y-4">
              {sortedTasks.map((task, index) => (
                <div key={task.id} className="animate-slide-up hover:animate-pulse-glow transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <TaskCard
                    task={task}
                    onToggle={handleToggleTask}
                    onUpdateDueDate={handleUpdateDueDate}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground animate-bounce-in">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50 animate-float" />
                  <p>No tasks yet. Add your first task to get started!</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="animate-slide-down" style={{ animationDelay: '0.2s' }}>
              <TaskPrioritization tasks={tasks} />
            </div>
            <div className="animate-slide-down" style={{ animationDelay: '0.4s' }}>
              <ProgressTracker tasks={tasks} />
            </div>
            <div className="animate-slide-down" style={{ animationDelay: '0.6s' }}>
              <StudyLinks />
            </div>
            <div className="animate-slide-down" style={{ animationDelay: '0.8s' }}>
              <QuickNotes />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary animate-wiggle" />
              <h3 className="text-xl font-semibold">AI Study Suggestions</h3>
            </div>
            <AIStudySuggestions tasks={tasks} />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '1.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="text-xl font-semibold">Focus Timer</h3>
            </div>
            <FocusTimer />
          </div>
        </div>

        <footer className="text-center py-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: '1.5s' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="animate-bounce-in" style={{ animationDelay: '1.6s' }}>
              <div className="text-2xl font-bold text-primary">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '1.7s' }}>
              <div className="text-2xl font-bold text-success">{tasks.filter(t => t.completed).length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '1.8s' }}>
              <div className="text-2xl font-bold text-warning">{tasks.filter(t => t.status === 'in-progress').length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '1.9s' }}>
              <div className="text-2xl font-bold text-error">{overdueTasks.length}</div>   
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-shimmer">
            Made in 2025 • Built with ❤️ for students
          </p>
        </footer>
      </div>

      <FloatingStatus 
        tasks={tasks} 
        timerActive={timerActive} 
        timeRemaining={timeRemaining} 
      />
    </div>
  );
}