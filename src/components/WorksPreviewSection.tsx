import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { MosqueSilhouette } from './BackgroundDecor';

const PREVIEW_WORKS = [
  {
    category: { TR: 'Etkinlik', EN: 'Event' },
    title: { TR: 'Cumhurbaşkanlığı Külliye Kabulü', EN: 'Presidential Reception at Külliye' },
    desc: {
      TR: "Cumhurbaşkanı Recep Tayyip Erdoğan'ın Külliye kabul programına UID Toronto heyeti olarak katılım.",
      EN: "Participation in President Erdoğan's reception of the Union of International Democrats at Külliye.",
    },
    date: { TR: '2024', EN: '2024' },
    gradient: 'linear-gradient(135deg, #061E30, #0D4D7C)',
  },
  {
    category: { TR: 'Etkinlik', EN: 'Event' },
    title: { TR: 'Türk & Müslüman Liderler Koordinasyon Toplantısı', EN: 'Turkish & Muslim Leaders Coordination Meeting' },
    desc: {
      TR: "T.C. Enerji ve Tabii Kaynaklar Bakanı Alparslan Bayraktar'ın katılımıyla Türk dernekleri ve Müslüman liderlerle koordinasyon toplantısı.",
      EN: "Hosted Minister of Energy Alparslan Bayraktar at a coordination meeting with Turkish associations and Muslim community leaders.",
    },
    date: { TR: '2024', EN: '2024' },
    gradient: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)',
  },
  {
    category: { TR: 'Topluluk', EN: 'Community' },
    title: { TR: 'Ramazan İftarlık Dağıtımı', EN: 'Ramadan Iftar Distribution' },
    desc: {
      TR: "Toronto Bölge Başkanı ve yardımcıları Toronto'da yerel halka iftarlık dağıtımı yaparak Ramazan farkındalığı oluşturdu.",
      EN: "Iftar bag distribution to Toronto locals to raise Ramadan awareness across the community.",
    },
    date: { TR: '2024', EN: '2024' },
    gradient: 'linear-gradient(135deg, #3EC8C8, #2AACAC)',
  },
];

export default function WorksPreviewSection() {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.1 }
    );
    if (headRef.current) observer.observe(headRef.current);
    cardsRef.current.forEach(c => { if (c) observer.observe(c); });
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="calisma"
      className="section-pad"
      style={{
        padding: '7rem 2rem',
        background: 'linear-gradient(160deg, #EBF5FB, #EAF8F8, #F7FAFC)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <MosqueSilhouette />
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <div ref={headRef} className="reveal-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem' }}>
            {t.works.tag}
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 300, color: 'var(--uid-navy)', margin: '0 0 0.75rem' }}>
            <em>{t.works.heading}</em>
          </h2>
          <p style={{ color: 'var(--text-soft)', fontSize: '15px', fontWeight: 300, maxWidth: '520px', margin: '0 auto' }}>
            {t.works.sub}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {PREVIEW_WORKS.map((work, i) => (
            <div
              key={work.title.EN}
              ref={el => cardsRef.current[i] = el}
              className="reveal-up"
              style={{
                background: '#fff', border: '1px solid var(--silver)', borderRadius: '20px',
                overflow: 'hidden', transitionDelay: `${i * 0.1}s`,
                transition: 'transform 0.35s, box-shadow 0.35s, border-color 0.35s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(13,77,124,0.1)'; e.currentTarget.style.borderColor = 'rgba(62,200,200,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--silver)'; }}
            >
              <div style={{ height: '160px', background: work.gradient, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15 }} />
                <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                    {work.category[lang]}
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '60px' }}>✦</div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: 'var(--uid-navy)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                  {work.title[lang]}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                  {work.title[lang === 'TR' ? 'EN' : 'TR']}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, marginBottom: '1rem' }}>{work.desc[lang]}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-soft)', fontSize: '12px' }}>
                  <Calendar size={13} />
                  <span>{work.date[lang]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            className="shimmer-btn"
            onClick={() => navigate('/works')}
            style={{
              padding: '13px 36px', borderRadius: '99px', fontSize: '14.5px', fontWeight: 500,
              background: 'var(--uid-navy)', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '8px',
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,77,124,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {t.works.cta} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
