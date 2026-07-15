import { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useLang } from '../context/LangContext';

function FAQItem({
  q,
  a,
  isOpen,
  onToggle,
  delay,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  delay: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(bodyRef.current.scrollHeight);
    }
  }, [a]);

  return (
    <div
      className="reveal-up"
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: `1px solid ${isOpen ? 'rgba(62,200,200,0.35)' : 'rgba(229,231,235,0.8)'}`,
        overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: isOpen ? '0 8px 32px rgba(13,77,124,0.08)' : '0 2px 8px rgba(13,77,124,0.03)',
        transitionDelay: delay,
      }}
    >
      {/* Question */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '1.4rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '19px', fontWeight: 500, color: isOpen ? 'var(--uid-navy)' : 'var(--uid-dark)', lineHeight: 1.35, transition: 'color 0.3s' }}>
          {q}
        </span>
        <div
          style={{
            minWidth: '32px', height: '32px', borderRadius: '50%',
            background: isOpen ? 'var(--uid-navy)' : 'rgba(13,77,124,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s, transform 0.35s',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          {isOpen
            ? <Minus size={14} style={{ color: '#fff' }} />
            : <Plus size={14} style={{ color: 'var(--uid-navy)' }} />
          }
        </div>
      </button>

      {/* Answer */}
      <div
        style={{
          maxHeight: isOpen ? `${height + 40}px` : '0',
          overflow: 'hidden',
          transition: 'max-height 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div ref={bodyRef} style={{ padding: '0 1.75rem 1.5rem' }}>
          <div style={{ height: '1px', background: 'rgba(62,200,200,0.2)', marginBottom: '1rem' }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.8, margin: 0 }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const { t } = useLang();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { setVisible(true); } }),
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible && sectionRef.current) {
      sectionRef.current.querySelectorAll('.reveal-up').forEach(el => el.classList.add('revealed'));
    }
  }, [visible]);

  return (
    <section style={{ padding: '7rem 2rem', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(62,200,200,0.05) 1.5px, transparent 1.5px)', backgroundSize: '52px 52px', pointerEvents: 'none' }} />

      <div ref={sectionRef} style={{ maxWidth: '780px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div className="reveal-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem' }}>
            {t.faq.tag}
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 300, color: 'var(--uid-navy)', margin: 0 }}>
            <em>{t.faq.heading}</em>
          </h2>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {t.faq.items.map((item, i) => (
            <FAQItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              delay={`${i * 0.06}s`}
            />
          ))}
        </div>

        {/* CTA nudge */}
        <div className="reveal-up" style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(13,77,124,0.04), rgba(62,200,200,0.06))', borderRadius: '20px', border: '1px solid rgba(62,200,200,0.15)' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, fontStyle: 'italic', color: 'var(--uid-navy)', marginBottom: '1rem' }}>
            Daha fazla bilgi için bizimle iletişime geçin
          </p>
          <button
            className="shimmer-btn"
            onClick={() => document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '12px 32px', borderRadius: '99px', fontSize: '14px', fontWeight: 500, background: 'var(--uid-navy)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'transform 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,77,124,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            İletişim / Contact
          </button>
        </div>
      </div>
    </section>
  );
}
