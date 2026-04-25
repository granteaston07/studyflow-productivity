import { useState } from "react";
import { Plus, ChevronDown, CheckCircle2, Clock, AlertTriangle, Flame } from "lucide-react";
import { Task } from "@/hooks/useTasks";
import { TaskCard } from "./TaskCard";
import { AddTaskDialog } from "./AddTaskDialog";
import { StudyLinks } from "./StudyLinks";
import { AmbientSounds } from "./AmbientSounds";
import { FocusTimer } from "./FocusTimer";
import { WelcomeHeader } from "./WelcomeHeader";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface OnePageDashboardProps {
  tasks: Task[];
  userName?: string;
  streakCount: number;
  onAddTask: (d: Omit<Task, "id" | "createdAt" | "updatedAt" | "sortOrder">) => void;
  onToggleTask: (id: string, showFeedback?: boolean) => Promise<any>;
  onUpdateDueDate: (id: string, date: Date | undefined) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  timerActive: boolean;
  timeRemaining: number;
  timerPaused: boolean;
  onStartTimer: (duration?: number) => void;
  onUpdateTimerDuration: (duration: number) => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  selectedSession: any;
  onSessionChange: (s: any) => void;
}

export function OnePageDashboard({
  tasks, userName, streakCount,
  onAddTask, onToggleTask, onUpdateDueDate, onUpdateTask, onDeleteTask,
  selectedTaskId, onSelectTask,
  timerActive, timeRemaining, timerPaused,
  onStartTimer, onUpdateTimerDuration, onPauseTimer, onResetTimer,
  selectedSession, onSessionChange,
}: OnePageDashboardProps) {
  const [tasksExpanded, setTasksExpanded] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdueTasks = activeTasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate.getFullYear(), t.dueDate.getMonth(), t.dueDate.getDate());
    return d < today;
  });

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const visibleTasks = tasksExpanded ? activeTasks : activeTasks.slice(0, 4);
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : undefined;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome */}
      <WelcomeHeader tasks={tasks} userName={userName} />

      {/* Quick add */}
      <AddTaskDialog onAddTask={onAddTask}>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-muted/40 border border-border/50 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all">
          <Plus className="h-4 w-4" />
          Add a task...
        </button>
      </AddTaskDialog>

      {/* Tasks */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</p>
          <span className="text-xs text-muted-foreground">{activeTasks.length} remaining</span>
        </div>

        {activeTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm font-medium">All clear.</p>
            <p className="text-xs mt-0.5">Add a task above to get going.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {visibleTasks.sort((a, b) => a.sortOrder - b.sortOrder).map((task, i) => (
                <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                  <TaskCard
                    task={task}
                    onToggle={onToggleTask}
                    onUpdateDueDate={onUpdateDueDate}
                    onUpdateStatus={(id, s) => onUpdateTask(id, { status: s })}
                    onUpdateTitle={(id, t) => onUpdateTask(id, { title: t })}
                    onUpdatePriority={(id, p) => onUpdateTask(id, { priority: p })}
                    onUpdateSubject={(id, s) => onUpdateTask(id, { subject: s })}
                    onDelete={onDeleteTask}
                    selected={selectedTaskId === task.id}
                    onSelect={(id) => onSelectTask(id)}
                  />
                </div>
              ))}
            </div>
            {activeTasks.length > 4 && (
              <button
                onClick={() => setTasksExpanded(v => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", tasksExpanded && "rotate-180")} />
                {tasksExpanded ? "Show less" : `${activeTasks.length - 4} more tasks`}
              </button>
            )}
          </>
        )}
      </section>

      {/* Quick links */}
      <section className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Links</p>
        <StudyLinks />
      </section>

      {/* Ambient sounds */}
      <section className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ambient Sounds</p>
        <AmbientSounds />
      </section>

      {/* Focus timer */}
      <section className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus Timer</p>
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <FocusTimer
            timerActive={timerActive}
            timeRemaining={timeRemaining}
            timerPaused={timerPaused}
            onStartTimer={onStartTimer}
            onUpdateDuration={onUpdateTimerDuration}
            onPauseTimer={onPauseTimer}
            onResetTimer={onResetTimer}
            selectedSession={selectedSession}
            onSessionChange={onSessionChange}
            selectedTask={selectedTask}
          />
        </div>
        {/* Task selector — compact */}
        {activeTasks.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {activeTasks.slice(0, 5).map(task => (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors duration-150 max-w-[160px]",
                  selectedTaskId === task.id
                    ? "border-primary/40 bg-primary/8 text-foreground"
                    : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                  task.priority === "high" ? "bg-error" : task.priority === "medium" ? "bg-warning" : "bg-success"
                )} />
                <span className="truncate">{task.title}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Stats — minimal */}
      <section className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stats</p>
        <div className="space-y-2">
          {/* Completion bar */}
          {tasks.length > 0 && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Completion</span>
                <span className="text-sm font-bold text-foreground">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-1.5" />
              <div className="flex items-center gap-4 pt-0.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  {completedTasks.length} done
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-warning" />
                  {activeTasks.length} active
                </span>
                {overdueTasks.length > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-error">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {overdueTasks.length} overdue
                  </span>
                )}
              </div>
            </div>
          )}
          {/* Streak */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-xl streak-fire">🔥</span>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">{streakCount} day streak</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {streakCount === 0 ? "Complete a task to start" : streakCount >= 7 ? "You're on fire!" : "Keep it going!"}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
