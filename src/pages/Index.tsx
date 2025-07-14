import { useState, useEffect } from "react";
import { Brain, CheckSquare, Timer, Plus, LogOut, GraduationCap } from "lucide-react";
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
import { StudyMode } from "@/components/StudyMode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  // Timer state management at parent level
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [selectedSessionDuration, setSelectedSessionDuration] = useState(25 * 60); // 25 minutes default
  const [selectedSession, setSelectedSession] = useState<any>({ type: 'work', duration: 25, label: 'Homework' });
  const [studyMode, setStudyMode] = useState(false);
  
  // Timer logic - runs independently of which component is displayed
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive && !timerPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      setTimerActive(false);
      // Timer completed - could trigger notification here
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerPaused, timeRemaining]);

  // Timer control functions
  const startTimer = (duration?: number) => {
    if (duration && !timerActive) {
      setTimeRemaining(duration);
      setSelectedSessionDuration(duration);
    }
    setTimerActive(true);
    setTimerPaused(false);
  };

  const updateTimerDuration = (duration: number) => {
    if (!timerActive) {
      setTimeRemaining(duration);
      setSelectedSessionDuration(duration);
    }
  };

  const pauseTimer = () => {
    setTimerPaused(!timerPaused);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerPaused(false);
    setTimeRemaining(selectedSessionDuration);
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId);
  };

  const handleUpdateDueDate = async (taskId: string, dueDate: Date | undefined) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine the new status based on the due date
    let newStatus = task.status;
    const now = new Date();
    
    if (dueDate) {
      // If setting a due date
      if (dueDate < now && !task.completed) {
        // Past due date and not completed = overdue
        newStatus = 'overdue';
      } else if (task.status === 'overdue' && dueDate >= now) {
        // Was overdue but now has future date = reset to pending or in-progress
        newStatus = task.completed ? 'completed' : 'pending';
      }
    } else {
      // If removing due date and was overdue, reset to pending
      if (task.status === 'overdue') {
        newStatus = task.completed ? 'completed' : 'pending';
      }
    }

    // Update both due date and status if status changed
    if (newStatus !== task.status) {
      await updateTask(taskId, { dueDate, status: newStatus });
    } else {
      await updateTask(taskId, { dueDate });
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addTask(newTaskData);
  };

  const handleUpdateStatus = async (taskId: string, status: Task['status']) => {
    await updateTask(taskId, { status });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const activeTasks = tasks.filter(task => !task.completed);
  
  // Check for overdue tasks by comparing due date to current time
  const now = new Date();
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate < now;
  });
  
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    const taskDate = task.dueDate;
    return taskDate.toDateString() === today.toDateString() && task.dueDate >= now;
  });

  const handleExitStudyMode = () => {
    setStudyMode(false);
  };

  // If study mode is active, show the StudyMode component
  if (studyMode) {
    return (
      <StudyMode
        tasks={tasks}
        timerActive={timerActive}
        timeRemaining={timeRemaining}
        timerPaused={timerPaused}
        onExit={handleExitStudyMode}
        onPauseTimer={pauseTimer}
        onResetTimer={resetTimer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2">
                <TasklyLogo size={48} />
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStudyMode(true)}
                className="hover:bg-ai-primary/10 hover:text-ai-primary hover:border-ai-primary/30"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Study Mode
              </Button>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut()}
                className="hover:bg-error/10 hover:text-error hover:border-error/30"
              >
                <LogOut className="h-4 w-4" />
              </Button>
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
              Welcome back{user?.user_metadata?.display_name ? ` ${user.user_metadata.display_name}` : ''}! Let's stay productive.
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
            <FocusTimer 
              timerActive={timerActive}
              timeRemaining={timeRemaining}
              timerPaused={timerPaused}
              onStartTimer={startTimer}
              onUpdateDuration={updateTimerDuration}
              onPauseTimer={pauseTimer}
              onResetTimer={resetTimer}
              selectedSession={selectedSession}
              onSessionChange={setSelectedSession}
            />
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
            
            <div className="text-center mt-8 pt-6 border-t border-border space-y-6">
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-foreground">Created by Grant Easton</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Built for Students</span>
                  <span>•</span>
                  <span>Made in 2025</span>
                  <span>•</span>
                  <span>No Distractions</span>
                </div>
              </div>
              
              {/* Legal and Privacy Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                  <button className="hover:text-foreground transition-colors">Privacy Policy</button>
                  <span>•</span>
                  <button className="hover:text-foreground transition-colors">Terms of Service</button>
                  <span>•</span>
                  <button className="hover:text-foreground transition-colors">Cookie Policy</button>
                  <span>•</span>
                  <button className="hover:text-foreground transition-colors">Data Protection</button>
                </div>
                
                <div className="text-xs text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                  <p className="mb-2">
                    Taskly is committed to protecting your privacy and ensuring the security of your personal data. 
                    We collect and process information in accordance with applicable data protection laws.
                  </p>
                  <p className="mb-2">
                    Your tasks, notes, and study data are securely stored and encrypted. We do not share your personal 
                    information with third parties without your explicit consent, except as required by law.
                  </p>
                  <p>
                    By using Taskly, you agree to our Terms of Service and Privacy Policy. 
                    If you have questions about data handling, please contact us.
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground/80">
                  <p>© 2025 Taskly. All Rights Reserved.</p>
                  <p className="mt-1">Educational use only. Not affiliated with any educational institution.</p>
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
