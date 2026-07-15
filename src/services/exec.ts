import { supabase } from '../lib/supabase';
import type { CrmMember, ExecEvent, ExecMeeting, ExecTask, FinanceTransaction, ExecNotification, ExecMember } from '../types';

// ── Exec Members ────────────────────────────────────────────────
export async function getExecMembers() {
  const { data, error } = await supabase.from('exec_members').select('*').order('first_name');
  return { data: (data as ExecMember[]) ?? [], error };
}

// ── CRM ─────────────────────────────────────────────────────────
export async function getCrmMembers(search?: string) {
  let q = supabase.from('exec_crm_members').select('*').order('first_name');
  if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,uid_member_id.ilike.%${search}%`);
  const { data, error } = await q;
  return { data: (data as CrmMember[]) ?? [], error };
}

export async function getCrmMember(id: string) {
  const { data, error } = await supabase.from('exec_crm_members').select('*').eq('id', id).maybeSingle();
  return { data: data as CrmMember | null, error };
}

export async function upsertCrmMember(member: Partial<CrmMember> & { id?: string }) {
  const { data, error } = await supabase.from('exec_crm_members').upsert(member).select().maybeSingle();
  return { data: data as CrmMember | null, error };
}

export async function deleteCrmMember(id: string) {
  return supabase.from('exec_crm_members').delete().eq('id', id);
}

export async function getCrmNotes(memberId: string) {
  const { data, error } = await supabase.from('exec_crm_notes').select('*').eq('member_id', memberId).order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function addCrmNote(memberId: string, content: string, noteType = 'note') {
  const { data, error } = await supabase.from('exec_crm_notes').insert({ member_id: memberId, content, note_type: noteType }).select().maybeSingle();
  return { data, error };
}

// ── Events / Calendar ────────────────────────────────────────────
export async function getEvents(from?: string, to?: string) {
  let q = supabase.from('exec_events').select('*').order('start_datetime');
  if (from) q = q.gte('start_datetime', from);
  if (to) q = q.lte('start_datetime', to);
  const { data, error } = await q;
  return { data: (data as ExecEvent[]) ?? [], error };
}

export async function upsertEvent(event: Partial<ExecEvent> & { id?: string }) {
  const { data, error } = await supabase.from('exec_events').upsert(event).select().maybeSingle();
  return { data: data as ExecEvent | null, error };
}

export async function deleteEvent(id: string) {
  return supabase.from('exec_events').delete().eq('id', id);
}

export async function getEventRsvps(eventId: string) {
  const { data, error } = await supabase.from('exec_event_rsvps').select('*').eq('event_id', eventId);
  return { data: data ?? [], error };
}

// ── Meetings ─────────────────────────────────────────────────────
export async function getMeetings() {
  const { data, error } = await supabase.from('exec_meetings').select('*').order('meeting_date', { ascending: false });
  return { data: (data as ExecMeeting[]) ?? [], error };
}

export async function upsertMeeting(meeting: Partial<ExecMeeting> & { id?: string }) {
  const { data, error } = await supabase.from('exec_meetings').upsert(meeting).select().maybeSingle();
  return { data: data as ExecMeeting | null, error };
}

export async function deleteMeeting(id: string) {
  return supabase.from('exec_meetings').delete().eq('id', id);
}

// ── Tasks ─────────────────────────────────────────────────────────
export async function getTasks() {
  const { data, error } = await supabase.from('exec_tasks').select('*').order('position');
  return { data: (data as ExecTask[]) ?? [], error };
}

export async function upsertTask(task: Partial<ExecTask> & { id?: string }) {
  const { data, error } = await supabase.from('exec_tasks').upsert(task).select().maybeSingle();
  return { data: data as ExecTask | null, error };
}

export async function deleteTask(id: string) {
  return supabase.from('exec_tasks').delete().eq('id', id);
}

// ── Finance ──────────────────────────────────────────────────────
export async function getTransactions() {
  const { data, error } = await supabase.from('exec_finance_transactions').select('*').order('transaction_date', { ascending: false });
  return { data: (data as FinanceTransaction[]) ?? [], error };
}

export async function upsertTransaction(tx: Partial<FinanceTransaction> & { id?: string }) {
  const { data, error } = await supabase.from('exec_finance_transactions').upsert(tx).select().maybeSingle();
  return { data: data as FinanceTransaction | null, error };
}

export async function deleteTransaction(id: string) {
  return supabase.from('exec_finance_transactions').delete().eq('id', id);
}

// ── Notifications ─────────────────────────────────────────────────
export async function getNotifications() {
  const { data, error } = await supabase.from('exec_notifications').select('*').order('created_at', { ascending: false }).limit(50);
  return { data: (data as ExecNotification[]) ?? [], error };
}

export async function markNotificationRead(id: string) {
  return supabase.from('exec_notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead() {
  return supabase.from('exec_notifications').update({ is_read: true }).eq('is_read', false);
}

// ── Call Log ──────────────────────────────────────────────────────
export async function getCallLog(memberId?: string) {
  let q = supabase.from('exec_call_log').select('*, exec_crm_members(first_name, last_name, phone)').order('created_at', { ascending: false });
  if (memberId) q = q.eq('member_id', memberId);
  const { data, error } = await q;
  return { data: data ?? [], error };
}

export async function addCallLog(entry: { member_id: string; call_outcome: string; notes?: string; follow_up_date?: string }) {
  const { data, error } = await supabase.from('exec_call_log').insert(entry).select().maybeSingle();
  return { data, error };
}

// ── Volunteers ────────────────────────────────────────────────────
export async function getVolunteers() {
  const { data, error } = await supabase.from('exec_volunteers').select('*, exec_crm_members(first_name, last_name, email, phone)').order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

// ── Documents ─────────────────────────────────────────────────────
export async function getDocuments(folder?: string) {
  let q = supabase.from('exec_documents').select('*').order('created_at', { ascending: false });
  if (folder) q = q.eq('folder', folder);
  const { data, error } = await q;
  return { data: data ?? [], error };
}

export async function upsertDocument(doc: { id?: string; name: string; folder: string; file_url?: string; file_type?: string; description?: string; tags?: string[] }) {
  const { data, error } = await supabase.from('exec_documents').upsert(doc).select().maybeSingle();
  return { data, error };
}

export async function deleteDocument(id: string) {
  return supabase.from('exec_documents').delete().eq('id', id);
}
