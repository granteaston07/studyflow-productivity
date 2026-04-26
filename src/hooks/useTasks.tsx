import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { addDays, addWeeks } from 'date-fns';

export interface Task {
  id: string;
  title: string;
  subject: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'review' | 'blocked' | 'completed' | 'overdue';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  recurring: 'none' | 'daily' | 'weekly';
}

function formatTask(task: any): Task {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = task.due_date ? new Date(task.due_date) : undefined;
  let status = task.status as Task['status'];
  const isCompleted = !!task.completed;
  const taskDate = dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()) : null;

  if (isCompleted && status !== 'completed') status = 'completed';
  else if (!isCompleted && taskDate && taskDate < today && status !== 'overdue') status = 'overdue';
  else if (!isCompleted && status === 'overdue' && (!taskDate || taskDate >= today)) status = 'pending';

  return {
    id: task.id,
    title: task.title,
    subject: task.subject || '',
    description: task.description,
    dueDate,
    completed: task.completed,
    priority: task.priority as Task['priority'],
    status,
    completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
    sortOrder: task.sort_order || 0,
    recurring: (task.recurring as Task['recurring']) || 'none',
  };
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(formatTask);
      setTasks(formatted);

      // Batch-fix any status mismatches in the background — non-blocking
      const fixes = data.filter(task => {
        const f = formatted.find(t => t.id === task.id);
        return f && f.status !== task.status;
      });
      if (fixes.length > 0) {
        Promise.all(
          fixes.map(task => {
            const f = formatted.find(t => t.id === task.id)!;
            return supabase.from('tasks').update({ status: f.status }).eq('id', task.id);
          })
        ).catch(() => {});
      }
    } catch (error: any) {
      toast.error('Failed to load tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Only re-fetch when the user ID actually changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      const guestTask: Task = {
        id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...taskData,
        recurring: taskData.recurring || 'none',
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: 0,
      };
      setTasks(prev => [guestTask, ...prev]);
      toast.success('Task added (Guest Mode - Sign in to save permanently)');
      return;
    }

    try {
      const incompleteTasks = tasks.filter(t => !t.completed);
      const maxSortOrder = incompleteTasks.length > 0
        ? Math.max(...incompleteTasks.map(t => t.sortOrder))
        : -1;
      const sortOrder = taskData.priority === 'high' ? 0 : maxSortOrder + 1;

      // Shift existing tasks down in parallel — don't await sequentially
      if (taskData.priority === 'high' && incompleteTasks.length > 0) {
        Promise.all(
          incompleteTasks.map((task, index) =>
            supabase
              .from('tasks')
              .update({ sort_order: index + 1 })
              .eq('id', task.id)
              .eq('user_id', currentUser.id)
          )
        ).catch(() => {});

        // Optimistically update local sort orders immediately
        setTasks(prev => prev.map(t =>
          !t.completed ? { ...t, sortOrder: t.sortOrder + 1 } : t
        ));
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: currentUser.id,
          title: taskData.title,
          subject: taskData.subject,
          description: taskData.description,
          due_date: taskData.dueDate?.toISOString(),
          priority: taskData.priority,
          status: taskData.status,
          completed: taskData.completed,
          completed_at: taskData.completedAt?.toISOString(),
          sort_order: sortOrder,
          recurring: taskData.recurring || 'none',
        })
        .select()
        .single();

      if (error) throw error;

      // Add directly to local state — no full refetch needed
      const newTask = formatTask(data);
      setTasks(prev =>
        taskData.priority === 'high'
          ? [newTask, ...prev]
          : [...prev, newTask]
      );
      toast.success('Task created successfully');
    } catch (error: any) {
      toast.error('Failed to create task');
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      ));
      return;
    }

    let originalTask: Task | undefined;
    setTasks(prev => {
      originalTask = prev.find(t => t.id === taskId);
      return prev.map(task =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      );
    });

    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.recurring !== undefined) updateData.recurring = updates.recurring;
      if (updates.completed !== undefined) {
        updateData.completed = updates.completed;
        updateData.completed_at = updates.completed ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        if (originalTask) setTasks(prev => prev.map(t => t.id === taskId ? originalTask! : t));
        if (error.code === '23514' && updates.status !== undefined) {
          toast.error('Run the DB migration in Supabase to enable Review/Blocked statuses.');
        } else {
          toast.error('Failed to update task');
        }
        console.error('Error updating task:', error);
      }
    } catch (error: any) {
      if (originalTask) setTasks(prev => prev.map(t => t.id === taskId ? originalTask! : t));
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted');
      return;
    }

    // Optimistic removal
    setTasks(prev => prev.filter(task => task.id !== taskId));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Task deleted');
    } catch (error: any) {
      // Revert on failure
      await fetchTasks();
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const toggleTask = async (taskId: string, showFeedback: boolean = false) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { task: null, shouldShowFeedback: false };

    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'completed' : 'pending';

    await updateTask(taskId, {
      completed: newCompleted,
      status: newStatus,
      completedAt: newCompleted ? new Date() : undefined,
    });

    if (newCompleted && task.recurring && task.recurring !== 'none') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const base = task.dueDate ?? today;
      const nextDate = task.recurring === 'daily' ? addDays(base, 1) : addWeeks(base, 1);
      const nextDateNorm = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
      await addTask({
        title: task.title,
        subject: task.subject,
        description: task.description,
        dueDate: nextDate,
        completed: false,
        priority: task.priority,
        status: nextDateNorm < today ? 'overdue' : 'pending',
        completedAt: undefined,
        recurring: task.recurring,
      });
    }

    return {
      task: { ...task, completed: newCompleted },
      shouldShowFeedback: newCompleted && showFeedback,
    };
  };

  const reorderTasks = async (newOrder: Task[]) => {
    const incompleteTasks = newOrder.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    // Optimistic update immediately
    setTasks([
      ...incompleteTasks.map((task, index) => ({ ...task, sortOrder: index })),
      ...completedTasks,
    ]);

    if (!user) return;

    try {
      // Fire all updates in parallel — don't await sequentially
      await Promise.all(
        incompleteTasks.map((task, index) =>
          supabase
            .from('tasks')
            .update({ sort_order: index })
            .eq('id', task.id)
            .eq('user_id', user.id)
        )
      );
    } catch (error: any) {
      toast.error('Failed to save task order');
      console.error('Error updating task order:', error);
      await fetchTasks();
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    refreshTasks: fetchTasks,
  };
}
