import { supabase } from '../lib/supabase';
import type {
  Member,
  MemberInput,
  MemberSortKey,
  MemberStatus,
  SortDirection,
  MemberStats,
} from '../types';

const TABLE = 'members';

// ── Fetch a single page of members with sorting, filtering, search ──
export interface ListParams {
  page: number;            // 1-indexed
  pageSize: number;
  sortBy: MemberSortKey;
  sortDir: SortDirection;
  status?: MemberStatus | 'all';
  search?: string;
}

export interface ListResult {
  data: Member[];
  total: number;
}

// Map the UI sort key to the Supabase column(s) used in ORDER BY.
function sortColumn(sortBy: MemberSortKey): string {
  switch (sortBy) {
    case 'name': return 'first_name'; // last_name handled as secondary in query
    case 'email': return 'email';
    case 'city': return 'city';
    case 'created_at': return 'created_at';
  }
}

export async function listMembers(params: ListParams): Promise<{ data: ListResult | null; error: string | null }> {
  const { page, pageSize, sortBy, sortDir, status, search } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from(TABLE).select('*', { count: 'exact' });

  // status filter
  if (status && status !== 'all') q = q.eq('status', status);

  // search across name + email (case-insensitive)
  if (search && search.trim()) {
    const s = search.trim();
    q = q.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`);
  }

  // sort (name uses first_name then last_name as secondary)
  q = q.order(sortColumn(sortBy), { ascending: sortDir === 'asc' });
  if (sortBy === 'name') {
    q = q.order('last_name', { ascending: sortDir === 'asc' });
  }

  q = q.range(from, to);

  const { data, count, error } = await q;
  if (error) return { data: null, error: error.message };
  return { data: { data: (data as Member[]) ?? [], total: count ?? 0 }, error: null };
}

// ── Fetch one member ──
export async function getMember(id: string): Promise<{ data: Member | null; error: string | null }> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data as Member | null, error: null };
}

// ── Fetch recent members for dashboard (no pagination) ──
export async function getRecentMembers(limit = 5): Promise<{ data: Member[]; error: string | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { data: [], error: error.message };
  return { data: (data as Member[]) ?? [], error: null };
}

// ── Fetch aggregate stats for the dashboard ──
export async function getMemberStats(): Promise<{ data: MemberStats | null; error: string | null }> {
  const statuses: MemberStatus[] = ['active', 'inactive', 'pending', 'suspended'];

  // Fetch total count + per-status counts in parallel
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
