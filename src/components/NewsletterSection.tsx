import { useState } from 'react';
import { useLang } from '../context/LangContext';
import { OttomanArchRow } from './BackgroundDecor';

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  delay: `${(Math.random() * 4).toFixed(1)}s`,
  dur: `${(2 + Math.random() * 2).toFixed(1)}s`,
}));

export default function NewsletterSection() {
  const { t } = useLang();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', city: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)',
    color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
    fontWeight: 300, outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)', marginBottom: '6px', fontWeight: 500,
  };

  return (
    <section className="section-pad" style={{ padding: '7rem 2rem', background: 'linear-gradient(150deg, #061E30 0%, #0A3D62 50%, #0D4D7C 100%)', position: 'relative', overflow: 'hidden' }}>
      <OttomanArchRow />
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, opacity: 0.05, filter: 'invert(1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,200,200,0.11), transparent 70%)', pointerEvents: 'none' }} />

      {STARS.map(s => (
        <div key={s.id} style={{ position: 'absolute', top: s.top, left: s.left, width: '2px', height: '2px', borderRadius: '50%', background: '#fff', pointerEvents: 'none', animation: `twinkle ${s.dur} ease-in-out infinite`, animationDelay: s.delay }} />
      ))}

      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '1rem' }}>
          {t.newsletter.tag}
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 300, color: '#fff', margin: '0 0 0.75rem' }}>
          {t.newsletter.heading}
          <br />
          <em style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.7)' }}>{t.newsletter.headingSub}</em>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', fontStyle: 'italic', marginBottom: '0.35rem' }}>
          {t.newsletter.quote}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontStyle: 'italic', marginBottom: '3rem' }}>
          {t.newsletter.quoteTr}
        </p>

        {!submitted ? (
          <div style={{ background: 'rgba(255,255,255,0.065)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '26px', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '26px', background: 'linear-gradient(90deg, transparent, rgba(62,200,200,0.3), var(--uid-teal), rgba(62,200,200,0.3), transparent)', backgroundSize: '300% 100%', animation: 'borderTrace 4s linear infinite', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px', pointerEvents: 'none' }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
              <div className="nl-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>{t.newsletter.firstName}</label>
                  <input style={inputStyle} placeholder="..." value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required onFocus={e => { e.target.style.borderColor = 'rgba(62,200,200,0.5)'; e.target.style.boxShadow = '0 0 0 4px rgba(62,200,200,0.08)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.13)'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <label style={labelStyle}>{t.newsletter.lastName}</label>
                  <input style={inputStyle} placeholder="..." value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required onFocus={e => { e.target.style.borderColor = 'rgba(62,200,200,0.5)'; e.target.style.boxShadow = '0 0 0 4px rgba(62,200,200,0.08)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.13)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t.newsletter.email}</label>
                <input type="email" style={inputStyle} placeholder="..." value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required onFocus={e => { e.target.style.borderColor = 'rgba(62,200,200,0.5)'; e.target.style.boxShadow = '0 0 0 4px rgba(62,200,200,0.08)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.13)'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label style={labelStyle}>{t.newsletter.city}</label>
                <input style={inputStyle} placeholder="Toronto, ON" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} onFocus={e => { e.target.style.borderColor = 'rgba(62,200,200,0.5)'; e.target.style.boxShadow = '0 0 0 4px rgba(62,200,200,0.08)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.13)'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <button type="submit" className="shimmer-btn" style={{ width: '100%', padding: '14px', borderRadius: '99px', fontSize: '14.5px', fontWeight: 500, background: 'linear-gradient(135deg, var(--uid-teal), rgba(62,200,200,0.75))', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(62,200,200,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {t.newsletter.submit}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.065)', backdropFilter: 'blur(22px)', border: '1px solid rgba(62,200,200,0.3)', borderRadius: '26px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✦</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: '#fff', marginBottom: '0.75rem' }}>{t.newsletter.successTitle}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 300 }}>{t.newsletter.successMsg}</p>
          </div>
        )}
      </div>
    </section>
  );
}
