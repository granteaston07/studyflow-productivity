import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCustomSubjects() {
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const defaultSubjects = [
    'Math',
    'Language', 
    'English',
    'Science',
    'History',
    'Personal'
  ];

  const fetchCustomSubjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_subjects')
        .select('name')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      setCustomSubjects(data?.map(item => item.name) || []);
    } catch (error) {
      console.error('Error fetching custom subjects:', error);
      setCustomSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const addCustomSubject = async (name: string) => {
    if (!user || !name.trim()) return false;

    const trimmedName = name.trim();
    
    // Check if subject already exists (case-insensitive)
    const allSubjects = [...defaultSubjects, ...customSubjects];
    if (allSubjects.some(subject => subject.toLowerCase() === trimmedName.toLowerCase())) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('custom_subjects')
        .insert({
          user_id: user.id,
          name: trimmedName
        });

      if (error) throw error;

      setCustomSubjects(prev => [...prev, trimmedName].sort());
      return true;
    } catch (error) {
      console.error('Error adding custom subject:', error);
      return false;
    }
  };

  const deleteCustomSubject = async (name: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('custom_subjects')
        .delete()
        .eq('user_id', user.id)
        .eq('name', name);

      if (error) throw error;

      setCustomSubjects(prev => prev.filter(subject => subject !== name));
      return true;
    } catch (error) {
      console.error('Error deleting custom subject:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCustomSubjects();
  }, [user]);

  const allSubjects = [...defaultSubjects, ...customSubjects];

  return {
    defaultSubjects,
    customSubjects,
    allSubjects,
    loading,
    addCustomSubject,
    deleteCustomSubject,
    refetch: fetchCustomSubjects
  };
}