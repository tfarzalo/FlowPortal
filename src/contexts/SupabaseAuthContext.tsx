import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  _id?: string; // For backward compatibility
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Query the users table to get role and other info
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', supabaseUser.email)
        .single();

      if (error) {
        console.error('[Auth] Error loading user data:', error);
        // If user doesn't exist in users table, create with default role
        const newUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          role: 'user',
          _id: supabaseUser.id,
        };
        setUser(newUser);
        setIsAuthenticated(true);
      } else {
        const userData: User = {
          id: data.id,
          email: data.email,
          role: data.role || 'user',
          _id: data.id,
        };
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('[Auth] Error in loadUserData:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('[Auth] Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('[Auth] Login successful');
        await loadUserData(data.user);
      }
    } catch (error) {
      setLoading(false);
      console.error('[Auth] Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('[Auth] Attempting registration for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Registration error:', error);
        throw new Error(error.message);
      }

      console.log('[Auth] Registration successful');
      // Note: User may need to verify email depending on Supabase settings
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logging out');
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
