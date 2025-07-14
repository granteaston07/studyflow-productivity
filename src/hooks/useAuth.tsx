import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  themePreference: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateThemePreference: (theme: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [themePreference, setThemePreference] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load user's theme preference
          const { data } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('user_id', session.user.id)
            .single();
          
          if (data?.theme_preference) {
            setThemePreference(data.theme_preference);
          }
        } else {
          setThemePreference(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Load user's theme preference
        const { data } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('user_id', session.user.id)
          .single();
        
        if (data?.theme_preference) {
          setThemePreference(data.theme_preference);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to verify.');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
    }

    return { error };
  };

  const updateThemePreference = async (theme: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          theme_preference: theme,
          updated_at: new Date().toISOString()
        });
      
      if (!error) {
        setThemePreference(theme);
      }
    } catch (err) {
      console.error('Error updating theme preference:', err);
    }
  };

  const signOut = async () => {
    try {
      // Always clear local state first to ensure UI updates immediately
      setSession(null);
      setUser(null);
      setThemePreference(null);
      
      // Clear localStorage manually to ensure session is removed
      localStorage.removeItem('sb-kofbhggloaapndnuhmsc-auth-token');
      
      // Attempt to sign out from server
      const { error } = await supabase.auth.signOut();
      
      // Handle session not found errors gracefully - user is effectively logged out
      if (error && (error.message.includes('Session not found') || error.message.includes('session_not_found'))) {
        toast.success('Signed out successfully');
        return;
      }
      
      if (error) {
        // For other errors, still show success since local state is cleared
        console.warn('Sign out warning:', error.message);
        toast.success('Signed out successfully');
      } else {
        toast.success('Signed out successfully');
      }
    } catch (err) {
      // Catch any network or other errors
      console.warn('Sign out error:', err);
      toast.success('Signed out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      themePreference,
      signUp,
      signIn,
      signOut,
      updateThemePreference
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}