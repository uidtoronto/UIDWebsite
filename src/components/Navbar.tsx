import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { UIDLogo } from './UIDLogo';
import { useLang } from '../context/LangContext';

const NAV_ITEMS = [
  { key: 'mission', anchor: 'misyon'  },
  { key: 'byk',     anchor: 'byk'     },
  { key: 'works',   route: '/works'   },
  { key: 'join',    anchor: 'uye'     },
  { key: 'contact', anchor: 'iletisim'},
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollTo = (anchor: string) => {
    setMobileOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLabels: Record<string, string> = {
    mission: t.nav.mission,
    byk:     t.nav.byk,
    works:   t.nav.works,
    join:    t.nav.join,
    contact: t.nav.contact,
  };

  const navItemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '1rem 0',
    color: 'var(--uid-navy)',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid rgba(62,200,200,0.1)',
    fontSize: '16px',
    fontWeight: 400,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    textDecoration: 'none',
  };

  return (
    <>
      {/* ── NAV BAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '76px',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(62,200,200,0.12)',
        boxShadow: scrolled ? '0 2px 40px rgba(13,77,124,0.08)' : 'none',
        transition: 'background 0.4s, box-shadow 0.4s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
      }}>
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <UIDLogo width={128} />
        </Link>

        {/* ── DESKTOP CENTER LINKS ── */}
        <div className="hidden md:flex" style={{ gap: '1.75rem', alignItems: 'center' }}>
          {NAV_ITEMS.map(item => {
            if ('route' in item) {
              return (
                <Link key={item.key} to={item.route} className="nav-link" style={{ textDecoration: 'none' }}>
                  {navLabels[item.key]}
                </Link>
              );
            }
            return (
              <button
                key={item.key}
                className="nav-link"
                onClick={() => scrollTo(item.anchor)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}
              >
                {navLabels[item.key]}
              </button>
            );
          })}
        </div>

        {/* ── DESKTOP RIGHT ── */}
        <div className="hidden md:flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setLang(lang === 'EN' ? 'TR' : 'EN')}
            style={{
              padding: '6px 14px', borderRadius: '99px', fontSize: '12.5px',
              border: '1.5px solid rgba(13,77,124,0.22)', background: 'transparent',
              color: 'var(--text-mid)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.25s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,77,124,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {lang === 'TR' ? '🇨🇦 EN' : '🇹🇷 TR'}
          </button>
          <button
            className="shimmer-btn"
            onClick={() => navigate('/signup')}
            style={{
              padding: '8px 20px', borderRadius: '99px', fontSize: '13.5px', fontWeight: 500,
              background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff',
              border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,77,124,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {t.nav.join}
          </button>
        </div>

        {/* ── MOBILE RIGHT: lang + hamburger ── */}
        <div className="flex md:hidden" style={{ gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setLang(lang === 'EN' ? 'TR' : 'EN')}
            style={{
              padding: '5px 11px', borderRadius: '99px', fontSize: '12px',
              border: '1.5px solid rgba(13,77,124,0.22)', background: 'transparent',
              color: 'var(--text-mid)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            {lang === 'TR' ? '🇨🇦 EN' : '🇹🇷 TR'}
          </button>
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '10px',
              background: mobileOpen ? 'rgba(62,200,200,0.1)' : 'transparent',
              border: '1.5px solid',
              borderColor: mobileOpen ? 'rgba(62,200,200,0.4)' : 'rgba(13,77,124,0.18)',
              cursor: 'pointer', color: 'var(--uid-navy)',
              transition: 'background 0.2s, border-color 0.2s',
              flexShrink: 0,
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE BACKDROP ── */}
      {mobileOpen && (
        <div
          className="flex md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, top: '76px', zIndex: 98,
            background: 'rgba(6,30,48,0.45)',
          }}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <div
        className="md:hidden mobile-drawer"
        style={{
          position: 'fixed', top: '76px', left: 0, right: 0, zIndex: 99,
          background: '#fff',
          borderBottom: '1px solid rgba(62,200,200,0.2)',
          boxShadow: '0 12px 40px rgba(13,77,124,0.15)',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          padding: '0.25rem 1.5rem 1.5rem',
        }}
      >
        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_ITEMS.map((item, idx) => {
            const isLast = idx === NAV_ITEMS.length - 1;
            const style = { ...navItemStyle, borderBottom: isLast ? 'none' : '1px solid rgba(62,200,200,0.1)' };
            if ('route' in item) {
              return (
                <Link key={item.key} to={item.route} onClick={() => setMobileOpen(false)} style={style}>
                  {navLabels[item.key]}
                </Link>
              );
            }
            return (
              <button key={item.key} onClick={() => scrollTo(item.anchor)} style={style}>
                {navLabels[item.key]}
              </button>
            );
          })}
        </nav>

        {/* Join CTA */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(62,200,200,0.15)' }}>
          <button
            className="shimmer-btn"
            onClick={() => navigate('/signup')}
            style={{
              width: '100%', padding: '13px', borderRadius: '99px',
              background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff',
              border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              fontSize: '14.5px', fontWeight: 500, letterSpacing: '0.2px',
            }}
          >
            {t.nav.join}
          </button>
        </div>
      </div>
    </>
  );
}
