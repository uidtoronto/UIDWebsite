import { useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';

const BYK_ROLES = [
  // Leadership
  { tr: 'Bölge Başkanı',                                              en: 'Regional President',             name: 'Furkan Yasir Yalçin',  highlight: true,  photo: null          },
  { tr: 'Bölge Sekreteri',                                            en: 'Regional Secretary',             name: 'Merve Guler',           highlight: true,  photo: '/images/team/4.png' },
  // Remaining roles
  { tr: 'Bölge Teşkilatlanma Başkanı',                                en: 'Head of Organization',           name: 'Hasan Budak',           highlight: false, photo: '/images/team/6.png' },
  { tr: 'Bölge Halkla İlişkiler Başkanı',                             en: 'Head of Public Relations',       name: '',                      highlight: false, photo: null          },
  { tr: 'Bölge Siyasi İşler Başkanı',                                 en: 'Head of Political Affairs',      name: 'Mehmet Ünsal',          highlight: false, photo: '/images/team/2.png' },
  { tr: 'Bölge Kadın Kolları Başkanı',                                  en: "Head of Women's Branch",         name: 'Zeynep Gümüştaş',       highlight: false, photo: null          },
  { tr: 'Bölge Gençlik Kolları Başkanı',                                en: 'Head of Youth Branch',           name: 'Recep Tayyip Kisak',    highlight: false, photo: '/images/team/5.png' },
  { tr: 'Bölge Mali – İdari İşler ve Ekonomi Başkanı',                en: 'Head of Finance & Economics',    name: 'Abdulvasi Sis',         highlight: false, photo: null          },
  { tr: 'Bölge Ar-Ge ve Eğitim Başkanı',                              en: 'Head of R&D & Education',        name: 'Mehmet Erilli',         highlight: false, photo: '/images/team/3.png' },
  { tr: "Bölge STK'larla İlişkiler Başkanı",                          en: 'Head of NGO Relations',          name: 'Musa Arı',              highlight: false, photo: '/images/team/1.png' },
  { tr: 'Bölge Tanıtım – Medya ve Bilgi Teknolojileri Başkanı',       en: 'Head of Media & IT',             name: 'Suheyb Hussein',        highlight: false, photo: null          },
  { tr: 'Bölge Aile ve Sosyal İşler Başkanı',                         en: 'Head of Family & Social Affairs',name: 'Serpil Güney',          highlight: false, photo: null          },
  { tr: 'Bölge Hukuki İşler Başkanı',                                 en: 'Head of Legal Affairs',          name: '',                      highlight: false, photo: null          },
];

export default function BYKSection() {
  const { lang, t } = useLang();
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('revealed'); }),
      { threshold: 0.08 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    cardsRef.current.forEach(card => { if (card) observer.observe(card); });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="byk" className="section-pad" style={{ padding: '6rem 2rem', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(13,77,124,0.02) 0, rgba(13,77,124,0.02) 1px, transparent 0, transparent 50%), repeating-linear-gradient(45deg, rgba(13,77,124,0.02) 0, rgba(13,77,124,0.02) 1px, transparent 0, transparent 50%)',
        backgroundSize: '40px 40px', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div ref={titleRef} className="reveal-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem' }}>
            {t.byk.tag}
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: 300, color: 'var(--uid-navy)', margin: '0 0 0.5rem' }}>
            {t.byk.heading}
          </h2>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', fontWeight: 300 }}>{t.byk.sub}</p>
        </div>

        {/* President & Secretary — featured row */}
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {BYK_ROLES.filter(r => r.highlight).map((role, i) => (
            <div
              key={role.tr}
              ref={el => cardsRef.current[i] = el}
              className="reveal-up byk-card byk-featured-card"
              style={{
                background: '#fff',
                border: '1.5px solid rgba(62,200,200,0.3)',
                borderRadius: '18px',
                padding: '1.5rem 1.5rem 0',
                textAlign: 'center',
                overflow: 'hidden',
                transitionDelay: `${i * 0.06}s`,
                width: '220px',
                flexShrink: 0,
              }}
            >
              {/* Featured badge */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 700, background: 'rgba(62,200,200,0.08)', padding: '3px 10px', borderRadius: '99px', border: '1px solid rgba(62,200,200,0.2)' }}>
                  {i === 0 ? (lang === 'TR' ? 'Başkan' : 'President') : (lang === 'TR' ? 'Sekreter' : 'Secretary')}
                </span>
              </div>
              {/* Photo */}
              {role.photo ? (
                <div
                  className="photo-circle"
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    border: '2px solid rgba(62,200,200,0.5)',
                    overflow: 'hidden',
                    margin: '0 auto 1rem',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                >
                  <img src={role.photo} alt={role.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </div>
              ) : (
                <div
                  className="photo-circle"
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(62,200,200,0.3), rgba(13,77,124,0.2))',
                    border: '2px dashed rgba(62,200,200,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                    transition: 'border-style 0.3s, border-color 0.3s, box-shadow 0.3s',
                  }}
                >
                  <span style={{ fontSize: '22px', color: 'rgba(13,77,124,0.25)', fontFamily: "'Cormorant Garamond', serif" }}>✦</span>
                </div>
              )}
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: 'var(--uid-dark)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                {role.name || (lang === 'TR' ? 'İsim Soyisim' : 'TBA')}
              </p>
              <p style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--uid-navy)', letterSpacing: '0.3px', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                {lang === 'TR' ? role.tr : role.en}
              </p>
              <p style={{ fontSize: '10px', fontWeight: 300, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.3 }}>
                {lang === 'TR' ? role.en : role.tr}
              </p>
              <div style={{ height: '2px', margin: '0 -1.5rem', background: 'linear-gradient(90deg, transparent, var(--uid-teal), transparent)' }} />
            </div>
          ))}
        </div>

        {/* Remaining roles — smaller grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.875rem' }}>
          {BYK_ROLES.filter(r => !r.highlight).map((role, i) => (
            <div
              key={role.tr}
              ref={el => cardsRef.current[i + 2] = el}
              className="reveal-up byk-card"
              style={{
                background: '#fff',
                border: '1px solid var(--silver)',
                borderRadius: '16px',
                padding: '1.1rem 0.9rem 0',
                textAlign: 'center',
                overflow: 'hidden',
                transitionDelay: `${(i + 2) * 0.04}s`,
              }}
            >
              {role.photo ? (
                <div
                  className="photo-circle"
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    border: '2px solid rgba(62,200,200,0.4)',
                    overflow: 'hidden',
                    margin: '0 auto 0.75rem',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                >
                  <img src={role.photo} alt={role.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </div>
              ) : (
                <div
                  className="photo-circle"
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(62,200,200,0.2), rgba(13,77,124,0.12))',
                    border: '2px dashed rgba(62,200,200,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    transition: 'border-style 0.3s, border-color 0.3s, box-shadow 0.3s',
                  }}
                >
                  <span style={{ fontSize: '16px', color: 'rgba(13,77,124,0.2)', fontFamily: "'Cormorant Garamond', serif" }}>✦</span>
                </div>
              )}

              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14.5px', color: 'var(--uid-dark)', marginBottom: '0.3rem', lineHeight: 1.25 }}>
                {role.name || (lang === 'TR' ? 'İsim Soyisim' : 'TBA')}
              </p>
              <p style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--uid-navy)', letterSpacing: '0.2px', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                {lang === 'TR' ? role.tr : role.en}
              </p>
              <p style={{ fontSize: '9px', fontWeight: 300, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: '0.875rem', lineHeight: 1.3 }}>
                {lang === 'TR' ? role.en : role.tr}
              </p>
              <div style={{ height: '2px', margin: '0 -0.9rem', background: 'linear-gradient(90deg, transparent, var(--uid-teal), transparent)' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
