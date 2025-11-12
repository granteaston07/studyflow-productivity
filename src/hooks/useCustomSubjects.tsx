import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCustomSubjects() {
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
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
      
      // Fetch display names
      const { data: displayData } = await supabase
        .from('subject_display_names')
        .select('actual_name, display_name')
        .eq('user_id', user.id);
      
      const namesMap: Record<string, string> = {};
      displayData?.forEach(item => {
        namesMap[item.actual_name] = item.display_name;
      });
      setDisplayNames(namesMap);
    } catch (error) {
      console.error('Error fetching custom subjects:', error);
      setCustomSubjects([]);
      setDisplayNames({});
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

  const updateDisplayName = async (actualName: string, displayName: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('subject_display_names')
        .upsert({
          user_id: user.id,
          actual_name: actualName,
          display_name: displayName
        }, {
          onConflict: 'user_id,actual_name'
        });

      if (error) throw error;

      setDisplayNames(prev => ({ ...prev, [actualName]: displayName }));
      return true;
    } catch (error) {
      console.error('Error updating display name:', error);
      return false;
    }
  };

  const getDisplayName = (actualName: string) => {
    return displayNames[actualName] || actualName;
  };

  const allSubjects = [...defaultSubjects, ...customSubjects];

  return {
    defaultSubjects,
    customSubjects,
    allSubjects,
    loading,
    addCustomSubject,
    deleteCustomSubject,
    updateDisplayName,
    getDisplayName,
    displayNames,
    refetch: fetchCustomSubjects
  };
}