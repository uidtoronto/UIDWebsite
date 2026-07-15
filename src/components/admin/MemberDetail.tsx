import { Mail, Phone, MapPin, Calendar, Hash, User } from 'lucide-react';
import type { Member } from '../../types';
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

export default function MemberDetail({ member, onEdit, onClose }: MemberDetailProps) {
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
          <div style={{ marginTop: '6px' }}>
            <StatusBadge status={member.status} />
          </div>
        </div>
      </div>

      <Row icon={<Hash size={16} />} label="Member ID" value={<code style={{ fontFamily: "'DM Sans', monospace", fontSize: '12px' }}>{member.id}</code>} />
      <Row icon={<Mail size={16} />} label="Email" value={member.email} />
      <Row icon={<Phone size={16} />} label="Phone" value={member.phone} />
      <Row icon={<MapPin size={16} />} label="City" value={member.city} />
      <Row icon={<Calendar size={16} />} label="Joined" value={<>{formatDate(member.created_at)} <span style={{ color: 'var(--text-soft)', fontSize: '12px' }}>· {formatRelative(member.created_at)}</span></>} />

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
