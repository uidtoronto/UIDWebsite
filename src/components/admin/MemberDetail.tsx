import { Mail, Phone, MapPin, Calendar, Hash, User, Users, CreditCard, Heart } from 'lucide-react';
import type { Member, FamilyMember } from '../../types';
import { StatusBadge } from './AdminField';
import { fullName, formatDate, formatRelative } from '../../lib/memberUtils';

interface MemberDetailProps {
  member: Member;
  onEdit: () => void;
  onClose: () => void;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem 0', borderBottom: '1px solid rgba(13,77,124,0.06)' }}>
      <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(13,77,124,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--uid-navy)' }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--uid-dark)', wordBreak: 'break-word' }}>{value || <span style={{ color: 'var(--text-soft)' }}>—</span>}</p>
      </div>
    </div>
  );
}

const MEMBERSHIP_LABELS: Record<string, string> = {
  adult: 'Adult', student: 'Student', pensioner: 'Pensioner',
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Pending', active: 'Active', failed: 'Failed', cancelled: 'Cancelled',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: '#b45309', active: '#059669', failed: '#dc2626', cancelled: '#6b7280',
};

export default function MemberDetail({ member, onEdit, onClose }: MemberDetailProps) {
  const family = member.family_members ?? [];
  const fullAddress = [member.address_line1, member.address_line2, member.city, member.province, member.postal_code, member.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div>
      {/* Identity header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(13,77,124,0.08)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(62,200,200,0.25)' }}>
          <User size={24} color="#fff" />
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 500, color: 'var(--uid-navy)' }}>
            {fullName(member.first_name, member.last_name)}
          </h3>
          <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={member.status} />
            {member.payment_status && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '2px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                background: `${PAYMENT_COLORS[member.payment_status] ?? '#6b7280'}1a`,
                color: PAYMENT_COLORS[member.payment_status] ?? '#6b7280',
              }}>
                <CreditCard size={11} /> {PAYMENT_LABELS[member.payment_status] ?? member.payment_status}
              </span>
            )}
          </div>
        </div>
      </div>

      <Row icon={<Hash size={16} />} label="Member ID" value={<code style={{ fontFamily: "'DM Sans', monospace", fontSize: '12px' }}>{member.id}</code>} />
      <Row icon={<Mail size={16} />} label="Email" value={member.email} />
      <Row icon={<Phone size={16} />} label="Mobile" value={member.mobile_phone ?? member.phone} />
      <Row icon={<Calendar size={16} />} label="Birthdate" value={member.birth_date ? formatDate(member.birth_date) : null} />
      <Row icon={<MapPin size={16} />} label="Address" value={fullAddress || null} />
      <Row icon={<User size={16} />} label="Membership Type" value={MEMBERSHIP_LABELS[member.membership_type ?? ''] ?? member.membership_type} />
      <Row icon={<Calendar size={16} />} label="Joined" value={<>{formatDate(member.created_at)} <span style={{ color: 'var(--text-soft)', fontSize: '12px' }}>· {formatRelative(member.created_at)}</span></>} />

      {/* Family members */}
      {family.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <Heart size={16} style={{ color: 'var(--uid-teal)' }} />
            <h4 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--uid-navy)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Family Members ({family.length})
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {family.map((fm: FamilyMember, i: number) => (
              <div key={fm.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '10px', background: 'rgba(13,77,124,0.04)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(62,200,200,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={14} style={{ color: 'var(--uid-teal-dark)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, color: 'var(--uid-dark)' }}>{fm.full_name}</p>
                  <p style={{ margin: '1px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-soft)' }}>
                    {fm.age != null ? `${fm.age} yrs` : ''}{fm.age != null && fm.gender ? ' · ' : ''}{fm.gender ? fm.gender.charAt(0).toUpperCase() + fm.gender.slice(1) : ''}{(fm.age != null || fm.gender) && fm.member_type ? ' · ' : ''}{fm.member_type ? fm.member_type.charAt(0).toUpperCase() + fm.member_type.slice(1) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button
          onClick={onClose}
          style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1.5px solid rgba(13,77,124,0.15)', background: 'transparent', color: 'var(--text-mid)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 500 }}
        >
          Close
        </button>
        <button
          onClick={onEdit}
          style={{ padding: '0.625rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, background: 'linear-gradient(135deg, var(--uid-navy), var(--uid-mid))', color: '#fff', boxShadow: '0 6px 18px rgba(13,77,124,0.2)' }}
        >
          Edit member
        </button>
      </div>
    </div>
  );
}
