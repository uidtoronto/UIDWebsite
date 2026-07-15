import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { RosetteWatermark } from './BackgroundDecor';
import { PricingTab } from './ui/pricing-tab';

export default function MembershipSection() {
  const { t, lang } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [yearly, setYearly] = useState(false);

  const monthlyLabel = lang === 'TR' ? 'Aylık' : 'Monthly';
  const yearlyLabel = lang === 'TR' ? 'Yıllık' : 'Yearly';
  const selected = yearly ? yearlyLabel : monthlyLabel;
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(true); }),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const plan = yearly ? t.membership.yearly : t.membership.monthly;

  return (
    <section id="uye" className="section-pad" style={{ padding: '7rem 2rem', background: 'var(--off-white)', position: 'relative', overflow: 'hidden' }}>
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, opacity: 0.45, pointerEvents: 'none' }} />
      <RosetteWatermark />

      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="particle" style={{ width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`, left: `${Math.random() * 100}%`, '--dur': `${14 + Math.random() * 12}s`, '--dly': `${Math.random() * 8}s` } as React.CSSProperties} />
      ))}

      <div ref={sectionRef} style={{ maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem' }}>
            {t.membership.tag}
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 300, color: 'var(--uid-navy)', margin: '0 0 1rem' }}>
            <em>{t.membership.heading}</em>
          </h2>
          <p style={{ fontSize: '15.5px', color: 'var(--text-mid)', fontWeight: 300, maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>
            {t.membership.subtitle}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex rounded-full p-1" style={{ background: 'rgba(13,77,124,0.08)' }}>
            <PricingTab
              text={monthlyLabel}
              selected={selected === monthlyLabel}
              setSelected={v => setYearly(v === yearlyLabel)}
            />
            <PricingTab
              text={yearlyLabel}
              selected={selected === yearlyLabel}
              setSelected={v => setYearly(v === yearlyLabel)}
            />
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'linear-gradient(160deg, #0D4D7C 0%, #061E30 100%)',
            borderRadius: '28px',
            padding: '2.75rem',
            position: 'relative',
            overflow: 'hidden',
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.65s ease-out, transform 0.65s ease-out',
            boxShadow: '0 32px 80px rgba(13,77,124,0.35)',
          }}
        >
          {/* Animated border */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '28px', background: 'linear-gradient(90deg, transparent, rgba(62,200,200,0.12), transparent)', backgroundSize: '300% 100%', animation: 'borderTrace 4s linear infinite', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1.5px', pointerEvents: 'none' }} />

          {/* Plan name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(62,200,200,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={16} style={{ color: 'var(--uid-teal)' }} />
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
              {plan.name}
            </p>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '72px', fontWeight: 400, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>
              {plan.price}
            </span>
            <p style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(255,255,255,0.55)', margin: '4px 0 0' }}>
              {plan.period}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

          {/* Features */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {plan.features.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ minWidth: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', flexShrink: 0 }}>
                  <Check size={10} style={{ color: '#fff' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.55 }}>{f}</p>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            className="shimmer-btn"
            onClick={() => navigate('/signup')}
            style={{
              width: '100%', padding: '16px', borderRadius: '99px', fontSize: '15px', fontWeight: 500,
              background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(62,200,200,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {plan.cta}
          </button>
        </div>

        {/* Trust row */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem 2rem', marginTop: '1.75rem' }}>
          {[t.membership.trust1, t.membership.trust2, t.membership.trust3].map(trust => (
            <span key={trust} style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: 'var(--uid-teal)', fontSize: '10px' }}>✦</span> {trust}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
