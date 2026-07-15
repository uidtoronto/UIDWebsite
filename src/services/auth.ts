import type { AuthResult, Profile } from '../types';
import { supabase } from '../lib/supabase';

export interface SignUpInput {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
  remember?: boolean;
}

export interface UpdateProfileInput {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  avatar_url?: string;
  membership_status?: import('../types').MembershipStatus;
  membership_type?: import('../types').MembershipType;
  renewal_date?: string | null;
}

function mapUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Profile {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    first_name: (meta.first_name as string) ?? '',
    last_name: (meta.last_name as string) ?? '',
    username: (meta.username as string) ?? '',
    email: user.email ?? '',
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

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        first_name: input.first_name,
        last_name: input.last_name,
        username: input.username,
        membership_status: 'pending',
        membership_type: 'individual',
        exec_role: 'member',
        is_exec: false,
      },
    },
  });
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Signup failed' };
  return { user: mapUser(data.user) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.emailOrUsername.includes('@')
    ? input.emailOrUsername
    : input.emailOrUsername + '@uid-toronto.ca';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Login failed' };
  return { user: mapUser(data.user) };
}

export async function logout(): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
}

export async function getCurrentUser(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return mapUser(user);
}

export async function forgotPassword(email: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message };
}

export async function resetPassword(newPassword: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message };
}

export async function updateProfile(updates: UpdateProfileInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.updateUser({ data: updates });
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Update failed' };
  return { user: mapUser(data.user) };
}
