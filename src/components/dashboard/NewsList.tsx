import { Newspaper } from 'lucide-react';
import type { MemberNews } from '../../types';

interface NewsListProps {
  news: MemberNews[];
}

export default function NewsList({ news }: NewsListProps) {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', border: '1px solid rgba(13,77,124,0.08)', boxShadow: '0 8px 32px rgba(13,77,124,0.06)' }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 1.25rem' }}>
        <em>Recent News</em>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {news.map(n => (
          <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '1rem', borderRadius: '14px', background: 'var(--off-white)', border: '1px solid rgba(13,77,124,0.05)', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,77,124,0.08)'; e.currentTarget.style.borderColor = 'rgba(62,200,200,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(13,77,124,0.05)'; }}
          >
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(62,200,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Newspaper size={16} color="var(--uid-teal-dark)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{n.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-mid)', fontWeight: 300, margin: '0 0 4px', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{n.excerpt}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-soft)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                {new Date(n.date).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
