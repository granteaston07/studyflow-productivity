import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  CheckSquare, Timer, Plus, LogOut, LogIn,
  ArrowUpDown, Check, NotebookPen, Flame,
  Zap, LayoutDashboard, GraduationCap, Sun, Moon,
  BarChart2, Sparkles, X, Search, Bell
} from "lucide-react";
import { TaskCard, Task } from "@/components/TaskCard";
import { DraggableTaskCard } from "@/components/DraggableTaskCard";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { FocusTimer } from "@/components/FocusTimer";
import { QuickNotes } from "@/components/QuickNotes";
import { StudyFlowLogo } from "@/components/StudyFlowLogo";
import { StudyMode } from "@/components/StudyMode";
import { AmbientSounds } from "@/components/AmbientSounds";
import { StudyLinks } from "@/components/StudyLinks";
import { ProgressTracker } from "@/components/ProgressTracker";
import { AISessionPlanner } from "@/components/AISessionPlanner";
import { TaskPrioritization } from "@/components/TaskPrioritization";
import { AIDailyBrief } from "@/components/AIDailyBrief";
import { TaskAICoach } from "@/components/TaskAICoach";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { FloatingTimerWidget } from "@/components/FloatingTimerWidget";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { SubjectManager } from "@/components/SubjectManager";
import { ProfileSheet } from "@/components/ProfileSheet";
import { CalendarView } from "@/components/CalendarView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useBackgroundTimer } from "@/hooks/useBackgroundTimer";
import { useStudyStreak } from "@/hooks/useStudyStreak";
import { useXP } from "@/hooks/useXP";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";

type Tab = 'today' | 'tasks' | 'focus' | 'notes' | 'stats';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, toggleTask, reorderTasks } = useTasks();
  const { streak } = useStudyStreak();
  const { level, levelName, xpInLevel, xpToNext, progress: xpProgress, awardTask } = useXP();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [calendarDay, setCalendarDay] = useState<Date | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() =>
    !localStorage.getItem('studyflow_onboarded')
  );
  const [guestName, setGuestName] = useState(() =>
    localStorage.getItem('studyflow_guest_name') || ''
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const { permission, requestPermission, notifyDueToday } = useNotifications();

  const {
    timerActive, timeRemaining, timerPaused, selectedSessionDuration,
    startTimer, updateTimerDuration, pauseTimer, resetTimer
  } = useBackgroundTimer();

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

  // Must be before any early returns to satisfy Rules of Hooks
  useEffect(() => {
    if (!tasksLoading && tasks.length > 0) notifyDueToday(tasks);
  }, [tasksLoading]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      reorderTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleOnboardingComplete = (name: string) => {
    if (name) {
      localStorage.setItem('studyflow_guest_name', name);
      setGuestName(name);
    }
    localStorage.setItem('studyflow_onboarded', 'true');
    setShowOnboarding(false);
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
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const filteredActiveTasks = activeTasks.filter(t => {
    const q = taskSearch.toLowerCase();
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q);
    const matchesFilter =
      taskFilter === 'all' ||
      (taskFilter === 'active' && t.status !== 'overdue') ||
      (taskFilter === 'overdue' && t.status === 'overdue');
    const matchesDay = !calendarDay || (t.dueDate && (
      t.dueDate.getFullYear() === calendarDay.getFullYear() &&
      t.dueDate.getMonth() === calendarDay.getMonth() &&
      t.dueDate.getDate() === calendarDay.getDate()
    ));
    return matchesSearch && matchesFilter && matchesDay;
  });

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
      </>
    );
  }

  const userName = user?.user_metadata?.display_name?.split(' ')[0] || guestName || undefined;
  const streakCount = streak?.current_streak ?? 0;
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : undefined;

  const smartStatus = (() => {
    if (overdueTasks.length >= 3) return 'Backlog piling up';
    if (overdueTasks.length > 0) return 'Clear the overdue';
    if (timerActive && !timerPaused) return 'In the zone';
    if (completionRate >= 90 && tasks.length > 0) return 'Almost perfect!';
    if (completionRate >= 70) return 'Crushing it';
    if (streakCount >= 14) return 'Unstoppable';
    if (streakCount >= 7) return 'On fire!';
    if (streakCount >= 3) return 'Building momentum';
    if (completionRate >= 50) return 'Making progress';
    if (activeTasks.length === 0 && tasks.length > 0) return 'All done!';
    return levelName;
  })();

  const NAV = [
    { id: 'today' as Tab, icon: LayoutDashboard, label: 'Today' },
    { id: 'tasks' as Tab, icon: CheckSquare, label: 'Tasks' },
    { id: 'focus' as Tab, icon: Timer, label: 'Focus' },
    { id: 'notes' as Tab, icon: NotebookPen, label: 'Notes' },
    { id: 'stats' as Tab, icon: BarChart2, label: 'Stats' },
  ];

  const renderContent = () => {
    switch (activeTab) {

      // TODAY ──────────────────────────────────────────────────────
      case 'today': return (
        <div className="space-y-6 animate-fade-in">
          <WelcomeHeader tasks={tasks} userName={userName} />

          {/* Quick add */}
          <AddTaskDialog onAddTask={async (d) => { await addTask(d); }}>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-muted/40 border border-border/50 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all">
              <Plus className="h-4 w-4" />
              Add a task...
            </button>
          </AddTaskDialog>

          {/* Up next */}
          {activeTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Up next</p>
                <button onClick={() => setActiveTab('tasks')} className="text-xs text-primary hover:text-primary/80">
                  View all →
                </button>
              </div>
              <div className="space-y-2">
                {activeTasks.slice(0, 3).map((task, i) => (
                  <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                    <TaskCard
                      task={task}
                      onToggle={handleToggleTask}
                      onUpdateDueDate={handleUpdateDueDate}
                      onUpdateStatus={(id, s) => updateTask(id, { status: s })}
                      onUpdateTitle={(id, t) => updateTask(id, { title: t })}
                      onUpdatePriority={(id, p) => updateTask(id, { priority: p })}
                      onUpdateSubject={(id, s) => updateTask(id, { subject: s })}
                      onDelete={(id) => deleteTask(id)}
                      selected={selectedTaskId === task.id}
                      onSelect={(id) => setSelectedTaskId(prev => prev === id ? null : id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTasks.length === 0 && tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium">Nothing here yet.</p>
              <p className="text-xs mt-1">Add a task to get started.</p>
            </div>
          )}

          {/* Quick links */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Links</p>
            <StudyLinks open={linksOpen} onOpenChange={setLinksOpen} />
          </div>

          {/* Ambient sounds */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ambient Sounds</p>
            <AmbientSounds />
          </div>

          {/* Quick focus */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Focus</p>
              <button onClick={() => setActiveTab('focus')} className="text-xs text-primary hover:text-primary/80">
                Full timer →
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

          {/* Notification permission banner */}
          {permission === 'default' && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <Bell className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-none">Enable reminders</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get notified when tasks are due.</p>
              </div>
              <button
                onClick={() => requestPermission()}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                Allow
              </button>
            </div>
          )}

          {!user && (
            <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 text-sm">
              <p className="text-foreground font-medium mb-1">Guest mode — tasks won't be saved</p>
              <p className="text-muted-foreground text-xs mb-2">Sign in to keep your tasks, streaks, and XP.</p>
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
              {activeTasks.length > 0 && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ai-primary/30 text-xs font-semibold text-ai-primary hover:bg-ai-primary/8 transition-colors duration-150">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
                    <SheetHeader className="mb-4">
                      <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        AI Prioritization
                      </SheetTitle>
                    </SheetHeader>
                    <TaskPrioritization
                      tasks={tasks}
                      onSelectTask={(id) => setSelectedTaskId(prev => prev === id ? null : id)}
                      selectedTaskId={selectedTaskId}
                    />
                  </SheetContent>
                </Sheet>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                onClick={() => setIsReorderMode(!isReorderMode)}>
                {isReorderMode ? <Check className="h-4 w-4 text-success" /> : <ArrowUpDown className="h-4 w-4" />}
              </Button>
              <AddTaskDialog onAddTask={async (d) => { await addTask(d); }} />
            </div>
          </div>

          {/* Search + filter */}
          {tasks.length > 0 && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search tasks..."
                  value={taskSearch}
                  onChange={e => setTaskSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
                {taskSearch && (
                  <button onClick={() => setTaskSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5">
                {(['all', 'active', 'overdue'] as const).map(f => (
                  <button key={f} onClick={() => setTaskFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 capitalize ${
                      taskFilter === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tasks.length > 0 && (
            <Progress value={completionRate} className="h-1.5" />
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-xs mt-1">Add your first task above</p>
            </div>
          ) : (
            <>
              {filteredActiveTasks.length > 0 && (
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
                              onUpdateSubject={(id, s) => updateTask(id, { subject: s })}
                              onDelete={(id) => deleteTask(id)}
                              isReorderMode />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="space-y-2">
                      {filteredActiveTasks.sort((a, b) => a.sortOrder - b.sortOrder).map((task, i) => (
                        <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                          <TaskCard
                            task={task}
                            onToggle={handleToggleTask}
                            onUpdateDueDate={handleUpdateDueDate}
                            onUpdateStatus={(id, s) => updateTask(id, { status: s })}
                            onUpdateTitle={(id, t) => updateTask(id, { title: t })}
                            onUpdatePriority={(id, p) => updateTask(id, { priority: p })}
                            onUpdateSubject={(id, s) => updateTask(id, { subject: s })}
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
              {filteredActiveTasks.length === 0 && activeTasks.length > 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks match your search.</p>
              )}

              {completedTasks.length > 0 && (
                <div className="mt-8 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Completed · {completedTasks.length}
                  </p>
                  <div className="space-y-2">
                    {completedTasks
                      .sort((a, b) => (b.completedAt || b.updatedAt).getTime() - (a.completedAt || a.updatedAt).getTime())
                      .map((task, i) => (
                        <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
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

          {/* Calendar */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Calendar</p>
            <CalendarView
              tasks={tasks}
              onDayFilter={setCalendarDay}
              activeDay={calendarDay}
            />
            {calendarDay && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Showing tasks due {calendarDay.toLocaleDateString('default', { month: 'long', day: 'numeric' })} ·{' '}
                <button onClick={() => setCalendarDay(null)} className="text-primary hover:underline">clear</button>
              </p>
            )}
          </div>
        </div>
      );

      // FOCUS ──────────────────────────────────────────────────────
      case 'focus': return (
        <div className="space-y-5">
          <div className="animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Focus</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Lock in and get it done.</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Study Mode button */}
              <button onClick={() => setStudyMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-150">
                <GraduationCap className="h-3.5 w-3.5" />
                Study Mode
              </button>
              {/* AI study coach popup */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ai-primary/30 text-xs font-semibold text-ai-primary hover:bg-ai-primary/8 transition-colors duration-150">
                    <Sparkles className="h-3.5 w-3.5" />
                    Study tips
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      AI Study Coach
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 pb-4">
                    {selectedTask ? (
                      <TaskAICoach task={selectedTask} />
                    ) : (
                      <AISessionPlanner
                        tasks={tasks}
                        onSelectTask={(id) => setSelectedTaskId(prev => prev === id ? null : id)}
                        selectedTaskId={selectedTaskId}
                      />
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.06s' }}>
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
              selectedTask={selectedTask}
            />
          </div>
          </div>

          {/* Task selector */}
          {activeTasks.length > 0 && (
            <div className="animate-slide-up space-y-2" style={{ animationDelay: '0.1s' }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus on a task</p>
              <div className="space-y-1.5">
                {activeTasks.slice(0, 5).map(task => (
                  <button key={task.id}
                    onClick={() => setSelectedTaskId(prev => prev === task.id ? null : task.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-colors duration-150 ${
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
              {selectedTask && (
                <p className="text-xs text-ai-primary/80 text-center">
                  Tap "Study tips" for task-specific coaching
                </p>
              )}
            </div>
          )}

          {/* Ambient sounds */}
          <div className="animate-slide-up space-y-2" style={{ animationDelay: '0.14s' }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ambient Sounds</p>
            <AmbientSounds />
          </div>
        </div>
      );

      // NOTES ──────────────────────────────────────────────────────
      case 'notes': return (
        <div className="space-y-6">
          <div className="animate-slide-up" style={{ animationDelay: '0s' }}>
            <h1 className="text-2xl font-bold text-foreground">Notes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Quick captures, ideas, anything.</p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.06s' }}>
            <QuickNotes />
          </div>
        </div>
      );

      // STATS ──────────────────────────────────────────────────────
      case 'stats': return (
        <div className="space-y-5">
          <div className="animate-slide-up" style={{ animationDelay: '0s' }}>
            <h1 className="text-2xl font-bold text-foreground">Stats</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your progress at a glance.</p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.06s' }}>
            <AIDailyBrief tasks={tasks} userName={userName} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {tasks.length > 0 ? (
            <ProgressTracker tasks={tasks} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No data yet</p>
              <p className="text-xs mt-1">Complete some tasks to see your stats</p>
            </div>
          )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border/50 bg-card/40 backdrop-blur-sm flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-border/40">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity"
            title="Profile & Settings"
          >
            <StudyFlowLogo size={28} />
            <span className="font-bold text-foreground text-sm tracking-tight">StudyFlow</span>
          </button>
        </div>

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

        <div className="p-3 border-t border-border/40 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40">
            <span className="text-lg streak-fire">🔥</span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground">{streakCount} day streak</div>
              <div className="text-xs text-muted-foreground truncate">
                {streakCount === 0 ? 'Start today!' : streakCount < 7 ? 'Keep it up!' : 'On fire!'}
              </div>
            </div>
          </div>

          <div className="px-3 py-2.5 rounded-xl bg-muted/40">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{smartStatus}</span>
              </div>
              <span className="text-xs text-muted-foreground">{xpInLevel}/{xpToNext}</span>
            </div>
            <Progress value={xpProgress} className="h-1.5" />
          </div>

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
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border/40 bg-card/60 backdrop-blur-sm flex-shrink-0 pt-safe">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 active:opacity-60 transition-opacity min-h-[44px] pr-2"
            title="Profile & Settings"
          >
            <StudyFlowLogo size={26} />
            <span className="font-bold text-foreground text-base">StudyFlow</span>
          </button>
          <div className="flex items-center gap-1">
            {streakCount > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 rounded-full px-2.5 py-1.5">
                <span className="streak-fire">🔥</span>
                {streakCount}
              </div>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 active:bg-muted/80 transition-all">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <button onClick={() => signOut()}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-error/10 hover:text-error active:bg-error/20 transition-all">
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => navigate('/auth')}
                className="h-10 px-3 text-sm text-primary">Sign in</Button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-5 pb-32 md:px-5 md:py-6 md:pb-8">
            {renderContent()}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/90 backdrop-blur-xl border-t border-border/40 z-50 nav-safe">
          <div className="flex">
            {NAV.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[56px] text-xs font-medium transition-colors relative ${
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

      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        userName={userName}
        guestName={guestName}
        onGuestNameChange={setGuestName}
        streakCount={streakCount}
        level={level}
        levelName={levelName}
        xpInLevel={xpInLevel}
        xpToNext={xpToNext}
        xpProgress={xpProgress}
        completedCount={completedTasks.length}
        onManageLinks={() => setLinksOpen(true)}
        onManageSubjects={() => setSubjectsOpen(true)}
      />

      <Sheet open={subjectsOpen} onOpenChange={setSubjectsOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Manage Subjects
            </SheetTitle>
          </SheetHeader>
          <div className="pb-4">
            <SubjectManager tasks={tasks} />
          </div>
        </SheetContent>
      </Sheet>

      {timerActive && activeTab !== 'focus' && (
        <FloatingTimerWidget
          timeRemaining={timeRemaining}
          sessionDuration={selectedSessionDuration}
          timerPaused={timerPaused}
          selectedTask={selectedTask}
          tasks={tasks}
          onGoToFocus={() => setActiveTab('focus')}
        />
      )}
    </div>
  );
};

export default Index;
