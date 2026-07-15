import { useLang } from '../context/LangContext';
import { CityAndIslamicSkyline, OttomanCorners, FloatingRosettes } from './BackgroundDecor';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.round(2 + Math.random() * 5),
  left: Math.round(Math.random() * 100),
  dur: (12 + Math.random() * 16).toFixed(1),
  dly: (Math.random() * 14).toFixed(1),
}));

export default function HeroSection() {
  const { t } = useLang();

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)',
        paddingTop: '76px',
      }}
    >
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Orbs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,200,200,0.14), transparent 70%)', animation: 'floatOrb 9s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,77,124,0.07), transparent 70%)', animation: 'floatOrb 11s ease-in-out infinite 2s', pointerEvents: 'none' }} />

      {/* Ottoman arches */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '540px', height: '330px', borderRadius: '0 0 270px 270px', border: '1.5px solid rgba(62,200,200,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '720px', height: '400px', borderRadius: '0 0 360px 360px', border: '1px solid rgba(13,77,124,0.05)', pointerEvents: 'none' }} />

      <CityAndIslamicSkyline />
      <OttomanCorners />
      <FloatingRosettes />

      <div style={{ position: 'absolute', top: '14%', left: '7%', fontSize: '26px', color: 'rgba(62,200,200,0.08)', animation: 'spin40 40s linear infinite', pointerEvents: 'none' }}>✦</div>
      <div style={{ position: 'absolute', bottom: '20%', right: '6%', fontSize: '20px', color: 'rgba(13,77,124,0.07)', animation: 'spin70 60s linear infinite', pointerEvents: 'none' }}>✦</div>
      <div style={{ position: 'absolute', top: '38%', right: '11%', fontSize: '13px', color: 'rgba(62,200,200,0.06)', animation: 'spin40 55s linear infinite reverse', pointerEvents: 'none' }}>✦</div>

      {PARTICLES.map(p => (
        <div key={p.id} className="particle" style={{ width: p.size, height: p.size, left: `${p.left}%`, '--dur': `${p.dur}s`, '--dly': `${p.dly}s` } as React.CSSProperties} />
      ))}

      {/* ── CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 1.5rem', maxWidth: '980px', width: '100%' }}>

        {/* Badge */}
        <div className="fade-up" style={{ animationDelay: '0.1s', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(62,200,200,0.09)', border: '1px solid rgba(62,200,200,0.26)', borderRadius: '30px', padding: '6px 18px', fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--uid-navy)', marginBottom: '2rem' }}>
          <span className="pulse-dot" />
          {t.hero.badge}
        </div>

        {/* Headline */}
        <h1 className="fade-up" style={{ animationDelay: '0.22s', fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5.5vw, 72px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '0.01em', color: 'var(--uid-navy)', marginBottom: 0 }}>
          {t.hero.headline}
        </h1>

        {/* Divider */}
        <div className="fade-up" style={{ animationDelay: '0.4s', width: '56px', height: '2px', background: 'linear-gradient(90deg, var(--uid-teal), var(--uid-navy))', borderRadius: '99px', margin: '2rem auto' }} />

        {/* Description */}
        <p className="fade-up" style={{ animationDelay: '0.52s', fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.9, maxWidth: '660px', margin: '0 auto 2.5rem' }}>
          {t.hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="fade-up hero-ctas" style={{ animationDelay: '0.68s', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="shimmer-btn"
            onClick={() => document.getElementById('uye')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '15px 42px', borderRadius: '32px', fontSize: '15px', fontWeight: 500, background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'transform 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 18px 44px rgba(13,77,124,0.32)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {t.hero.ctaPrimary}
          </button>
          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '15px 42px', borderRadius: '32px', fontSize: '15px', fontWeight: 400, background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(13,77,124,0.2)', color: 'var(--uid-navy)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.3s, color 0.3s, transform 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--uid-teal)'; e.currentTarget.style.color = 'var(--uid-teal)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(13,77,124,0.2)'; e.currentTarget.style.color = 'var(--uid-navy)'; e.currentTarget.style.transform = ''; }}
          >
            {t.hero.ctaSecondary}
          </button>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator" style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-soft)' }}>SCROLL</span>
        <div style={{ width: '1.5px', height: '54px', background: 'rgba(62,200,200,0.18)', borderRadius: '99px', position: 'relative', overflow: 'hidden' }}>
          <div className="scroll-thumb" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '16px', background: 'var(--uid-teal)', borderRadius: '99px' }} />
        </div>
      </div>
    </section>
  );
}
