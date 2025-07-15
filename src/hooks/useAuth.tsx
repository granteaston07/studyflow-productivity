import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
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

  const signOut = async () => {
    try {
      // Always clear local state first to ensure UI updates immediately
      setSession(null);
      setUser(null);
      
      // Clear localStorage manually to ensure session is removed
      localStorage.removeItem('sb-kofbhggloaapndnuhmsc-auth-token');
      
      // Attempt to sign out from server
      const { error } = await supabase.auth.signOut();
      
      // Handle session not found errors gracefully - user is effectively logged out
      if (error && (error.message.includes('Session not found') || error.message.includes('session_not_found'))) {
        toast.success('Signed out successfully');
        window.location.href = '/auth';
        return;
      }
      
      if (error) {
        // For other errors, still show success since local state is cleared
        console.warn('Sign out warning:', error.message);
        toast.success('Signed out successfully');
      } else {
        toast.success('Signed out successfully');
      }
      
      // Redirect to auth page after sign out
      window.location.href = '/auth';
    } catch (err) {
      // Catch any network or other errors
      console.warn('Sign out error:', err);
      toast.success('Signed out successfully');
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
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