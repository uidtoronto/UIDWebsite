import { Instagram, Twitter, Facebook, Youtube, Linkedin } from 'lucide-react';
import { UIDLogo } from './UIDLogo';
import { useLang } from '../context/LangContext';
import { Link } from 'react-router-dom';
import { FooterArchBorder } from './BackgroundDecor';

const SOCIAL = [
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Twitter, label: 'Twitter/X' },
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Youtube, label: 'YouTube' },
  { Icon: Linkedin, label: 'LinkedIn' },
];

export default function Footer() {
  const { t, lang } = useLang();

  const orgLinks = lang === 'TR'
    ? ['Hakkımızda', 'Misyon & Vizyon', 'BYK', 'Küresel Ortaklar']
    : ['About Us', 'Mission & Vision', 'Executive Board', 'Global Partners'];

  const communityLinks = lang === 'TR'
    ? ['Etkinlikler', 'Gençlik Programları', 'Bülten', 'Gönüllülük']
    : ['Events', 'Youth Programs', 'Newsletter', 'Volunteering'];

  const linkStyle: React.CSSProperties = {
    display: 'block', color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
    fontSize: '14px', fontWeight: 300, padding: '4px 0', transition: 'color 0.3s',
    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  };

  const handleHover = (e: React.MouseEvent<HTMLElement>, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.color = enter ? 'var(--uid-teal)' : 'rgba(255,255,255,0.45)';
  };

  return (
    <footer id="iletisim" style={{ background: '#061E30', padding: '4rem 1.25rem 0', position: 'relative', overflow: 'hidden' }}>
      <FooterArchBorder />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--uid-teal), transparent)' }} />

      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', paddingBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Link to="/"><UIDLogo width={140} variant="white" /></Link>
            </div>
            <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.75, marginBottom: '0.4rem' }}>
              {t.footer.desc}
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              {t.footer.descEn}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SOCIAL.map(({ Icon, label }) => (
                <button key={label} className="social-icon" aria-label={label} style={{ cursor: 'pointer' }}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div>
            <h4 style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '1.25rem' }}>
              {t.footer.org}
            </h4>
            {orgLinks.map(item => (
              <a key={item} href="#" style={linkStyle} onMouseEnter={e => handleHover(e, true)} onMouseLeave={e => handleHover(e, false)}>{item}</a>
            ))}
          </div>

          {/* Community */}
          <div>
            <h4 style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '1.25rem' }}>
              {t.footer.community}
            </h4>
            {communityLinks.map(item => (
              <a key={item} href="#" style={linkStyle} onMouseEnter={e => handleHover(e, true)} onMouseLeave={e => handleHover(e, false)}>{item}</a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '1.25rem' }}>
              {t.footer.contact}
            </h4>
            {['Toronto, Ontario', 'info@uid-toronto.ca', '+1 (416) 000-0000', lang === 'TR' ? 'Medya İletişimi' : 'Media Inquiries'].map(item => (
              <p key={item} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontWeight: 300, padding: '4px 0', margin: 0, lineHeight: 1.6 }}>{item}</p>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: 300 }}>
            {t.footer.copyright}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {SOCIAL.map(({ Icon, label }) => (
              <button key={label} className="social-icon" aria-label={label} style={{ cursor: 'pointer', width: '30px', height: '30px' }}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
