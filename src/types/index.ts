// ───────────────────────────────────────────────────────────
// Database Types
// ───────────────────────────────────────────────────────────

export type MembershipType = 'student' | 'individual' | 'family' | 'lifetime';
export type MembershipStatus = 'active' | 'expired' | 'pending' | 'suspended';
export type ExecRole = 'admin' | 'regional_president' | 'executive' | 'youth_branch' | 'womens_branch' | 'volunteer_coordinator' | 'media_team' | 'finance_team' | 'member';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string | null;
  membership_type: MembershipType;
  membership_status: MembershipStatus;
  renewal_date: string | null;
  discount_code: string | null;
  avatar_url: string | null;
  exec_role?: ExecRole;
  is_exec?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Membership {
  id: string;
  profile_id: string;
  type: MembershipType;
  status: MembershipStatus;
  start_date: string;
  renewal_date: string | null;
  price_paid: number;
  payment_id?: string | null;
  created_at?: string;
}

export interface MemberEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string | null;
  url?: string | null;
}

export interface MemberNews {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  url?: string | null;
  image_url?: string | null;
}

export interface AuthSession {
  user: Profile | null;
  isAuthenticated: boolean;
}

export interface AuthResult {
  user: Profile | null;
  error?: string;
}

// ── Exec Dashboard Types ────────────────────────────────────

export interface ExecMember {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  title?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CrmMember {
  id: string;
  uid_member_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  occupation?: string;
  company?: string;
  member_type?: string;
  membership_status?: string;
  membership_expiry?: string | null;
  volunteer_interests?: string[];
  notes?: string;
  tags?: string[];
  family_members?: object[];
  emergency_contact?: object;
  created_at?: string;
  updated_at?: string;
}

export interface ExecEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  google_maps_url?: string;
  zoom_url?: string;
  organizer_id?: string;
  status?: string;
  expected_attendance?: number;
  actual_attendance?: number;
  budget?: number;
  notes?: string;
  created_at?: string;
}

export interface ExecMeeting {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time?: string;
  location?: string;
  zoom_url?: string;
  status?: string;
  agenda?: string;
  notes?: string;
  minutes?: string;
  action_items?: ActionItem[];
  created_at?: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  due_date?: string;
  done: boolean;
}

export interface ExecTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'waiting' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  progress?: number;
  assigned_to?: string | null;
  assigned_by?: string | null;
  tags?: string[];
  position?: number;
  created_at?: string;
}

export interface FinanceTransaction {
  id: string;
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  reference?: string;
  transaction_date: string;
  created_at?: string;
}

export interface ExecNotification {
  id: string;
  recipient_id?: string;
  title: string;
  body?: string;
  notif_type?: string;
  is_read: boolean;
  link?: string;
  created_at?: string;
}

// ───────────────────────────────────────────────────────────
// Member Management Types
// ───────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type PaymentStatus = 'pending' | 'active' | 'failed' | 'cancelled';
export type RegistrationMembershipType = 'adult' | 'student' | 'pensioner';

export interface FamilyMember {
  id?: string;
  member_id?: string;
  full_name: string;
  age?: number | null;
  gender?: 'male' | 'female' | null;
  member_type?: 'adult' | 'child' | null;
  created_at?: string;
}

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  city?: string | null;
  status: MemberStatus;
  created_at: string;
  // Extended registration fields
  birth_date?: string | null;
  mobile_phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  membership_type?: RegistrationMembershipType | null;
  is_family?: boolean;
  payment_status?: PaymentStatus;
  stripe_customer_id?: string | null;
  stripe_checkout_id?: string | null;
  stripe_session_id?: string | null;
  updated_at?: string;
  family_members?: FamilyMember[];
}

// Row shape for create/update operations (id + created_at are server-managed)
export type MemberInput = Omit<Member, 'id' | 'created_at' | 'family_members'>;

export type MemberSortKey = 'name' | 'email' | 'city' | 'membership_type' | 'status' | 'created_at';

export type SortDirection = 'asc' | 'desc';

export interface MemberStats {
  total: number;
  byStatus: { status: MemberStatus; count: number }[];
  byMembershipType: { type: RegistrationMembershipType; count: number }[];
  byPaymentStatus: { status: PaymentStatus; count: number }[];
  activeSubscriptions: number;
}

export interface RegistrationInput {
  first_name: string;
  last_name: string;
  birth_date: string;
  email: string;
  mobile_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  membership_type: RegistrationMembershipType;
  is_family: boolean;
  family_members?: FamilyMember[];
}
