import { useState, useEffect } from 'react';
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

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) {
      // Guest mode: Clear any existing tasks and set loading to false
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

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const formattedTasks: Task[] = data.map(task => {
        const dueDate = task.due_date ? new Date(task.due_date) : undefined;
        let status = task.status as Task['status'];
        const isCompleted = !!task.completed;
        const taskDate = dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()) : null;

        // Normalize status based on completion and day-level due date
        if (isCompleted && status !== 'completed') {
          status = 'completed';
          // Update in database asynchronously (fire and forget)
          supabase.from('tasks').update({ status: 'completed' }).eq('id', task.id).then(() => {});
        } else if (!isCompleted && taskDate && taskDate < today && status !== 'overdue') {
          status = 'overdue';
          supabase.from('tasks').update({ status: 'overdue' }).eq('id', task.id).then(() => {});
        } else if (!isCompleted && status === 'overdue' && (!taskDate || taskDate >= today)) {
          // No longer overdue → reset to pending
          status = 'pending';
          supabase.from('tasks').update({ status: 'pending' }).eq('id', task.id).then(() => {});
        }
        
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
      });

      setTasks(formattedTasks);
    } catch (error: any) {
      toast.error('Failed to load tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => {
    // Check for authentication first
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      // Guest mode: Add to local state only, no database save
      const guestTask: Task = {
        id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title,
        subject: taskData.subject,
        description: taskData.description,
        dueDate: taskData.dueDate,
        completed: taskData.completed,
        priority: taskData.priority,
        status: taskData.status,
        completedAt: taskData.completedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: 0,
        recurring: taskData.recurring || 'none',
      };

      setTasks(prev => [guestTask, ...prev]);
      toast.success('Task added (Guest Mode - Sign in to save permanently)');
      return;
    }

    try {
      // Calculate sort order: high priority goes to top (0), others go to bottom
      const incompleteTasks = tasks.filter(t => !t.completed);
      const maxSortOrder = Math.max(...incompleteTasks.map(t => t.sortOrder), -1);
      const sortOrder = taskData.priority === 'high' ? 0 : maxSortOrder + 1;
      
      // If high priority, shift other incomplete tasks down
      if (taskData.priority === 'high') {
        const updates = incompleteTasks.map((task, index) => ({
          id: task.id,
          sort_order: index + 1
        }));
        
        for (const update of updates) {
          await supabase
            .from('tasks')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id)
            .eq('user_id', currentUser.id);
        }
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

      const newTask: Task = {
        id: data.id,
        title: data.title,
        subject: data.subject || '',
        description: data.description,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        completed: data.completed,
        priority: data.priority as Task['priority'],
        status: data.status as Task['status'],
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        sortOrder: data.sort_order || 0,
        recurring: (data.recurring as Task['recurring']) || 'none',
      };

      // Refresh tasks to get updated sort order
      await fetchTasks();
      toast.success('Task created successfully');
    } catch (error: any) {
      toast.error('Failed to create task');
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) {
      // Guest mode: Update local state only
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ));
      return;
    }

    // Capture original before optimistic update so we can revert on failure
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
        if (originalTask) {
          setTasks(prev => prev.map(t => t.id === taskId ? originalTask! : t));
        }
        // Constraint violation on status — tell the user what's needed
        if (error.code === '23514' && updates.status !== undefined) {
          toast.error('Run the DB migration in Supabase dashboard to enable Review/Blocked statuses.');
        } else {
          toast.error('Failed to update task');
        }
        console.error('Error updating task:', error);
      }
    } catch (error: any) {
      if (originalTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? originalTask! : t));
      }
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) {
      // Guest mode: Remove from local state only
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted (Guest Mode)');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error: any) {
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
      completedAt: newCompleted ? new Date() : undefined
    });

    // Auto-create next instance for recurring tasks
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
      shouldShowFeedback: newCompleted && showFeedback
    };
  };

  const reorderTasks = async (newOrder: Task[]) => {
    // Update local state immediately for responsive UI
    const updatedTasks = [...tasks];
    const incompleteTasks = newOrder.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);
    
    // Update sort order for incomplete tasks
    incompleteTasks.forEach((task, index) => {
      const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex] = { ...task, sortOrder: index };
      }
    });
    
    setTasks([...incompleteTasks.map((task, index) => ({ ...task, sortOrder: index })), ...completedTasks]);
    
    if (!user) {
      // Guest mode: only update local state
      return;
    }

    try {
      // Batch update all incomplete tasks with new sort order
      for (let i = 0; i < incompleteTasks.length; i++) {
        await supabase
          .from('tasks')
          .update({ sort_order: i })
          .eq('id', incompleteTasks[i].id)
          .eq('user_id', user.id);
      }
    } catch (error: any) {
      toast.error('Failed to save task order');
      console.error('Error updating task order:', error);
      // Revert to original order on error
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
    refreshTasks: fetchTasks
  };
}