import { supabase } from '../lib/supabase';
import type {
  Member,
  MemberInput,
  MemberSortKey,
  MemberStatus,
  SortDirection,
  MemberStats,
  PaymentStatus,
  RegistrationMembershipType,
  FamilyMember,
} from '../types';

const TABLE = 'members';

// ── Fetch a single page of members with sorting, filtering, search ──
export interface ListParams {
  page: number;
  pageSize: number;
  sortBy: MemberSortKey;
  sortDir: SortDirection;
  status?: MemberStatus | 'all';
  membershipType?: RegistrationMembershipType | 'all';
  paymentStatus?: PaymentStatus | 'all';
  search?: string;
}

export interface ListResult {
  data: Member[];
  total: number;
}

function sortColumn(sortBy: MemberSortKey): string {
  switch (sortBy) {
    case 'name': return 'first_name';
    case 'email': return 'email';
    case 'city': return 'city';
    case 'created_at': return 'created_at';
  }
}

export async function listMembers(params: ListParams): Promise<{ data: ListResult | null; error: string | null }> {
  const { page, pageSize, sortBy, sortDir, status, membershipType, paymentStatus, search } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from(TABLE).select('*', { count: 'exact' });

  if (status && status !== 'all') q = q.eq('status', status);
  if (membershipType && membershipType !== 'all') q = q.eq('membership_type', membershipType);
  if (paymentStatus && paymentStatus !== 'all') q = q.eq('payment_status', paymentStatus);

  if (search && search.trim()) {
    const s = search.trim();
    q = q.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`);
  }

  q = q.order(sortColumn(sortBy), { ascending: sortDir === 'asc' });
  if (sortBy === 'name') {
    q = q.order('last_name', { ascending: sortDir === 'asc' });
  }

  q = q.range(from, to);

  const { data, count, error } = await q;
  if (error) return { data: null, error: error.message };
  return { data: { data: (data as Member[]) ?? [], total: count ?? 0 }, error: null };
}

// ── Fetch one member with family members ──
export async function getMember(id: string): Promise<{ data: Member | null; error: string | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, family_members(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data as Member | null, error: null };
}

// ── Fetch family members for a member ──
export async function getFamilyMembers(memberId: string): Promise<{ data: FamilyMember[]; error: string | null }> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data as FamilyMember[]) ?? [], error: null };
}

// ── Fetch recent members for dashboard ──
export async function getRecentMembers(limit = 5): Promise<{ data: Member[]; error: string | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { data: [], error: error.message };
  return { data: (data as Member[]) ?? [], error: null };
}

// ── Fetch aggregate stats ──
export async function getMemberStats(): Promise<{ data: MemberStats | null; error: string | null }> {
  const statuses: MemberStatus[] = ['active', 'inactive', 'pending', 'suspended'];

  const totalReq = supabase.from(TABLE).select('*', { count: 'exact', head: true });
  const statusReqs = statuses.map(s =>
    supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('status', s),
  );
  const [total, ...rest] = await Promise.all([totalReq, ...statusReqs]);

  if (total.error) return { data: null, error: total.error.message };

  const byStatus = statuses.map((status, i) => ({
    status,
    count: rest[i].count ?? 0,
  }));

  return { data: { total: total.count ?? 0, byStatus }, error: null };
}

// ── Create ──
export async function createMember(input: MemberInput): Promise<{ data: Member | null; error: string | null }> {
  const { data, error } = await supabase.from(TABLE).insert(input).select().maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data as Member | null, error: null };
}

// ── Update ──
export async function updateMember(id: string, input: Partial<MemberInput>): Promise<{ data: Member | null; error: string | null }> {
  const { data, error } = await supabase.from(TABLE).update(input).eq('id', id).select().maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data as Member | null, error: null };
}

// ── Delete ──
export async function deleteMember(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ── Export all members (with family members) as CSV ──
export async function exportMembersCsv(): Promise<{ data: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, family_members(*)')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: error.message };

  const members = (data as (Member & { family_members: FamilyMember[] })[]) ?? [];
  const headers = [
    'First Name', 'Last Name', 'Email', 'Mobile', 'Birthdate',
    'Address', 'Address 2', 'City', 'Province', 'Postal Code', 'Country',
    'Membership Type', 'Is Family', 'Payment Status', 'Status', 'Joined',
    'Family Members',
  ];

  const escape = (v: string | null | undefined) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = members.map(m => {
    const fam = (m.family_members ?? [])
      .map(fm => `${fm.full_name} (${fm.age ?? '?'} / ${fm.gender ?? '?'})`)
      .join('; ');
    return [
      escape(m.first_name), escape(m.last_name), escape(m.email), escape(m.mobile_phone ?? m.phone),
      escape(m.birth_date), escape(m.address_line1), escape(m.address_line2),
      escape(m.city), escape(m.province), escape(m.postal_code), escape(m.country),
      escape(m.membership_type), escape(m.is_family ? 'Yes' : 'No'),
      escape(m.payment_status), escape(m.status), escape(m.created_at),
      escape(fam),
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  return { data: csv, error: null };
}
