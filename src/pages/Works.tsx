import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LangContext';

const WORKS = [
  {
    cat: { TR: 'Etkinlikler', EN: 'Events' },
    title: { TR: 'Cumhurbaşkanlığı Külliye Kabulü', EN: 'Presidential Reception at Külliye' },
    desc: {
      TR: "Cumhurbaşkanı Recep Tayyip Erdoğan'ın Külliye kabul programına katılım. UID Toronto heyeti, Uluslararası Demokratlar Birliği'nin bu özel kabulünde temsil edildi.",
      EN: "Participation in President Erdoğan's reception of the Union of International Democrats at Külliye. The UID Toronto delegation represented the community at this distinguished official reception.",
    },
    date: { TR: '2024', EN: '2024' },
    grad: 'linear-gradient(135deg, #061E30, #0D4D7C)',
  },
  {
    cat: { TR: 'Liderlik', EN: 'Leadership' },
    title: { TR: 'Bölge Başkanı Görev Takdimi', EN: 'Regional President Appointment' },
    desc: {
      TR: 'Furkan Yasir Yalçın, UID Kanada Toronto Bölge Başkanı olarak Genel Başkan Kenan Aslan tarafından resmi görev takdimi ile atandı.',
      EN: 'Furkan Yasir Yalçın was officially appointed as UID Canada Toronto Regional President by UID Chairman Kenan Aslan in a formal ceremony.',
    },
    date: { TR: '2024', EN: '2024' },
    grad: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)',
  },
  {
    cat: { TR: 'Programlar', EN: 'Programs' },
    title: { TR: 'Kapasite Geliştirme Çalıştayı — Genel Merkez', EN: 'Capacity Development Workshop — HQ' },
    desc: {
      TR: "Toronto Bölge Başkanı Furkan Yasir Yalçın, Merve Güler ve Yunus Baran Şahin, Genel Başkan Kenan Aslan ile UID'nin 8. Kapasite Geliştirme ve Eğitim Çalıştayı'nda bir araya geldi.",
      EN: "Furkan Yasir Yalçın, Merve Güler and Yunus Baran Şahin attended UID's 8th Capacity Development & Training Workshop alongside Chairman Kenan Aslan.",
    },
    date: { TR: '2024', EN: '2024' },
    grad: 'linear-gradient(135deg, #1A6A9A, #3EC8C8)',
  },
  {
    cat: { TR: 'Programlar', EN: 'Programs' },
    title: { TR: 'Yurtdışı Türkler Yıl Sonu Çalıştayı', EN: 'Overseas Turks Year-End Workshop' },
    desc: {
      TR: 'Furkan Yasir Yalçın, Merve Güler ve Yunus Baran Şahin, Yurtdışı Türkler ve Akraba Topluluklar Başkanlığı yıl sonu kapasite geliştirme çalıştayına katıldı.',
      EN: 'The Toronto team attended the Overseas Turks Presidency (YTB) year-end capacity development workshop, strengthening ties with diaspora institutions.',
    },
    date: { TR: '2024', EN: '2024' },
    grad: 'linear-gradient(135deg, #0D4D7C, #3EC8C8)',
  },
  {
    cat: { TR: 'Etkinlikler', EN: 'Events' },
    title: { TR: 'Türk & Müslüman Liderler Koordinasyon Toplantısı', EN: 'Turkish & Muslim Leaders Coordination Meeting' },
    desc: {
      TR: "T.C. Enerji ve Tabii Kaynaklar Bakanı Alparslan Bayraktar ağırlandı; T.C. Büyükelçiliği ve Başkonsolosluk temsilcilerinin katıldığı koordinasyon toplantısı düzenlendi.",
      EN: "Hosted Minister of Energy Alparslan Bayraktar at a coordination meeting with Turkish associations and Muslim community leaders, attended by Embassy and Consulate representatives.",
    },
    date: { TR: '2024', EN: '2024' },
    grad: 'linear-gradient(135deg, #061E30, #1A6A9A)',
  },
  {
    cat: { TR: 'Topluluk', EN: 'Community' },
    title: { TR: 'Ramazan İftarlık Dağıtımı', EN: 'Ramadan Iftar Distribution' },
    desc: {
      TR: "Toronto Bölge Başkanı ve yardımcıları, Ramazan ayında Toronto'da yerel halka iftarlık dağıtımı yaparak toplulukta Ramazan farkındalığı oluşturdu.",
      EN: 'UID Toronto Regional President and team distributed iftar bags to Toronto locals during Ramadan, raising community awareness and fostering goodwill.',
    },
    date: { TR: '2024', EN: '2024' },
    grad: 'linear-gradient(135deg, #3EC8C8, #2AACAC)',
  },
  {
    cat: { TR: 'Kültür', EN: 'Culture' },
    title: { TR: 'TS2023 Tanıtım Videosu', EN: 'TS2023 Promotional Video' },
    desc: {
      TR: "UID Toronto ile Türk Federasyonu iş birliğinde TS2023 projesi için tanıtım videosu çekildi. Video 100.000'den fazla görüntülenmeye ulaştı.",
      EN: 'Promotional video produced in collaboration with the Turkish Federation for the TS2023 project, reaching over 100,000 views across platforms.',
    },
    date: { TR: '2023', EN: '2023' },
    grad: 'linear-gradient(135deg, #2AACAC, #0D4D7C)',
  },
];

export default function Works() {
  const { lang, t } = useLang();
  const [active, setActive] = useState(0);
  const [filtering, setFiltering] = useState(false);
  const [displayIdx, setDisplayIdx] = useState(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const CATEGORIES_TR = ['Tümü', 'Etkinlikler', 'Programlar', 'Topluluk', 'Liderlik', 'Kültür'];
  const CATEGORIES_EN = ['All', 'Events', 'Programs', 'Community', 'Leadership', 'Culture'];
  const categories = lang === 'TR' ? CATEGORIES_TR : CATEGORIES_EN;

  const handleFilter = (i: number) => {
    if (i === active) return;
    setFiltering(true);
    setTimeout(() => {
      setActive(i);
      setDisplayIdx(i);
      setFiltering(false);
    }, 250);
  };

  const filtered = displayIdx === 0
    ? WORKS
    : WORKS.filter(w => w.cat[lang] === (lang === 'TR' ? CATEGORIES_TR[displayIdx] : CATEGORIES_EN[displayIdx]));

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.1 }
    );
    cardsRef.current.forEach(c => { if (c) observer.observe(c); });
    return () => observer.disconnect();
  }, [filtered]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '76px' }}>
        {/* Hero */}
        <section className="section-pad" style={{ padding: '5rem 2rem 4rem', background: 'linear-gradient(160deg, #F0F9FF, #EAF5F5, #F7FAFC)', position: 'relative', overflow: 'hidden' }}>
          <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1140px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', fontSize: '13px', color: 'var(--text-soft)' }}>
              <Link to="/" style={{ color: 'var(--uid-teal)', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {t.worksPage.breadHome}
              </Link>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-mid)' }}>{lang === 'TR' ? 'Çalışmalarımız' : 'Our Works'}</span>
            </div>

            <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem' }}>
              {t.worksPage.tag}
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(42px, 6vw, 70px)', fontWeight: 300, color: 'var(--uid-navy)', margin: '0 0 0.75rem', lineHeight: 1.1 }}>
              <em>{t.worksPage.heading}</em>
            </h1>
            <p style={{ color: 'var(--text-mid)', fontSize: '16px', fontWeight: 300, maxWidth: '540px', lineHeight: 1.8 }}>
              {t.worksPage.sub}
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <section style={{ padding: '1.25rem 1.25rem 0', background: '#fff', borderBottom: '1px solid var(--silver)' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '1.25rem' }}>
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => handleFilter(i)}
                style={{
                  padding: '8px 20px', borderRadius: '99px', fontSize: '13.5px', fontWeight: 400,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', border: '1.5px solid',
                  transition: 'all 0.25s',
                  ...(active === i
                    ? { background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-teal-dark))', borderColor: 'transparent', color: '#fff' }
                    : { background: 'transparent', borderColor: 'rgba(62,200,200,0.3)', color: 'var(--text-mid)' }
                  ),
                }}
                onMouseEnter={e => { if (active !== i) { e.currentTarget.style.borderColor = 'var(--uid-teal)'; e.currentTarget.style.color = 'var(--uid-teal)'; } }}
                onMouseLeave={e => { if (active !== i) { e.currentTarget.style.borderColor = 'rgba(62,200,200,0.3)'; e.currentTarget.style.color = 'var(--text-mid)'; } }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section style={{ padding: '2rem 1.25rem 5rem', background: '#fff' }}>
          <div className={`works-grid-container ${filtering ? 'filtering' : ''}`} style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map((work, i) => (
                <div
                  key={`${work.title.EN}-${displayIdx}`}
                  ref={el => cardsRef.current[i] = el}
                  className="reveal-up"
                  style={{ background: '#fff', border: '1px solid var(--silver)', borderRadius: '20px', overflow: 'hidden', transitionDelay: `${i * 0.06}s`, transition: 'transform 0.35s, box-shadow 0.35s, border-color 0.35s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(13,77,124,0.1)'; e.currentTarget.style.borderColor = 'rgba(62,200,200,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--silver)'; }}
                >
                  <div style={{ height: '160px', background: work.grad, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15 }} />
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                        {work.cat[lang]}
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: '56px' }}>✦</div>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: 'var(--uid-navy)', marginBottom: '0.25rem', lineHeight: 1.3 }}>{work.title[lang]}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: '0.75rem' }}>{work.title[lang === 'TR' ? 'EN' : 'TR']}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, marginBottom: '1rem' }}>{work.desc[lang]}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-soft)', fontSize: '12px' }}>
                        <Calendar size={13} /><span>{work.date[lang]}</span>
                      </div>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--uid-teal)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'gap 0.2s' }} onMouseEnter={e => e.currentTarget.style.gap = '8px'} onMouseLeave={e => e.currentTarget.style.gap = '5px'}>
                        {t.worksPage.readMore} <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
