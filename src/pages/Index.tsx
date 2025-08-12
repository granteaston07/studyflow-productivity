import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Brain, CheckSquare, Timer, Plus, LogOut, GraduationCap, LogIn, ArrowUpDown, Check } from "lucide-react";
import { TaskCard, Task } from "@/components/TaskCard";
import { DraggableTaskCard } from "@/components/DraggableTaskCard";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskPrioritization } from "@/components/TaskPrioritization";
import { ProgressTracker } from "@/components/ProgressTracker";
import { FocusTimer } from "@/components/FocusTimer";
import { StudyLinks } from "@/components/StudyLinks";
import { QuickNotes } from "@/components/QuickNotes";
import { FloatingStatus } from "@/components/FloatingStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudyFlowLogo } from "@/components/StudyFlowLogo";
import { StudyMode } from "@/components/StudyMode";
// import { StudyCalendar } from "@/components/StudyCalendar";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { LearningInsightsDashboard } from "@/components/LearningInsightsDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
// import { useStudyGoals } from "@/hooks/useStudyGoals";

const Index = () => {
  // Allow both authenticated users and guest mode (no redirect for guest users)
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, toggleTask, reorderTasks } = useTasks();
  // const { goals: studyGoals } = useStudyGoals();
  const [isReorderMode, setIsReorderMode] = useState(false);
  // Timer state management at parent level
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [selectedSessionDuration, setSelectedSessionDuration] = useState(25 * 60); // 25 minutes default
  const [selectedSession, setSelectedSession] = useState<any>({ type: 'work', duration: 25, label: 'Homework' });
  const [studyMode, setStudyMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Clear selection if the selected task becomes completed or disappears
  useEffect(() => {
    if (selectedTaskId) {
      const t = tasks.find(t => t.id === selectedTaskId);
      if (!t || t.completed) setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      const newOrder = arrayMove(tasks, oldIndex, newIndex);
      reorderTasks(newOrder);
    }
  };

  const handleToggleTask = async (taskId: string, showFeedback: boolean = false) => {
    const result = await toggleTask(taskId, showFeedback);
    if (result?.task?.completed) {
      setSelectedTaskId(prev => (prev === taskId ? null : prev));
    }
    return result;
  };

  const handleUpdateDueDate = async (taskId: string, dueDate: Date | undefined) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine the new status based on the due date (day-level)
    let newStatus = task.status;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dueDate) {
      const d = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      if (d < today && !task.completed) {
        newStatus = 'overdue';
      } else if (task.status === 'overdue' && d >= today) {
        newStatus = task.completed ? 'completed' : 'pending';
      }
    } else {
      // Removing due date resets overdue to pending
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

  const handleUpdateTitle = async (taskId: string, title: string) => {
    await updateTask(taskId, { title });
  };

  const handleUpdatePriority = async (taskId: string, priority: Task['priority']) => {
    await updateTask(taskId, { priority });
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(prev => (prev === taskId ? null : taskId));
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

  const activeTasks = tasks.filter(task => !task.completed);
  
  // Check for overdue and today tasks by comparing day-level dates
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const d = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
    return d < today;
  });
  
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const d = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
    return d.getTime() === today.getTime();
  });

  const handleExitStudyMode = () => {
    setStudyMode(false);
  };

  // If study mode is active, show the StudyMode component
  if (studyMode) {
    const selectedTaskTitle = selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.title : undefined;
    return (
      <StudyMode
        tasks={tasks}
        timerActive={timerActive}
        timeRemaining={timeRemaining}
        timerPaused={timerPaused}
        onExit={handleExitStudyMode}
        onPauseTimer={pauseTimer}
        onResetTimer={resetTimer}
        selectedTaskTitle={selectedTaskTitle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between min-h-16 py-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1">
                <StudyFlowLogo size={40} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">StudyFlow</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">AI-Powered Student Productivity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
              {/* Badges - Hide on very small screens */}
              <div className="hidden sm:flex items-center gap-2">
                {overdueTasks.length > 0 && (
                  <Badge variant="destructive" className="bg-error text-error-foreground animate-pulse text-xs">
                    {overdueTasks.length} overdue
                  </Badge>
                )}
                {todayTasks.length > 0 && (
                  <Badge variant="secondary" className="bg-warning-light text-warning text-xs">
                    {todayTasks.length} due today
                  </Badge>
                )}
              </div>
              
              {/* Study Mode Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStudyMode(true)}
                className="hover:bg-ai-primary/10 hover:text-ai-primary hover:border-ai-primary/30 text-xs sm:text-sm"
              >
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Study Mode</span>
              </Button>
              
              <ThemeToggle />
              
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                  className="hover:bg-error/10 hover:text-error hover:border-error/30"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs sm:text-sm"
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
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
              Welcome{user?.user_metadata?.display_name ? ` back ${user.user_metadata.display_name}` : ''}! Let's stay productive.
            </h2>
            <p className="text-muted-foreground">
              You have <span className="text-lg font-bold bg-gradient-to-r from-primary to-ai-primary bg-clip-text text-transparent animate-pulse-glow">{activeTasks.length}</span> active {activeTasks.length === 1 ? 'task' : 'tasks'} • AI recommendations ready
            </p>
            {!user && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  ⚠️ Guest Mode: Tasks are temporary. <button onClick={() => navigate('/auth')} className="text-primary hover:underline">Sign in</button> to save your work.
                </p>
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Your Tasks</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReorderMode(!isReorderMode)}
                  className="h-9 w-9 p-0"
                >
                  {isReorderMode ? <Check className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4" />}
                </Button>
                <AddTaskDialog onAddTask={handleAddTask} />
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground animate-slide-up">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks yet. Add your first task to get started!</p>
                </div>
              ) : (
                <>
                  {/* Incomplete Tasks */}
                  {isReorderMode ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext 
                        items={tasks.filter(t => !t.completed).sort((a, b) => a.sortOrder - b.sortOrder).map(task => task.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {tasks
                            .filter(t => !t.completed)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((task) => (
                              <DraggableTaskCard
                                key={task.id}
                                task={task}
                                onToggle={handleToggleTask}
                                onUpdateDueDate={handleUpdateDueDate}
                                onUpdateStatus={handleUpdateStatus}
                                onUpdateTitle={handleUpdateTitle}
                                onUpdatePriority={handleUpdatePriority}
                                onDelete={handleDeleteTask}
                                isReorderMode={isReorderMode}
                              />
                            ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="space-y-3">
                      {tasks
                        .filter(t => !t.completed)
                        .sort((a, b) => {
                          // Always respect manual sort order first
                          if (a.sortOrder !== b.sortOrder) {
                            return a.sortOrder - b.sortOrder;
                          }
                          // Fallback to automatic sorting for tasks with same sortOrder
                          return 0;
                        })
                        .map((task, index) => (
                          <div 
                            key={task.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <TaskCard
                              task={task}
                              onToggle={handleToggleTask}
                              onUpdateDueDate={handleUpdateDueDate}
                              onUpdateStatus={handleUpdateStatus}
                              onUpdateTitle={handleUpdateTitle}
                              onUpdatePriority={handleUpdatePriority}
                              onDelete={handleDeleteTask}
                              selected={selectedTaskId === task.id && !task.completed}
                              onSelect={handleSelectTask}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                  
                  {/* Completed Tasks */}
                  {tasks.filter(t => t.completed).length > 0 && (
                    <div className="space-y-4 mt-12">
                      <h3 className="text-lg font-medium text-muted-foreground">Completed Tasks</h3>
                      <div className="space-y-3">
                        {tasks
                          .filter(t => t.completed)
                          .sort((a, b) => {
                            // Sort completed tasks by completion date (most recent first)
                            const aCompleted = a.completedAt || a.updatedAt;
                            const bCompleted = b.completedAt || b.updatedAt;
                            return bCompleted.getTime() - aCompleted.getTime();
                          })
                          .map((task, index) => (
                            <div 
                              key={task.id}
                              className="animate-slide-up"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <TaskCard
                                task={task}
                                onToggle={handleToggleTask}
                                onUpdateDueDate={handleUpdateDueDate}
                                onUpdateStatus={handleUpdateStatus}
                                onUpdateTitle={handleUpdateTitle}
                                onUpdatePriority={handleUpdatePriority}
                                onDelete={handleDeleteTask}
                                selected={selectedTaskId === task.id && !task.completed}
                                onSelect={handleSelectTask}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
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

{/* Study Calendar & Recurring Goals */}
{/* <section id="study-calendar">
  <StudyCalendar />
</section> */}

          {/* Analytics Dashboard with Learning Insights */}
          <section className="space-y-6">
            <AnalyticsDashboard tasks={tasks} studyGoals={[]} />
            <LearningInsightsDashboard />
          </section>

          {/* Footer with Legal Info */}
          <footer className="pt-6 border-t border-border">
            <div className="text-center space-y-6">
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
                    StudyFlow is committed to protecting your privacy and ensuring the security of your personal data. 
                    We collect and process information in accordance with applicable data protection laws.
                  </p>
                  <p className="mb-2">
                    Your tasks, notes, and study data are securely stored and encrypted. We do not share your personal 
                    information with third parties without your explicit consent, except as required by law.
                  </p>
                  <p>
                    By using StudyFlow, you agree to our Terms of Service and Privacy Policy. 
                    If you have questions about data handling, please contact us.
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground/80">
                  <p>© 2025 StudyFlow. All Rights Reserved.</p>
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
