import { motion } from 'framer-motion';
import { Calendar, CreditCard, BadgeCheck } from 'lucide-react';
import type { Profile } from '../../types';

interface MembershipCardProps {
  user: Profile;
}

export default function MembershipCard({ user }: MembershipCardProps) {
  const renewal = user.renewal_date
    ? new Date(user.renewal_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(160deg, #0D4D7C 0%, #061E30 100%)',
        borderRadius: '24px',
        padding: '2.25rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(13,77,124,0.3)',
      }}
    >
      {/* Animated border */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: 'linear-gradient(90deg, transparent, rgba(62,200,200,0.12), transparent)', backgroundSize: '300% 100%', animation: 'borderTrace 4s linear infinite', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1.5px', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(62,200,200,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={16} style={{ color: 'var(--uid-teal)' }} />
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Membership Card
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '99px', background: user.membership_status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${user.membership_status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
          <BadgeCheck size={13} color={user.membership_status === 'active' ? '#4ade80' : '#fbbf24'} />
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'capitalize', color: user.membership_status === 'active' ? '#4ade80' : '#fbbf24', fontFamily: "'DM Sans', sans-serif" }}>
            {user.membership_status}
          </span>
        </div>
      </div>

      {/* Name */}
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 500, color: '#fff', margin: '0 0 0.25rem', lineHeight: 1.1 }}>
        {user.first_name} {user.last_name}
      </p>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, margin: '0 0 1.75rem', fontFamily: "'DM Sans', sans-serif" }}>
        @{user.username}
      </p>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>Member ID</p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 400, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{user.id}</p>
        </div>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>Status</p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 400, margin: 0, textTransform: 'capitalize', fontFamily: "'DM Sans', sans-serif" }}>{user.membership_status}</p>
        </div>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>Renewal Date</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} color="var(--uid-teal)" />
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 400, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{renewal}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
