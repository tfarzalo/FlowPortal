import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
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
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timed out while loading auth session'));
      }, timeoutMs);
      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  };

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 8000);

    if (!isSupabaseConfigured) {
      console.error('[Auth] Supabase credentials are missing.');
      setLoading(false);
      return () => clearTimeout(safetyTimer);
    }

    // Check active session
    withTimeout(supabase.auth.getSession(), 8000)
      .then(({ data: { session } }) => {
        if (session?.user) {
          loadUserData(session.user);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('[Auth] Session load timed out:', error);
        setLoading(false);
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

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Query the users table to get role and other info
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('[Auth] Error loading user data:', error);
      }

      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'user',
        _id: supabaseUser.id,
      };

      const userData: User = data
        ? {
            id: data.id,
            email: data.email,
            role: data.role || 'user',
            _id: data.id,
          }
        : fallbackUser;

      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      console.error('[Auth] Error in loadUserData:', err);
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'user',
        _id: supabaseUser.id,
      };
      setUser(fallbackUser);
      setIsAuthenticated(true);
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase credentials are missing.');
      }

      setLoading(true);
      console.log('[Auth] Attempting login for:', email);
      
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        8000
      );

      if (error) {
        console.error('[Auth] Login error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('[Auth] Login successful');
        return await loadUserData(data.user);
      }
      throw new Error('Login succeeded but no user returned');
    } catch (error) {
      setLoading(false);
      console.error('[Auth] Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase credentials are missing.');
      }

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
