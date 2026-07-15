import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Profile } from '../types';
import * as authService from '../services/auth';
import { supabase } from '../lib/supabase';

interface AuthResult {
  error?: string;
  user?: Profile | null;
}

interface AuthContextValue {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPending: boolean;
  error: string | null;
  signUp: (input: authService.SignUpInput) => Promise<AuthResult>;
  login: (input: authService.LoginInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (pw: string) => Promise<AuthResult>;
  updateProfile: (updates: authService.UpdateProfileInput) => Promise<AuthResult>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapSupabaseUser(supaUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Profile {
  const meta = supaUser.user_metadata ?? {};
  return {
    id: supaUser.id,
    first_name: (meta.first_name as string) ?? '',
    last_name: (meta.last_name as string) ?? '',
    username: (meta.username as string) ?? supaUser.email?.split('@')[0] ?? '',
    email: supaUser.email ?? '',
    phone: (meta.phone as string) ?? null,
    membership_type: (meta.membership_type as Profile['membership_type']) ?? 'individual',
    membership_status: (meta.membership_status as Profile['membership_status']) ?? 'pending',
    renewal_date: (meta.renewal_date as string) ?? null,
    discount_code: (meta.discount_code as string) ?? null,
    avatar_url: (meta.avatar_url as string) ?? null,
    exec_role: (meta.exec_role as Profile['exec_role']) ?? 'member',
    is_exec: (meta.is_exec as boolean) ?? false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(mapSupabaseUser(session.user));
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const wrap = async (fn: () => Promise<{ user?: Profile | null; error?: string }>): Promise<AuthResult> => {
    setIsPending(true);
    setError(null);
    try {
      const res = await fn();
      if (res.error) {
        setError(res.error);
        return { error: res.error };
      }
      if (res.user !== undefined) {
        if (res.user) setUser(res.user);
        return { user: res.user };
      }
      return {};
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
      return { error: msg };
    } finally {
      setIsPending(false);
    }
  };

  const signUp = useCallback(
    (input: authService.SignUpInput) => wrap(() => authService.signUp(input)),
    [],
  );

  const login = useCallback(
    (input: authService.LoginInput) => wrap(() => authService.login(input)),
    [],
  );

  const logout = useCallback(async () => {
    setIsPending(true);
    await authService.logout();
    setUser(null);
    setIsPending(false);
  }, []);

  const forgotPassword = useCallback(
    (email: string) => wrap(() => authService.forgotPassword(email).then(r => ({ user: null, ...r }))),
    [],
  );

  const resetPassword = useCallback(
    (pw: string) => wrap(() => authService.resetPassword(pw).then(r => ({ user: null, ...r }))),
    [],
  );

  const updateProfile = useCallback(
    (updates: authService.UpdateProfileInput) => wrap(() => authService.updateProfile(updates)),
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isPending,
    error,
    signUp,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
