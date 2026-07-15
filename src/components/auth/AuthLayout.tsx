import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UIDLogo } from '../UIDLogo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

// Shared layout for /login, /signup, /forgot-password, /reset-password.
// Matches the UID Toronto hero gradient + ottoman pattern.
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)',
        padding: '120px 1.25rem 3rem',
      }}
    >
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {/* Orbs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,200,200,0.14), transparent 70%)', animation: 'floatOrb 9s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,77,124,0.07), transparent 70%)', animation: 'floatOrb 11s ease-in-out infinite 2s', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ position: 'relative', zIndex: 2, marginBottom: '2rem', display: 'inline-flex' }}>
        <UIDLogo width={140} />
      </Link>

      {/* Card */}
      <div
        className="fade-up"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(62,200,200,0.18)',
          boxShadow: '0 32px 80px rgba(13,77,124,0.14)',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.5rem' }}>
            UID Toronto
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
            <em>{title}</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
            {subtitle}
          </p>
        </div>

        {children}

        {footer && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(13,77,124,0.08)', textAlign: 'center' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
