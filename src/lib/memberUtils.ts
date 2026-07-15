import type { MemberStatus } from '../types';

// Status → { label, dot color, soft badge background, text color }
const STATUS_STYLES: Record<MemberStatus, { label: string; dot: string; bg: string; text: string }> = {
  active:    { label: 'Active',    dot: '#16a34a', bg: 'rgba(22,163,74,0.10)',  text: '#15803d' },
  inactive:  { label: 'Inactive',  dot: '#94a3b8', bg: 'rgba(148,163,184,0.12)', text: '#64748b' },
  pending:   { label: 'Pending',   dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  text: '#b45309' },
  suspended: { label: 'Suspended', dot: '#dc2626', bg: 'rgba(220,38,38,0.10)',   text: '#b91c1c' },
};

export function statusStyle(status: MemberStatus) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.active;
}

export function fullName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelative(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Chart palette for status breakdown (Navy/Teal brand-consistent)
export const STATUS_CHART_COLORS: Record<MemberStatus, string> = {
  active:    '#00BAB0',
  inactive:  '#94a3b8',
  pending:   '#f59e0b',
  suspended: '#dc2626',
};
