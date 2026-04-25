import { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  CheckSquare, Timer, Plus, LogOut, LogIn,
  ArrowUpDown, Check, NotebookPen, Flame,
  Zap, LayoutDashboard, GraduationCap, Music, Sun, Moon
} from "lucide-react";
import { TaskCard, Task } from "@/components/TaskCard";
import { DraggableTaskCard } from "@/components/DraggableTaskCard";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { FocusTimer } from "@/components/FocusTimer";
import { QuickNotes } from "@/components/QuickNotes";
import { StudyFlowLogo } from "@/components/StudyFlowLogo";
import { StudyMode } from "@/components/StudyMode";
import { AmbientSounds } from "@/components/AmbientSounds";
import TimerCelebration from "@/components/TimerCelebration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useBackgroundTimer } from "@/hooks/useBackgroundTimer";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useXP } from "@/hooks/useXP";
import { useTheme } from "@/hooks/useTheme";

type Tab = 'today' | 'tasks' | 'focus' | 'notes';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, toggleTask, reorderTasks } = useTasks();
  const { streak } = useStudyStreak();
  const { level, levelName, xpInLevel, xpToNext, progress: xpProgress, awardTask } = useXP();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const {
    timerActive, timeRemaining, timerPaused, selectedSessionDuration,
    startTimer, updateTimerDuration, pauseTimer, resetTimer
  } = useBackgroundTimer(() => {
    if (studyMode) setShowCelebration(true);
  });

  const [selectedSession, setSelectedSession] = useState<any>({ type: 'work', duration: 25, label: 'Focus' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (selectedTaskId) {
      const t = tasks.find(t => t.id === selectedTaskId);
      if (!t || t.completed) setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      reorderTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleToggleTask = async (taskId: string, showFeedback = false) => {
    const result = await toggleTask(taskId, showFeedback);
    if (result?.task?.completed) {
      const task = tasks.find(t => t.id === taskId);
      if (task) awardTask(task.priority);
      setSelectedTaskId(prev => prev === taskId ? null : prev);
    }
    return result;
  };

  const handleUpdateDueDate = async (taskId: string, dueDate: Date | undefined) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let newStatus = task.status;
    if (dueDate) {
      const d = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      if (d < today && !task.completed) newStatus = 'overdue';
      else if (task.status === 'overdue' && d >= today) newStatus = task.completed ? 'completed' : 'pending';
    } else {
      if (task.status === 'overdue') newStatus = task.completed ? 'completed' : 'pending';
    }
    if (newStatus !== task.status) await updateTask(taskId, { dueDate, status: newStatus });
    else await updateTask(taskId, { dueDate });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate.getFullYear(), t.dueDate.getMonth(), t.dueDate.getDate());
    return d < today;
  });
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate.getFullYear(), t.dueDate.getMonth(), t.dueDate.getDate());
    return d.getTime() === today.getTime();
  });
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  if (studyMode) {
    const selectedTaskTitle = selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.title : undefined;
    return (
      <>
        <StudyMode
          tasks={tasks}
          timerActive={timerActive}
          timeRemaining={timeRemaining}
          timerPaused={timerPaused}
          onExit={() => setStudyMode(false)}
          onPauseTimer={pauseTimer}
          onResetTimer={resetTimer}
          selectedTaskTitle={selectedTaskTitle}
        />
        <TimerCelebration
          isVisible={showCelebration}
          onDismiss={() => setShowCelebration(false)}
          onReset={() => { setShowCelebration(false); resetTimer(); }}
        />
      </>
    );
  }

  const userName = user?.user_metadata?.display_name?.split(' ')[0];
  const streakCount = streak?.current_streak ?? 0;

  // ── Sidebar nav items ──────────────────────────────────────────
  const NAV = [
    { id: 'today' as Tab, icon: LayoutDashboard, label: 'Today' },
    { id: 'tasks' as Tab, icon: CheckSquare, label: 'Tasks' },
    { id: 'focus' as Tab, icon: Timer, label: 'Focus' },
    { id: 'notes' as Tab, icon: NotebookPen, label: 'Notes' },
  ];

  // ── Content per tab ────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {

      // TODAY ──────────────────────────────────────────────────────
      case 'today': return (
        <div className="space-y-6 animate-fade-in">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {userName ? `Hey, ${userName} 👋` : 'Hey there 👋'}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {activeTasks.length === 0
                ? "You're all caught up. Nice work."
                : `${activeTasks.length} task${activeTasks.length !== 1 ? 's' : ''} left today`}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-foreground">{activeTasks.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Active</div>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
              <div className={`text-2xl font-black ${completedTasks.length > 0 ? 'text-success' : 'text-foreground'}`}>
                {completedTasks.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Done</div>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
              <div className={`text-2xl font-black ${overdueTasks.length > 0 ? 'text-error' : 'text-foreground'}`}>
                {overdueTasks.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Overdue</div>
            </div>
          </div>

          {/* Alerts */}
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-error/8 border border-error/20 rounded-xl text-sm">
              <span className="text-error font-semibold">{overdueTasks.length} overdue</span>
              <span className="text-error/70 text-xs">·</span>
              <button onClick={() => setActiveTab('tasks')} className="text-xs text-error/80 hover:text-error underline underline-offset-2">
                View tasks
              </button>
            </div>
          )}
          {todayTasks.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-warning/8 border border-warning/20 rounded-xl text-sm">
              <span className="text-warning font-semibold">{todayTasks.length} due today</span>
              <button onClick={() => setActiveTab('tasks')} className="text-xs text-warning/80 hover:text-warning underline underline-offset-2 ml-2">
                View tasks
              </button>
            </div>
          )}

          {/* Quick add */}
          <div className="flex items-center gap-2">
            <AddTaskDialog onAddTask={async (d) => { await addTask(d); }}>
              <button className="flex-1 flex items-center gap-3 px-4 py-3 bg-muted/40 border border-border/50 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all">
                <Plus className="h-4 w-4" />
                Add a task...
              </button>
            </AddTaskDialog>
          </div>

          {/* Recent active tasks */}
          {activeTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Up next</p>
                <button onClick={() => setActiveTab('tasks')} className="text-xs text-primary hover:text-primary/80">
                  View all →
                </button>
              </div>
              <div className="space-y-2">
                {activeTasks.slice(0, 3).map((task, i) => (
                  <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                    <TaskCard
                      task={task}
                      onToggle={handleToggleTask}
                      onUpdateDueDate={handleUpdateDueDate}
                      onUpdateStatus={(id, s) => updateTask(id, { status: s })}
                      onUpdateTitle={(id, t) => updateTask(id, { title: t })}
                      onUpdatePriority={(id, p) => updateTask(id, { priority: p })}
                      onDelete={(id) => deleteTask(id)}
                      selected={selectedTaskId === task.id}
                      onSelect={(id) => setSelectedTaskId(prev => prev === id ? null : id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick focus */}
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" /> Quick Focus
              </p>
              <button onClick={() => setActiveTab('focus')} className="text-xs text-primary hover:text-primary/80">
                Open timer →
              </button>
            </div>
            <div className="flex gap-2">
              {[15, 25, 45].map(mins => (
                <button key={mins}
                  onClick={() => {
                    setActiveTab('focus');
                    updateTimerDuration(mins * 60);
                    setSelectedSession({ type: 'work', duration: mins, label: `${mins}m Focus` });
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border transition-all">
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Ambient sounds preview */}
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Music className="h-4 w-4 text-ai-primary" /> Ambient Sounds
            </p>
            <AmbientSounds />
          </div>

          {!user && (
            <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 text-sm">
              <p className="text-foreground font-medium mb-1">⚠️ Guest mode — tasks won't be saved</p>
              <p className="text-muted-foreground text-xs mb-2">Sign in to keep your tasks, streaks, and XP across sessions.</p>
              <button onClick={() => navigate('/auth')} className="text-primary font-medium text-xs hover:text-primary/80">
                Sign in for free →
              </button>
            </div>
          )}
        </div>
      );

      // TASKS ──────────────────────────────────────────────────────
      case 'tasks': return (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completionRate}% complete · {activeTasks.length} remaining
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                onClick={() => setIsReorderMode(!isReorderMode)}>
                {isReorderMode ? <Check className="h-4 w-4 text-success" /> : <ArrowUpDown className="h-4 w-4" />}
              </Button>
              <AddTaskDialog onAddTask={async (d) => { await addTask(d); }} />
            </div>
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="space-y-1.5">
              <Progress value={completionRate} className="h-1.5" />
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-xs mt-1">Add your first task above</p>
            </div>
          ) : (
            <>
              {/* Active tasks */}
              {activeTasks.length > 0 && (
                <div className="space-y-2">
                  {isReorderMode ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                      <SortableContext
                        items={activeTasks.sort((a, b) => a.sortOrder - b.sortOrder).map(t => t.id)}
                        strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {activeTasks.sort((a, b) => a.sortOrder - b.sortOrder).map(task => (
                            <DraggableTaskCard key={task.id} task={task}
                              onToggle={handleToggleTask}
                              onUpdateDueDate={handleUpdateDueDate}
                              onUpdateStatus={(id, s) => updateTask(id, { status: s })}
                              onUpdateTitle={(id, t) => updateTask(id, { title: t })}
                              onUpdatePriority={(id, p) => updateTask(id, { priority: p })}
                              onDelete={(id) => deleteTask(id)}
                              isReorderMode />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="space-y-2">
                      {activeTasks.sort((a, b) => a.sortOrder - b.sortOrder).map((task, i) => (
                        <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                          <TaskCard
                            task={task}
                            onToggle={handleToggleTask}
                            onUpdateDueDate={handleUpdateDueDate}
                            onUpdateStatus={(id, s) => updateTask(id, { status: s })}
                            onUpdateTitle={(id, t) => updateTask(id, { title: t })}
                            onUpdatePriority={(id, p) => updateTask(id, { priority: p })}
                            onDelete={(id) => deleteTask(id)}
                            selected={selectedTaskId === task.id}
                            onSelect={(id) => setSelectedTaskId(prev => prev === id ? null : id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Completed tasks */}
              {completedTasks.length > 0 && (
                <div className="mt-8 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Completed · {completedTasks.length}
                  </p>
                  <div className="space-y-2">
                    {completedTasks
                      .sort((a, b) => (b.completedAt || b.updatedAt).getTime() - (a.completedAt || a.updatedAt).getTime())
                      .map((task, i) => (
                        <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                          <TaskCard
                            task={task}
                            onToggle={handleToggleTask}
                            onUpdateDueDate={handleUpdateDueDate}
                            onUpdateStatus={(id, s) => updateTask(id, { status: s })}
                            onUpdateTitle={(id, t) => updateTask(id, { title: t })}
                            onUpdatePriority={(id, p) => updateTask(id, { priority: p })}
                            onDelete={(id) => deleteTask(id)}
                            selected={false}
                            onSelect={() => {}}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );

      // FOCUS ──────────────────────────────────────────────────────
      case 'focus': return (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Focus</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Lock in and get it done.</p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6">
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
              selectedTask={selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : undefined}
            />
          </div>

          {/* Task selector */}
          {activeTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus on a task</p>
              <div className="space-y-2">
                {activeTasks.slice(0, 5).map(task => (
                  <button key={task.id}
                    onClick={() => setSelectedTaskId(prev => prev === task.id ? null : task.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                      selectedTaskId === task.id
                        ? 'border-primary/40 bg-primary/8 text-foreground'
                        : 'border-border/50 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-error' : task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <span className="truncate font-medium">{task.title}</span>
                    {task.subject && <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{task.subject}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ambient during focus */}
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Ambient Sounds
            </p>
            <AmbientSounds />
          </div>

          {/* Study mode CTA */}
          <button onClick={() => setStudyMode(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
            <GraduationCap className="h-4 w-4" />
            Enter Study Mode
          </button>
        </div>
      );

      // NOTES ──────────────────────────────────────────────────────
      case 'notes': return (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Quick captures, ideas, anything.</p>
          </div>
          <QuickNotes />
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border/50 bg-card/40 backdrop-blur-sm flex-shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border/40">
          <StudyFlowLogo size={28} />
          <span className="ml-2 font-bold text-foreground text-sm tracking-tight">StudyFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`nav-item w-full ${activeTab === id ? 'nav-item-active' : ''}`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {id === 'tasks' && (
                overdueTasks.length > 0 ? (
                  <span className="ml-auto text-xs bg-error/15 text-error rounded-full px-1.5 py-0.5 font-semibold">
                    {overdueTasks.length} late
                  </span>
                ) : activeTasks.length > 0 ? (
                  <span className="ml-auto text-xs bg-primary/15 text-primary rounded-full px-1.5 py-0.5 font-semibold">
                    {activeTasks.length}
                  </span>
                ) : null
              )}
            </button>
          ))}
        </nav>

        {/* Streak + XP */}
        <div className="p-3 border-t border-border/40 space-y-2">
          {/* Streak */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40">
            <span className="text-lg streak-fire">🔥</span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground">{streakCount} day streak</div>
              <div className="text-xs text-muted-foreground truncate">
                {streakCount === 0 ? 'Start today!' : streakCount < 7 ? 'Keep it up!' : 'On fire! 🔥'}
              </div>
            </div>
          </div>

          {/* XP */}
          <div className="px-3 py-2.5 rounded-xl bg-muted/40">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{levelName}</span>
              </div>
              <span className="text-xs text-muted-foreground">{xpInLevel}/{xpToNext}</span>
            </div>
            <Progress value={xpProgress} className="h-1.5" />
          </div>

          {/* User / theme */}
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            {user ? (
              <button onClick={() => signOut()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-error hover:bg-error/10 transition-all">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            ) : (
              <button onClick={() => navigate('/auth')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-primary hover:bg-primary/10 transition-all font-medium">
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border/40 bg-card/40 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <StudyFlowLogo size={24} />
            <span className="font-bold text-foreground text-sm">StudyFlow</span>
          </div>
          <div className="flex items-center gap-1.5">
            {streakCount > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 rounded-full px-2.5 py-1">
                <span className="streak-fire">🔥</span>
                {streakCount}
              </div>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 transition-all">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <button onClick={() => signOut()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error transition-all">
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => navigate('/auth')}
                className="h-8 px-3 text-xs text-primary">Sign in</Button>
            )}
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
            {renderContent()}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/80 backdrop-blur-xl border-t border-border/40 z-50">
          <div className="flex">
            {NAV.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors relative ${
                  activeTab === id ? 'text-primary' : 'text-muted-foreground'
                }`}>
                <Icon className="h-5 w-5" />
                {label}
                {id === 'tasks' && overdueTasks.length > 0 && (
                  <span className="absolute top-2 right-1/4 w-2 h-2 bg-error rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <TimerCelebration
        isVisible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
        onReset={() => { setShowCelebration(false); resetTimer(); }}
      />
    </div>
  );
};

export default Index;
