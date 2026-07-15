import { useEffect, useRef } from 'react';
import { UIDTulipIcon } from './UIDLogo';
import { useLang } from '../context/LangContext';

function OttomanStarIcon({ size = 30, color = '#3EC8C8' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 2 L22.5 17.5 L36 8 L26.5 20 L38 22.5 L24 25 L30 38 L20 28 L10 38 L16 25 L2 22.5 L13.5 20 L4 8 L17.5 17.5 Z" fill={color} opacity="0.9"/>
    </svg>
  );
}

export default function MissionVisionSection() {
  const { t } = useLang();
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('revealed'); }),
      { threshold: 0.15 }
    );
    if (missionRef.current) observer.observe(missionRef.current);
    if (visionRef.current) observer.observe(visionRef.current);
    return () => observer.disconnect();
  }, []);

  const cardBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(62,200,200,0.2)',
    borderRadius: '24px',
    padding: '2.8rem',
    flex: 1,
    backdropFilter: 'blur(12px)',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <section
      id="misyon"
      className="section-pad"
      style={{
        padding: '7rem 2rem',
        background: '#F7FAFC',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(67,199,199,0.08) 2px, transparent 2px), radial-gradient(circle at 60px 60px, rgba(13,77,124,0.05) 2px, transparent 2px)',
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(60deg, rgba(67,199,199,0.03) 0, rgba(67,199,199,0.03) 1px, transparent 0, transparent 50%), repeating-linear-gradient(-60deg, rgba(13,77,124,0.025) 0, rgba(13,77,124,0.025) 1px, transparent 0, transparent 50%)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1140px', margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem' }}>
            {t.mission.tag}
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 56px)', fontWeight: 300, color: 'var(--uid-navy)', margin: 0 }}>
            <em>{t.mission.heading}</em>
          </h2>
        </div>

        <div className="mission-flex" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          {/* Mission Card */}
          <div ref={missionRef} className="reveal-left mission-card" style={{ ...cardBase, borderLeft: '3px solid var(--uid-teal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <UIDTulipIcon size={30} />
              <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600 }}>{t.mission.missionTag}</span>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--uid-navy)', marginBottom: '1rem', lineHeight: 1.2 }}>
              {t.mission.missionTitle}
            </h3>
            <div style={{ width: '56px', height: '2px', background: 'linear-gradient(90deg, var(--uid-teal), var(--uid-navy))', borderRadius: '99px', marginBottom: '1.5rem' }} />
            <p style={{ color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.85, marginBottom: '1.2rem', fontWeight: 300 }}>{t.mission.missionP1}</p>
            <p style={{ color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.85, marginBottom: '1.2rem', fontWeight: 300 }}>{t.mission.missionP2}</p>
            <p style={{ color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.85, fontWeight: 300 }}>{t.mission.missionP3}</p>
          </div>

          {/* Vision Card */}
          <div ref={visionRef} className="reveal-right mission-card" style={{ ...cardBase, borderLeft: '3px solid var(--uid-navy)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <OttomanStarIcon size={30} />
              <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600 }}>{t.mission.visionTag}</span>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--uid-teal)', marginBottom: '1rem', lineHeight: 1.2 }}>
              {t.mission.visionTitle}
            </h3>
            <div style={{ width: '56px', height: '2px', background: 'linear-gradient(90deg, var(--uid-navy), var(--uid-teal))', borderRadius: '99px', marginBottom: '1.5rem' }} />
            <p style={{ color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.85, marginBottom: '1.2rem', fontWeight: 300 }}>{t.mission.visionP1}</p>
            <p style={{ color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.85, marginBottom: '1.2rem', fontWeight: 300 }}>{t.mission.visionP2}</p>
            <p style={{ color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.85, fontWeight: 300 }}>{t.mission.visionP3}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
