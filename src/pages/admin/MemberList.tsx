import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Eye, Pencil, Trash2, Loader2, Users, X, Download, Heart,
} from 'lucide-react';
import {
  listMembers, createMember, updateMember, deleteMember, getMember,
  exportMembersCsv,
} from '../../services/members';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import MemberForm from '../../components/admin/MemberForm';
import MemberDetail from '../../components/admin/MemberDetail';
import { StatusBadge } from '../../components/admin/AdminField';
import { fullName, formatDate } from '../../lib/memberUtils';
import type { Member, MemberSortKey, SortDirection, MemberStatus, MemberInput, PaymentStatus, RegistrationMembershipType } from '../../types';
import type { MemberFormValues } from '../../lib/validation';

type StatusFilter = MemberStatus | 'all';
type TypeFilter = RegistrationMembershipType | 'all';
type PayFilter = PaymentStatus | 'all';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'adult', label: 'Adult' },
  { value: 'student', label: 'Student' },
  { value: 'pensioner', label: 'Pensioner' },
];

const PAY_FILTERS: { value: PayFilter; label: string }[] = [
  { value: 'all', label: 'All Payments' },
  { value: 'active', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_COLUMNS: { key: MemberSortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'city', label: 'City' },
  { key: 'created_at', label: 'Joined' },
];

const PAGE_SIZE = 10;

export default function MemberList() {
  const { toast } = useToast();

  // list state
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<MemberSortKey>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [payFilter, setPayFilter] = useState<PayFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // debounced search value
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Fetch list whenever filters change ──
  const fetchList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    const res = await listMembers({ page, pageSize: PAGE_SIZE, sortBy, sortDir, status: statusFilter, membershipType: typeFilter, paymentStatus: payFilter, search });
    if (res.error) {
      setListError(res.error);
      setMembers([]);
      setTotal(0);
    } else {
      setMembers(res.data!.data);
      setTotal(res.data!.total);
    }
    setLoading(false);
  }, [page, sortBy, sortDir, statusFilter, typeFilter, payFilter, search]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Sort toggle ──
  const toggleSort = (col: MemberSortKey) => {
    if (sortBy === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  };

  // ── Modals ──
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Export to CSV ──
  const handleExport = async () => {
    setExporting(true);
    const res = await exportMembersCsv();
    if (res.error || !res.data) {
      toast(res.error ?? 'Export failed', 'error');
      setExporting(false);
      return;
    }
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uid-members-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Members exported successfully', 'success');
    setExporting(false);
  };

  // open create
  const openCreate = () => {
    setFormMode('create');
    setEditing(null);
    setFormOpen(true);
  };

  // open edit (from list row or detail)
  const openEdit = (m: Member) => {
    setFormMode('edit');
    setEditing(m);
    setDetailOpen(false);
    setFormOpen(true);
  };

  // open detail (fetches fresh data)
  const openDetail = async (m: Member) => {
    setDetailMember(m);
    setDetailOpen(true);
    setDetailLoading(true);
    const res = await getMember(m.id);
    if (res.data) setDetailMember(res.data);
    else if (res.error) toast(res.error, 'error');
    setDetailLoading(false);
  };

  // ── Submit handler for create/edit ──
  const handleSubmit = async (values: MemberFormValues) => {
    setSubmitting(true);
    const payload: MemberInput = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || null,
      city: values.city || null,
      status: values.status,
    };

    if (formMode === 'create') {
      const res = await createMember(payload);
      setSubmitting(false);
      if (res.error) {
        toast(res.error, 'error');
      } else {
        toast('Member added successfully', 'success');
        setFormOpen(false);
        fetchList();
      }
    } else if (editing) {
      const res = await updateMember(editing.id, payload);
      setSubmitting(false);
      if (res.error) {
        toast(res.error, 'error');
      } else {
        toast('Member updated successfully', 'success');
        setFormOpen(false);
        fetchList();
      }
    }
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteMember(deleteTarget.id);
    setDeleting(false);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Member deleted', 'success');
      setDeleteTarget(null);
      // if we deleted the last item on a page, step back
      if (members.length === 1 && page > 1) setPage(p => p - 1);
      else fetchList();
    }
  };

  // ── Derived: sort arrow ──
  const sortArrow = (col: MemberSortKey) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const startIdx = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, total);

  const emptyState = useMemo(() => !loading && members.length === 0, [loading, members.length]);

  return (
    <div className="admin-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal-dark)', fontWeight: 600, marginBottom: '0.5rem' }}>Roster</p>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px, 3.5vw, 34px)', fontWeight: 400, color: 'var(--uid-navy)' }}>
            <em>Members</em>
          </h1>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '0.625rem 1.25rem', borderRadius: '10px',
            border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600,
            background: 'linear-gradient(135deg, var(--uid-navy), var(--uid-mid))',
            color: '#fff', boxShadow: '0 6px 18px rgba(13,77,124,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(13,77,124,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 18px rgba(13,77,124,0.2)'; }}
        >
          <Plus size={16} /> Add member
        </button>
      </div>

      {/* Toolbar: search + status filter */}
      {/* Toolbar: search + filters + export */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: '100%', padding: '0.625rem 2.25rem 0.625rem 2.25rem', borderRadius: '10px',
              border: '1.5px solid rgba(13,77,124,0.15)', background: '#fff',
              fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--uid-dark)', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--uid-teal)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(13,77,124,0.15)'; }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} aria-label="Clear search" style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', padding: 0 }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exporting || members.length === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '0.5rem 1rem', borderRadius: '10px',
            border: '1.5px solid rgba(13,77,124,0.15)', background: '#fff',
            color: 'var(--uid-navy)', cursor: exporting ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600,
            transition: 'all 0.2s', opacity: exporting || members.length === 0 ? 0.5 : 1,
          }}
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={15} />} Export CSV
        </button>
      </div>

      {/* Filter rows */}
      <FilterRow label="Type" options={TYPE_FILTERS} value={typeFilter} onChange={v => { setTypeFilter(v as TypeFilter); setPage(1); }} />
      <FilterRow label="Payment" options={PAY_FILTERS} value={payFilter} onChange={v => { setPayFilter(v as PayFilter); setPage(1); }} />
      <FilterRow label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={v => { setStatusFilter(v as StatusFilter); setPage(1); }} />
      <div style={{ height: '1rem' }} />

      {/* Table card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(13,77,124,0.07)', boxShadow: '0 4px 20px rgba(13,77,124,0.05)', overflow: 'hidden' }}>
        {listError ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>{listError}</div>
        ) : loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3.5rem', color: 'var(--text-soft)' }}>
            <Loader2 size={26} className="animate-spin" style={{ color: 'var(--uid-teal)' }} />
          </div>
        ) : emptyState ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(13,77,124,0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--uid-navy)', marginBottom: '1rem' }}>
              <Users size={26} />
            </div>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 600, color: 'var(--uid-navy)' }}>No members found</p>
            <p style={{ margin: '6px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-soft)' }}>
              {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first member to get started.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(13,77,124,0.08)' }}>
                  {SORT_COLUMNS.map(col => (
                    <th key={col.key} style={{ textAlign: 'left', padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-soft)' }}>
                      <button onClick={() => toggleSort(col.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: sortBy === col.key ? 'var(--uid-navy)' : 'var(--text-soft)', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit', padding: 0 }}>
                        {col.label} {sortArrow(col.key)}
                      </button>
                    </th>
                  ))}
                  <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-soft)' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-soft)' }}>Payment</th>
                  <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-soft)' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-soft)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i === members.length - 1 ? 'none' : '1px solid rgba(13,77,124,0.05)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(62,200,200,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, color: 'var(--uid-dark)' }}>{fullName(m.first_name, m.last_name)}</td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: 'var(--text-mid)' }}>{m.email}</td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: 'var(--text-mid)' }}>{m.city || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: 'var(--text-mid)' }}>{formatDate(m.created_at)}</td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: 'var(--text-mid)' }}>{m.membership_type ? m.membership_type.charAt(0).toUpperCase() + m.membership_type.slice(1) : '—'}{m.is_family ? <Heart size={11} style={{ display: 'inline', marginLeft: '4px', color: 'var(--uid-teal)' }} /> : null}</td>
                    <td style={{ padding: '0.875rem 1rem' }}><PayBadge status={m.payment_status ?? 'pending'} /></td>
                    <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={m.status} /></td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <RowAction icon={<Eye size={15} />} label="View" onClick={() => openDetail(m)} />
                        <RowAction icon={<Pencil size={15} />} label="Edit" onClick={() => openEdit(m)} />
                        <RowAction icon={<Trash2 size={15} />} label="Delete" danger onClick={() => setDeleteTarget(m)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden">
              {members.map(m => (
                <div key={m.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(13,77,124,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--uid-dark)' }}>{fullName(m.first_name, m.last_name)}</p>
                      <p style={{ margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <StatusBadge status={m.status} />
                    <PayBadge status={m.payment_status ?? 'pending'} />
                    {m.membership_type && (
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-mid)', padding: '2px 8px', borderRadius: '99px', background: 'rgba(13,77,124,0.06)' }}>
                        {m.membership_type.charAt(0).toUpperCase() + m.membership_type.slice(1)}{m.is_family ? ' · Family' : ''}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.75rem', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-soft)' }}>{m.city || '—'} · {formatDate(m.created_at)}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <RowAction icon={<Eye size={14} />} label="View" onClick={() => openDetail(m)} />
                    <RowAction icon={<Pencil size={14} />} label="Edit" onClick={() => openEdit(m)} />
                    <RowAction icon={<Trash2 size={14} />} label="Delete" danger onClick={() => setDeleteTarget(m)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderTop: '1px solid rgba(13,77,124,0.06)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', color: 'var(--text-soft)' }}>
                Showing <strong style={{ color: 'var(--uid-navy)' }}>{startIdx}–{endIdx}</strong> of <strong style={{ color: 'var(--uid-navy)' }}>{total}</strong>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PageBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></PageBtn>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--uid-navy)', padding: '0 0.5rem' }}>
                  {page} / {totalPages}
                </span>
                <PageBtn disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></PageBtn>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Create/Edit modal ── */}
      <Modal open={formOpen} title={formMode === 'create' ? 'Add member' : 'Edit member'} onClose={() => !submitting && setFormOpen(false)}>
        <MemberForm
          initial={formMode === 'edit' ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>

      {/* ── Detail modal ── */}
      <Modal open={detailOpen} title="Member details" onClose={() => setDetailOpen(false)} maxWidth={520}>
        {detailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--uid-teal)' }} />
          </div>
        ) : detailMember ? (
          <MemberDetail member={detailMember} onEdit={() => openEdit(detailMember)} onClose={() => setDetailOpen(false)} />
        ) : null}
      </Modal>

      {/* ── Delete confirmation ── */}
      <Modal open={!!deleteTarget} title="Delete member" onClose={() => !deleting && setDeleteTarget(null)} maxWidth={440}>
        {deleteTarget && (
          <div>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '14.5px', color: 'var(--uid-dark)', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--uid-navy)' }}>{fullName(deleteTarget.first_name, deleteTarget.last_name)}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1.5px solid rgba(13,77,124,0.15)', background: 'transparent', color: 'var(--text-mid)', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '0.625rem 1.5rem', borderRadius: '10px', border: 'none', cursor: deleting ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, background: '#dc2626', color: '#fff', opacity: deleting ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={15} /> {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Row action icon button ──
function RowAction({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: '32px', height: '32px', borderRadius: '8px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13,77,124,0.04)', border: 'none', cursor: 'pointer',
        color: danger ? '#dc2626' : 'var(--text-mid)',
        transition: 'background 0.2s, color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.1)' : 'rgba(62,200,200,0.1)'; e.currentTarget.style.color = danger ? '#dc2626' : 'var(--uid-teal-dark)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,77,124,0.04)'; e.currentTarget.style.color = danger ? '#dc2626' : 'var(--text-mid)'; }}
    >
      {icon}
    </button>
  );
}

// ── Pagination button ──
function PageBtn({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '32px', height: '32px', borderRadius: '8px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(13,77,124,0.12)', background: disabled ? 'transparent' : '#fff',
        color: disabled ? 'var(--text-soft)' : 'var(--uid-navy)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.2s',
      }}
    >
      {children}
    </button>
  );
}

// ── Filter row ──
function FilterRow({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', minWidth: '60px' }}>{label}</span>
      {options.map(f => {
        const active = value === f.value;
        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: '99px',
              border: `1.5px solid ${active ? 'var(--uid-teal)' : 'rgba(13,77,124,0.12)'}`,
              background: active ? 'rgba(62,200,200,0.10)' : '#fff',
              color: active ? 'var(--uid-teal-dark)' : 'var(--text-mid)',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Payment status badge ──
const PAY_COLORS: Record<string, { bg: string; fg: string }> = {
  active: { bg: 'rgba(5,150,105,0.10)', fg: '#059669' },
  pending: { bg: 'rgba(180,83,9,0.10)', fg: '#b45309' },
  failed: { bg: 'rgba(220,38,38,0.10)', fg: '#dc2626' },
  cancelled: { bg: 'rgba(107,114,128,0.10)', fg: '#6b7280' },
};

function PayBadge({ status }: { status: PaymentStatus }) {
  const c = PAY_COLORS[status] ?? PAY_COLORS.pending;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      background: c.bg, color: c.fg,
    }}>
      {label}
    </span>
  );
}
