import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Download, Edit2, Trash2, X, Filter,
  Phone, Mail, MapPin, Briefcase, Tag, Clock, CheckCircle
} from 'lucide-react';
import { getCrmMembers, upsertCrmMember, deleteCrmMember, addCrmNote, getCrmNotes } from '../../services/exec';
import type { CrmMember } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-gray-100 text-gray-600',
};

const PROVINCES = ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'];

function exportCSV(members: CrmMember[]) {
  const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'City', 'Province', 'Occupation', 'Company', 'Type', 'Status', 'Expiry'];
  const rows = members.map(m => [
    m.uid_member_id ?? '', m.first_name, m.last_name, m.email ?? '', m.phone ?? '',
    m.city ?? '', m.province ?? '', m.occupation ?? '', m.company ?? '',
    m.member_type ?? '', m.membership_status ?? '', m.membership_expiry ?? ''
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'uid-members.csv'; a.click();
  URL.revokeObjectURL(url);
}

function MemberFormModal({ member, onClose, onSave }: {
  member: Partial<CrmMember> | null;
  onClose: () => void;
  onSave: (m: Partial<CrmMember>) => void;
}) {
  const [form, setForm] = useState<Partial<CrmMember>>(member ?? {
    first_name: '', last_name: '', email: '', phone: '', city: '', province: 'ON',
    occupation: '', company: '', member_type: 'professional', membership_status: 'active', notes: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const f = (k: keyof CrmMember, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-[#061E30]">{member?.id ? 'Edit Member' : 'Add Member'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">First Name *</label>
              <input required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.first_name ?? ''} onChange={e => f('first_name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Last Name *</label>
              <input required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.last_name ?? ''} onChange={e => f('last_name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Email</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.email ?? ''} onChange={e => f('email', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Phone</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.phone ?? ''} onChange={e => f('phone', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">City</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.city ?? ''} onChange={e => f('city', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Province</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.province ?? 'ON'} onChange={e => f('province', e.target.value)}>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Occupation</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.occupation ?? ''} onChange={e => f('occupation', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Company</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.company ?? ''} onChange={e => f('company', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Member Type</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.member_type ?? 'professional'} onChange={e => f('member_type', e.target.value)}>
                <option value="professional">Professional</option>
                <option value="student">Student</option>
                <option value="family">Family</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Status</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.membership_status ?? 'active'} onChange={e => f('membership_status', e.target.value)}>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Membership Expiry</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8]" value={form.membership_expiry ?? ''} onChange={e => f('membership_expiry', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3D6480] mb-1 block">Member ID</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30" value={form.uid_member_id ?? ''} onChange={e => f('uid_member_id', e.target.value)} placeholder="UID-2026-XXX" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#3D6480] mb-1 block">Notes</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] focus:ring-1 focus:ring-[#3EC8C8]/30 resize-none" value={form.notes ?? ''} onChange={e => f('notes', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-[#3D6480] hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-60 flex items-center gap-2">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {member?.id ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function MemberDetailPanel({ member, onClose, onEdit }: {
  member: CrmMember;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [notes, setNotes] = useState<{ id: string; content: string; note_type: string; created_at: string }[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    getCrmNotes(member.id).then(r => setNotes(r.data as typeof notes));
  }, [member.id]);

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    const { data } = await addCrmNote(member.id, newNote.trim());
    if (data) setNotes(n => [data as typeof notes[0], ...n]);
    setNewNote('');
    setAddingNote(false);
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.25 }}
      className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-40 flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#061E30]">Member Profile</h2>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#3D6480]"><Edit2 size={15} /></button>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {/* Header */}
        <div className="px-5 py-5 bg-gradient-to-br from-[#F0F7FF] to-white border-b border-gray-100">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0D4D7C]/10 flex items-center justify-center">
              <span className="text-xl font-bold text-[#0D4D7C]">{member.first_name[0]}{member.last_name[0]}</span>
            </div>
            <div>
              <h3 className="font-bold text-[#061E30] text-lg">{member.first_name} {member.last_name}</h3>
              <div className="text-sm text-[#3D6480]">{member.occupation ?? '—'}{member.company ? ` · ${member.company}` : ''}</div>
              <div className="flex items-center gap-2 mt-1">
                {member.uid_member_id && <span className="text-[11px] font-mono text-[#7A9BB5]">{member.uid_member_id}</span>}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[member.membership_status ?? 'pending']}`}>
                  {member.membership_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-3">
          {[
            { icon: Mail, label: 'Email', value: member.email },
            { icon: Phone, label: 'Phone', value: member.phone },
            { icon: MapPin, label: 'Location', value: [member.city, member.province].filter(Boolean).join(', ') },
            { icon: Briefcase, label: 'Type', value: member.member_type },
            { icon: Clock, label: 'Expiry', value: member.membership_expiry ? new Date(member.membership_expiry).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
          ].map(row => row.value ? (
            <div key={row.label} className="flex items-center gap-3">
              <row.icon size={14} className="text-[#7A9BB5] flex-shrink-0" />
              <div className="text-sm text-[#061E30]">{row.value}</div>
            </div>
          ) : null)}

          {(member.tags ?? []).length > 0 && (
            <div className="flex items-start gap-3">
              <Tag size={14} className="text-[#7A9BB5] flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {(member.tags ?? []).map(tag => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 bg-[#3EC8C8]/10 text-[#2AACAC] rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {member.notes && (
            <div className="bg-gray-50 rounded-xl p-3 mt-2">
              <div className="text-xs font-medium text-[#7A9BB5] mb-1">Notes</div>
              <p className="text-sm text-[#3D6480]">{member.notes}</p>
            </div>
          )}
        </div>

        {/* Timeline / Notes */}
        <div className="px-5 pb-4">
          <div className="text-xs font-semibold text-[#3D6480] uppercase tracking-wide mb-3">Timeline</div>
          <div className="flex gap-2 mb-3">
            <input
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3EC8C8]"
              onKeyDown={e => e.key === 'Enter' && handleAddNote()}
            />
            <button
              onClick={handleAddNote}
              disabled={addingNote || !newNote.trim()}
              className="px-3 py-2 bg-[#0D4D7C] text-white text-sm rounded-xl hover:bg-[#0a3d63] transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {notes.map(note => (
              <div key={note.id} className="flex gap-3">
                <CheckCircle size={13} className="text-[#3EC8C8] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-[#061E30]">{note.content}</p>
                  <span className="text-[11px] text-[#7A9BB5]">{new Date(note.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            ))}
            {notes.length === 0 && <div className="text-sm text-[#7A9BB5] text-center py-2">No notes yet</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExecCRM() {
  const [members, setMembers] = useState<CrmMember[]>([]);
  const [filtered, setFiltered] = useState<CrmMember[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState<Partial<CrmMember> | null>(null);
  const [detailMember, setDetailMember] = useState<CrmMember | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function load(q?: string) {
    setLoading(true);
    const { data } = await getCrmMembers(q);
    setMembers(data);
    setFiltered(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let f = members;
    if (statusFilter !== 'all') f = f.filter(m => m.membership_status === statusFilter);
    if (search) f = f.filter(m =>
      `${m.first_name} ${m.last_name} ${m.email} ${m.uid_member_id}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, statusFilter, members]);

  async function handleSave(m: Partial<CrmMember>) {
    const { data } = await upsertCrmMember(m);
    if (data) {
      setMembers(prev => {
        const idx = prev.findIndex(x => x.id === data.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
        return [data, ...prev];
      });
    }
    setShowForm(false);
    setEditMember(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this member?')) return;
    await deleteCrmMember(id);
    setMembers(prev => prev.filter(m => m.id !== id));
    if (detailMember?.id === id) setDetailMember(null);
  }

  const toggleSelect = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#061E30]">Member CRM</h1>
          <p className="text-[#7A9BB5] text-sm mt-0.5">{filtered.length} members</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#3D6480] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setEditMember(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0D4D7C] text-white rounded-xl hover:bg-[#0a3d63] transition-colors">
            <Plus size={14} /> Add Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9BB5]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, member ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#3EC8C8] bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#7A9BB5]" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3EC8C8] bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-[#0D4D7C]/5 rounded-xl border border-[#0D4D7C]/10">
          <span className="text-sm font-medium text-[#0D4D7C]">{selected.size} selected</span>
          <button onClick={() => setSelected(new Set())} className="text-xs text-[#7A9BB5] hover:text-[#3D6480]">Clear</button>
          <button onClick={() => exportCSV(filtered.filter(m => selected.has(m.id)))} className="text-xs text-[#3EC8C8] hover:underline flex items-center gap-1"><Download size={11} /> Export Selected</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#0D4D7C] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" className="rounded" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(m => m.id)) : new Set())} />
                  </th>
                  <th className="text-left px-4 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Member</th>
                  <th className="text-left px-4 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Contact</th>
                  <th className="text-left px-4 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-[#3D6480] font-medium text-xs uppercase tracking-wide">Expiry</th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr
                    key={m.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selected.has(m.id) ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setDetailMember(m)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0D4D7C]/10 flex items-center justify-center flex-shrink-0 text-[#0D4D7C] font-semibold text-xs">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[#061E30]">{m.first_name} {m.last_name}</div>
                          {m.uid_member_id && <div className="text-[11px] text-[#7A9BB5] font-mono">{m.uid_member_id}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#3D6480]">{m.email ?? '—'}</div>
                      <div className="text-[11px] text-[#7A9BB5]">{m.phone ?? ''}</div>
                    </td>
                    <td className="px-4 py-3 text-[#3D6480]">{[m.city, m.province].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-[#3D6480] capitalize">{m.member_type ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[m.membership_status ?? 'pending']}`}>
                        {m.membership_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#7A9BB5] text-xs">{m.membership_expiry ?? '—'}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditMember(m); setShowForm(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-[#3D6480] transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-[#7A9BB5] text-sm">No members found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <MemberFormModal
            member={editMember}
            onClose={() => { setShowForm(false); setEditMember(null); }}
            onSave={handleSave}
          />
        )}
        {detailMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-30"
              onClick={() => setDetailMember(null)}
            />
            <MemberDetailPanel
              member={detailMember}
              onClose={() => setDetailMember(null)}
              onEdit={() => { setEditMember(detailMember); setShowForm(true); setDetailMember(null); }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
