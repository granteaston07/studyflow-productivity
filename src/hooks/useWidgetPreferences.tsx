import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface WidgetPreferences {
  show_ai_prioritization: boolean;
  show_progress_tracker: boolean;
  show_study_links: boolean;
  show_quick_notes: boolean;
  show_focus_timer: boolean;
  show_analytics_dashboard: boolean;
  show_learning_insights: boolean;
  show_study_calendar: boolean;
  show_floating_status: boolean;
}

const defaultPreferences: WidgetPreferences = {
  show_ai_prioritization: true,
  show_progress_tracker: true,
  show_study_links: true,
  show_quick_notes: true,
  show_focus_timer: true,
  show_analytics_dashboard: true,
  show_learning_insights: true,
  show_study_calendar: true,
  show_floating_status: true,
};

export function useWidgetPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<WidgetPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  // Load preferences from database or localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        // Load from Supabase for logged-in users
        const { data, error } = await supabase
          .from('widget_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading widget preferences:', error);
        } else if (data) {
          setPreferences({
            show_ai_prioritization: data.show_ai_prioritization,
            show_progress_tracker: data.show_progress_tracker,
            show_study_links: data.show_study_links,
            show_quick_notes: data.show_quick_notes,
            show_focus_timer: data.show_focus_timer,
            show_analytics_dashboard: data.show_analytics_dashboard,
            show_learning_insights: data.show_learning_insights,
            show_study_calendar: data.show_study_calendar,
            show_floating_status: data.show_floating_status,
          });
        }
      } else {
        // Load from localStorage for guest users
        const stored = localStorage.getItem('widget_preferences');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setPreferences({ ...defaultPreferences, ...parsed });
          } catch (e) {
            console.error('Error parsing widget preferences from localStorage:', e);
          }
        }
      }
      setLoading(false);
    };

    loadPreferences();
  }, [user]);

  const updatePreference = useCallback(async (key: keyof WidgetPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    if (user) {
      // Save to Supabase for logged-in users
      const { data: existing } = await supabase
        .from('widget_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('widget_preferences')
          .update({ [key]: value })
          .eq('user_id', user.id);
      } else {
        // Insert new record
        await supabase
          .from('widget_preferences')
          .insert({
            user_id: user.id,
            ...newPreferences,
          });
      }
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('widget_preferences', JSON.stringify(newPreferences));
    }
  }, [user, preferences]);

  return {
    preferences,
    loading,
    updatePreference,
  };
}
