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
  const initialAdminEmails = String((import.meta as any).env?.VITE_INITIAL_ADMIN_EMAILS || '').toLowerCase()
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.error('[Auth] Supabase credentials are missing.');
      setLoading(false);
      return;
    }

    let mounted = true;

    // Check active session - optimized for speed
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          // Only load user data if there's an active session
          loadUserData(session.user);
        } else {
          // No session - set loading to false immediately
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('[Auth] Error loading session:', error);
        if (mounted) {
          setLoading(false);
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('[Auth] ===== START loadUserData =====');
    console.log('[Auth] User ID:', supabaseUser.id);
    console.log('[Auth] User Email:', supabaseUser.email);
    
    try {
      console.log('[Auth] Loading profile data for user:', supabaseUser.id);
      
      // Query the profiles table to get role and other info with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      console.log('[Auth] Profile query started...');
      
      // Add a 5 second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 5000)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      console.log('[Auth] Profile query completed');

      if (error) {
        console.error('[Auth] ❌ Error loading user data from profiles table:', error);
        console.error('[Auth] Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('[Auth] ✅ Profile data loaded:', data);
      }

      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'user',
        _id: supabaseUser.id,
      };

      let userData: User;
      const isInitialAdmin = initialAdminEmails.includes(String(supabaseUser.email || '').toLowerCase()) || 
                            supabaseUser.email?.toLowerCase() === 'design@thunderlightmedia.com';
      
      console.log('[Auth] Is initial admin?', isInitialAdmin);
      console.log('[Auth] Profile data exists?', !!data);
      
      if (data) {
        console.log('[Auth] Profile role from database:', data.role);
        // Update to admin if this is the designated admin email
        if (isInitialAdmin && data.role !== 'admin') {
          console.log('[Auth] Attempting to update user to admin role...');
          const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.id)
            .select()
            .single();
          if (!updateError && updated) {
            console.log('[Auth] ✅ Updated user to admin role');
            userData = { id: updated.id, email: updated.email, role: 'admin', _id: updated.id };
          } else {
            console.warn('[Auth] ⚠️ Failed to update user to admin:', updateError);
            userData = { id: data.id, email: data.email, role: data.role || 'user', _id: data.id };
          }
        } else {
          userData = { id: data.id, email: data.email, role: data.role || 'user', _id: data.id };
        }
      } else {
        // Profile doesn't exist, create it
        console.log('[Auth] Profile does not exist, creating new profile...');
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: supabaseUser.id, 
            email: (supabaseUser.email || '').toLowerCase(), 
            role: isInitialAdmin ? 'admin' : 'user',
            full_name: supabaseUser.user_metadata?.full_name || ''
          })
          .select()
          .single();
        if (createError) {
          console.error('[Auth] ❌ Error provisioning profile:', createError);
          userData = fallbackUser;
        } else {
          console.log('[Auth] ✅ Profile created successfully');
          userData = { id: created.id, email: created.email, role: created.role || (isInitialAdmin ? 'admin' : 'user'), _id: created.id };
        }
      }

      console.log('[Auth] Final user data:', { id: userData.id, email: userData.email, role: userData.role });
      console.log('[Auth] ===== END loadUserData =====');
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      console.error('[Auth] ❌❌❌ EXCEPTION in loadUserData:', err);
      const isInitialAdmin = initialAdminEmails.includes(String(supabaseUser.email || '').toLowerCase()) || 
                            supabaseUser.email?.toLowerCase() === 'design@thunderlightmedia.com';
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: isInitialAdmin ? 'admin' : 'user',
        _id: supabaseUser.id,
      };
      console.log('[Auth] Using fallback user:', fallbackUser);
      setUser(fallbackUser);
      setIsAuthenticated(true);
      return fallbackUser;
    } finally {
      console.log('[Auth] Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase credentials are missing.');
      }

      console.log('[Auth] Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', error.message, error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('[Auth] Login successful, user ID:', data.user.id);
        const provisional: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: initialAdminEmails.includes(String(data.user.email || '').toLowerCase()) || 
                data.user.email?.toLowerCase() === 'design@thunderlightmedia.com' ? 'admin' : 'user',
          _id: data.user.id,
        };
        setUser(provisional);
        setIsAuthenticated(true);
        const fullUserData = await loadUserData(data.user);
        console.log('[Auth] Full user data loaded, role:', fullUserData.role);
        return fullUserData;
      }
      throw new Error('Login succeeded but no user returned');
    } catch (error) {
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
      
      const { error } = await supabase.auth.signUp({
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
