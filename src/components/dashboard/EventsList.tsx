import { Calendar, MapPin } from 'lucide-react';
import type { MemberEvent } from '../../types';

interface EventsListProps {
  events: MemberEvent[];
}

export default function EventsList({ events }: EventsListProps) {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', border: '1px solid rgba(13,77,124,0.08)', boxShadow: '0 8px 32px rgba(13,77,124,0.06)' }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 1.25rem' }}>
        <em>Upcoming Events</em>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {events.map(ev => {
          const d = new Date(ev.date);
          return (
            <div key={ev.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '14px', background: 'var(--off-white)', border: '1px solid rgba(13,77,124,0.05)', transition: 'transform 0.3s, box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,77,124,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* Date block */}
              <div style={{ flexShrink: 0, width: '56px', textAlign: 'center', padding: '0.5rem 0', borderRadius: '12px', background: 'linear-gradient(160deg, #0D4D7C, #1A6A9A)', color: '#fff' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', margin: 0, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}>
                  {d.toLocaleDateString('en-CA', { month: 'short' })}
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 500, margin: 0, lineHeight: 1.1 }}>
                  {d.getDate()}
                </p>
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{ev.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', fontWeight: 300, margin: '0 0 6px', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{ev.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-soft)', fontFamily: "'DM Sans', sans-serif" }}>
                    <Calendar size={12} /> {d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-soft)', fontFamily: "'DM Sans', sans-serif" }}>
                    <MapPin size={12} /> {ev.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
