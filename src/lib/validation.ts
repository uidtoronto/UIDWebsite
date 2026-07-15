import { z } from 'zod';

// Member statuses kept in sync with the MemberStatus type and DB default.
export const MEMBER_STATUSES = ['active', 'inactive', 'pending', 'suspended'] as const;

// Zod schema for member create/edit. Email is validated server-side too,
// but we validate here for immediate feedback.
export const memberSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(80, 'Too long'),
  last_name: z.string().min(1, 'Last name is required').max(80, 'Too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().max(30, 'Too long').optional().or(z.literal('')),
  city: z.string().max(80, 'Too long').optional().or(z.literal('')),
  status: z.enum(MEMBER_STATUSES),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

// ── Auth schemas ──
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(80),
  last_name: z.string().min(1, 'Last name is required').max(80),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SignupValues = z.infer<typeof signupSchema>;
