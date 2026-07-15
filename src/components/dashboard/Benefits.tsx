import { Check } from 'lucide-react';

const BENEFITS = [
  'Exclusive access to cultural events & workshops',
  'Member-only discount at partner businesses',
  'Free entry to the annual UID Toronto gala',
  'Voting rights in executive board elections',
  'Access to the member resource library',
  'Priority registration for youth programs',
];

export default function Benefits() {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', border: '1px solid rgba(13,77,124,0.08)', boxShadow: '0 8px 32px rgba(13,77,124,0.06)' }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 1.25rem' }}>
        <em>Membership Benefits</em>
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {BENEFITS.map((b, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ minWidth: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', flexShrink: 0 }}>
              <Check size={11} color="#fff" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--text-mid)', margin: 0, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{b}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
