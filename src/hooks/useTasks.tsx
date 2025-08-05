import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  subject: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const formattedTasks: Task[] = data.map(task => {
        const dueDate = task.due_date ? new Date(task.due_date) : undefined;
        let status = task.status as Task['status'];
        
        // Auto-update overdue status based on due date
        if (!task.completed && dueDate && dueDate < now && status !== 'overdue') {
          status = 'overdue';
          // Update in database asynchronously (fire and forget)
          supabase
            .from('tasks')
            .update({ status: 'overdue' })
            .eq('id', task.id)
            .then(() => {});
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
          updatedAt: new Date(task.updated_at)
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

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
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
        updatedAt: new Date()
      };

      setTasks(prev => [guestTask, ...prev]);
      toast.success('Task added (Guest Mode - Sign in to save permanently)');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          subject: taskData.subject,
          description: taskData.description,
          due_date: taskData.dueDate?.toISOString(),
          priority: taskData.priority,
          status: taskData.status,
          completed: taskData.completed,
          completed_at: taskData.completedAt?.toISOString()
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
        updatedAt: new Date(data.updated_at)
      };

      setTasks(prev => [newTask, ...prev]);
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

    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.completed !== undefined) {
        updateData.completed = updates.completed;
        updateData.completed_at = updates.completed ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ));
    } catch (error: any) {
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

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'completed' : 'pending';

    await updateTask(taskId, { 
      completed: newCompleted, 
      status: newStatus,
      completedAt: newCompleted ? new Date() : undefined
    });
  };

  const reorderTasks = (newOrder: Task[]) => {
    setTasks(newOrder);
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