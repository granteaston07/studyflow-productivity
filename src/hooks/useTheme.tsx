import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark
  const [mounted, setMounted] = useState(false);

  // Load theme preference on mount and when user changes
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        // Load from user profile
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!error && data?.theme_preference) {
            setThemeState(data.theme_preference as Theme);
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
        }
      } else {
        // Load from localStorage for guest users
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      }
      setMounted(true);
    };

    loadTheme();
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);

    if (user) {
      // Save to user profile
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            theme_preference: newTheme,
            email: user.email,
            display_name: user.user_metadata?.display_name
          });

        if (error) {
          console.error('Error saving theme preference:', error);
        }
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('theme', newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}